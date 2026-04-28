---
description: "Task list for Math Quiz Game"
---

# Tasks: Math Quiz Game

**Input**: Design documents from `specs/001-math-quiz-game/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/ ✅ | research.md ✅

**Tests**: TDD is NON-NEGOTIABLE per Constitution Principle IV. Test tasks are marked and MUST be
completed and confirmed failing BEFORE their paired implementation tasks begin.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

- Single-page app: `index.html`, `js/`, `tests/` at repository root
- `staticwebapp.config.json` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all files and project configuration before any logic is written.

- [x] T001 Create repository file structure: `index.html` (empty HTML5 boilerplate), `js/math-engine.js` (empty module file), `tests/math-engine.test.js` (empty), `staticwebapp.config.json` (empty JSON)
- [x] T002 [P] Populate `staticwebapp.config.json` with Azure SWA routing: `navigationFallback` → `/index.html`, `mimeTypes` for `.js`, `globalHeaders` with `Cache-Control: no-cache, no-store`
- [x] T003 [P] Add `GameConfig` data object to `js/math-engine.js`: all constants from `data-model.md` (totalQuestions, timerSeconds, basePts, streakPts, streakThreshold, starThresholds, operations, numberRanges); export as named export

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: HTML skeleton and CSS base that ALL user stories render into. No JS logic yet.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Build `index.html` HTML skeleton: `<main>` landmark containing three `<section>` elements (`#screen-start`, `#screen-game`, `#screen-results`); `<h1>` MathGame on start screen; `<h2>` headings on game and results screens; `aria-live="polite"` feedback container; all inactive sections initially `display:none` via inline `<style>`
- [x] T005 [P] Add base CSS to `<style>` block in `index.html`: CSS reset (box-sizing, margin/padding), responsive single-column layout (max-width 480px, centred), color palette variables (primary, correct-green, wrong-red, neutral-bg), base typography (≥16px body), minimum 44×44px touch target class `.btn`, `prefers-reduced-motion` media query skeleton

**Checkpoint**: Static HTML opens in browser; three screens exist; CSS loads without errors; `node --test tests/math-engine.test.js` exits cleanly on empty file.

---

## Phase 3: User Story 1 - Play a Full Game Round (Priority: P1) 🎯 MVP

**Goal**: A player can start a game, answer 10 questions with a 10-second timer and emoji feedback,
and reach a Results screen showing score and a 1–3 star rating.

**Independent Test**: Open `index.html` via a local server; tap Play; answer all 10 questions
(correct and incorrect); verify emoji feedback appears after each answer; verify Results screen
shows score, correct-answer count, and stars. Timer must visibly count down.

### Tests for User Story 1 ⚠️ WRITE FIRST — CONFIRM FAILING before implementing T009–T011

- [x] T006 [P] [US1] Write failing unit tests for `generateQuestion()` and `buildChoices()` in `tests/math-engine.test.js`: (a) choices array has length 4, (b) correct answer is in choices, (c) all choices are unique positive integers, (d) division answer is a whole number, (e) subtraction answer is positive
- [x] T007 [P] [US1] Write failing unit test for `generateRound()` in `tests/math-engine.test.js`: returns array of length `config.totalQuestions` (10), each element passes the Question invariants from T006
- [x] T008 [P] [US1] Write failing unit tests for `evaluateAnswer()` and `calculateStars()` in `tests/math-engine.test.js`: evaluateAnswer returns `true` for correct choice and `false` for wrong; calculateStars returns 1/2/3 for scores below/between/at star thresholds

### Implementation for User Story 1

