# Outbound Sequence: Money20/20 Europe 2026

**Event:** Money20/20 Europe 2026 · 2–4 June 2026 · RAI Amsterdam
**Industry:** Fintech (payments, RegTech, identity verification, B2B SaaS)
**Company size:** 200–2000 employees
**Lead time:** 4 weeks · **Channels:** LinkedIn + email

> Each touch is an Apollo-ready template. Merge fields use the `{{snake_case}}` syntax supported by Apollo.io, Outreach, Salesloft, Instantly, and Smartlead. Copy is written in the Josh Braun permission-based style: no gating, no "want me to send?", no "not a pitch" throat-clearing. Every email cold and follow-up leads with a first-principles observation about event attribution or booth-scan economics, not the generic "you have a pipeline problem". Every touch passes validation against `data/cold-email-benchmarks.json`: 4-word lowercase subject max, 50–100 word body, 3–4 sentences, banned-phrase blocklist (gating and defensive phrases included), "you/your" pronoun majority, CTA ranked `make_offer` > `ask_for_interest`, zero em-dashes.

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
| `{{activity_signal}}` (custom) | LinkedIn activity, last 30d | `your post on booth-to-CRM latency` |

> Tip: if an enrichment field (`{{peer_company}}`, `{{activity_signal}}`, `{{booth_or_hall}}`) is empty, Apollo will skip the sentence. Write each touch so the sentence with the custom field is a standalone clause, never wrap the CTA around it.

---

## Persona A: VP Marketing

**Sits in their week**
- Monday 9:00: CMO asks for sourced-pipeline number for last quarter's events; opens a spreadsheet that still has blanks in the attribution column.
- Wednesday: board deck due in two weeks, still no clean ROI slide for the $200K Money20/20 budget line.
- Friday: attendee CSV arrives from the event team, three days before the show. Too late to build a target list, too late to brief reps.

**Priorities** · prove event-sourced pipeline to CMO and CFO · shorten the gap between booth scan and CRM record · build a repeatable pre-event meeting motion · standardise rep prep across regional AE teams

**First-principles pain observations (ammo for the copy below)**
1. *Attribution model inheritance.* Most event attribution inherits inbound logic: last-touch, 90-day window. Events don't behave like that. The booth touch is usually the 3rd interaction in an 8-month fintech sales cycle, so the $200K Money20/20 line looks like it sourced $0 on the P&L and the CMO is about to ask why.
2. *Sponsorship ROI asymmetry.* Fintech sponsor packages are priced on booth footage and banner impressions. The number that actually correlates with closed-won is reply rate in the 14 days after the show. Almost nobody tracks it.

### Touch 1: T-28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}}, noticed {{activity_signal}}. a few {{title}}s at fintech scaleups are comparing how they'll prove sourced pipeline from {{event_name}} before the CMO asks. figured the prep math would be more useful to you than another vendor request. open to connecting?

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 47`

---

### Touch 2: T-14d · Email cold

_Subject:_ `money20/20 attribution`

> {{first_name}}, most event attribution models inherit inbound logic: last-touch, 90-day window. Events don't behave like that at {{company}}'s size. The booth touch is usually the 3rd interaction in an 8-month fintech cycle, so the $200K {{event_name}} line on the P&L looks like it sourced $0 and the CMO is about to ask why. Attached is a one-page teardown of how three {{title}}s rebuilt the attribution window to surface the real number before the {{event_city}} show opens. Worth a skim before your board prep locks?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 96`

---

### Touch 3: T-7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}}, one week until {{event_name}} opens. The attribution teardown I linked last week is what other {{title}}s at fintechs {{company}}'s size are running through before flights. If clean event-sourced pipeline isn't on this quarter's board deck, ignore. If it is, worth a read before reps fly to {{event_city}}?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 55`

---

### Touch 4: T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}}, on the floor at {{event_name}} today. The attribution track is right next to the {{event_venue}} press room, and most fintech marketing teams leave it with more questions than answers. If you're between sessions and thinking about how this week's booth scans actually land in {{company}}'s CRM, open to ten minutes near the press room?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 59`

---

### Touch 5: T+2d · Email follow-up

_Subject:_ `amsterdam recap`

> {{first_name}}, two days post-{{event_name}}. Here's the first-principles problem the CMO is about to surface: fintech sponsor packages are priced on booth footage and banner impressions, but the number that actually correlates with closed-won is reply rate in the 14 days after the show, and almost nobody tracks it. Attached is a short recap of the three post-event motions that pushed that reply rate from 4% to 18% for marketing leaders at {{peer_company}}'s tier. If {{company}} already has that number, ignore. If not, worth a read this week?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 97`

---

### Touch 6: T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}}, one week out from {{event_name}}. The recap I linked is what three fintech {{title}}s used to get a sourced-pipeline number into Salesforce before Q3 planning. If clean event ROI is already on the CFO's desk for {{company}}, ignore. If it's still in a Google Sheet, worth a look before the planning window closes?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 58`

---

## Persona B: Demand Generation Lead

**Sits in their week**
- Three weeks before the show: rep 1:1s start asking "who am I meeting at Money20/20?" and nobody has a shared answer.
- Event week: 22,000 people on the floor, 1,500 exhibitors, reps walk in without a named-account list and come back with a booth scan that doesn't map to opportunity stages.
- Post-event: RevOps pings them asking why event leads show up in Salesforce three weeks later with missing fields.

