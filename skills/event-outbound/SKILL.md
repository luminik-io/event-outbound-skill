---
name: event-outbound
description: Generate validated multi-channel outreach sequences for B2B events (trade shows, conferences, summits). Email + LinkedIn, pre-event through post-event. Built for AEs, SDRs, and event marketers. Grounded in 20k+ personalised touches across 50+ events that sourced $6M+ in pipeline across fintech, cybersecurity, and B2B SaaS. Trigger this skill when the user asks to "create an outreach sequence for a conference", "write cold emails for an event", "build a LinkedIn cadence for attendees", "invite people to a side event or dinner at [conference]", or needs to turn an event + ICP into booked meetings.
version: 0.2.0
---

# Event Outbound Skill

This skill turns an event + a target persona into a validated multi-channel outreach sequence. **Claude (the model running this Claude Code session) is the generator.** No external API keys are required. The skill ships a pure-TypeScript validator and a CLI that Claude shells out to between drafts.

## When to use

Use this skill when the user wants:

- A pre-event outreach cadence (4-week lead time by default, configurable 1-8 weeks).
- A post-event follow-up sequence keyed to a booth scan, session attendance, or speaker drop-by.
- Side-event invites (dinners, founder breakfasts, after-parties) at a major conference.
- Channel-aware copy: cold email, LinkedIn connection request, LinkedIn DM, day-of nudge, post-event email.

Do **not** use this skill for: lifecycle/nurture email, transactional email, content marketing, generic always-on outbound. The generator is tuned for event-shaped triggers and will produce weak copy when forced into general use.

## Inputs

The user (or upstream agent) provides three things:

1. **Event context**, name, dates, location, optionally agenda titles, speakers, exhibitors, venue. Either inline or as a JSON file. If the user provides an event URL only, fetch it first; if you can't fetch it, ask the user for the basics.
2. **Company ICP + personas**, for each target persona, supply: `role`, `seniority`, `priorities` (3-5 outcomes the persona owns this quarter), `painPoints` (3-5 specific operational scars in their own language). Sample fixtures live at `examples/*/company-icp.json`.
3. **Sequence parameters**, `leadTimeWeeks` (1-8, default 4), `channels` (`email`, `linkedin`, or both), and `sendingIdentity` (sender name, title, company).

If any of these are missing or vague, ask the user for them before generating. Vague inputs produce vague output and the validator will reject most touches.

## How Claude executes this skill

For each persona, build one outreach sequence with 5-8 touches distributed across the lead-time window. Each touch is a separate generation step:

1. **Pick the channel + offset** for this touch from the timeline (see "Timeline" below).
2. **Draft the touch** following the 4T framework, the channel-specific length rule, and the hard validator rules below.
3. **Validate** by running `node scripts/validate-touch.mjs` with the touch as input. If it returns errors, **read the errors, revise the draft, and re-validate**. Up to 3 attempts. If still failing on attempt 3, mark the touch `quality_flag: rules_violated` and continue, do not ship a fake-passing touch.
4. **Score and band** the touch: 5/5 top-tier, 4/5 ship, 3/5 review, 1.5/5 rewrite (keyed to validator pass + specificity).
5. **Append** to the sequence; move to the next touch.

After all touches generate, write the final output as `final_sequence.md` (human-readable) and `sequencer-output.json` (machine-readable). Include a sequence summary header: total touches, average quality, score-band counts, CTA mix, illumination-question coverage.

The full system prompt with worked pass/fail examples lives in `data/cold-outbound-craft.md`. Treat that file as the canonical playbook. Re-read it any time you're unsure how to handle an edge case (multilingual events, dinner-invite touches, very short lead times).

## Voice (read this before drafting anything)

The bar is **authentic, honest, empathetic, no theatrics**. Not slang. Not coolness-signalling. Not corporate-sales-speak either. Write as a real person who has worked the job and is genuinely curious whether the recipient is dealing with the same thing.

Concrete rules that follow from that:

