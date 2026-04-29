# Quickstart: Practice Mode

**Branch**: `003-practice-mode` | **Date**: 2026-04-29

For general setup (local server, deployment, base unit tests) see
[`specs/001-math-quiz-game/quickstart.md`](../001-math-quiz-game/quickstart.md).
This file covers Practice Mode-specific development and testing steps.

---

## Run the game locally

Same requirements as the main game: serve `index.html` over HTTP (ES modules require HTTP).

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Open `http://localhost:8080` and verify both **"▶ Play!"** and **"📚 Practice Mode"** buttons
appear on the Start screen.

---

## Practice Mode smoke test (manual)

1. Click **"📚 Practice Mode"** on the Start screen.
2. Verify the operation selector shows four buttons: ➕ Addition, ➖ Subtraction, ✖️ Multiplication, ➗ Division.
3. Select **Addition**.
4. Verify the difficulty selector shows three buttons: Easy, Medium, Hard, and a "← Back" link.
5. Click **Easy**.
6. Verify the practice session screen shows:
   - "➕ Addition — Easy" in the header.
   - A question in the form `a + b = ?` where both operands are in [1, 10].
   - An answer input field and a "Check" button.
   - A "Stop Practising" button.
   - Tally showing "Answered: 0 / Correct: 0".
7. Type the correct answer and press Enter — verify green highlight and an encouraging message.
8. Click "Next Question" — verify the tally updates and a new question appears.
9. Type a wrong answer and click "Check" — verify the correct answer is revealed with a kind message; tally "Answered" increments but "Correct" does not.
10. Click "Stop Practising" — verify the summary screen shows all five stats and the correct accuracy-tier message.
11. Click "Practise Again" — verify a fresh session starts with all counters at zero.
12. From a new session, click "Stop Practising" then "Back to Start" — verify the Start screen appears.

---

## Unit tests for new math-engine.js exports

Run all tests (existing + new):

```bash
node --test tests/math-engine.test.js
```

Expected new test cases (written **before** implementation per Constitution IV):

```
▶ getPracticeConfig
  ✔ returns config with correct numberRanges for easy/add (Xms)
  ✔ returns config with correct numberRanges for hard/mul (Xms)
  ✔ hard/add ranges match GameConfig.numberRanges.add (Xms)
▶ generateQuestion with bMax constraint
  ✔ add: b never exceeds bMax when bMax is set (Xms)
  ✔ sub: b never exceeds bMax when bMax is set (Xms)
  ✔ existing add behavior unchanged when bMax is null (Xms)
  ✔ existing sub behavior unchanged when bMax is null (Xms)
▶ ENCOURAGING_MESSAGES
  ✔ array has at least 1 entry (Xms)
  ✔ all entries are non-empty strings (Xms)
▶ PracticeRanges
  ✔ hard tier add ranges equal GameConfig.numberRanges.add (Xms)
  ✔ hard tier mul ranges equal GameConfig.numberRanges.mul (Xms)
▶ Practice accuracy tier
  ✔ 100% accuracy → 'master' tier (Xms)
  ✔ 90% accuracy → 'master' tier (Xms)
  ✔ 89% accuracy → 'amazing' tier (Xms)
  ✔ 70% accuracy → 'amazing' tier (Xms)
  ✔ 69% accuracy → 'good' tier (Xms)
  ✔ 50% accuracy → 'good' tier (Xms)
  ✔ 49% accuracy → 'keep-going' tier (Xms)
  ✔ 0 answered → 0% accuracy → 'keep-going' tier (Xms)
```

All existing tests must still pass — the `bMax: null` backward-compatibility guarantee is
verified by the "existing behavior unchanged when bMax is null" tests.

---

## Key IDs for browser testing / Playwright automation

| ID | Element |
|----|---------|
| `#btn-practice` | "Practice Mode" button on Start screen |
| `#btn-op-add` | Addition option on PRACTICE_OP screen |
| `#btn-op-sub` | Subtraction option |
| `#btn-op-mul` | Multiplication option |
| `#btn-op-div` | Division option |
| `#btn-diff-easy` | Easy difficulty |
| `#btn-diff-medium` | Medium difficulty |
| `#btn-diff-hard` | Hard difficulty |
| `#btn-diff-back` | Back to operation selector |
| `#practice-mode-label` | "Op — Difficulty" label in session header |
| `#practice-question` | Question text |
| `#practice-input` | Answer text input |
| `#btn-check` | Check / Submit button |
| `#practice-feedback` | Feedback message area |
| `#btn-next-question` | Next Question button (hidden until answer submitted) |
| `#practice-answered` | "Answered: N" tally |
| `#practice-correct` | "Correct: N" tally |
| `#practice-streak` | "🔥 N" streak (hidden when 0) |
| `#btn-stop-practice` | Stop Practising button |
| `#summary-answered` | Summary: total answered |
| `#summary-correct` | Summary: correct count |
| `#summary-accuracy` | Summary: accuracy % |
| `#summary-streak` | Summary: best streak |
| `#summary-message` | Summary: accuracy-tier encouraging message |
| `#btn-practise-again` | Practise Again button |
| `#btn-summary-home` | Back to Start button |

---

## Accessibility check (Practice Mode)

Run the same axe / Lighthouse audit as the main game, but navigate to each Practice Mode
screen before scanning:

1. Start screen (with Practice Mode button visible)
2. Operation selector
3. Difficulty selector
4. Practice session (with a question displayed)
5. Practice summary

Target: zero axe critical/serious violations on all five screens. Manual keyboard check:
Tab to "Practice Mode" → Enter → Tab to an operation → Enter → Tab to a difficulty → Enter
→ type answer in input → Enter to submit → Tab to "Next Question" → Enter → Tab to
"Stop Practising" → Enter → Tab to "Practise Again" → Enter.
