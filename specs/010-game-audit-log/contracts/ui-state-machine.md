# UI State Machine: Game Audit Log

**Branch**: `010-game-audit-log` | **Date**: 2026-05-24

---

## Contract 1 — Screen Flow (Updated Routing)

New screen `screen-audit-log` integrates into the existing `showScreen()` routing via a new "📋 Audit Log" button on the start screen.

```
screen-start
  ├── [▶ Play!] ──────────────────────────────────────────────> screen-game (unchanged)
  ├── [📚 Practice Mode] ─────────────────────────────────────> screen-practice-op (unchanged)
  ├── [🏆 Leaderboard] ──────────────────────────────────────> screen-leaderboard (unchanged)
  ├── [🏅 Badges] ───────────────────────────────────────────> screen-badges (unchanged)
  ├── [🎨 Theme] ────────────────────────────────────────────> screen-theme-picker (unchanged)
  └── [📋 Audit Log]  ────────────────────────────────────────> screen-audit-log  ← NEW

screen-audit-log
  ├── [🏠 Back to Menu] ──────────────────────────────────────> screen-start
  └── [🗑️ Clear Audit Log] ───────────────────────────────────> (inline confirmation — stays on screen-audit-log)

screen-results  (audit log write hook added)
  ├── [Save Score] → _saveNameAndGo() ─────> write audit entry with playerName
  ├── [Skip] ─────────────────────────────> write audit entry with playerName: null
  ├── [▶ Play Again] ──────────────────────> if !auditLogWritten: write entry null; then screen-game
  └── [🏠 Back to Menu] ───────────────────> if !auditLogWritten: write entry null; then screen-start

screen-stop-summary  (audit log write hook added)
  ├── [Save Score] → _saveNameAndGo() ─────> write audit entry with playerName
  ├── [Skip] ─────────────────────────────> write audit entry with playerName: null
  ├── [▶ Play Again] ──────────────────────> if !auditLogWritten: write entry null; then screen-game
  └── [🏠 Back to Menu] ───────────────────> if !auditLogWritten: write entry null; then screen-start
```

**No other screen transitions are changed.**

---

## Contract 2 — Audit Log Screen Internal State

```
AUDIT_LOG_LOADING
  │  [renderAuditLog() called, showScreen('screen-audit-log')]
  ▼
AUDIT_LOG_EMPTY
  │  log.length === 0
  │  → show "No games recorded yet — play a game to see your history! 🎮"
  │  → hide table, hide summary row
  │  → "🗑️ Clear Audit Log" still visible (no-op if empty or hidden)
  ▼
  or

AUDIT_LOG_POPULATED
  │  log.length > 0
  │  → render summary row (totalSessions, totalPlayTime, avgErrors, mostActivePlayer)
  │  → render table sorted newest-first (reverse array order)
  │  → show "🗑️ Clear Audit Log" button
  ▼
  [🗑️ Clear Audit Log pressed]
  ▼
CLEAR_CONFIRM_OPEN
  │  confirmation: "Are you sure? This will delete all audit log entries."
  │  [Yes, clear] → clearAuditLog() → re-render → AUDIT_LOG_EMPTY
  └─ [Cancel] → dismiss confirmation → back to AUDIT_LOG_POPULATED (unchanged)
```

---

## Contract 3 — Audit Entry Write State Machine

Tracks when the audit log entry for the current game session gets written.

