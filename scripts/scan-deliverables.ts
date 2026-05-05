// End-to-end deliverable scanner. Loads the canonical rules JSON, walks every
// shipped artefact (README, examples, marketplace assets, system prompt), and
// asserts zero hard-ban hits. Run before launch or as part of CI.
//
// Usage: npx tsx scripts/scan-deliverables.ts
// Exits 0 if clean, 1 if any hard-ban category fires.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  findForcedEventPhrasing,
  findLlmCliches,
  findPermissionToSendPhrasing,
  type ColdOutboundRules,
} from '../src/lib/ruleService.js';

const REPO = process.cwd();
const RULES_PATH = join(REPO, 'data', 'cold-outbound-rules.json');
const rules = JSON.parse(readFileSync(RULES_PATH, 'utf-8')) as ColdOutboundRules;
const blocklist = rules.llm_cliche_blocklist;

// Walk-and-collect a flat list of file paths under a directory tree, filtered
// by allowed extensions. Skips node_modules, dist, .git.
function walk(dir: string, exts: string[], acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, acc);
    else if (exts.some((e) => p.endsWith(e))) acc.push(p);
  }
  return acc;
}

// Files that document the blocklist itself can legitimately quote banned
// phrases. These are not deliverable-touch outputs.
const ALLOWLIST_BY_FILENAME = new Set([
  'llm-cliche-blocklist.md',
  'cold-outbound-craft.md',
  'cold-outbound-rules.json',
  'cold-email-benchmarks.json',
  'cold-email-benchmarks.md',
  'cold-outbound-canonical-examples.json',
  'cold-email-data-report-stats.md',
  'quality-bar-refinements.md',
  'cold-outbound-frameworks.md',
  'cold-outbound-patterns.md',
  'voice-rules.md',
  'sequencer.ts',
  'ruleService.ts',
  'cold-outbound-evals.eval.ts',
  'scan-deliverables.ts',
  'validate-touch.mjs',
  // SKILL.md documents the rule set Claude must follow, so it cites
  // banned phrases as anti-examples. The validator that gates those phrases
  // out of generated touches lives in scripts/validate-touch.mjs.
  'SKILL.md',
]);

// Top-level dirs to scan for deliverable artefacts.
const SCAN_ROOTS = ['README.md', 'examples', 'marketplace', 'skills', '.claude-plugin'];

const targets: string[] = [];
for (const root of SCAN_ROOTS) {
  const p = join(REPO, root);
  try {
    const s = statSync(p);
    if (s.isFile()) targets.push(p);
    else if (s.isDirectory()) walk(p, ['.md', '.json', '.svg'], targets);
  } catch {
    /* skip missing root */
  }
}

let totalHits = 0;
const hitsByFile: Record<string, Record<string, string[]>> = {};

// Strip ranges between <!-- scan:disable --> and <!-- scan:enable --> from
// scanned text. Lets a README document banned phrases without false-positive
// firings on its own quoted examples.
function stripScanDisabled(text: string): string {
  return text.replace(/<!--\s*scan:disable\s*-->[\s\S]*?<!--\s*scan:enable\s*-->/g, '');
}

function findAdditionalBannedHits(text: string): string[] {
  const hay = text.toLowerCase();
  return (rules.additional_banned_phrases || []).filter((p) =>
    p ? hay.includes(p.toLowerCase()) : false,
  );
}

function eventNameForPath(file: string): string {
  const rel = relative(REPO, file).toLowerCase();
  if (rel.includes('black-hat')) return 'Black Hat USA 2026';
  if (rel.includes('rsa')) return 'RSA Conference 2026';
  if (rel.includes('money2020') || rel.includes('money20')) return 'Money20/20 Europe 2026';
  return '';
}

for (const f of targets) {
  const filename = f.split('/').pop() ?? f;
  if (ALLOWLIST_BY_FILENAME.has(filename)) continue;
  const text = stripScanDisabled(readFileSync(f, 'utf-8'));
  const result = findLlmCliches(text, blocklist);
  const additionalBannedHits = findAdditionalBannedHits(text);
  const permissionHits = findPermissionToSendPhrasing(text);
  const forcedEventHits = findForcedEventPhrasing(text, eventNameForPath(f));
  const byCategory = Object.fromEntries(
    Object.entries(result.hardBans).map(([k, v]) => [k, v ?? []]),
  ) as Record<string, string[]>;
  if (additionalBannedHits.length > 0) {
    byCategory.additional_banned_phrases = additionalBannedHits;
  }
  if (permissionHits.length > 0) {
    byCategory.permission_to_send_cta = permissionHits;
  }
  if (forcedEventHits.length > 0) {
    byCategory.forced_event_phrasing = forcedEventHits;
  }
  if (Object.keys(byCategory).length > 0) {
    hitsByFile[relative(REPO, f)] = byCategory;
    totalHits += Object.values(byCategory).reduce((acc, arr) => acc + arr.length, 0);
  }
}

if (totalHits === 0) {
  console.log(`scan-deliverables: 0 hard-ban hits across ${targets.length} deliverable files`);
  process.exit(0);
}

console.error(`scan-deliverables: ${totalHits} hard-ban hits across ${Object.keys(hitsByFile).length} files`);
for (const [file, byCat] of Object.entries(hitsByFile)) {
  console.error(`  ${file}`);
  for (const [cat, phrases] of Object.entries(byCat)) {
    console.error(`    [${cat}] ${phrases.join(', ')}`);
  }
}
process.exit(1);
