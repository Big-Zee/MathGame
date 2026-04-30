# Tasks: Stop Session

**Input**: Design documents from `specs/005-stop-session/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story. US1–US6 map to spec.md Priority P1–P6.

**TDD note**: Constitution IV mandates failing tests BEFORE implementation for `calculateEarlyStopStars` and `getEarlyStopMessage`. Phase 2 enforces Red→Green order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US6)
- Exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify the existing test suite is green before any changes. Establishes a baseline.

- [X] T001 Run existing tests with `node --test tests/math-engine.test.js` and confirm all pass before any code changes

**Checkpoint**: Test suite green — safe to add new failing tests in Phase 2.

---

## Phase 2: Foundational — TDD for New `js/math-engine.js` Exports

**Purpose**: Add the two pure testable functions (TDD) and three localStorage wrappers. This phase MUST complete before any HTML/JS in index.html is touched.

**⚠️ TDD ORDER**: Write FAILING tests first (T002), confirm they fail (T003), THEN implement (T004), THEN confirm green (T005).

- [X] T002 Write failing tests for `calculateEarlyStopStars` (≥6 cases) and `getEarlyStopMessage` (≥5 cases) in `tests/math-engine.test.js` — do NOT implement yet; tests must fail at this point
- [X] T003 Run `node --test tests/math-engine.test.js` and confirm the new tests FAIL (Red phase confirmed)
- [X] T004 Implement `calculateEarlyStopStars`, `getEarlyStopMessage`, `getEarlyStopFlag`, `setEarlyStopFlag`, `clearEarlyStopFlag` as exports in `js/math-engine.js`
- [X] T005 Run `node --test tests/math-engine.test.js` and confirm ALL tests pass (Green phase confirmed)

**Test cases required for T002**:

`calculateEarlyStopStars`:
- `(0, 0)` → `0`
- `(10, 10)` → `3` (100%)
- `(10, 8)` → `3` (80%)
- `(10, 7)` → `2` (70%)
- `(10, 5)` → `2` (50%)
- `(10, 4)` → `1` (40%)
- `(6, 4)` → `2` (67%, rounds to 67 ≥ 50)

`getEarlyStopMessage`:
- `(0, 0)` → `"You didn't answer any questions yet — give it a go! 😊"`
- `(10, 8)` → `"Brilliant effort, you were on fire! 🔥"` (80%)
- `(10, 7)` → `"Great session, keep building on this! 💪"` (70%)
- `(10, 5)` → `"Great session, keep building on this! 💪"` (50%)
- `(10, 4)` → `"Every question counts, well done for trying! 🧠"` (40%)

**Checkpoint**: `js/math-engine.js` has 5 new exports; all tests green. `index.html` is unchanged.

---

## Phase 3: User Story 1 — Stop Button on Game Screen (Priority: P1) 🎯 MVP

**Goal**: `#btn-stop-game` appears in the top-right corner of `#screen-game` only — absent from all other screens.

**Independent Test**: Quickstart Scenario 1 — start game, verify stop button visible on every question and feedback phase; navigate to Practice Mode and Start screen and verify button absent.

- [X] T006 [US1] Add CSS to `index.html` `<style>` block: `#screen-game { position: relative; }`, `#btn-stop-game { position: absolute; top: 16px; right: 16px; font-size: 0.85rem; padding: 6px 12px; min-width: 44px; min-height: 44px; z-index: 1; }`, and **I4 fix**: `.game-header { padding-right: 64px; }` to prevent visual overlap with `#score-display`
- [X] T007 [US1] Add `<button id="btn-stop-game" class="btn-stop" aria-label="Stop game">⛔ Stop</button>` as first child inside `<section id="screen-game">` in `index.html`, immediately after the opening `<section>` tag and before the `<header class="game-header">` element

**Checkpoint**: Load `index.html`, start a game — ⛔ Stop button visible top-right. Navigate to Practice Mode and Start screen — button invisible. No layout breakage in game-header.

---

## Phase 4: User Story 2 — Confirmation Overlay (Priority: P2)

**Goal**: Tapping ⛔ Stop shows an in-page confirmation overlay; "Keep playing ▶️" dismisses it without changing game state; "Yes, stop 🛑" ends the session.

**Independent Test**: Quickstart Scenarios 2, 3, 10 — overlay appears with correct text, focus lands on "Keep playing", Escape dismisses, double-tap prevented.