- [x] T009 [US1] Implement `generateQuestion(operation, config, id)` and `buildChoices(answer, operation, config)` in `js/math-engine.js` using offset-based distractor algorithm from `research.md` — run `node --test` and verify T006 tests pass
- [x] T010 [US1] Implement `generateRound(config)` in `js/math-engine.js` — run `node --test` and verify T007 tests pass
- [x] T011 [US1] Implement `evaluateAnswer(question, selectedChoice)` and `calculateStars(score, config)` in `js/math-engine.js` — run `node --test` and verify T008 tests pass
- [x] T012 [US1] Implement START screen in `index.html`: style `#screen-start` with game title, short instructions ("You have 10 seconds per question!"), Play button (`.btn`, ≥44px); click handler imports `generateRound` and `GameConfig`, creates a new `GameSession`, hides `#screen-start`, shows `#screen-game`
- [x] T013 [US1] Implement QUESTION rendering in `index.html`: function `renderQuestion(session)` that writes question text (`{a} {symbol} {b} = ?`) into `#screen-game`, renders 4 enabled choice buttons with `aria-pressed="false"`, updates score display, updates hearts display (3 filled hearts, static for now), and updates question counter "Question N of 10"
- [x] T014 [US1] Implement 10-second countdown timer in `index.html`: `startTimer(session)` that sets `session.timerTicks = 100`, calls `setInterval` every 100ms, decrements `session.timerTicks`, updates `<div role="progressbar">` width and `aria-valuenow`, clears interval and triggers timer-expiry feedback when `timerTicks` reaches 0
- [x] T015 [US1] Implement FEEDBACK phase in `index.html`: `showFeedback(session, selectedChoice)` that (a) clears timer, (b) calls `evaluateAnswer()`, (c) disables all choice buttons (`disabled` + `aria-disabled="true"`), (d) highlights correct button green and wrong button red via CSS classes, (e) sets emoji text and `aria-label` in `aria-live` container (🎉 correct / 😬 wrong), (f) updates score using flat 10pts for now, (g) after 1 000ms calls `advanceQuestion(session)` or transitions to RESULTS
- [x] T016 [US1] Implement RESULTS screen in `index.html`: `showResults(result)` that (a) hides `#screen-game`, shows `#screen-results`, (b) calls `calculateStars()` and renders N filled star icons each with `aria-label`, (c) wraps stars in `aria-label="N stars out of 3"` container, (d) displays total score and correct-answer count, (e) reads/writes `localStorage` key `mathgame_highscore` via `getHighScore()`/`setHighScore()` in `js/math-engine.js`, (f) shows "🏆 New high score!" when applicable, (g) wires Play Again button to reset session and show `#screen-start`

**Checkpoint**: Full 10-question round playable end-to-end. Timer counts down. Emoji feedback appears. Results screen shows stars and score. Play Again resets game. `node --test` passes all tests.

---

## Phase 4: User Story 2 - Lose a Life for Wrong Answers (Priority: P2)

**Goal**: Hearts visually decrement on wrong answers/timer expiry; when all 3 hearts are gone the
round ends immediately and the Results screen appears.

**Independent Test**: Start a round and deliberately answer every question wrong (or let the timer
expire); verify a heart icon empties after each wrong answer; after the third wrong answer the
game immediately shows the Results screen without completing remaining questions.

### Tests for User Story 2 ⚠️ WRITE FIRST — CONFIRM FAILING before implementing T018

- [x] T017 [US2] Write failing unit test for `applyWrongAnswer(lives)` in `tests/math-engine.test.js`: (a) returns `{ newLives: 2 }` when called with lives=3, (b) returns `{ newLives: 0, isGameOver: true }` when called with lives=1, (c) `isGameOver` is false when `newLives > 0`

### Implementation for User Story 2

- [x] T018 [US2] Implement `applyWrongAnswer(lives)` in `js/math-engine.js` — run `node --test` and verify T017 test passes
- [x] T019 [US2] Update `showFeedback()` in `index.html`: on wrong answer or timer expiry call `applyWrongAnswer(session.lives)`, update `session.lives`, change the Nth heart icon from filled (❤️) to empty (🤍), update hearts container `aria-label` to "Lives remaining: N"; if `isGameOver === true` skip `advanceQuestion()` and call `showResults()` immediately

**Checkpoint**: Start a round; answer 3 questions wrong in a row; verify game ends on third wrong answer and Results screen appears immediately. Hearts decrement correctly on each wrong answer.

---

## Phase 5: User Story 3 - Earn Points and Streak Bonuses (Priority: P3)

**Goal**: Answering 3+ consecutive questions correctly activates a streak; streak awards 15 pts
per correct answer instead of 10; a single wrong answer resets the streak to zero.

**Independent Test**: Start a round; answer 4 correct in a row; verify streak indicator appears
after the 3rd correct answer and subsequent correct answers earn 15 pts; answer one wrong; verify
streak indicator disappears and next correct answer earns 10 pts again.

### Tests for User Story 3 ⚠️ WRITE FIRST — CONFIRM FAILING before implementing T021

- [x] T020 [P] [US3] Write failing unit tests for `updateStreak(streak, correct, config)` in `tests/math-engine.test.js`: (a) correct answer below threshold → `{ newStreak: streak+1, pts: basePts }`, (b) correct answer at/above threshold → `{ newStreak: streak+1, pts: streakPts }`, (c) wrong answer → `{ newStreak: 0, pts: 0 }`

### Implementation for User Story 3

- [x] T021 [US3] Implement `updateStreak(streak, correct, config)` in `js/math-engine.js` — run `node --test` and verify T020 tests pass
- [x] T022 [US3] Replace flat 10pt scoring in `showFeedback()` in `index.html` with `updateStreak()`: call `updateStreak(session.streak, correct, GameConfig)`, update `session.streak` and `session.score`; show streak indicator (🔥 with `aria-label="Streak bonus active!"`) in question UI when `session.streak >= config.streakThreshold`; hide indicator when streak resets

