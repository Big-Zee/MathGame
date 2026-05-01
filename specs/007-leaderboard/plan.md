# Implementation Plan: Leaderboard

**Branch**: `007-leaderboard` | **Date**: 2026-05-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/007-leaderboard/spec.md`

## Summary

Add a fully offline, localStorage-backed leaderboard to Math Blaster that lets children save scores after each eligible game session, compare results across play sessions on the same device, and view ranked stats. Implementation follows the existing badge-engine pattern: a new pure JS module (`js/leaderboard-engine.js`) handles all data logic and is covered by Node `node:test` unit tests written test-first; all UI wiring lives in `index.html`'s existing `<script type="module">` block.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES modules), HTML5, CSS3  
**Primary Dependencies**: None — zero external runtime dependencies  
**Storage**: Browser localStorage; five keys in use (`mathblaster_leaderboard`, `mathblaster_leaderboard_stats`, `mathblaster_last_player_name` — new; existing keys untouched)  
**Testing**: Node.js built-in `node:test` module; same mock localStorage pattern as `badges.test.js`  
**Target Platform**: Browser — Azure Static Web Apps free tier (static files only)  
**Project Type**: Static single-page web application (`index.html` + relative ES modules)  
**Performance Goals**: Leaderboard screen renders in <1 s; all localStorage operations complete in <50 ms (purely local I/O on ≤10 entries)  
**Constraints**: Offline-capable, no build step, no bundler, no framework, no server runtime; `index.html` is sole entry point  
**Scale/Scope**: 10-entry capped leaderboard; ≤10 unique player name buttons; single-device, single-session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ Pass | Leaderboard motivates replay, which drives math practice |
| II. Kid-Friendly Design | ✅ Pass | Name buttons min 44×44 px, plain language, no hover-only affordances; gold highlight uses shape + text, not colour alone |
| III. Accessibility WCAG 2.1 AA | ✅ Pass (conditional) | Accessibility audit task MUST appear in Polish phase; gold highlight requires 3:1+ contrast ratio |
| IV. Test-First | ✅ Pass | All leaderboard-engine.js functions covered by tests written before implementation |
| V. Incremental Delivery | ✅ Pass | 6 independently testable user stories; P1 (save flow) delivers value standalone |
| VI. Immediate Feedback | ✅ Pass | Auto-show leaderboard after save; gold row highlights new entry immediately |
| VII. Deployment Integrity | ✅ Pass | New module imported via `./js/leaderboard-engine.js` relative path; no build step; `.github/workflows/` untouched |

**No violations.** Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/007-leaderboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-state-machine.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code

```text
index.html                      # All UI: add screen-leaderboard section,
                                #   name picker markup to results screens,
                                #   leaderboard button on start screen,
                                #   all UI event wiring

js/
├── math-engine.js              # Unchanged
├── badge-engine.js             # Unchanged
└── leaderboard-engine.js       # NEW — pure data/logic module (no DOM)

