# Quality bar refinements

> Source: user direction during the 2026-05-01 dog-fooding session, after the first end-to-end run of the skill on RSA Conference 2026 surfaced the gap between "validator-passing" output and "top 0.1%" output.
>
> This file complements `cold-outbound-craft.md` (frameworks) and `cold-email-data-report-stats.md` (quantitative benchmarks) with **what the validator and eval still don't catch**. Every requirement here is a place where the current skill output reads as competent but not as *the kind of email a top rep would actually send*.
>
> Scope: the items here go in a follow-up PR after the in-flight the cold-outbound canon encoding (`feat/cold-outbound-validators`) lands. This file is the spec for that follow-up.

---

## Five quality bars the skill should enforce

### 1. Natural, conversational tone

The output should read like a peer texting another peer at a coffee shop, not a marketing department generating "personalised at scale." If a sentence sounds like it could appear on a slide or a magazine pull-quote, it is wrong for cold outreach.

**Encoding plan:**

- **Validator (regex):** ban formal-register openers and corporate fillers:
  - `I hope this (email )?finds you well`
  - `I('m| am) reaching out`
  - `As you may( be|'ve been)? aware`
  - `we( would| 'd)? like to`
  - `at your earliest convenience`
  - `please don'?t hesitate to`
  - `kindly`
  - `regards` / `best regards` / `warmest regards` (sign-off — fine; opener — bad)
  - `further to my (last|previous)`
  - any sentence starting with `Hi {{first_name}}, ` followed by a comma + clause longer than 8 words (signature corporate greeting cadence)
- **Validator (heuristic):** median sentence length already capped at ≤12 words in `cold-outbound-craft.md` H-rules; tighten the **average** to ≤14 to catch "two short fragments balancing one bloated middle sentence."
- **Eval (LLM-judged):** for each touch, score 1-5 on the rubric *"would a peer text this verbatim to another peer at a coffee shop?"* Pass = 4+. Surface lower scores with the specific sentence flagged.
- **Prompt:** add the line *"Read the email aloud before finalising. If it sounds like a slide, rewrite it as something you'd say."* Plus a 2-line good/bad example.

### 2. Genuine, authentic, cost-of-inaction question