- [X] T008 [US2] Add overlay CSS to `index.html` `<style>` block: `.stop-overlay`, `.stop-overlay-card`, `.stop-overlay-title`, `.stop-overlay-subtitle`, `.stop-overlay-card .btn` per plan.md Phase B §1
- [X] T009 [US2] Add `<div id="stop-confirm-overlay" class="stop-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="stop-confirm-title">` with inner card containing `#stop-confirm-title`, subtitle, `#btn-keep-playing`, and `#btn-confirm-stop` as the **last child** of `<section id="screen-game">` in `index.html`
- [X] T010 [US2] Add `let stopOverlayActive = false;` module-level state in the `<script type="module">` block of `index.html`
- [X] T011 [US2] Add `showStopOverlay()` function to `index.html` script: double-tap guard → set `stopOverlayActive = true` → call `stopTimer()` → unhide `#stop-confirm-overlay` → focus `#btn-keep-playing`
- [X] T012 [US2] Add `hideStopOverlay()` function to `index.html` script: set `stopOverlayActive = false` → hide `#stop-confirm-overlay` → if `session.phase === 'question'`: call `resumeTimer()` then focus first `.choice-btn` in `#choices-container`; else focus `#btn-stop-game` (stub call — `resumeTimer` implemented in Phase 5)
- [X] T013 [US2] Add event listener: `document.getElementById('btn-stop-game').addEventListener('click', showStopOverlay)` in `index.html` script
- [X] T014 [US2] Add event listener: `document.getElementById('btn-keep-playing').addEventListener('click', hideStopOverlay)` in `index.html` script
- [X] T015 [US2] Add Escape key listener: `document.addEventListener('keydown', e => { if (e.key === 'Escape' && stopOverlayActive) hideStopOverlay(); })` in `index.html` script
- [X] T016 [US2] **I3 fix** — add guard at top of `showResults()` in `index.html` script: `if (stopOverlayActive) { stopOverlayActive = false; document.getElementById('stop-confirm-overlay').hidden = true; }` to prevent orphaned overlay state when the 1200ms game-over timeout fires while overlay is active

**Checkpoint**: Quickstart Scenarios 2, 3, 10 pass. `#btn-confirm-stop` click does nothing useful yet (US4 not wired) but no JS errors.

---

## Phase 5: User Story 3 — Timer Pauses During Confirmation (Priority: P3)

**Goal**: Timer freezes on overlay open and resumes from exact preserved value on "Keep playing ▶️".

**Independent Test**: Quickstart Scenarios 4, 5 — timer bar width identical before and after overlay; no double-start in feedback phase.

- [X] T017 [US3] Add `session.bestStreak: 0` field to `newSession()` in `index.html` script (needed by showStopSummary in US4 and tracked here)
- [X] T018 [US3] **I2 fix (part 1)** — in `newSession()`, add `pendingAdvance: null` and `pendingGameOver: null` fields; in `showFeedback()`, replace bare `setTimeout(advanceRound, 1000)` with `session.pendingAdvance = setTimeout(advanceRound, 1000)` and replace bare `setTimeout(showResults, 1200)` with `session.pendingGameOver = setTimeout(showResults, 1200)` in `index.html` script
- [X] T019 [US3] **I1 fix** — in `startTimer()` in `index.html` script, ensure order is: `session.timerTicks = session.config.timerSeconds * 10; updateTimerBar();` FIRST, then `if (stopOverlayActive) return;` THEN `session.timerHandle = setInterval(...)`. This ensures the bar resets visually even when guarded.
- [X] T020 [US3] Add `resumeTimer()` function to `index.html` script: call `updateTimerBar()` → start `setInterval` that decrements `session.timerTicks`, calls `updateTimerBar()`, and on `<= 0` calls `stopTimer()` + `showFeedback(null, true)`. Does NOT reset `session.timerTicks`.
- [X] T021 [US3] Update `hideStopOverlay()` in `index.html` script to call the now-implemented `resumeTimer()` (replacing any stub) — confirm the `if (session.phase === 'question') resumeTimer()` branch is correct

**Checkpoint**: Quickstart Scenarios 4, 5 pass. Timer bar freezes on overlay open; resumes from same position. No double-interval in feedback phase.

---

## Phase 6: User Story 4 — Early-Stop Summary Screen (Priority: P4)

**Goal**: `#screen-stop-summary` shows accurate partial-session stats with accuracy-based stars and message.

**Independent Test**: Quickstart Scenarios 6, 7 — 6-question example shows correct stats, 0-question edge case handled.

