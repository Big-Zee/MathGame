# Tasks: Achievement Badges

**Input**: Design documents from `specs/006-achievement-badges/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — Constitution Principle IV mandates TDD for all badge check logic. RED tests before every GREEN implementation.

**Organization**: Tasks grouped by user story (spec.md US1–US5) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story (US1–US5 maps to spec.md P1–P5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the two new files that all subsequent tasks write to.

- [X] T001 Create `js/badge-engine.js` as an empty ES module (`export {}` placeholder) — confirms Azure SWA serves the file and the import resolves
- [X] T002 [P] Create `tests/badges.test.js` as an empty test file with `import {} from '../js/badge-engine.js'` — confirms Node.js can import the module

**Checkpoint**: `node --test tests/badges.test.js` passes (empty suite, 0 tests). `index.html` can add `import './js/badge-engine.js'` without a 404.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Badge data constants and all localStorage wrappers — no user-visible changes yet. Every user story depends on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add `BADGE_DEFINITIONS` (18 badge objects with id, name, emoji, category, hint, description) and `BADGE_CATEGORIES` (5 category descriptors) constants to `js/badge-engine.js` — pure data, no logic
- [X] T004 Write RED tests for badge store wrappers: `getBadgeStore()` with absent key returns full 18-badge init state; `getBadgeStore()` with corrupt JSON returns init state without throwing; `getBadgesNew()` with absent key returns 0; `saveBadgeStore` → `getBadgeStore` round-trip preserves earned status and ISO date in `tests/badges.test.js`
- [X] T005 Implement badge store wrappers GREEN — `getBadgeStore`, `saveBadgeStore`, `getBadgesNew`, `incrementBadgesNew`, `clearBadgesNew` using `globalThis.localStorage?.` guard in `js/badge-engine.js`
- [X] T006 Write RED tests for practice stats and timers-used wrappers: `getPracticeStats()` absent key returns zero-state; `savePracticeStats` → `getPracticeStats` round-trip; `getTimersUsed()` absent key returns `[]`; `saveTimersUsed` → `getTimersUsed` round-trip in `tests/badges.test.js`
- [X] T007 Implement practice stats wrappers (`getPracticeStats`, `savePracticeStats`) and timers-used wrappers (`getTimersUsed`, `saveTimersUsed`) GREEN in `js/badge-engine.js`
- [X] T008 Add `import { BADGE_DEFINITIONS, BADGE_CATEGORIES } from './js/badge-engine.js'` (and all wrappers) to `index.html` inline `<script type="module">`; open `index.html` in browser and confirm no console errors; run `node --test tests/badges.test.js` — T004 + T006 tests must pass GREEN

**Checkpoint**: `node --test tests/badges.test.js` passes. `index.html` loads without errors. `getBadgeStore()` can be called from the browser console and returns all 18 badges in unearned state.

---

## Phase 3: User Story 1 — Badges Screen (Priority: P1) 🎯 MVP

**Goal**: A fully working Badges screen accessible from the Start screen, showing all 18 badges with correct earned/unearned state and progress indicators. The Start screen button shows a new-badge counter.

**Independent Test**: Open the game. Tap "🏅 Badges" on the Start screen → Badges screen opens showing all 18 greyed-out badges with hints; total reads "You've earned 0 out of 18 badges! 🏅"; each section shows "0 / N earned". Manually set a badge as earned via DevTools (`localStorage.setItem('mathblaster_badges', JSON.stringify({...}))`), reload, open Badges → that badge shows in full colour with an unlock date. Close Badges → Start screen button shows "🏅 Badges" (no counter). Set `mathblaster_badges_new` to `"2"` in DevTools, reload → Start screen button reads "🏅 Badges (2 new!)". Open Badges → counter clears, button reverts.

- [X] T009 [US1] Add `<section id="screen-badges" hidden>` to `index.html` containing: page heading, total-count element, and 5 category groups each with section heading, progress indicator (`<span class="section-progress">`), and a badge-card grid with one `<div class="badge-card" data-badge-id="...">` per badge (18 total) holding emoji, name, and status-text placeholders
- [X] T010 [US1] Add `<button id="btn-badges">🏅 Badges</button>` to `#screen-start` in `index.html`; add `<button id="btn-badges-back">← Back</button>` inside `#screen-badges`
- [X] T011 [US1] Add CSS to `index.html` for: badge grid layout (CSS Grid, min 3 columns, responsive), category section headers with emoji and progress indicator, `.badge-card` base styles (size ≥ 44×44 px, padding, border-radius, text alignment)
- [X] T012 [US1] Add CSS to `index.html` for earned badge cards (`.badge-card.earned`: full colour, solid border) and unearned cards (`.badge-card.unearned`: opacity 0.35, greyscale filter), unlock date style (`.badge-unlocked-date`: small, muted), hint text style (`.badge-hint`: small, italic)
- [X] T013 [US1] Implement `renderBadgesScreen()` in `index.html`: reads `getBadgeStore()`; for each badge card DOM element, sets `.earned`/`.unearned` class, populates unlock date as "Month Day" (e.g. "May 1") or hint text; updates each section's `<span class="section-progress">` with "N / M earned"; updates total-count element
- [X] T014 [US1] Implement `updateBadgesButton()` in `index.html`: reads `getBadgesNew()`; sets `#btn-badges` text to `"🏅 Badges (N new!)"` when N > 0, else `"🏅 Badges"`
- [X] T015 [US1] Implement `showBadgesScreen()` in `index.html`: calls `clearBadgesNew()`, `updateBadgesButton()`, `renderBadgesScreen()`, `showScreen('screen-badges')`; sets focus to `#btn-badges-back`
- [X] T016 [US1] Wire event listeners in `index.html`: `#btn-badges` click → `showBadgesScreen()`; `#btn-badges-back` click → `showScreen('screen-start')`; add `updateBadgesButton()` call after each `showScreen('screen-start')` call site (Play Again, Main Menu, Back to Start in practice, Stop Summary Main Menu)
- [X] T017 [US1] Add accessibility to `#screen-badges` in `index.html`: `role="main"` on section, `<h1>` heading, `<h2>` on each category section, `role="img"` + `aria-label="[name] — [Unlocked May 1 / hint]"` on each badge card, `aria-label="Back to start screen"` on Back button

