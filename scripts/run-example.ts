// Tiny driver: load three JSON inputs from an examples/<event>/ directory,
// run generateSequence(), write final_sequence.md.
//
// Usage (from repo root):
//   npx tsx scripts/run-example.ts examples/black-hat-usa-2026
//
// If sequencer-output.json already exists in the example dir, the generator
// step is skipped and only the markdown rendering re-runs. Pass
// `--rerun` to force regeneration. Pass `--explain` to expand per-touch
// validation details (banned phrases caught, cliche categories tripped, full
// `checks` object) inline below each touch.

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  EventContext,
  CompanyICP,
  SequenceParams,
  SequencerOutput,
  OutreachSequence,
  OutreachTouch,
} from '../src/types/index.js';

async function readJson<T>(dir: string, file: string): Promise<T> {
  const raw = await readFile(join(dir, file), 'utf-8');
  return JSON.parse(raw) as T;
}

function offsetLabel(days: number): string {
  if (days === 0) return 'T0';
  if (days < 0) return `T${days}d`;
  return `T+${days}d`;
}

// Quality score is derived presentation, not a Touch field. 0-5 scale.
// Hard validators all pass = 2.5 floor. Bonuses for the soft signals that
// distinguish a top-tier touch from a merely-compliant one.
function qualityScore(touch: OutreachTouch): number {
  if (touch.quality_flag === 'rules_violated') return 1.5;
  let s = 2.5;
  const c = touch.checks;
  if (c.bannedWordsFound.length === 0) s += 0.5;
  if (c.youVsWeRatio >= 1) s += 0.5;
  if (c.hasIlluminationQuestion) s += 0.5;
  if (c.specificityHits > 0) s += 0.25;
  if (touch.cta_type === 'make_offer' || touch.cta_type === 'ask_for_interest') s += 0.5;
  if (!c.hasEmDash && !c.hasExclamation && !c.hasEmoji) s += 0.25;
  return Math.min(5, Math.round(s * 10) / 10);
}

function scoreBand(score: number): string {
  if (score >= 4.5) return 'top-tier';
  if (score >= 3.5) return 'ship';
  if (score >= 2.5) return 'review';
  return 'rewrite';
}

function renderTouchMarkdown(touch: OutreachTouch, n: number, explain: boolean): string {
  const subjectLine =
    touch.channel === 'email'
      ? `_Subject:_ \`${touch.subject || '(none)'}\``
      : '_Subject:_ (none)';
  const score = qualityScore(touch);
  const meta = [
    `\`channel: ${touch.channel}\``,
    `\`offset: ${offsetLabel(touch.send_at_offset_days)}\``,
    `\`type: ${touch.touch_type}\``,
    `\`cta: ${touch.cta_type}\``,
    `\`words: ${touch.word_count}\``,
    `\`quality: ${score.toFixed(1)}/5 (${scoreBand(score)})\``,
  ];
  if (touch.quality_flag === 'rules_violated') {
    meta.push('`validation: rules_violated`');
  }
  const out = [
    `### Touch ${n}: ${offsetLabel(touch.send_at_offset_days)} · ${touch.touch_type}`,
    '',
    subjectLine,
    '',
    `> ${touch.body.replace(/\n/g, '\n> ')}`,
    '',
    meta.join(' · '),
  ];

  if (explain) {
    const c = touch.checks;
    const checkLines = [
      `- subject words: ${c.subjectWordCount} · all-lowercase: ${c.allLowercase}`,
      `- body words: ${c.bodyWordCount} · sentences: ${c.bodySentenceCount} · chars: ${c.bodyCharCount}`,
      `- you/we ratio: ${c.youVsWeRatio.toFixed(2)} · illumination Q: ${c.hasIlluminationQuestion} · leading Q: ${c.hasLeadingQuestion}`,
      `- em-dash: ${c.hasEmDash} · exclamation: ${c.hasExclamation} · emoji: ${c.hasEmoji} · specificity hits: ${c.specificityHits}`,
      `- banned phrases: ${c.bannedWordsFound.length === 0 ? '(none)' : c.bannedWordsFound.join(', ')}`,
    ];
    if (touch.validation_errors && touch.validation_errors.length > 0) {
      checkLines.push(
        `- validation errors: ${touch.validation_errors.map((e) => e.rule).join(', ')}`,
      );
    }
    out.push('');
    out.push('<details><summary>checks</summary>');
    out.push('');
    out.push(...checkLines);
    out.push('');
    out.push('</details>');
  }

  return out.join('\n');
}

type SequenceStats = {
  total: number;
  flagged: number;
  avgScore: number;
  topTier: number;
  bandCounts: { [band: string]: number };
  ctaMix: { [cta: string]: number };
  illuminationCoverage: number;
};

function computeStats(out: SequencerOutput): SequenceStats {
  const stats: SequenceStats = {
    total: 0,
    flagged: 0,
    avgScore: 0,
    topTier: 0,
    bandCounts: {},
    ctaMix: {},
    illuminationCoverage: 0,
  };
  let scoreSum = 0;
  let illumHits = 0;
  for (const personaId of Object.keys(out.sequencesByPersona)) {
    for (const t of out.sequencesByPersona[personaId].touches) {
      stats.total += 1;
      if (t.quality_flag === 'rules_violated') stats.flagged += 1;
      const s = qualityScore(t);
      scoreSum += s;
      if (s >= 4.5) stats.topTier += 1;
      const band = scoreBand(s);
      stats.bandCounts[band] = (stats.bandCounts[band] || 0) + 1;
      stats.ctaMix[t.cta_type] = (stats.ctaMix[t.cta_type] || 0) + 1;
      if (t.checks.hasIlluminationQuestion) illumHits += 1;
    }
  }
  stats.avgScore = stats.total > 0 ? scoreSum / stats.total : 0;
  stats.illuminationCoverage = stats.total > 0 ? illumHits / stats.total : 0;
  return stats;
}