- [X] T022 [US4] Add `#screen-stop-summary` CSS to `index.html` `<style>` block: `#screen-stop-summary .summary-stats { margin: 12px 0; }` and `#btn-stop-play-again { margin-top: 10px; }`
- [X] T023 [US4] Add `<section id="screen-stop-summary" hidden>` HTML to `index.html` immediately after the closing `</section>` of `#screen-results`, containing: `<h2>Session stopped early 🛑</h2>`, `#stop-stars-container`, `.summary-stats` div with 7 `<p>` elements (`#stop-questions-answered`, `#stop-correct`, `#stop-incorrect`, `#stop-accuracy`, `#stop-score`, `#stop-streak`, `#stop-hearts`), `#stop-highscore`, `#stop-new-highscore` (hidden), `#stop-message` (aria-live="off"), `#btn-stop-main-menu`, `#btn-stop-play-again`
- [X] T024 [US4] Add import of `calculateEarlyStopStars`, `getEarlyStopMessage`, `getEarlyStopFlag`, `setEarlyStopFlag`, `clearEarlyStopFlag` to the existing `import` statement from `'./js/math-engine.js'` in `index.html` script
- [X] T025 [US4] Add `showStopSummary()` function to `index.html` script per plan.md Phase C §10: destructure session fields → compute `incorrect` and `pct` → call `calculateEarlyStopStars` → render stars with `aria-label` → populate all 7 stat `<p>` elements → **I2 fix (part 2)**: call `clearTimeout(session.pendingAdvance); clearTimeout(session.pendingGameOver)` before `showScreen('screen-stop-summary')` → check and conditionally save high score via `setHighScore` + `setEarlyStopFlag` → call `renderHighScore()` (stub — implemented in US6) → populate `#stop-highscore` and `#stop-new-highscore` → populate `#stop-message` → set `#btn-stop-play-again.hidden` based on `questionsAnswered === 0` → call `showScreen('screen-stop-summary')` → focus `#btn-stop-main-menu`; also update `showFeedback()` to track `bestStreak`: after `session.streak = newStreak`, add `if (session.streak > session.bestStreak) session.bestStreak = session.streak;`

**Note on T025 stub**: `renderHighScore()` is called in `showStopSummary()` but not yet defined — that is intentional. It will be defined in Phase 8 (US6). The call site is correct; define the function stub as `function renderHighScore() {}` temporarily if needed to avoid a ReferenceError, or implement US6 immediately after.

**Checkpoint**: Quickstart Scenarios 6, 7 pass. Stats correct, stars correct, message correct, 0-answer edge case handled.

---

## Phase 7: User Story 5 — Summary Navigation Buttons (Priority: P5)

**Goal**: "🏠 Main Menu" returns to start screen; "🔄 Play Again" starts a new game with same timer.

**Independent Test**: Quickstart Scenario 8 — both buttons work, "Play Again" uses same timer setting.

- [X] T026 [US5] Wire `#btn-confirm-stop` event listener in `index.html` script: `document.getElementById('btn-confirm-stop').addEventListener('click', () => { hideStopOverlay(); showStopSummary(); })`
- [X] T027 [US5] Add `#btn-stop-play-again` event listener: `document.getElementById('btn-stop-play-again').addEventListener('click', () => { startGame(TIMER_OPTIONS[selectedTimerIndex]); })` in `index.html` script

**Note**: `#btn-stop-main-menu` listener is wired in Phase 8 (US6) because it calls `renderHighScore()`.

**Checkpoint**: Quickstart Scenario 8 passes. "🔄 Play Again" starts fresh game with current timer. "🏠 Main Menu" placeholder OK for now (wired in T031).

---

## Phase 8: User Story 6 — High Score Eligible + 🛑 Indicator (Priority: P6)

**Goal**: Early-stop scores compete for high score; `#screen-start` shows "🛑" suffix when best score is from an early stop.

**Independent Test**: Quickstart Scenario 9 — 🛑 appears after early-stop high score; disappears after completed-game high score.

- [X] T028 [US6] Implement `renderHighScore()` function in `index.html` script: read `getHighScore()` and `getEarlyStopFlag()`; set `#start-highscore` text to `"Best: ${hs} pts 🛑"` when flag true, `"Best: ${hs} pts"` when flag false, or `""` when `hs === 0`
- [X] T029 [US6] Replace the existing inline high-score init block (the one-shot `document.getElementById('start-highscore').textContent = ...` on DOMContentLoaded) with a call to `renderHighScore()` in `index.html` script
- [X] T030 [US6] Amend `showResults()` in `index.html` script: after `setHighScore(session.score)` (existing new-high-score branch), add `clearEarlyStopFlag()` to clear the 🛑 marker when a completed game beats the score; then add `renderHighScore()` call to refresh the start screen
- [X] T031 [US6] Add `#btn-stop-main-menu` event listener in `index.html` script: `document.getElementById('btn-stop-main-menu').addEventListener('click', () => { session = null; showScreen('screen-start'); renderHighScore(); })`
- [X] T032 [US6] **D3 fix** — add `stopOverlayActive = false;` as the first line of `startGame()` in `index.html` script to defensively reset overlay state on every new game start

