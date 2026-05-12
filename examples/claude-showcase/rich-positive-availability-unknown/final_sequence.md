# Money20/20 Europe 2026 - Email Sequence (VP/Director/Head of Payments)

**Status:** Ready for human review. Not cleared for send.
**Sender:** Maya Rao, VP Partnerships, Northstar Ledger
**Event:** Money20/20 Europe 2026 · Amsterdam · June 2-4, 2026
**Today:** May 11, 2026

## Sequence summary

- Total touches: 4 (requested: 4)
- Channel: email only
- Min gap: 4 days · actual gaps: 18d / 4d / 4d
- Mode: strict no-invention (no proof points, no assets, sender attendance unknown)
- Validator status: 4/4 passing on first or second attempt
- Average quality band: 4/5 (ship)
- Score-band counts: 4× ship, 0× top-tier, 0× review, 0× rewrite
- CTA mix: ownership-timing (×2), evidence-gap (×1), scope-question (×1)
- Illumination-question coverage: 2/4 (touches 1 and 4; followup_2 and followup_3plus do not require one)
- Distinct pain-angle coverage: 4/4
- Sequence validator: passing

## Outbound Research Brief

- **Buyer job:** Reconcile instant-payment authentication, exception handling, and audit evidence across product, risk, and compliance before the Q3 roadmap freeze.
- **Current workaround:** Spreadsheets, rail-specific dashboards, and manual Slack escalations.
- **Hidden risk:** Unclear ownership when exceptions touch both SCA / step-up auth and funds-flow operations.
- **Customer-language pain:** "Who owns this exception?" split across product (auth path) and risk (funds movement); audit evidence scattered.
- **Trigger:** Situation trigger only: Q3 roadmap freeze. Money20/20 Europe is the occasion, not the buyer's reason to care.
- **Proof points:** None approved. Strict mode: no peer references, no before/after numbers, no named customers.
- **Available assets:** None. No attachments, links, one-pagers, or worksheets may be promised.
- **Sender logistics:** Attendance, booth, agenda track, and availability all unknown. No meetup CTAs. No invented sender availability phrasing. No track names. Buyer-timing CTAs only.
- **Likely objection:** "We already have rail-specific dashboards" or "This is a Slack-channel problem, not a platform problem."
- **Cadence feasibility:** Planner returned valid 4-touch timeline (May 11, May 29, June 2, June 6).
- **Pain-angle ledger:** Step-up owner -> evidence pack latency -> roadmap queue -> vendor-note translation.

---

## Touch 1 - cold_email_first_touch

- **Send date:** 2026-05-11 (T-22)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing
- **Pain angle:** step-up owner

**Subject:** step-up owner

**Body:**

{{first_name}}, when a step-up decision at {{company}} changes the payment state, ownership can get blurry: product sees authentication, risk sees funds movement, and payments ops gets the exception. How are you deciding who owns the handoff when SCA evidence and payment evidence disagree? The expensive part is the unresolved owner when roadmap tradeoffs start. Is that ownership question worth sorting now, or later?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 2 - cold_email_followup_2

- **Send date:** 2026-05-29 (T-4)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing
- **Pain angle:** evidence pack latency

**Subject:** evidence pack

**Body:**

{{first_name}}, audit evidence at {{company}} can become a scavenger hunt when the auth log, rail trace, and case notes live in different systems. How quickly can your team reconstruct why a payment moved after authentication changed? If that evidence pack still takes manual stitching across instant rails and cards, is the gap worth looking into?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 3 - cold_email_followup_3plus

- **Send date:** 2026-06-02 (T0, event day 1)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing
- **Pain angle:** roadmap queue

**Subject:** roadmap queue

**Body:**

{{first_name}}, when payment-auth cleanup is framed as ops work at {{company}}, it can miss the product roadmap until the next rail change forces it back. Is this on your roadmap, or parked for later?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 4 - post_event_followup

- **Send date:** 2026-06-06 (T+4)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing
- **Pain angle:** vendor-note translation

**Subject:** after the notes

**Body:**

{{first_name}}, after the event, the hard part for your team at {{company}} is turning vendor notes into one ownership decision. If the same auth-change work is still split between payments ops, product, and risk, your team can lose another quarter of reviews nobody can confidently close. Does this belong in the roadmap conversation?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Reviewer notes

- The event is named in subject lines and bodies sparingly: Money20/20 Europe is treated as the occasion, not a buyer priority. Touch 3 avoids a same-day event-template opener because sender attendance is unknown.
- No proof points or assets are mentioned anywhere. If proof becomes available before send, touches 1 and 2 are the natural places to add a third-party validation sentence between the illumination question and CTA.
- Touch 3 is intentionally short and pointed; if Maya's actual booth, session, or coffee window becomes known by send time, swap in a real meetup CTA instead of the roadmap-timing question.
- Merge fields: `{{first_name}}` and `{{company}}` must be populated at send time. No real names or companies are hard-coded.