- **Don't fabricate a personalization signal.** If you didn't actually see the prospect's panel, post, hire, or session, don't write "saw your X" or "noticed you're Y" or "caught my eye". Forced personalization reads as fake the moment the recipient checks. When you have no real signal, use a **situation trigger** sized to the role ("end of Q3 and the CFO is locking the FY27 plan", "the part of the VP Risk job I hear about most before Money20/20 is..."). The situation is honest; the fake signal isn't.
- **Poke the bear via pain illumination + cost of inaction, not theatrics.** Name the specific tradeoff the persona is managing this quarter, then quietly draw the line to what happens if it goes unaddressed (Q4 board deck, regulator audit, CFO QBR). No drama. No "this is wild." No "honestly?". Just the operational reality the persona is already living.
- **Empathy over swagger.** When the persona is dealing with a hard tradeoff, name it honestly. "Tightening the rules drops approval rates 4-7 points and Sales escalates inside 48 hours" is honest empathy. "Most VPs walk in already knowing the pitch" is performative.
- **No slang and no faux-casual swagger.** Banned tells: `caught my eye`, `caught my attention`, `wall-to-wall`, `no worries`, `no biggie`, `hot mess`, `needle in a haystack`, `fire drill`, `all hands on deck`. The validator catches these. The deeper issue: copy that *needs* slang to sound human is masking weak substance.
- **Bodies use proper grammar.** Capitalize the first letter of every sentence. Use full punctuation. The "all-lowercase" convention applies only to subject lines (per the cold-email-subject canon). Body copy is not a Slack message.
- **Don't force the event into the body opener.** The event is the *occasion* for outreach; it doesn't have to be the *subject*. Many of the strongest touches anchor on a persona-priority or pain in the body and only invoke the event at the CTA when both parties will be there ("worth a quick coffee at the show?"). Forcing "before RSA" / "at Money20/20" into every sentence reads like a sequence template.
- **Use human shorthand for proof references.** Stiff: "Adyen and Marqeta wrote up a same-week false-positive cohort review that compresses the loop. There is a write-up if useful." Better, the way someone would actually say it: "Attached a one-pager from our work with Adyen and Marqeta on this. What do you think, is the false-positive review on your roadmap this quarter?" Shorthand reads as a peer talking, not a vendor reading from a script. Patterns that work:
  - `"Attached a one-pager from our work with [A] and [B] on [topic]."`
  - `"Sending the writeup we did for [A] last quarter, scan it if useful."`
  - `"[A] and [B] hit [number]; happy to share how, if it's worth the read."`
- **Close with a real question, not a polite ritual.** "Worth a look?" is fine but overused. Stronger when grounded: `"What do you think?"`, `"Is this on your roadmap this quarter?"`, `"Is this a priority for {{company}} right now, or queued for Q3?"`. Banned because every cold-email guide overuses it: `"comparing notes"`, `"compare notes"`, `"swap notes"`.
- **Reread aloud.** If you'd be slightly embarrassed sending this to a peer, the copy is wrong. Rewrite.

## The 4T framework

Every cold email and post-event email follows this shape. LinkedIn DMs follow it loosely. LinkedIn connection requests compress it to 2 sentences (Trigger + Talk).

1. **Trigger**, why this person, why now? A specific observation or situation. Patterns: `"noticed [observable thing] which suggests [deduction]"`, `"saw you're [doing X] at [event]"`. If you have no signal, use a situation trigger sized to the role (e.g. "end of Q3 and the CFO is locking the FY27 plan"). **Never open with a population claim** ("Most teams…", "Most VPs…", "In our experience…", "Many fintechs…"). Auto-rejected.
2. **Think**, the **illumination question**. A neutral how/what/why-are-you question that shines a light on a problem the persona owns. Not a leading question. Auto-rejected: `"if I could…"`, `"would you be interested?"`, `"wouldn't you agree?"`, `"don't you think?"`. Required for cold emails and post-connect DMs.
3. **Third-party validation**, let other people toot your horn. One sentence. Pattern: `"[Peer A] and [Peer B] [outcome] [SHARP NUMBER] compared to [old number] before."` Use real published peer references when possible; if not, frame as "we wrote up the workflow used by two payments teams" rather than fabricating named customers. Banned: `"we're the best"`, `"industry-leading"`, `"world-class"`.
4. **Talk?**, interest-based CTA, with a question mark, lean-back energy. Approved shapes: `"Worth a look?"`, `"Worth a skim?"`, `"What do you think?"`, `"Is this on your roadmap this quarter?"`, `"Is this a priority for {{company}} this quarter?"`. Banned: `"Got 15 minutes?"`, `"Book a call"`, `"schedule a meeting"`, `"calendar link"`, and the over-deployed `"comparing notes"` / `"compare notes"` / `"open to comparing notes"`.

