# Josh Braun frameworks (canonical reference)

> Source: Josh Braun's public materials at `/Users/batman/Downloads/Josh_Braun/`. This document is the structured encoding of his frameworks for use by the event-outbound skill prompt + validators + evals.
>
> Sources cited inline use the format `(source: <filename>:<line-range>)` for transcripts and `(source: JTBD-pdf:<page>)` for the PDF. CSV-derived findings cite `(source: LinkedIn-CSV:<sheet>:<row>)` where useful.

---

## TL;DR

Josh Braun's outbound philosophy is **"shine a light on a problem the prospect doesn't know they have, and let them discover the value themselves."** Prospects are biased against salespeople (they have "commission breath"), so persuasion ("we're the best", "10x your revenue") triggers what he calls the **zone of resistance**. The way out is the **4T framework**: a personally-relevant Trigger, a neutral Think question (an "illumination question") that makes the reader scratch their head, Third-party validation that does the boasting for you, and a single bridging sentence on how it works — closed with a low-pressure interest-based CTA, not a meeting ask.

---

## Hard rules (validator-enforceable)

Every rule below is mechanically testable. Each one is tagged with where it came from and whether it's already in `cold-email-benchmarks.json` (CEB) or needs a new home.

| # | Rule | Assertion | Source | Status |
|---|---|---|---|---|
| H1 | Subject line length | ≤ 4 words | `How_to_write_subject_lines_Josh_Braun.txt:17-22` | In CEB ✅ |
| H2 | Subject line case | All lowercase | (Lavender data + JB cadence) | In CEB ✅ |
| H3 | Subject line numbers | No digits | (CEB) | In CEB ✅ |
| H4 | Subject line social proof | No "Used by Google" / brand-drop in subject | (CEB) | In CEB ✅ |
| H5 | Email body length | 50-100 words, 3-4 sentences | `Josh_Braun_Cold_Email_Messages.txt:561-563` ("literally four to five sentences") | In CEB ✅ |
| H6 | No moon-and-stars | Ban "if I could 10x your revenue", "if I told you something interesting", "would you be interested" lead-questions | `4T_framework_cold_email_Josh_Braun.txt:47-62` | **NEW — add to CEB banned phrases** |
| H7 | No biased self-claims | Ban "we're the best", "we're the only", "industry-leading", "award-winning" | `4T_framework_cold_email_Josh_Braun.txt:14-30`; `How_to_construct_an_effective_cold_email_Josh_Braun.txt:64-74` | Partially in CEB; add "we're the best", "we're the only", "award-winning" |
| H8 | No leading questions | Ban "If I could…would you be interested?" pattern (verb-phrase + "would you be interested") | `4T_framework_cold_email_Josh_Braun.txt:55-62` | **NEW heuristic** |
| H9 | No premature meeting ask | First touch must NOT include "15 minutes", "30 minutes", "book a call", "schedule a meeting", "calendar link" | `Josh_Braun_Cold_Email_Messages.txt:608-625`; CTA-ranking data | In CEB (CTA ranking); add explicit phrase ban |
| H10 | No "happy to" sales cliché | "happy to send", "happy to share", "happy to chat" | (CEB inherited) | In CEB ⚠️ — but note JB himself uses bare "happy to" in CSV (3 hits). Keep banned for skill output only when followed by send/share/chat/connect. |
| H11 | No exclamation marks | Zero `!` in body or subject | (CEB) | In CEB ✅ |
| H12 | No emoji | Zero emoji | (CEB) | In CEB ✅ |
| H13 | Pronoun ratio | "you/your" count ≥ "we/our/I/my" count in body | (CEB) | In CEB ✅ |
| H14 | LinkedIn connection request length | ≤ 200 chars (≈25-40 words). Premium can go to 300, but default to 200 for portability. | LinkedIn platform constraint; cross-checked against JB's short-form posts (`LinkedIn-CSV` posts under 50 words) | **NEW — channel-specific length rule** |
| H15 | LinkedIn DM (post-connect) length | 50-120 words. JB's reference DM example is 32 words (`Josh, looks like your podcast episodes are under five minutes…`) (source: `LinkedIn-CSV:Sheet1`) | LinkedIn 1300-char ceiling, JB cadence | **NEW — channel-specific length rule** |
| H16 | LinkedIn day-of nudge | 30-60 words; reference a concrete time + place; one CTA | Inferred from JB's "lean back / not desperate" CTA principle (`Josh_Braun_Cold_Email_Messages.txt:614-672`) | **NEW** |
| H17 | No gating language | Ban "want me to send", "yours to keep", "if it's of interest" | (CEB) | In CEB ✅ |
| H18 | No defensive throat-clearing | Ban "not a pitch", "no strings", "no pressure" | (CEB) | In CEB ⚠️ — note JB DOES use "low-pressure" / "low pressure" (~7 hits). Distinguish: ban defensive *opener*, allow descriptive *adjective*. |
| H19 | One problem per email | Each email isolates ONE pain — don't mash multiple value props in one touch | `Josh_Braun_Cold_Email_Messages.txt:758-789` | **NEW — eval-graded** (hard for a regex; LLM-judge) |
| H20 | Em-dash policy (workspace override) | Workspace `CLAUDE.md` bans em-dashes in agent output. JB himself uses 382 em-dashes in his LinkedIn corpus. **Resolution:** keep banned in skill output (workspace wins); convert any JB-quoted em-dash to comma or period when emitting. | Workspace `CLAUDE.md`; JB CSV (382 em-dashes) | **DOCUMENTED conflict — already enforceable via workspace policy** |

---

## Soft principles (eval-graded, not validator)

These cannot be regex'd. They need an LLM judge against canonical examples.

