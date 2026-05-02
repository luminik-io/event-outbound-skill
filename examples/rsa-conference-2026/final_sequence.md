# Outbound Sequence: RSA Conference 2026

**Event:** RSA Conference 2026 · April 27 - May 1, 2026 · Moscone Center, San Francisco
**Industry:** Cybersecurity (identity verification, fraud, IAM, threat detection)
**Company size:** 200-2000 employees
**Lead time:** 4 weeks · **Channels:** email + linkedin
**Sender:** Prasad, Founder at Luminik

## Sequence quality summary

- **Touches:** 16 total · 0 flagged `rules_violated` · all touches validator-clean
- **Score bands:** 2 ship, 14 top-tier, 0 rewrite
- **CTA mix:** 2 none, 6 make_offer, 8 ask_for_interest
- **Illumination-question coverage:** 87% of touches

> Generated with the `event-outbound` skill running natively inside Claude Code (no external API key required). Every touch validated against [`data/cold-outbound-rules.json`](../../data/cold-outbound-rules.json) and [`data/cold-email-benchmarks.json`](../../data/cold-email-benchmarks.json) via [`scripts/validate-touch.mjs`](../../scripts/validate-touch.mjs): subject ≤4 words lowercase no digits, channel-specific body length, banned-phrase blocklist, LLM-cliche blocklist across 9 hard-ban categories, "you" > "we" pronoun majority, illumination-question requirement on cold email + post-connect DM, sentence-start capitalization in bodies, no em-dashes / exclamations / emoji.

---

## Persona: VP Marketing

**Priorities** · prove event-sourced pipeline to CMO and CFO · build a board-deck-ready attribution slide for the $250K RSA budget line · shorten the gap between booth scan and CRM record · standardise rep prep across regional AE teams before flights

**Pain points** · attribution model inheritance: event attribution at cyber companies typically inherits the inbound stack's last-touch, 90-day window; the booth touch is the third interaction in a nine-month CISO sales cycle, so the $250K RSA line on the P&L reads as sourcing $0 · sponsorship ROI asymmetry: cyber sponsor packages priced on booth footage and stage time, but the number that correlates with closed-won is reply rate in the 21 days post-show · CISO buying-committee opacity: the attendee list shows VP Sec / Director InfoSec / SecOps lead, but the actual signer is a CISO who didn't attend · post-show attribution fade: by week 4 post-RSA, every vendor in the buyer's stack is claiming credit

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The $250K booth line landing on your CMO desk under last-touch 90-day attribution is the one VP Marketing question I keep hearing into RSA. Connecting in case useful.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 28` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `rsa attribution slide`

> {{first_name}}, the $250K RSA line on {{company}}'s P&L will land in front of your CMO under last-touch 90-day attribution, where the booth touch reads as sourcing $0 because it is the third interaction in a nine-month CISO cycle. How are you closing that gap before the QBR? Cloudflare and Okta moved their cyber attribution to a multi-touch window inside Salesforce after Black Hat last year, the slide stopped getting a footnote in two QBRs. If the writeup of the model is useful before the show, it is yours.

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 88` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the CISO buying-committee opacity question keeps coming up before RSA: the attendee list shows VP Sec, Director InfoSec, SecOps Lead, but the actual signer often skipped the show. How are you mapping the rest of the committee for {{company}} ahead of the floor? CrowdStrike rebuilt their committee pre-mapping after Black Hat last year and watched booth-meeting-to-pipeline lift. If the writeup is useful, it is yours.

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 66` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of RSA. How are you closing the gap between booth scan and CRM record for {{company}} this year, when the badge-scan-to-Salesforce link still lives in a CSV at the cyber teams I talk to? Palo Alto closed it in 24 hours after Black Hat.

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 46` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at RSA. How are you logging which CISO buying-committee members showed up at {{company}}'s booth versus skipped, before the post-show attribution debate starts at the QBR? Wiz tracks that in real time.

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 34` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `rsa pipeline number`

> {{first_name}}, RSA wrapped Friday. How is {{company}} planning to defend the $250K booth pipeline number to your CMO before week 4, when the buyer's stack starts claiming credit on the same deal? Cloudflare's marketing ops team locked their booth-touch attribution windows the Monday after RSA last year, the QBR slide held. If the recap of how they did it is useful, it is yours.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 64` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, week one post-RSA. How are you keeping the booth touch out of the post-show attribution fade, before the four-week window collapses {{company}}'s pipeline into last-touch? Okta locked the window on the Monday after Black Hat.

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 36` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `rsa qbr slide`

> {{first_name}}, two weeks post-RSA. How is your QBR slide on {{company}}'s $250K booth line shaping up under last-touch? CrowdStrike locked their booth-attribution model the Tuesday after Black Hat, the QBR slide held. If the model recap is useful, it is yours.

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 41` · `quality: 5.0/5 (top-tier)`

---

## Persona: Demand Generation Lead

**Priorities** · fill rep calendars with target accounts before day one of the show · tie booth meetings back to opportunity stages in Salesforce/HubSpot · run the same pre-event motion across RSA, Black Hat, and re:Invent · kill the spreadsheet step between booth scan and SDR follow-up

