# Tasks: Practice Mode

**Input**: Design documents from `specs/003-practice-mode/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅
**Branch**: `003-practice-mode`
**Date**: 2026-04-29

**Tests**: Test tasks are included per Constitution IV (Test-First). All failing-test tasks MUST be verified failing before their paired implementation task.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths included in each description

---

## Phase 1: Setup

**Purpose**: Verify project structure and prerequisites are ready for additive implementation.

**⚠️ NOTE**: This feature is purely additive. No new source files are created. All changes go into
`index.html` and `js/math-engine.js`. No build step, no new dependencies.

- [x] T001 Verify branch `003-practice-mode` is checked out and `main` branch tests still pass: `node --test tests/math-engine.test.js`
- [x] T002 [P] Confirm `js/math-engine.js` exports match the API contract at `specs/003-practice-mode/contracts/math-engine-amendments.md` — read both files and verify no drift

---

## Phase 2: Foundational — math-engine.js New Exports + Amendments

**Purpose**: All Practice Mode logic that lives in `js/math-engine.js` must be complete before any
HTML/JS UI work can call it. Constitution IV requires each failing test FIRST, then implementation.

**⚠️ CRITICAL**: No user story HTML/UI work can begin until this phase is complete and all tests pass.

### Failing Tests (write first — must FAIL before implementation)

- [x] T003 Write failing test: `getPracticeConfig` returns correct `numberRanges` for easy/add in `tests/math-engine.test.js`
- [x] T004 [P] Write failing test: `getPracticeConfig` returns correct `numberRanges` for hard/mul in `tests/math-engine.test.js`
- [x] T005 [P] Write failing test: hard/add ranges match `GameConfig.numberRanges.add` in `tests/math-engine.test.js`
- [x] T006 [P] Write failing test: `generateQuestion` add — `b` never exceeds `bMax` when `bMax` is set in `tests/math-engine.test.js`
- [x] T007 [P] Write failing test: `generateQuestion` sub — `b` never exceeds `bMax` when `bMax` is set in `tests/math-engine.test.js`
- [x] T008 [P] Write failing test: `generateQuestion` add — existing behavior unchanged when `bMax` is null in `tests/math-engine.test.js`
- [x] T009 [P] Write failing test: `generateQuestion` sub — existing behavior unchanged when `bMax` is null in `tests/math-engine.test.js`
- [x] T010 [P] Write failing test: `generateQuestion` div — quotient never exceeds `Math.floor(r.aMax / b)` when `aMax` is set in `tests/math-engine.test.js` *(addresses analyze finding C1)*
- [x] T011 [P] Write failing test: `ENCOURAGING_MESSAGES` has at least 1 entry in `tests/math-engine.test.js`
- [x] T012 [P] Write failing test: all `ENCOURAGING_MESSAGES` entries are non-empty strings in `tests/math-engine.test.js`
- [x] T013 [P] Write failing test: `PracticeRanges` hard/add equals `GameConfig.numberRanges.add` in `tests/math-engine.test.js`
- [x] T014 [P] Write failing test: `PracticeRanges` hard/mul equals `GameConfig.numberRanges.mul` in `tests/math-engine.test.js`
- [x] T015 [P] Write failing test: 100% accuracy → `'master'` tier in `tests/math-engine.test.js`
- [x] T016 [P] Write failing test: 90% accuracy → `'master'` tier in `tests/math-engine.test.js`
- [x] T017 [P] Write failing test: 89% accuracy → `'amazing'` tier in `tests/math-engine.test.js`
- [x] T018 [P] Write failing test: 70% accuracy → `'amazing'` tier in `tests/math-engine.test.js`
- [x] T019 [P] Write failing test: 69% accuracy → `'good'` tier in `tests/math-engine.test.js`
- [x] T020 [P] Write failing test: 50% accuracy → `'good'` tier in `tests/math-engine.test.js`
- [x] T021 [P] Write failing test: 49% accuracy → `'keep-going'` tier in `tests/math-engine.test.js`
- [x] T022 [P] Write failing test: 0 answered → 0% accuracy → `'keep-going'` tier in `tests/math-engine.test.js`

### Verify all new tests fail

- [x] T023 Run `node --test tests/math-engine.test.js` — confirm all T003–T022 tests fail and all pre-existing tests still pass

### Implementation

- [x] T024 Export `PracticeRanges` const from `js/math-engine.js` (Easy/Medium/Hard × 4 operations; Hard equals `GameConfig.numberRanges` exactly; see `specs/003-practice-mode/data-model.md`)
- [x] T025 Export `ENCOURAGING_MESSAGES` array from `js/math-engine.js` (8 strings as specified in `specs/003-practice-mode/data-model.md`)
- [x] T026 Export `getAccuracyTier(totalAnswered, totalCorrect)` pure function from `js/math-engine.js` returning `'master' | 'amazing' | 'good' | 'keep-going'` per tier thresholds in `specs/003-practice-mode/data-model.md`
- [x] T027 Export `getPracticeConfig(operation, difficulty)` from `js/math-engine.js` — returns `{ ...GameConfig, numberRanges: PracticeRanges[difficulty] }` for all four operations *(addresses analyze finding C2 — return full difficulty ranges, not single-operation slice)*
- [x] T028 Amend `generateQuestion` add case in `js/math-engine.js`: change `b = randInt(r.bMin, 100 - a)` to `b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, 100 - a))` per `specs/003-practice-mode/contracts/math-engine-amendments.md`
- [x] T029 Amend `generateQuestion` sub case in `js/math-engine.js`: change `b = randInt(r.bMin, a - 1)` to `b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, a - 1))` per `specs/003-practice-mode/contracts/math-engine-amendments.md`
- [x] T030 Amend `generateQuestion` div case in `js/math-engine.js`: cap quotient to `Math.min(Math.floor(100 / b), Math.floor(r.aMax / b))` so `aMax` is respected for Easy/Medium difficulty tiers *(addresses analyze finding C1 — `aMax` currently ignored in div case)*

### Verify all tests pass

- [x] T031 Run `node --test tests/math-engine.test.js` — confirm ALL tests pass (existing + T003–T022 new tests); zero failures permitted

**Checkpoint**: `js/math-engine.js` fully ready. All HTML/UI work can now begin.

---

## Phase 3: User Story 1 — Entry Flow: Practice Mode Button + Operation Selector (Priority: P1) 🎯 MVP

**Goal**: A child can tap "Practice Mode" on the Start screen, see the operation selector, and navigate to the difficulty selector. No practice questions yet.

**Independent Test**: Navigate Start → operation selector → difficulty selector → verify all four operation buttons and three difficulty buttons render correctly with correct IDs and labels per `specs/003-practice-mode/quickstart.md` smoke test steps 1–5.

### Implementation

- [x] T032 [US1] Add "📚 Practice Mode" button (`#btn-practice`) to the Start screen in `index.html` alongside the existing `#btn-play` button
- [x] T033 [US1] Add `#screen-practice-op` section to `index.html` with `hidden` attribute and `<h2>Practice Mode</h2>` heading, four operation buttons (`#btn-op-add`, `#btn-op-sub`, `#btn-op-mul`, `#btn-op-div`) in a 2×2 grid layout
- [x] T034 [US1] Add `#screen-practice-diff` section to `index.html` with `hidden` attribute and `<h2>Choose Difficulty</h2>` heading, three difficulty buttons (`#btn-diff-easy`, `#btn-diff-medium`, `#btn-diff-hard`), and a back link (`#btn-diff-back`) per `specs/003-practice-mode/contracts/ui-state-machine.md`
- [x] T035 [US1] Add CSS rules for operation grid (2×2), difficulty buttons, and `#btn-practice` to the `<style>` block in `index.html` — additive only, no existing styles modified
- [x] T036 [US1] Append `let practiceSession = null;` and `let practiceOperation = null;` variable declarations below the existing `let session` declaration in the inline `<script type="module">` in `index.html`
- [x] T037 [US1] Append event listener for `#btn-practice` click: `showScreen('screen-practice-op')` then `document.getElementById('btn-op-add').focus()` in `index.html`
- [x] T038 [US1] Append event listeners for four `#btn-op-*` clicks: store operation in `practiceOperation`, call `showScreen('screen-practice-diff')`, focus `#btn-diff-easy` in `index.html`
- [x] T039 [US1] Append event listener for `#btn-diff-back` click: `showScreen('screen-practice-op')`, focus `#btn-op-add` in `index.html`