| # | Principle | Rough heuristic | Source |
|---|---|---|---|
| S1 | Trigger relates to the problem | The Trigger sentence and the Think sentence must "elegantly tie together." JB's bad example: "Hey Josh notice you went to Florida State University how are you ensuring cold emails don't land in spam." (`4T_framework_cold_email_Josh_Braun.txt:199-204`) | 4T transcript |
| S2 | Question is genuinely neutral | The Think question must not betray the seller's preferred answer. Test: would the prospect feel "led" or "asked"? | `4T_framework_cold_email_Josh_Braun.txt:64-83`; `How_to_poke_the_bear_Josh_Braun.txt:40-50` |
| S3 | Third-party validation uses contrast | "94% vs 12%" is sharper than "94%". JB: "It's the contrast that sells." | `4T_framework_cold_email_Josh_Braun.txt:213-222` |
| S4 | Customer language, not marketing language | Pull "before/after" copy verbatim from case-study quotes; avoid "award-winning"-style filler | `How_to_construct_an_effective_cold_email_Josh_Braun.txt:39-92` |
| S5 | Specific & crispy beats vague | "in 5 minutes instead of 5 hours" beats "60x faster"; "$23/month forgotten subscriptions" beats "save money" | `Josh_Braun_Cold_Email_Messages.txt:561-583` |
| S6 | Lean-back CTA energy ("Regina-ish") | The CTA should feel uninterested in the deal. "Worth a look?" beats "Want to grab 15 min?" | `Josh_Braun_Cold_Email_Messages.txt:614-672` |
| S7 | Address the primary objection inline | "Even if you have an accountant" — pre-empt the most likely "I already have one" rejection with a fragment | `Josh_Braun_Cold_Email_Messages.txt:351-366` |
| S8 | Voice authenticity | Reads like a peer texting a peer, not a marketer. Sentence cadence: short. ~7 words/sentence median. | `LinkedIn-CSV` corpus stats (below) |
| S9 | Personal beats personalized when no signal | "End of month and lots of commissions to pay" (situation-true, not profile-true) is acceptable when no LinkedIn hook exists | `How_to_construct_an_effective_cold_email_Josh_Braun.txt:107-165` |

---

## The 4T framework (canonical email structure)

Every cold email has four parts, each starting with a T. Source: `4T_framework_cold_email_Josh_Braun.txt:116-243`.

### 1. Trigger — *Why this person, why now?*
A specific observation about the prospect that ladders back to what you sell. JB lists ~9 trigger types; the canonical examples are:

- **Technology trigger**: "Looks like you're using Salesloft." (source: `4T_framework_cold_email_Josh_Braun.txt:147-156`)
- **Open-position trigger**: "Seems like you're doubling your outbound team over the next 12 months which suggests you're sending lots of cold emails." (source: `4T_framework_cold_email_Josh_Braun.txt:163-178`)
- **Hiring trigger**: "Notice you're hiring SDRs which suggests you might be sending lots of cold emails." (source: `4T_framework_cold_email_Josh_Braun.txt:175-178`)
- **Situation trigger** (when no profile signal): "End of the month and lots of commissions to pay." (source: `How_to_construct_an_effective_cold_email_Josh_Braun.txt:155-165`)

The deduction pattern is **A → which suggests B**. The trigger A is observable; the deduction B is the bridge to the problem. JB: *"I'm taking that trigger event and I'm making a deduction. If A then B is probably true."* (source: `4T_framework_cold_email_Josh_Braun.txt:168-178`)

### 2. Think — *the illumination question*
A neutral question that shines a light on a problem the prospect probably doesn't know they have, designed to make them scratch their head and think *"I'm not sure — what do you mean?"* (source: `4T_framework_cold_email_Josh_Braun.txt:67-95`)

JB on what makes it work:
- Starts with **how / what / why are you** (`4T_framework_cold_email_Josh_Braun.txt:84-89`)
- Not pitching, not persuading, just neutral
- The question's job is to make the prospect *want to read the next sentence*

Canonical examples:
- "How are you ensuring your wash mitt won't scratch your car?" (grit guard / car wash)
- "How are you reducing the risk of plantar fasciitis caused by 10-mile runs?" (insoles)
- "How are you ensuring you're not paying for subscriptions you forgot about?" (Truebill)
- "How are you ensuring cold emails don't land in spam?" (Warmbox)

### 3. Third-party validation — *let other people toot your horn*
One sentence naming similar companies + a contrast number. JB: *"We cannot toot our own horns. What we can do is let other people toot them for us."* (source: `4T_framework_cold_email_Josh_Braun.txt:206-225`)

Canonical example: *"Google and Salesforce are using us to deliver 94% of cold emails to inboxes compared to 12% before."* The contrast (94% vs 12%) is what sells. (source: `4T_framework_cold_email_Josh_Braun.txt:213-225`)

Then a **single bridging sentence** explaining how it works: *"It involves a warm-up tool that raises your inbox reputation to boost deliverability."* One sentence. Crispy. Specific. (source: `4T_framework_cold_email_Josh_Braun.txt:226-240`)

### 4. Talk? — *interest-based CTA, with a question mark*
Don't assume they want to talk. Test interest first.

JB-approved closers:
- "Worth a conversation?" (source: `How_to_construct_an_effective_cold_email_Josh_Braun.txt:285-290`)
- "Worth a look?" / "Worth a peek sometime?" (source: `Josh_Braun_Cold_Email_Messages.txt:666-672`)
- "Worth an exchange?" (source: `Josh_Braun_Cold_Email_Messages.txt:362-366`)
- "Open to learning more?" (source: `LinkedIn-CSV` 4T post)
- "Want to try it?" / "Think this might help?" (source: `Josh_Braun_Cold_Email_Messages.txt:560`)

Banned closers:
- "Do you have 15 minutes?"
- "Would you be open to a 30-minute call?"
- "Can we book time on your calendar?"

### Worked examples

