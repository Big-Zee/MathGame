# Research: Adjustable Question Timer

**Branch**: `004-adjustable-timer` | **Date**: 2026-04-30
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All NEEDS CLARIFICATION items from the spec are resolved below, supplemented
by explicit planning constraints provided by the user.

---

## Decision 1 — Timer selector placement: Start screen (no new screen)

**Decision**: The timer selector widget is placed on the existing `#screen-start`,
below the rules list and above the `#btn-play` button. No new screen is added to
the main-game state machine.

**Rationale**: The user constraint is explicit: "Timer selector added to the existing
difficulty screen — no new screen needed." Since the main game has no difficulty screen,
the closest existing pre-game screen is `#screen-start`. Placing the selector there
requires the fewest changes to `showScreen()` routing and keeps the state machine identical
to the current 3-screen flow (Start → Game → Results).

**Alternatives considered**:
- New `#screen-setup` between Start and Game — rejected; the user explicitly prohibited a new screen.
- Collapsible/modal on Start screen — rejected; adds complexity and accessibility burden for 9–10 year olds.

---

## Decision 2 — localStorage key and value format

**Decision**: Key `mathblaster_timer_preference`; value is the integer number of
seconds stored as a string (e.g. `"15"`). Valid values: `5 | 10 | 15 | 20 | 25 | 30`.

**Rationale**: Specified explicitly by the user. Using the integer value (not an index)
makes the stored value human-readable and resilient to option reordering. Validation
on read: if the stored string is not in the valid set, fall back to 15 silently.

**Alternatives considered**: Storing the array index — rejected; brittle if options change.

---

## Decision 3 — Bonus threshold formula

**Decision**: `bonusThresholdSeconds = Math.floor(selectedSeconds * 0.5)` — computed
at game-start from the selected timer value. This supersedes the exact values in the
spec table for three options.

| Selected (s) | Formula result | Spec table | Adopted |
|---|---|---|---|
| 5  | 2 | 3  | **2** (formula) |
| 10 | 5 | 5  | 5 ✓ |
| 15 | 7 | 8  | **7** (formula) |
| 20 | 10 | 10 | 10 ✓ |
| 25 | 12 | 13 | **12** (formula) |
| 30 | 15 | 15 | 15 ✓ |

**Rationale**: The user provided the formula as an explicit technical constraint and
it supersedes the spec table. The differences are minor (±1 second) and the formula
approach is more maintainable — adding a new timer option requires no manual threshold
calculation. Unit tests will assert the formula output, not the spec table.

**Note**: For the 5-second timer, the effective bonus window is answering within
2 seconds of the question appearing (`timerTicks > (5-2)*10 = 30`). This is tight
but intentional for the "Super Speed! ⚡" challenge mode.

---

## Decision 4 — GameConfig isolation: derived config, not mutation

**Decision**: `GameConfig` remains a static immutable const. A new `getGameConfigForTimer(seconds)`
function returns `{ ...GameConfig, timerSeconds: seconds, timerBonusThreshold: Math.floor(seconds * 0.5) }`.
This derived config is passed to `startGame()` and used for the entire session.

**Rationale**: `applyTimerBonus(timerTicks, config)` already reads `config.timerSeconds` and
`config.timerBonusThreshold` dynamically — it requires no modification. All other functions
that receive `config` (updateStreak, calculateStars, generateRound) ignore the timer fields.
Mutating `GameConfig` would risk cross-session contamination and break the Practice Mode
session which reuses `GameConfig` via `getPracticeConfig`.

---

## Decision 5 — Countdown bar speed mechanism

**Decision**: The existing JS ticker approach (`setInterval` at 100ms, depleting
`session.timerTicks` from `selectedSeconds * 10` to 0) already produces exact timing.
The CSS `transition: width 0.1s linear` on `.timer-bar` remains unchanged — it smooths
per-tick updates only. No CSS `animation-duration` change is needed.

**Rationale**: With `session.timerTicks = selectedSeconds * 10` and a 100ms interval,
the bar always takes exactly `selectedSeconds` seconds to empty. The user constraint
"Countdown bar animation duration must be driven by the selected timer value" is
satisfied by setting `timerTicks` correctly, not by changing the CSS property.

---

## Decision 6 — TIMER_OPTIONS data structure location

**Decision**: `TIMER_OPTIONS` is a new named export from `js/math-engine.js` — an array
of 6 `{ seconds, label }` objects. The `bonusThresholdSeconds` is NOT stored in the array;
it is computed on demand by `getGameConfigForTimer` via the formula. This keeps the data
DRY and the formula as the single source of truth.

**Rationale**: Storing `bonusThresholdSeconds` in the array would create a redundancy:
any future change to the formula would also require updating 6 array entries. The formula
is authoritative; the array provides only display data (seconds value + label string).

---

## Decision 7 — Scope boundary: Practice Mode, scoring, questions untouched

**Decision**: Exactly `js/math-engine.js` and `index.html` are modified.
No changes to: `generateQuestion`, `generateRound`, `buildChoices`, `evaluateAnswer`,
`calculateStars`, `updateStreak`, `applyWrongAnswer`, `PracticeRanges`, `getPracticeConfig`,
`getAccuracyTier`, `ENCOURAGING_MESSAGES`, any practice screen HTML/JS, or
`.github/workflows/`.

**Rationale**: Explicit user constraint and Constitution VII (Deployment Integrity).
The timer feature is orthogonal to all question-generation and practice logic.
