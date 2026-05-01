# Tasks: Leaderboard

**Input**: Design documents from `specs/007-leaderboard/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included (TDD is mandatory per Constitution Principle IV — Test-First is NON-NEGOTIABLE).  
Engine logic → automated unit tests in `tests/leaderboard-engine.test.js`.  
UI orchestration → manual acceptance via `quickstart.md` scenarios (no DOM test infrastructure exists in this project).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel / in any order (no blocking dependency on other in-progress tasks)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Create file stubs and test scaffold so TDD can begin immediately.

- [X] T001 Create `js/leaderboard-engine.js` with all 13 exported function stubs (empty bodies, correct signatures): `loadLeaderboard`, `saveEntry`, `loadStats`, `updateStats`, `clearLeaderboard`, `isEligibleForNamePicker`, `qualifiesForTop10`, `sortLeaderboard`, `getUniquePlayers`, `resolvePlayerName`, `getFavouriteDifficulty`, `getLastPlayerName`, `setLastPlayerName`, `formatEntryDate`
- [X] T002 Create `tests/leaderboard-engine.test.js` with localStorage mock scaffold (`globalThis.localStorage = { getItem, setItem, removeItem }`), `beforeEach(() => { _ls = {}; })` reset, and one failing smoke test to confirm the file runs with `node --test tests/leaderboard-engine.test.js`

---

## Phase 2: Foundational — leaderboard-engine.js (TDD)

**Purpose**: Core data and logic module that ALL user story UI phases depend on. MUST be complete before any UI work begins.

**⚠️ CRITICAL**: No user story phase can begin until Phase 2 is complete and all tests pass.

> **NOTE: Write ALL test tasks (T003–T008) first and confirm they FAIL before implementing T009–T013**

### Tests (write first — must be RED before implementation)

- [X] T003 Write tests for `loadLeaderboard` (empty storage → `[]`, valid JSON → parsed array, corrupt JSON → `[]`) and `saveEntry` (add to empty list, add under cap, cap enforcement at 10, drop-lowest-score on insert, drop-earliest-date when scores tie) in `tests/leaderboard-engine.test.js`
- [X] T004 [P] Write tests for `sortLeaderboard` (score desc primary, ISO timestamp desc secondary for equal scores) and `formatEntryDate` ("2026-04-30T14:23:55.123Z" → "Apr 30") in `tests/leaderboard-engine.test.js`
- [X] T005 [P] Write tests for `loadStats` (missing key → zeroed defaults) and `updateStats` (increments `totalGamesPlayed`, updates `bestScoreEver`, updates `bestAccuracyEver`, increments `difficultyCounts[difficulty]`; called regardless of top-10 status) in `tests/leaderboard-engine.test.js`
- [X] T006 [P] Write tests for `getFavouriteDifficulty` (mode of `difficultyCounts`; alphabetical tiebreak when two difficulties tie) in `tests/leaderboard-engine.test.js`
- [X] T007 [P] Write tests for `isEligibleForNamePicker` (practice mode → false; 0 questions answered → false; normal ≥1 question → true; score=0 with ≥1 question → true) and `qualifiesForTop10` (board has <10 entries → true; score > lowest → true; score = lowest with full board → false; score < lowest → false) in `tests/leaderboard-engine.test.js`
- [X] T008 [P] Write tests for `getUniquePlayers` (unique names alphabetically A→Z, each with correct personal best; ≤10 names from capped list), `resolvePlayerName` (case-insensitive match returns existing capitalisation; unmatched name returns trimmed input), `getLastPlayerName` / `setLastPlayerName` (read/write `mathblaster_last_player_name`), and `clearLeaderboard` (removes `mathblaster_leaderboard` and resets `mathblaster_leaderboard_stats` to defaults; KEEPS `mathblaster_last_player_name`) in `tests/leaderboard-engine.test.js`

### Implementation (after confirming T003–T008 are RED)

- [X] T009 Implement `loadLeaderboard`, `saveEntry` (cap logic: drop entry with lowest score, earliest date on tie), `sortLeaderboard` (score desc, ISO timestamp desc), `formatEntryDate` in `js/leaderboard-engine.js`
- [X] T010 [P] Implement `loadStats` (return zeroed defaults when key missing or corrupt), `updateStats` (increment all four fields), `getFavouriteDifficulty` (mode of `difficultyCounts` keys, alphabetical tiebreak) in `js/leaderboard-engine.js`
- [X] T011 [P] Implement `isEligibleForNamePicker` (check `gameData.isPractice` and `gameData.questionsAnswered`) and `qualifiesForTop10` (compare against sorted leaderboard's lowest score; always true when <10 entries) in `js/leaderboard-engine.js`
- [X] T012 [P] Implement `getUniquePlayers` (read leaderboard, derive unique names + personal bests, sort A→Z), `resolvePlayerName` (`.toLowerCase()` comparison, return existing capitalisation or trimmed input), `getLastPlayerName` / `setLastPlayerName`, `clearLeaderboard` (remove entries + reset stats key; do NOT remove last-name key) in `js/leaderboard-engine.js`
- [X] T013 Run `node --test tests/leaderboard-engine.test.js` — confirm all tests pass (GREEN); add `"test": "node --test tests/*.test.js"` script to `package.json`

**Checkpoint**: All engine tests pass. `package.json` has a `test` script. Foundation ready — user story phases can now begin.

---

## Phase 3: User Story 1 + User Story 4 — Save Score After Game & Skip (Priority: P1) 🎯 MVP

**Goal**: After any eligible game session ends, a name picker appears on the results screen. A returning player saves with 0 taps; a new player types a name and saves. The leaderboard screen opens with the new entry highlighted gold. Skip exits without saving and returns to the start screen. (US4's Skip requirement is implemented within this same name picker component.)

**Independent Test**: Complete a game → name picker appears → test Scenario A (tap name button → Save enabled immediately) → press Save Score → leaderboard screen opens with gold row. Separately: complete a game → press Skip → confirm no entry saved, return to start screen.

- [X] T014 [US1] Add `import { loadLeaderboard, saveEntry, loadStats, updateStats, clearLeaderboard, isEligibleForNamePicker, qualifiesForTop10, sortLeaderboard, getUniquePlayers, resolvePlayerName, getFavouriteDifficulty, getLastPlayerName, setLastPlayerName, formatEntryDate } from './js/leaderboard-engine.js'` to the existing `import` block in `index.html`
- [X] T015 [US1] Add `<div id="name-picker" hidden>` markup inside both `<section id="screen-results">` and `<section id="screen-stop-summary">` in `index.html`; include: `<p id="name-picker-prompt">`, `<div id="name-picker-buttons">` (button grid), `<div id="name-picker-input-wrap" hidden>` containing `<input id="name-picker-input" type="text" maxlength="12">`, `<button id="btn-save-score" disabled>💾 Save Score</button>`, `<button id="btn-skip-save">Skip</button>`, `<p id="name-picker-no-qualify" hidden>Great effort! Keep playing to make the top 10! 💪</p>`
- [X] T016 [US1] Add CSS in `index.html` `<style>` for: `#name-picker` layout; name picker buttons (min-width 120px, flex-wrap, min 44×44 px touch target); `.name-btn-selected` gold highlight; `#btn-save-score:disabled` muted style; `#name-picker-input` text field
- [X] T017 [US1] Add `updateStats(sessionToGameData(session))` call in `index.html` at the top of `showResults()` and `showStopSummary()` functions, before `checkBadgesAfterGame()`; implement `sessionToGameData(session)` helper that extracts `{ score, accuracy, difficulty: "Standard", questionsAnswered, isPractice: false }` from `session`
- [X] T018 [US1] Implement `renderNamePicker(session)` in `index.html`: (1) call `isEligibleForNamePicker` — hide picker entirely if ineligible; (2) call `qualifiesForTop10` — if full board and score too low, show `#name-picker-no-qualify` and hide rest; (3) SCENARIO_B: leaderboard empty → show text input auto-focused, prompt "You're the first player! Enter your name:"; (4) SCENARIO_A: leaderboard has entries → render alphabetical name buttons each with personal best, append "+ Add new name" button last; (5) SCENARIO_C pre-select: read `getLastPlayerName()`, if matches a button → select it (gold class) + enable Save Score; (6) SCENARIO_C fallback: last name NOT on leaderboard → expand `#name-picker-input-wrap`, pre-fill last name, auto-focus; (7) wire name button clicks: select button + enable Save Score + deselect others; (8) wire "+ Add new name": expand input, auto-focus, deselect buttons; (9) wire `#name-picker-input` keyup: 1+ chars → enable Save Score, deselect buttons; 0 chars → disable Save Score
- [X] T019 [US1] Update badge popup callbacks in `showResults()` and `showStopSummary()` in `index.html`: change each `callback` from `() => showScreen('screen-results')` / `() => showScreen('screen-stop-summary')` to also call `renderNamePicker(session)` after the existing screen render call (ensuring name picker appears after badge popups dismiss)
- [X] T020 [US1] Implement `saveName()` handler in `index.html` wired to `#btn-save-score` click: read selected button name OR input value → call `resolvePlayerName(input, existingNames)` → build entry object → call `saveEntry(entry)` → call `setLastPlayerName(resolvedName)` → call `showLeaderboard(newEntryIndex)` where `newEntryIndex` is determined by finding the saved entry in the re-sorted leaderboard; add `let _saving = false` guard to prevent double-tap
- [X] T021 [US1/US4] Wire `#btn-skip-save` click to hide `#name-picker` and navigate to `showScreen('screen-start')` in `index.html`; wire `#name-picker-input` keydown: if Enter key and Save Score not disabled, call `saveName()`
- [X] T022 [US1] Add `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` call on the pre-selected name button at the end of `renderNamePicker()` for Scenario C match in `index.html`

