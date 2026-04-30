# Tasks: Adjustable Question Timer

**Branch**: `004-adjustable-timer` | **Date**: 2026-04-30
**Input**: Design documents from `specs/004-adjustable-timer/`
**Prerequisites**: plan.md ✓, spec.md ✓, data-model.md ✓, contracts/ ✓, research.md ✓, quickstart.md ✓

**Constitution IV — Test-First**: All four new `math-engine.js` exports require FAILING tests before implementation. Each US phase below follows Red → Green order.

**Source changes**: `js/math-engine.js` (+4 exports) · `index.html` (+selector widget, +HUD label, +startGame amendment) · `tests/math-engine.test.js` (+13 test cases)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4)

---

## Phase 1: Setup

**Purpose**: Confirm baseline before any changes are made.

- [x] T001 Run `node --test tests/math-engine.test.js` and record that all 56 existing tests pass (establishes green baseline)

---

## Phase 2: User Story 1 — Timer Selector UI on Start Screen (Priority: P1) 🎯 MVP

**Goal**: The child sees a ◀/▶ timer selector on the Start screen, default 15 s "Normal 🎯", and can cycle through all six options with immediate label updates.

**Independent Test**: Load Start screen; verify selector visible with "15s · Normal 🎯". Tap ▶ → "20s · Relaxed 😊". Tap ▶ four times → wraps through 25, 30, 5. Tap ◀ → 5 → 30 wrap. This is testable without starting a game.

### Tests for US1 (TDD — write FIRST, confirm FAIL before T004)

- [x] T002 [US1] Write 4 failing tests for `TIMER_OPTIONS` suite in `tests/math-engine.test.js`: (1) has exactly 6 entries, (2) index 2 has seconds === 15, (3) entries ordered ascending by seconds, (4) all entries have non-empty label strings
- [x] T003 [US1] Run `node --test tests/math-engine.test.js` and confirm T002 tests fail while all 56 existing tests still pass

### Implementation for US1

- [x] T004 [US1] Add `export const TIMER_OPTIONS` (6-entry `{seconds, label}` array per data-model.md) to `js/math-engine.js`
- [x] T005 [US1] Run `node --test tests/math-engine.test.js` and confirm all 4 TIMER_OPTIONS tests now pass (60 total passing)
- [x] T006 [US1] Add `let selectedTimerIndex = 2` module-level variable and import `TIMER_OPTIONS` in the inline `<script type="module">` in `index.html`
- [x] T007 [US1] Add `#timer-selector` HTML group to `#screen-start` (between rules list and `#btn-play`): container with `role="group"` `aria-labelledby="timer-selector-label"`, label `#timer-selector-label`, `#btn-timer-prev` (◀, `aria-label="Previous timer option"`), `#timer-value-display` (`aria-live="polite"` `aria-atomic="true"`), `#timer-label-display` (`aria-live="polite"` `aria-atomic="true"`), `#btn-timer-next` (▶, `aria-label="Next timer option"`) in `index.html`
- [x] T008 [US1] Add CSS for `.timer-selector` layout and `.btn-timer-nav` (minimum 44×44 CSS px touch target) in `index.html`
- [x] T009 [US1] Implement `renderTimerSelector()` function that reads `TIMER_OPTIONS[selectedTimerIndex]` and updates `#timer-value-display` (e.g. "15s") and `#timer-label-display` (e.g. "Normal 🎯") in `index.html`
- [x] T010 [US1] Add click handler for `#btn-timer-prev`: decrement `selectedTimerIndex` with wrap `(0 → 5)`, call `renderTimerSelector()` in `index.html`
- [x] T011 [US1] Add click handler for `#btn-timer-next`: increment `selectedTimerIndex` with wrap `(5 → 0)`, call `renderTimerSelector()` in `index.html`
- [x] T012 [US1] Initialize `selectedTimerIndex = 2` and call `renderTimerSelector()` on `DOMContentLoaded` in `index.html`

**Checkpoint**: Timer selector visible on Start screen, ◀/▶ cycle all 6 options, default 15 s — US1 fully testable without playing a game.

---

## Phase 3: User Story 2 — Timer Duration Drives Countdown and Speed Bonus (Priority: P2)

**Goal**: The countdown bar depletes in exactly the selected seconds; speed bonus threshold = `Math.floor(seconds × 0.5)` for whichever timer is active.

**Independent Test**: Select "Super Speed! ⚡" (5 s), start game, verify bar empties in 5 s; answer within 2 s → speed bonus awarded; answer after 2 s → no bonus.

