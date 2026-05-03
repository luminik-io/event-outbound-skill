# Outbound Sequence: Money20/20 Europe 2026

**Event:** Money20/20 Europe 2026 · 2-4 June 2026 · RAI Amsterdam
**Target buyer industry:** Fintech (payments, identity, fraud, KYC/AML, regtech)
**Buyer company size:** 200-2000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender (illustrative):** Daniel, Account Executive at Truelink — a fictional fraud-scoring / KYC API used here as an example sender. Replace with your own sender identity at send time.

## Sequence quality summary

- **Touches:** 12 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 10 top-tier
- **CTA mix:** 2 none, 4 make_offer, 6 ask_for_interest
- **Illumination-question coverage:** 83% of touches

> Generated with the `event-outbound` skill running natively inside Claude Code (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

> Note on the assets and percentages referenced in the body of each touch (the false-positive review window, "1.4% to 0.6%", "friction-abandon from 21% to 9%", etc.): these are the *shape* of the proof points a credible sender could attach. Replace with your own real artefacts and numbers at send time.

---

## Persona: VP Risk and Fraud

**Priorities** · ship a measurable reduction in chargeback rate to the CFO before Q4 close · tune the fraud-rules engine without crushing approval rates on good customers · stand up authorised-push-payment-fraud defenses before the new liability rules bite · run incident postmortems that hold up in regulator review

**Pain points** · rules-vs-models false-positive tradeoff (tightening drops approval rates 4-7 points and Sales escalates inside 48 hours; loosening surfaces as Q4 chargebacks 60 days later) · vendor-stack opacity across KYC, device fingerprinting, behavioural, AML screening · model-drift detection is manual: someone runs a query every two weeks; by the time drift surfaces, two weeks of chargebacks have already shipped · executive reporting asks for a fraud-rate number that does not exist (declines? chargebacks? attempt-rate? loss as percent of GMV?)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The Q4 chargeback target you owe your CFO, and how thin the line is between hitting it and tanking approval rates, is the VP Risk question I keep hearing into m2020.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 31` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `q4 chargeback target`

> {{first_name}}, the chargeback number you owe the CFO before Q4 close, and how thin the line is between hitting it and tanking approval rates, is the part of the VP Risk job I keep hearing about this quarter. With APP liability rules biting on the other side, how are you sizing that tradeoff at {{company}} before Q4 board prep? Two payments teams (similar GMV cohort, similar regulator footprint) cut the false-positive review loop from 60 days to a week and dropped chargeback rate from 1.4% to 0.6% without losing approval rates. Worth a conversation at Money20/20?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 96` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, model-drift detection comes up in every VP Risk conversation before Money20/20. Someone runs the query every two weeks, and by the time drift surfaces, two weeks of chargebacks have already shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? A peer payments team shifted to a same-day drift signal last quarter and cut drift-attributable chargebacks 38%. Hosting four risk leads at a Tuesday roundtable on this, hold a seat?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 77` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20. How are you preparing the APP liability defence for {{company}} ahead of the new rules biting, when your audit trail still spans three vendor portals? A peer team locked theirs the Monday after the rules dropped and cleared the first regulator review at 100%, want the one-pager?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 51` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you tracking which fraud-rule changes from this week's panels actually map to the Q4 chargeback number you owe your CFO at {{company}}? Free for ten minutes by the speaker lounge at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 39` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 board prep`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is your team planning to defend the Q4 chargeback line for {{company}} to your CFO, when most rule changes shipped at the show take 60 days to surface as loss-budget impact? A peer payments team locked their false-positive review window the Monday after the show and held the chargeback line at 0.6% through Q4. Worth twenty minutes before your next board prep?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 68` · `quality: 5.0/5 (top-tier)`

---

## Persona: Head of Compliance / KYC Operations

**Priorities** · close 100% of regulator-flagged KYC gaps before the next audit cycle · cut customer-onboarding latency without dropping below the FinCEN-acceptable verification bar · automate the SAR drafting pipeline so analysts spend hours on real cases · consolidate three vendor portals into one operations dashboard the COO can read

**Pain points** · KYC-vendor-falloff (each vendor 85-92% on its own; waterfall stacks to 18-23% friction-driven abandon, Sales blames Compliance every Monday) · audit trail gaps (regulator asks who decided to onboard a flagged customer; the answer involves screenshots from three vendor portals stitched by a junior analyst at midnight) · false-positive rate on enhanced due diligence (60-70% of EDD cases close as no-action) · regulatory reporting cadence misalignment (SARs ship monthly, internal investigations close on a 90-day cycle)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The regulator-asks-who-approved-this-flag question is the Compliance question I keep hearing into Money20/20, when your audit trail spans three vendor portals.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 20` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `kyc audit cycle`

> {{first_name}}, the regulator-asks-who-approved-this-flag question is the part of the Head of Compliance job I keep hearing about. The audit trail at {{company}} stitches together screenshots from three KYC vendor portals, and the analyst rebuilding it at midnight is the same one trying to clear the SAR backlog. How are you closing that gap on the audit cycle in front of you? Two peer fintechs (similar regulated cohort) rebuilt theirs to one decision-trail dashboard last quarter and cleared the regulator review at 100% with zero escalations. Worth fifteen minutes to walk through the dashboard before m2020?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 95` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the KYC-vendor-falloff math keeps coming up before Money20/20. Each vendor passes 85-92% on its own, but the waterfall stacks to an 18-23% friction-driven abandon rate, and Sales blames Compliance every Monday. How are you holding {{company}}'s onboarding latency without dropping below the FinCEN bar? A peer fintech tightened theirs after the last audit and cut friction-abandon from 21% to 9% in one quarter. Want me to walk your COO through how before your next audit cycle opens?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 78` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20. How are you holding the EDD false-positive rate at {{company}}, when 60-70% of cases close as no-action and your analysts could be chasing real bad actors? A peer fintech re-tuned theirs after the last audit and cut EDD false-positives from 64% to 31%, want the one-page on what they cut?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 54` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you mapping the AML-AI panel takeaways back to your SAR-drafting pipeline at {{company}}, when reports already lag the actual investigations by two months? A peer fintech shipped a same-cycle SAR draft last quarter, free for fifteen minutes after the next session?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 48` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 audit recap`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is your team planning to close the regulator-flagged KYC gaps at {{company}} before the next audit cycle, when the audit trail still stitches across three vendor portals? A peer fintech locked theirs into one dashboard the Monday after the show and cleared their next two audit reviews at 100%. Worth thirty minutes with your COO before the cycle opens?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 65` · `quality: 5.0/5 (top-tier)`
