# Path B submission: event-outbound

This file contains every field to paste into Anthropic's plugin directory submission form. Keep it updated; it is the canonical source of truth for the listing.

## Submission URL

Per the Claude Code plugin docs (https://code.claude.com/docs/en/plugins), plugins are submitted through one of two in-app forms:

- **Claude.ai**: https://claude.ai/settings/plugins/submit
- **Console**: https://platform.claude.com/plugins/submit

Use whichever account owns the plugin. For Luminik, sign in with `prasad@luminik.io`.

## Fields to paste

### Plugin name

```
event-outbound
```

### Short description (<= 100 chars, 96 here)

```
Multi-channel outbound sequences for B2B events. Josh-Braun-grounded, Apollo-ready, validated.
```

### Long description (280 words)

```
event-outbound turns a B2B trade show, conference, or industry event into a
full pre-event-to-post-event outbound sequence per ICP persona. You provide
the event (name, dates, agenda, speakers), your ICP (industry, size, one or
more buyer personas with real priorities and pain points), and sequence
params (lead time in weeks, email or LinkedIn or both, sending identity).
The skill returns six to eight touches per persona, timed across the lead
window, written in Apollo-ready merge-field syntax that drops into Apollo.io,
Outreach, Salesloft, Instantly, or Smartlead.

The generator is commodity. The validator is the product. Every touch is
checked before it lands: subject lowercase and <= 4 words, body 50 to 100
words across 3 to 4 sentences, you/your outnumbering we/our, no em-dashes,
no exclamation marks, no emoji, no banned gating phrases ("want me to send",
"not a pitch", "peer channel"), CTA ranked make_offer > ask_for_interest.
Failed touches are regenerated up to three times with temperature jitter.
Anything still failing is flagged rules_violated for human review.

Grounded in 20k+ personalised touches across 50+ B2B events that sourced
$6M+ in pipeline across fintech (identity verification), cybersecurity, and
B2B SaaS. The validator rules are distilled from Josh Braun's public
permission-based outbound writing and Gong's 85M-email "Ultimate Cold Email
Data Report" co-authored with 30 Minutes to President's Club and Outbound
Squad.

Primary audience: AEs, SDRs, and event marketers running pre-event meeting
motions, dinner and side-event invites, booth-visit campaigns, and post-event
follow-ups. Secondary: founders doing their own outbound.

Two full example runs ship in the repo: Money20/20 Europe 2026 (fintech ICP,
two personas) and SaaStr Annual 2026 (SaaS ICP, two personas). Both are
hand-verified 24/24 on Josh Braun's permission-based criteria.
```

### Category

```
marketing
```

(Alternative if the form offers a finer taxonomy: `sales`, `outbound`, `gtm`, or `sales-enablement`. Pick the closest option.)

### Repository URL

```
https://github.com/luminik-io/event-outbound-skill
```

**Action needed before submit**: the repo is currently private. Flip it public in GitHub settings before submitting; the directory reviewer will need read access.

### Marketplace URL

```
https://github.com/luminik-io/claude-plugins
```

This is the parent marketplace that lists `event-outbound`. Users install via:

```
/plugin marketplace add luminik-io/claude-plugins
/plugin install event-outbound@luminik-plugins
```

### Homepage

```
https://www.luminik.io/tools/event-outbound
```

### Cover image

Upload `marketplace/cover-1200x630.png` (124 KB, 1200x630 PNG, dark theme with Luminik accent).

### Author / maintainer

```
Name: DataRavel Inc.
Location: Newark, DE, USA
Contact: prasad@luminik.io
Website: https://www.luminik.io
```

Luminik is the product brand; DataRavel Inc. is the legal entity.

### License

```
MIT
```

Confirmed in `LICENSE` (copyright 2026 DataRavel Inc.).

### Version

```
0.1.0
```

Matches both `.claude-plugin/plugin.json` and the marketplace entry.

### Tags / keywords

```
josh-braun, cold-outbound, apollo, b2b-events, sequencer, gtm, sdr, ae,
event-marketing, cold-email, linkedin, trade-shows, conferences,
sales-enablement, field-marketing, demand-generation
```

### Install command (for any "one-line install" field)

```
/plugin install event-outbound@luminik-plugins
```

### Example invocation (for any "try it" field)

```
Create an outbound sequence for RSA Conference 2026 targeting VP Security at
Series B fintechs. 4 week lead time, email plus LinkedIn. Sending identity:
Jane Doe, VP Growth, AcmeCo.
```

### Screenshots / demo

- Cover image: `marketplace/cover-1200x630.png` (the validator-checklist composition).
- Full example output: `examples/money2020-europe-2026/final_sequence.md` and `examples/saastr-annual-2026/final_sequence.md` in the public repo.

## Pre-submit checklist (confirm before hitting submit)

- [ ] Repo `luminik-io/event-outbound-skill` is public on GitHub
- [ ] Marketplace repo `luminik-io/claude-plugins` is public on GitHub
- [ ] `scripts/verify-install.sh` passes 8/8 automated checks locally
- [ ] Fresh Claude Code session can install via `/plugin install event-outbound@luminik-plugins` and see the skill in `/plugin list`
- [ ] Invoking the skill in a fresh session produces a full sequence with no banned phrases and no em-dashes (spot-check two touches)
- [ ] `marketplace/cover-1200x630.png` ready to upload (1200x630, under 200 KB)
- [ ] Signed in to https://claude.ai/settings/plugins/submit as prasad@luminik.io

## Anything that needs user input

Nothing to resolve in this session. The only open gates are:

1. Flipping both GitHub repos public.
2. Actually opening the submission form and pasting these fields.
3. Confirming in the form whether a cover image is required vs optional (spec language in the plugin docs currently does not mandate it, but the directory listings do include cover art, so upload it either way).
