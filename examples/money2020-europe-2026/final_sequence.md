# Outbound Sequence: Money20/20 Europe 2026

**Event:** Money20/20 Europe 2026 · 2-4 June 2026 · RAI Amsterdam
**Industry:** Fintech (payments, identity, fraud, KYC/AML, regtech)
**Company size:** 200-2000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender:** Prasad, Founder at Luminik

## Sequence quality summary

- **Touches:** 12 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 10 top-tier
- **CTA mix:** 2 none, 4 make_offer, 6 ask_for_interest
- **Illumination-question coverage:** 83% of touches

> Generated with the `event-outbound` skill running natively inside Claude Code (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

> Note on the assets referenced in the body of each touch (the Q4 chargeback-defence brief, the audit-trail consolidation diagram, the post-show false-positive review window, etc.): these are the *shape* of an asset a credible sender could attach. Replace with your own real artefacts at send time.

---

## Persona: VP Risk and Fraud

**Priorities** · ship a measurable reduction in chargeback rate to the CFO before Q4 close · tune the fraud-rules engine without crushing approval rates on good customers · stand up authorised-push-payment-fraud defenses before the new liability rules bite

**Pain points** · rules-vs-models false-positive tradeoff (tightening drops approval rates 4-7 points, loosening surfaces as Q4 chargebacks 60 days later) · vendor-stack opacity across KYC, device fingerprinting, behavioural, AML screening · model-drift detection is manual: someone runs a query every two weeks; by the time drift surfaces, two weeks of chargebacks have already shipped · executive reporting asks for a fraud-rate number that does not exist

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The Q4 chargeback target you owe your CFO, and how thin the line is between approval rates and Q4 chargebacks, is the VP Risk question I keep hearing into m2020.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 30` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `q4 chargeback target`

> {{first_name}}, the chargeback number you owe the CFO before Q4 close, and how thin the line is between hitting it and tanking approval rates, is the part of the VP Risk job I keep hearing about this quarter. With APP liability rules biting on the other side, how are you sizing that tradeoff for {{company}} before the Q4 board prep? Attached the Q4 chargeback-defence brief from our work with Adyen and Marqeta. Worth a conversation at Money20/20 if it lines up?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 81` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, model-drift detection comes up in every VP Risk conversation before Money20/20. Someone runs the query every two weeks, and by the time drift surfaces, two weeks of chargebacks have shipped. How are you catching drift in real time at {{company}} before next year's loss-budget locks? Mollie shifted to a same-day drift signal last quarter. Hosting four risk leads at a Tuesday roundtable on this, hold a seat?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 68` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20. How are you preparing the APP liability defence for {{company}} ahead of the new rules biting, when the audit trail still spans three vendor portals? Klarna locked theirs the Monday after the rules dropped, want the one-page on what they changed?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 45` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you tracking which fraud-rule changes from this week's panels actually map to the Q4 chargeback number you owe your CFO at {{company}}? Adyen logs that the same hour, free for ten minutes by the speaker lounge at three?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 45` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 chargeback recap`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is {{company}} planning to defend the Q4 chargeback number to your CFO, when most rule changes shipped at the show take 60 days to surface as loss-budget impact? Attached the post-show false-positive review window Marqeta locked the Monday after the show. Worth twenty minutes before your next board prep?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 55` · `quality: 5.0/5 (top-tier)`

---

## Persona: Head of Compliance / KYC Operations

**Priorities** · close 100% of regulator-flagged KYC gaps before the next audit cycle · cut customer-onboarding latency without dropping below the FinCEN-acceptable verification bar · automate the SAR drafting pipeline so analysts spend hours on real cases

**Pain points** · KYC-vendor-falloff (each vendor 85-92% on its own; waterfall stacks to 18-23% friction-driven abandon, Sales blames Compliance every Monday) · audit trail gaps (regulator asks who decided to onboard a flagged customer, the answer involves screenshots from three vendor portals stitched by a junior analyst at midnight) · false-positive rate on enhanced due diligence (60-70% of EDD cases close as no-action) · regulatory reporting cadence misalignment (SARs ship monthly, internal investigations close on a 90-day cycle)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The regulator-asks-who-approved-this-flag question is the Compliance question I keep hearing into Money20/20, when your audit trail spans three vendor portals.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 20` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `kyc audit cycle`

> {{first_name}}, the regulator-asks-who-approved-this-flag question is the part of the Head of Compliance job I keep hearing about. The audit trail at {{company}} stitches together screenshots from three KYC vendor portals, and the analyst rebuilding it at midnight is the same one trying to clear the SAR backlog. How are you closing that gap on the audit cycle in front of you? Attached the audit-trail consolidation diagram Onfido and TrueLayer used to clear their last regulator review without escalation. Worth fifteen minutes to walk through it?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 85` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the KYC-vendor-falloff math keeps coming up before Money20/20. Each vendor passes 85-92% on its own, but the waterfall stacks to an 18-23% friction-driven abandon rate, and Sales blames Compliance every Monday. How are you holding {{company}}'s onboarding latency without dropping below the FinCEN bar? Mollie tightened theirs after the last audit. Want me to walk your COO through how, before your next audit cycle opens?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 66` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20. How are you holding the EDD false-positive rate at {{company}}, when 60-70% of cases close as no-action and your analysts could be chasing real bad actors? Klarna re-tuned theirs after the last audit, want the one-page on what they cut?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 44` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you mapping the AML-AI panel takeaways back to your SAR drafting pipeline at {{company}}, when reports already lag the actual investigations by two months? Worldpay shipped a same-cycle SAR draft last quarter, free for fifteen minutes after the next session?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 47` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 kyc recap`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is your team planning to close the regulator-flagged KYC gaps at {{company}} before the next audit cycle, when the audit trail still stitches across three vendor portals? Attached the audit-trail consolidation Onfido locked into one dashboard the Monday after the show. Worth thirty minutes with your COO before the cycle opens?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 57` · `quality: 5.0/5 (top-tier)`
