# LLM-cliche blocklist

> Source: research-driven curation of phrases that mark text as LLM-generated. Compiled from public GPT-detection research (Stanford, Penn State), the OpenAI/Anthropic style-guide leaks, the Lavender Live transcript called out by the canon, the Gong/30MPC 85M-email report, and the workspace voice-rules canon. **None of this is canon-specific** — it's a defensive layer against the broader pattern of "competent-but-LLM-shaped" copy.
>
> The user's diagnostic is the right one: copy should never feel sequenced or scripted. A real human peer doesn't open with `"stuck with me"` or transition with `"Moreover"`. An LLM does, because its training corpus is dense with marketing copy that reads vivid but is verbal theater.

---

## The eight failure modes

### 1. Performative empathy openers
"I noticed your problem and felt seen by it." Real peers don't open with feelings; they open with facts.

| Banned | Why it fails |
|---|---|
| `stuck with me` | Implies emotional permanence the writer can't verify |
| `really resonated` (+ `with me` variants) | Marketing-coded; not how peers describe agreement |
| `got me thinking` | Filler; says nothing the next sentence won't |
| `made me think of you` | Manufactured intimacy with a stranger |
| `couldn't stop thinking about` | Performative, theatrical |
| `rang true` | Pretty but vague — what specifically? |
| `spoke to me` | Same as above |
| `this is so true` | Generic LinkedIn-comment shape |
| `I felt that` | Performed feeling |

### 2. Generic compliments / opinion-soliciting opens
"Amazing work, incredible work, love what you're doing" — empty-calorie openers that LinkedIn comments are full of and cold-email prospects discount instantly.

| Banned | Why it fails |
|---|---|
| `amazing work` | Sycophantic + content-free |
| `incredible work` | Same |
| `great work` (as opener) | Same |
| `love what you're doing` | Marketing-coded |
| `truly impressive` | Adverb stack, no information |
| `really impressive` | Same |
| `curious to hear your thoughts` | Asks for free labor, gives no hook |

### 3. Sales-speak openers (already partially in CEB; reinforced here)
The classic SDR templates that prospects have learned to ignore.

| Banned | Why it fails |
|---|---|
| `I hope this (email )?finds you well` | Filler; banned in CEB |
| `hope you('?re| are) doing well` | Same |
| `hope your week is going well` | Same |
| `I('m\| am) reaching out` | Tells the reader nothing they don't see |
| `I just wanted to reach out` | Same + apologetic |
| `I('m\| am) writing to` | Stilted |
| `wanted to reach out (about\|to)` | Same |
| `just wanted to (reach out\|drop a note\|share)` | Apologetic + filler |
| `quick question` | Banned in CEB; almost never followed by a quick question |
| `just checking in` | Banned in CEB |
| `circling back` / `circle back` | Banned in CEB |
| `touching base` | Banned in CEB |

### 4. Manufactured intimacy / closeness signals
Pretending to know the prospect more than the writer actually does.

| Banned | Why it fails |
|---|---|
| `in case it's helpful` | Apologetic + assumes content is relevant without saying why |
| `thought you might find this interesting` | Generic; no specificity |
| `happen to have a few thoughts` | Casual-coded but transparent filler |
| `wanted to share` | Filler before the share |
| `for what it's worth` | Hedge |
| `if it's of interest` | Banned in CEB |
| `just my two cents` | Filler |
| `not sure if this resonates` | Performative humility |

### 5. Marketing buzzwords (already in CEB; reinforced)
SaaS-vendor speak that triggers prospect spam-detection.

| Banned | Why it fails |
|---|---|
| `leverage` (as verb) | Marketing-only; humans say "use" |
| `synergize` / `synergy` | Stock buzzword |
| `unlock` (in the "unlock potential" sense) | Marketing-coded |
| `empower` | Same |
| `robust` (when describing software) | Marketing-only |
| `scalable` (when describing software) | Same |
| `seamless` | Same |
| `transform` / `transformative` / `transformational` | Empty intensifier |
| `game-changer` / `game-changing` | Same |
| `innovative` | Same |
| `cutting-edge` / `bleeding edge` | Same |
| `next-gen` / `next generation` | Same |
| `best-in-class` / `world-class` / `industry-leading` | Same; biased self-claim per the doctrine |
| `award-winning` | Same |
| `revolutionary` | Same |
| `paradigm shift` / `paradigm-shifting` | Same |
| `mission-critical` | Same |
| `boasting` (a feature) | "Look at how vendor we sound" |
| `boasts` (a feature) | Same |
| `drive (results\|outcomes\|growth)` | Buzzword chain |
| `move the needle` | Idiom; banned by voice-rules |