## Channel-specific length rules (hard)

These are enforced by [scripts/validate-touch.mjs](../../scripts/validate-touch.mjs). Read [data/cold-outbound-rules.json](../../data/cold-outbound-rules.json) for the canonical numbers.

| touch_type | min words | max words | sentences | other |
|---|---|---|---|---|
| `cold_email_first_touch` | 50 | 100 | 3-5 | needs illumination Q |
| `cold_email_followup_2` | 40 | 90 | 3-4 | |
| `cold_email_followup_3plus` | 25 | 60 | 2-3 | |
| `linkedin_connection_request` | 18 | 35 | 1-2 | max 200 chars, no subject |
| `linkedin_dm_post_connect` | 50 | 120 | 3-5 | needs illumination Q |
| `linkedin_day_of_nudge` | 30 | 60 | 2-3 | |
| `post_event_followup` | 40 | 90 | 2-4 | |

Subject lines: ≤ 4 words, all lowercase, no digits-only buzzwords, no banned subject buzzwords (`AI`, `platform`, `leverage`, `transform`, `unlock`, …). Email subjects are static text, do not put merge fields inside them.

## Timeline (default 4-week lead time, both channels)

| offset | channel | touch type |
|---|---|---|
| T-28d | linkedin | `linkedin_connection_request` |
| T-21d | email | `cold_email_first_touch` |
| T-14d | linkedin | `linkedin_dm_post_connect` |
| T-7d | linkedin | `linkedin_day_of_nudge` (pre-event nudge) |
| T0 | linkedin | `linkedin_day_of_nudge` |
| T+2d | email | `post_event_followup` |
| T+7d | linkedin | `linkedin_day_of_nudge` (post follow-up) |
| T+14d | email | `cold_email_followup_2` (final) |

For other lead times or single-channel cadences, adjust proportionally; the generator at `src/lib/timeline.ts` can be invoked directly if needed (`node -e "import('./src/lib/timeline.ts').then(m => console.log(m.generateTimeline(2, ['email'])))"`).

## Hard validator rules (auto-rejected)

Every touch is run through [scripts/validate-touch.mjs](../../scripts/validate-touch.mjs). On failure, the script returns JSON with each failed rule. **Read the errors, fix the draft, re-validate.**

- Subject ≤ 4 lowercase words, no digits in cold-email subjects, no banned subject buzzwords.
- Body within the channel length rule (above).
- Cold emails + post-connect DMs must contain a `how/what/why-are/do/is-you/your` illumination question.
- No leading questions: `if I could…`, `would you be interested`, `wouldn't you agree`, `don't you think`.
- No em-dashes. Use commas, periods, colons, parens.
- No exclamation marks. No emoji.
- "you/your" must outnumber "we/our" in the body.
- No banned phrases, see `additional_banned_phrases` in `data/cold-outbound-rules.json`. Includes `happy to send`, `15 minutes`, `30 minutes`, `calendar link`, `book a call`, `schedule a meeting`, `cutting-edge`, `industry-leading`, `world-class`, etc.
- No LLM-cliché phrases, 200+ phrases across 10 categories. See `llm_cliche_blocklist` in the same file. Categories: `performative_empathy`, `generic_compliments`, `sales_speak_openers`, `manufactured_intimacy`, `marketing_buzzwords`, `cold_email_overused`, `lazy_generalization_openers`, `llm_transition_tics`, `gpt_vocabulary`. (`hedge_softener_warnings` is soft, does not fail.)
- No anti-flex selling tics: `"no deck"`, `"no demo"`, `"no calendar invite"`, `"no follow-up deck"`, `"reply yes and i'll send"`. These read as soulless-selling-with-extra-steps. If you'd write one, just don't include the assurance, write copy that doesn't need it.
- No floor/booth-shopping framing in cold copy. Don't talk about "47 fraud-platform vendors", "five vendors with real numbers", "which booths can answer X". The recipient cares about the risk they manage, not your vendor census.
- One problem per email. Don't mash multiple value props.
- Address the recipient with `{{first_name}}` and reference their company as `{{company}}` at least once. Never hard-code real names or companies in the output, those are merge-field substitutions that happen at send time.

