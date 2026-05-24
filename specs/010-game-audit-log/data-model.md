# Data Model: Game Audit Log

**Branch**: `010-game-audit-log` | **Date**: 2026-05-24

---

## Storage Keys

| Key | Type | Owner | Notes |
|-----|------|-------|-------|
| `mathblaster_audit_log` | JSON array | `audit-log-engine.js` | Max 100 `AuditLogEntry` objects; append-only except FIFO trim |

All other existing localStorage keys are **unaffected** by this feature.

---

## Entity: AuditLogEntry

Stored in `mathblaster_audit_log` as elements of a JSON array.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `startTime` | string | ISO 8601 UTC, e.g. `"2026-04-30T12:23:00.000Z"` | Captured when `session.questionIndex === 0` and first question renders |
| `endTime` | string | ISO 8601 UTC, e.g. `"2026-04-30T12:31:15.000Z"` | Captured when results/stop-summary screen renders |
| `errors` | integer | ≥ 0 | Incremented on every wrong answer AND every timer timeout |
| `endReason` | string | `"no_lives"` \| `"completed"` \| `"stopped"` | How the session definitively ended |
| `playerName` | string \| null | max 12 chars when present; trimmed; canonical capitalisation | Name saved to leaderboard; `null` when save was skipped |
| `score` | integer | ≥ 0 | Final score at session end |
| `difficulty` | string | `"Easy"` \| `"Medium"` \| `"Hard"` | Difficulty selected for this session |
| `timerSetting` | integer | seconds; e.g. `15` | Timer value from `session.config.timerSeconds`; stored but not displayed |

**Example entry**:
```json
{
  "startTime": "2026-04-30T12:23:00.000Z",
  "endTime": "2026-04-30T12:31:15.000Z",
  "errors": 2,
  "endReason": "completed",
  "playerName": "Maja",
  "score": 180,
  "difficulty": "Medium",
  "timerSetting": 15
}
```

**Cap behaviour**:
- Array length MUST NOT exceed 100
- On insert when `length >= 100`: remove the element at index 0 (oldest), then append new entry
- Entries are stored in chronological order (oldest first, newest last)
- Table displays in reverse order (newest first) — sorted at read time, not at write time

**Immutability rule**: Entries MUST NOT be modified after writing. No updates; only append (with FIFO trim) and full clear.

---

## Entity: AuditLogSummary

Not stored — derived at display time from the full `mathblaster_audit_log` array.

| Field | Derived from | Display format |
|-------|-------------|----------------|
| `totalSessions` | `log.length` | Integer, e.g. `"12 sessions"` |
| `totalPlayTime` | Sum of `(endTime - startTime)` across all entries | Same as duration format: `"Xm Ys"` or `"Xs"` |
| `avgErrors` | `totalErrors / log.length` | 1 decimal place, e.g. `"2.3 errors/game"` |
| `mostActivePlayer` | Name with highest session count; alphabetical tie-break | Name string or `"—"` if all entries have `playerName: null` |

---

## Session State (additions to `newSession()`)

New fields added to the in-memory `session` object (not persisted to localStorage):

| Field | Type | Initial value | Purpose |
|-------|------|---------------|---------|
| `errors` | integer | `0` | Running error count for audit log; incremented on wrong answers and timeouts |
| `auditStartTime` | string \| null | `null` | ISO 8601 timestamp captured at first question render |
| `auditEndTime` | string \| null | `null` | ISO 8601 timestamp captured at results/stop-summary screen render |
| `auditEndReason` | string \| null | `null` | `"no_lives"` \| `"completed"` \| `"stopped"` |
| `auditLogWritten` | boolean | `false` | Guard flag preventing double-write of audit log entry |

---

## Display: Duration Format

Calculated at display time as `(endTime - startTime)` in milliseconds. Never stored.

| Condition | Format | Example |
|-----------|--------|---------|
| Duration < 60 000 ms (under 60s) | `"Xs"` | `"45s"` |
| Duration ≥ 60 000 ms (60s or more) | `"Xm Ys"` | `"3m 12s"` |

Calculation: `const ms = new Date(entry.endTime) - new Date(entry.startTime)`

---

## Display: Timestamp Format

Both columns always render in the same format regardless of whether the game spans midnight.

| Format | Example | Notes |
|--------|---------|-------|
| `"Mmm DD, HH:MM"` | `"Apr 30, 14:23"` | Local timezone; 24-hour clock; zero-padded minutes |

Use `Intl.DateTimeFormat` with `{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }` or equivalent manual formatting.

---

## Display: End Reason Labels

| `endReason` value | Displayed as |
|-------------------|-------------|
| `"no_lives"` | `"💀 No lives"` |
| `"completed"` | `"✅ Completed"` |
| `"stopped"` | `"🛑 Stopped"` |

---

## `audit-log-engine.js` Exported Functions

| Function | Signature | Notes |
|----------|-----------|-------|
| `loadAuditLog()` | `() → AuditLogEntry[]` | Reads and parses `mathblaster_audit_log`; returns `[]` on missing/invalid |
| `appendAuditEntry(entry)` | `(AuditLogEntry) → void` | FIFO-trims to 99 if at cap, then appends; saves to localStorage |
| `clearAuditLog()` | `() → void` | Removes `mathblaster_audit_log` key; does not touch other keys |
| `formatDuration(startIso, endIso)` | `(string, string) → string` | Returns `"Xs"` or `"Xm Ys"` |
| `formatTimestamp(isoString)` | `(string) → string` | Returns `"Apr 30, 14:23"` in local time |
| `computeAuditSummary(log)` | `(AuditLogEntry[]) → AuditLogSummary` | Returns derived summary object |