### 5a. Lazy generalization openers
A new hard-ban category. Cold-email writers (and LLMs imitating them) reach for "Most teams...", "Most companies...", "Most fintechs...", "Almost nobody...", "Everyone is..." as openers because it lets them skip the work of saying something specific to *this* recipient. The result reads as a category-wide observation any vendor could write to any prospect: it pattern-matches to mass blast. The 4T framework's Trigger step requires a specific observation about the recipient or their company. Generalization openers fail the Trigger requirement by definition.

The hard-ban scope is **the opening sentence of any touch body**. Inline use mid-paragraph in long-form prose is fine; opening a cold email or first DM with these patterns is the failure mode.

| Banned (as opener) | Why it fails |
|---|---|
| `Most teams` | Generalization that any vendor could send to any recipient |
| `Most companies` | Same |
| `Most fintechs` / `Most cybersecurity teams` / `Most B2B SaaS` | Same; even ICP-shaped, still not specific to recipient |
| `Most VPs` / `Most CMOs` / `Most founders` / `Most operators` / `Most AEs` / `Most SDRs` | Title-shape generalization |
| `Most {{title}}s I talk to` / `Most folks I work with` / `Most people I speak to` | Self-aggrandising generalization that performs experience without proving it |
| `Almost nobody` / `Almost no one` | Same shape, negative direction |
| `Nobody is` / `Nobody on the team` / `Nobody talks about` | Universal-negative claim impossible to verify |
| `Everyone is` / `Everyone says` / `Everyone knows` | Universal-positive claim impossible to verify |
| `Every team` / `Every company` / `Every fintech` | Universal-positive; same failure mode |
| `Many teams` / `Many companies` / `Many of you` | Hedged generalization; same failure |
| `In our experience` (as opener) | Self-positioning before the recipient observation |

