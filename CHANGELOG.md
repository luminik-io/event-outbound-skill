# Changelog

## v0.1.0 (2026-04-18)

First public release. Primary audience: AEs, SDRs, and event marketers working B2B trade shows, conferences, and industry events. Secondary: founders doing their own pre-event outbound.

### Added
- `sequencer.ts` agent. Produces one `OutreachSequence` per persona. Uses Gemini 2.5 Flash via `@ai-sdk/google` with an injectable `TouchGenerator` for testing.
- `ruleService.ts`. Loads cold-email benchmark thresholds and cold-outbound pattern/framework corpora at startup.
- `timeline.ts`. Pure timing logic for 1–8 week lead times on email, LinkedIn, or both.
- Three-attempt validation retry loop. Subject/body length, pronoun ratio, banned-word list, CTA-type preference, specificity, exclamation/emoji bans all enforced at the `validateTouch` layer.
- `icp-analyser.ts` + `persona-analyser.ts` agents for generating ICP and persona inputs from URLs or freeform text.
- `event-scraper.ts` agent for pulling event context from conference sites.
- `examples/money2020-europe-2026/`: full live run against Gemini 2.5 Flash with a two-persona fintech ICP.
- Rule corpora: `data/cold-outbound-frameworks.md`, `data/cold-outbound-patterns.md`, `data/cold-email-benchmarks.json`.

### Known limitations
- Only Gemini 2.5 Flash wired in by default. Swap in another model by passing a custom `TouchGenerator`.
- `event-scraper` does best on conference sites with JSON-LD (Money20/20, SaaStr, Web Summit). Older WordPress event sites need manual `EventContext` construction.
- No CRM integration yet. Output is JSON + markdown; users paste into their outreach tool.

---

© 2026 DataRavel Inc.