**Checkpoint**: Complete a game → results screen shows name picker → all 3 scenarios work correctly → Save Score saves entry → Skip returns to start without saving. US1 and US4 are fully functional. (Leaderboard screen needed for full end-to-end; proceed to Phase 4.)

---

## Phase 4: User Story 2 — Leaderboard Screen (Priority: P2)

**Goal**: A ranked leaderboard screen showing top 10 scores with medal emojis, stats panel, gold-highlighted new entry, personal best banner, Back to Menu, and Play Again buttons.

**Independent Test**: After saving a score, the leaderboard screen opens automatically with the new entry highlighted gold and stats panel showing correct values. From the leaderboard, Play Again starts a new game; Back to Menu returns to start screen.

- [X] T023 [US2] Add `<section id="screen-leaderboard" hidden>` to `index.html` `<main>` containing: `<div id="lb-banner" hidden>🎉 New Personal Best! You're #1!</div>`, `<div id="lb-stats">` (spans for `#lb-stats-games`, `#lb-stats-best-score`, `#lb-stats-best-accuracy`, `#lb-stats-fav-diff`), `<p id="lb-empty" hidden>No scores yet — play a game and be the first on the board! 🎮</p>`, `<table id="lb-table" hidden><thead>...</thead><tbody id="lb-table-body"></tbody></table>`, `<button id="btn-lb-play-again">▶ Play Again</button>`, `<button id="btn-lb-back">🏠 Back to Menu</button>`
- [X] T024 [US2] Add CSS in `index.html` `<style>` for `#screen-leaderboard`: stats panel grid, table layout (rank, name, score, stars, diff, time, date columns), medal rank cells, `.lb-gold-row` highlight class, `#lb-banner` styled banner, responsive table (overflow-x: auto on small viewports)
- [X] T025 [US2] Implement `renderLeaderboard(highlightIndex)` in `index.html`: call `loadLeaderboard()` → `sortLeaderboard()` → `loadStats()`; if empty: show `#lb-empty`, hide `#lb-table`, hide `#lb-banner`; if entries: hide `#lb-empty`, show `#lb-table`; for each entry build `<tr>` with rank (🥇🥈🥉 for 1–3, plain number for 4–10), name, score (+ 🛑 if `stoppedEarly`), star emojis (⭐ × stars), difficulty, timerSetting, `formatEntryDate(date)`; apply `.lb-gold-row` class to row at `highlightIndex`; if `highlightIndex === 0` show `#lb-banner`; populate stats panel spans
- [X] T026 [US2] Implement `showLeaderboard(highlightIndex = -1)` helper in `index.html`: calls `renderLeaderboard(highlightIndex)`, `showScreen('screen-leaderboard')`; if `highlightIndex >= 0` scrolls gold row into view after render
- [X] T027 [US2] Wire `#btn-lb-back` click to `showScreen('screen-start')` in `index.html`
- [X] T028 [US2] Wire `#btn-lb-play-again` click in `index.html` to start a new game: reset session state and call existing game-start logic (same sequence as `#btn-play-again` on the results screen)

