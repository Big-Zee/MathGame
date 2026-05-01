# Research: Achievement Badges

**Feature**: `006-achievement-badges` | **Date**: 2026-05-01

---

## Decision 1 — Badge Logic Module Location

**Question**: Should badge logic live inline in `index.html` or in a new `js/badge-engine.js` module?

**Decision**: New `js/badge-engine.js` ES module, imported by `index.html` the same way `js/math-engine.js` is imported today.

**Rationale**: The badge check functions are pure calculations with no DOM dependency — identical in character to `math-engine.js`. Isolating them in a module enables `node --test` unit tests (Constitution Principle IV: Test-First). The import is a single `import { ... } from './js/badge-engine.js'` line — no build step, Azure SWA compatible, Principle VII compliant.

**Alternatives considered**:
- All badge logic inline in `index.html`: would make unit testing impossible without a browser (violates TDD principle); not chosen.
- Bundled with math-engine.js: mixes game-math concerns with badge concerns; hard to test independently; not chosen.

---

## Decision 2 — "Explorer" Badge Interpretation

**Question**: The spec defines "Explorer" as "Play a game on all 3 difficulty levels (Easy, Medium, Hard)" but the main quiz game has no difficulty selector. How should this be interpreted?

**Decision**: "Explorer" requires completing a Practice Mode session at each of the 3 difficulty levels (Easy, Medium, Hard). Difficulty selection is currently only available in Practice Mode. The badge hint on the Badges screen reads: "Complete a Practice session at each difficulty level."

**Rationale**: Adding a difficulty selector to the main game is significant scope creep and would violate FR-038 (self-contained, must not modify existing game logic). Practice Mode already has Easy/Medium/Hard selectors. Tracking difficulty completion within `mathblaster_practice_stats.difficultiesCompleted` is consistent with the other Practice badges.

**Alternatives considered**:
- Add difficulty selector to main game: out of scope; not chosen.
- "Explorer" based on timer ranges (5–10s = Hard, etc.): confuses the Time Lord badge; not chosen.
- Skip "Explorer" as unimplementable: would reduce badge count to 17; not chosen.

---

## Decision 3 — "Perfectionist" Badge Interpretation

**Question**: "Perfectionist" requires "Earn 3 stars on a game at Hard difficulty" but the main game has no difficulty. How should this be interpreted?

**Decision**: "Perfectionist" requires completing a Practice Mode session at Hard difficulty with 100% correct answers (every question in that session answered correctly). The badge hint reads: "Get every question right in a Hard Practice session."

**Rationale**: Same constraint as Decision 2 — no main game difficulty selector. Practice Mode Hard difficulty has the largest number ranges (most challenging arithmetic). 100% correct in Hard is a meaningful "Perfectionist" achievement. The `practiceSession.totalAnswered === practiceSession.totalCorrect` check is straightforward and deterministic.

**Alternatives considered**:
- Map "3 stars" to the existing score-based `calculateStars` on a Hard Practice session: Practice Mode has no score — not applicable.
- Map to `getAccuracyTier === 'master'` (highest tier in Practice): 'master' requires high accuracy but not 100%; "Perfectionist" name implies perfect; not chosen.

---

## Decision 4 — Per-Question Answer Time Tracking

**Question**: Speed badges require per-question elapsed time. This is not currently tracked. How do we calculate it?

**Decision**: At the moment `showFeedback(selectedChoice, timedOut)` is called, compute:
```
elapsedMs = (session.config.timerSeconds * 10 - session.timerTicks) * 100
```
`session.timerTicks` is already frozen by `stopTimer()` at the top of `showFeedback`, and `stopTimer()` is the first call in `showFeedback`. So `session.timerTicks` at this point represents the remaining ticks at the moment of answer. For a timed-out answer, `timerTicks` will be 0 or 1 (the tick that triggered the timeout), so elapsed ≈ `timerSeconds * 1000`.

Store per-question values in `session.answerTimesMs[]`. Push `elapsedMs` after computing it (in `showFeedback`, before badge checks).

**Rationale**: This is a single arithmetic expression using already-available state. No new global variables or timer callbacks needed.

**Alternatives considered**:
- Record `Date.now()` on question start and subtract on answer: would require a new `session.questionStartTime` field and a write in `renderQuestion()`; slightly more invasive than reading `timerTicks`; not chosen.

---

## Decision 5 — Popup Queue and `advanceRound` Gating

**Question**: When badges are earned mid-game, the popup must delay the next question's countdown. How do we gate `advanceRound` without modifying its internals?

