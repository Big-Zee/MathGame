# Implementation Plan: Game Audit Log

**Branch**: `010-game-audit-log` | **Date**: 2026-05-24 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/010-game-audit-log/spec.md`

## Summary

Add a complete historical record of every finished main-game session to Math Blaster. A new `audit-log-engine.js` module handles localStorage persistence; new hooks in `index.html` capture session data at first question render, results screen render, and name-picker completion. A new "📋 Audit Log" screen (accessible from the start screen) displays a sortable table of sessions with a summary row and clear functionality.

## Technical Context

**Language/Version**: HTML5 + vanilla JavaScript (ES6+)  
**Primary Dependencies**: None — zero-dependency; all browser-native APIs  
**Storage**: `localStorage` — key `mathblaster_audit_log` (JSON array, max 100 entries)  
**Testing**: Node.js built-in test runner (`node --test`) — same as all existing engine tests  
**Target Platform**: Browser (Azure Static Web Apps); no server required  
**Project Type**: Static single-page web application (`index.html` + ES module imports)  
**Performance Goals**: All localStorage reads/writes complete in < 16ms; no visible jank on table render for 100 entries  
**Constraints**: No build step; no frameworks; no external dependencies; all logic self-contained in `index.html` + `/js/` modules  
**Scale/Scope**: Max 100 audit log entries per device; ~10 sessions/week typical use

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ Pass | Parental monitoring of game history supports educational oversight without changing game mechanics |
| II. Kid-Friendly Design | ✅ Pass | Audit log is parent/teacher-facing; game screen unchanged; buttons meet 44×44px target; plain language used |
| III. Accessibility (WCAG 2.1 AA) | ✅ Pass | Table requires `<th scope="col">`, keyboard navigation, screen-reader labels; accessibility task included in Polish phase |
| IV. Test-First | ✅ Pass | `audit-log-engine.js` unit tests written before implementation; acceptance scenarios map to test cases |
| V. Incremental Delivery | ✅ Pass | Engine (P1) → Recording hooks (P1) → Screen UI (P2) → Summary + Clear (P3) are independently deliverable |
| VI. Immediate Feedback | ✅ Pass | No impact on in-game feedback; audit log is post-session only |
| VII. Deployment Integrity | ✅ Pass | New file `/js/audit-log-engine.js` imported via relative ES module path; no bundler; `index.html` remains sole entry point; `.github/workflows/` untouched |

**Post-design re-check**: All principles still pass. No complexity violations. New module follows established pattern.

## Project Structure

### Documentation (this feature)

```text
specs/010-game-audit-log/
├── plan.md                          ← this file
├── research.md                      ← Phase 0 output
├── data-model.md                    ← Phase 1 output
├── quickstart.md                    ← Phase 1 output
├── contracts/
│   └── ui-state-machine.md          ← Phase 1 output
└── tasks.md                         ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
js/
├── math-engine.js          (existing — unchanged)
├── badge-engine.js         (existing — unchanged)
├── leaderboard-engine.js   (existing — unchanged)
├── theme-engine.js         (existing — unchanged)
└── audit-log-engine.js     ← NEW: localStorage persistence + display utilities

tests/
├── math-engine.test.js     (existing — unchanged)
├── badges.test.js          (existing — unchanged)
├── leaderboard-engine.test.js (existing — unchanged)
├── theme-engine.test.js    (existing — unchanged)
└── audit-log-engine.test.js ← NEW: unit tests for engine

