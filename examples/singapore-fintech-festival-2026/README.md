# Singapore Fintech Festival 2026

**Event:** Singapore Fintech Festival 2026 · 11-13 November 2026 · Singapore Expo
**Industry:** Fintech (identity verification, KYC, fraud)
**Company size:** 200-2000 employees, Series B through late growth
**Personas:** VP Risk and Compliance · Head of KYC Operations
**Lead time:** 4 weeks · **Channels:** email + LinkedIn

This directory ships the input fixtures (`event-context.json`, `company-icp.json`, `sequence-params.json`). To generate the rendered sequence locally:

```
GEMINI_API_KEY=... npx tsx scripts/run-example.ts examples/singapore-fintech-festival-2026
```

The first run calls the LLM and writes `sequencer-output.json` + `final_sequence.md`. Re-running without `--rerun` re-renders the markdown from the cached JSON in seconds.
