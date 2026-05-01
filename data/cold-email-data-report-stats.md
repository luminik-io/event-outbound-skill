# Cold Email Data Report — quantitative benchmarks

> Source: "The Ultimate Cold Email Data Report" (Gong × 30 Minutes to President's Club × Jason Bay / Outbound Squad). Analyses **85M+ cold emails** to identify what top reps do differently. PDF original at `~/Downloads/cold-outbound-archive/The Ultimate Cold Email Data Report.pdf`.
>
> This file complements `cold-outbound-craft.md` with the exact reply-rate / open-rate deltas the report measured. Where the the synthesis says "buzzwords kill replies," this file says "buzzwords drop reply rate by 57%." Use these as ranking weights in the validator and as priority cues in the prompt.

---

## Headline benchmarks

The report defines "top 10%" reps and benchmarks the rest of the population against them.

| Metric | Average rep | Top 25% | **Top 10%** |
|---|---|---|---|
| Open rate | 27% | 47% | **58%** |
| Reply rate | 2% | 5% | **8%** |
| Meeting booked rate | 0.3% | 1.3% | **2.3%** |
| Meetings booked (per period) | 3 | 13 | **23** (8.1× the average) |

**Takeaway:** Top reps book **8.1× more meetings** than average. They get **2.1× more opens** (better subject lines) and **4.2× more replies** (better problem/value framing in the body).

---

## Subject lines

### Length
- **1-4 words = sweet spot.** Reply rate drops sharply at 5+ words.
- The skill's existing rule (`max_word_count: 4`) is correct.

### Capitalisation
- All-lowercase: **+11% open rate** (36.4% absolute open rate)
- Title-Case: +6%
- Sentence case: baseline

### Strategy impact on open rate
| Strategy | Open-rate impact | Notes |
|---|---|---|
| Empty subject | **+30%** | But **-12% reply rate** — clickbaity |
| **Priority-based** | **+17%** | Internal-email shape (`"trial delays"`, `"hiring ops"`) |
| Question | -3% | |
| Social proof in subject | -4% | |
| Buzzwords | -7% | |
| Numbers | -9% | |
| **"AI" word** | **-18%** | Worst signal in the data |

**Takeaway:** Priority-based subjects (problem + noun, no verb) win. Empty subjects open well but kill replies. Avoid "AI" in subjects entirely.

---

## Email length

### Word count → reply rate
| Words | Reply rate |
|---|---|
| <50 | 2.3% |
| **51-100** | **2.6%** (peak) |
| 101-150 | 2.0% |
| 151-200 | 1.6% |

### Sentence count → reply rate ("the money zone")
| Sentences | Reply rate |
|---|---|
| 1 | 1.9% |
| 2 | 2.3% |
| **3** | **2.9%** (peak) |
| **4** | **2.7%** (peak) |
| 5 | 2.3% |
| 6 | 2.3% |

**Takeaway:** Existing skill rule (`50-100 words, 3-4 sentences`) is exactly the data optimum. Don't loosen.

---

## Personalisation

| Type | Reply rate |
|---|---|
| **Activity-based** | **24%** |
| Company | 9% |
| Individual | 6% |
| Industry | 6% |
| Baseline (no personalisation) | 2% |

- **Personalised emails: 5× more meetings booked** (10% vs 2%)
- "Activity-based" = referencing what the prospect just did (a post, an event, a hire, a launch) — the highest-impact personalisation
- "Individual" = personal fun facts (alma mater, marathon hobby) — only 3× baseline. **Executives don't care about alma mater.**

**Takeaway for the skill:** the existing personalisation_tier_ranking is correct (activity > company > individual > industry > baseline). Use these tiers as a *minimum* — the prompt should push the LLM toward activity-based personalisation when the input has any activity signal (an event the prospect is speaking at, a recent post, a hire).

---

## Problem & value statements

### Pitch words → reply rate impact
| Pattern | Impact |
|---|---|
| Buzzwords ("leverage", "synergy", "robust") | **-57%** |
| "AI" word | -36% |
| "Platform" word | -26% |
| ROI-based framing | -17% |
| **Priority-based framing** | **+20%** |
| **Social proof in body** | **+41%** |

### Pronoun ratio
- Top reps use "you / your / your team" **29% MORE often** than average reps.
- "We" language pulls toward pitching. "You" language references the prospect's world.
- Existing skill rule (`majority_you_your: true`) is correct — but the magnitude (29% more) is data we should encode in the eval as a stretch target, not just a binary check.

**Takeaway:** "AI" and "platform" are surprisingly toxic in the body, not just the subject. Add them to the body banned-phrase list (subject already bans them).

---

## CTAs (final ask)

| CTA pattern | Reply-rate impact |
|---|---|
| **Ask for meeting** ("got 15 min?") | **-44%** |
| Ask for problem ("are you struggling with X?") | -29% |
| Ask for interest ("worth a look?") | +7% |
| **Make offer** ("here's a 1-page audit, want it?") | **+28%** |

**Takeaway:** "Make offer" beats "ask for interest" by 21 percentage points. The skill should bias toward `make_offer` whenever the touch can carry a concrete deliverable (a one-pager, a teardown, an audit, a recap). The existing CTA ranking matches this directionally; encode the numeric weights in the validator's CTA scoring.

---

## Multi-touch sequencing

### How many touches?
- Send **6 emails over 14-28 days** maximum.
- After 6, reply rates drop below 0.5% — give it a rest.
- Open rate by email number drops sharply: 2% on email 1, 1.5% on 2, ~1% on 3, then steady decline.

### Bump emails (follow-ups)
- **1 sentence = 2× more replies** than 4-5 sentence follow-ups
- Bump emails should NOT re-pitch value. Bump with "thoughts" (rephrased CTA) or eventually a breakup.

### Bump framework reply-rate impact
| Bump email pattern | Impact |
|---|---|
| Has case study language | **-47%** |
| Has "quick chat" language | -2% |
| Has "thoughts" | +9% |
| Has CTA language | +27% |
| **Has breakup language** | **+89%** |

**Breakup language wins by a huge margin** — examples like "if it's not the right time, no problem, I'll close the loop on my end."

### Cold calls × email
- Cold calls alone: **2× reply rate** vs cold email only
- **Cold calls + voicemail: 3× reply rate**
- Voicemail script (from the report): *"Hey {name}, I work with a few other partners in the {neighbourhood} offices. It's {sender_name} from {sender_company}. I'm going to send you an email after this thing. No need to call me back, just reply there and let me know if what I'm sending you is even moderately interesting."*

**Takeaway for the skill:**
- **Touch count cap = 6** (validator should refuse to generate sequence longer than 6 if `leadTimeWeeks > 4` would push it past 6 emails — split into pre/post-event)
- Bump emails should be **1 sentence**, validated separately from first-touch (50-100 word range)
- Add **"breakup" as a touch type** to the skill (e.g., touch 6 of 6 in a long sequence)
- Add **cold-call voicemail** as an output channel (skill currently only emits email + LinkedIn — voicemail script generation would lift reply rate 3×)

---

## Encoding follow-ups for the skill

After the the encoding lands (current in-flight PR `feat/cold-outbound-validators`), file these as a follow-up PR or issue:

1. **Add quantitative ranking weights to validators.**
   - Subject pattern weights (lowercase +11%, priority-based +17%, AI-word -18%, etc.) → use as soft scores in the eval, not hard validator rejects
   - CTA type weights (make_offer +28%, ask_interest +7%, ask_problem -29%, ask_meeting -44%) → already in `cold-email-benchmarks.json`'s `cta_type_ranking`; replace placeholder deltas with these exact numbers
2. **Add "breakup" touch type** (touch N+1 in long sequences). Validator: 1-2 sentences, must contain "close the loop" / "no follow-up" / "if the timing's wrong" pattern.
3. **Add voicemail channel.** Output is a 30-45 second script (~70-90 words), structured per the report's reference script.
4. **Add `bump_email_first_followup` / `bump_email_breakup` touch types** with 1-sentence body limit (the existing `email_followup` is too generic).
5. **Add a "sequence-length cap" validator** — error if more than 6 email touches are generated regardless of lead time. Use additional days for cold-call + voicemail touches instead.
6. **Eval scoring weights.** When the LLM judge scores a touch, weight by the report's deltas (e.g., a touch with "make_offer" CTA scores higher than `ask_for_interest` by the +21 percentage-point delta the data shows).

---

## Source attribution

- Report: "The Ultimate Cold Email Data Report" (Gong × 30 Minutes to President's Club × Jason Bay / Outbound Squad). Sample: 85,000,000+ cold emails. Year: 2024-2025.
- Original PDF: `~/Downloads/cold-outbound-archive/The Ultimate Cold Email Data Report.pdf` (12 pages).
- Cited in `cold-outbound-craft.md` "Appendix: source file inventory" as cross-source baseline.

This file is the structured extract of the PDF for use by the skill's prompt + validators + evals.
