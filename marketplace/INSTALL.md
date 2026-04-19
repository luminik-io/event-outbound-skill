# Installation

## From the Luminik marketplace (recommended)

Inside any Claude Code session, add the marketplace and install the plugin:

```
/plugin marketplace add luminik-io/claude-plugins
/plugin install event-outbound@luminik-plugins
```

Claude Code pulls the plugin, registers the skill, and makes it available in any session. Confirm from a new shell:

```bash
claude plugin list | grep event-outbound
```

## From a local checkout (developers)

```bash
git clone https://github.com/luminik-io/event-outbound-skill.git
cd event-outbound-skill
npm install
npm run build
```

Load the local plugin directly:

```bash
claude --plugin-dir $(pwd)
```

Inside the session, `/plugin list` will show `event-outbound` loaded from your local path.

To run the bundled live example end-to-end (requires a Gemini API key):

```bash
export GEMINI_API_KEY=...
node scripts/generate-live-demo.mjs
```

This regenerates `examples/money2020-europe-2026/final_sequence.md` from scratch against the real LLM. A successful run takes 2 to 4 minutes and finishes with `0 flagged rules_violated`.

## Requirements

- Claude Code CLI 2.1 or later
- Node.js 20+ (for local development only; the published skill runs inside Claude Code)
- A Gemini API key (free tier is sufficient for small runs; paid tier recommended for agencies running dozens of events per quarter). Set as `GEMINI_API_KEY`.

## Verifying the install

In any Claude Code session:

```
/plugin list
```

You should see `event-outbound` in the list.

Try it:

```
Create an outbound sequence for SaaStr Annual 2026 targeting VP Marketing at 50 to 200 person SaaS companies. 4 week lead time. Email and LinkedIn.
```

If the skill responds by asking for the sending identity (name, title, company) and then produces a multi-touch sequence, install was successful.

## Uninstall

```
/plugin uninstall event-outbound@luminik-plugins
```