**Checkpoint**: All three user stories independently functional. `node --test` passes all tests (T006–T008, T017, T020). Streak activates at 3-in-a-row, awards 15 pts, resets on wrong answer.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: WCAG 2.1 AA compliance, accessibility audit, cross-browser validation.

- [x] T023 [P] Apply WCAG 2.1 AA focus styles in `index.html` `<style>`: `:focus-visible` outline (2px solid, high-contrast colour, 2px offset) on all `<button>` and `<a>` elements; verify no interactive element loses focus ring during keyboard play-through
- [x] T024 [P] Verify and complete `prefers-reduced-motion` CSS in `index.html`: wrap timer bar `transition`, feedback highlight animations, and streak indicator entrance in `@media (prefers-reduced-motion: no-preference)` so all transitions are disabled by default for users who prefer reduced motion
- [ ] T025 Run accessibility audit in browser against locally-served `index.html`: (a) axe DevTools or Lighthouse accessibility score ≥ 90; (b) zero critical/serious violations; (c) keyboard-only play-through — Tab + Enter must reach every interactive element in logical order; document results in `specs/001-math-quiz-game/checklists/accessibility.md`
- [ ] T026 [P] Cross-browser smoke test: open locally-served game in Chrome, Firefox, and Edge; verify timer countdown, hearts, scoring, streak indicator, and Results screen all render and function correctly; note any browser-specific issues

---

## Amendment: Timer 15 s + Timer Bonus + ≤ 100 Result Cap (Branch: 002-timer-answer-cap)

**Purpose**: Implement two spec changes from amendment dated 2026-04-28.
  1. Timer increased to 15 s (FR-005); +5 pts for correct answers within 8 s (FR-016)
  2. All question results capped at ≤ 100 for all four operations (FR-003)

**Baseline**: T001–T024 implemented and passing on branch `001-math-quiz-game`. T025–T026 are
manual audits and remain pending. Amendment tasks below are additive changes only.

### Phase A: Tests ⚠️ WRITE FIRST — CONFIRM FAILING before implementing T031–T035

- [x] T027 [US1] Write failing unit tests for ≤ 100 answer constraint in `tests/math-engine.test.js`: inside the existing `generateQuestion` describe block, add one `it` per operation (4 total) asserting `q.answer <= 100` over 30 random calls each — `node --test` must show these 4 assertions FAIL before continuing
- [x] T028 [P] [US3] Write failing unit tests for `applyTimerBonus(timerTicks, config)` in `tests/math-engine.test.js`: add `applyTimerBonus` to imports; new `describe('applyTimerBonus', ...)` block: (a) `timerTicks=150` → `bonusPts` equals `config.timerBonusPts` (5), (b) `timerTicks=71` → `bonusPts=5`, (c) `timerTicks=70` → `bonusPts=0` (boundary: not within threshold), (d) `timerTicks=0` → `bonusPts=0` — `node --test` must show these 4 tests FAIL before continuing

### Phase B: US1 Amendment — ≤ 100 Constraint + 15-second Timer

- [x] T029 [US1] Update `GameConfig` in `js/math-engine.js`: set `timerSeconds: 15`; add `timerBonusThreshold: 8` and `timerBonusPts: 5` fields; change `numberRanges.add.bMax` from `99` to `null`; change `numberRanges.div.aMax` from `144` to `100`
- [x] T030 [US1] Update `maxAnswerFor()` helper in `js/math-engine.js`: replace all four operation-specific return values with a single `return 100` — this sets the distractor ceiling to 100 for all operations, keeping generated wrong-answer choices within plausible range
- [x] T031 [US1] Update `generateQuestion()` in `js/math-engine.js` for ≤ 100 cap: (a) `add` case: change `b = randInt(r.bMin, r.bMax)` to `b = randInt(r.bMin, 100 - a)`; (b) `mul` case: change `a = randInt(r.aMin, r.aMax)` to `a = randInt(r.aMin, Math.floor(100 / b))`; (c) `div` case: change `quotient = randInt(1, 12)` to `quotient = randInt(1, Math.floor(100 / b))` — run `node --test` and verify T027 tests now PASS
- [x] T032 [US1] Update `startTimer()` in `index.html`: change `session.timerTicks = 100` to `session.timerTicks = GameConfig.timerSeconds * 10` (evaluates to 150); update timer progressbar `width` style and `aria-valuenow` to use `session.timerTicks / (GameConfig.timerSeconds * 10)` as the fraction instead of `/ 100`
- [x] T033 [US1] Update Start screen instructions in `index.html` `#screen-start`: change "10 seconds" to "15 seconds" in the instructions paragraph; add a second line "⚡ Answer within 8 seconds for a speed bonus!"

