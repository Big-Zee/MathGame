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

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002 and T003 are parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories; T004 and T005 are parallel
- **User Stories (Phase 3–5)**: ALL depend on Phase 2 completion
  - Phase 3 (US1) must complete before Phase 4 (US2) and Phase 5 (US3) begin — US2 and US3 build on the FEEDBACK phase wired in US1
- **Polish (Phase 6)**: Depends on Phase 3–5 completion; T023, T024, T026 are parallel

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independent
- **US2 (P2)**: Depends on US1 (wires into `showFeedback()` and `renderQuestion()` from US1)
- **US3 (P3)**: Depends on US1 (wires into `showFeedback()` from US1); can run in parallel with US2

### Within Each User Story (TDD order)

1. Write tests → confirm they FAIL
2. Implement logic module functions
3. Wire UI in `index.html`
4. Run `node --test` → confirm tests PASS
5. Manual browser verification at checkpoint

### Parallel Opportunities

- T002 + T003 (Phase 1) — different files
- T004 + T005 (Phase 2) — same file (`index.html`) but different blocks; proceed sequentially if same developer
- T006 + T007 + T008 (US1 tests) — all different test blocks in same file; can be batched
- T020 (US3 test) — independent of US2 tasks; can run in parallel with T017–T019
- T023 + T024 + T026 (Polish) — different concerns

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Write US1 tests (T006–T008) — confirm failing
4. Implement US1 logic (T009–T011) — confirm tests pass
5. Wire US1 UI (T012–T016)
6. **STOP and VALIDATE**: Play a full 10-question round in the browser
7. Deploy MVP to Azure SWA for stakeholder review

### Incremental Delivery

1. MVP (US1) → playable 10-question game with flat scoring and static hearts
2. Add US2 (T017–T019) → hearts deduct, game ends early on 0 lives
3. Add US3 (T020–T022) → streak bonus scoring activates
4. Polish (T023–T026) → WCAG AA compliance confirmed

---

## Notes

- **[P]** = different files or independent sections, safe to parallelize
- **[Story]** label maps each task to a specific user story for traceability
- All test tasks MUST produce failing tests before paired implementation tasks begin
- Run `node --test tests/math-engine.test.js` after every implementation task
- `localStorage` functions (`getHighScore`, `setHighScore`) are excluded from Node.js tests — stub or skip them; all other math-engine functions are pure and fully testable
- Commit after each task or logical group (per Development Workflow step 5)
- `index.html` uses `<script type="module">` to import from `js/math-engine.js`; serve over HTTP (not `file://`) for local testing
