# Pre-launch install verification

Run this once before flipping the repo public and submitting to the Anthropic plugin directory. It is the tomorrow-morning sanity check that answers the question "will a stranger who runs `/plugin install` actually get a working skill?"

## What to run

From the repo root:

```bash
bash scripts/verify-install.sh
```

The script runs nine checks. Eight are automated pass/fail; one is a live session load that requires a Claude Code CLI.

| # | Check | Fail condition |
|---|---|---|
| 1 | `claude` CLI on PATH | CLI not installed |
| 2 | `plugin.json` validates | Schema mismatch reported by `claude plugin validate` |
| 3 | `marketplace.json` validates in sibling `claude-plugins` repo | Missing or schema mismatch |
| 4 | `skills/event-outbound/SKILL.md` exists | File missing |
| 5 | Apollo merge fields resolve | Any `{{field}}` in examples not in the documented glossary |
| 6 | No banned phrases in example touches | "want me to send", "no pitch", "peer channel", "yours to keep" in any generated touch |
| 7 | No em-dashes in prose docs | Em-dash character found in README / SKILL.md / INSTALL.md / CHANGELOG.md |
| 8 | Cover image is 1200x630 PNG | Missing or wrong dimensions |
| 9 | `claude --plugin-dir` loads the skill | Plugin not found in `/plugin list` output |

## When all checks pass

The skill is installation-ready. Next steps:

1. **Flip repo public.** The `event-outbound-skill` repo is currently private. Make it public on GitHub.
2. **Confirm the marketplace pointer works from a clean machine.** From a fresh Claude Code session on any machine:
   ```
   /plugin marketplace add luminik-io/claude-plugins
   /plugin install event-outbound@luminik-plugins
   /plugin list
   ```
   You should see `event-outbound@luminik-plugins` listed.
3. **Invoke the skill end-to-end.**
   ```
   Create an outbound sequence for SaaStr Annual 2026 targeting VP Marketing at 50 to 200 person SaaS companies. 4 week lead time. Email and LinkedIn. Sending identity: Jane Doe, VP Growth, AcmeCo.
   ```
   Expected behavior: the skill generates 6 to 8 touches per persona, each passing the validator. No touch should contain "want me to send" or "no pitch".
4. **Open the Path B submission form** at [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit) and paste fields from `PATH_B_SUBMISSION.md`.
5. **Upload** `marketplace/cover-1200x630.png` as the plugin cover image.

## When a check fails

Each failing check prints the exact file and line to look at. Fix and rerun. The script is idempotent.

## Skipping the live test

If you do not want to spin up a real Claude Code session while iterating on docs:

```bash
bash scripts/verify-install.sh --skip-live
```

Checks 1 through 8 still run and must still pass.