tests/
├── math-engine.test.js         # Unchanged
├── badges.test.js              # Unchanged
└── leaderboard-engine.test.js  # NEW — TDD, written before implementation
```

**Structure Decision**: Follows existing single-project layout. One new module (`leaderboard-engine.js`) mirrors the `badge-engine.js` pattern: pure functions, `globalThis.localStorage?` access, fully testable without a browser. All UI orchestration stays in `index.html`.

---

## Phase 0: Research Findings

*See [research.md](./research.md) for full detail. Key decisions summarised here.*

### Decision 1 — Module Architecture

**Chosen**: New `js/leaderboard-engine.js` ES module; UI wiring in `index.html`.  
**Rationale**: Matches badge-engine pattern exactly. Keeps DOM-free logic testable with `node:test`. Imported via `import { … } from './js/leaderboard-engine.js'`.

### Decision 2 — Screen Routing

**Chosen**: Add `<section id="screen-leaderboard">` to `index.html`; use existing `showScreen('screen-leaderboard')`.  
**Rationale**: The `showScreen()` function already handles all screen transitions. Zero extra routing infrastructure needed.

### Decision 3 — Name Picker Placement

**Chosen**: The name picker is a collapsible `<div>` injected into **both** `screen-results` and `screen-stop-summary` HTML sections; rendered by a shared `renderNamePicker()` function called at the end of `renderResultsScreen()` / `renderStopSummaryScreen()`.  
**Rationale**: Avoids a third results screen. Shared render function keeps logic DRY.

### Decision 4 — Badge Callback Integration

**Chosen**: Stats are updated immediately at game end (before badge checks). The name picker appears inside the badge popup callback chain — after all badge popups have been dismissed, the callback calls the name picker render instead of (or after) navigating to the results screen.  
**Rationale**: Badge checks use `checkBadgesAfterGame()` → `enqueueBadgePopups(callback)`. The `callback` is currently `() => showScreen('screen-results')`. It will become `() => { renderResultsScreen(); renderNamePicker(); showScreen('screen-results'); }`. Stats update is a separate, synchronous call that fires even when badge popups block screen transition.

### Decision 5 — Difficulty Field

**Chosen**: All normal (non-practice) game entries use the difficulty value `"Standard"`.  
**Rationale**: The normal quiz mode has no selectable difficulty — `GameConfig` uses fixed number ranges. Practice Mode (which has Easy/Medium/Hard) is explicitly ineligible. Using `"Standard"` is honest, avoids a misleading label, and keeps the data model consistent. The difficulty column on the leaderboard will show `"Std"` for all normal-mode entries in this version.  
**Alternatives rejected**: Mapping timer duration to difficulty buckets (arbitrary, confusing to children); leaving field empty (breaks the data model).

### Decision 6 — Stats Update Timing

**Chosen**: `updateStats(gameData)` is called immediately at game end (same call site as badge checks), regardless of whether a score qualifies for the top-10 list. `saveEntry()` only adds the entry to the capped array.  
**Rationale**: Confirmed by clarification Q1. Stats must count every eligible game.

### Decision 7 — Sort Implementation

**Chosen**: `sortLeaderboard(entries)` uses `b.score - a.score` as primary key and `new Date(b.date) - new Date(a.date)` as secondary (ISO strings are safely comparable as Date objects).  
**Rationale**: ISO 8601 strings are lexicographically sortable, but Date arithmetic is unambiguous. Sub-second precision is already captured; no extra data needed for the tertiary tiebreaker (confirmed by clarification Q5).

### Decision 8 — Case-Insensitive Name Matching

**Chosen**: `resolvePlayerName(inputName, existingNames)` does a `.toLowerCase()` comparison against existing names; if a match is found, the existing (correctly capitalised) name is returned; otherwise `inputName` (trimmed) is used.  
**Rationale**: Confirmed by FR-017. Preserves the "Zbig" capitalisation when "zbig" is typed.

---

## Phase 1: Design

### Data Model

*See [data-model.md](./data-model.md) for field-level detail.*

Three entities:

- **LeaderboardEntry** — one saved game session (10 fields)
- **LeaderboardStats** — cumulative across all eligible game ends (4 fields)
- **NameButton** — derived at render time, never stored

### Contracts

*See [contracts/ui-state-machine.md](./contracts/ui-state-machine.md) for full state diagrams.*

Two contracts defined:

1. **Screen flow** — how the new `screen-leaderboard` integrates into existing routing
2. **Name picker state machine** — Scenario A / B / C, text input expansion, Save / Skip

### Implementation Phases

#### Phase A — Leaderboard Engine (TDD)

**Prerequisite**: None (pure module, no DOM).  
**Tests-first**: Write `tests/leaderboard-engine.test.js` covering all exported functions.  
**Then implement**: `js/leaderboard-engine.js`.

Exported functions:

| Function | Purpose |
|----------|---------|
| `loadLeaderboard()` | Read + parse `mathblaster_leaderboard`; return `[]` on empty/corrupt |
| `saveEntry(entry)` | Enforce 10-cap (drop lowest), write, return saved entry |
| `loadStats()` | Read + parse `mathblaster_leaderboard_stats`; return zeroed defaults |
| `updateStats(gameData)` | Increment counts, update bests, write; called at every eligible game end |
| `clearLeaderboard()` | Remove entries + reset stats; keep `mathblaster_last_player_name` |
| `isEligibleForNamePicker(gameData)` | Returns `false` for practice, 0-question stop |
| `qualifiesForTop10(score)` | `true` when board has <10 entries OR score > lowest |
| `sortLeaderboard(entries)` | Score desc, timestamp desc |
| `getUniquePlayers(entries)` | Alphabetically sorted unique names with personal bests |
| `resolvePlayerName(input, existingNames)` | Case-insensitive match → existing capitalisation wins |
| `getFavouriteDifficulty(stats)` | Mode of `difficultyCounts`; alphabetical tiebreak |
| `getLastPlayerName()` / `setLastPlayerName(name)` | Read/write `mathblaster_last_player_name` |
| `formatEntryDate(isoString)` | `"Apr 30"` human-readable display format |

#### Phase B — Leaderboard Screen UI

**Prerequisite**: Phase A complete.

Changes to `index.html`:
1. Add `<section id="screen-leaderboard" hidden>` with:
   - Stats summary panel (`#lb-stats`)
   - Personal best banner (`#lb-banner`, hidden by default)
   - Empty-state message (`#lb-empty`, shown when no entries)
   - Ranked table (`#lb-table`)
   - "🏠 Back to Menu" button (`#btn-lb-back`)
   - "▶ Play Again" button (`#btn-lb-play-again`)
   - "🗑️ Clear Leaderboard" button + confirmation modal (`#lb-clear-confirm`)
