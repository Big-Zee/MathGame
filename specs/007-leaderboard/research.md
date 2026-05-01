# Research: Leaderboard

**Branch**: `007-leaderboard` | **Date**: 2026-05-01

## Finding 1 — Module Architecture

**Decision**: New `js/leaderboard-engine.js` ES module; UI wiring in `index.html`'s `<script type="module">` block.

**Rationale**: Mirrors the `badge-engine.js` pattern exactly. Pure functions with no DOM dependency are testable via `node --test` without a browser. The module is imported with a single line in `index.html`:
```js
import { … } from './js/leaderboard-engine.js';
```

**Alternatives considered**:
- Inline all logic in `index.html` — rejected: untestable, already 1,691 lines
- Separate `leaderboard-ui.js` — rejected: unnecessary split; UI orchestration stays in `index.html` per existing pattern

---

## Finding 2 — Screen Routing

**Decision**: Add `<section id="screen-leaderboard" hidden>` to `index.html`; route via existing `showScreen('screen-leaderboard')`.

**Rationale**: The `showScreen(id)` function in `index.html` already hides all `<section>` children of `<main>` and shows only the target. No new routing infrastructure needed. The leaderboard section is always in the DOM (same as all other screens), toggled by `hidden` attribute.

**Alternatives considered**:
- Dynamically creating/destroying the section — rejected: inconsistent with existing pattern, more complex
- A modal overlay — rejected: leaderboard is a full screen with substantial content; modal would be cramped

---

## Finding 3 — Name Picker Placement in Results Screens

**Decision**: The name picker is a `<div id="name-picker">` injected into **both** `screen-results` and `screen-stop-summary` markup. A shared `renderNamePicker(gameData)` function is called from `renderResultsScreen()` and `renderStopSummaryScreen()` after their existing logic.

**Rationale**: Both results screens already exist and have all session data available. A shared render function avoids code duplication. The name picker `<div>` is hidden/shown by the render function based on eligibility.

**Alternatives considered**:
- A third intermediate screen (`screen-name-picker`) between results and leaderboard — rejected: adds an extra screen transition, breaks the results → save → leaderboard flow cleanly
- Only adding name picker to `screen-results` and redirecting early-stop there — rejected: `screen-stop-summary` has distinct content (questions answered, hearts) that must remain visible alongside the picker

---

## Finding 4 — Badge Popup Callback Integration

**Decision**: Stats are updated at game end immediately before `checkBadgesAfterGame()`. The name picker renders inside the badge popup `callback` (after all popups are dismissed). The callback chain becomes:
1. Game ends → `updateStats(gameData)` (sync, immediate)
2. → `checkBadgesAfterGame()` → `enqueueBadgePopups(callback)`
3. → badge popups shown (if any)
4. → `callback()` fires: `renderResultsScreen()` + `renderNamePicker(session)` + `showScreen('screen-results')`

**Rationale**: Stats must count every eligible game (clarification Q1), so the update is decoupled from the badge popup chain. The name picker must only appear after the results screen is visible — which is after badge popups dismiss (existing constraint). No double-firing risk: badge checks are entirely separate from leaderboard save.

**Alternatives considered**:
- Updating stats inside `saveEntry()` — rejected: stats would not count games where the player skips saving or where the score doesn't qualify for top-10

---

## Finding 5 — Difficulty Field for Normal Game Mode

**Decision**: All normal (non-practice) game entries use `difficulty: "Standard"`. The leaderboard table's DIFF column shows `"Std"` for all normal-mode entries.

**Rationale**: The normal quiz mode has no selectable difficulty. `GameConfig` uses fixed number ranges that do not map cleanly to Easy/Medium/Hard. Practice Mode (which has real difficulty levels) is explicitly ineligible for the leaderboard. Using `"Standard"` is honest and avoids a misleading label.

**Alternatives considered**:
- Map timer duration to difficulty buckets (e.g., ≥20s = Easy, 10–19s = Medium, ≤9s = Hard) — rejected: arbitrary; conflates pace preference with skill level; misleading
- Empty/null difficulty — rejected: breaks data model consistency; shows a blank column in the table
- Add a difficulty selector to the normal game — deferred: would be a separate feature; out of scope for this implementation

---

## Finding 6 — Sort Implementation

**Decision**: `sortLeaderboard(entries)` uses `b.score - a.score` (primary) and `new Date(b.date) - new Date(a.date)` (secondary, descending). Entries are sorted at read time, never stored pre-sorted.

**Rationale**: ISO 8601 strings stored as full timestamps (e.g., `2026-04-30T14:23:55.123Z`) provide sub-second precision. `new Date()` parsing is safe and unambiguous. This directly implements the clarification Q5 decision: full timestamp descending as tiebreaker.

**Alternatives considered**:
- Lexicographic string comparison of ISO dates — technically equivalent but semantically opaque; `Date` arithmetic is clearer
- Storing entries pre-sorted — rejected: spec explicitly states sort at read time

---

## Finding 7 — Case-Insensitive Name Resolution

**Decision**: `resolvePlayerName(inputName, existingNames)` converts `inputName` to lowercase and compares against `existingNames.map(n => n.toLowerCase())`. If a match is found, the existing (correctly capitalised) name is returned. Otherwise, `inputName.trim()` is returned.

**Rationale**: Implements FR-017 exactly. The children's names have established capitalisation on the leaderboard; a returning player should not accidentally create a second entry for "zbig" vs "Zbig".

---

## Finding 8 — Test Infrastructure

**Decision**: `tests/leaderboard-engine.test.js` follows the exact pattern of `badges.test.js`:
- Import from `node:test` and `node:assert/strict`
- Declare `let _ls = {}` and set `globalThis.localStorage = { getItem: k => _ls[k] ?? null, setItem: (k,v) => { _ls[k] = v; }, removeItem: k => { delete _ls[k]; } }` before imports
- `beforeEach(() => { _ls = {}; })` to reset state
- Run with `node --test tests/leaderboard-engine.test.js`

**Rationale**: Established project convention. Node native test runner requires no extra dependencies.

Add `"test": "node --test tests/*.test.js"` script to `package.json` as a convenience (does not add devDependencies — `node:test` is built-in).