**Checkpoint**: Badges screen renders all 18 badges. New-badge counter on Start screen button works. Back button returns to Start. All badge cards have accessible labels.

---

## Phase 4: User Story 2 — Badge Earning (Priority: P2)

**Goal**: All 18 badges check automatically after each question and each session end; state saves to localStorage; the Start screen button's new-badge counter increments. (Popup celebration comes in US3.)

**Independent Test**: Start a game. Answer the first question correctly within 2 seconds. After feedback, open Badges screen — "Speed Demon" should show as earned with today's date. "First Win" earns after completing any game. Verify `localStorage.getItem('mathblaster_badges')` in DevTools. Verify `mathblaster_badges_new` increments for each new badge.

### Accuracy Badges (TDD)

- [X] T018 [US2] Write RED tests for Accuracy badge checks in `tests/badges.test.js`: `checkHatTrick(3)` true, `checkHatTrick(2)` false; `checkOnFire(5)` true, `checkOnFire(4)` false; `checkUnstoppable(10)` true, `checkUnstoppable(9)` false; `checkSharpShooter(10)` true, `checkSharpShooter(9)` false; `checkComebackKid(2, 3)` true, `checkComebackKid(1, 3)` false, `checkComebackKid(2, 2)` false
- [X] T019 [US2] Implement Accuracy badge checks GREEN — `checkHatTrick`, `checkOnFire`, `checkUnstoppable`, `checkSharpShooter`, `checkComebackKid` in `js/badge-engine.js`

### Speed Badges (TDD)

- [X] T020 [US2] Write RED tests for Speed badge checks in `tests/badges.test.js`: `checkSpeedDemon(2999)` true, `checkSpeedDemon(3000)` false; `checkLightning(5)` true, `checkLightning(4)` false; `checkQuickThinker([...10 values averaging 6999ms], 10)` true, `checkQuickThinker([...averaging 7000ms], 10)` false, `checkQuickThinker([...], 9)` false
- [X] T021 [US2] Implement Speed badge checks GREEN — `checkSpeedDemon`, `checkLightning`, `checkQuickThinker` in `js/badge-engine.js`

### Score Badges (TDD)

- [X] T022 [US2] Write RED tests for Score badge checks in `tests/badges.test.js`: `checkFirstWin(false)` true, `checkFirstWin(true)` false; `checkCentury(100)` true, `checkCentury(99)` false; `checkHighRoller(150)` true, `checkHighRoller(149)` false; `checkMathLegend(200)` true, `checkMathLegend(199)` false
- [X] T023 [US2] Implement Score badge checks GREEN — `checkFirstWin`, `checkCentury`, `checkHighRoller`, `checkMathLegend` in `js/badge-engine.js`