### Tests for US2 (TDD — write FIRST, confirm FAIL before T015)

- [x] T013 [US2] Write 5 failing tests for `getGameConfigForTimer` suite in `tests/math-engine.test.js`: (1) returns config with `timerSeconds` matching input, (2) `timerBonusThreshold === Math.floor(seconds * 0.5)` for all 6 TIMER_OPTIONS values, (3) all other GameConfig fields unchanged, (4) `applyTimerBonus` works correctly with `getGameConfigForTimer(5)`, (5) `applyTimerBonus` works correctly with `getGameConfigForTimer(30)`
- [x] T014 [US2] Run `node --test tests/math-engine.test.js` and confirm T013 tests fail while all 60 previous tests still pass

### Implementation for US2

- [x] T015 [US2] Add `export function getGameConfigForTimer(seconds)` returning `{ ...GameConfig, timerSeconds: seconds, timerBonusThreshold: Math.floor(seconds * 0.5) }` to `js/math-engine.js`
- [x] T016 [US2] Run `node --test tests/math-engine.test.js` and confirm all 5 `getGameConfigForTimer` tests now pass (65 total passing)
- [x] T017 [US2] Import `getGameConfigForTimer` in the inline `<script type="module">` in `index.html`
- [x] T018 [US2] Amend `startGame()` signature to `startGame(timerOption)`; set `session.timerTicks = timerOption.seconds * 10` inside `startGame` in `index.html`
- [x] T019 [US2] Derive `const cfg = getGameConfigForTimer(timerOption.seconds)` inside `startGame`; replace all direct `GameConfig` timer-field references (`timerSeconds`, `timerBonusThreshold`) with `cfg` in `index.html`
- [x] T020 [US2] Update `#btn-play` click handler to call `startGame(TIMER_OPTIONS[selectedTimerIndex])` in `index.html`
- [x] T021 [US2] Update Play Again button handler to call `startGame(TIMER_OPTIONS[selectedTimerIndex])` in `index.html`

**Checkpoint**: All 6 timer values produce correct countdown duration and speed bonus threshold in a live game round.

---

## Phase 4: User Story 3 — Selected Timer Shown in Game HUD (Priority: P3)

**Goal**: A "⏱️ Xs" label appears near the countdown bar during gameplay so the child always knows which timer is active.

**Independent Test**: Select "Fast! 🚀" (10 s), start game; verify "⏱️ 10s" label visible adjacent to countdown bar throughout the round and on each new question.

### Implementation for US3 (no new math-engine exports — no TDD phase needed)

- [x] T022 [US3] Add `<span id="timer-hud-label" aria-hidden="true"></span>` adjacent to the countdown bar element in `#screen-game` in `index.html`
- [x] T023 [US3] Set `document.getElementById('timer-hud-label').textContent = \`⏱️ \${timerOption.seconds}s\`` at the start of `startGame` (before first question renders) in `index.html`

**Checkpoint**: HUD label shows correct value for any selected timer; does not change during the round; resets correctly on Play Again.

---

## Phase 5: User Story 4 — Timer Preference Persisted Across Sessions (Priority: P4)

**Goal**: Selected timer is saved to `localStorage` (`mathblaster_timer_preference`) when Play! is tapped; restored as pre-selected on next page load.

**Independent Test**: Select "Relaxed 😊" (20 s), tap Play!, reload page; verify selector shows 20 s without any interaction.

### Tests for US4 (TDD — write FIRST, confirm FAIL before T027)

- [x] T024 [US4] Write 4 failing tests for `getTimerPreference` suite in `tests/math-engine.test.js`: (1) returns 15 when localStorage is empty, (2) returns saved value when a valid seconds value is stored, (3) returns 15 for an invalid stored value (e.g. "99"), (4) returns 15 for a non-numeric stored value (e.g. "abc")
- [x] T025 [US4] Run `node --test tests/math-engine.test.js` and confirm T024 tests fail while all 65 previous tests still pass

### Implementation for US4

