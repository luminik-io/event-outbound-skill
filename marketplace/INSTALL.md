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

To regenerate any of the bundled examples end-to-end, just ask Claude in the same session:

```
Regenerate examples/money2020-usa-2026-fraud using the event-outbound skill.
```

Claude reads the persona, drafts each touch, validates it via `node scripts/validate-touch.mjs`, and revises on failure. A typical 2-persona / 12-touch sequence finishes in 1-2 minutes with 0 `rules_violated` touches if the inputs are good.

## Requirements

- Claude Code CLI 2.1 or later
- Node.js 20+ (only used by the skill's validator CLI; no global tooling required)
- No API keys. The skill runs entirely inside the Claude Code session you're already in.

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
