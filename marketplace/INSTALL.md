# Installation

## From the Claude marketplace (recommended)

Once the skill is listed on `claude.com/marketplace` (expected post-v0.1.0 review):

```bash
claude plugin install event-outbound
```

Claude Code will pull the plugin, register the skill, and make it available in any session. Confirm it is registered:

```bash
claude plugin list | grep event-outbound
```

## From a local checkout (developers, or for running the live examples)

```bash
git clone https://github.com/prasad-pilla/event-outbound-skill.git
cd event-outbound-skill
npm install
npm run build
```

Register the local skill with Claude Code:

```bash
claude plugin install --path $(pwd)/dist/marketplace
```

To run the bundled live example end-to-end (requires a Gemini API key):

```bash
export GEMINI_API_KEY=...
node scripts/generate-live-demo.mjs
```

This regenerates `examples/money2020-europe-2026/final_sequence.md` from scratch against the real LLM. A successful run should take 2–4 minutes and finish with `0 flagged rules_violated`.

## Requirements

- Claude Code CLI 2026.03 or later
- Node.js 20+ (for local development only; the published skill runs inside Claude Code)
- A Gemini API key (free tier is sufficient for small runs; paid tier recommended for agencies running dozens of events per quarter). Set as `GEMINI_API_KEY`.

## Verifying the install

In any Claude Code session:

```
/skills list
```

You should see `event-outbound` in the list.

Try it:

```
Create an outbound sequence for SaaStr Annual 2026 targeting VP Marketing at 50–200-person SaaS companies. 4 week lead time. Email and LinkedIn.
```

If the skill responds by asking for the sending identity (name, title, company) and then produces a multi-touch sequence, install was successful.

## Uninstall

```bash
claude plugin uninstall event-outbound
```
