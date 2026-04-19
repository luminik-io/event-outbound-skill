# Screenshots

Five screenshots to capture before the marketplace submission. The text-only placeholders below describe the shot; replace each with a real PNG (1600×1000, dark-mode Claude Code UI) before submitting.

## 01-invocation.md

User types in Claude Code:

> Create an outbound sequence for Money20/20 Europe 2026 targeting VP Marketing and Demand Gen Lead at fintech scaleups (200–2000 employees). Four week lead time, email plus LinkedIn. I'm sending from Prasad Pilla / Luminik.

Claude picks up the request and hands off to the `event-outbound` skill. The handoff banner is visible.

## 02-inputs.md

The skill validates the inputs. Shows:

- EventContext: Money20/20 Europe 2026, RAI Amsterdam, 2–4 June 2026, agenda titles pulled from money2020.com/europe.
- CompanyICP: industry "Fintech", sizeRange "200–2000", two personas with real priorities.
- SequenceParams: leadTimeWeeks 4, channels ["email","linkedin"], sendingIdentity filled.

## 03-generation.md

The sequencer running. The right rail shows a live log stream:

```
[T-28d linkedin] generating... attempt 1/3, temp 0.6
[T-28d linkedin] validation failed: subjectWordCount (5 words, max 4)
[T-28d linkedin] generating... attempt 2/3, temp 0.85
[T-28d linkedin] validation passed
[T-14d email]   generating... attempt 1/3, temp 0.6
[T-14d email]   validation passed
...
```

## 04-output.md

The final rendered markdown sequence for the VP Marketing persona. Six touches visible, each with its subject, body, and a `checks:` block underneath. Scroll bar indicates more touches below.

## 05-validation.md

A single touch expanded. The body reads like a real human wrote it. Below it, the `checks` block is expanded to show:

```
subjectWordCount: 3
allLowercase: true
bodyWordCount: 78
bannedWordsFound: []
youVsWeRatio: 3.5
quality_flag: (none)
```

This is the "trust but verify" screenshot. It is the one that closes the deal for sceptical buyers.

---

**Note for Prasad:** these placeholders exist so the marketplace bundle is structurally complete. The real screenshots need to be taken from a clean Claude Code session with the skill installed from the local path. See `SUBMISSION_CHECKLIST.md` step 2.