```
AUDIT_IDLE (session = null)
  │  [startGame()]
  ▼
AUDIT_PENDING_START
  │  session.auditStartTime = null, session.auditLogWritten = false
  │  [renderQuestion(), questionIndex === 0]
  ▼
AUDIT_TIMING
  │  session.auditStartTime = ISO timestamp
  │  (session continues; errors incremented on each wrong/timeout in showFeedback())
  │  [showResults() callback executes — screen-results shown]
  │  [showStopSummary() executes — screen-stop-summary shown]
  ▼
AUDIT_READY_TO_WRITE
  │  session.auditEndTime = ISO timestamp
  │  session.auditEndReason = "no_lives" | "completed" | "stopped"
  │  session.auditLogWritten = false
  │
  ├── [Save Score → _saveNameAndGo() completes]
  │     → appendAuditEntry({...entry, playerName: resolvedName})
  │     → session.auditLogWritten = true
  │     ▼
  │   AUDIT_WRITTEN (with player name)
  │
  ├── [Skip button pressed]
  │     → appendAuditEntry({...entry, playerName: null})
  │     → session.auditLogWritten = true
  │     ▼
  │   AUDIT_WRITTEN (anonymous)
  │
  └── [Play Again or Back to Menu pressed, !auditLogWritten]
        → appendAuditEntry({...entry, playerName: null})
        → session.auditLogWritten = true
        ▼
      AUDIT_WRITTEN (anonymous via navigation)

AUDIT_WRITTEN
  │  Entry persisted to mathblaster_audit_log
  │  [Play Again] → new session → AUDIT_PENDING_START
  └  [Back to Menu] → session = null → AUDIT_IDLE
```

**Guard invariant**: `appendAuditEntry()` is called at most once per game session. The `session.auditLogWritten` flag enforces this; all write sites check it first.

**Edge case — Practice Mode**: `practiceSession` is a separate variable from `session`. All audit log hooks check `session` (not `practiceSession`). Practice mode ends go through different paths (`screen-practice-summary`) that have no audit log hooks.

---

## Contract 4 — Error Counting

Timer timeout behavior confirmed: `showFeedback(null, true)` is called when timer reaches 0, producing `correct = !timedOut && ... = false`. Both wrong answers and timeouts flow through the `!correct` branch in `showFeedback()`.

```
showFeedback(selectedChoice, timedOut):
  const correct = !timedOut && evaluateAnswer(q, selectedChoice).correct
  if (!correct):
    session.errors++     ← NEW: increment on wrong answer AND timeout
    applyWrongAnswer()   → lives--; check isGameOver
    ...
```

`session.errors` is initialized to `0` in `newSession()` and is never reset during a session.

---

## DOM Element Reference

### New element in `screen-start`

| ID | Element | Purpose |
|----|---------|---------|
| `#btn-audit-log` | `<button class="btn-secondary">` | "📋 Audit Log" — opens audit log screen |

### New section `screen-audit-log`

| ID | Element | Purpose |
|----|---------|---------|
| `#screen-audit-log` | `<section>` | Audit log screen root |
| `#audit-summary` | `<div>` | Summary row container (hidden when empty) |
| `#audit-summary-sessions` | `<span>` | Total sessions |
| `#audit-summary-playtime` | `<span>` | Total play time |
| `#audit-summary-avg-errors` | `<span>` | Average errors per game |
| `#audit-summary-top-player` | `<span>` | Most active player name |
| `#audit-empty` | `<p>` | Empty state message (hidden when entries exist) |
| `#audit-table-wrap` | `<div>` | Horizontal-scroll wrapper for the table |
| `#audit-table` | `<table>` | The session history table |
| `#audit-table-body` | `<tbody>` | Table rows injected by `renderAuditLog()` |
| `#btn-audit-back` | `<button>` | "🏠 Back to Menu" |
| `#btn-audit-clear` | `<button>` | "🗑️ Clear Audit Log" |
| `#audit-clear-confirm` | `<div>` | Inline confirmation dialog |
| `#btn-audit-clear-yes` | `<button>` | "Yes, clear" (inside confirmation) |
| `#btn-audit-clear-cancel` | `<button>` | "Cancel" (inside confirmation) |

### Table column order

| # | Header | Source | Notes |
|---|--------|--------|-------|
| 1 | 📅 Date & Start | `entry.startTime` | Formatted "Apr 30, 14:23" |
| 2 | 🏁 End Time | `entry.endTime` | Formatted "Apr 30, 14:31" |
| 3 | ⏱️ Duration | derived | `endTime - startTime` formatted |
| 4 | ❌ Errors | `entry.errors` | Integer |
| 5 | 🏁 End Reason | `entry.endReason` | Emoji label string |
| 6 | 👤 Player | `entry.playerName` | Name or `"—"` |
| 7 | ⭐ Score | `entry.score` | Integer |
| 8 | 🎯 Difficulty | `entry.difficulty` | Easy / Medium / Hard |