2. Add `renderLeaderboard(highlightIndex)` function to the `<script>` block
3. Add `showLeaderboard(highlightIndex)` helper that calls `renderLeaderboard()` then `showScreen('screen-leaderboard')`
4. Add "🏆 Leaderboard" button to `screen-start`

#### Phase C — Name Picker UI

**Prerequisite**: Phase A complete; Phase B leaderboard screen ready.

Changes to `index.html`:
1. Add `<div id="name-picker">` markup inside both `screen-results` and `screen-stop-summary`
2. Add `renderNamePicker(gameData)` function that reads leaderboard + last name, determines scenario (A/B/C), renders buttons / text input, wires Save + Skip
3. Update `renderResultsScreen()` and `renderStopSummaryScreen()` to call `renderNamePicker(session)` after existing render logic
4. Wire Save Score: call `updateStats(gameData)` → `saveEntry(entry)` → `setLastPlayerName(name)` → `showLeaderboard(newEntryIndex)`
5. Wire Skip: hide name picker, show "▶ Play Again" / "🏠 Back to Menu" options as-is

#### Phase D — Badge Callback Integration

**Prerequisite**: Phase C complete.

Update the badge popup callback in `showResults()` and `showStopSummary()`:

**Before** (current):
```
callback = () => showScreen('screen-results')
```

**After**:
```
callback = () => {
  renderResultsScreen();       // existing
  renderNamePicker(session);   // new
  showScreen('screen-results');
}
```

Also add the `updateStats(gameData)` call immediately before `checkBadgesAfterGame()` (so stats count even if badge popups block).

#### Phase E — Polish & Accessibility Audit

**Prerequisite**: All prior phases complete.

- WCAG 2.1 AA audit: name buttons aria-labels, leaderboard table `<th>` scope, confirmation modal focus trap, gold row contrast ≥3:1
- Responsive layout: name picker buttons min-width 120px, flex-wrap
- Edge case: localStorage unavailable — graceful degradation (no crash, save silently skipped)
- Edge case: double-tap Save Score — guard with a `saving` flag
- Keyboard: Enter in text input triggers Save Score (FR-016)
- Scroll pre-selected name button into view (FR; use `scrollIntoView()`)

---

## Quickstart

*See [quickstart.md](./quickstart.md) for manual test scenarios.*