### Practice Badges (TDD)

- [X] T024 [US2] Write RED tests for Practice badge checks in `tests/badges.test.js`: `checkPracticeMakesPerfect(5)` true, `checkPracticeMakesPerfect(4)` false; `checkOperationMaster(["addition","subtraction","multiplication","division"])` true, `checkOperationMaster(["addition","subtraction","multiplication"])` false; `checkDedication(50)` true, `checkDedication(49)` false
- [X] T025 [US2] Implement Practice badge checks GREEN — `checkPracticeMakesPerfect`, `checkOperationMaster`, `checkDedication` in `js/badge-engine.js`

### Variety Badges (TDD)

- [X] T026 [US2] Write RED tests for Variety badge checks in `tests/badges.test.js`: `checkExplorer(["easy","medium","hard"])` true, `checkExplorer(["easy","medium"])` false; `checkTimeLord([5,10,15,20,25,30])` true, `checkTimeLord([5,10,15,20,25])` false; `checkPerfectionist("hard", 10, 10)` true, `checkPerfectionist("hard", 10, 9)` false, `checkPerfectionist("medium", 10, 10)` false, `checkPerfectionist("hard", 0, 0)` false
- [X] T027 [US2] Implement Variety badge checks GREEN — `checkExplorer`, `checkTimeLord`, `checkPerfectionist` in `js/badge-engine.js`

### Orchestrators and awardBadges (TDD)

- [X] T028 [US2] Write RED tests for orchestrators and `awardBadges` in `tests/badges.test.js`: `checkBadgesAfterQuestion` returns only IDs for un-earned badges whose conditions are met; `checkBadgesAfterGame` returns correct IDs; `checkBadgesAfterPractice` returns correct IDs; `awardBadges(["hat-trick"], store)` sets earned:true and ISO unlockedAt on that badge; calling `awardBadges` again on an already-earned badge does NOT overwrite unlockedAt
- [X] T029 [US2] Implement `checkBadgesAfterQuestion`, `checkBadgesAfterGame`, `checkBadgesAfterPractice`, `awardBadges` GREEN in `js/badge-engine.js`

### Session Extension and Integration Hooks

- [X] T030 [US2] Add `answerTimesMs: []` and `fastAnswerStreak: 0` to the object returned by `newSession(config)` in `index.html`
- [X] T031 [US2] Amend `showFeedback(selectedChoice, timedOut)` in `index.html`: after existing answer evaluation and UI update, compute `elapsedMs = (session.config.timerSeconds * 10 - session.timerTicks) * 100`; push to `session.answerTimesMs`; if correct and `elapsedMs < 5000` increment `session.fastAnswerStreak`, else reset `session.fastAnswerStreak = 0`; call `checkBadgesAfterQuestion(session, getBadgeStore())`; if new badges returned call `awardBadges`, `saveBadgeStore`, `incrementBadgesNew` — popup gating (T038) wired in US3
- [X] T032 [US2] Amend `showResults()` in `index.html`: after all session stats are computed and before `showScreen('screen-results')`, call `checkBadgesAfterGame(session, getBadgeStore(), getTimersUsed())`; update `mathblaster_timers_used` by adding `session.config.timerSeconds`; if new badges: `awardBadges`, `saveBadgeStore`, `incrementBadgesNew` — popup gating in US3
- [X] T033 [US2] Amend `showStopSummary()` in `index.html`: same pattern as T032 — check badges, update timers-used, award + save + increment new counter before screen transition
- [X] T034 [US2] Amend `stopPractising()` in `index.html`: after computing `totalAnswered`/`totalCorrect`, update `mathblaster_practice_stats` (`sessionsCompleted++`, union `operationsCompleted` with `practiceSession.operation`, union `difficultiesCompleted` with `practiceSession.difficulty`, sum `totalCorrect`); save via `savePracticeStats`; call `checkBadgesAfterPractice(getPracticeStats(), { difficulty, totalAnswered, totalCorrect }, getBadgeStore())`; if new badges: `awardBadges`, `saveBadgeStore`, `incrementBadgesNew` — popup gating in US3

**Checkpoint**: Badges earn and persist. "First Win" earns on first completed game. "Speed Demon" earns when answering in < 3 s. DevTools confirms `mathblaster_badges` updates correctly. `node --test` passes all badge check and orchestrator tests.

