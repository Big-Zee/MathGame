# UI State Machine: Leaderboard

**Branch**: `007-leaderboard` | **Date**: 2026-05-01

## Contract 1 — Screen Flow (Updated Routing)

New screen `screen-leaderboard` integrates into the existing `showScreen()` routing.

```
screen-start
  ├── [Start Game] ──────────────────────────────────────────> screen-game
  ├── [🏆 Leaderboard] ──────────────────────────────────────> screen-leaderboard
  └── (badges, practice — unchanged)

screen-game
  ├── [All 10 questions] ─────────────────────────────────────> screen-results (via badge callbacks)
  └── [Stop Session] ─────────────────────────────────────────> screen-stop-summary (via badge callbacks)

screen-results  (name picker injected here)
  ├── [Save Score] ───────────────────────────────────────────> screen-leaderboard (gold highlight)
  ├── [Skip] ─────────────────────────────────────────────────> (stays on screen-results; normal Play Again / Back to Menu)
  └── [Play Again] ───────────────────────────────────────────> screen-game
  └── [Back to Menu] ─────────────────────────────────────────> screen-start

screen-stop-summary  (name picker injected here)
  ├── [Save Score] ───────────────────────────────────────────> screen-leaderboard (gold highlight)
  ├── [Skip] ─────────────────────────────────────────────────> (stays on screen-stop-summary; existing buttons)
  └── [Play Again] / [Back to Menu] ─────────────────────────> (existing behaviour unchanged)

screen-leaderboard
  ├── [🏠 Back to Menu] ──────────────────────────────────────> screen-start
  └── [▶ Play Again] ─────────────────────────────────────────> screen-game
  (clear leaderboard confirmation stays within screen-leaderboard)
```

---

## Contract 2 — Name Picker State Machine

The name picker `<div id="name-picker">` is a sub-component of the results screens. It has its own internal state independent of the screen routing.

### States

```
HIDDEN
  │  [eligible session AND board not full-and-score-too-low]
  ▼
SCENARIO_DETECT ──────────────────────────────────────────────────────
  │                                                                    │
  │ leaderboard empty?                              last name in LB?  │
  ▼                                                 ▼                  │
SCENARIO_B                              SCENARIO_C_MATCH              │
(text input visible,                    (name button pre-selected,    │
 auto-focused,                           Save Score enabled,          │
 label: "You're the first player!")      no user action required)     │
  │                                                 │                  │
  │ 1+ chars typed                                  │ user taps        │
  ▼                                                 │ different button │
SAVE_ENABLED ◄───────────────────────────────────────                 │
  │                                                                    │
  │ [from SCENARIO_C_MATCH]   last name NOT in LB? ──────────────────>│
                                                    ▼
                                       SCENARIO_C_FALLBACK
                                       (+ Add new name expanded,
                                        name pre-filled,
                                        Save Score disabled until 1+ chars)
                                                    │
                                         1+ chars typed
                                                    ▼
                                             SAVE_ENABLED

SCENARIO_A (leaderboard has players, no last name or last name detection pending)
  ├── name buttons shown (alphabetical, personal bests)
  ├── "+ Add new name" shown last
  ├── no button selected → Save Score DISABLED
  ├── [tap name button] → button SELECTED (gold) → Save Score ENABLED → SAVE_ENABLED
  └── [tap "+ Add new name"] → text input EXPANDED, auto-focused → INPUT_ACTIVE

INPUT_ACTIVE
  ├── 0 chars → Save Score DISABLED; selected button deselected
  ├── 1+ chars → Save Score ENABLED → SAVE_ENABLED
  └── [tap name button] → button SELECTED; text input content CLEARED → SAVE_ENABLED

SAVE_ENABLED
  ├── [Save Score] or [Enter in input] → SAVING
  └── [Skip] → NAME_PICKER_DISMISSED (no save)
  └── [tap different name button] → previous button deselected; new button selected → stays SAVE_ENABLED

SAVING (guard: saving flag prevents double-tap)
  ├── resolvePlayerName(input)
  ├── saveEntry(entry)
  ├── setLastPlayerName(name)
  └── showLeaderboard(newEntryIndex) → NAME_PICKER_DISMISSED

NAME_PICKER_DISMISSED
  → normal results screen visible (name picker hidden)

SCORE_TOO_LOW (leaderboard full, score ≤ lowest)
  → no name picker shown
  → message "Great effort! Keep playing to make the top 10! 💪" shown instead
```