## Validating a touch from inside this skill

```bash
node scripts/validate-touch.mjs --touch <(cat <<'JSON'
{
  "subject": "money20/20 chargeback prep",
  "body": "Neha, ...",
  "channel": "email",
  "touch_type": "cold_email_first_touch",
  "eventName": "Money20/20 USA 2026",
  "personaPriorities": ["ship a measurable reduction in chargeback rate to the CFO before Q4 close"],
  "personaPainPoints": ["rules-vs-models false-positive tradeoff..."]
}
JSON
)
```

Returns `{ "isValid": true | false, "errors": [...], "checks": {...} }` on stdout. Exit code is 0 either way (errors are part of the contract, not a process failure).

## Output structure

Write two files per run, in a directory named for the event:

- `final_sequence.md`, human-readable. One section per persona; one subsection per touch with channel, offset, type, body, and quality band. Sequence summary at top.
- `sequencer-output.json`, machine-readable. Top-level shape: `{ "sequencesByPersona": { [personaId]: { personaId, leadTimeWeeks, channels, touches: [...] } } }`. See `src/types/index.ts` for the full type. Every touch carries its `checks` object and any `validation_errors`.

Working examples that exercise the full contract:

- `examples/rsa-conference-2026/`, cybersecurity, RSA Conference 2026, VP Marketing + Demand Gen Lead personas.
- `examples/money2020-usa-2026-fraud/`, fintech, Money20/20 USA 2026, VP Risk and Fraud + Head of Compliance personas.
- `examples/singapore-fintech-festival-2026/`, fintech APAC, fixture inputs only (regen target).

## Voice, the bar

Every touch must read like a text from a smart peer who noticed something specific and is genuinely curious whether the recipient is dealing with the same thing. Not a vendor. Not an AI. Not a polished sales rep. A peer.

Concrete tells of getting it wrong:

- Polished/symmetrical sentences. Real human copy is asymmetric and a little terse.
- Hedge stacks: "Just wanted to see if you might possibly have a moment to perhaps connect." Cut all of them.
- Abstract pain ("attribution challenges", "scaling outbound") instead of specific scars ("the $250K RSA budget line reads as sourcing $0 because of the 90-day last-touch window").
- Ending with a sales-coded reassurance ("no deck, no demo, no follow-up"). If you wouldn't say it on a coffee invite, don't write it.

When you're unsure if a draft is good, read it aloud. If you'd be embarrassed sending it to a peer, rewrite it.

## Source files

- [data/cold-outbound-rules.json](../../data/cold-outbound-rules.json), channel rules, banned phrases, cliché blocklist.
- [data/cold-email-benchmarks.json](../../data/cold-email-benchmarks.json), subject + body benchmarks.
- [data/cold-outbound-craft.md](../../data/cold-outbound-craft.md), full canon, the playbook this skill encodes.
- [data/cold-outbound-frameworks.md](../../data/cold-outbound-frameworks.md), 4T worked examples + voice anti-patterns.
- [data/cold-outbound-canonical-examples.json](../../data/cold-outbound-canonical-examples.json), pass + fail reference touches.
- [src/types/index.ts](../../src/types/index.ts), full TypeScript types for `EventContext`, `CompanyICP`, `OutreachTouch`, `OutreachSequence`, `SequencerOutput`.
- [scripts/validate-touch.mjs](../../scripts/validate-touch.mjs), the validator CLI.

## Optional: headless runs

If a user wants to run this skill outside Claude Code (CI, batch generation, scheduled cron), the `src/agents/sequencer.ts` module exposes `generateSequence()` with an injectable `TouchGenerator`. Bring your own LLM. There is no required cloud API for using the skill inside Claude Code.