---

## Phase 5: User Story 3 — Badge Unlock Popup (Priority: P3)

**Goal**: An animated popup celebrates each new badge earned mid-game or at session end. Multiple badges queue and show sequentially. The next question's countdown does not start until the queue drains.

**Independent Test**: Start a game. Answer the first question correctly within 2 seconds (triggers Speed Demon). After the feedback phase ends, a popup appears: "🎉 New Badge Unlocked! / 🏎️ Speed Demon / You answered in under 3 seconds!". Wait 3 seconds — popup auto-dismisses, next question loads and countdown starts. Tap popup before 3 s — dismisses immediately. Earn Hat Trick and On Fire simultaneously (3rd correct answer in a row, answering fast enough for Speed Demon too) — verify three popups queue and display one after another before the next question begins.

- [X] T035 [US3] Add `<div id="badge-unlock-popup" hidden role="status" aria-live="assertive">` to `index.html` containing: title element, badge emoji element, badge name element, description element; position as `fixed` overlay in CSS
- [X] T036 [US3] Add CSS for `#badge-unlock-popup` in `index.html`: `position: fixed`, centered top-area, `z-index` above game UI, slide-in animation `@keyframes badgePopIn` (transform + opacity); `@media (prefers-reduced-motion: reduce)` rule that removes the animation but keeps the popup visible
- [X] T037 [US3] Add module-level state `let badgePopupQueue = [], badgePopupCallback = null, badgePopupTimer = null` and implement three functions in `index.html`: `enqueueBadgePopups(badgeIds, callback)` — sets queue and callback, calls `showNextBadgePopup()`; `showNextBadgePopup()` — populates popup DOM from `BADGE_DEFINITIONS`, removes `hidden`, sets `badgePopupTimer = setTimeout(dismissCurrentPopup, 3000)`; `dismissCurrentPopup()` — clears timer, adds `hidden`, shifts queue, calls `showNextBadgePopup()` if queue non-empty, else calls `badgePopupCallback()` and resets state
- [X] T038 [US3] Wire popup dismissal in `index.html`: add click listener on `#badge-unlock-popup` → `dismissCurrentPopup()`; add `document` keydown listener → if `event.key === 'Escape'` and popup is visible → `dismissCurrentPopup()`
- [X] T039 [US3] Integrate popup gating into `showFeedback()` in `index.html`: replace the "if new badges: award + save" block from T031 — when new badges exist, call `enqueueBadgePopups(newBadgeIds, advanceRound)` instead of `session.pendingAdvance = setTimeout(advanceRound, 1000)`; when no new badges, keep existing `setTimeout(advanceRound, 1000)` path unchanged
- [X] T040 [US3] Integrate popup gating into `showResults()` and `showStopSummary()` in `index.html`: when new badges exist, call `enqueueBadgePopups(newBadgeIds, () => showScreen('screen-results'))` / `enqueueBadgePopups(newBadgeIds, () => showScreen('screen-stop-summary'))`; when no new badges, call `showScreen(...)` directly (existing path)
- [X] T041 [US3] Integrate popup gating into `stopPractising()` in `index.html`: when new badges exist, call `enqueueBadgePopups(newBadgeIds, () => showScreen('screen-practice-summary'))`; when no new badges, call `showScreen('screen-practice-summary')` directly
- [X] T042 [US3] Add accessibility to `#badge-unlock-popup` in `index.html`: `aria-label` on popup container including badge name + description; confirm Escape key dismiss from T038 works; verify popup does NOT steal focus during question phase; add `aria-atomic="true"` on popup content region

**Checkpoint**: Badge popup appears after every new badge, auto-dismisses in 3 s or on tap/Escape. Multiple badges queue correctly. Next question countdown only starts after all popups clear. `prefers-reduced-motion` removes animation without hiding content.

---

## Phase 6: User Story 4 — Persistence Guarantee (Priority: P4)

**Goal**: Badge state survives page reload with 100% fidelity. Clearing the high score does not affect badges. Badge records are idempotent (re-earning does not corrupt existing data).

**Independent Test**: Earn three badges. Close the browser tab. Reopen and load the page. Open Badges screen — all three badges still show as earned with their original unlock dates. Clear the high score via DevTools (`localStorage.removeItem('mathgame_highscore')`). Reload. Open Badges — unaffected. Manually call `awardBadges(['speed-demon'], getBadgeStore())` in the console for a badge already earned — call `getBadgeStore()['speed-demon'].unlockedAt` and confirm the date has NOT changed.

