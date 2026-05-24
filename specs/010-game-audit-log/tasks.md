# Tasks: Game Audit Log

**Input**: Design documents from `/specs/010-game-audit-log/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-state-machine.md ✅

**Tests**: Included — Constitution Principle IV (Test-First) is mandatory. All engine unit tests MUST be written and confirmed failing BEFORE implementation begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in all descriptions

---

## Phase 1: Setup

**Purpose**: Create file skeletons and failing tests before any implementation.

- [x] T001 Create `js/audit-log-engine.js` with export stubs (all functions exported but not yet implemented — returns `null`/`[]` stubs only)
- [x] T002 Create `tests/audit-log-engine.test.js` with all unit test cases covering: `loadAuditLog` (empty, valid, malformed JSON), `appendAuditEntry` (append, FIFO trim at 100, FIFO trim above 100), `clearAuditLog` (removes only correct key), `formatDuration` (under 60s, exactly 60s, over 60s), `formatTimestamp` (valid ISO → "Apr 30, 14:23"), `computeAuditSummary` (empty, single entry, tie-breaking, all-null players). **Run `node --test tests/audit-log-engine.test.js` and confirm ALL tests FAIL before proceeding.**

**Checkpoint**: File skeletons exist; all tests fail (red). No implementation yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the core engine module. All user stories depend on this being complete and tested.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Implement `loadAuditLog()` and `clearAuditLog()` in `js/audit-log-engine.js` — `loadAuditLog` reads `mathblaster_audit_log` from localStorage, returns parsed array or `[]` on missing/malformed; `clearAuditLog` removes only the `mathblaster_audit_log` key
- [x] T004 [P] Implement `appendAuditEntry(entry)` in `js/audit-log-engine.js` — loads current log, if `log.length >= 100` removes index 0 (oldest), then appends new entry, saves to localStorage; log never exceeds 100 entries
- [x] T005 [P] Implement `formatDuration(startIso, endIso)` in `js/audit-log-engine.js` — calculates `(new Date(endIso) - new Date(startIso))` in ms; formats as `"Xs"` if under 60 000 ms, `"Xm Ys"` if 60 000 ms or more
- [x] T006 [P] Implement `formatTimestamp(isoString)` in `js/audit-log-engine.js` — converts ISO 8601 UTC string to device local time, formats as `"Mmm DD, HH:MM"` (e.g., `"Apr 30, 14:23"`) using `Intl.DateTimeFormat` with `{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }`
- [x] T007 [P] Implement `computeAuditSummary(log)` in `js/audit-log-engine.js` — returns `{ totalSessions, totalPlayTimeMs, avgErrors, mostActivePlayer }` where: `totalSessions = log.length`, `totalPlayTimeMs = sum of (endTime - startTime)` for all entries, `avgErrors = totalErrors / log.length` rounded to 1 decimal, `mostActivePlayer = name with most entries (tie-break: alphabetical A→Z case-insensitive); null if all playerNames are null`
- [x] T008 Add difficulty-from-timer helper in `js/audit-log-engine.js` — export `timerToDifficulty(seconds)` that returns `"Hard"` for seconds ≤ 10, `"Medium"` for seconds ≤ 20, `"Easy"` for seconds > 20
- [x] T009 Add `import { ..., timerToDifficulty, loadAuditLog, appendAuditEntry, clearAuditLog, formatDuration, formatTimestamp, computeAuditSummary } from './js/audit-log-engine.js'` to the `<script type="module">` import block in `index.html` (add after existing imports, before game logic)
- [x] T010 Run `node --test tests/audit-log-engine.test.js` — confirm ALL tests now PASS (green). Do not proceed to Phase 3 until all pass.

**Checkpoint**: Engine module fully tested and passing. `index.html` imports are wired. All timer/difficulty mapping verified.

---

## Phase 3: User Story 2 — Session Recording (Priority: P1)

**Goal**: Every completed main-game session (no-lives, completed, stopped+confirmed) is automatically recorded to `mathblaster_audit_log` with the correct fields. Practice mode, keep-playing, and mid-session close are never recorded.

**Independent Test**: Play one game to completion, press Skip on name picker, press Back to Menu. Open DevTools → Application → `mathblaster_audit_log`. Verify exactly 1 valid JSON entry with correct `startTime`, `endTime`, `errors`, `endReason`, `playerName: null`, `score`, `difficulty`, `timerSetting`.

- [x] T011 [US2] Add new session state fields to `newSession()` in `index.html`: `errors: 0`, `auditStartTime: null`, `auditEndTime: null`, `auditEndReason: null`, `auditLogWritten: false`
- [x] T012 [US2] Add error increment to `showFeedback()` in `index.html` — in the `!correct` branch (after `const correct = ...`, before `applyWrongAnswer()`), add `session.errors++`; this handles both wrong answers and timer timeouts (both set `correct = false`)
- [x] T013 [US2] Add `startTime` capture to `renderQuestion()` in `index.html` — at the top of the function, before `startTimer()`, add: `if (session.questionIndex === 0) { session.auditStartTime = new Date().toISOString(); }`
- [x] T014 [US2] Add `endTime` and `endReason` capture to `showResults()` in `index.html` — in BOTH the badge-callback path AND the no-badge path, immediately before each `showScreen('screen-results')` call, insert: `session.auditEndTime = new Date().toISOString(); session.auditEndReason = session.lives <= 0 ? 'no_lives' : 'completed'; session.auditLogWritten = false;`
- [x] T015 [US2] Add `endTime` and `endReason` capture to `showStopSummary()` in `index.html` — immediately before `showScreen('screen-stop-summary')`, insert: `session.auditEndTime = new Date().toISOString(); session.auditEndReason = 'stopped'; session.auditLogWritten = false;`
- [x] T016 [US2] Add `writeAuditEntryIfNeeded(playerName)` private helper function in `index.html` — guards with `if (!session || session.auditLogWritten) return;`, then calls `appendAuditEntry({ startTime: session.auditStartTime, endTime: session.auditEndTime, errors: session.errors, endReason: session.auditEndReason, playerName: playerName ?? null, score: session.score, difficulty: timerToDifficulty(session.config.timerSeconds), timerSetting: session.config.timerSeconds })`, then sets `session.auditLogWritten = true`
- [x] T017 [US2] Hook `writeAuditEntryIfNeeded(resolvedName)` into `_saveNameAndGo()` in `index.html` — call it immediately after `saveEntry(entry)` and before `showLeaderboard()`
- [x] T018 [US2] Hook `writeAuditEntryIfNeeded(null)` into the Skip button handler in `index.html` — call it at the start of the skip handler (before any screen changes)
- [x] T019 [P] [US2] Hook `writeAuditEntryIfNeeded(null)` into the `btn-play-again` handler in `index.html` — call it before `startGame()`; the guard in the helper prevents double-write if Save Score was already pressed
- [x] T020 [P] [US2] Hook `writeAuditEntryIfNeeded(null)` into the Back-to-Menu buttons on `screen-results` and `screen-stop-summary` in `index.html` — call before `showScreen('screen-start')` in each handler; identify the correct button IDs from the existing DOM

**Checkpoint**: Play 3 games using different end conditions (no-lives, completed, stopped+confirmed). Verify 3 entries in localStorage. Play again with "Keep Playing" — verify no extra entry. Play Practice Mode — verify no entry added.

---

## Phase 4: User Story 1 — View Audit Log Table (Priority: P1)

**Goal**: A "📋 Audit Log" button appears on the start screen. Clicking it shows a table of all sessions sorted newest-first with 8 columns. Empty state is shown when no entries exist.

**Independent Test**: After Phase 3 produces at least one entry, press "📋 Audit Log" from start screen. Verify table renders with correct data, correct column order, sorted newest-first. Then clear localStorage and verify empty state message appears.

- [x] T021 [US1] Add `<button id="btn-audit-log" class="btn-secondary">📋 Audit Log</button>` to `screen-start` section in `index.html` — place it after `#btn-open-theme` (the existing last secondary button)
- [x] T022 [US1] Add `<section id="screen-audit-log" hidden>` to `<main>` in `index.html` with full HTML structure: `<h2>📋 Audit Log</h2>`, `<div id="audit-summary" hidden>` (4 `<span>` slots: `#audit-summary-sessions`, `#audit-summary-playtime`, `#audit-summary-avg-errors`, `#audit-summary-top-player`), `<p id="audit-empty" hidden>No games recorded yet — play a game to see your history! 🎮</p>`, `<div id="audit-table-wrap" style="overflow-x:auto"><table id="audit-table" aria-label="Game session history"><thead>` (8 `<th scope="col">` headers per contracts/ui-state-machine.md), `<tbody id="audit-table-body"></tbody></table></div>`, `<button id="btn-audit-clear">🗑️ Clear Audit Log</button>`, `<div id="audit-clear-confirm" hidden>` (confirmation text + `#btn-audit-clear-yes` + `#btn-audit-clear-cancel`), `<button id="btn-audit-back">🏠 Back to Menu</button>`
- [x] T023 [US1] Implement `renderAuditLog()` function in `index.html` — loads log via `loadAuditLog()`, reverses for newest-first display, builds one `<tr>` per entry using `formatTimestamp(startTime)`, `formatTimestamp(endTime)`, `formatDuration(startTime, endTime)`, `errors`, end-reason label (💀/✅/🛑), `playerName ?? '—'`, `score`, `difficulty`; injects rows into `#audit-table-body`; shows/hides `#audit-empty` and `#audit-table-wrap` based on `log.length`
- [x] T024 [US1] Wire `#btn-audit-log` click handler in `index.html` — calls `renderAuditLog()` then `showScreen('screen-audit-log')`
- [x] T025 [US1] Wire `#btn-audit-back` click handler in `index.html` — calls `showScreen('screen-start')`