**Checkpoint**: Quickstart Scenario 9 passes. 🛑 appears, persists through non-beating completed games, disappears when completed game sets a new high. `renderHighScore()` called in all 3 required places.

---

## Phase 9: Polish & Validation

**Purpose**: Verify the complete feature end-to-end, confirm regressions are absent, check accessibility.

- [X] T033 Run `node --test tests/math-engine.test.js` — confirm all tests pass (no regressions) — 82/82 pass
- [X] T034 Open `index.html` in a browser and run all 10 Quickstart scenarios from `quickstart.md` — mark each passing
- [X] T035 Run all 6 Regression Checks from `quickstart.md` — verify normal game flow, Play Again, timer selector, Practice Mode, high score without 🛑, keyboard navigation are unaffected
- [X] T036 Accessibility spot-check: all 18 structural/ARIA checks pass — `role="dialog"` `aria-modal="true"` `aria-labelledby="stop-confirm-title"` on overlay; `role="img"` + `aria-label` on stars; `#btn-stop-game` min-height 44px; focus targets wired in JS; Escape key listener present

**Checkpoint**: All Quickstart scenarios pass, all regression checks pass, accessibility attributes verified.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately
- **Phase 2 (Foundational TDD)**: Depends on Phase 1 — BLOCKS all HTML/JS changes
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 (stop button must exist to wire)
- **Phase 5 (US3)**: Depends on Phase 4 (overlay must exist; guard requires `stopOverlayActive`)
- **Phase 6 (US4)**: Depends on Phase 5 (timer pause/resume must work; `bestStreak` added in T017)
- **Phase 7 (US5)**: Depends on Phase 6 (`showStopSummary` must exist)
- **Phase 8 (US6)**: Depends on Phase 7 (all nav buttons exist; `showStopSummary` calls `renderHighScore`)
- **Phase 9 (Polish)**: Depends on all phases complete

### Critical Analysis Fixes Embedded

| Finding | Severity | Task | Description |
|---------|----------|------|-------------|
| I1 | HIGH | T019 | `startTimer()` guard placed after `timerTicks` reset, not before interval start |
| I2 | HIGH | T018, T025 | `advanceRound`/`showResults` timeouts stored + cleared in `showStopSummary` |
| I3 | MEDIUM | T016 | `showResults()` guard clears orphaned overlay state |
| I4 | MEDIUM | T006 | `.game-header { padding-right: 64px }` prevents ⛔ Stop overlapping score |
| D3 | LOW | T032 | `startGame()` defensively resets `stopOverlayActive = false` |

### Within-Phase Task Order

- Phase 2: T002 → T003 → T004 → T005 (strict Red→Green TDD order)
- Phase 5: T017 → T018 → T019 → T020 → T021 (data before logic before guard before resume)
- Phase 6: T022 → T023 → T024 → T025 (CSS → HTML → imports → function)
- Phase 8: T028 → T029 → T030 → T031 → T032 (define function before calling it)

---

## Parallel Opportunities

Within a given phase, tasks that touch different independent sections of `index.html` can be parallelized:
- T006 (CSS) and T007 (HTML) are different DOM locations but the same file — sequential is safer
- T008 (CSS) and T009 (HTML) for the overlay are different DOM locations — sequential is safer

Given this is a single developer working on a single file, all tasks within a phase should be treated as sequential. Phases themselves must be sequential due to code dependencies.

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 36 |
| Phase 1 (Setup) | 1 |
| Phase 2 (TDD Foundational) | 4 |
| Phase 3 (US1 — Stop Button) | 2 |
| Phase 4 (US2 — Overlay) | 9 |
| Phase 5 (US3 — Timer Pause) | 5 |
| Phase 6 (US4 — Summary Screen) | 4 |
| Phase 7 (US5 — Navigation) | 2 |
| Phase 8 (US6 — High Score Flag) | 5 |
| Phase 9 (Polish) | 4 |
| Analysis bug fixes embedded | 5 (I1, I2×2, I3, I4, D3) |

### MVP Scope

Phase 1 + Phase 2 + Phase 3 delivers a visible stop button with no behavior — safe to deploy as a non-breaking increment.
Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 delivers a fully working confirmation overlay with timer pause.
Phases 6–8 deliver the summary screen and high score integration.

### Files Changed

| File | Change |
|------|--------|
| `js/math-engine.js` | +5 exports (T004) |
| `tests/math-engine.test.js` | +11 test cases (T002) |
| `index.html` | CSS ~30 lines, HTML ~45 lines, JS ~130 lines (T006–T032) |
