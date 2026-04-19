# Outbound Sequence — Money20/20 Europe 2026

**Event:** Money20/20 Europe 2026 · 2–4 June 2026 · RAI Amsterdam
**Industry:** Fintech (payments, RegTech, identity verification, B2B SaaS)
**Company size:** 200–2000 employees
**Lead time:** 4 weeks · **Channels:** LinkedIn + email

> Each touch is an Apollo-ready template. Merge fields use the `{{snake_case}}` syntax supported by Apollo.io, Outreach, Salesloft, Instantly, and Smartlead. Every touch passed validation against `data/cold-email-benchmarks.json`: ≤ 4-word lowercase subject, 50–100 word body, 3–4 sentences, banned-phrase blocklist, "you/your" pronoun majority, CTA ranked `make_offer` > `ask_for_interest`.

---

## Merge field glossary

| Variable | Source | Example |
|----------|--------|---------|
| `{{first_name}}` | Apollo person record | `Elena` |
| `{{company}}` | Apollo person record | `Klarna` |
| `{{title}}` | Apollo person record | `VP Marketing` |
| `{{sender_first_name}}` | Sender mailbox | `Prasad` |
| `{{sender_company}}` | Sender mailbox | `Luminik` |
| `{{event_name}}` | Event context | `Money20/20 Europe` |
| `{{event_city}}` | Event context | `Amsterdam` |
| `{{event_venue}}` | Event context | `RAI` |
| `{{event_day_of_week}}` | Event context | `Tuesday` |
| `{{booth_or_hall}}` (custom) | Manual enrichment | `hall 8` or `meeting hub` |
| `{{peer_company}}` (custom) | Enrichment: one named peer your target knows | `Mollie`, `Adyen` |
| `{{activity_signal}}` (custom) | LinkedIn activity · last 30d | `your post on booth-to-CRM latency` |

> Tip: if an enrichment field (`{{peer_company}}`, `{{activity_signal}}`, `{{booth_or_hall}}`) is empty, Apollo will skip the sentence. Write each touch so the sentence with the custom field is a standalone clause — never wrap the CTA around it.

---

## Persona A — VP Marketing

**Sits in their week**
- Monday 9:00: CMO asks for sourced-pipeline number for last quarter's events; opens a spreadsheet that still has blanks in the attribution column.
- Wednesday: board deck due in two weeks, still no clean ROI slide for the $200K Money20/20 budget line.
- Friday: attendee CSV arrives from the event team, three days before the show. Too late to build a target list, too late to brief reps.

**Priorities** · prove event-sourced pipeline to CMO and CFO · shorten the gap between booth scan and CRM record · build a repeatable pre-event meeting motion · standardise rep prep across regional AE teams

**Pain that keeps them up** · spent $200K on last year's Money20/20 and cannot point to one closed deal · eleven-day follow-up latency means Klarna and Adyen's AEs book the meetings first · "event ROI" lives in a Google Sheet, not Salesforce

### Touch 1 — T‑28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}} — saw {{activity_signal}}. A few {{title}}s at fintech scaleups are comparing how they'll prep reps for {{event_name}} in {{event_city}} this year. Happy to connect so you can trade notes before your team locks its June plan. Peer channel only, not a pitch.

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 52`

---

### Touch 2 — T‑14d · Email cold

_Subject:_ `money20/20 rep prep`

> {{first_name}} — your {{title}} peers in fintech are walking into {{event_name}} with the same three asks this year: prove event-sourced pipeline to the CMO, cut the gap between booth scan and CRM record, and stop losing the eleven-day follow-up race to {{peer_company}}'s AEs. A one-page pre-event playbook captures the four motions other fintech marketing leaders ran last year to close that attribution gap before the show opens. Want me to send it so you can compare it to what {{company}}'s team already has for June?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 86`

---

### Touch 3 — T‑7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}} — your {{event_name}} prep window is one week out and most {{title}}s walk into {{event_city}} with the same gap: booth scans on one side, CRM records on the other, eleven days of latency in between. The one-page playbook walks through the four motions that closed that gap for similar fintech marketing teams last June. Want it sent over today so you can fold it into {{company}}'s plan before reps fly out?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 76`

---

### Touch 4 — T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}} — you're on the floor at {{event_name}} today and your agenda points at the attribution track. If you're between sessions and still wrestling with how this week's booth scans will land in {{company}}'s CRM, ten minutes near the {{event_venue}} press room beats another partner demo. Want me to drop a specific time and meet you front of hall?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 61`

---

### Touch 5 — T+2d · Email follow-up

_Subject:_ `amsterdam pipeline recap`