**Checkpoint**: Press "📋 Audit Log" → table renders correctly with all 8 columns, sorted newest-first. Navigate back → start screen appears.

---

## Phase 5: User Story 3 — Summary Statistics (Priority: P2)

**Goal**: A summary row above the table shows total sessions, total play time, average errors per game, and most active player.

**Independent Test**: After 3+ recorded sessions with mixed player names, open Audit Log and verify all 4 summary values are correct.

- [x] T026 [US3] Extend `renderAuditLog()` in `index.html` to populate the `#audit-summary` div — call `computeAuditSummary(log)` and set: `#audit-summary-sessions` to `"X sessions"`, `#audit-summary-playtime` to total formatted via `formatDuration` applied to cumulative ms, `#audit-summary-avg-errors` to `"X.X errors/game"`, `#audit-summary-top-player` to player name or `"—"` if null
- [x] T027 [US3] Show `#audit-summary` when `log.length > 0`, hide it when `log.length === 0` — add this toggle to `renderAuditLog()` in `index.html`

**Checkpoint**: Play 3 games with 2 as "Maja" and 1 as "Kuba". Verify summary shows: "3 sessions", correct total time, correct avg errors, "Most active: Maja". Also verify summary is hidden on empty log.

---

## Phase 6: User Story 4 + User Story 5 — Clear Audit Log + Back to Menu (Priority: P3)