**Checkpoint**: "Practice Mode" button visible on Start screen; operation and difficulty screens are navigable; no practice questions generated yet. Test with smoke test steps 1–5.

---

## Phase 4: User Story 2 — Practice Session Screen: Questions Without Pressure (Priority: P2)

**Goal**: A child confirms a difficulty and sees the first practice question with text input, "Check" button, and "Stop Practising" button — no timer, no lives.

**Independent Test**: Select Addition Easy, verify question appears with `a + b = ?` where both operands are in [1, 10], input field is focused, no timer element is visible, no hearts/lives visible; leave question unanswered for 30 seconds and verify nothing changes (smoke test steps 5–6).

### Implementation

- [x] T040 [US2] Add `#screen-practice-session` section to `index.html` with `hidden` attribute containing: `#practice-mode-label`, `#btn-stop-practice`, tally region (`role="status"` with `aria-live="polite"`) containing `#practice-answered`, `#practice-correct`, `#practice-streak`, question area with `#practice-question`, `<label for="practice-input">Your answer</label>`, `#practice-input` (`type="number" inputmode="numeric"`), `#btn-check`, `#practice-feedback` (`aria-live="polite" aria-atomic="true"`), and `#btn-next-question` (initially hidden) — per `specs/003-practice-mode/contracts/ui-state-machine.md`
- [x] T041 [US2] Add CSS for `#screen-practice-session` layout — tally bar, question card, feedback area, button states; `#btn-next-question` hidden by default; `#practice-streak` hidden when `data-streak="0"` — additive only in `index.html`
- [x] T042 [US2] Append `newPracticeSession(operation, difficulty)` function in `index.html` script: creates `practiceSession` object with all fields from `specs/003-practice-mode/data-model.md#PracticeSession`, calls `getPracticeConfig`, generates first question via `generateQuestion`, renders it to `#practice-question`, sets `#practice-mode-label` text, resets tally DOM to zeros
- [x] T043 [US2] Append event listeners for `#btn-diff-easy`, `#btn-diff-medium`, `#btn-diff-hard` clicks in `index.html` script: call `newPracticeSession(practiceOperation, difficulty)`, call `showScreen('screen-practice-session')`, focus `#practice-input`
- [x] T044 [US2] Append `submitPracticeAnswer()` function in `index.html` script: reads and parses `#practice-input` value, calls `evaluateAnswer(practiceSession.currentQuestion, parsed)`, shows feedback (delegated to Phase 5), disables `#btn-check` and `#practice-input`, shows `#btn-next-question`
- [x] T045 [US2] Append event listener for `#btn-check` click calling `submitPracticeAnswer()` in `index.html` script
- [x] T046 [US2] Append `keydown` event listener on `#practice-input` that calls `submitPracticeAnswer()` on Enter key in `index.html` script
- [x] T047 [US2] Append `nextPracticeQuestion()` function in `index.html` script: generates next question with deduplication (50-attempt loop, `seenKeys` Set, silent fallback), renders to `#practice-question`, clears `#practice-feedback`, clears and re-enables `#practice-input`, hides `#btn-next-question`, re-enables `#btn-check`, focuses `#practice-input`
- [x] T048 [US2] Append event listener for `#btn-next-question` click calling `nextPracticeQuestion()` in `index.html` script

