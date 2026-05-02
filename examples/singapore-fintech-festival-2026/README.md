# Singapore Fintech Festival 2026

**Event:** Singapore Fintech Festival 2026 · 11-13 November 2026 · Singapore Expo
**Industry:** Fintech (identity verification, KYC, fraud)
**Company size:** 200-2000 employees
**Personas:** VP Risk and Compliance · Head of KYC Operations
**Lead time:** 4 weeks · **Channels:** email + LinkedIn

This directory ships the input fixtures (`event-context.json`, `company-icp.json`, `sequence-params.json`) only. To generate the rendered sequence, ask Claude inside Claude Code:

```
Generate the event-outbound sequence for examples/singapore-fintech-festival-2026 using the inputs in this directory. Validate every touch via scripts/validate-touch.mjs. Write final_sequence.md when all touches pass.
```

Claude reads the rules from `data/`, drafts each touch following the 4T framework, validates via the bundled CLI, and revises on failure. No external API key required.
