# Money20/20 Europe 2026 — Email Sequence (VP/Director/Head of Payments)

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
- CTA mix: roadmap-timing (×3), closer-look (×1)
- Illumination-question coverage: 2/4 (touches 1 and 4; followup_2 and followup_3plus do not require one)

## Outbound Research Brief

- **Buyer job:** Reconcile instant-payment authentication, exception handling, and audit evidence across product, risk, and compliance before the Q3 roadmap freeze.
- **Current workaround:** Spreadsheets, rail-specific dashboards, and manual Slack escalations.
- **Hidden risk:** Unclear ownership when exceptions touch both SCA / step-up auth and funds-flow operations.
- **Customer-language pain:** "Who owns this exception?" split across product (auth path) and risk (funds movement); audit evidence scattered.
- **Trigger:** Situation trigger only — Q3 roadmap freeze. Money20/20 Europe is the occasion, not the buyer's reason to care.
- **Proof points:** None approved. Strict mode — no peer references, no before/after numbers, no named customers.
- **Available assets:** None. No attachments, links, one-pagers, or worksheets may be promised.
- **Sender logistics:** Attendance, booth, agenda track, and availability all unknown. No meetup CTAs. No invented sender availability phrasing. No track names. Buyer-timing CTAs only.
- **Likely objection:** "We already have rail-specific dashboards" or "This is a Slack-channel problem, not a platform problem."
- **Cadence feasibility:** Planner returned valid 4-touch timeline (May 11, May 29, June 2, June 6).

---

## Touch 1 — cold_email_first_touch

- **Send date:** 2026-05-11 (T-22)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing

**Subject:** instant pay ownership

**Body:**

{{first_name}}, the exceptions at {{company}} that touch both step-up authentication and funds-flow operations are the awkward ones: product owns the SCA path, risk owns the funds movement, and the audit evidence lives in spreadsheets and rail-specific dashboards. How are you reconciling those two sides today, especially across FedNow, RTP, and SEPA Instant? The piece that keeps surfacing this close to the Q3 roadmap freeze is who actually owns the exception when it crosses both. Is that something you are trying to settle before the freeze, or parked for later?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 2 — cold_email_followup_2

- **Send date:** 2026-05-29 (T-4)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing

**Subject:** exception ownership

**Body:**

{{first_name}}, sent a note a couple of weeks back on the exceptions at {{company}} that cross SCA and funds-flow ownership. The piece that usually surfaces this close to a roadmap freeze: how does your team route an exception when the answer needs both the auth log and the rail-level funds trace, without it turning into a Slack chain for your on-call? If pulling that together across FedNow, RTP, SEPA Instant, and cards is on your Q3 list, is this worth a closer look?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 3 — cold_email_followup_3plus

- **Send date:** 2026-06-02 (T0, event day 1)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing

**Subject:** who owns step-up

**Body:**

{{first_name}}, the cross-rail exceptions at {{company}} that touch SCA and funds-flow ownership tend to surface during roadmap-freeze conversations, not in your weekly. Where is that sitting on your side this week, with product, with risk, or still being argued out?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Touch 4 — post_event_followup

- **Send date:** 2026-06-06 (T+4)
- **Channel:** email
- **Quality band:** 4/5 (ship)
- **Validator:** passing

**Subject:** back to the freeze

**Body:**

{{first_name}}, back at your desk after a week of vendor conversations is usually when the exception-ownership question lands hardest at {{company}}: which roadmap actually picks up the cross-rail SCA and funds-flow work before Q3 closes? What is your working answer this week, and is the audit-evidence side of it being treated as a product problem or a risk problem? Is this on your Q3 list, or parked for later?

Maya Rao
VP Partnerships, Northstar Ledger

---

## Reviewer notes

- The event is named in subject lines and bodies sparingly — Money20/20 Europe is treated as the occasion, not a buyer priority. Touch 3 avoids a same-day event-template opener because sender attendance is unknown.
- No proof points or assets are mentioned anywhere. If proof becomes available before send, touches 1 and 2 are the natural places to add a third-party validation sentence between the illumination question and CTA.
- Touch 3 is intentionally short and pointed; if Maya's actual booth, session, or coffee window becomes known by send time, swap in a real meetup CTA instead of the roadmap-timing question.
- Merge fields: `{{first_name}}` and `{{company}}` must be populated at send time. No real names or companies are hard-coded.