### Phase C: US3 Amendment — Timer Bonus Mechanic

- [x] T034 [US3] Implement `applyTimerBonus(timerTicks, config)` in `js/math-engine.js`: export pure function that returns `{ bonusPts: config.timerBonusPts }` when `timerTicks > (config.timerSeconds - config.timerBonusThreshold) * 10` (i.e. `timerTicks > 70` for 15 s / 8 s default), else returns `{ bonusPts: 0 }` — run `node --test` and verify T028 tests PASS
- [x] T035 [US3] Update `showFeedback()` in `index.html`: (a) add `applyTimerBonus` to the `import` statement from `./js/math-engine.js`; (b) on correct answer, call `const bonus = applyTimerBonus(session.timerTicks, GameConfig)` and add `bonus.bonusPts` to `session.score`; (c) when `bonus.bonusPts > 0`, append `" ⚡ +5"` to the feedback text in the `aria-live` container and set its `aria-label` to include "Speed bonus! 5 extra points"

### Phase D: Validation

- [x] T036 Run `node --test tests/math-engine.test.js` and confirm all tests pass (expect 34 total: 28 original + 4 T027 + 4 T028 = 36 — note: T027 adds 4 per-operation tests not 1); log the exact pass count
- [ ] T037 [P] Manual browser smoke test against locally-served `index.html`: (a) verify countdown visibly starts at 15 s; (b) answer a question within 8 s — confirm "⚡ +5" text appears in feedback and score reflects base + bonus; (c) answer a question after 8 s — confirm no bonus indicator and score only increments by base pts; (d) open DevTools console, call `generateQuestion('mul', GameConfig, 0)` 20 times and confirm all `answer` values ≤ 100
- [ ] T038 [P] Re-run T025 accessibility checks on the amended Start screen and feedback phase: verify the new "⚡ +5" indicator has a proper `aria-label`; verify the 15-second timer text update reads correctly via screen reader; update `specs/001-math-quiz-game/checklists/accessibility.md` with amendment audit results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002 and T003 are parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories; T004 and T005 are parallel
- **User Stories (Phase 3–5)**: ALL depend on Phase 2 completion
  - Phase 3 (US1) must complete before Phase 4 (US2) and Phase 5 (US3) begin — US2 and US3 build on the FEEDBACK phase wired in US1
- **Polish (Phase 6)**: Depends on Phase 3–5 completion; T023, T024, T026 are parallel
- **Amendment Phase A**: Can begin immediately — T027 and T028 are parallel (different test blocks)
- **Amendment Phase B**: Depends on Phase A tests confirmed failing; T029–T033 run sequentially (same file or wiring dependency)
- **Amendment Phase C**: T034 depends on T029 (GameConfig needs timerBonusPts); T035 depends on T034 (imports applyTimerBonus); T034 and T035 can start once Phase A tests are confirmed failing
- **Amendment Phase D**: Depends on Phase B and C completion

### Parallel Opportunities (Amendment)

- T027 + T028 — different describe blocks in same test file; write sequentially to avoid conflicts
- T032 + T033 — different sections of `index.html`; can be batched in one edit session
- T037 + T038 — independent browser checks

---

## Implementation Strategy

### Original MVP (complete on branch 001-math-quiz-game)

Phases 1–6, tasks T001–T024 implemented and passing. 28/28 unit tests pass.

### Amendment Delivery

1. Write failing tests (T027–T028) — confirm 4 + 4 = 8 new test failures
2. Update GameConfig + generation logic (T029–T031) — confirm T027 tests now pass
3. Wire 15-second timer in UI (T032–T033)
4. Add applyTimerBonus to logic (T034) — confirm T028 tests now pass
5. Wire bonus in UI feedback (T035)
6. Full validation run (T036–T038)

---

## Notes

- **[P]** = different files or independent sections, safe to parallelize
- **[Story]** label maps each task to a specific user story for traceability
- All test tasks MUST produce failing tests before paired implementation tasks begin
- Run `node --test tests/math-engine.test.js` after every implementation task
- `localStorage` functions (`getHighScore`, `setHighScore`) are excluded from Node.js tests — stub or skip them; all other math-engine functions are pure and fully testable
- `index.html` uses `<script type="module">` to import from `js/math-engine.js`; serve over HTTP (not `file://`) for local testing
- Amendment timer tick math: 15 s × 10 ticks/s = 150 total ticks; bonus threshold = (15 − 8) × 10 = 70 ticks remaining