- [X] T043 [US4] Write tests for edge-case persistence in `tests/badges.test.js`: `getBadgeStore()` absent key → full 18-badge init with all `earned:false, unlockedAt:null`; `getBadgeStore()` with `"not-json"` stored → returns init state, no exception thrown; `getBadgeStore()` with valid JSON missing some badge IDs → returned store fills in missing badges as unearned
- [X] T044 [US4] Write tests for `awardBadges()` idempotency in `tests/badges.test.js`: awarding a badge not yet in store sets `earned:true` and `unlockedAt` to an ISO string; awarding the same badge a second time (simulating earning again) does NOT change `unlockedAt`; the function returns a new object and does not mutate the input store
- [X] T045 [US4] [P] Write tests for `getPracticeStats()` accumulation in `tests/badges.test.js`: absent key returns `{ sessionsCompleted:0, operationsCompleted:[], difficultiesCompleted:[], totalCorrect:0 }`; after saving stats with `operationsCompleted:["addition"]` and then saving again with `["addition","subtraction"]`, `getTimersUsed` reflects no duplication; `sessionsCompleted` increments correctly across two saves
- [X] T046 [US4] [P] Write tests for `getTimersUsed()` in `tests/badges.test.js`: absent key returns `[]`; saving `[5, 15]` then `[5, 15, 30]` returns `[5, 15, 30]` (no duplicates); `checkTimeLord([5,10,15,20,25,30])` returns true; `checkTimeLord([5,10,15,20,25])` returns false
- [X] T047 [US4] Run `node --test` — confirm all tests in `tests/badges.test.js` AND `tests/math-engine.test.js` pass; zero regressions

**Checkpoint**: `node --test` reports 100% pass. `getBadgeStore()` is safe against missing or corrupt data. `awardBadges()` is idempotent. High-score clearing does not touch badge keys.

---

## Phase 7: User Story 5 — Practice Mode Badges (Priority: P5)

**Goal**: The three Practice badges and the "Explorer" Variety badge all earn correctly through real Practice Mode play. "Perfectionist" earns on a perfect Hard Practice session.

**Independent Test**: Complete exactly 5 Practice sessions (any operation/difficulty, each reaching the Practice Summary screen). After the 5th session, the "Practice Makes Perfect" popup appears before the Summary screen loads. Complete one session each for ➕, ➖, ✖️, ➗ — "Operation Master" earns after the 4th operation. Accumulate 50 correct answers across all Practice sessions — "Dedication" earns when the running total crosses 50. Complete Practice sessions at Easy, Medium, and Hard difficulty — "Explorer" earns when all 3 are done. Complete a Hard Practice session answering every question correctly — "Perfectionist" earns.

- [ ] T048 [US5] Inspect `practiceSession` object in `index.html` and confirm `.operation` and `.difficulty` fields are set correctly when a practice session starts; if field names differ from `practiceSession.operation` / `practiceSession.difficulty`, update the T034 amendment to use the correct field names
- [ ] T049 [US5] Manual test — Practice badges end-to-end in `index.html`: complete 5 Practice sessions → verify "Practice Makes Perfect" popup appears before 5th session Summary; complete sessions in all 4 operations → verify "Operation Master" popup; accumulate 50+ correct answers across sessions → verify "Dedication" popup; inspect `mathblaster_practice_stats` in DevTools after each session to confirm accumulation
- [ ] T050 [US5] Manual test — Variety badges (Practice) in `index.html`: complete Practice sessions at Easy, Medium, Hard difficulties → verify "Explorer" popup after 3rd difficulty; complete a Hard Practice session with zero wrong answers → verify "Perfectionist" popup on summary screen transition
- [ ] T051 [US5] Manual test — Time Lord badge (main game) in `index.html`: play and complete games using all 6 timer settings (5 s, 10 s, 15 s, 20 s, 25 s, 30 s) — each game may be in a separate session; verify "Time Lord" popup appears when the 6th unique timer setting is completed; inspect `mathblaster_timers_used` in DevTools

**Checkpoint**: All 18 badges are now earnable and have been manually verified. Badge popups appear at the correct time in both game and Practice Mode flows.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, motion preferences, and final validation pass.

