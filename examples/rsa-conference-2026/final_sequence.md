# Outbound Sequence: RSA Conference 2026

**Event:** RSA Conference 2026 · April 27 - May 1, 2026 · Moscone Center, San Francisco
**Target buyer industry:** Mid-market SaaS (the buyer of a cloud-runtime / ITDR vendor)
**Buyer company size:** 500-5000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender (illustrative):** Maya, Account Executive at Anchored — a fictional cloud-runtime / ITDR vendor used here as an example sender. Replace with your own sender identity at send time.

## Sequence quality summary

- **Touches:** 16 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 14 top-tier
- **CTA mix:** 2 none, 6 make_offer, 8 ask_for_interest
- **Illumination-question coverage:** 81% of touches

> Generated with the `event-outbound` skill running natively inside Claude Code (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) and [`data/cold-email-benchmarks.json`](../../data/cold-email-benchmarks.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

> Note on the assets and percentages referenced in the body of each touch (the runtime-stack consolidation map, "41% drop in tier-1 alert volume", "breach-readiness from 71 to 84", etc.): these are the *shape* of the proof points a credible sender could attach. Replace with your own real artefacts and numbers at send time.

---

## Persona: Director of Security Engineering

**Priorities** · ship measurable reduction in mean-time-to-detect for production runtime threats · stand up identity-threat-detection coverage before the next SOC2 audit · rationalise the runtime-security stack down from 4 vendors to 2 without losing coverage · keep the SOC tier-1 alert backlog under 200 open at end-of-shift

**Pain points** · rule-decay loop (stale detection rules ship as alert volume against tier-1 analysts already running hot; cost shows up in tier-1 attrition two quarters later) · alert-fatigue blast radius (60-70% of tier-1 alerts close as no-action) · tooling-stack overlap (EDR + CSPM + CWPP + ITDR each surface the same exec-server CVE three different ways) · audit-board pressure (board asks "would we catch a SolarWinds-style supply-chain alert" and the answer takes the team until Tuesday)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The rule-decay loop, where stale detection rules ship as alert volume against your tier-1 analysts already running hot, is the question I keep hearing from Directors of Security Engineering into RSA.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 31` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `rsa runtime stack`

> {{first_name}}, the tooling-stack overlap question keeps coming up before RSA: EDR + CSPM + CWPP + ITDR each surface the same exec-server CVE from a different angle on the same Monday, and your team cannot point to a canonical dashboard. How are you rationalising that for {{company}} ahead of the SOC2 cycle? Two security teams (similar headcount, similar SaaS regulated cohort) cut runtime tooling from 4 vendors to 2 last year and dropped tier-1 alert volume 41% with no detection-coverage gap. Worth fifteen minutes to walk through what they cut?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 90` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the alert-fatigue blast radius keeps coming up before RSA. 60-70% of tier-1 alerts close as no-action, and the analyst hours go to confirming benign traffic instead of chasing a real lateral-movement pattern; the cost shows up in tier-1 attrition two quarters later. How are you holding the SOC backlog under 200 open at end-of-shift for {{company}}? Hosting four detection-engineering leads at a Tuesday roundtable on this, hold a seat?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 70` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of RSA. How are you standing up identity-threat-detection coverage at {{company}} before the next SOC2 cycle, when the runtime-security stack already has four vendors surfacing the same CVE three different ways? Open to coffee at the show on what two peer SaaS teams cut to clear it?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 49` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at RSA. How are you tracking which detection-engineering panel takeaways actually map to the SOC2 audit gap in front of you at {{company}}, when the buyer's stack already has four vendors? Free for ten minutes by the keynote stage at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 43` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `rsa runtime recap`

> {{first_name}}, RSA wrapped Friday. How is {{company}} planning to close the runtime-security gap before the SOC2 cycle, when the four-vendor stack still surfaces the same exec-server CVE three different ways on a Monday? Two peer SaaS teams locked their consolidation the Monday after RSA last year and cleared the next audit with zero exceptions. Worth twenty minutes this week before your audit-prep window opens?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 64` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, week one post-RSA. How are you holding the SOC tier-1 backlog under control at {{company}}, before alert fatigue shows up as named-replacement risk in your end-of-quarter retention review? A peer team cut tier-1 close-as-no-action from 64% to 28% by the end of last year, want the one-page on what they tuned?

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 52` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `rsa soc2 prep`

> {{first_name}}, two weeks post-RSA. How is your SOC2 audit-prep window shaping up at {{company}}, with the runtime-security stack still surfacing the same CVE across four dashboards? Sending the audit-prep checklist two peer SaaS teams used last quarter to clear the next review with zero exceptions. Worth a quick read before your audit-prep window opens?

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 54` · `quality: 5.0/5 (top-tier)`

---

## Persona: VP Security

**Priorities** · report a breach-readiness score the board recognises without footnotes every quarter · consolidate cyber spend by 15-25% in next-year budget without dropping coverage · retain the SOC team through Q4 (named replacement risk for two senior analysts) · land the next SOC2 Type II audit with zero exceptions

**Pain points** · board-question latency (a SolarWinds-style supply-chain headline lands Friday; the answer takes the team until Tuesday and lives in a sharepoint doc nobody opens) · vendor-sprawl ROI (cyber budget grew 18% YoY and the breach-readiness score did not; the CFO asks why at every QBR) · tier-1 burnout (30%+ analyst attrition in 12 months; the runbook lives in someone's head) · audit-trail gaps (auditor asks "who approved this exception in production" and the answer involves a junior analyst stitching screenshots from three vendor consoles at midnight)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The board-question-latency problem (when "are we exposed to the news of the week?" lands Friday and your team gets to the answer Tuesday) is the VP Security question I keep hearing into RSA.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 33` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `rsa cyber budget`

> {{first_name}}, the cyber-budget conversation in front of {{company}}'s CFO at the next QBR usually goes the same way: spend grew 18% YoY, the breach-readiness score did not move, and the CFO asks why. How are you sizing the consolidation case for next-year budget without dropping detection coverage? Two peer security teams (mid-market SaaS, similar regulated cohort) cut cyber tooling spend 22% last year and lifted breach-readiness score from 71 to 84. Worth fifteen minutes on the consolidation map before RSA?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 80` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the tier-1 burnout signal keeps coming up before RSA: 30%+ analyst attrition in 12 months, the runbook lives in one senior head, and the cyber-tooling stack still surfaces the same alert across four dashboards. How are you holding the SOC team through Q4 at {{company}}, when named-replacement risk is already on the QBR slide? Two peer VPs (similar SaaS regulated cohort) cut tier-1 close-as-no-action 36% last year and held attrition. Hosting a small CISO roundtable Tuesday afternoon, hold a seat?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 81` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of RSA. How are you preparing the board breach-readiness slide for {{company}}'s next quarterly review, with cyber spend up 18% and the readiness score flat? Two peer VPs cut tooling spend 22% and lifted readiness from 71 to 84, want the consolidation map?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 45` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at RSA. How are you mapping the supply-chain panel takeaways back to the breach-readiness gap your auditor flagged at {{company}}, when the stack still leaves SOC2 exceptions in three vendor consoles? Free for ten minutes by the speaker lounge at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 43` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `rsa board deck`

> {{first_name}}, RSA wrapped Friday. How is your next-quarter board breach-readiness slide for {{company}} shaping up, with cyber spend up 18% and the readiness score holding flat? Two peer VPs locked their consolidation map the Monday after RSA last year, cut tooling spend 22%, and lifted breach-readiness from 71 to 84. Worth thirty minutes before your board prep window opens?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 59` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, week one post-RSA. How is the SOC2 audit-trail gap holding up at {{company}}, when the next regulator question lands and your team is stitching the answer across three vendor consoles? Two peer teams locked theirs the Monday after the show and cleared the next review at zero exceptions, want the audit-trail consolidation map?

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 54` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `rsa cfo number`

> {{first_name}}, two weeks post-RSA. How is the cyber-spend-to-breach-readiness number shaping up for your next CFO review at {{company}}? Sending the consolidation map two peer security teams used to cut tooling spend 22% and lift breach-readiness from 71 to 84 last year. Worth a quick read before your CFO review locks?

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 50` · `quality: 5.0/5 (top-tier)`