**Pain points** · booth-scan half-life: a scan rots in 72 hours; by day 11 the lead is cold, the rep cannot remember the conversation, and the voice memo is on a phone someone already wiped · 45,000-on-the-floor math: a rep can have roughly 35 real conversations across three Moscone days · tooling-stack tax: pre-event prep lives in a Notion doc, the attendee list lives in a CSV, the badge-scan output is in the show vendor's portal, the CRM is in Salesforce · attribution stage-mismatch: SDR books a booth meeting that maps to a Stage 1 opp, but Salesforce only credits the meeting if the AE later disposition-codes it; half the meetings disappear from event ROI by Q3

### Touch 1: T-28d · linkedin_connect

_Subject:_ (none)

> The 35-real-conversations math is the one demand-gen question I keep hearing into RSA, when 45,000 attendees walk the floor and your reps cannot meet most of them. Connecting in case useful.

`channel: linkedin` · `offset: T-28d` · `type: linkedin_connect` · `cta: none` · `words: 31` · `quality: 4.0/5 (ship)`

---

### Touch 2: T-21d · email_cold

_Subject:_ `rsa rep calendar`

> {{first_name}}, the math going into RSA: 45,000 walk the Moscone floor over three days, your reps can have roughly 35 real conversations each. Without a named-account list landed the week before the show, 34 of those 35 are random booth traffic, not ICP. How are you filling rep calendars before day one for {{company}}? CrowdStrike's demand-gen team rebuilt the pre-event motion last year and watched booth-meeting-to-pipeline lift. If the recap is useful, it is yours.

`channel: email` · `offset: T-21d` · `type: email_cold` · `cta: make_offer` · `words: 75` · `quality: 5.0/5 (top-tier)`

---

### Touch 3: T-14d · linkedin_dm_post_connect

_Subject:_ (none)

> {{first_name}}, the booth-scan half-life problem keeps coming up before RSA: a scan rots in 72 hours, by day 11 the lead is cold, the rep cannot remember the conversation, and the voice memo is on a phone someone already wiped. How are you collapsing that gap for {{company}} this year? Wiz cut the scan-to-Salesforce link from days to minutes after Black Hat. If the writeup is useful, it is yours.

`channel: linkedin` · `offset: T-14d` · `type: linkedin_dm_post_connect` · `cta: make_offer` · `words: 70` · `quality: 5.0/5 (top-tier)`

---

### Touch 4: T-7d · linkedin_nudge

_Subject:_ (none)

> {{first_name}}, week of RSA. How are you killing the spreadsheet step between booth scan and SDR follow-up at {{company}}, when prep lives in Notion, attendees in a CSV, and scans in the show vendor portal? Cloudflare wired theirs into one CRM motion.

`channel: linkedin` · `offset: T-7d` · `type: linkedin_nudge` · `cta: ask_for_interest` · `words: 42` · `quality: 5.0/5 (top-tier)`

---

### Touch 5: T0 · linkedin_day_of

_Subject:_ (none)

> {{first_name}}, today at RSA. How are you logging which booth meetings map to a Stage 1 opportunity in real time at {{company}}, before the AE disposition codes wipe half of them by Q3? Okta's RevOps team logs that the same hour.

`channel: linkedin` · `offset: T0` · `type: linkedin_day_of` · `cta: ask_for_interest` · `words: 41` · `quality: 5.0/5 (top-tier)`

---

### Touch 6: T+2d · email_followup

_Subject:_ `rsa scan followup`

> {{first_name}}, RSA wrapped Friday and the 72-hour booth-scan half-life means most leads are already cold by Tuesday. How is your SDR motion catching {{company}}'s scans before the voice-memo wipe? Palo Alto Networks ran their post-show sequencing in three days last year. If the recap is useful, it is yours.

`channel: email` · `offset: T+2d` · `type: email_followup` · `cta: make_offer` · `words: 49` · `quality: 5.0/5 (top-tier)`

---

### Touch 7: T+7d · linkedin_followup

_Subject:_ (none)

> {{first_name}}, week one post-RSA. How are you keeping booth-meeting attribution from being wiped at {{company}} when the AE disposition codes hit Q3 and your event ROI roll-up halves? CrowdStrike locked theirs the Monday after Black Hat.

`channel: linkedin` · `offset: T+7d` · `type: linkedin_followup` · `cta: ask_for_interest` · `words: 36` · `quality: 5.0/5 (top-tier)`

---

### Touch 8: T+14d · email_followup

_Subject:_ `rsa attribution wipe`

> {{first_name}}, two weeks post-RSA. How is your booth-meeting-to-Stage-1 attribution holding up at {{company}}, before the Q3 disposition codes wipe half of your event ROI roll-up? Wiz locked theirs the Tuesday after the show. If the recap is useful, it is yours.

`channel: email` · `offset: T+14d` · `type: email_followup` · `cta: make_offer` · `words: 41` · `quality: 5.0/5 (top-tier)`