The illumination question must:
- Sound like real curiosity, not a gotcha
- Be tied to a concrete situation only this prospect lives in (not a generic "do you have X problem?")
- Imply the cost of NOT answering — the reader feels the consequence of leaving the question unanswered, not just the abstract problem statement
- Pass the "scratch-your-head" test (the cold-outbound canon's phrase): the reader should think *"I'm not sure what they mean — better keep reading"*

**Common failures we want to flag:**

| Anti-pattern | Why it fails | Example |
|---|---|---|
| Generic problem question | Could apply to anyone | *"Do you struggle with event ROI?"* |
| Yes/no leading question | Betrays preferred answer | *"Wouldn't it be great to attribute pipeline more accurately?"* |
| Surface-level observation | Anyone could ask it | *"How are you measuring event success?"* |
| Cost-free question | No implicit consequence | *"Curious how you think about RSA?"* |
| Insider-jargon question | Reads as marketer-coded, not peer-coded | *"How are you optimising your top-of-funnel velocity at RSA?"* |

**Compare to a permission-based cost-of-inaction question:**

> *"How are you ensuring the $250K RSA budget line on the P&L doesn't look like it sourced $0 when the CMO asks before the board deck locks?"*

This one passes because:
- It names a specific dollar figure ($250K), a specific surface (the P&L line), a specific deadline (before the board deck locks), and a specific stakeholder (the CMO)
- It implies the cost of inaction (the CMO will ask, the answer will be "nothing", that's a career-bad outcome)
- It scratches the head (the reader thinks "wait, *would* my P&L line look like $0?")
- It's neutral — the seller hasn't said what the answer should be

**Encoding plan:**

- **Validator (regex blocklist):** ban these surface-level question shells:
  - `^do you (struggle|have|find|deal) (with|having)`
  - `^are you (struggling|finding|dealing) (with|having)`
  - `^how do you (think about|measure|approach) ` (when the next clause is generic)
  - `^wouldn'?t (it be )?(great|nice|easier) `
  - `^(curious|wondering) how you (think|approach|handle)` followed by a generic noun
- **Validator (heuristic):** the question must contain at least ONE of: a specific dollar amount, a specific time-bound surface (board deck, Q3 review, Friday demo), a specific named stakeholder (CMO, head of comp, RevOps lead), or a specific named system (Salesforce, Apollo, the P&L). If none, flag.
- **Eval (LLM-judged), 4 sub-scores per question:**
  1. **Genuineness** (1-5): does it read as real curiosity or as gotcha-coded?
  2. **Cost-of-inaction** (1-5): does the reader feel a consequence of leaving it unanswered?
  3. **Specificity** (1-5): is it tied to a situation only this prospect lives in?
  4. **Scratch-the-head** (1-5): would the reader feel motivated to read the next sentence?
  Pass = 4+ on all four.
- **Prompt:** include 3 cost-of-inaction question exemplars and 3 surface-level fails with annotation.

### 3. Strategic CTA placement (not every step has an offer)

Today the skill validates that EACH touch has a CTA from the approved ranking. That over-applies. Real sequences have CTA *rhythm*: not every step asks for something. Some steps are just signal — a question, an observation, a small piece of context. The strongest sequences place offers and asks where the prospect's attention is highest, not on every touch.

**Per-step CTA strategy (default):**

| Touch | Step | Strategy | Why |
|---|---|---|---|
| Touch 1 | Cold first email | Question + asset offer | Best chance to earn a click |
| Touch 2 | LinkedIn connection request | Question only, no ask | Connect requests with asks feel needy |
| Touch 3 | Cold email follow-up | "Thoughts?" — rephrase the question, no new ask | Bump emails with no new ask outperform new pitches |
| Touch 4 | LinkedIn nudge / day-of | Light observation + soft CTA, no offer | Reader is in event mode — short context wins |
| Touch 5 | Post-event email | New angle + offer (if you have a specific recap to share) | Permission has been earned |
| Touch 6 | Breakup email | Permission to close the loop, NO offer | Breakup language gets +89% reply rate when there's no new pitch |

**Encoding plan:**

- **Spec extension:** add `cta_strategy` per touch type to `cold-outbound-rules.json`:
  ```jsonc
  {
    "cta_strategy_per_touch_type": {
      "email_cold_first":          { "preferred": "make_offer", "alternates": ["ask_for_interest"], "may_omit": false },
      "linkedin_connect":          { "preferred": "ask_for_interest", "alternates": [], "may_omit": true, "max_chars": 200 },
      "email_followup_2":          { "preferred": "ask_for_interest", "alternates": ["thoughts"], "may_omit": true },
      "linkedin_nudge":            { "preferred": "ask_for_interest", "alternates": [], "may_omit": false },
      "linkedin_day_of":           { "preferred": "ask_for_interest", "alternates": [], "may_omit": false },
      "email_followup_post_event": { "preferred": "make_offer", "alternates": ["ask_for_interest"], "may_omit": false },
      "email_breakup":             { "preferred": "permission_close", "alternates": [], "may_omit": false }
    }
  }
  ```
- **Validator:** if `may_omit: true`, the touch is allowed to ship without a CTA. If `may_omit: false`, the touch must include the preferred or an alternate.
- **Sequence-level eval:** count `make_offer` CTAs across the full sequence. If a 6-touch sequence has 4+ `make_offer` touches, flag as offer-fatigue. Recommend redistributing.
- **Prompt:** include the table above so the LLM knows the strategy by step.

### 4. Pain-recycling prevention (each step must use a different angle)

Today the sequencer generates touches independently. Each touch sees the persona's full pain-points list and naturally drifts toward the same 1-2 strongest pains. Result: the prospect reads touch 3 and thinks *"this is the same email as touch 1 with different words."*

Top-rep sequences earn permission across multiple touches because each touch unlocks a NEW dimension of the prospect's situation. Touch 1 might frame the *attribution* problem, touch 3 the *committee opacity* problem, touch 5 the *post-event-fade* problem. Same persona, three angles, three reasons to keep reading.

**Encoding plan:**

- **Sequencer architecture change:** before generating each touch after the first, the sequencer passes the LLM:
  - List of pain-angles already used in earlier touches in this sequence (extracted as short labels: `"attribution model inheritance"`, `"committee opacity"`, etc.)
  - Instruction to pick a *different* angle for this touch
  - The remaining unused pain-angles from the persona, ranked by relevance to the current touch's timing (pre-event vs day-of vs post-event)
- **Pain-angle extraction:** when an `AttendeePersona` ships from the ICP analyser, label each `painPoint` with a 2-3 word angle (`"attribution model inheritance"`). Persist these labels.
- **Validator (post-generation):** for each pair of touches in a sequence, compute Jaccard similarity of pain-relevant noun phrases. Threshold at 0.4 — anything higher gets flagged `pain_recycled`. Manual rewrite required.
- **Cross-channel rule:** the LinkedIn touch and the email touch in the same week must NOT share a pain angle. They are seen by the same human within 48 hours; identical framing reads as bulk-blast.
- **Eval (LLM-judged):** "list the distinct pain angles this 6-touch sequence covers." If <4 distinct angles for a 6-touch sequence, flag.

### 5. Specificity over generalisation

Every word should earn its place. If a sentence could be cut without changing the meaning, cut it. If a noun is vague (`"things"`, `"areas"`, `"aspects"`, `"the right approach"`, `"best practices"`), replace it with the specific noun or delete the sentence.

**Common specificity failures:**

| Vague | Specific |
|---|---|
| *"help with attribution"* | *"map booth scans to the right Salesforce opportunity stage"* |
| *"deal with the spreadsheet step"* | *"kill the Excel-to-Google-Sheets-to-Salesforce export the SDRs do every Monday"* |
| *"the Q3 board deck is approaching"* | *"Q3 board prep starts in 11 days"* |
| *"a few reps mentioned this"* | *"three Series C cyber VPs have brought it up in the last month"* |
| *"some fintechs"* | *"Klarna, Mollie, and one Series B BNPL"* |

**Encoding plan:**

- **Validator (regex blocklist):** vague filler nouns when used without a specific antecedent:
  - `\b(things|stuff|areas|aspects|items|matters)\b` (ban outright in cold email body)
  - `\b(the right|best) (approach|way|practice|practices)\b`
  - `\bvarious (companies|firms|teams|orgs)\b`
  - `\bmany (companies|firms|teams|orgs|customers)\b` (require a count or named example)
- **Validator (heuristic):** sentences containing `"we help"` / `"we work with"` / `"we partner with"` followed by a generic noun must include at least one specific name. *"We help SaaS companies"* fails. *"We help Klarna and Mollie"* passes.
- **Eval (LLM-judged):** for each touch, the judge marks every sentence as `specific` or `vague`. Touch fails if `vague` count > 0 in body.
- **Prompt:** include the specificity table above as a fail/pass example pair.

---

## Architecture implications for the sequencer

To enforce these refinements, the sequencer's per-touch generation flow needs to track *sequence state* across touches, not just per-touch validators:

```
Before touch generation:
  1. Load sequence-state-so-far: { touches_generated: [], pain_angles_used: [], cta_types_used: [] }
  2. Compute angle to assign for this touch (different from any in pain_angles_used)
  3. Compute CTA strategy for this touch (per cta_strategy_per_touch_type)
  4. Compute "may omit CTA" decision based on sequence rhythm

Generate touch with that context.

Post-generation validator:
  5. Hard rules (length, banned words, em-dash, etc.)
  6. Specificity check (vague-noun regex)
  7. Pain-recycling check (Jaccard against earlier touches in the sequence)
  8. CTA-strategy check (matches cta_strategy_per_touch_type for this touch type)

Post-sequence eval:
  9. LLM judge: distinct-pain-angle count
 10. LLM judge: conversational-tone score per touch
 11. LLM judge: question-quality 4-axis score for first-touch
 12. LLM judge: cross-channel angle differentiation (LI vs email same week)
```

---

## Acceptance criteria for the follow-up PR

- [ ] `data/cold-outbound-rules.json` extended with `cta_strategy_per_touch_type` block
- [ ] `data/cold-outbound-rules.json` extended with `surface_level_question_blocklist`, `vague_filler_nouns`, `formal_register_openers`
- [ ] `src/agents/sequencer.ts` `generateSequence()` refactored to thread `sequence-state-so-far` into each per-touch generation call
- [ ] New validator: `validateSpecificity(touch, rules)`
- [ ] New validator: `validatePainRecycling(touch, sequenceSoFar, rules)` (Jaccard threshold 0.4)
- [ ] New validator: `validateCtaStrategy(touch, rules)` — confirms `may_omit` honored
- [ ] New eval: `conversationalToneEval` (1-5 LLM judge per touch)
- [ ] New eval: `questionQualityEval` (4 sub-scores: genuineness, cost-of-inaction, specificity, scratch-head)
- [ ] New eval: `distinctPainAnglesEval` (sequence-level, must hit 4+ angles in a 6-touch sequence)
- [ ] Re-run RSA + SaaStr + Money20/20 examples; manual review confirms each touch reads naturally and uses a unique angle
- [ ] Prompt rewrite: 4T framework + per-step CTA strategy table + 3 cost-of-inaction question exemplars + 3 surface-level fails
- [ ] All 12 RSA touches pass the new validators AND score ≥4 on the conversational-tone eval

---

## What this changes about the LinkedIn post

The LinkedIn post we draft after this PR lands should NOT claim "100% the cold-outbound canon compliant from day one." The honest story is:

1. *"I built the skill, ran it end-to-end on RSA, the validator caught real misalignments — channel-uniform length, false-positive flags on LinkedIn, surface-level questions."*
2. *"I encoded the cold-outbound canon's frameworks plus the Gong/30MPC 85M-email data report, added LLM-graded evals, refactored the sequencer to track sequence state across touches so pains don't recycle and CTA placement is strategic."*
3. *"Now every touch passes hard validators AND scores 4+ on the conversational-tone eval. Each step uses a distinct angle. Not every step pitches; some are just signal."*

That's a credible "I built this, dog-fed it, found bugs, fixed them" story. The user gets to share something honest, specific, and useful — not a marketing claim.
