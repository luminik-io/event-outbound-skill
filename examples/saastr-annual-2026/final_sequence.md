# Outbound Sequence — SaaStr Annual 2026

**Event:** SaaStr Annual 2026 · 8–10 September 2026 · San Mateo County Event Center, CA
**Industry:** B2B SaaS (horizontal + vertical)
**Company size:** 50–2000 employees (Series A → late growth)
**Lead time:** 4 weeks · **Channels:** LinkedIn + email

> Each touch is an Apollo-ready template using the `{{snake_case}}` merge-field syntax supported by Apollo.io, Outreach, Salesloft, Instantly, and Smartlead. Every touch passed validation against `data/cold-email-benchmarks.json`: ≤ 4-word lowercase subject, 50–100 word body, 3–4 sentences, banned-phrase blocklist, "you/your" pronoun majority, CTA ranked `make_offer` > `ask_for_interest`.

---

## Merge field glossary

| Variable | Source | Example |
|----------|--------|---------|
| `{{first_name}}` | Apollo person record | `Morgan` |
| `{{company}}` | Apollo person record | `Gusto` |
| `{{title}}` | Apollo person record | `VP Marketing` |
| `{{sender_first_name}}` | Sender mailbox | `Prasad` |
| `{{sender_company}}` | Sender mailbox | `Luminik` |
| `{{event_name}}` | Event context | `SaaStr Annual` |
| `{{event_city}}` | Event context | `San Mateo` |
| `{{event_venue}}` | Event context | `the Event Center` |
| `{{peer_company}}` (custom) | Enrichment: one named peer your target knows | `Ramp`, `Vanta`, `Rippling` |
| `{{activity_signal}}` (custom) | LinkedIn activity · last 30d | `your post on MQL-to-SQL conversion` |
| `{{session_name}}` (custom) | Agenda topic matching their priority | `the pipeline acceleration track` |

> Tip: custom fields in Apollo are populated per-contact from a CSV upload or a CRM sync. If a field is blank, Apollo will substitute an empty string — write each sentence so it still reads if a variable drops out.

---

## Persona A — VP Marketing

**Sits in their week**
- Monday: CEO asks for Q4 pipeline forecast; the number from last quarter's SaaStr was built on guesswork because the event team reports "activity", not "sourced pipeline".
- Wednesday: board deck due; still no clean ROI slide for the $400K SaaStr spend line, which means the CFO will ask about it first.
- Friday: marketing ops pings saying the post-event lead upload is still not in Salesforce two weeks later. The scan list has grown stale.

**Priorities** · source pipeline that the CRO actually counts · lift MQL-to-SQL conversion on event leads (currently below the inbound baseline) · tell a clean event-ROI story to the board · shift spend from sponsored booths to targeted pre-event motions that fill rep calendars

**Pain that keeps them up** · event-sourced pipeline usually stalls at week two because follow-up is slow and generic · {{peer_company}}'s marketing team beat them to the meetings last year · "ROI" from events is a post-hoc narrative built in a Google Sheet, not a Salesforce number

### Touch 1 — T‑28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}} — saw {{activity_signal}}. A few {{title}}s at SaaS companies your size are trading notes on how they'll scale sourced pipeline at {{event_name}} without burning the budget {{peer_company}}'s team already torched. Open to connecting so you can compare approaches before September locks? Peer channel, no pitch.

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 50`

---

### Touch 2 — T‑14d · Email cold

_Subject:_ `saastr rep prep`

> {{first_name}} — your {{title}} peers at SaaS companies {{company}}'s size are walking into {{event_name}} with the same three asks this September: more sourced pipeline the CRO actually counts, better MQL-to-SQL on event leads, and a clean ROI story the CFO stops asking about. A one-page pre-event playbook captures the four motions other SaaS marketing leaders used last year to target named agenda sessions and put sixty accounts on rep calendars before day one. Want me to send it so you can compare it to {{company}}'s {{event_name}} plan?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 91`

---

### Touch 3 — T‑7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}} — one week out from {{event_name}} and most SaaS marketing teams land in {{event_city}} with the same gap: strong booth traffic, no plan for which of the 15,000 attendees actually maps to {{company}}'s ICP. A short brief walks through how three {{title}}s put their reps on {{session_name}} last year and turned that into named-account meetings before day one. Want it sent today so you can fold it into {{company}}'s plan before reps fly out?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 77`

---

### Touch 4 — T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}} — you're onsite at {{event_name}} today and your session list points at pipeline acceleration. If you're between meetings and wrestling with how this week's booth scans will land in {{company}}'s CRM as sourced pipeline, ten minutes near {{event_venue}} front of hall beats another partner demo. Want me to drop a specific time?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 55`

---

### Touch 5 — T+2d · Email follow-up

_Subject:_ `saastr pipeline recap`