**Example A — Warmbox** (4T transcript, lines 175-240):
> noticed you're hiring SDRs which suggests you might be sending lots of cold emails. how are you ensuring cold emails don't land in spam? Google and Salesforce are using us to deliver 94% of cold emails to inboxes compared to 12% before. it involves a warm-up tool that raises your inbox reputation to boost deliverability.

**Example B — CaptivateIQ** (`How_to_construct_an_effective_cold_email_Josh_Braun.txt`):
> Steve — end of the month and lots of commissions to pay. curious how are you dealing with the labor-intensive error-prone process of hard pasting Excel pages into Google Sheets running commissions? Gong is using CaptivateIQ to run monthly commissions in 5 minutes instead of 5 hours. no rebuilding individual Google Sheets, manual entry, or customizing reports. worth the conversation?

**Example C — TitanX** (JB's own LinkedIn 4T post, source: `LinkedIn-CSV:Sheet1`):
> Pete — looks like you have 9 SDRs cold calling Directors of Benefits and CHROs. how are you giving your reps more at bats? SDRs using TitanX have 6-8 conversations every 50 dials, compared to 1-2 before. we identify the people most likely to answer. no long-term contracts or new tech to implement. open to learning more?

**Example D — Truebill** (`Josh_Braun_Cold_Email_Messages.txt:539-577`):
> looks like you just cut the cord which suggests you subscribed to Netflix, Hulu, YouTube Premium. how do you know you're not overpaying for subscriptions you forgot about? built an app it's being used by over 3,000 cord cutters that shows all subscriptions in one place and lets them cancel the ones they don't want with a click. worth a conversation?

---

## Subject line rules

Source: `How_to_write_subject_lines_Josh_Braun.txt:1-130` and `Josh_Braun_Cold_Email_Messages.txt:155-204`.

**Validator-friendly rules:**
- ≤ 4 words (subject lines longer than 4 perform worse) (source: `How_to_write_subject_lines_Josh_Braun.txt:17-22`)
- All lowercase, casual register (source: implied throughout, JB writes "via Amanda" not "Via Amanda")
- No digits ("save 30%")
- No social proof in the subject ("How Google uses us")
- Not a complete sentence — it's a fragment that opens a loop

**JB's canonical patterns:**
1. **Referral** — "via Amanda", "Bob sent me" (highest open rate, ~95% — but requires a real connection)
2. **Open loop** — "open to this?", "seen this?", "heard of this?" (peaks curiosity)
3. **Hobby/affinity drop** — "pancakes", "wine connoisseur" (only if you can tie it back in the body)
4. **Problem name** — "arthritis?", "low cold email response rates?" (if the problem itself is the hook)
5. **Job-to-be-done at company** — "comp at Gong", "AE for Mark" (when the noun + name combo is intriguing)
6. **Where-they-worked / where-they-work** — "Shellyvision → Basecamp" (for recruiter-style outreach)
7. **The audacity** — "the audacity of this email" (curiosity-bait, must pay off in the body)
8. **Two-noun riddle / rule of three** — "your streaming service bill", "Abdul + podcast + mother-in-law" (expected + expected + unexpected)

**Banned in subject lines:**
- "Quick question" (in CEB banned list)
- "Following up", "Checking in"
- Anything that completes the sentence — leave the loop open
- Hype: "10x", "transform", "game-changer"

---

## Illumination question patterns

The Think sentence is the hardest part of the framework. JB calls these **illumination questions** — they "shine a light on a problem so other people can come to their own conclusions" (source: `4T_framework_cold_email_Josh_Braun.txt:84-100`).

**Starter templates** (extracted from across all sources):

1. **"How are you ensuring [bad outcome] doesn't [happen]?"**
   - "How are you ensuring your wash mitt won't scratch your car?" (4T:78)
   - "How are you ensuring cold emails don't land in spam?" (4T:188)
   - "How are you ensuring you're not paying for subscriptions you forgot about?" (4T:107)

2. **"How are you reducing the risk of [bad outcome] caused by [trigger context]?"**
   - "How are you reducing the risk of plantar fasciitis caused by 10-mile runs?" (4T:91)

3. **"How are you dealing with [specific painful current process]?"**
   - "How are you dealing with the labor-intensive error-prone process of hard pasting Excel pages into Google Sheets running commissions?" (How_to_construct:198-203)

4. **"How are you [current activity] without [hidden problem]?"**
   - "How do you know you're not overpaying for subscriptions you forgot about?" (variant) (Cold_Email_Messages:545)

5. **"How are you giving your reps more [resource]?"**
   - "How are you giving your reps more at bats?" (TitanX example, LinkedIn-CSV)

6. **"What are you doing to [prevent problem] / [pursue opportunity]?"** (4T:89)

7. **"How are you balancing [competing demand] for [stretch goal]?"**
   - "How are you balancing work and family life for training for an ironman?" (How_to_poke_the_bear:67-69)

8. **Multiple-choice variant (sales-call version, but adaptable to email)**: "Are you doing A, B, or C?" (How_to_poke_the_bear:65-79)
   - "How are you recovering failed payments — using an automation, do you have folks reaching out, or are you using an outsourced recovery team?"

9. **"How do you know your [thing] isn't at risk of [bad outcome]?"**
   - "How do you know your listing isn't at risk of being banned from Zillow?" (LinkedIn-CSV:Sheet1, real-estate poke)

10. **Poke-the-bear (presupposition + neutral question)**: "When you wash your car with one bucket, grit can settle at the bottom, get trapped in your sponge, and scratch your car. How are you dealing with that today?" (LinkedIn-CSV)

**What makes a question fail:**
- It's leading: "Wouldn't you agree that…?" → resistance
- It betrays the answer: "How are you sending cold emails *that get replies*?" → leading
- It's about the seller's value prop, not the prospect's reality: "How are you using AI in your outbound?" (vague, marketer-coded)
- It's a hypothetical: "If you could…" → moon and stars

---

## "Poke the bear" technique

Source: `How_to_poke_the_bear_Josh_Braun.txt` (full transcript) + reinforcement in `4T_framework_cold_email_Josh_Braun.txt:62-95`.

**Definition.** A poke-the-bear question is a question that's *deliberately a little hard to answer* because it surfaces a problem the prospect hasn't fully thought through. The aim: get them to "scratch their head and think 'I'm not sure — what do you mean?'" (source: `How_to_poke_the_bear_Josh_Braun.txt:9-13`).

**Mechanics:**
1. Start with the **trigger context** (a presupposition the prospect will recognize as true).
2. Ask **how / what** — not yes/no.
3. Optionally offer **multiple choice** (A, B, or C) — this both makes it easier to answer AND signals you understand how the work actually gets done. (source: `How_to_poke_the_bear_Josh_Braun.txt:40-55`)
4. Make the last option *something they probably haven't tried* — Chris Voss's "illusion of control." (source: `How_to_poke_the_bear_Josh_Braun.txt:55-62`)

**Examples — good pokes:**
- "I speak with course creators all the time and they tell me they're losing 6-8% of revenue month-over-month from failed credit-card payments. How are you recovering failed payments — automation, folks reaching out, or an outsourced recovery team?" (source: `How_to_poke_the_bear_Josh_Braun.txt:23-37`)
- "When you wash your car with one bucket, grit can settle at the bottom, get trapped in your sponge, and scratch your car. How are you dealing with that today?" (source: LinkedIn-CSV)
- "How do you know your listing isn't at risk of being banned from Zillow?" (LinkedIn-CSV)

**Anti-pattern — bad pokes:**
- ❌ "How are you handling outbound?" (too vague, no presupposition, no specific pain surfaced)
- ❌ "Are you happy with your current solution?" (yes/no leading)
- ❌ "Wouldn't it be great if…" (hypothetical / leading)
- ❌ "Have you considered AI?" (seller-centric, not problem-centric)

---

## Reply-getting techniques

Compiled from `Get_replies_for_cold_emails_Josh_Braun.txt`, `How_to_ask_question_to_get_replies_to_cold_emails_Josh_Braun.txt`, and the Lavender Live transcript.

### The three secret questions (Get_replies transcript:6-58)
Every prospect silently asks three questions. Each "no" is game over.
1. **Should I pay attention?** (sender + subject + first 18 words)
2. **Is this interesting?** (body — does it shine a light on a problem they have?)
3. **Should I respond?** (CTA — is the ask reasonable?)

Reverse-engineer to a yes on all three.

### Congruence / call-out for follow-ups (How_to_ask_question:1-58)
Borrowed from the Chicago restaurant story. When someone expressed interest and ghosted, you can subtly invoke **congruence** — humans don't like feeling inconsistent with what they said. Useful in nudge / follow-up touches. JB doesn't show the literal email, but the principle applies as: *reference the prior commitment-shaped interaction without scolding*.

### Soft opt-out CTAs (lean-back, "Regina-ish")
The CTA should feel *un-needy*. Source: `Josh_Braun_Cold_Email_Messages.txt:646-672`.

JB's canonical lean-back closers:
- "Worth a look sometime, no rush. End of Q4, I know you're probably busy, timing's probably off, but worth a look sometime."
- "Worth a peek sometime?"
- "Open to learning more?"
- "Worth an exchange?"

### Soft opt-out language for negative-reply / opt-out paths
JB doesn't use the literal "or tabled?" / "or ignore?" phrasing in the source materials I sampled, but the **principle** is identical: give the prospect an easy out so they don't feel cornered. CSV evidence: phrases like "feel free to ignore", "no big deal", "no rush" appear; "would you be open" appears 16x.

Recommended skill-level patterns (adapted from JB voice but not literally his):
- "Worth a look — or table for now?"
- "Open to learning more, or not the right time?"
- "Want a 2-minute video walking through it, or ignore?"

### PS line
Source: `Josh_Braun_Cold_Email_Messages.txt:716-731`. A PS line that contains personalization that didn't fit the body increases reply rates. Useful for: a relevant LinkedIn post you read, a hobby, a mutual connection. Keep ≤ 1 sentence.

### Length compression
Brain can't comprehend many ideas at once: **isolate one problem per email; chain problems across the sequence** (source: `Josh_Braun_Cold_Email_Messages.txt:758-789`). Triathlon-coach example: don't pitch swim + bike + run + nutrition + mental in one email. Use one per touch, sequenced.

---

## JTBD interview framework (for ICP analysis)

Source: `Josh_Braun_JTBD_Framework_for_Interviews.pdf`, full document.

### Core insight
"The best sales copy you'll ever write has already been written. Not by you. By your customers." (source: JTBD-pdf:p3)

The skill should use JTBD interviews (or proxies — case studies, G2 reviews, customer Slack messages) to mine **buying language** word-for-word, instead of inventing marketing-speak.

### The seven-stage timeline (JTBD-pdf:p4-5)
For every persona × buying decision:

| Stage | Question |
|---|---|
| Purchase / Switch | "When did you buy or start using [product]? What do you remember about that day?" |
| First Thought | "When did you first think you might need something different? What was happening in your life or work?" |
| Passive Looking | "How were you managing before? What were you tolerating?" |
| Trigger to Act | "What changed that made this urgent? Was there a specific event?" |
| Considering Options | "What else did you look at? What almost stopped you?" |
| Decision | "What tipped the scales? Who else was involved?" |
| Using the Solution | "What progress have you made? What's better? What isn't?" |

### Four forces of progress (JTBD-pdf:p5)
- **Push** of the current situation (what hurts now)
- **Pull** of the new solution (what attracts them)
- **Habits** of the present (what makes change hard)
- **Anxieties** of the new (what makes them hesitate)

### Application to event-outbound

When the skill builds personas for an ICP, each persona should carry:
- A **push** ("end of month, lots of commissions to pay" / "another conference and the booth is dead")
- A **pull** (specific better-future state)
- A **habit** (the current crappy workaround — usually spreadsheet/manual)
- An **anxiety** (objection to overcome — "even if you have an accountant")

These four forces feed directly into the 4T framework:
- Push → Trigger context
- Habit → Illumination question topic
- Pull → Third-party validation outcome
- Anxiety → Inline objection-handler ("even if X")

### Tips JB stresses (JTBD-pdf:p5)
- **Don't ask** "What features do you want?" — ask "When was the last time you struggled with this?"
- **Avoid hypotheticals** — stick to what they've actually done
- **Silence is your friend** — let them fill it

---

## Channel-specific length rules

Reference table per touch type. All ranges derived from JB material + platform constraints.

| Touch type | Word range | Sentence range | Source / rationale |
|---|---|---|---|
| **Cold email (first touch)** | 50-100 | 3-4 (max 5) | JB: "literally four to five sentences" (Cold_Email_Messages:561-563); CEB |
| **Cold email (follow-up #2)** | 40-90 | 3-4 | Slightly shorter. JB allows visual / image / metaphor in #2 (Cold_Email_Messages:826-840) |
| **Cold email (follow-up #3+)** | 25-60 | 2-3 | Pattern interrupts (lumpy mail, video, embedded graphic) |
| **LinkedIn connection request** | 20-35 (max ~200 chars) | 1-2 | LinkedIn free-tier 200-char ceiling. JB DM example "Josh, looks like your podcast episodes are under five minutes…" is 32 words / 200 chars (LinkedIn-CSV) |
| **LinkedIn DM (post-connect)** | 50-120 | 3-5 | LinkedIn 1300-char ceiling allows up to ~200 words but JB's cadence is shorter. The JB-approved DM example is 32 words. Default: 50-120. |
| **LinkedIn day-of nudge** | 30-60 | 2-3 | Short, time-sensitive, references concrete time/place. Tone matches JB's lean-back CTAs. |
| **Post-event LinkedIn message** | 40-90 | 2-4 | "It was great meeting at X — saw you mentioned Y in our chat — worth a follow-up?" pattern |

### LinkedIn DM canonical example (JB's own annotation)
> "Josh, looks like your podcast episodes are under five minutes. Do you ever do long form interviews? If so, are there any conditions under which you'd consider hiring someone to edit them?"
>
> JB's gloss: *"No filler. No agenda. A gentle knock. They noticed something. Asked a question with humble curiosity. And left space for reflection. That's the essence of mindful outreach. No convincing. No pushing. No begging. An open hand, not a clenched fist."* (source: LinkedIn-CSV)

This is the gold-standard template for LinkedIn DMs across the entire skill.

---

## Voice cadence (from the LinkedIn-posts CSV)

### Sampling method
- **Files:** `Josh Braun - LinkedIn Posts - Sheet1.csv` (1000 rows) + `Sheet2.csv` (1000 rows) = 1998 non-empty posts
- **Stratified sample:** every 100th row from Sheet1 (10 spot samples) + full-corpus aggregate stats (length, sentence-length distribution, phrase frequency)
- **Targeted samples:** posts containing "Subject:", "looks like you", "how are you ensuring" (cold-email-shaped voice); short posts under 50 words (connection-request-shaped voice)

### Length stats (full corpus)

| Metric | Value |
|---|---|
| Mean post length | 149 words |
| Median post length | 146 words |
| P25 | 111 words |
| P75 | 184 words |
| P90 | 222 words |
| Mean sentence length | 7.6 words |
| Median sentence length | 6 words |
| % sentences ≤ 5 words | 49% |
| % sentences ≤ 10 words | 78% |

**Implication for skill:** JB writes in *short, punchy sentences*. Half his sentences are ≤5 words. Validator could enforce **median sentence length ≤ 12 words** for any JB-flavored output.

### Phrases JB uses repeatedly (frequency in 1998-post corpus)
- **"feels like"** — 122 (presupposition / labeling, Chris Voss style)
- **"open to"** — 59 (CTA: "open to learning more?", "open to a chat?")
- **"seems like"** — 55
- **"looks like"** — 44 (preferred trigger opener: "looks like you're using…")
- **"poke the bear"** — 66 (the technique itself)
- **"commission breath"** — 32 (the metaphor for biased seller speech)
- **"curiosity"** — 137
- **"neutral question"** — 17
- **"it seems like"** — 24
- **"would you be open"** — 16
- **"shine a light"** — 12
- **"zone of resistance"** — 10
- **"scratch their head"** — 6
- **"no rush"** — 5 (lean-back marker)
- **"low-pressure"** / **"low pressure"** — 7
- **"open to learning more"** — 7
- **"slumps"** — 7

### Phrases JB never (or almost never) uses
Searched the full corpus; counts here are total occurrences across 1998 posts. Treat anything ≤ 3 hits as effectively never.

| Phrase | Hits | Note |
|---|---|---|
| "synergy" | 3 | All ironic / quoted |
| "circle back" | 4 | Mostly mocking |
| "moving forward" | 6 | A few; recommend ban |
| "leverage" | 7 | A few literal uses; ban "leveraging" + "leverage our" |
| "best-in-class" | 0 | Never |
| "world-class" | 0 | Never |
| "cutting-edge" | 0 | Never |
| "industry-leading" | 0 | Never |
| "robust" | 0 | Never |
| "scalable" | 0 | Never |
| "seamless" | 4 | A few, all ironic |
| "10x" | 4 | Always in *opposition* — "if I could 10x your revenue" as anti-example |
| "game-changer" | 0 | Never |
| "revolutionary" | 1 | Ironic |
| "drive results" | 0 | Never |

**Recommendation: extend CEB banned-phrase list with**: `world-class`, `industry-leading`, `cutting-edge`, `best-in-class`, `robust`, `scalable`, `seamless`, `drive results`, `move the needle`, `bandwidth`, `next-gen`, `mission-critical`, `paradigm shift`. Most are already there; cross-reference and dedupe.

### Conflicts with current CEB banned list
The current CEB bans these phrases — but JB himself uses them, sometimes regularly. Recommendation: **keep banned in skill output** (the CEB list is additive on top of JB's natural register), but be aware:

| Phrase | CEB status | JB CSV hits | Recommendation |
|---|---|---|---|
| "happy to" | Banned | 3 | Keep banned for "happy to send/share/chat"; JB's bare "happy to" is fine but rare. Validator pattern: ban only `happy to (send\|share\|chat\|connect\|jump\|hop)`. |
| "no pressure" | Banned | 2 | Keep banned in opener position. JB uses "low-pressure" (7) as adjective — distinct. |
| "—" (em-dash) | Banned per workspace `CLAUDE.md` | 382 in JB corpus | Keep banned in agent output (workspace policy wins). JB voice survives via comma/period substitution. |

### Stylistic markers to preserve
- **Sentence fragments are OK** — JB ends posts with fragments constantly ("Less force, more flow.")
- **Two-line "rule of three" ladders** — "Pushes. Convinces. Begs."
- **Negation lists** — "No convincing. No pushing. No begging."
- **The contrast pivot** — "Not X. Y." or "X isn't Y. It's Z."
- **First-person plural "we"** — sparingly, only when including the reader in the conclusion ("we've all been Larry")

---

## Canonical "should pass" examples per touch type

These are the **eval ground-truth** examples. The skill's output should score high on similarity to these.

### Cold email — first touch (4T framework)

**Pass #1 — Warmbox (4T canonical)**
> Subject: cold emails in spam?
>
> noticed you're hiring SDRs which suggests you might be sending lots of cold emails. how are you ensuring cold emails don't land in spam? Google and Salesforce are using us to deliver 94% of cold emails to inboxes compared to 12% before. it involves a warm-up tool that raises your inbox reputation. open to a look?
>
> *Source: 4T transcript reconstructed.* Word count: 60. Sentences: 4. Pronouns: you/your=4, we/our=1, I=0. Pronoun ratio: pass.

**Pass #2 — CaptivateIQ (How_to_construct canonical)**
> Subject: end of month
>
> Steve — end of the month and lots of commissions to pay. curious how are you dealing with the labor-intensive error-prone process of hard pasting Excel pages into Google Sheets running commissions? Gong is using CaptivateIQ to run monthly commissions in 5 minutes instead of 5 hours. no rebuilding individual Google Sheets, manual entry, or customizing reports. worth the conversation?
>
> *Source: How_to_construct_an_effective_cold_email_Josh_Braun.txt, full email reconstructed.* Word count: 64. Sentences: 4.

**Pass #3 — TitanX (JB's own LinkedIn 4T post)**
> Pete — looks like you have 9 SDRs cold calling Directors of Benefits and CHROs. how are you giving your reps more at bats? SDRs using TitanX have 6-8 conversations every 50 dials, compared to 1-2 before. we identify the people most likely to answer. no long-term contracts or new tech to implement. open to learning more?
>
> *Source: LinkedIn-CSV. JB's literal teaching example.* Word count: 70.

**Pass #4 — Truebill (Lavender Live canonical)**
> Subject: subscriptions
>
> looks like you just cut the cord, which suggests you're subscribed to Netflix, Hulu, and YouTube Premium. how do you know you're not overpaying for subscriptions you forgot about? built an app being used by over 3,000 cord-cutters that shows all your subscriptions in one place and lets you cancel the ones you don't want with a click. typically saves $23/month. worth a look?
>
> *Source: Cold_Email_Messages:539-577.* Word count: 67.

**Pass #5 — Solopreneur tax (Lavender Live, presupposition + label)**
> Josh — it looks like you're self-employed in Boca Florida. if you make over 75K a year, you're probably overpaying taxes even if you have an accountant. it involves some tweaks to the tax laws that are only available to solopreneurs that most general accountants aren't aware of. worth an exchange?
>
> *Source: Cold_Email_Messages:339-366. Real cold email JB received and praised.* Word count: 53.

### LinkedIn connection request (≤200 chars)

**Pass #1 — Podcast editing (JB's gold-standard DM)**
> Josh, looks like your podcast episodes are under five minutes. do you ever do long-form interviews? if so, any conditions you'd consider hiring an editor?
>
> *Source: LinkedIn-CSV.* 26 words / 158 chars. Notice: trigger ("under five minutes") → think question (long-form?) → soft ask (any conditions?). Compresses 4T into 3 sentences.

**Pass #2 — Hypothetical fintech AE prospecting**
> Avi — saw you're hiring 4 AEs for the SOC2 compliance vertical. curious how you're getting them ramped on the new pricing model. open to comparing notes?
>
> 27 words / ~165 chars.

### LinkedIn DM (post-connect, 50-120 words)

**Pass #1 — Adapted Truebill DM**
> Thanks for connecting, Pete. saw on your profile you just moved off cable. probably means you're juggling Netflix, Hulu, YouTube Premium, maybe Spotify too. quick question — how do you know you're not paying for subscriptions you forgot about? we built an app used by 3,000+ cord-cutters that shows everything in one place and cancels with a click. typically catches $23/month in forgotten subs. worth a peek?
>
> 70 words.

### LinkedIn day-of nudge (30-60 words)

**Pass #1 — RSA day-of**
> Pete — running our identity-verification roundtable today at 4pm at the Marriott bar (a block from Moscone West). 8 CISOs already RSVP'd, room for 2 more. low-pressure, no slides, just a conversation. swing by?
>
> 40 words.

### Post-event follow-up (40-90 words)

**Pass #1 — Black Hat post-event**
> Pete — appreciated your take on phishing-resistant MFA at the Friday breakfast. you mentioned the rollout to your help desk was the friction point. how are you keeping the help desk from defaulting back to SMS resets? we've seen Auth0 + a 30-second runbook get adoption from 40% to 92%. worth comparing notes?
>
> 56 words. Contains: post-event hook + illumination question + 3rd-party validation + soft CTA.

---

## Canonical "should fail" examples per touch type

Each example below should be flagged by the validator or scored low by the eval judge. Annotations explain *why*.

### Fail #1 — moon and stars
> Subject: 10x your pipeline
>
> Hi Pete, hope this finds you well! If I could 10x your outbound pipeline in the next 90 days, would you be interested? We're the industry-leading platform that's revolutionizing the way modern revenue teams unlock their growth potential. Happy to share a quick 15-min demo at your convenience!
>
> **Failures:** "10x" in subject, "hope this finds you well" (banned), leading question ("would you be interested"), self-praise ("industry-leading", "revolutionizing"), buzzword stack ("platform", "unlock", "growth potential"), pitchy CTA ("15-min demo"), exclamation marks, "happy to" cliché. Eight separate violations.

### Fail #2 — irrelevant trigger
> Subject: Florida State!
>
> Hey Josh — noticed you went to Florida State University. how are you ensuring cold emails don't land in spam? Warmbox helps with deliverability. want to meet?
>
> **Failures:** Trigger and Think have nothing to do with each other (S1). The 4T framework collapses if the Trigger doesn't ladder to the problem. JB calls this out explicitly (4T:199-204).

### Fail #3 — multi-problem mash
> Subject: outbound
>
> looks like you're hiring SDRs. how are you ensuring deliverability, dialer connect rates, LinkedIn reply rates, AE handoff quality, and rep ramp time? Warmbox does inbox warm-up, Orum does parallel dial, Apollo does prospecting, Gong does coaching, and we tie it all together. interested?
>
> **Failures:** Five problems crammed in (H19). Brain can't compute. Pick one. (Cold_Email_Messages:758-773)

### Fail #4 — pitchy CTA
> looks like your team is doubling. how are you ensuring cold emails land in inboxes? Warmbox helps Google and Salesforce hit 94% inbox placement. *Can we book 30 minutes on your calendar this week?*
>
> **Failures:** CTA is needy / direct meeting ask (H9, S6). The 4T framework dies on the last sentence. Replace with "worth a look?"

### Fail #5 — leading / yes-or-no
> looks like you're hiring SDRs. *would you agree that getting cold emails into the inbox is critical to your team's success?* Warmbox solves it. interested?
>
> **Failures:** Leading question ("would you agree…"), value-prop framing instead of neutral problem framing (S2). The bear is not poked; the bear is shoved.

### Fail #6 — gated asset
> looks like you're hiring SDRs. we built a deliverability checklist used by 200+ teams. *Want me to send it over?*
>
> **Failures:** Gating language (H17). JB doctrine: attach or link the asset, never gate. (CEB)

### Fail #7 — defensive opener
> *Not a pitch — no strings attached, just thought you might find this useful.* looks like you're hiring SDRs. how are you ensuring cold emails don't land in spam?
>
> **Failures:** Defensive throat-clearing (H18). Telegraphs "I am about to pitch you." Cut it.

### Fail #8 — LinkedIn connection request bloat
> Hi Pete, my name is Anna and I'm a sales development representative at Warmbox. We help cold-email teams achieve 94% inbox placement, dramatically improving their pipeline conversion. We've worked with Google, Salesforce, and over 200 other companies in the SaaS vertical. I'd love to connect and discuss how we might be able to help your team. Looking forward to hearing back!
>
> **Failures:** Way over 200 chars (~370 chars). Self-introduction ("my name is", "I'm a sales development representative"). Pitch-shaped. Buzzword stack. (H14)

---

## Encoding plan for the skill

### 1. What goes into the system prompt (compressed framework + examples)

A condensed `~600-800 word` block in the skill's system prompt with:

- The 4T framework (Trigger → Think → Third-party → Talk?), one sentence each, with pattern templates
- The "biased seller / commission breath / zone of resistance" psychological frame as the *why*
- Top 5 illumination-question templates (the "How are you…" patterns)
- The lean-back CTA phrasebook ("worth a look?" / "open to learning more?" / "worth an exchange?")
- 2 canonical pass examples (Warmbox + TitanX) — full text — as in-context demonstrations
- 1 canonical fail example (moon-and-stars) annotated with what makes it fail
- Channel-specific length table

The system prompt should NOT include:
- The full transcripts (too long)
- The CSV statistics (validator territory)
- The buzzword list (validator territory)

### 2. NEW validator rules

Add to `cold-email-benchmarks.json` or a new `josh-braun-rules.json`:

```jsonc
{
  "channel_length_rules": {
    "cold_email_first_touch": { "min_words": 50, "max_words": 100, "min_sent": 3, "max_sent": 5 },
    "cold_email_followup_2": { "min_words": 40, "max_words": 90, "min_sent": 3, "max_sent": 4 },
    "cold_email_followup_3plus": { "min_words": 25, "max_words": 60, "min_sent": 2, "max_sent": 3 },
    "linkedin_connection_request": { "max_chars": 200, "max_words": 35, "max_sent": 2 },
    "linkedin_dm_post_connect": { "min_words": 50, "max_words": 120, "min_sent": 3, "max_sent": 5 },
    "linkedin_day_of_nudge": { "min_words": 30, "max_words": 60, "min_sent": 2, "max_sent": 3 },
    "post_event_followup": { "min_words": 40, "max_words": 90, "min_sent": 2, "max_sent": 4 }
  },
  "median_sentence_length_max": 12,
  "additional_banned_phrases": [
    "would you be interested",
    "if I could",
    "wouldn't you agree",
    "we're the best",
    "we're the only",
    "industry-leading",
    "world-class",
    "best-in-class",
    "cutting-edge",
    "robust",
    "scalable",
    "seamless",
    "drive results",
    "move the needle",
    "next-gen",
    "mission-critical",
    "paradigm shift",
    "book a call",
    "schedule a meeting",
    "calendar link",
    "15 minutes",
    "30 minutes",
    "quick demo",
    "happy to send",
    "happy to share",
    "happy to chat"
  ],
  "leading_question_pattern": {
    "regex": "\\b(if I could|wouldn'?t you|don'?t you think|would you be interested)\\b",
    "fail": true
  },
  "illumination_question_required": {
    "applies_to": ["cold_email_first_touch", "linkedin_dm_post_connect"],
    "regex": "\\b(how|what|why)\\s+(are|do|is)\\s+you",
    "min_count": 1
  }
}
```

### 3. NEW evals (LLM-graded)

Create `evals/josh-braun-evals.json` with:

- **Eval 1: 4T structure scoring.** Given the generated email + the inputs (target ICP, value prop), grade 0-5 on each of the four T's. Pass = ≥3 on each.
- **Eval 2: Trigger-Think coherence.** Does the Trigger logically ladder to the Think question? (S1) Pass = LLM judge says yes.
- **Eval 3: Question neutrality.** Is the Think question genuinely neutral, or does it betray a preferred answer? (S2)
- **Eval 4: Voice authenticity.** Does it sound like JB? Score against the 5 canonical pass examples + the LinkedIn corpus voice markers (short sentences, contrast pivots, no buzzwords). 0-5 scale.
- **Eval 5: Lean-back CTA.** Is the CTA needy or lean-back? (S6)
- **Eval 6: One-problem-per-email.** Count distinct problems referenced in the body. >1 = fail. (H19)
- **Eval 7: Anti-pattern detection.** Run the 8 canonical FAIL examples through the skill's *judge* — it should correctly flag all 8.

Each canonical pass example becomes a positive eval; each fail becomes a negative eval. Run nightly via the existing eval harness.

### 4. What stays in `cold-email-benchmarks.json` vs. what goes in a new file

| File | Contents |
|---|---|
| `cold-email-benchmarks.json` (existing) | Stays as the cross-source baseline (Gong + 30MPC + Outbound Squad). No JB-specific patterns. |
| `josh-braun-frameworks.md` (this file) | Canonical reference doc. Human-readable. Source of truth for the skill prompt. |
| `josh-braun-rules.json` (NEW) | Machine-readable. Channel lengths, JB-specific banned phrases, illumination-question heuristic, leading-question regex. The validator merges this with `cold-email-benchmarks.json`. |
| `josh-braun-canonical-examples.json` (NEW) | The pass/fail eval ground-truth, structured for the eval harness. |

---

## Top 5 changes the skill should make

1. **Add channel-specific length validation.** Today the skill enforces 50-100 words for cold email. It needs separate ranges for LinkedIn connection requests (200 chars / 35 words), LinkedIn DMs (50-120 words), day-of nudges (30-60 words), and post-event follow-ups (40-90 words).

2. **Add an illumination-question heuristic.** Every cold-email first-touch and LinkedIn DM should contain at least one "how/what/why are you…" question. Validator-friendly regex; LLM-judge for neutrality.

3. **Ban moon-and-stars + leading-question patterns.** New regex in the validator: `\b(if I could|wouldn'?t you|would you be interested|don'?t you think)\b` → fail. Plus new banned phrases ("we're the best", "industry-leading", etc.) merged into CEB.

4. **Reconcile the em-dash conflict.** Workspace policy bans em-dashes; JB uses 382 of them. The skill must convert em-dashes to commas/periods when emitting, but keep JB's voice cadence (short sentences, contrast pivots, fragment endings) intact.

5. **Adopt the JTBD timeline as the persona structure.** Personas should carry Push / Pull / Habit / Anxiety, mapped 1:1 to the 4T slots (Push→Trigger, Habit→Think, Pull→Third-party, Anxiety→inline objection-handler). This gives the skill a structured way to translate ICP research into 4T copy.

---

## Appendix: source file inventory

| File | Lines | Used for |
|---|---|---|
| `4T_framework_cold_email_Josh_Braun.txt` | 244 | Core 4T structure, illumination-question patterns, banned anti-patterns |
| `Get_replies_for_cold_emails_Josh_Braun.txt` | 60 | Three-secret-questions framework |
| `How_to_ask_question_to_get_replies_to_cold_emails_Josh_Braun.txt` | 58 | Congruence principle for follow-ups |
| `How_to_construct_an_effective_cold_email_Josh_Braun.txt` | 296 | CaptivateIQ worked example, before/after copy mining |
| `How_to_poke_the_bear_Josh_Braun.txt` | 90 | Poke-the-bear technique, multiple-choice pattern |
| `How_to_write_subject_lines_Josh_Braun.txt` | 131 | All 8 subject-line patterns, ≤4 word rule |
| `Josh_Braun_Cold_Email_Messages.txt` (Lavender Live transcript) | 925 | Multiple email examples (Truebill, solopreneur tax, lean-back CTA, multi-problem anti-pattern) |
| `Josh_Braun_JTBD_Framework_for_Interviews.pdf` | 9 pages | JTBD timeline, four forces of progress, customer-language doctrine |
| `Josh Braun - LinkedIn Posts - Sheet1.csv` + `Sheet2.csv` | 1998 non-empty posts | Voice cadence, phrase frequency, banned-word verification, short-form length samples, real DM examples |
