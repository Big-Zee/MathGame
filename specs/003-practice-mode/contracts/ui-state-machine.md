# Contract: UI State Machine (Practice Mode Amendment)

**Amends**: `specs/001-math-quiz-game/contracts/ui-state-machine.md`
**Rendered by**: `index.html` (inline `<script type="module">`)
**Managed via**: CSS `display` toggling via existing `showScreen(id)` utility

---

## Screens — Complete Set (Main Game + Practice Mode)

| Screen ID | Visible when | Primary heading |
|-----------|-------------|-----------------|
| `#screen-start` | Initial load; after "Play Again"; after "Back to Start" | `<h1>` MathGame |
| `#screen-game` | Main quiz round in progress | `<h2>` Question N of 10 |
| `#screen-results` | Main quiz round complete | `<h2>` Round Complete |
| `#screen-practice-op` | Child taps "Practice Mode" | `<h2>` Practice Mode |
| `#screen-practice-diff` | Child selects an operation | `<h2>` Choose Difficulty |
| `#screen-practice-session` | Child confirms difficulty | `<h2>` [Op label] — [Diff label] |
| `#screen-practice-summary` | Child taps "Stop Practising" | `<h2>` Practice Complete |

All screens remain `hidden` except the one currently active. The existing `showScreen(id)`
function handles all transitions unchanged.

---

## Full State Transition Diagram

```
                     [Page load]
                          │
                          ▼
                   ┌─────────────┐
                   │   START     │◄──────────────────────────────────────────┐
                   │ #screen-    │◄──────────────────────┐                   │
                   │  start      │                       │ [Back to Start]   │ [Play Again]
                   └──────┬──────┘                       │                   │
                          │                              │                   │
             ┌────────────┴────────────┐                 │                   │
             │ [Play]                  │ [Practice Mode] │                   │
             ▼                         ▼                 │                   │
      ┌─────────────┐          ┌──────────────┐          │                   │
      │   GAME      │          │ PRACTICE_OP  │          │                   │
      │ #screen-    │          │ #screen-     │          │                   │
      │  game       │          │  practice-op │          │                   │
      └──────┬──────┘          └──────┬───────┘          │                   │
      [existing flow,                 │ [select op]       │                   │
       unchanged — see               ▼                   │                   │
       001 contract]         ┌──────────────┐            │                   │
             │               │ PRACTICE_    │            │                   │
             ▼               │ DIFF         │            │                   │
      ┌─────────────┐        │ #screen-     │            │                   │
      │  RESULTS    │        │  practice-   │            │                   │
      │ #screen-    │        │  diff        │            │                   │
      │  results    │        └──────┬───────┘            │                   │
      └─────────────┘               │ [select diff]      │                   │
                                    ▼                    │                   │
                            ┌──────────────┐             │                   │
                     ┌─────►│  PRACTICE_   │             │                   │
                     │      │  SESSION     │             │                   │
                     │      │ #screen-     │             │                   │
                     │      │  practice-   │             │                   │
                     │      │  session     │             │                   │
                     │      └──────┬───────┘             │                   │
                     │             │ [Stop Practising]   │                   │
                     │             ▼                     │                   │
                     │     ┌──────────────┐              │                   │
                     │     │  PRACTICE_   │              │                   │
                     │     │  SUMMARY     │──────────────┘                   │
                     │     │ #screen-     │                                  │
                     │     │  practice-   │──────────────────────────────────┘
                     │     │  summary     │ [Practise Again]
                     │     └─────────────┘
                     └──────────────────────────────────────────────────────┘
                       [Practise Again — same op+diff, new PracticeSession]
```

---

## PRACTICE_OP Screen

Triggered by: child taps `#btn-practice` on the Start screen.

**Content**: Four large operation buttons in a 2×2 grid.

| Element | ID | Label |
|---------|----|-------|
| Addition button | `#btn-op-add` | ➕ Addition |
| Subtraction button | `#btn-op-sub` | ➖ Subtraction |
| Multiplication button | `#btn-op-mul` | ✖️ Multiplication |
| Division button | `#btn-op-div` | ➗ Division |

**On tap**: Store selected operation in memory; `showScreen('screen-practice-diff')`.

---

## PRACTICE_DIFF Screen

Triggered by: child taps an operation button on PRACTICE_OP.

**Content**: Three difficulty buttons and a reminder of the chosen operation.

| Element | ID | Label |
|---------|----|-------|
| Easy button | `#btn-diff-easy` | Easy |
| Medium button | `#btn-diff-medium` | Medium |
| Hard button | `#btn-diff-hard` | Hard |
| Back link | `#btn-diff-back` | ← Back |

