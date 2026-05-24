# Research: Game Audit Log

**Branch**: `010-game-audit-log` | **Date**: 2026-05-24

---

## Decision 1 — Module architecture

**Decision**: Create a new pure-JS module `/js/audit-log-engine.js` with no DOM dependency, consistent with the existing pattern (`math-engine.js`, `badge-engine.js`, `leaderboard-engine.js`).

**Rationale**: Keeps localStorage logic isolated and unit-testable without a browser. All UI rendering and DOM wiring stays in `index.html`. The module exports functions only; it never accesses `document`.

**Alternatives considered**: Inlining audit log logic directly in `index.html` — rejected because it would make unit testing impossible and breaks the established separation-of-concerns pattern.

---

## Decision 2 — Error tracking in session state

**Decision**: Add `errors: 0` to `newSession()`. Increment `session.errors++` in `showFeedback()` when `!correct` (line ~1686 check).

**Rationale**: Both wrong typed answers and timer timeouts call `showFeedback()` with `correct = false` (timeouts call `showFeedback(null, true)` which forces `const correct = !timedOut && ...` to `false`). One increment point handles both cases. `session.errors` resets automatically when a new session is created.

**Alternatives considered**: Separate counters for wrong answers vs. timeouts — rejected as unnecessary complexity; the spec treats both as errors identically.

---

## Decision 3 — startTime capture point

**Decision**: Capture `session.auditStartTime = new Date().toISOString()` at the top of `renderQuestion()` when `session.questionIndex === 0`. This is the exact moment the first question becomes visible and `startTimer()` is called.

**Rationale**: Confirmed by clarification Q1 — startTime should be captured when the first question is visible and the answer timer starts. `renderQuestion()` at index 0 is called by `startGame()` immediately before `startTimer()`, making it the authoritative capture point.

**Alternatives considered**: Capturing in `startGame()` — rejected because the spec requires the moment the question renders (timer starts), not the moment the game configuration is applied.

---

## Decision 4 — endTime and entry capture flow

**Decision**: Use a pending-entry pattern. When the results/stop-summary screen renders (inside the final callback that calls `showScreen()`), set:
- `session.auditEndTime = new Date().toISOString()`
- `session.auditEndReason = '<reason>'`
- `session.auditLogWritten = false`

The actual audit log write happens at exactly one of:
1. `_saveNameAndGo()` — player name known → write entry with `playerName`
2. Skip button press — → write entry with `playerName: null`
3. "Play Again" button press (if `!session.auditLogWritten`) → write with `playerName: null`
4. "Back to Menu" button press (if `!session.auditLogWritten`) → write with `playerName: null`

The `auditLogWritten` guard prevents double-writes.

**Rationale**: The spec requires recording `playerName` (the name saved to the leaderboard), but that name is only known after the name picker interaction. The entry cannot be written at `endTime` capture because `playerName` is unknown then. The pending-entry pattern defers the write until the name is resolved while still capturing `endTime` at the correct moment.

**Alternatives considered**:
- Write entry immediately at endTime with `playerName: null`, then update if name is saved — rejected because spec requires entries to be immutable after writing.
- Always write with `playerName: null` and ignore leaderboard name — rejected because the spec explicitly requires showing the player name when they saved to the leaderboard.

---

## Decision 5 — FIFO trim timing

**Decision**: Trim before adding the new entry. The `appendEntry(entry)` function: (1) loads current log, (2) if `log.length >= 100`, removes the first element, (3) appends the new entry, (4) saves. The log never temporarily holds 101 entries.

**Rationale**: Simpler implementation; the cap invariant holds at all times, including across interrupted operations. Consistent with how a fixed-size queue works.

**Alternatives considered**: Trim after adding — would require a separate removal step and the log could briefly hold 101 entries if saved before trimming.

---

## Decision 6 — Most active player tie-breaking

**Decision**: When two or more players have the same session count, display the one that sorts first alphabetically (A → Z, case-insensitive comparison).

**Rationale**: A deterministic tie-breaking rule produces consistent display across renders without storing additional data. Alphabetical is the simplest fair rule.

**Alternatives considered**: Most recent player (last session's player) — rejected because it would require timestamp comparison of sessions grouped by player name; more complex for the same display value.

---

## Decision 7 — Timestamp format: ISO 8601 storage, local-time display

**Decision**: Store all timestamps in ISO 8601 UTC format (`new Date().toISOString()`). Format for display using `Intl.DateTimeFormat` (or equivalent) converting to the device's local timezone. Both Start Time and End Time always display as "Mmm DD, HH:MM" (e.g., "Apr 30, 14:23") — no conditional format.

**Rationale**: ISO 8601 enables reliable arithmetic for duration calculation and is the standard interchange format. Local-time display is required by the spec (clarification Q4 eliminated midnight special-casing). Using `Intl.DateTimeFormat` is zero-dependency, browser-native, and handles timezone conversion automatically.

---

## Decision 8 — `timerSetting` storage

**Decision**: Store `timerSetting` as an integer (seconds, e.g., `15`), matching `session.config.timerSeconds`. Not displayed as a table column. Reserved for future feature use (e.g., filtering by timer, advanced stats).

**Rationale**: Confirmed by clarification Q5 — store only, not displayed. Storing as integer (not formatted string) keeps the data type clean for future computation (e.g., filtering `timerSetting >= 10`).

---

## Integration Hook Points Summary

| Event | Location in `index.html` | What to do |
|-------|--------------------------|------------|
| First question renders | `renderQuestion()`, when `session.questionIndex === 0` | `session.auditStartTime = new Date().toISOString()` |
| Results screen renders | Final callback inside `showResults()` (both badge and no-badge paths), before `showScreen('screen-results')` | Set `session.auditEndTime`, `session.auditEndReason`, `session.auditLogWritten = false` |
| Stop-summary screen renders | `showStopSummary()`, before `showScreen('screen-stop-summary')` | Set `session.auditEndTime = 'stopped'`, `session.auditLogWritten = false` |
| Wrong answer or timeout | `showFeedback()`, in the `!correct` branch | `session.errors++` |
| Save Score completes | `_saveNameAndGo()`, after `saveEntry()` | Write audit entry with player name; set `auditLogWritten = true` |
| Skip name picker | Skip button handler | Write audit entry with `playerName: null`; set `auditLogWritten = true` |
| Play Again (from results) | `btn-play-again` handler | If `!session.auditLogWritten`, write entry with null; then start game |
| Back to Menu (from results) | Back-to-menu button on results/stop-summary | If `!session.auditLogWritten`, write entry with null |
