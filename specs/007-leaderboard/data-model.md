# Data Model: Leaderboard

**Branch**: `007-leaderboard` | **Date**: 2026-05-01

## Storage Keys

| Key | Type | Owner | Notes |
|-----|------|-------|-------|
| `mathblaster_leaderboard` | JSON array | `leaderboard-engine.js` | Max 10 `LeaderboardEntry` objects |
| `mathblaster_leaderboard_stats` | JSON object | `leaderboard-engine.js` | `LeaderboardStats` — persists independently of cap |
| `mathblaster_last_player_name` | String | `leaderboard-engine.js` | Raw string; cleared only if explicitly reset (not on leaderboard clear) |

---

## Entity: LeaderboardEntry

Stored in `mathblaster_leaderboard` as elements of a JSON array.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `name` | string | max 12 chars; trimmed; case preserved per `resolvePlayerName` | Player display name |
| `score` | integer | ≥0 | Points earned this session |
| `stars` | integer | 1, 2, or 3 | Computed by `calculateStars()` at session end |
| `difficulty` | string | `"Standard"` (all normal game entries in v1) | Reserved for future difficulty feature; always `"Standard"` currently |
| `timerSetting` | string | e.g. `"15s"`, `"30s"` | Human-readable timer label derived from `session.config.timerSeconds` |
| `stoppedEarly` | boolean | — | `true` if session ended via Stop Session; `false` for normal completion |
| `date` | string | ISO 8601 full timestamp (e.g. `"2026-04-30T14:23:55.123Z"`) | Used for sort (full precision) and display (formatted to `"Apr 30"`) |
| `accuracy` | number | 0–100; integer percentage | `Math.round(correctAnswers / questionsAnswered * 100)` |
| `bestStreak` | integer | ≥0 | Highest consecutive correct streak reached during this session |

**Example entry**:
```json
{
  "name": "Zbig",
  "score": 180,
  "stars": 3,
  "difficulty": "Standard",
  "timerSetting": "10s",
  "stoppedEarly": false,
  "date": "2026-04-30T14:23:55.123Z",
  "accuracy": 90,
  "bestStreak": 7
}
```

**Cap behaviour**:
- Array length MUST NOT exceed 10
- On insert when length = 10: remove entry with the lowest score; if tied, remove earliest `date`
- Entries are stored in insertion/replacement order; sorted at read time by `sortLeaderboard()`

---

## Entity: LeaderboardStats

Stored in `mathblaster_leaderboard_stats` as a single JSON object.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `totalGamesPlayed` | integer | ≥0 | Increments for every eligible game end, regardless of top-10 placement |
| `bestScoreEver` | integer | ≥0 | Maximum `score` seen across all eligible game ends |
| `bestAccuracyEver` | number | 0–100 | Maximum `accuracy` seen across all eligible game ends |
| `difficultyCounts` | object | `{ Easy: integer, Medium: integer, Hard: integer, Standard: integer }` | Counts per difficulty label; `Standard` used for all normal game entries |

**Default (empty) state**:
```json
{
  "totalGamesPlayed": 0,
  "bestScoreEver": 0,
  "bestAccuracyEver": 0,
  "difficultyCounts": { "Easy": 0, "Medium": 0, "Hard": 0, "Standard": 0 }
}
```

**Update rules**:
- `totalGamesPlayed` += 1 on every eligible game end
- `bestScoreEver` = `Math.max(bestScoreEver, score)`
- `bestAccuracyEver` = `Math.max(bestAccuracyEver, accuracy)`
- `difficultyCounts[difficulty]` += 1

**Clear behaviour**: Reset to default state. `mathblaster_last_player_name` is **not** cleared.

---

## Derived: NameButton

Not stored — derived at results screen render time from the current `mathblaster_leaderboard` contents.

| Field | Source | Notes |
|-------|--------|-------|
| `name` | `entry.name` | Unique player names only; duplicates collapsed |
| `personalBest` | `Math.max(...entries.filter(e => e.name === name).map(e => e.score))` | Highest score across all entries for this player |

**Derivation rules**:
- Read current `mathblaster_leaderboard` (live, not cached)
- Extract unique names (case-sensitive match — names are stored with canonical capitalisation)
- Sort alphabetically A→Z
- For each name, compute personal best from current leaderboard entries
- Always append a synthetic `"+ Add new name"` entry as the last button

---

## Lifecycle / State Transitions

```
Game ends (eligible session)
  │
  ├── updateStats(gameData)          ← always, before badge checks
  │
  ├── checkBadgesAfterGame()
  │     └── enqueueBadgePopups(callback)
  │           └── [badge popups dismissed]
  │                 └── callback()
  │                       ├── renderResultsScreen()
  │                       ├── renderNamePicker(session)   ← eligibility check here
  │                       └── showScreen('screen-results')
  │
  └── [name picker shown if eligible]
        │
        ├── Skip pressed
        │     └── (no save) → results screen stays; Play Again / Back to Menu available
        │
        ├── Save Score pressed (name selected or typed)
        │     ├── resolvePlayerName(input, existingNames)
        │     ├── saveEntry(entry)               ← may drop lowest if cap full
        │     ├── setLastPlayerName(name)
        │     └── showLeaderboard(newEntryIndex)  → screen-leaderboard
        │
        └── "Great effort" message shown (score too low for cap)
              └── (no name picker; no save)
```

---

## Validation Rules

| Rule | Applies to | Enforcement point |
|------|-----------|-------------------|
| Name max 12 chars | LeaderboardEntry.name | `maxlength="12"` on text input; `leaderboard-engine.js` trims on save |
| Score ≥ 0 | LeaderboardEntry.score | Enforced by game engine (existing) |
| Stars 1–3 | LeaderboardEntry.stars | Enforced by `calculateStars()` (existing) |
| timerSetting format | `"Ns"` string | Constructed as `\`${session.config.timerSeconds}s\`` |
| Array cap 10 | mathblaster_leaderboard | `saveEntry()` enforces before write |
| difficultyCounts keys | LeaderboardStats | `updateStats()` uses `difficulty` value as key; `"Standard"` for normal mode |
