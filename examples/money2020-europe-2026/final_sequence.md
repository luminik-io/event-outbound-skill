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

> Generated with the `event-outbound` skill running natively inside Claude (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

> Note on the assets and percentages referenced in the body of each touch (the false-positive review window, "1.4% to 0.6%", "friction-abandon from 21% to 9%", etc.): these are the *shape* of the proof points a credible sender could attach. Replace with your own real artefacts and numbers at send time.

---

## Persona: VP Risk and Fraud

**Priorities** · ship a measurable reduction in chargeback rate to the CFO before Q4 close · tune the fraud-rules engine without crushing approval rates on good customers · stand up authorised-push-payment-fraud defenses before the new liability rules bite · run incident postmortems that hold up in regulator review

**Pain points** · rules-vs-models false-positive tradeoff (tightening drops approval rates 4-7 points and Sales escalates inside 48 hours; loosening surfaces as Q4 chargebacks 60 days later) · vendor-stack opacity across KYC, device fingerprinting, behavioural, AML screening · model-drift detection is manual: someone runs a query every two weeks; by the time drift surfaces, two weeks of chargebacks have already shipped · executive reporting asks for a fraud-rate number that does not exist (declines? chargebacks? attempt-rate? loss as percent of GMV?)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> {{first_name}}, the Q4 chargeback target and approval-rate tradeoff collide in the same fraud dashboard at {{company}}, and Money20/20 seems relevant. Open to connecting?

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 23` · `quality: 5.0/5 (top-tier)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `q4 chargeback target`

> {{first_name}}, the chargeback number you owe the CFO before Q4 close, and how thin the line is between hitting it and tanking approval rates, is the part of the VP Risk job I keep hearing about this quarter. With APP liability rules biting on the other side, how are you sizing that tradeoff at {{company}} before Q4 board prep? Two payments teams (similar GMV cohort, similar regulator footprint) cut the false-positive review loop from 60 days to a week and dropped chargeback rate from 1.4% to 0.6% without losing approval rates. Worth a conversation at Money20/20?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 96` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, model-drift reviews get painful when someone runs the query every two weeks and two weeks of chargebacks have already shipped by the time drift surfaces. How are you catching drift in real time at {{company}} before next year's loss-budget locks? A peer payments team shifted to a same-day drift signal last quarter and cut drift-attributable chargebacks 38%. If same-day drift review is on your loss-budget list, does this belong in the roadmap conversation?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: ask_for_interest` · `words: 74` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, APP liability prep gets harder when the audit trail still spans three vendor portals. How are you preparing the defence for {{company}} ahead of the new rules biting? Worth looking into if the peer regulator-pass review would help?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 39` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, the RAI fraud-rule panels map back to the Q4 chargeback number you owe your CFO at {{company}}. How are you deciding which panel takeaways become rule changes and which stay as notes? Does this belong in the rule-change conversation while it is fresh?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 44` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `chargeback recap`

> {{first_name}}, after Money20/20 Europe, how is your team defending the Q4 chargeback line for {{company}} to the CFO, when rule changes shipped this month may take 60 days to surface as loss impact? A peer payments team locked their false-positive review window the Monday after the show and held the chargeback line at 0.6% through Q4. I attached the review sheet. Worth looking into?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 64` · `quality: 5.0/5 (top-tier)`

---

## Persona: Head of Compliance / KYC Operations

**Priorities** · close 100% of regulator-flagged KYC gaps before the next audit cycle · cut customer-onboarding latency without dropping below the FinCEN-acceptable verification bar · automate the SAR drafting pipeline so analysts spend hours on real cases · consolidate three vendor portals into one operations dashboard the COO can read

**Pain points** · KYC-vendor-falloff (each vendor 85-92% on its own; waterfall stacks to 18-23% friction-driven abandon, Sales blames Compliance every Monday) · audit trail gaps (regulator asks who decided to onboard a flagged customer; the answer involves screenshots from three vendor portals stitched by a junior analyst at midnight) · false-positive rate on enhanced due diligence (60-70% of EDD cases close as no-action) · regulatory reporting cadence misalignment (SARs ship monthly, internal investigations close on a 90-day cycle)

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> {{first_name}}, the regulator question about who approved a flagged customer should not require screenshots from three KYC portals at {{company}}, and Money20/20 seems relevant. Open to connecting?

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: ask_for_interest` · `words: 27` · `quality: 5.0/5 (top-tier)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `kyc audit cycle`

> {{first_name}}, when a regulator asks who approved a flagged customer, the hard part is rebuilding the audit trail without pulling screenshots from three KYC portals. How are you closing that gap at {{company}} on the audit cycle in front of you? Two peer fintechs rebuilt theirs into one decision-trail dashboard last quarter and cleared the regulator review at 100% with zero escalations. I attached the dashboard outline. Worth a conversation at Money20/20?

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 72` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, KYC waterfall math gets painful when each vendor passes 85-92% on its own but the full flow creates 18-23% friction abandon. How are you holding {{company}}'s onboarding latency without dropping below the FinCEN bar? A peer fintech tightened theirs after the last audit and cut friction-abandon from 21% to 9% in one quarter. I attached the COO version of the review. Worth looking into?

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 65` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, EDD false positives get expensive when 60-70% of cases close as no-action and analysts could be chasing real bad actors. How are you holding that rate at {{company}} this quarter? Worth looking into if the peer EDD review would help?

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 41` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, the AML and SAR sessions at the RAI map directly to drafting lag when reports trail investigations by two months. How are you deciding what should change in {{company}}'s pipeline after the event? Does this belong in the SAR pipeline conversation while it is fresh?

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 46` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `kyc audit recap`

> {{first_name}}, after Money20/20 Europe, how is your team planning to close the regulator-flagged KYC gaps at {{company}}, when the audit trail still stitches across three vendor portals? A peer fintech locked theirs into one dashboard after the show and cleared the next two audit reviews at 100%. I attached the audit-trail diagram. Worth looking into?

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 55` · `quality: 5.0/5 (top-tier)`