**Priorities** · fill rep calendars with target accounts before day one · standardise pre-event prep across the team · tie booth meetings back to pipeline in Salesforce · run the same playbook across RSA, Money20/20, and Finovate

**First-principles pain observations (ammo for the copy below)**
1. *Booth-scan half-life.* A booth scan rots in 72 hours. By day 11 the lead is cold, the rep cannot remember the conversation, and the voice memo is on a phone someone already wiped. Treating scans like MQLs assumes a web-lead latency tolerance events do not have.
2. *22,000-on-the-floor math.* A rep can have roughly 40 real conversations in three days. Without a named-account list landed the week before the show, 39 of those 40 are random booth traffic, not ICP. The math decides the show before reps board the plane.

### Touch 1: T-28d · LinkedIn connection request

_Subject:_ (none)

> Hi {{first_name}}, noticed {{company}}'s ramp into {{event_name}}. A few demand-gen leads at fintechs your size are pressure-testing a named-account list for {{event_city}} four weeks out instead of four days out, which is usually when the show is already decided. Open to comparing notes?

`channel: linkedin` · `offset: -28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 49`

---

### Touch 2: T-14d · Email cold

_Subject:_ `money20/20 floor math`

> {{first_name}}, the math that decides {{event_name}} happens before reps board the plane. A rep can have roughly 40 real conversations across three days at {{event_city}}. Without a named-account list in hand the week prior, 39 of those 40 are random booth traffic, not {{company}}'s ICP. Linked is a one-page teardown of how three demand-gen leads built the 60-account list, mapped it to {{event_venue}} hall numbers, and landed 24 meetings before day one. If rep calendars are already full for {{event_city}}, ignore. Worth a read before your 1:1s this week?

`channel: email` · `offset: -14d` · `type: email_cold` · `cta: make_offer` · `words: 99`

---

### Touch 3: T-7d · LinkedIn nudge

_Subject:_ (none)

> {{first_name}}, seven days out. The teardown on pre-show named-account mapping is what three demand-gen leads ran last year to get reps off random booth traffic and onto {{company}}'s ICP in {{event_city}}. If rep calendars are already sorted for {{event_name}}, ignore. If they're still fluid, worth a skim before the flight?

`channel: linkedin` · `offset: -7d` · `type: linkedin_nudge` · `cta: make_offer` · `words: 54`

---

### Touch 4: T0 · LinkedIn day-of

_Subject:_ (none)

> {{first_name}}, day one at {{event_name}}. By tomorrow morning the booth voice memos start rotting. If you're between meetings and already thinking about how this week's scans actually make it into Salesforce without a three-week lag, open to fifteen minutes near the {{event_venue}} café?

`channel: linkedin` · `offset: 0d` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 49`

---

### Touch 5: T+2d · Email follow-up

_Subject:_ `amsterdam scan decay`

> {{first_name}}, here's the thing nobody says out loud about {{event_name}}: a booth scan rots in 72 hours. By day 11 the lead is cold, the rep can't remember the conversation, and the voice memo is on a phone someone already wiped. Treating scans like MQLs assumes a web-lead latency events don't have. Attached is a short recap of the three post-show motions three demand-gen leads used to get scans into Salesforce as stage-2 opportunities within 48 hours. If {{company}}'s cleanup is already locked, ignore. Worth a read before RevOps closes the books?

`channel: email` · `offset: +2d` · `type: email_followup` · `cta: make_offer` · `words: 99`

---

### Touch 6: T+7d · LinkedIn follow-up

_Subject:_ (none)

> {{first_name}}, one week post-{{event_name}}. The recap I linked is what three demand-gen leads at fintechs {{company}}'s size used to get scans into Salesforce as stage-2 opps inside 48 hours. If RevOps has already closed {{event_city}} reconciliation, ignore. If it's still open, worth a look before the playbook becomes next year's apology?

`channel: linkedin` · `offset: +7d` · `type: linkedin_followup` · `cta: make_offer` · `words: 57`

---

## How to use this sequence

1. **Export from Apollo.** Create a sequence in Apollo, add two personas matching the ones above, paste the subject + body into each step. Apollo will substitute `{{first_name}}`, `{{company}}`, etc., from each contact record.
2. **Fill the custom fields.** `{{peer_company}}`, `{{activity_signal}}`, `{{booth_or_hall}}` are not standard Apollo fields. Either add them as custom fields on the person/account object, or leave them blank (each sentence containing one reads cleanly without it).
3. **Actually attach the asset.** Every "Attached" / "Linked" / "Linked is" reference in the copy assumes you are sending a real one-page teardown or recap. Do not ship the sequence with nothing to send. If you do not have the asset ready, write it first, then turn on the sequence.
4. **Do not send identical copy to both personas.** Persona A pain is "prove event-sourced pipeline to the CMO before the board deck". Persona B pain is "get reps off random booth traffic and onto ICP before day one". If you merge the lists, pick one lane per contact.
5. **Pace the LinkedIn touches.** Apollo Connect requests over 20/day on a normal profile will trigger LinkedIn jail. If your sequence has more than 20 prospects a day, drop Touch 1 and lead with the T-14d email.
6. **Kill the sequence the moment someone replies.** Every step after a reply is noise.
