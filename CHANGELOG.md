# Changelog

## v0.2.0 (2026-05-02)

Public launch release. The skill now runs natively inside Claude Code with no external API keys required.

### Changed
- **Generator is now Claude itself.** `skills/event-outbound/SKILL.md` is rewritten to drive the full workflow inside a Claude Code session: read inputs, draft each touch following the embedded 4T framework + channel rules, validate via the bundled CLI, revise on failure (up to 3 attempts), score and band, write `final_sequence.md` + `sequencer-output.json`. No `GEMINI_API_KEY`, no model dependency.
- `scripts/validate-touch.mjs` added. Pure-Node validator CLI. Reads a touch JSON from stdin or a file, returns `{isValid, errors, checks}` against the canonical rule set in `data/cold-outbound-rules.json`. Used by SKILL.md between drafts.
- `src/agents/sequencer.ts` retained for headless / batch use only (CI, scheduled cron). Anyone running outside Claude Code can inject their own `TouchGenerator`.

### Added
- Validator hardening:
  - `lazy_generalization_openers`: bans `Most teams`, `Most VPs`, `Almost nobody`, `In our experience`, and the `two/three/four/five Series A/B/C` funding-stage aggregation pattern.
  - `cold_email_overused`: bans floor / vendor-shopper framing, `Walking the floor`, `vendors all pitching`, `fraud-platform vendors`, `five vendors who…`, `short list for our team`. Cold copy stays grounded in the persona's priorities and risks, not booth politics.
  - `additional_banned_phrases`: bans the soulless-non-flex selling tics, `no deck`, `no demo`, `no calendar invite`, `reply yes and i'll send`, `no commitment`, `low-pressure`. If you wouldn't say it on a coffee invite, don't write it.
- 18 new unit tests in `tests/cliche-validator.test.ts` covering the new categories. 30 cliché tests pass; 49 total tests + evals pass.
- Two worked example folders: `examples/rsa-conference-2026/` (cybersecurity) and `examples/money2020-usa-2026-fraud/` (fintech). Both regenerated via Claude inside Claude Code to validate the no-API-key path end-to-end.

### Removed
- `GEMINI_API_KEY` requirement from README, marketplace/INSTALL.md, and the user-facing flow. The skill no longer requires any external LLM credentials to run inside Claude Code.

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
