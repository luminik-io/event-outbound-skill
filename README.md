# Event Outbound

A Claude Code plugin that turns a B2B event into a full pre-event-to-post-event outbound sequence per ICP persona. Validated at generation time against ten cliche categories, channel-specific length rules, and permission-based CTA patterns.

> **Built on 20,000+ personalised touches across 50+ B2B events that sourced $6M+ in pipeline.** Distilled from four years of fintech IDV and cybersecurity outbound run by hand.

```bash
# From any Claude Code session
/plugin marketplace add luminik-io/claude-plugins
/plugin install event-outbound@luminik-plugins
```

## Who this is for

| Audience | What you get |
|---|---|
| **AEs and SDRs** working a trade-show attendee list four weeks out | Multi-touch email + LinkedIn sequence per persona, ready to paste into Apollo, Outreach, Salesloft, Instantly, or Smartlead |
| **Event marketers** running dinner invites, side events, speaker meet-and-greets, booth-visit campaigns | Channel-appropriate copy that gets opened and RSVP'd, not blasted and ignored |
| **Founders doing their own outbound** | The same workflow and the same validated output, without hiring an SDR |

Narrowed for fintech (identity verification, payments, regtech) and cybersecurity. The skill works outside those verticals, but the worked examples and the canonical pain-point library are tuned for those buyers.

## What makes this different

Every cold-email generator claims "proven frameworks." This one validates every touch against hard rules **before** it lands.

| Layer | What it checks |
|---|---|
| **Subject** | All lowercase, ≤ 4 words, no colons, no digits, no buzzwords |
| **Body length** | Channel-specific: cold email 50–100 words, LinkedIn connect ≤ 200 chars, day-of nudge 30–60 words, post-event 40–90 words |
| **Structure** | 4T pattern: Trigger → Think (illumination question) → Third-party validation → Talk? (lean-back CTA) |
| **Pronoun ratio** | "you/your" must outnumber "we/our" |
| **No em-dashes, exclamation marks, or emoji** | Hard-rejected |
| **CTA ranking** | `make_offer` > `ask_for_interest` > `ask_for_problem` > `ask_for_meeting` (CTA-type reply-rate deltas from the Gong / 30MPC / Outbound Squad 85M-email report) |
| **Cliche blocklist** | Ten categories, ~190 phrases. See *Validation rules* below |

Touches that fail validation are regenerated up to three times with temperature jitter. Anything still failing ships with `quality_flag: 'rules_violated'` so your pipeline can route it for human review instead of silently shipping bad copy.

## What it does

You hand the skill three things:

1. **Event** — name, dates, agenda, speakers, exhibitor list.
2. **ICP** — industry, size range, and one or more buyer personas with concrete priorities and pain points (vague aspirations like "build the brand" or "scale the team" fail the specificity check).
3. **Sequence params** — lead time in weeks (1–8, default 4), channels (email, LinkedIn, or both), sending identity.

It returns a full sequence per persona. Six to twelve touches on a four-week lead time, distributed across email and LinkedIn, covering pre-event, day-of, and post-event.

## What the output looks like

A single touch from the Money20/20 Europe 2026 example (full sequence is 12 touches across two personas):

```
Touch 2 · T-14d · email cold

Subject: money20/20 attribution

{{first_name}}, the {{event_name}} line item on {{company}}'s P&L is going to
land in front of the CFO under the same last-touch, 90-day attribution rules
your inbound runs on. The booth touch is usually the 3rd interaction in an
8-month fintech cycle, so the $200K {{event_name}} spend reads as sourcing $0
by the time {{company}}'s board prep opens. Attached is a one-page recap of
how three {{title}}s rebuilt the attribution window to surface the real
number before the {{event_city}} show. Worth a skim before your board prep
locks?

channel: email · offset: -14d · type: email_cold · cta: make_offer · words: 96
```

Apollo-ready merge-field syntax. The opening sentence is a specific, recipient-anchored observation, not a population-shape generalization. The CTA is a concrete offer (one-page recap), not a meeting-ask. The touch passes the full validator stack at 5/5.

## Worked examples

- `examples/rsa-conference-2026/` — cybersecurity ICP, two personas (VP Security + Lead SecurityOps Engineer), 12 touches across email + LinkedIn.
- `examples/money2020-europe-2026/` — fintech ICP, two personas (VP Marketing + Demand Gen Lead), 12 touches.
- `examples/singapore-fintech-festival-2026/` — fintech IDV ICP fixtures (run locally to generate sequences).

Every shipped sequence is hand-verified against the full validator stack: zero hits across the ten cliche categories, channel-length compliance, illumination-question coverage, pronoun ratio in favour of the reader.

## Quickstart

From inside a Claude Code session, after installing the plugin:

```
Create an outbound sequence for RSA Conference 2026 targeting VP Security at Series B fintechs.
4 week lead time, email plus LinkedIn.
```

The skill picks up the request, asks for any missing input fields (sending identity, lead time, channels), and returns a full `SequencerOutput` plus a rendered markdown preview ready to paste into your sequencer.

### Local development