function renderStatsMarkdown(stats: SequenceStats): string {
  const bandSummary = Object.entries(stats.bandCounts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
  const ctaSummary = Object.entries(stats.ctaMix)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
  const lines = [
    '## Sequence quality summary',
    '',
    `- **Touches:** ${stats.total} total · ${stats.flagged} flagged \`rules_violated\` · ${stats.topTier} scored \`top-tier\` (>=4.5/5)`,
    `- **Average quality:** ${stats.avgScore.toFixed(2)}/5`,
    `- **Score bands:** ${bandSummary}`,
    `- **CTA mix:** ${ctaSummary}`,
    `- **Illumination-question coverage:** ${(stats.illuminationCoverage * 100).toFixed(0)}% of touches`,
    '',
    '> Quality score is a presentation-layer derivation from `OutreachTouch.checks`. 2.5 floor when all hard validators pass; bonuses for "you" majority pronoun ratio, illumination question, specificity hits, lean-back CTA type, and absence of formatting tells. Run with `--explain` to expand each touch\'s `checks` block.',
    '',
  ];
  return lines.join('\n');
}

function renderSequenceMarkdown(
  eventContext: EventContext,
  companyIcp: CompanyICP,
  params: SequenceParams,
  sequencesByPersona: { [personaId: string]: OutreachSequence },
  stats: SequenceStats,
  explain: boolean,
): string {
  const lines: string[] = [];
  lines.push(`# Outbound Sequence: ${eventContext.name}`);
  lines.push('');
  lines.push(
    `**Event:** ${eventContext.name} · ${eventContext.dates} · ${eventContext.location}`,
  );
  lines.push(`**Industry:** ${companyIcp.industry}`);
  lines.push(`**Company size:** ${companyIcp.sizeRange}`);
  lines.push(
    `**Lead time:** ${params.leadTimeWeeks} weeks · **Channels:** ${params.channels.join(' + ')}`,
  );
  lines.push(
    `**Sender:** ${params.sendingIdentity.name}, ${params.sendingIdentity.title} at ${params.sendingIdentity.company}`,
  );
  lines.push('');
  lines.push(renderStatsMarkdown(stats));
  lines.push(
    '> Generated by `event-outbound-skill` — every touch validated against `data/cold-email-benchmarks.json` and `data/cold-outbound-rules.json` (subject ≤4 words lowercase, channel-specific body length, banned-phrase blocklist, LLM-cliche blocklist across 8 categories, "you" > "we" pronoun majority, CTA ranking `make_offer` > `ask_for_interest`, no exclamation marks, no em-dashes). Touches that fail all 3 generation attempts ship with `quality_flag: rules_violated` so a human can reroute them rather than ship bad copy.',
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  for (const persona of companyIcp.personas) {
    const seq = sequencesByPersona[persona.personaId];
    if (!seq) continue;
    lines.push(`## Persona: ${persona.role}`);
    lines.push('');
    lines.push(`**Priorities** · ${persona.priorities.join(' · ')}`);
    lines.push('');
    lines.push(`**Pain points** · ${persona.painPoints.join(' · ')}`);
    lines.push('');
    seq.touches.forEach((t, i) => {
      lines.push(renderTouchMarkdown(t, i + 1, explain));
      lines.push('');
      lines.push('---');
      lines.push('');
    });
  }
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const exampleDir = args.find((a) => !a.startsWith('--'));
  const forceRerun = args.includes('--rerun');
  const explain = args.includes('--explain');
  if (!exampleDir) {
    console.error('Usage: tsx scripts/run-example.ts <example-dir> [--rerun] [--explain]');
    process.exit(1);
  }

  const eventContext = await readJson<EventContext>(exampleDir, 'event-context.json');
  const companyIcp = await readJson<CompanyICP>(exampleDir, 'company-icp.json');
  const sequenceParams = await readJson<SequenceParams>(exampleDir, 'sequence-params.json');

  const jsonPath = join(exampleDir, 'sequencer-output.json');

  let out: SequencerOutput;
  if (!forceRerun && existsSync(jsonPath)) {
    console.error(`Reusing cached ${jsonPath} (pass --rerun to regenerate).`);
    out = await readJson<SequencerOutput>(exampleDir, 'sequencer-output.json');
  } else {
    console.error(
      `No cached ${jsonPath} found. Claude Code runs this skill with the active Claude session and the local validator. For headless runs, call generateSequence() from your own script and inject a TouchGenerator.`,
    );
    process.exit(1);
  }

  const stats = computeStats(out);
  const ctaSummary = Object.entries(stats.ctaMix)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
  console.error(
    `Touches: ${stats.total} total, ${stats.flagged} flagged rules_violated, ` +
      `avg quality ${stats.avgScore.toFixed(2)}/5 (${stats.topTier} top-tier). ` +
      `CTA mix: ${ctaSummary}.`,
  );

  const md = renderSequenceMarkdown(
    eventContext,
    companyIcp,
    sequenceParams,
    out.sequencesByPersona,
    stats,
    explain,
  );
  const mdPath = join(exampleDir, 'final_sequence.md');
  await writeFile(mdPath, md, 'utf-8');
  console.error(`Wrote ${mdPath}`);
}

main().catch((e) => {
  console.error('Sequencer driver failed:', e);
  process.exit(1);
});
