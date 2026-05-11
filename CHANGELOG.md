# Changelog

## v0.2.5 (2026-05-10)

Buyer-first quality-bar hardening for thin event-outbound inputs.

### Changed
- Skill intake now requires an Outbound Research Brief before drafting: buyer job, current workaround, hidden risk, customer-language pain, trigger, proof points, available assets, and likely objection.
- Skill frontmatter now allows web fetch/search so Claude can research the sender company and event page before asking the user to restate facts that are public.
- `CompanyICP` and `AttendeePersona` types now support optional `website`, `productSummary`, `buyerJob`, `currentWorkaround`, `hiddenRisk`, `objections`, `proofPoints`, and `availableAssets`.
- Sequencer prompt now treats proof and assets as sacred: no invented matrices, briefs, peer teams, named customers, before/after numbers, agenda sessions, day-of slots, or locations.
- CTA guidance now separates buyer priorities from event logistics: "before [city]" and "[city] prep" closers are rejected unless the ask is literal meetup logistics.
- Cadence planner output now includes deterministic `send_date` values so installed-skill runs do not hand-calculate calendar dates.

### Added
- Strict validator mode via `strictTruth: true`.
- `missingMergeFields` check for Apollo-ready `{{first_name}}` and `{{company}}`.
- `unsourcedAssetPromise` check when copy mentions attached/linked assets without `availableAssets`.
- `unsourcedProofClaim` check when copy uses customer, peer, or before/after proof without `proofPoints`.
- Generic post-event pleasantries such as "hope the week in [city] went well" are now blocked as sales-speak openers.
- Source-grounded craft evals covering role fluency, current workaround language, cost of inaction, neutral illumination questions, lean-back CTAs, and wrong-persona failures.
- 100+ tests covering strict context helpers, date-aware cadence, CTA location misuse, and CLI rejection/acceptance paths.

## v0.2.4 (2026-05-05)

Cowork support hardening before official plugin-directory submission.

### Changed
- Validator execution now uses `${CLAUDE_PLUGIN_ROOT}/scripts/validate-touch.mjs`, matching Anthropic's plugin-path guidance and avoiding current-working-directory assumptions across Claude Code and Claude Cowork.
- Skill frontmatter now explicitly allows `Read`, `Write`, and the local Node validator so Claude can load fixtures/playbook context and save the generated sequence files in installed plugin sessions.
- README and plugin metadata now describe Claude Code + Claude Cowork support consistently.

## v0.2.0 (2026-05-02)

Public launch release. The skill now runs natively inside Claude Code with no external API keys required.

### Changed
- **Generator is now Claude itself.** `skills/event-outbound/SKILL.md` is rewritten to drive the full workflow inside a Claude Code session: read inputs, draft each touch following the embedded 4T framework + channel rules, validate via the bundled CLI, revise on failure (up to 3 attempts), score and band, write `final_sequence.md` + `sequencer-output.json`. No external model credentials are required for the installed skill.
- `scripts/validate-touch.mjs` added. Pure-Node validator CLI. Reads a touch JSON from stdin or a file, returns `{isValid, errors, checks}` against the canonical rule set in `data/cold-outbound-rules.json`. Used by SKILL.md between drafts.
- `src/agents/sequencer.ts` retained for headless / batch use only (CI, scheduled cron). Anyone running outside Claude Code can inject their own `TouchGenerator`.

### Added
- Validator hardening:
  - `lazy_generalization_openers`: bans `Most teams`, `Most VPs`, `Almost nobody`, `In our experience`, and the `two/three/four/five Series A/B/C` funding-stage aggregation pattern.
  - `cold_email_overused`: bans floor / vendor-shopper framing, `Walking the floor`, `vendors all pitching`, `fraud-platform vendors`, `five vendors who…`, `short list for our team`. Cold copy stays grounded in the persona's priorities and risks, not booth politics.
  - `preview_line_rules`: protects the first 18 inbox-preview words on cold first touches and post-connect DMs. Seller-first openers (`I/we/us/our`) and event-first openers are rejected before Claude ships the touch.
  - `additional_banned_phrases`: bans the soulless-non-flex selling tics, `no deck`, `no demo`, `no calendar invite`, `reply yes and i'll send`, `no commitment`, `low-pressure`. If you wouldn't say it on a coffee invite, don't write it.
- 23 new unit tests in `tests/cliche-validator.test.ts` and `tests/basic.test.ts` covering the new categories, preview-line checks, and CLI subject-number parity. 73 total tests + evals pass.
- Two worked example folders: `examples/black-hat-usa-2026/` (cybersecurity) and `examples/money2020-europe-2026/` (fintech). Both regenerated via Claude inside Claude Code to validate the no-API-key path end-to-end.

### Removed
- The user-facing flow no longer requires any external LLM credentials to run inside Claude Code.

## v0.1.0 (2026-04-18)

First public release. Primary audience: AEs, SDRs, and event marketers working B2B trade shows, conferences, and industry events. Secondary: founders doing their own pre-event outbound.

### Added
- `sequencer.ts` agent. Produces one `OutreachSequence` per persona, with an injectable `TouchGenerator` for testing.
- `ruleService.ts`. Loads cold-email benchmark thresholds and cold-outbound pattern/framework corpora at startup.
- `timeline.ts`. Pure timing logic for 1–8 week lead times on email, LinkedIn, or both.
- Three-attempt validation retry loop. Subject/body length, pronoun ratio, banned-word list, CTA-type preference, specificity, exclamation/emoji bans all enforced at the `validateTouch` layer.
- `icp-analyser.ts` + `persona-analyser.ts` agents for generating ICP and persona inputs from URLs or freeform text.
- `event-scraper.ts` agent for pulling event context from conference sites.
- Rule corpora: `data/cold-outbound-frameworks.md`, `data/cold-outbound-patterns.md`, `data/cold-email-benchmarks.json`.

### Known limitations
- `event-scraper` does best on conference sites with JSON-LD (Money20/20, SaaStr, Web Summit). Older WordPress event sites need manual `EventContext` construction.
- No CRM integration yet. Output is JSON + markdown; users paste into their outreach tool.

---

© 2026 DataRavel Inc.