**Checkpoint**: Full save → leaderboard flow works end-to-end. Stats panel reflects correct totals. Gold row visible. Personal best banner appears when new entry is #1. Play Again and Back to Menu work.

---

## Phase 5: User Story 3 — Leaderboard from Start Screen (Priority: P2)

**Goal**: "🏆 Leaderboard" button on the start screen lets children check top scores before playing.

**Independent Test**: From the start screen, tap "🏆 Leaderboard" → leaderboard screen opens (with existing entries or empty-state message).

- [X] T029 [US3] Add `<button id="btn-leaderboard">🏆 Leaderboard</button>` to `<section id="screen-start">` in `index.html`
- [X] T030 [US3] Add CSS in `index.html` `<style>` for `#btn-leaderboard` consistent with existing start screen buttons (size, font, spacing)
- [X] T031 [US3] Wire `#btn-leaderboard` click to `showLeaderboard()` (no `highlightIndex` — browsing from start, no gold row) in `index.html`

**Checkpoint**: "🏆 Leaderboard" button visible on start screen and navigates to leaderboard. US2 + US3 together cover the full leaderboard browsing flow.

---

## Phase 6: User Story 5 — Score Cap & Ineligible Message (Priority: P3)

**Goal**: When the leaderboard is full and the new score doesn't qualify, show an encouraging message instead of the name picker.

