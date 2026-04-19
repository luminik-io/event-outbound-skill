# Event Outbound

Turn a B2B event into a full pre-event-to-post-event outbound cadence that reads like something a human sent.

## Who it's for

**Primary: AEs and SDRs.** You're walking into a trade show or industry conference in four weeks. The attendee list hit your inbox this morning. Nobody on it has heard from you. You need a sequence per persona that gets meetings booked before the booth opens.

**Primary: event marketers.** You're running a dinner, a side event, a speaker meet-and-greet, or a booth-visit push at a large B2B conference. You need invite copy that gets opened and RSVP'd, not blasted and ignored.

**Secondary: founders doing their own outbound.** Same workflow, same validated output.

## Track record this was built on

Over the last four years I've run multi-channel outbound for B2B events as a founder and operator. 20k+ personalised emails and LinkedIn messages across 50+ trade shows, conferences, and industry events. $6M+ in sourced pipeline across fintech (identity verification), cybersecurity, and B2B SaaS. This plugin is the validated version of what actually worked.

## What makes this different

Every cold-email generator claims "proven frameworks." This one validates every touch against hard rules before it lands: subject ≤4 words, body 50–100 words, banned-words blocklist, pronoun ratio favouring the reader, CTA pattern favouring concrete offers over meeting-asks.

## What it does

You hand the skill three things:

1. The **event**: name, dates, agenda, speakers.
2. Your **ICP**: industry, size range, and one or more buyer personas with real priorities and pain points (not "drive growth").
3. **Sequence params**: how many weeks out to start, email or LinkedIn or both, and who is signing the messages.

It returns a full sequence per persona. Six to eight touches on a four-week lead time, spread across email and LinkedIn, covering pre-event, day-of, and post-event.

Every touch is written by Gemini 2.5 Flash, then validated. Failed touches are regenerated up to three times with temperature jitter. Anything still failing gets flagged `rules_violated` so your pipeline can route it for human review instead of silently shipping bad copy.

## Quickstart

```bash
# Install
claude plugin install event-outbound

# Or point at a local checkout
claude plugin install --path ~/Claude_Workspace/event-outbound-skill
```

Then from Claude Code:

```
Create an outbound sequence for RSA Conference 2026 targeting VP Security at Series B fintechs. Four week lead time, email plus LinkedIn.
```

The skill picks up the request, asks for any missing input fields, and returns the full `SequencerOutput` along with a rendered markdown preview.

## Full example

See `examples/money2020-europe-2026/` in the source repo for a real run:

- `inputs.json`: Money20/20 Europe 2026 as the event, a fintech ICP with two personas (VP Marketing + Demand Gen Lead)
- `generation.log`: every Gemini 2.5 Flash call, including the retry trail when a touch failed validation
- `final_sequence.md`: the final 12 touches, ready to paste into your outreach tool

## Parameters

Full TypeScript types in `src/types/index.ts`. The short version:

| Input | Required fields | Notes |
|---|---|---|
| `EventContext` | `name`, `dates`, `location`, `agendaTitles` | Speaker + exhibitor lists improve specificity but are optional |
| `CompanyICP` | `industry`, `sizeRange`, `personas[]` | Minimum one persona; two personas is the real-world default |
| `AttendeePersona` | `personaId`, `role`, `seniority`, `priorities[]`, `painPoints[]` | Priorities and pains must be specific. "Drive growth" will fail the specificity check |
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

Each `OutreachTouch` carries a `checks` block so you can see exactly why it passed. Touches that burned all three validation retries are returned with `quality_flag: 'rules_violated'`. They are the minority, and they are your cue to rewrite by hand.

## Rules

Validated against a hard-filter rule set encoded in `data/cold-email-benchmarks.json`:

- Subject: all lowercase, max 4 words, no colons, no numbers, no banned buzzwords.
- Body: 50–100 words, 3–4 sentences, Personalisation → Problem → Solution → CTA.
- You/Your must outnumber We/Our in the body.
- No exclamation marks. No emoji. No em-dashes.
- No standard salesy filler (canonical blocklist in the benchmarks file).
- Preferred CTAs: `make_offer` first, `ask_for_interest` second. Soft asks outperform hard meeting-asks in the data.

## License

MIT. See `LICENSE`.

## Credits

**Teachers and sources we learned from**:

- **[Josh Braun](https://joshbraun.com)**, whose public writing on permission-based cold outbound has been a compass. The validator's tone rules (no pitch-speak, "you" > "we", concrete offers over meeting-asks) echo principles he teaches openly.
- **Gong's "Ultimate Cold Email Data Report"**: 85M emails analysed, co-authored with [30 Minutes to President's Club](https://30mpc.com) and [Outbound Squad](https://outboundsquad.com). The benchmark numbers we validate against (subject length impact, CTA-type reply-rate deltas, word-count sweet spots) come from this publicly-published research.

This plugin does not redistribute any proprietary content. It encodes general craft principles from publicly-taught material and published research into validation rules that run at generation time.

---

Luminik is a product of DataRavel Inc. (Newark, DE). More at [luminik.io](https://www.luminik.io).