**Checkpoint**: Full question flow works: select Easy Addition → question appears with input → can type and submit → "Next Question" advances to new question. Timer/lives are absent. Test with smoke test steps 5–8.

---

## Phase 5: User Story 3 — Friendly Feedback (Priority: P3)

**Goal**: Correct answers show green highlight and a random encouraging message with the streak. Wrong answers show the correct answer with a kind message. No penalties ever.

**Independent Test**: Submit correct answer — verify green CSS class on `#practice-input`, `#practice-feedback` shows one of the 8 `ENCOURAGING_MESSAGES`. Submit wrong answer — verify correct answer visible in `#practice-feedback` with kind language, no negative indicator, no lives/score change (smoke test steps 7, 9).

### Implementation

- [x] T049 [US3] Update `submitPracticeAnswer()` in `index.html` script: on correct — add green CSS class to `#practice-input`, set `#practice-feedback` to random `ENCOURAGING_MESSAGES` entry, increment `practiceSession.totalCorrect`, call `updateStreak` and update `practiceSession.currentStreak` and `practiceSession.bestStreak`
- [x] T050 [US3] Update `submitPracticeAnswer()` in `index.html` script: on wrong — set `#practice-feedback` to kind reveal template `"Not quite! The answer was [X]. You've got this! 💪"`, reset `practiceSession.currentStreak` to 0 (best streak preserved)
- [x] T051 [US3] Update `submitPracticeAnswer()` in `index.html` script: increment `practiceSession.totalAnswered` on every submit (correct or wrong)
- [x] T052 [US3] Update `nextPracticeQuestion()` in `index.html` script: remove green CSS class from `#practice-input` on advance, so highlight does not persist to next question
- [x] T053 [US3] Add CSS for `.practice-correct-highlight` (green border/background on `#practice-input`) and `.practice-wrong` (neutral/red border variant if desired) — additive only in `index.html`