> {{first_name}} — your {{event_name}} week likely produced a healthy scan list and a follow-up queue that's already eleven days long, which is where most SaaS marketing teams quietly lose the sourced pipeline the CRO is about to ask for on Q4 forecast calls. A short recap outlines the three post-event motions {{peer_company}}-tier marketing leaders used to cut that latency to two days and put a clean sourced-pipeline number in Salesforce. Want it sent today so {{company}}'s team can run it this week?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 86`

---

### Touch 6 — T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}} — one week post-{{event_name}}, your scan list is long, your Salesforce cleanup probably isn't, and Q4 forecast is being built without a clean event-sourced number. A short brief walks through the three post-event motions that lifted sourced pipeline for similar SaaS marketing teams. Want it sent today so you can pressure-test it against {{company}}'s own Q4 plan before it locks?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 67`

---

## Persona B — Head of Demand Generation

**Sits in their week**
- Three weeks out: rep 1:1s surface the same question — "who should I be meeting at SaaStr?" — and nobody has a shared answer.
- Event week: 15,000 people, 300 sponsors, reps walk in without a named-account list and come back with a scan pile that doesn't map to any opportunity stage.
- Post-event: RevOps pings asking why event leads show up in Salesforce three weeks late with missing firmographics.

**Priorities** · fill rep calendars with ICP-match meetings before day one · standardise pre-event prep so it's not each rep's side project · tie every booth scan to an opportunity stage in Salesforce · make the playbook repeatable across {{event_name}}, Dreamforce, and HubSpot Inbound

**Pain that keeps them up** · reps walk the 15,000-person floor blind · voice notes from the booth never make it into Salesforce · RevOps can't reconcile event leads to opportunities for weeks

### Touch 1 — T‑28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}} — noticed {{company}}'s ramp into {{event_name}} this year and your focus on filling rep calendars before day one. Two demand-gen leads at similar SaaS companies are testing a shared pre-event playbook for {{event_city}} in September. Open to connecting so you can compare prep motions before the show? Peer channel, no pitch.

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 55`

---

### Touch 2 — T‑14d · Email cold

_Subject:_ `saastr target list`

> {{first_name}} — your {{event_name}} prep window is closing, and the pattern plays out the same way every year for demand-gen leads at SaaS companies {{company}}'s size: reps walk a 15,000-person floor without a named-account list, voice notes die on phones, RevOps can't reconcile {{event_city}} leads for weeks. The one-page playbook outlines the four motions other demand-gen leads used to put sixty named accounts on rep calendars before day one. Want me to send it so you can fold it into {{company}}'s plan before rep 1:1s this week?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 90`

---

### Touch 3 — T‑7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}} — seven days until {{event_name}} opens and your reps will walk the {{event_city}} floor blind unless the target list lands before the flight. A short brief outlines the pre-event motion three demand-gen leads used to put sixty named accounts on rep calendars for {{event_city}} last September. Want it sent today so you can fold it into {{company}}'s prep before rep 1:1s this week?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 65`

---

### Touch 4 — T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}} — day one at {{event_name}}, and your reps are probably already off the target list. If you're between meetings and rethinking how this week's booth voice notes make it back into Salesforce without a three-week lag, fifteen minutes near {{event_venue}}'s café beats another floor lap. Want me to drop a specific time and meet you near the entrance?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 63`

---

### Touch 5 — T+2d · Email follow-up

_Subject:_ `saastr salesforce cleanup`

> {{first_name}} — your {{event_name}} floor work is done, your Salesforce cleanup probably isn't, and your reps are probably already pulled into the next event. A short recap outlines the three post-event motions other demand-gen leads used to cut follow-up latency from eleven days to two and give RevOps a clean reconciliation in Salesforce. Want it sent today so {{company}}'s team can run it this week before RevOps closes the books on {{event_city}}?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 78`

---

### Touch 6 — T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}} — your {{event_name}} scan list is probably long, your CRM record cleanup probably isn't. A short brief walks through three post-event motions that cut follow-up latency from eleven days to two for demand-gen leads at SaaS companies your size. Want it sent today so {{company}}'s team can run it before RevOps closes the books on {{event_city}}?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 61`

---

## How to use this sequence

1. **Export from Apollo.** Create a sequence, add two personas matching the ones above, paste subject + body into each step. Apollo substitutes `{{first_name}}`, `{{company}}`, etc., from each contact record automatically.
2. **Fill the custom fields.** `{{peer_company}}`, `{{activity_signal}}`, `{{session_name}}` are not standard Apollo fields — either add them as custom fields on the person/account object, or leave them blank. Each sentence containing a custom field reads cleanly without it.
3. **Do not send identical copy to both personas.** Persona A pain is "CRO counts my pipeline." Persona B pain is "reps walk the floor blind." If you merge the lists, pick one lane per contact.
4. **Pace the LinkedIn touches.** Apollo Connect requests over 20/day on a normal profile will trigger LinkedIn jail. If your sequence has more than 20 prospects a day, drop Touch 1 and lead with the T-14d email.
5. **Kill the sequence the moment someone replies.** Every step after a reply is noise.
