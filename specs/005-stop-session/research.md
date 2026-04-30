# Research: Stop Session

**Branch**: `005-stop-session` | **Date**: 2026-04-30

All findings derived from reading the existing `index.html` and `js/math-engine.js`.

---

## Decision 1 — Timer Bar Is JS-Driven (No Independent CSS Animation)

**Decision**: The timer bar width is set exclusively via `bar.style.width` inside the 100ms `setInterval` callback in `startTimer()`. The only CSS is `transition: width 0.1s linear` under `@media (prefers-reduced-motion: no-preference)` — a CSS *transition*, not a CSS *animation*. Transitions only animate when the JS value changes; when the interval is cleared, the last-written width stays frozen.

**Rationale**: Clearing the interval (`stopTimer()`) is sufficient to freeze both the JS countdown (`session.timerTicks` stops decrementing) and the visual bar (no more `updateTimerBar()` calls). SC-002 ("±1 CSS pixel immediately before and after dismiss") is met automatically by preserving `session.timerTicks` — when the overlay is dismissed, the bar is redrawn from the preserved value.

**Implication for implementation**: No `animation-play-state` manipulation needed. `stopTimer()` → visual freeze. A new `resumeTimer()` that starts the interval from `session.timerTicks` (without resetting it) → visual resume.

---

## Decision 2 — `stopTimer()` Already Exists; Need a Companion `resumeTimer()`

**Decision**: The existing `stopTimer()` function (index.html:665–670) clears `session.timerHandle` and nulls it. It is already used in `showFeedback()`. `startTimer()` (index.html:672–683) always *resets* `session.timerTicks` from `session.config.timerSeconds * 10` before starting the interval — so it cannot be reused for resume.

A new `resumeTimer()` function is needed: starts the interval from the current (preserved) `session.timerTicks` without overwriting it.

---

## Decision 3 — Stop Button Lives Inside `#screen-game`, Positioned Absolutely

**Decision**: `#btn-stop-game` is placed inside `<section id="screen-game">` with `position: absolute; top: 16px; right: 16px`. The section becomes `position: relative`. This approach:
- Requires zero changes to the existing `game-header` flex layout (hearts + score stay as-is)
- Ensures the button is naturally hidden whenever `showScreen()` hides `#screen-game`
- Automatically satisfies FR-002 (absent on start, results, practice screens) with no extra logic
- Does not overlap the question text, timer bar, or choice buttons

Existing `.btn-stop` CSS class (index.html:272–288) already provides correct styling (red background, `min-height: 44px`) and is used by `#btn-stop-practice` in Practice Mode.

---

## Decision 4 — `#screen-stop-summary` Is a New Section (Reuses Existing CSS Classes)

**Decision**: Create a new `<section id="screen-stop-summary">` rather than reusing `#screen-results`. The user constraint says "reuses the existing results screen HTML structure" — this means identical CSS classes (`.stars`, `.result-score`, `.result-correct`, `.result-highscore`, `.result-new-highscore`, `.summary-stats`, `.summary-message`) applied to new elements with new IDs.

This keeps `#screen-results` and the normal `showResults()` flow completely unchanged (per the spec assumption), while giving `#screen-stop-summary` its own distinct `<h2>Session stopped early 🛑</h2>` header and its own set of DOM IDs.

---

## Decision 5 — High Score Save Path Reuses `setHighScore()`; New Flag Functions Added to math-engine.js

**Decision**: The user constraint states "leaderboard save flow is identical to the normal game — no new code path needed, just pass the partial session score object." Implementation:

```js
// Inside showStopSummary():
if (session.questionsAnswered >= 1) {
  const prevHigh = getHighScore();
  const isNewHigh = session.score > prevHigh;
  if (isNewHigh) {
    setHighScore(session.score);    // existing function, unchanged
    setEarlyStopFlag();              // new: writes mathgame_highscore_early = "1"
  }
}
```

Three new `localStorage` helper exports added to `js/math-engine.js`:
- `getEarlyStopFlag()` → `boolean`
- `setEarlyStopFlag()` → `void`
- `clearEarlyStopFlag()` → `void`

These mirror the existing `getHighScore`/`setHighScore` pattern. `clearEarlyStopFlag()` is called in `showResults()` when a completed game sets a new high score (same place `setHighScore()` is already called).

---

## Decision 6 — Two New Testable Pure Exports for Accuracy Logic

**Decision**: Add `calculateEarlyStopStars(totalAnswered, totalCorrect)` and `getEarlyStopMessage(totalAnswered, totalCorrect)` to `js/math-engine.js`. These are pure functions (no DOM, no localStorage) — constitution-compliant, fully unit-testable.

Constitution IV mandates failing tests before implementation. Both functions require TDD.

The existing `calculateStars(score, config)` is score-based and remains unchanged. The new function is accuracy-based:

```
pct = totalAnswered === 0 ? 0 : Math.round(totalCorrect / totalAnswered * 100)
stars: pct >= 80 → 3  |  pct >= 50 → 2  |  pct >= 0 → 1  |  totalAnswered === 0 → 0
```

---

## Decision 7 — `stopOverlayActive` Flag Guards `startTimer()` Against Double-Start

**Decision**: A module-level boolean `let stopOverlayActive = false` is needed to prevent a race condition: if `advanceRound`'s `setTimeout(advanceRound, 1000)` fires while the stop overlay is open (possible if the child opens the overlay during feedback and the 1-second timeout elapses), `renderQuestion()` would call `startTimer()`, which would start the interval even though the overlay is showing.

Guard added to `startTimer()`: `if (stopOverlayActive) return;`

Per the spec edge case, the `setTimeout` for `advanceRound` is not cleared — it continues running. If it fires while the overlay is open, the question silently advances. When the child dismisses the overlay with "Keep playing," `hideStopOverlay()` checks `session.phase`:
- `'question'` → call `resumeTimer()` (interval was prevented by the guard; now safe to start)
- `'feedback'` → do nothing (timer was already stopped before the overlay appeared)

This is a safe, minimal addition with no behavioral change for the common path.

---

## Decision 8 — Escape Key Handled via `document` `keydown` Listener

**Decision**: A single `document.addEventListener('keydown', ...)` handler checks `if (e.key === 'Escape' && stopOverlayActive)` and calls `hideStopOverlay()`. This matches the spec (FR-005) and is consistent with the existing `practice-input` keydown pattern (index.html:1071–1073). No changes to existing keyboard handlers.

---

## Decision 9 — `renderHighScore()` Extracted as a Function

**Decision**: The existing high-score display init code (index.html:877–880) is a one-shot inline block. It needs to become a callable `renderHighScore()` function because it must be re-run in three places:
1. On `DOMContentLoaded` (existing)
2. After `showStopSummary()` populates the stop summary screen (so the start screen is pre-updated for when the child taps "Main Menu")
3. After `showResults()` when a completed game may clear the 🛑 flag

`renderHighScore()` reads `getHighScore()` and `getEarlyStopFlag()` and updates `#start-highscore` accordingly.