index.html                  (modified: new screen section, new button, new hooks, new import)
```

**Structure Decision**: Single-project layout matching the existing pattern. One new engine module; one new test file; minimal, targeted changes to `index.html`.

## Phase 0: Research

See [research.md](research.md) for full decisions and rationale.

Key decisions:
- New `audit-log-engine.js` module (pure JS, no DOM) — consistent with existing pattern
- `session.errors` field tracks wrong answers + timeouts via single hook in `showFeedback(!correct)`
- Pending-entry pattern: endTime captured at screen render; entry written at name-picker completion
- `session.auditLogWritten` guard prevents double-write across all exit paths
- FIFO trim before adding (log never holds 101 entries)
- Both timestamps always display as "Mmm DD, HH:MM" — no midnight special case

## Phase 1: Design

See [data-model.md](data-model.md) and [contracts/ui-state-machine.md](contracts/ui-state-machine.md) for full details.

### Implementation Approach

#### Step A — `audit-log-engine.js` (new module, pure JS)

Exports:
- `loadAuditLog()` → reads `mathblaster_audit_log`, returns array or `[]`
- `appendAuditEntry(entry)` → FIFO-trims at 100, appends, saves
- `clearAuditLog()` → removes `mathblaster_audit_log` key only
- `formatDuration(startIso, endIso)` → `"Xs"` or `"Xm Ys"`
- `formatTimestamp(isoString)` → `"Apr 30, 14:23"` local time
- `computeAuditSummary(log)` → `{ totalSessions, totalPlayTime, avgErrors, mostActivePlayer }`

#### Step B — `audit-log-engine.test.js` (TDD: tests written BEFORE implementation)

Coverage targets:
- `loadAuditLog()`: empty storage, valid JSON, malformed JSON
- `appendAuditEntry()`: normal append, FIFO trim at exactly 100, FIFO trim above 100
- `clearAuditLog()`: removes only the correct key
- `formatDuration()`: < 60s, ≥ 60s, edge at exactly 60s
- `formatTimestamp()`: valid ISO string → "Mmm DD, HH:MM"
- `computeAuditSummary()`: empty array, single entry, tie-breaking for mostActivePlayer, all-null playerNames

#### Step C — `index.html` session state additions

In `newSession()`:
```js
errors: 0,
auditStartTime: null,
auditEndTime: null,
auditEndReason: null,
auditLogWritten: false,
```

#### Step D — `index.html` error tracking hook

In `showFeedback()`, in the `!correct` branch (after `const correct = ...`):
```js
if (!correct) session.errors++;
```

#### Step E — `index.html` startTime capture

In `renderQuestion()`, before `startTimer()`, add:
```js
if (session.questionIndex === 0) {
  session.auditStartTime = new Date().toISOString();
}
```

#### Step F — `index.html` endTime capture

In `showResults()`, in both the badge-callback path and the no-badge path, immediately before `showScreen('screen-results')`:
```js
session.auditEndTime = new Date().toISOString();
session.auditEndReason = session.lives <= 0 ? 'no_lives' : 'completed';
session.auditLogWritten = false;
```

In `showStopSummary()`, before `showScreen('screen-stop-summary')`:
```js
session.auditEndTime = new Date().toISOString();
session.auditEndReason = 'stopped';
session.auditLogWritten = false;
```

#### Step G — `index.html` audit entry write hooks

Utility function (private, called from multiple sites):
```js
function writeAuditEntryIfNeeded(playerName) {
  if (!session || session.auditLogWritten) return;
  appendAuditEntry({
    startTime: session.auditStartTime,
    endTime: session.auditEndTime,
    errors: session.errors,
    endReason: session.auditEndReason,
    playerName: playerName ?? null,
    score: session.score,
    difficulty: session.config.difficulty,
    timerSetting: session.config.timerSeconds,
  });
  session.auditLogWritten = true;
}
```

Hook sites:
- `_saveNameAndGo()`: call `writeAuditEntryIfNeeded(resolvedName)` after `saveEntry()`
- Skip button handler: call `writeAuditEntryIfNeeded(null)`
- `btn-play-again` handler: call `writeAuditEntryIfNeeded(null)` before `startGame()`
- Back-to-menu buttons on results and stop-summary: call `writeAuditEntryIfNeeded(null)` before `showScreen('screen-start')`

#### Step H — `index.html` new screen section `screen-audit-log`

New `<section id="screen-audit-log">` containing:
- `<h2>📋 Audit Log</h2>`
- `<div id="audit-summary">` — summary row (4 stats)
- `<p id="audit-empty">` — empty state message
- `<div id="audit-table-wrap" style="overflow-x: auto">` → `<table id="audit-table">` with `<thead>` (8 columns) and `<tbody id="audit-table-body">`
- `<button id="btn-audit-clear">🗑️ Clear Audit Log</button>`
- `<div id="audit-clear-confirm" hidden>` — inline confirmation
- `<button id="btn-audit-back">🏠 Back to Menu</button>`

#### Step I — `index.html` start screen button

Add after `#btn-open-theme`:
```html
<button id="btn-audit-log" class="btn-secondary">📋 Audit Log</button>
```

#### Step J — `index.html` rendering + event wiring

New functions:
- `renderAuditLog()` — loads log, renders summary + table or empty state
- Event listeners for `btn-audit-log`, `btn-audit-back`, `btn-audit-clear`, `btn-audit-clear-yes`, `btn-audit-clear-cancel`

#### Step K — Import `audit-log-engine.js`

Add to the `<script type="module">` import block at the top of `index.html`:
```js
import { loadAuditLog, appendAuditEntry, clearAuditLog,
         formatDuration, formatTimestamp, computeAuditSummary }
  from './js/audit-log-engine.js';
```

## Complexity Tracking

No constitution violations. No complexity justification required.
