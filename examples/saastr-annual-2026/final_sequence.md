# Outbound Sequence: SaaStr Annual 2026

**Event:** SaaStr Annual 2026 · 8–10 September 2026 · San Mateo County Event Center, CA
**Industry:** B2B SaaS (horizontal + vertical)
**Company size:** 50–2000 employees (Series A through late growth)
**Lead time:** 4 weeks · **Channels:** LinkedIn + email

> Each touch is an Apollo-ready template using the `{{snake_case}}` merge-field syntax supported by Apollo.io, Outreach, Salesloft, Instantly, and Smartlead. Copy is written in the Josh Braun permission-based style: no gating, no "want me to send?", no "not a pitch" defensive throat-clearing. Every email cold and follow-up leads with a first-principles observation about event lead scoring or rep-prep economics, not the generic "you have a pipeline problem" framing. Every touch passes validation against `data/cold-email-benchmarks.json`: 4-word lowercase subject max, 50–100 word body, 3–4 sentences, banned-phrase blocklist (gating and defensive phrases included), "you/your" pronoun majority, CTA ranked `make_offer` > `ask_for_interest`, zero em-dashes.

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
| `{{activity_signal}}` (custom) | LinkedIn activity, last 30d | `your post on MQL-to-SQL conversion` |
| `{{session_name}}` (custom) | Agenda topic matching their priority | `the pipeline acceleration track` |

> Tip: custom fields in Apollo are populated per-contact from a CSV upload or a CRM sync. If a field is blank, Apollo will substitute an empty string. Write each sentence so it still reads if a variable drops out.

---

## Persona A: VP Marketing

**Sits in their week**
- Monday: CEO asks for Q4 pipeline forecast; the number from last quarter's SaaStr was built on guesswork because the event team reports "activity", not "sourced pipeline".
- Wednesday: board deck due; still no clean ROI slide for the $400K SaaStr spend line, which means the CFO will ask about it first.
- Friday: marketing ops pings saying the post-event lead upload is still not in Salesforce two weeks later. The scan list has grown stale.

**Priorities** · source pipeline the CRO actually counts · lift MQL-to-SQL conversion on event leads (currently below the inbound baseline) · tell a clean event-ROI story to the board · shift spend from sponsored booths to targeted pre-event motions that fill rep calendars

**First-principles pain observations (ammo for the copy below)**
1. *Event-lead scoring is frozen at day 1.* Most SaaS teams score an event lead on ingestion against a generic MQL rubric, and the score never updates as the account progresses. A CRO reading Q4 forecast sees event MQLs converting at 4%, concludes events don't source pipeline, and cuts the SaaStr budget. The accounts that actually convert are usually the ones the model flagged as low priority on day 1.
2. *Intent data rewrites the list after reps land.* By the time a target list finalizes two weeks before the show, the intent data is already stale. The 60 accounts on the pre-show list rarely overlap with the 60 showing highest surge on the floor. Reps walk past the right buyers because the list never refreshed.

### Touch 1: T-28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}}, saw {{activity_signal}}. A handful of {{title}}s at SaaS companies {{company}}'s size are pressure-testing a pre-{{event_name}} scoring model that actually updates after a lead enters the funnel, which is usually where the CRO stops believing the event number. Open to comparing notes before September locks?

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 52`

---

### Touch 2: T-14d · Email cold

_Subject:_ `saastr lead scoring`

> {{first_name}}, here's why the CRO doesn't believe {{company}}'s {{event_name}} number: most SaaS teams score an event lead on day 1 against a generic MQL rubric, and the score never updates. Q4 forecast opens, the CRO sees event MQLs converting at 4%, cuts the budget, and the accounts that actually would have converted get deprioritized because day-1 scoring flagged them as low intent. Linked is a one-page teardown of how three {{title}}s rebuilt that scoring loop before {{event_city}} last year. If it's already rebuilt at {{company}}, ignore. Worth a skim before board prep?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 99`

---

### Touch 3: T-7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}}, one week out from {{event_name}}. The teardown I linked on rebuilding event-lead scoring is what three {{title}}s at SaaS companies {{company}}'s size are running through before flights. If the CRO already counts {{company}}'s event pipeline, ignore. If the conversion still sits below inbound, worth a read before reps land in {{event_city}}?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 55`

---

### Touch 4: T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}}, onsite at {{event_name}} today. {{session_name}} is where most SaaS marketing teams leave with a week's worth of notes they won't operationalize. If you're between sessions and already thinking about how this week's scans survive Q4 scoring at {{company}}, open to ten minutes near {{event_venue}} front of hall?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 51`

---

### Touch 5: T+2d · Email follow-up

_Subject:_ `san mateo recap`

> {{first_name}}, two days post-{{event_name}}, and here's the part nobody flags: by the time {{company}}'s target list finalized two weeks ago, the intent data was already stale. The 60 accounts reps worked in {{event_city}} rarely overlap with the 60 showing highest surge right now. Attached is a short recap of how three {{peer_company}}-tier marketing leaders rescore the post-show list against live intent inside 72 hours. If that refresh is already automated at {{company}}, ignore. Worth a read before Q4 forecast locks?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 92`

---

### Touch 6: T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}}, one week post-{{event_name}}. The recap I linked is what three SaaS {{title}}s used to rescore {{event_city}} leads against live intent before Q4 forecast. If {{company}}'s event-sourced number is already clean, ignore. If it's still being argued in a Google Sheet, worth a look before the board deck ships?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 52`