**On difficulty tap**: Create `practiceSession`, generate first question; `showScreen('screen-practice-session')`.
**On Back**: `showScreen('screen-practice-op')`.

---

## PRACTICE_SESSION Screen

Triggered by: difficulty confirmed.

**Always-visible header** (sticky within the card):

| Element | ID | Content |
|---------|----|---------|
| Mode label | `#practice-mode-label` | e.g., "➕ Addition — Easy" |
| Stop button | `#btn-stop-practice` | Stop Practising |

**Tally bar** (updates after every answer):

| Element | ID | Content |
|---------|----|---------|
| Questions answered | `#practice-answered` | "Answered: N" |
| Correct count | `#practice-correct` | "Correct: N" |
| Streak | `#practice-streak` | "🔥 N" (hidden when streak = 0) |

**Question area**:

| Element | ID | Content |
|---------|----|---------|
| Question text | `#practice-question` | e.g., "7 × 3 = ?" |
| Answer input | `#practice-input` | `<input type="number" inputmode="numeric">` |
| Check button | `#btn-check` | Check |
| Feedback area | `#practice-feedback` | Encouraging message or wrong-answer reveal |
| Next button | `#btn-next-question` | Next Question (hidden until feedback shown) |

**Submit flow** (Enter key or `#btn-check` click):

1. Read and parse `#practice-input` value.
2. Call `evaluateAnswer(practiceSession.currentQuestion, parsed)`.
3. If correct: show encouraging message (random from `ENCOURAGING_MESSAGES`), green highlight.
4. If wrong: reveal correct answer with kind message template.
5. Update tally: `totalAnswered++`; if correct `totalCorrect++`.
6. Update streak via `updateStreak(practiceSession.currentStreak, correct, GameConfig)`.
7. Show `#btn-next-question`; disable `#btn-check` and `#practice-input`.
8. On `#btn-next-question` click: clear feedback, generate next question, focus input.

**Feedback timing**: Rendered synchronously (within 100ms of submit), **no auto-advance delay**
— the child must click "Next Question" at their own pace. This is the key UX difference from
the main game's 1 000ms auto-advance.

**On `#btn-stop-practice`**: Derive `PracticeSummary` from session; `showScreen('screen-practice-summary')`.

---

## PRACTICE_SUMMARY Screen

Triggered by: `#btn-stop-practice` tapped from PRACTICE_SESSION.

| Element | ID | Content |
|---------|----|---------|
| Summary heading | — | "Practice Complete! 🎉" |
| Total answered | `#summary-answered` | "Questions: N" |
| Total correct | `#summary-correct` | "Correct: N out of N" |
| Accuracy | `#summary-accuracy` | "Accuracy: N%" |
| Best streak | `#summary-streak` | "Best streak: N 🔥" |
| Encouraging message | `#summary-message` | Accuracy-tier message (see data-model.md) |
| Practise Again button | `#btn-practise-again` | Practise Again |
| Back to Start button | `#btn-summary-home` | Back to Start |

**On `#btn-practise-again`**: Discard `practiceSession`; create new session with same operation
and difficulty; `showScreen('screen-practice-session')`.
**On `#btn-summary-home`**: Set `practiceSession = null`; `showScreen('screen-start')`.

---

## Keyboard Navigation (Practice Mode Extension)

| Key | Screen | Action |
|-----|--------|--------|
| `Tab` / `Shift+Tab` | All practice screens | Cycle focus through interactive elements |
| `Enter` | `#practice-input` focused | Submit answer (same as clicking Check) |
| `Enter` / `Space` | Any button | Activate button |
| No other bindings required | | |

Focus management on screen transitions:
- PRACTICE_OP shown → focus `#btn-op-add`
- PRACTICE_DIFF shown → focus `#btn-diff-easy`
- PRACTICE_SESSION shown / new question → focus `#practice-input`
- PRACTICE_SUMMARY shown → focus `#btn-practise-again`

---

## ARIA Roles & Landmarks (Practice Mode)

| Element | Role / Attribute |
|---------|-----------------|
| `#practice-mode-label` | `aria-live="off"` (static during session) |
| `#practice-feedback` | `aria-live="polite"` `aria-atomic="true"` |
| `#practice-answered`, `#practice-correct`, `#practice-streak` | grouped under `role="status"` container with `aria-live="polite"` |
| `#practice-input` | `<label for="practice-input">Your answer</label>` |
| `#btn-stop-practice` | always-visible; no `disabled` state |
| `#summary-message` | `aria-live="off"` (rendered once on screen load) |