---

## Contract 3 — Leaderboard Screen Internal State

```
LEADERBOARD_LOADING
  │  [renderLeaderboard(highlightIndex) called]
  ▼
LEADERBOARD_EMPTY
  │  entries.length === 0
  │  → show "No scores yet — play a game and be the first on the board! 🎮"
  │  → hide table, hide banner, hide stats (or show zeroed stats)
  ▼
  or

LEADERBOARD_POPULATED
  │  entries.length > 0
  │  → render stats panel (totalGamesPlayed, bestScoreEver, bestAccuracyEver, favouriteDifficulty)
  │  → render table (sorted, medals, 🛑, gold highlight on highlightIndex row)
  │  → if highlightIndex === 0: show personal best banner "🎉 New Personal Best! You're #1!"
  │  → scroll highlighted row into view
  ▼
  [🗑️ Clear Leaderboard pressed]
  ▼
CLEAR_CONFIRM_OPEN
  │  confirmation modal shown: "Are you sure? This will delete all saved scores. 🗑️"
  │  [Yes, clear] → clearLeaderboard() → re-render → LEADERBOARD_EMPTY
  └─ [Cancel] → modal dismissed → back to LEADERBOARD_POPULATED (unchanged)
```

---

## DOM Element Reference

### New elements in `screen-leaderboard`

| ID | Element | Purpose |
|----|---------|---------|
| `#lb-stats` | `<div>` | Stats summary panel |
| `#lb-stats-games` | `<span>` | Total games played |
| `#lb-stats-best-score` | `<span>` | Best score ever |
| `#lb-stats-best-accuracy` | `<span>` | Best accuracy ever |
| `#lb-stats-fav-diff` | `<span>` | Favourite difficulty |
| `#lb-banner` | `<div>` | Personal best banner (hidden by default) |
| `#lb-empty` | `<p>` | Empty state message (hidden when entries exist) |
| `#lb-table` | `<table>` | Ranked score table |
| `#lb-table-body` | `<tbody>` | Table rows injected here |
| `#btn-lb-back` | `<button>` | "🏠 Back to Menu" |
| `#btn-lb-play-again` | `<button>` | "▶ Play Again" |
| `#btn-lb-clear` | `<button>` | "🗑️ Clear Leaderboard" |
| `#lb-clear-confirm` | `<div>` | Confirmation modal |
| `#btn-lb-clear-yes` | `<button>` | "Yes, clear" (inside modal) |
| `#btn-lb-clear-cancel` | `<button>` | "Cancel" (inside modal) |

### New elements in `screen-results` / `screen-stop-summary`

| ID | Element | Purpose |
|----|---------|---------|
| `#name-picker` | `<div>` | Name picker container (hidden when ineligible) |
| `#name-picker-prompt` | `<p>` | Contextual prompt text (Scenario A/B/C) |
| `#name-picker-buttons` | `<div>` | Name button grid |
| `#name-picker-input-wrap` | `<div>` | Text input container (hidden until needed) |
| `#name-picker-input` | `<input type="text">` | Name entry; maxlength=12 |
| `#btn-save-score` | `<button>` | Save Score (disabled until name ready) |
| `#btn-skip-save` | `<button>` | Skip (always enabled) |
| `#name-picker-no-qualify` | `<p>` | "Great effort! Keep playing..." (shown instead of picker when score too low) |