- [ ] T052 Full WCAG 2.1 AA accessibility audit in `index.html`: tab-navigate through `#screen-badges` with keyboard only (all badge cards reachable and labelled); test with screen reader — verify badge card `aria-label` announces name + earned status; verify `#badge-unlock-popup` `aria-live="assertive"` fires when popup appears; verify colour contrast ≥ 4.5:1 for badge names in both earned and unearned states; verify earned/unearned distinction does not rely on colour alone (opacity difference serves as secondary cue)
- [ ] T053 [P] Verify `prefers-reduced-motion` in `index.html`: set OS/browser to "reduce motion"; earn a badge — popup must appear (not hidden) but without slide-in animation; badge card earned/unearned transition must still be visible; no other animations should appear
- [ ] T054 [P] Final `node --test` clean run confirming all tests in `tests/badges.test.js` and `tests/math-engine.test.js` pass; zero regressions
- [ ] T055 Run all 10 quickstart.md manual test scenarios end-to-end in `index.html`; confirm each scenario produces the expected result described in `specs/006-achievement-badges/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — can start as soon as foundation is complete
- **Phase 4 (US2)**: Depends on Phase 2 — depends on US1 for `updateBadgesButton()` to reflect earned state visually, but badge checks themselves are independent
- **Phase 5 (US3)**: Depends on Phase 4 — popup queue wraps the badge-award calls from US2
- **Phase 6 (US4)**: Depends on Phase 4 — tests the persistence of badge data created in US2
- **Phase 7 (US5)**: Depends on Phase 4 (Practice stats update wiring in T034) — completes the Practice badge story
- **Phase 8 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2–US5
- **US2 (P2)**: Can start after Foundational — badge checks are independent; US1 needed to visually confirm earning via the Badges screen
- **US3 (P3)**: Depends on US2 (badge-earning logic must exist before gating)
- **US4 (P4)**: Depends on US2 (tests the persistence of US2 data)
- **US5 (P5)**: Depends on US2 (T034 wiring must be complete and correct)

### Within Each User Story

- RED tests MUST be written and confirmed failing before GREEN implementation (Phases 4 and 6)
- CSS tasks can follow or accompany their corresponding HTML tasks (same file)
- Orchestrators (T028–T029) must follow their constituent check functions (T018–T027)
- Integration hooks (T030–T034) must follow orchestrators (T029)
- Popup gating (T038–T041) must follow popup logic (T037) and integration hooks (T030–T034)

### Parallel Opportunities

- T001 and T002 can be created simultaneously (different new files)
- T045 and T046 are different test cases in the same file — write sequentially or as one commit
- T052 and T053 are separate concerns (accessibility vs motion) — can work in parallel
- T054 (run tests) and T055 (manual tests) are independent validation steps

---

## Parallel Example: Phase 4 (US2 Badge Checks)

```
# RED tests and data definitions are different files — write tests first, then implement:
Task T018: RED tests for Accuracy checks → tests/badges.test.js
Task T019: GREEN Accuracy check implementation → js/badge-engine.js

# Then proceed to Speed:
Task T020: RED tests for Speed checks → tests/badges.test.js
Task T021: GREEN Speed check implementation → js/badge-engine.js
# ... (repeat for Score, Practice, Variety, Orchestrators)
```

---

## Implementation Strategy

### MVP First (User Stories 1–2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Badges screen visible and navigable
4. Complete Phase 4: US2 — All 18 badges earn and persist
5. **STOP and VALIDATE**: Badges screen shows earned badges with correct dates; `node --test` passes
6. Ship MVP: children can earn badges and view their collection (no popup celebration yet)

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → Badges screen and button (viewable, nothing earns yet)
3. US2 → All badges earn and persist (no popup, but Badges screen confirms earning)
4. US3 → Badge popup celebrations added
5. US4 → Persistence hardened with edge-case tests
6. US5 → Practice badges fully verified end-to-end
7. Polish → Accessibility audit, motion preferences, final clean run

---

## Notes

- `[P]` tasks point to different files and have no dependencies on incomplete tasks
- `[USN]` label maps each task to its user story for traceability
- RED test tasks must be committed with failing tests confirmed before starting GREEN
- Commit after each task or logical group (T018+T019, T020+T021, etc.)
- Validate each story at its Checkpoint before moving to the next priority
- `js/math-engine.js` and `tests/math-engine.test.js` are never modified — run their tests as regression checks only
- The popup queue callback pattern (T037–T041) is the most integration-sensitive part; test it manually with 2+ simultaneous badges before marking US3 complete