**Independent Test**: Fill leaderboard to 10 entries (via DevTools: set `mathblaster_leaderboard` to a JSON array of 10 entries with score ≥ 100). Complete a game scoring ≤ the lowest entry. Verify the "Great effort!" message appears and no name picker or Save Score button is shown.

- [X] T032 [US5] Verify `renderNamePicker()` SCORE_TOO_LOW branch (implemented in T018) correctly calls `qualifiesForTop10(score)` when the leaderboard has 10 entries; confirm `#name-picker-no-qualify` ("Great effort! Keep playing to make the top 10! 💪") is visible and all other picker elements are hidden; run quickstart.md Scenario 5 and Scenario 6 in `index.html` to confirm both states; fix any issues found

**Checkpoint**: Score-too-low state shows encouraging message. Score-beats-lowest state shows name picker normally.

---

## Phase 7: User Story 6 — Clear Leaderboard (Priority: P3)

**Goal**: "🗑️ Clear Leaderboard" button with a two-step confirmation removes all entries and resets stats, without affecting badges, practice stats, or the last player name.

**Independent Test**: On the leaderboard screen (with entries), press "🗑️ Clear Leaderboard" → confirmation modal appears → press Cancel → entries unchanged → press "🗑️ Clear Leaderboard" again → press "Yes, clear" → empty-state message shown; DevTools confirms `mathblaster_leaderboard` absent, `mathblaster_leaderboard_stats` reset, `mathblaster_last_player_name` still present.

- [X] T033 [US6] Add `<button id="btn-lb-clear">🗑️ Clear Leaderboard</button>` and confirmation modal `<div id="lb-clear-confirm" hidden>` (containing prompt text, `<button id="btn-lb-clear-yes">Yes, clear</button>`, `<button id="btn-lb-clear-cancel">Cancel</button>`) to `<section id="screen-leaderboard">` in `index.html`
- [X] T034 [US6] Add CSS in `index.html` `<style>` for `#lb-clear-confirm` modal overlay (fixed position, backdrop), centered dialog box, Yes and Cancel button styles
- [X] T035 [US6] Wire `#btn-lb-clear` click to show `#lb-clear-confirm`; wire `#btn-lb-clear-cancel` to hide `#lb-clear-confirm`; wire `#btn-lb-clear-yes` to: call `clearLeaderboard()`, call `renderLeaderboard()` (empty state), hide `#lb-clear-confirm` in `index.html`
- [X] T036 [US6] Run quickstart.md Scenario 11 in `index.html`: verify Clear removes `mathblaster_leaderboard` and resets `mathblaster_leaderboard_stats`, while `mathblaster_badges`, `mathblaster_practice_stats`, and `mathblaster_last_player_name` are untouched; fix any issues found

**Checkpoint**: Clear flow works with confirmation. Data isolation verified. All 6 user stories are now implemented.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: WCAG 2.1 AA compliance (mandatory per Constitution Principle III + V), responsiveness, edge-case hardening, and full quickstart validation.

- [X] T037 Add `aria-label` to each dynamically generated name picker button (e.g. "Select Zbig, personal best 180 points") and `aria-pressed` attribute toggled on selection; add `aria-live="polite"` region to announce save/skip outcome in `index.html`
- [X] T038 [P] Add `scope="col"` to all `<th>` elements in the leaderboard table; ensure `<section id="screen-leaderboard">` has an `<h2>` heading ("🏆 Leaderboard"); verify heading hierarchy (`h1` on start screen → `h2` on each screen) in `index.html`
- [X] T039 [P] Implement focus trap for `#lb-clear-confirm` modal: auto-focus `#btn-lb-clear-yes` on open; Tab and Shift+Tab cycle only within modal buttons; Escape key triggers Cancel in `index.html`
- [X] T040 [P] Audit colour contrast: verify `.lb-gold-row` background meets ≥3:1 contrast ratio against row text; verify all name picker button text meets ≥4.5:1 ratio; verify Save Score disabled state meets ≥3:1; adjust colours in `index.html` `<style>` if needed
- [X] T041 [P] Verify responsive layout at 320px viewport: name picker buttons wrap with no horizontal overflow (flex-wrap); min-width 120px enforced; leaderboard table scrolls horizontally on small screens (overflow-x: auto on wrapper); all touch targets ≥44×44 px in `index.html` `<style>`
- [X] T042 [P] Wrap all localStorage operations in `js/leaderboard-engine.js` with try/catch blocks; return safe defaults on failure (empty array, zeroed stats); ensure no crash when `localStorage` throws (e.g. private browsing mode storage full)
- [ ] T043 Run all 14 quickstart.md scenarios manually in the browser; fix any discrepancies in `index.html` or `js/leaderboard-engine.js`
- [X] T044 Run `node --test tests/*.test.js` — confirm all engine tests still pass after polish changes; fix any regressions in `js/leaderboard-engine.js`

