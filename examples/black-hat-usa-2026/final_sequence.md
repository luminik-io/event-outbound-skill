# Outbound Sequence: Black Hat USA 2026

**Event:** Black Hat USA 2026 · August 1-6, 2026 · Mandalay Bay, Las Vegas
**Target buyer industry:** Mid-market SaaS (the buyer of a cloud-runtime / ITDR vendor)
**Buyer company size:** 500-5000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender (illustrative):** Maya, Account Executive at Anchored — a fictional cloud-runtime / ITDR vendor used here as an example sender. Replace with your own sender identity at send time.

## Sequence quality summary

- **Touches:** 16 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 14 top-tier
- **CTA mix:** 2 none, 6 make_offer, 8 ask_for_interest
- **Illumination-question coverage:** 81% of touches

> Generated with the `event-outbound` skill running natively inside Claude (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) and [`data/cold-email-benchmarks.json`](../../data/cold-email-benchmarks.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

> Note on the assets and percentages referenced in the body of each touch (the runtime-stack consolidation map, "41% drop in tier-1 alert volume", "breach-readiness from 71 to 84", etc.): these are the *shape* of the proof points a credible sender could attach. Replace with your own real artefacts and numbers at send time.

---

## Persona: Director of Security Engineering

**Priorities** · ship measurable reduction in mean-time-to-detect for production runtime threats · stand up identity-threat-detection coverage before the next SOC2 audit · rationalise the runtime-security stack down from 4 vendors to 2 without losing coverage · keep the SOC tier-1 alert backlog under 200 open at end-of-shift

**Pain points** · rule-decay loop (stale detection rules ship as alert volume against tier-1 analysts already running hot; cost shows up in tier-1 attrition two quarters later) · alert-fatigue blast radius (60-70% of tier-1 alerts close as no-action) · tooling-stack overlap (EDR + CSPM + CWPP + ITDR each surface the same exec-server CVE three different ways) · audit-board pressure (board asks "would we catch a SolarWinds-style supply-chain alert" and the answer takes the team until Tuesday)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> Rule ownership after the original writer moves teams is close to work I am doing with security teams headed to Black Hat. I would value being connected here.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 28` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `runtime stack`

> {{first_name}}, when runtime tools surface the same CVE from four dashboards, the hard part is deciding which system owns the answer. How are you rationalising that for {{company}} ahead of the SOC2 cycle without adding more tier-1 review work? Two peer SaaS teams cut runtime tooling from four vendors to two last year and dropped tier-1 alert volume 41% with no coverage gap. I attached the consolidation map. Worth a coffee at Black Hat if this is on your audit list?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 81` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, when 60-70% of tier-1 alerts close as no-action, the cost is not just queue size; it is analyst time and attrition. How are you holding the SOC backlog under 200 open at end-of-shift for {{company}}? I am hosting four detection-engineering leads Tuesday afternoon on rule ownership and alert volume. Worth a seat if this is on your Q4 list?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 70` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, identity-threat coverage is easy to promise and hard to prove when the runtime stack already has four tools surfacing the same CVE. How are you deciding which signal at {{company}} gets trusted in the SOC2 evidence trail? Worth a coffee at Black Hat if this is on your SOC2 list?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 51` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, the Black Hat Briefings line up with the SOC2 evidence gap you are carrying at {{company}}. How are you deciding which takeaway becomes an actual rule review when the stack already has four sources? Worth a coffee near the Business Hall at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 43` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `runtime recap`

> {{first_name}}, the Black Hat runtime-security conversations kept returning to ownership: four tools can surface the same CVE, but one team still has to defend the answer in SOC2 prep. How is {{company}} closing that gap before the audit window opens? Two peer SaaS teams locked their consolidation map after last year's show and cleared the next review with zero exceptions. I attached the map we discussed.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 66` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, alert fatigue usually shows up as named-replacement risk after the queue has already become normal. How are you holding the SOC tier-1 backlog under control at {{company}} this quarter? I attached the one-page tuning review a peer team used to cut close-as-no-action from 64% to 28%.

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 52` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `soc2 prep`

> {{first_name}}, SOC2 prep gets harder when the same CVE still appears across four dashboards and nobody owns the final answer. How is your audit-prep window shaping up at {{company}}? I attached the checklist two peer SaaS teams used last quarter to clear the next review with zero exceptions. Is this useful for the audit window in front of you?

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 54` · `quality: 5.0/5 (top-tier)`

---

## Persona: VP Security

**Priorities** · report a breach-readiness score the board recognises without footnotes every quarter · consolidate cyber spend by 15-25% in next-year budget without dropping coverage · retain the SOC team through Q4 (named replacement risk for two senior analysts) · land the next SOC2 Type II audit with zero exceptions

**Pain points** · board-question latency (a SolarWinds-style supply-chain headline lands Friday; the answer takes the team until Tuesday and lives in a sharepoint doc nobody opens) · vendor-sprawl ROI (cyber budget grew 18% YoY and the breach-readiness score did not; the CFO asks why at every QBR) · tier-1 burnout (30%+ analyst attrition in 12 months; the runbook lives in someone's head) · audit-trail gaps (auditor asks "who approved this exception in production" and the answer involves a junior analyst stitching screenshots from three vendor consoles at midnight)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The board question after a supply-chain headline lands Friday, and why the answer takes until Tuesday, is close to work I am doing with security leaders going to Black Hat.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 30` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `cyber budget`

> {{first_name}}, when cyber spend is up 18% and the breach-readiness score is flat, the CFO question gets very direct. How are you sizing the consolidation case for next-year budget at {{company}} without dropping detection coverage? Two peer security teams cut tooling spend 22% last year and lifted breach-readiness from 71 to 84. I attached the consolidation map. Worth a coffee at Black Hat if this is on your budget review?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 70` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, 30%+ analyst attrition in 12 months usually means the runbook lives with one senior person and the tooling stack keeps creating repeat work. How are you holding the SOC team through Q4 at {{company}} when named-replacement risk is already on the QBR slide? I am hosting a small CISO roundtable Tuesday afternoon on close-as-no-action volume. Worth a seat?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 81` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, the board breach-readiness slide gets uncomfortable when spend is up and the readiness score stays flat. How are you preparing {{company}}'s next quarterly review without adding another tooling layer? I attached the consolidation map two peer VPs used to cut spend and lift readiness.

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 45` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, the Black Hat supply-chain sessions map closely to the breach-readiness gap your auditor flagged at {{company}}. How are you deciding which takeaway becomes evidence for the next SOC2 review? Worth a coffee near the Business Hall at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 39` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `board deck`

> {{first_name}}, the Black Hat conversations on breach readiness kept coming back to the CFO number: spend up, readiness flat, and no simple way to show what changed. How is your next-quarter board slide for {{company}} shaping up? Two peer VPs used the attached consolidation map to cut tooling spend 22% and lift readiness from 71 to 84.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 57` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, the SOC2 audit-trail gap gets expensive when the next regulator question lands and the answer still lives across three vendor consoles. How is that holding up at {{company}}? I attached the audit-trail consolidation map two peer teams used to clear the next review with zero exceptions.

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 54` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `cfo number`

> {{first_name}}, cyber-spend-to-breach-readiness is a hard number to defend when each tool shows a different version of coverage. How is that shaping up for your next CFO review at {{company}}? I attached the consolidation map two peer security teams used to cut tooling spend 22% and lift readiness from 71 to 84.

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 50` · `quality: 5.0/5 (top-tier)`