**Goal**: A "🗑️ Clear Audit Log" button shows an inline confirmation. Confirming deletes only the audit log. Cancelling does nothing. "🏠 Back to Menu" returns to the start screen.

**Independent Test**: Open Audit Log with entries → clear → verify `mathblaster_audit_log` key removed; verify `mathblaster_leaderboard`, `mathblaster_badges`, and practice stat keys are all unchanged.

- [x] T028 [US4] Wire `#btn-audit-clear` click handler in `index.html` — removes `hidden` from `#audit-clear-confirm` and moves focus to `#btn-audit-clear-cancel` (safe default)
- [x] T029 [US4] Wire `#btn-audit-clear-yes` click handler in `index.html` — calls `clearAuditLog()`, hides `#audit-clear-confirm`, calls `renderAuditLog()` to refresh the now-empty state
- [x] T030 [US4] Wire `#btn-audit-clear-cancel` click handler in `index.html` — adds `hidden` back to `#audit-clear-confirm`

*(Note: `#btn-audit-back` wired in T025 — Back to Menu navigation already complete.)*

**Checkpoint**: Clear audit log → empty state shown; DevTools confirms key removed; other keys intact. Cancel clear → entries unchanged.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive layout, and final validation across all stories.

- [x] T031 Verify and apply horizontal-scroll CSS in `index.html` — ensure `#audit-table-wrap` has `overflow-x: auto` and the table uses `white-space: nowrap` on cells where needed; test at 375px viewport width (iPhone SE) — table must scroll, not overflow or truncate
- [x] T032 Add ARIA attributes to audit log screen in `index.html` — `#audit-empty` needs `role="status"` or `aria-live="polite"`; table already uses `aria-label` (T022); add `scope="col"` to all `<th>` elements; add `aria-expanded` to `#btn-audit-clear` based on confirmation state
- [x] T033 Verify all interactive elements on `screen-audit-log` meet 44×44 CSS pixel minimum touch target per Constitution Principle II — measure `#btn-audit-log`, `#btn-audit-back`, `#btn-audit-clear`, `#btn-audit-clear-yes`, `#btn-audit-clear-cancel` in DevTools
- [x] T034 Accessibility audit for `screen-audit-log` in `index.html` — tab through all interactive elements verifying visible focus rings; test confirmation dialog traps focus (Tab cycles between Yes/Cancel); test Escape key closes confirmation dialog; verify heading hierarchy (`<h2>` under `<main>`'s `<h1>`)
- [x] T035 Run complete quickstart.md validation — work through all 14 scenarios in `specs/010-game-audit-log/quickstart.md` in the browser; confirm each expected outcome matches; note and fix any discrepancy
- [x] T036 Run full test suite — `node --test tests/*.test.js` — all tests must pass; no regressions in existing engine tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (stubs exist) — **BLOCKS all user stories**
- **Phase 3 (US2 — Recording)**: Depends on Phase 2 (engine functions available); must precede Phase 4 (data needed to view)
- **Phase 4 (US1 — View)**: Depends on Phase 3 (entries need to be recorded to test the table); depends on Phase 2 (engine render functions)
- **Phase 5 (US3 — Summary)**: Depends on Phase 4 (`renderAuditLog()` already exists; extend it)
- **Phase 6 (US4+US5 — Clear + Back)**: Depends on Phase 4 (screen HTML already created in T022)
- **Phase 7 (Polish)**: Depends on all prior phases being complete

### User Story Dependencies

- **US2 (P1 — Recording)**: First — produces data for all other stories
- **US1 (P1 — View)**: Second — requires entries (US2) to test meaningfully
- **US3 (P2 — Summary)**: After US1 — extends `renderAuditLog()` already created
- **US4 (P3 — Clear)**: After US1 — uses screen HTML already created
- **US5 (P3 — Back)**: After US1 — trivial; back button wired in T025
- **US6 (P4 — FIFO)**: Implemented in Phase 2 (`appendAuditEntry()` T004)

### Within Each Phase

- Tests (T002) written and confirmed failing BEFORE implementation begins
- In Phase 2: T003 first (storage primitives needed by T004+); T004–T008 then in parallel
- In Phase 3: T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018; T019 and T020 parallel with T018

### Parallel Opportunities

- **Phase 2**: T004, T005, T006, T007, T008 can all run in parallel after T003 is complete
- **Phase 3**: T019 and T020 can run in parallel (different button handlers)
- **Phase 7**: T031, T032, T033, T034 can run in parallel (different aspects of same screen)

---

## Parallel Example: Phase 2 (Engine Implementation)

```text
Complete T003 first (loadAuditLog / clearAuditLog — needed as base by T004):

Then run in parallel:
  T004: appendAuditEntry (FIFO logic)
  T005: formatDuration
  T006: formatTimestamp
  T007: computeAuditSummary
  T008: timerToDifficulty helper

Then run: T009 (import wiring) → T010 (all tests green)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (file skeletons + failing tests)
2. Complete Phase 2: Foundational (engine fully tested and passing)
3. Complete Phase 3: US2 — Recording hooks in `index.html`
4. Complete Phase 4: US1 — Audit Log screen + table rendering
5. **STOP and VALIDATE**: Play 3 games → open Audit Log → verify table shows correct data
6. Ship MVP — parents can already review game history

### Incremental Delivery

1. Setup + Foundational → engine ready (T001–T010)
2. US2 + US1 → play and view history → MVP! (T011–T025)
3. US3 → summary stats row (T026–T027)
4. US4+US5 → clear and navigate (T028–T030)
5. Polish → accessibility + full validation (T031–T036)

---

## Notes

- `[P]` tasks operate on different functions/elements — no write conflicts
- Each user story phase ends with a concrete browser checkpoint
- Constitution Principle IV (TDD): T002 tests MUST fail before Phase 2 implementation begins; T010 confirms all green
- `timerToDifficulty()` (T008) maps 5s/10s → "Hard", 15s/20s → "Medium", 25s/30s → "Easy" — based on `TIMER_OPTIONS` in `math-engine.js`
- The game currently stores `difficulty: "Standard"` in leaderboard entries; the audit log uses the timer-derived difficulty label instead
- `practiceSession` is a separate variable from `session` — all audit log hooks check `session` only, guaranteeing practice mode is never recorded
- Commit after each checkpoint to maintain working-state `main` branch per Constitution Principle VII