**Checkpoint**: WCAG 2.1 AA requirements met. All quickstart scenarios pass. All tests pass. Feature ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1+US4)**: Depends on Phase 2 — can start as soon as engine tests pass
- **Phase 4 (US2)**: Depends on Phase 2 — can start in parallel with Phase 3 (both write to `index.html` sequentially)
- **Phase 5 (US3)**: Depends on Phase 4 (needs `showLeaderboard()` to exist) — follows Phase 4
- **Phase 6 (US5)**: Depends on Phase 3 (needs `renderNamePicker()` to exist) — follows Phase 3
- **Phase 7 (US6)**: Depends on Phase 4 (needs leaderboard screen section to exist) — follows Phase 4
- **Phase 8 (Polish)**: Depends on all prior phases

### User Story Dependencies

| Story | Can start after | Notes |
|-------|----------------|-------|
| US1 + US4 (Phase 3) | Phase 2 | Core save flow; name picker |
| US2 (Phase 4) | Phase 2 | Leaderboard screen; `showLeaderboard()` needed by US1's Save Score |
| US3 (Phase 5) | Phase 4 | Needs `showLeaderboard()` from Phase 4 |
| US5 (Phase 6) | Phase 3 | Verifies branch already in `renderNamePicker()` |
| US6 (Phase 7) | Phase 4 | Clear button lives in leaderboard screen section |

### Parallel Opportunities Within Phase 2

Tests T004–T008 can be written in any order (different describe blocks in same file):

```bash
# All these test groups are logically independent — write in any order:
T004: sortLeaderboard + formatEntryDate tests
T005: loadStats + updateStats tests
T006: getFavouriteDifficulty tests
T007: isEligibleForNamePicker + qualifiesForTop10 tests
T008: getUniquePlayers + resolvePlayerName + clearLeaderboard tests
```

Implementations T010–T012 can be done in any order (different function groups in same file):

```bash
T010: loadStats, updateStats, getFavouriteDifficulty
T011: isEligibleForNamePicker, qualifiesForTop10
T012: getUniquePlayers, resolvePlayerName, getLastPlayerName, setLastPlayerName, clearLeaderboard
```

---

## Implementation Strategy

### MVP First (User Stories 1–2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (engine TDD — CRITICAL)
3. Complete Phase 3: US1 + US4 (save flow + skip)
4. Complete Phase 4: US2 (leaderboard screen)
5. **STOP and VALIDATE**: Full save → leaderboard flow works end-to-end
6. Deploy/demo if ready

### Incremental Delivery

1. Phases 1–2 → Engine ready
2. Phase 3 → Save Score + Skip (MVP P1)
3. Phase 4 → Leaderboard Screen (completes end-to-end flow)
4. Phase 5 → Browse from start screen
5. Phase 6 → Score cap message
6. Phase 7 → Clear Leaderboard
7. Phase 8 → Polish + WCAG audit → Ship

---

## Notes

- TDD is mandatory (Constitution IV): write ALL Phase 2 tests before writing any implementation
- All `index.html` changes are to a single file; avoid conflicts by working through phases sequentially
- `js/leaderboard-engine.js` has no DOM dependency — all logic is pure and testable
- `difficulty: "Standard"` is used for all normal game entries in this version (no selectable difficulty in normal mode)
- `updateStats()` is called at game end regardless of whether the score makes the top 10 — this is intentional (clarification Q1)
- `mathblaster_last_player_name` is NOT cleared on leaderboard clear — this is intentional (clarification Q4)
- After clearing, the next game triggers Scenario C fallback (+ Add new name expanded, name pre-filled)
- Commit after each completed phase (or each task) per Constitution Principle VI