**Checkpoint**: Feedback renders synchronously (<100ms). Green highlight on correct, kind reveal on wrong. No penalties visible. Test smoke test steps 7 and 9.

---

## Phase 6: User Story 4 — Running Tally (Priority: P4)

**Goal**: Questions answered, correct count, and streak are always visible and update after every submit. Operation and difficulty label is always on screen. Streak element is hidden when streak = 0 (not at threshold = 3 as in main game).

**Independent Test**: Answer 3 correct in a row, then 1 wrong — verify tally shows `Answered: 4`, `Correct: 3`, streak shows 0 and is hidden, best streak is preserved as 3; verify `#practice-mode-label` shows operation and difficulty throughout (smoke test step 7 and tally check).

### Implementation

- [x] T054 [US4] Add `updatePracticeTally()` function in `index.html` script: updates `#practice-answered` text to `"Answered: N"`, `#practice-correct` to `"Correct: N"`, `#practice-streak` to `"🔥 N"`, shows/hides `#practice-streak` based on `practiceSession.currentStreak === 0` *(threshold is 0, NOT the main game's `streakThreshold` of 3 — do not copy that logic)*
- [x] T055 [US4] Call `updatePracticeTally()` at end of `submitPracticeAnswer()` in `index.html` script (after all state mutations)
- [x] T056 [US4] Ensure `newPracticeSession()` sets `#practice-mode-label` to `"{opEmoji} {opName} — {diffName}"` format (e.g. "➕ Addition — Easy") and `#practice-answered`/`#practice-correct`/`#practice-streak` to initial zero state in `index.html` script

**Checkpoint**: Tally reflects accurate live counts throughout the session. Streak hidden at 0, visible at 1+. Operation/difficulty always labeled. Test with mixed correct/wrong sequence.

---

## Phase 7: User Story 5 — Stop Practising and Summary Screen (Priority: P5)

**Goal**: "Stop Practising" is always accessible; tapping it shows a summary screen with 5 stats and an accuracy-tier message; two action buttons resume or exit.

**Independent Test**: Answer 5 questions (mix of correct and wrong), tap "Stop Practising" — verify all 5 stats are correct, accuracy-tier message matches the correct tier from `specs/003-practice-mode/data-model.md`, "Practise Again" restarts with same settings and zeroed tally, "Back to Start" returns to `#screen-start` and clears `practiceSession` (smoke test steps 10–12).

### Implementation

- [x] T057 [US5] Add `#screen-practice-summary` section to `index.html` with `hidden` attribute containing: summary heading, `#summary-answered`, `#summary-correct`, `#summary-accuracy`, `#summary-streak`, `#summary-message`, `#btn-practise-again`, `#btn-summary-home` — per `specs/003-practice-mode/contracts/ui-state-machine.md`
- [x] T058 [US5] Add CSS for `#screen-practice-summary` layout — stat rows, message highlight, button pair — additive only in `index.html`
- [x] T059 [US5] Append `stopPractising()` function in `index.html` script: derives `PracticeSummary` (totalAnswered, totalCorrect, accuracyPct via `Math.round(...) || 0`, bestStreak, messageTier via `getAccuracyTier`), populates all `#summary-*` elements, calls `showScreen('screen-practice-summary')`, focuses `#btn-practise-again`
- [x] T060 [US5] Add accuracy-tier message lookup object in `stopPractising()` or as a module-level const in `index.html` script: `{ master: "You're a Math Blaster master! 🏆", amazing: "Amazing work, keep it up! 🌟", good: "Good effort! A little more practice and you'll ace it! 💪", 'keep-going': "Keep going, every question makes you smarter! 🧠" }`
- [x] T061 [US5] Append event listener for `#btn-stop-practice` click calling `stopPractising()` in `index.html` script
- [x] T062 [US5] Append event listener for `#btn-practise-again` click in `index.html` script: calls `newPracticeSession(practiceOperation, practiceSession.difficulty)`, calls `showScreen('screen-practice-session')`, focuses `#practice-input`
- [x] T063 [US5] Append event listener for `#btn-summary-home` click in `index.html` script: sets `practiceSession = null`, calls `showScreen('screen-start')`

**Checkpoint**: Full end-to-end Practice Mode flow works. All 5 summary stats correct. Both action buttons functional. Test with smoke test steps 10–12.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation, keyboard navigation verification, and final cross-cutting checks.

- [x] T064 [P] Verify ARIA attributes on all new practice screens in `index.html`: `role="status"` + `aria-live="polite"` on tally container, `aria-live="polite" aria-atomic="true"` on `#practice-feedback`, `<label for="practice-input">` present, `aria-live="off"` on `#practice-mode-label` and `#summary-message`
- [x] T065 [P] Verify heading hierarchy: `<h1>` MathGame on start → `<h2>` on each practice screen — no h3 used before h2, no headings skipped in `index.html`
- [x] T066 Run keyboard-only smoke test per `specs/003-practice-mode/quickstart.md` accessibility section: Tab to "Practice Mode" → Enter → Tab to op → Enter → Tab to diff → Enter → type in input → Enter → Tab to "Next Question" → Enter → Tab to "Stop Practising" → Enter → Tab to "Practise Again" → Enter
- [x] T067 [P] Verify all interactive elements (buttons, input) are ≥ 44×44 CSS px in `index.html` CSS — check new practice screen buttons match existing button sizes
- [x] T068 [P] Verify `#btn-stop-practice` is never `disabled` and never `hidden` during an active session — scan `index.html` script for any conditional that could hide or disable it
- [x] T069 Run full unit test suite `node --test tests/math-engine.test.js` — confirm zero failures; record pass count in commit message
- [x] T070 Serve locally (`python -m http.server 8080` or `npx serve .`) and run full manual smoke test per `specs/003-practice-mode/quickstart.md` (all 12 steps)
- [x] T071 Confirm `localStorage` is not written during any Practice Mode path — search `index.html` script for `localStorage.setItem` calls added during this feature and verify none are in practice code paths

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1; BLOCKS all HTML/UI phases
- **Phases 3–7 (User Stories)**: All depend on Phase 2 completion; can proceed in order P1→P5
- **Phase 8 (Polish)**: Depends on all user stories (Phases 3–7) being complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — gateway for all other stories; delivers navigable screens
- **US2 (P2)**: Start after Phase 2 — depends on US1 for screen navigation; core question loop
- **US3 (P3)**: Start after US2 — feedback hooks into `submitPracticeAnswer()` built in US2
- **US4 (P4)**: Start after US2 — tally hooks into `submitPracticeAnswer()` built in US2; can overlap with US3
- **US5 (P5)**: Start after US2 — summary screen independent; stop-button listener independent

### Within Each Phase

- All `[P]` tasks in a phase can run in parallel (different files or non-conflicting sections)
- Failing-test tasks (T003–T022) can all be written in parallel — they are independent test cases
- T023 (verify tests fail) must follow T003–T022
- T024–T030 (implementations) can largely run in parallel — different exports/functions
- T031 (verify tests pass) must follow T024–T030

---

## Parallel Examples

### Phase 2 — Write all failing tests in parallel (T003–T022)

```
All T003–T022 are independent test cases in the same file.
Write them all in one editing pass, then run T023 to verify they fail.
```

### Phase 2 — Implement exports in parallel (T024–T030)

```
T024 PracticeRanges      ← independent new export
T025 ENCOURAGING_MESSAGES ← independent new export
T026 getAccuracyTier     ← independent new export
T027 getPracticeConfig   ← depends on T024 (PracticeRanges)
T028 add bMax amendment  ← edit to generateQuestion add case
T029 sub bMax amendment  ← edit to generateQuestion sub case
T030 div aMax amendment  ← edit to generateQuestion div case
```

### Phase 3+4+5+6+7 — HTML sections in parallel

```
T033 #screen-practice-op HTML     ← independent section
T034 #screen-practice-diff HTML   ← independent section
T040 #screen-practice-session HTML ← independent section
T057 #screen-practice-summary HTML ← independent section
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (tests + engine exports + amendments)
3. Complete Phase 3: US1 (entry flow — Practice Mode button + operation/difficulty screens)
4. **STOP and VALIDATE**: Navigation works; no questions yet — independently testable
5. Deploy preview if ready

### Incremental Delivery

1. Phase 1 + 2 → Engine ready (tests green)
2. Phase 3 (US1) → Entry flow navigable → Deploy/Demo (Practice Mode exists but shows no questions)
3. Phase 4 (US2) → Practice session works (questions appear, no feedback) → Demo
4. Phase 5 (US3) → Feedback added → Demo (full single-question loop)
5. Phase 6 (US4) → Tally live → Demo (full session feel)
6. Phase 7 (US5) → Summary + exit → Demo (complete feature)
7. Phase 8 → Polish + accessibility → Ship

---

## Notes

- `[P]` tasks = different files or non-conflicting locations; no blocking dependencies
- `[Story]` label maps task to specific user story for traceability
- Streak display threshold for Practice Mode is `=== 0` (hide when zero), NOT `< streakThreshold (3)` from main game — do not copy-paste the main game streak visibility logic
- `getPracticeConfig` returns `PracticeRanges[difficulty]` (all four operations), not a single-operation slice — ensures no crash if `generateQuestion` is called with a different operation key
- `generateQuestion` div case `aMax` amendment (T030) is not in the original contracts/math-engine-amendments.md but is required to make Easy/Medium difficulty meaningful for division
- All practice state lives in `practiceSession` and `practiceOperation` — zero writes to `localStorage`, zero reads from `session` (main game variable)
- `#btn-stop-practice` must never be disabled or hidden — verify in T068
