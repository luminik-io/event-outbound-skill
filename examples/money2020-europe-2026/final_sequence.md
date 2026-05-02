# Outbound Sequence: Money20/20 Europe 2026

**Event:** Money20/20 Europe 2026 · 2-4 June 2026 · RAI Amsterdam
**Industry:** Fintech (payments, identity, fraud, KYC/AML, regtech)
**Company size:** 200-2000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender:** Prasad, Founder at Luminik

## Sequence quality summary

- **Touches:** 12 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 10 top-tier, 0 rewrite
- **CTA mix:** 2 none, 4 make_offer, 6 ask_for_interest
- **Illumination-question coverage:** 83% of touches

> Generated with the `event-outbound` skill running natively inside Claude Code (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs).

---

## Persona: VP Risk and Fraud

**Priorities** · ship a measurable reduction in chargeback rate to the CFO before Q4 close · tune the fraud-rules engine without crushing approval rates on good customers · stand up authorised-push-payment-fraud defenses before the new liability rules bite · run incident postmortems that hold up in regulator review

**Pain points** · rules-vs-models false-positive tradeoff: tightening drops approval rates 4-7 points and Sales escalates within 48 hours; loosening lets through synthetic identities that surface as chargebacks 60 days later · vendor-stack opacity across KYC, device fingerprinting, behavioural, AML screening · model-drift detection is manual: someone runs a query every two weeks; by the time drift surfaces, two weeks of chargebacks have already shipped · executive reporting asks for a fraud-rate number that does not exist

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The Q4 chargeback target you owe your CFO, and how thin the line is between hitting it and tanking approval rates, is the one VP Risk question I keep hearing into Money20/20.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 32` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `q4 chargeback target`

> {{first_name}}, the rules-vs-models tradeoff is the part of the VP Risk job I keep hearing about this quarter: tighten and Sales escalates the approval-rate hit inside 48 hours, loosen and synthetic IDs surface as Q4 chargebacks Finance flags 60 days later. With APP liability rules biting on the other side, how are you sizing that tradeoff at {{company}} now? Adyen and Marqeta cut the false-positive review loop from 60 days to a week without dropping approvals. If the writeup is useful before Money20/20 Europe, it is yours.

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 87` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, model-drift detection comes up in every VP Risk conversation before Money20/20: someone runs the query every two weeks, and by the time drift surfaces, two weeks of chargebacks have shipped. How are you catching drift in real time at {{company}}? Mollie shifted to a same-day drift signal last quarter and watched the loss-budget line stop slipping. If the writeup is useful, it is yours.

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 65` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20 Europe. How are you preparing the APP liability defence for {{company}} ahead of the new rules biting, when the audit trail still lives across three vendor portals? Klarna locked theirs the Monday after the rules were announced.

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 41` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you tracking which fraud-rule changes from this week's panels actually map to the Q4 chargeback number you owe your CFO at {{company}}? Adyen logs that the same hour.

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 35` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 chargeback recap`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is {{company}} planning to defend the Q4 chargeback number to your CFO, when most rule changes shipped at the show take 60 days to surface as loss-budget impact? Marqeta locked their false-positive review window the Monday after the show. If the recap is useful, it is yours.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 53` · `quality: 5.0/5 (top-tier)`

---

## Persona: Head of Compliance / KYC Operations

**Priorities** · close 100% of regulator-flagged KYC gaps before the next audit cycle · cut customer-onboarding latency without dropping below the FinCEN-acceptable verification bar · automate the SAR drafting pipeline so analysts spend hours on real cases · consolidate three vendor portals into one operations dashboard the COO can read

**Pain points** · KYC-vendor-falloff: each vendor gives 85-92% verification pass-rate on its own; stacked in a waterfall the cumulative friction-driven abandon rate is 18-23% · audit trail gaps: regulator asks who decided to onboard a flagged customer and the answer involves screenshots from three vendor portals stitched by a junior analyst at midnight · false-positive rate on enhanced due diligence: 60-70% of EDD cases close as no-action · regulatory reporting cadence misalignment: SARs ship monthly, internal investigations close on a 90-day cycle

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The regulator-asks-who-approved-this-flag question is the one Compliance question I keep hearing into Money20/20, when your audit trail spans three vendor portals.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 21` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `kyc audit cycle`

> {{first_name}}, the regulator-asks-who-approved-this-flag question is the part of the Head of Compliance job I keep hearing about: the audit trail at {{company}} stitches together screenshots from three KYC vendor portals, and the analyst rebuilding it at midnight is the same one trying to clear the SAR backlog. How are you closing that gap on the cycle in front of you? Onfido and TrueLayer rebuilt their decision-trail to one dashboard last quarter and cleared the regulator review without escalation. If the writeup is useful before Money20/20 Europe, it is yours.

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 89` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the KYC-vendor-falloff math keeps coming up before Money20/20 Europe: each vendor passes 85-92% on its own, but the waterfall stacks to an 18-23% friction-driven abandon rate, and Sales blames Compliance at every Monday standup. How are you holding {{company}}'s onboarding latency without dropping below the FinCEN bar? Mollie cut the abandon rate by tightening the waterfall sequence after their last audit. If the writeup is useful, it is yours.

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 70` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of Money20/20 Europe. How are you holding the EDD false-positive rate at {{company}} where 60-70% of cases close as no-action, when your analysts could be chasing real bad actors? Klarna re-tuned theirs after the last audit.

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 38` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at the RAI. How are you mapping the AML-AI panel takeaways back to your SAR drafting pipeline at {{company}}, when reports already lag the actual investigations by two months? Worldpay shipped a same-cycle SAR draft last quarter.

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 39` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `m2020 kyc recap`

> {{first_name}}, Money20/20 Europe wrapped Wednesday. How is your team planning to close the regulator-flagged KYC gaps at {{company}} before the next audit cycle, when the audit trail still stitches across three vendor portals? Onfido locked theirs into one dashboard the Monday after the show. If the recap is useful, it is yours.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 52` · `quality: 5.0/5 (top-tier)`