> {{first_name}} — your {{event_name}} week likely produced a healthy scan list and a follow-up queue that's already eleven days long, which is where most {{title}}s quietly lose the event-sourced pipeline the CMO is about to ask for. A short recap walks through the three post-event motions other fintech marketing leaders used to cut that latency to two days and put a clean attribution number in Salesforce. Want it sent today so you can slot it into {{company}}'s follow-up plan this week?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 85`

---

### Touch 6 — T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}} — one week post-{{event_name}}, your scan list is long, your CRM cleanup probably isn't. A short brief outlines the three post-event motions that lifted sourced pipeline for {{peer_company}}-tier fintech marketing teams last year. Want it sent over today so you can run it against {{company}}'s own follow-up plan before Q3 planning locks?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 59`

---

## Persona B — Demand Generation Lead

**Sits in their week**
- Three weeks before the show: rep 1:1s start asking "who am I meeting at Money20/20?" and nobody has a shared answer.
- Event week: 22,000 people on the floor, 1,500 exhibitors, reps walk in without a named-account list and come back with a booth scan that doesn't map to opportunity stages.
- Post-event: RevOps pings them asking why event leads show up in Salesforce three weeks later with missing fields.

**Priorities** · fill rep calendars with target accounts before day one · standardise pre-event prep across the team · tie booth meetings back to pipeline in Salesforce · run the same playbook across RSA, Money20/20, and Finovate

**Pain that keeps them up** · reps walk the 22,000-person {{event_city}} floor blind · voice notes from the booth never make it into Salesforce · RevOps can't reconcile event leads to opportunities for weeks

### Touch 1 — T‑28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}} — noticed {{company}}'s prep cycle for {{event_name}} and your focus on filling rep calendars before day one. Two demand-gen leads at similar fintech scaleups are testing a shared pre-event playbook for {{event_city}} this June. Open to connecting so you can compare prep motions before the show? Peer channel, no pitch.

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 54`

---

### Touch 2 — T‑14d · Email cold

_Subject:_ `money20/20 target list`

> {{first_name}} — your {{event_name}} prep window is closing, and the pattern plays out the same way every year for demand-gen leads at {{company}}'s size: reps walk a 22,000-person floor without a named-account list, voice notes die on phones, RevOps can't reconcile {{event_city}} leads for weeks. The one-page playbook outlines the four motions other demand-gen leads used to put sixty named accounts on rep calendars before day one. Want me to send it so you can fold it into {{company}}'s plan before rep 1:1s this week?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 90`

---

### Touch 3 — T‑7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}} — seven days until {{event_name}} opens, and your reps will walk the {{event_city}} floor blind unless the target list lands before the flight. A short brief outlines the pre-event motion three demand-gen leads used to put sixty named accounts on rep calendars for {{event_city}} last year. Want it sent so you can fold it into {{company}}'s prep?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 64`

---

### Touch 4 — T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}} — day one at {{event_name}}, and your reps are probably already off the target list. If you're between meetings and rethinking how this week's booth voice notes make it back into Salesforce without a three-week lag, fifteen minutes near the {{event_venue}} café beats another floor lap. Want me to drop a specific time and meet you near the entrance?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 64`

---

### Touch 5 — T+2d · Email follow-up

_Subject:_ `amsterdam salesforce cleanup`

> {{first_name}} — your {{event_name}} floor work is done, your Salesforce cleanup probably isn't, and your reps are probably already pulled into the next event. A short recap outlines the three post-event motions other demand-gen leads used to cut follow-up latency from eleven days to two and give RevOps a clean reconciliation in Salesforce. Want it sent today so {{company}}'s team can run it this week before RevOps closes the books on {{event_city}}?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 78`

---

### Touch 6 — T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}} — your {{event_name}} scan list is probably long, your CRM record cleanup probably isn't. A short brief walks through three post-event motions that cut follow-up latency from eleven days to two for demand-gen leads at fintech scaleups your size. Want it sent today so {{company}}'s team can run it before RevOps closes the books on {{event_city}}?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 63`

---

## How to use this sequence

1. **Export from Apollo.** Create a sequence in Apollo, add two personas matching the ones above, paste the subject + body into each step. Apollo will substitute `{{first_name}}`, `{{company}}`, etc., from each contact record.
2. **Fill the custom fields.** `{{peer_company}}`, `{{activity_signal}}`, `{{booth_or_hall}}` are not standard Apollo fields — either add them as custom fields on the person/account object, or leave them blank (each sentence containing one reads cleanly without it).
3. **Do not send identical copy to both personas.** Persona A pain is "prove pipeline to CMO." Persona B pain is "fill rep calendars." If you merge the lists, pick one lane per contact and don't try to say both things.
4. **Pace the LinkedIn touches.** Apollo Connect requests over 20/day on a normal profile will trigger LinkedIn jail. If your sequence has more than 20 prospects a day, drop Touch 1 and lead with the T-14d email.
5. **Kill the sequence the moment someone replies.** Every step after a reply is noise.