**The right shape**: open with a specific observation about *this* recipient or *this* event. Use the recipient's company name, a public detail about their team, a specific session at the event, or a recent product/funding/hiring signal. If you don't have a specific anchor, reach for a situation trigger ("end of the month and lots of commissions to pay" sized to the recipient's role) before reaching for a generalization. Never open with the population shape.

### 5b. Cold-email "fake-substantive" words
A distinct hard-ban category for words that LOOK substantive in cold-email contexts (so writers reach for them, thinking they sound credible) but are so heavily abused in mass outbound that prospects pattern-match them to vendor-deck speak. Different from generic marketing buzzwords because they pretend to describe a concrete asset.

| Banned | Why it fails |
|---|---|
| `teardown` (as a 1-pager / asset noun) | Pretends to describe a concrete deliverable; flagged in Lavender / Outbound Squad / 30MPC corpora as overused. Use the literal noun: "1-pager", "writeup", "recap", "case" |
| `playbook` (as marketing word, e.g. "our playbook for X") | Same — sounds prescriptive but is filler. OK as a literal team-process noun ("rep playbook updates"); banned as a value-prop wrapper |
| `blueprint` | Same shape as teardown |
| `primer` (as in "a quick primer on X") | Same |
| `north star` / `north-star` / `north-star metric` | Boardroom jargon imported into cold email; vague |
| `table stakes` | Boardroom idiom |
| `low-hanging fruit` | Cliche; banned in voice-rules |
| `double-click on` (as verb of inquiry) | Vendor-deck speak |
| `do you have bandwidth` | Hedge framed as a question; banned by voice-rules |

### 6. LLM transition tics
The connective tissue that gives away machine generation.

| Banned | Why it fails |
|---|---|
| `Moreover,` | Almost never used by peers in cold email |
| `Furthermore,` | Same |
| `Additionally,` | Same |
| `In addition,` (as opener) | Same |
| `That said,` (as opener) | Same |
| `With that being said,` | Same |
| `To that end,` | Same |
| `In other words,` | Reformulating-for-emphasis pattern |
| `It('?s\| is) important to note that` | Throat-clearing |
| `It('?s\| is) worth noting that` | Same |
| `It('?s\| is) crucial to (understand\|note\|recognize)` | Same |
| `It('?s\| is) essential to` | Same |
| `It('?s\| is) no secret that` | Cliche opener |

### 7. GPT-detected vocabulary (community + research-tracked)
Words that GPT models over-use relative to typical B2B human writing. Source: Stanford CRFM evaluations, GPTZero linguistic markers, the public "ChatGPT word frequency" community lists.

| Banned | Why it fails |
|---|---|
| `delve` / `delve into` / `delving` | The single strongest GPT tell in 2024-2025 |
| `dive into` / `dive deep` (as a verb of inquiry) | Same family |
| `navigate` (when used as "navigate the landscape of") | LLM-overused |
| `tapestry` (as metaphor) | Almost never used by humans in B2B |
| `vibrant` | Same |
| `intricate` | LLM-overused intensifier |
| `profound` (as adjective in B2B) | Theatrical |
| `comprehensive` | Generic intensifier |
| `multifaceted` | Pretty but content-free |
| `nuanced` (as a hedge) | Often filler |
| `bolster` (verb) | LLM-coded |
| `foster` (as in "foster collaboration") | Same |
| `harness` (as in "harness the power of") | Same |
| `embark` (on a journey) | LLM-coded + journey banned |
| `endeavor` (as noun or verb) | Stilted register |
| `facilitate` | Bureaucratic |
| `underscore` | LLM transition word |
| `elucidate` | Stilted |
| `landscape` (in "X landscape" meaning "X market") | Marketing-coded |
| `realm` (in "the realm of") | Theatrical |
| `ecosystem` (when meaning "market") | Marketing-coded |
| `paradigm` (in any non-Kuhn sense) | Marketing-coded |
| `holistic` | Marketing-coded |
| `actionable` (insights, etc.) | Buzzword |
| `agentic` (in marketing, not technical) | Buzzword |
| `streamline` / `streamlined` | Banned in voice-rules |

### 8. Hedge / softener filler
Filler that makes copy feel uncertain without adding information.

| Banned | Why it fails |
|---|---|
| `kind of` (as filler, not literal) | Hedge |
| `sort of` (same) | Hedge |
| `somewhat` | Hedge; usually followed by precise adjective without it |
| `a little bit` | Filler |
| `a tad` | Filler |
| `quite frankly` | Filler |
| `to be honest` (as opener) | Filler |
| `at the end of the day` | Stock phrase |

---

## What the validator should do

1. **Hard regex check** — any banned phrase from the categories above present in the touch body or subject → fail with `validation_errors: ['llm_cliche', '<phrase>']`. No retries-can-rescue exception; the fix is to rewrite, not retry.
2. **Per-category counters in `OutreachTouch.checks`** so the operator can see which family of cliches the touch tripped on:
   ```ts
   checks.llmClichesByCategory: {
     performative_empathy: number,
     marketing_buzzwords: number,
     llm_transition_tics: number,
     gpt_vocabulary: number,
     ...
   }
   ```
3. **Eval-graded check (LLM judge)** — for borderline phrases not in the regex but exhibiting the same shape ("stuck in my mind"), the conversational-tone eval scores 1-5 with explicit instruction to penalize performative-empathy or LLM-transition shapes.

## What the prompt should do

The system prompt should include:
- A "Banned LLM cliches" section listing the most-common 30-40 phrases verbatim
- One canonical "good" rewrite for each of the 8 categories so the LLM has positive training signal alongside the negative
- An explicit instruction: *"Read the email aloud before finalizing. If a phrase sounds like marketing copy or a LinkedIn comment, rewrite it as something a peer would say to another peer at a coffee shop."*

## Scope: hard ban vs. soft warning

| Category | Treatment |
|---|---|
| 1. Performative empathy openers | Hard ban |
| 2. Generic compliments | Hard ban |
| 3. Sales-speak openers | Hard ban |
| 4. Manufactured intimacy | Hard ban |
| 5. Marketing buzzwords | Hard ban (already in CEB) |
| 6. LLM transition tics | Hard ban |
| 7. GPT-detected vocabulary | Hard ban for the top 20 (most-overused); soft warning for the rest |
| 8. Hedge / softener filler | Soft warning (some have legitimate uses) |

A "soft warning" surfaces in the touch's `checks.softWarnings` array but doesn't trigger `quality_flag: rules_violated`. Operators can review and decide.

---

## Maintenance discipline

- New cliches surface as cold-email vocabulary mutates. Add them to this file as encountered.
- When a touch passes hard validation but reads as machine-generated, the conversational-tone LLM eval should flag it; capture the offending phrase here for the next regex update.
- The Money20/20 USA fraud dog-food run on 2026-05-01 produced touches that passed hard validators but used "stuck with me" in the persona narrative — that's how this file got created. Keep iterating.