**Decision**: When badges are earned in `showFeedback`, do NOT set `session.pendingAdvance`. Instead, pass `advanceRound` as a continuation callback to the popup queue's `onAllDismissed` handler. On the final popup dismiss, `onAllDismissed()` is called, which calls `advanceRound()` directly.

When no badges are earned, the existing `session.pendingAdvance = setTimeout(advanceRound, 1000)` path is unchanged.

For `showResults` / `showStopSummary` / `stopPractising`, the same pattern applies: the screen-show call is wrapped in an `onAllDismissed` callback.

**Rationale**: `advanceRound()` itself is never modified. The gate is entirely in the badge layer. This satisfies FR-038 (self-contained, must not modify existing game loop logic).

**Alternatives considered**:
- Set a module-level `badgePopupActive` flag and check it in `advanceRound`: would require modifying `advanceRound` — violates FR-038.
- Pause the `pendingAdvance` timeout by tracking remaining ms: complex, error-prone; not chosen.

---

## Decision 6 — Variety Badge Tracking Storage

**Question**: "Time Lord" and "Explorer" require tracking which timer values / difficulty levels have been used across sessions. Where to store this?

**Decision**: Fold into `mathblaster_practice_stats` for Practice-tracked attributes; add a separate `mathblaster_timers_used` key for timer tracking (which applies to main game only).

Final localStorage keys added by this feature:

| Key | Shape | Purpose |
|-----|-------|---------|
| `mathblaster_badges` | `{ [id]: { earned: bool, unlockedAt: ISO-string\|null } }` | All 18 badge states |
| `mathblaster_badges_new` | `"N"` (integer string) | Unviewed badge count |
| `mathblaster_practice_stats` | `{ sessionsCompleted: N, operationsCompleted: string[], difficultiesCompleted: string[], totalCorrect: N }` | Cumulative Practice stats |
| `mathblaster_timers_used` | `"5,15,30"` (CSV of seconds values) | Timer values used in completed games |

**Rationale**: Keeping practice-specific attributes together in one JSON object reduces key proliferation. Timer values are a simple integer set — stored as CSV string avoids JSON parse overhead.

---

## Decision 7 — Badge Check Sequence in `showFeedback`

**Question**: `showFeedback` schedules `session.pendingAdvance = setTimeout(advanceRound, 1000)` at the very end (after the game-over early-return path). Where exactly do badge checks insert?

**Decision**: Badge checks insert as the last logical step before the `setTimeout(advanceRound, 1000)` call. The exact position:

```
// ... existing showFeedback code up to: session.pendingAdvance = setTimeout(advanceRound, 1000)
//
// BADGE INSERTION POINT:
const elapsedMs = captureAnswerTime(session);
session.answerTimesMs.push(elapsedMs);
updateFastAnswerStreak(session, correct, elapsedMs);
const newBadges = checkBadgesAfterQuestion(session);
if (newBadges.length > 0) {
  awardBadges(newBadges);
  enqueueBadgePopups(newBadges, advanceRound);
  // → advanceRound is called by popup chain, NOT by setTimeout
} else {
  session.pendingAdvance = setTimeout(advanceRound, 1000);
}
```

This preserves the existing code path for the no-badge case and adds the badge path cleanly above it.

---

## Decision 8 — "Comeback Kid" Heart Count

**Question**: "Comeback Kid" requires winning after losing "exactly 2 hearts." Should this be `heartsLost === 2` or `heartsLost >= 2`?

**Decision**: Exactly 2 hearts lost (`3 - session.lives === 2` at game end, meaning 1 heart remains). The word "exactly" is in the spec's FR-024 ("having lost exactly 2 hearts"). This is also the interesting case — the player is on their last life and still pulls off a 3-star game.

**Rationale**: "Exactly 2" makes the badge harder and more memorable. With `>= 2`, losing all 3 hearts and still hitting 3 stars would qualify — but that ends in game-over which rarely produces 3 stars.

---

## Summary: All NEEDS CLARIFICATION Resolved

| Item | Resolution |
|------|-----------|
| Per-question time tracking | Compute from `timerTicks` at `showFeedback` call time |
| "Explorer" badge scope | Practice Mode: complete session at all 3 difficulty levels |
| "Perfectionist" badge scope | Practice Mode: 100% correct in a Hard session |
| Popup ↔ `advanceRound` gating | Callback passed through popup queue; `advanceRound` not modified |
| Badge logic location | `js/badge-engine.js` pure module |
| "Comeback Kid" condition | Exactly `3 - session.lives === 2` AND `calculateStars === 3` |