---

## Persona B: Head of Demand Generation

**Sits in their week**
- Three weeks out: rep 1:1s surface the same question, "who should I be meeting at SaaStr?", and nobody has a shared answer.
- Event week: 15,000 people, 300 sponsors, reps walk in without a named-account list and come back with a scan pile that doesn't map to any opportunity stage.
- Post-event: RevOps pings asking why event leads show up in Salesforce three weeks late with missing firmographics.

**Priorities** · fill rep calendars with ICP-match meetings before day one · standardise pre-event prep so it's not each rep's side project · tie every booth scan to an opportunity stage in Salesforce · make the playbook repeatable across {{event_name}}, Dreamforce, and HubSpot Inbound

**First-principles pain observations (ammo for the copy below)**
1. *Rep prep assumes a five-day week; SaaStr is a 72-hour sprint.* Standard pre-event briefings are built for week-long enablement cycles. SaaStr compresses that into three days of walking the floor. A rep cannot internalize 60 named accounts, 10 competitor talking points, and session logistics in a Thursday huddle. Half the list gets forgotten by Tuesday afternoon, and the missed accounts never surface in the post-show debrief.
2. *Booth scans collapse "had a conversation" and "scanned a lanyard" into the same record.* A scan captures contact info, not whether a conversation happened. RevOps treats all scans as identical inbound leads, so the rep who had a 20-minute qualification chat and the rep who scanned at the coffee bar both push the same record into Salesforce. Pipeline attribution inherits that collapse, and the CRO loses faith in the number.

### Touch 1: T-28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}}, noticed {{company}}'s ramp into {{event_name}}. A few demand-gen leads at SaaS companies your size are testing a pre-show prep model that treats {{event_city}} as a 72-hour sprint instead of a normal enablement cycle, which is usually where the list falls apart by Tuesday. Open to comparing notes?

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 51`

---

### Touch 2: T-14d · Email cold

_Subject:_ `saastr 72 hour sprint`

> {{first_name}}, standard rep-prep playbooks assume a five-day enablement week. {{event_name}} is a 72-hour sprint across a 15,000-person floor. A rep can't internalize 60 named accounts, 10 competitor talking points, and session logistics in a Thursday huddle, so half the {{company}} target list gets forgotten by Tuesday afternoon and never surfaces in the post-show debrief. Linked is a one-page teardown of how three demand-gen leads compressed prep into a pre-flight card reps actually used in {{event_city}}. If that's already solved at {{company}}, ignore. Worth a skim before 1:1s this week?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 99`

---

### Touch 3: T-7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}}, seven days until {{event_name}}. The pre-flight card teardown is what three demand-gen leads used to keep reps on {{company}}'s ICP through Tuesday at {{event_city}} rather than forgetting half the list. If prep is already locked for {{event_name}}, ignore. If 1:1s still feel fluid, worth a read before the flight?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 54`

---

### Touch 4: T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}}, day one at {{event_name}}. By Wednesday morning the list drift starts, and by Thursday the debrief will show 20 accounts reps never reached. If you're between meetings and thinking about how {{company}}'s scans survive RevOps' Salesforce cleanup next week, open to fifteen minutes near {{event_venue}}'s café?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 50`

---

### Touch 5: T+2d · Email follow-up

_Subject:_ `san mateo scans`

> {{first_name}}, here's the part RevOps doesn't say out loud: booth scans collapse "had a real 20-minute qualification chat" and "scanned a lanyard at the coffee bar" into the same Salesforce record. Pipeline attribution inherits that collapse, which is why the CRO stops believing the {{event_name}} number by Q4. Attached is a short recap of how three demand-gen leads restructured the scan-to-opportunity map before {{event_city}} leads hit the CRM. If that's already clean at {{company}}, ignore. Worth a read before reconciliation closes this week?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 93`

---

### Touch 6: T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}}, one week post-{{event_name}}. The recap on scan-to-opportunity mapping is what three demand-gen leads at SaaS companies {{company}}'s size used to rescue the CRO's faith in the event number before Q4 forecast. If {{event_city}} reconciliation is already closed cleanly, ignore. If it's still open, worth a look before the next event planning cycle starts?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 57`

---

## How to use this sequence

1. **Export from Apollo.** Create a sequence, add two personas matching the ones above, paste subject + body into each step. Apollo substitutes `{{first_name}}`, `{{company}}`, etc., from each contact record automatically.
2. **Fill the custom fields.** `{{peer_company}}`, `{{activity_signal}}`, `{{session_name}}` are not standard Apollo fields. Either add them as custom fields on the person/account object, or leave them blank. Each sentence containing a custom field reads cleanly without it.
3. **Actually attach the asset.** Every "Linked" / "Attached" reference in the copy assumes a real one-page teardown or recap is attached. Do not ship the sequence without the asset. Write it first, then turn on the sequence.
4. **Do not send identical copy to both personas.** Persona A pain is "the CRO doesn't believe the event pipeline number". Persona B pain is "reps forget half the list by Tuesday". If you merge the lists, pick one lane per contact.
5. **Pace the LinkedIn touches.** Apollo Connect requests over 20/day on a normal profile will trigger LinkedIn jail. If your sequence has more than 20 prospects a day, drop Touch 1 and lead with the T-14d email.
6. **Kill the sequence the moment someone replies.** Every step after a reply is noise.
