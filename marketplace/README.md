# Marketplace Submission Kit

Internal materials for submitting this plugin to:

- Path A: https://github.com/luminik-io/claude-plugins (our own marketplace, already live)
- Path B: https://claude.ai/settings/plugins/submit or https://platform.claude.com/plugins/submit (Anthropic's plugin directory)

Everything here is supporting material. The distributable plugin lives at the repo root (`.claude-plugin/plugin.json` + `skills/event-outbound/`).

## What is in this folder

- `PATH_B_SUBMISSION.md`: every form field pre-filled for the Anthropic directory submission. Open this and paste.
- `VERIFY-INSTALL.md`: the pre-launch checklist that pairs with `scripts/verify-install.sh`. Run this before flipping the repo public.
- `INSTALL.md`: end-user-facing install docs. Mirrored at the repo root README.
- `SKILL.md`: mirrored skill manifest. Canonical copy lives at `skills/event-outbound/SKILL.md`.
- `CHANGELOG.md`: user-facing changelog mirror.
- `LICENSE`: MIT copy.
- `cover-1200x630.png`: Path B cover image, 1200x630, dark theme.
- `assets/cover-1200x630.svg`: source SVG for the cover image; re-rasterize with `rsvg-convert -w 1200 -h 630 assets/cover-1200x630.svg -o cover-1200x630.png`.
- `screenshots/README.md`: planned screenshots for the listing page. Real captures are a pre-submit task.
- `.claude-plugin/plugin.json`: legacy mirror; not used by the distribution path. `.claude-plugin/plugin.json` at the repo root is authoritative.