```bash
git clone https://github.com/luminik-io/event-outbound-skill.git
cd event-outbound-skill
npm install && npm run build
claude --plugin-dir $(pwd)
```

To generate a worked example end-to-end (requires a Gemini API key):

```bash
GEMINI_API_KEY=... npx tsx scripts/run-example.ts examples/rsa-conference-2026
```

To run the full validator scan against every shipped artefact:

```bash
npx tsx scripts/scan-deliverables.ts
```

## Parameters

Full TypeScript types in `src/types/index.ts`. The short version:

| Input | Required fields | Notes |
|---|---|---|
| `EventContext` | `name`, `dates`, `location`, `agendaTitles` | Speaker + exhibitor lists improve specificity but are optional |
| `CompanyICP` | `industry`, `sizeRange`, `personas[]` | Minimum one persona; two personas is the real-world default |
| `AttendeePersona` | `personaId`, `role`, `seniority`, `priorities[]`, `painPoints[]` | Priorities and pains must be concrete. Vague aspirations fail the specificity check |
| `SequenceParams` | `leadTimeWeeks` (1–8), `channels`, `sendingIdentity` | 4 weeks is the sweet spot |

## Output shape

```ts
type SequencerOutput = {
  sequencesByPersona: {
    [personaId: string]: {
      personaId: string;
      touches: OutreachTouch[];
      leadTimeWeeks: number;
      channels: ('email' | 'linkedin')[];
    };
  };
};
```

Each `OutreachTouch` carries a `checks` block so you can see exactly why it passed. Touches that burned all three validation retries return with `quality_flag: 'rules_violated'`. They are the minority, and they are your cue to rewrite by hand.

## Validation rules

The cliche blocklist in `data/llm-cliche-blocklist.md` defines ten categories. Nine are hard-banned in skill output; one is soft-warned for human review.

<!-- scan:disable -->
| Category | Representative examples |
|---|---|
| `performative_empathy` | "stuck with me", "really resonated", "got me thinking" |
| `generic_compliments` | "amazing work", "love what you're doing", "curious to hear your thoughts" |
| `sales_speak_openers` | "hope this finds you well", "circling back", "touching base", "just checking in" |
| `manufactured_intimacy` | "in case it's helpful", "no pressure at all", "if it's of interest" |
| `marketing_buzzwords` | "leverage", "unlock", "transform", "seamless", "synergy", "drive growth" |
| `cold_email_overused` | "teardown" (as 1-pager), "playbook" (as marketing word), "blueprint", "north star", "table stakes", "low-hanging fruit", "double-click on", "do you have bandwidth" |
| `lazy_generalization_openers` | "Most teams...", "Most fintechs...", "Most VPs I talk to...", "Almost nobody...", "Nobody is...", "Everyone is...", "In our experience..." |
| `llm_transition_tics` | "Moreover,", "Furthermore,", "Additionally,", "It is worth noting that" |
| `gpt_vocabulary` | "delve", "tapestry", "navigate the landscape", "in today's fast-paced world" |
| `hedge_softener_warnings` | "I think", "perhaps", "it seems" (soft-warning, not auto-rejected) |
<!-- scan:enable -->

Sources cited inline in `data/llm-cliche-blocklist.md`: Stanford CRFM evaluations of GPT-detected vocabulary, GPTZero linguistic markers, the Lavender Live transcript, the Gong / 30MPC / Outbound Squad 85M-email "Ultimate Cold Email Data Report", and the workspace voice canon.

## Why use this over (alternatives)

| You're considering... | Where it falls short for event outbound |
|---|---|
| **Apollo's built-in AI email writer** | Generic templates per persona; no event-specific context (agenda, speakers, exhibitor neighbours). No validator. |
| **A custom GPT or Claude prompt you wrote yourself** | Works, but every output passes through whatever LLM cliches the base model is trained on. No reproducibility, no per-touch quality flag. |
| **Hand-writing each sequence** | The hand-written sequence is the bar this skill is calibrated against. The skill exists so you can run that bar across 10 personas in one afternoon instead of one persona per week. |
| **A general-purpose copywriter or AE training course** | Buys you craft, not throughput. This skill encodes the craft into validation rules and applies them to every touch automatically. |

## License

MIT. See `LICENSE`.

## Credits

**Teachers and sources we learned from**:

- **[Josh Braun](https://joshbraun.com)**, whose public writing on permission-based cold outbound has been a compass. The validator's tone rules (no pitch-speak, "you" > "we", concrete offers over meeting-asks) echo principles he teaches openly.
- **Gong's "Ultimate Cold Email Data Report"**: 85M emails analysed, co-authored with [30 Minutes to President's Club](https://30mpc.com) and [Outbound Squad](https://outboundsquad.com). The benchmark numbers we validate against (subject length impact, CTA-type reply-rate deltas, word-count sweet spots) come from this publicly-published research.

This plugin does not redistribute any proprietary content. It encodes general craft principles from publicly-taught material and published research into validation rules that run at generation time.

---

Luminik is a product of DataRavel Inc. (Newark, DE). More at [luminik.io](https://www.luminik.io).