- [x] T026 [P] [US4] Add `export function getTimerPreference()` to `js/math-engine.js`: reads `globalThis.localStorage?.getItem('mathblaster_timer_preference')`, parses to integer, validates against `TIMER_OPTIONS` seconds values, returns valid integer or `15` as fallback — never throws
- [x] T027 [P] [US4] Add `export function setTimerPreference(seconds)` to `js/math-engine.js`: calls `globalThis.localStorage?.setItem('mathblaster_timer_preference', String(seconds))` — silently no-ops if localStorage unavailable
- [x] T028 [US4] Run `node --test tests/math-engine.test.js` and confirm all 4 `getTimerPreference` tests now pass (69 total passing)
- [x] T029 [US4] Import `getTimerPreference` and `setTimerPreference` in the inline `<script type="module">` in `index.html`
- [x] T030 [US4] Replace `selectedTimerIndex = 2` initialization in `DOMContentLoaded` with: `const savedSeconds = getTimerPreference(); selectedTimerIndex = TIMER_OPTIONS.findIndex(o => o.seconds === savedSeconds); if (selectedTimerIndex === -1) selectedTimerIndex = 2;` in `index.html`
- [x] T031 [US4] Add `setTimerPreference(TIMER_OPTIONS[selectedTimerIndex].seconds)` call inside `#btn-play` click handler, immediately before `startGame(...)` in `index.html`

**Checkpoint**: Selected timer survives page reload; corrupt/missing localStorage falls back to 15 s silently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation — test suite, accessibility audit, manual smoke test.

- [x] T032 Run `node --test tests/math-engine.test.js` and confirm all 69 tests pass (56 existing + 13 new): 4 TIMER_OPTIONS + 5 getGameConfigForTimer + 4 getTimerPreference
- [x] T033 [P] Accessibility audit in `index.html`: verify `#timer-selector` has `role="group"` + `aria-labelledby="timer-selector-label"`; `#timer-value-display` and `#timer-label-display` have `aria-live="polite"` `aria-atomic="true"`; `#timer-hud-label` has `aria-hidden="true"`
- [x] T034 [P] Keyboard navigation check: Tab to `#btn-timer-prev`, Enter activates it; Tab to `#btn-timer-next`, Space activates it; Tab to `#btn-play`; focus ring visible on all three
- [x] T035 Run manual 10-step smoke test from `specs/004-adjustable-timer/quickstart.md` (default pre-select, ▶ sequence, wrap, gameplay countdown, speed bonus, reload persistence, classic 15 s regression)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Setup; required by all subsequent phases
- **US2 (Phase 3)**: Depends on US1 (needs `TIMER_OPTIONS` and `selectedTimerIndex`)
- **US3 (Phase 4)**: Depends on US2 (`startGame(timerOption)` signature must exist)
- **US4 (Phase 5)**: Depends on US1 (needs `TIMER_OPTIONS` for findIndex lookup)
- **Polish (Phase 6)**: Depends on all user story phases complete

### Within Each User Story

- Tests MUST be written and confirmed **FAILING** before implementation begins
- T004 (TIMER_OPTIONS) before T015 (getGameConfigForTimer) — former is used by the latter
- T015 before T018 (startGame amendment) — needs `getGameConfigForTimer` imported
- T026/T027 can run in parallel — independent functions in same file [P]

### Parallel Opportunities

- T026 and T027 [P] — `getTimerPreference` and `setTimerPreference` touch disjoint code paths
- T033 and T034 [P] — accessibility and keyboard audits are independent read-only checks
- Within each TDD test-writing task, all `it()`/`test()` blocks can be written in one pass

---

## Parallel Example: US4

```
# Two exports can be implemented in parallel:
Task T026: Add getTimerPreference() to js/math-engine.js
Task T027: Add setTimerPreference(seconds) to js/math-engine.js
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Baseline check
2. Phase 2 (US1): Timer selector on Start screen — child sees ◀/▶ selector and can cycle options
3. **STOP and VALIDATE**: A child who plays at 15 s (default) gets the identical classic experience
4. Deploy/demo — safe non-breaking MVP

### Incremental Delivery

1. Setup → US1 → validates selector UI independently (MVP)
2. Add US2 → validates that selected timer drives countdown + bonus
3. Add US3 → validates HUD label during gameplay
4. Add US4 → validates persistence across page reloads
5. Polish → full test suite + accessibility audit + smoke test

---

## Notes

- `setTimerPreference` has no dedicated unit tests — it is a thin `localStorage` write with no return value; integration coverage comes from the `getTimerPreference` round-trip tests
- `GameConfig` is **never mutated** — `getGameConfigForTimer` always spreads it; existing tests that assert `GameConfig.timerSeconds === 15` continue to pass
- Practice Mode screens and logic are **not touched** — no tasks reference practice HTML or JS
- Bonus threshold formula (`Math.floor(seconds * 0.5)`) is the authoritative source; the spec table values for 5 s, 15 s, 25 s differ by ±1 s — tests assert the formula, not the table
