# Data Model: Achievement Badges

**Feature**: `006-achievement-badges` | **Date**: 2026-05-01

---

## localStorage Schema

### `mathblaster_badges`

The primary badge store. A JSON object mapping badge ID strings to badge records.

```json
{
  "sharp-shooter":    { "earned": true,  "unlockedAt": "2026-05-01T14:23:00.000Z" },
  "hat-trick":        { "earned": false, "unlockedAt": null },
  "on-fire":          { "earned": false, "unlockedAt": null },
  "unstoppable":      { "earned": false, "unlockedAt": null },
  "comeback-kid":     { "earned": false, "unlockedAt": null },
  "speed-demon":      { "earned": true,  "unlockedAt": "2026-04-30T10:11:00.000Z" },
  "lightning":        { "earned": false, "unlockedAt": null },
  "quick-thinker":    { "earned": false, "unlockedAt": null },
  "first-win":        { "earned": true,  "unlockedAt": "2026-04-28T09:00:00.000Z" },
  "century":          { "earned": false, "unlockedAt": null },
  "high-roller":      { "earned": false, "unlockedAt": null },
  "math-legend":      { "earned": false, "unlockedAt": null },
  "practice-perfect": { "earned": false, "unlockedAt": null },
  "operation-master": { "earned": false, "unlockedAt": null },
  "dedication":       { "earned": false, "unlockedAt": null },
  "explorer":         { "earned": false, "unlockedAt": null },
  "time-lord":        { "earned": false, "unlockedAt": null },
  "perfectionist":    { "earned": false, "unlockedAt": null }
}
```

**Rules**:
- All 18 IDs are always present once the store is initialised.
- `unlockedAt` is set to `new Date().toISOString()` at the moment of earning; never overwritten after that.
- Earning a badge already earned is a no-op (idempotent).

---

### `mathblaster_badges_new`

A simple integer stored as a string (consistent with other existing keys).

```
"3"
```

Incremented by 1 each time a new badge is earned. Reset to `"0"` when `#screen-badges` is opened. If the key is absent, treat as `0`.

---

### `mathblaster_practice_stats`

Cumulative Practice Mode statistics used by Practice badges and "Explorer".

```json
{
  "sessionsCompleted":    5,
  "operationsCompleted":  ["addition", "subtraction", "multiplication"],
  "difficultiesCompleted": ["easy", "hard"],
  "totalCorrect":         42
}
```

**Fields**:
- `sessionsCompleted` — integer; incremented by 1 each time `stopPractising()` reaches the Practice Summary screen.
- `operationsCompleted` — array of unique operation strings; values: `"addition"`, `"subtraction"`, `"multiplication"`, `"division"`. Union-appended on each completed session.
- `difficultiesCompleted` — array of unique difficulty strings; values: `"easy"`, `"medium"`, `"hard"`. Union-appended on each completed session.
- `totalCorrect` — integer; cumulative sum of `practiceSession.totalCorrect` on each completed session.

**Initial value** (absent key): `{ sessionsCompleted: 0, operationsCompleted: [], difficultiesCompleted: [], totalCorrect: 0 }`.

---

### `mathblaster_timers_used`

A comma-separated string of timer values (seconds as integers) for which the player has completed at least one full game.

```
"5,15,30"
```

Valid values: `5`, `10`, `15`, `20`, `25`, `30`.

Updated in `showResults()` and `showStopSummary()` using `session.config.timerSeconds`.

**Initial value** (absent key): `""` (empty string — no timers used yet).

---

## In-Memory State Extensions

### `session` object additions

Two new fields added to the object returned by `newSession(config)`:

| Field | Type | Initial | Description |
|-------|------|---------|-------------|
| `answerTimesMs` | `number[]` | `[]` | Per-question elapsed time in ms. Pushed in `showFeedback` before badge checks. Index N corresponds to question N (0-based). |
| `fastAnswerStreak` | `number` | `0` | Consecutive correct answers each answered in < 5 000 ms. Reset to 0 on any wrong answer OR any answer ≥ 5 000 ms. Incremented before badge checks. |

No other existing `session` fields are modified. `heartsLost` is computed on demand as `3 - session.lives`.

---

## Badge Definitions

All 18 badges, their IDs, categories, and check conditions.

### 🎯 Accuracy (5 badges)

| ID | Name | Emoji | Check Condition | Hint (Badges screen) |
|----|------|-------|-----------------|----------------------|
| `sharp-shooter` | Sharp Shooter | 🎯 | After game: `session.correctAnswers === 10` | Score 100% on a 10-question game |
| `hat-trick` | Hat Trick | 🎩 | After question: `session.streak >= 3` | Get 3 correct answers in a row |
| `on-fire` | On Fire | 🔥 | After question: `session.streak >= 5` | Get 5 correct answers in a row |
| `unstoppable` | Unstoppable | ⚡ | After question: `session.streak >= 10` | Get all 10 correct in a row |
| `comeback-kid` | Comeback Kid | 💪 | After game: `(3 - session.lives) === 2 && calculateStars(...) === 3` | Win with 3 stars after losing 2 hearts |

### ⏱️ Speed (3 badges)

| ID | Name | Emoji | Check Condition | Hint |
|----|------|-------|-----------------|------|
| `speed-demon` | Speed Demon | 🏎️ | After question (correct answer only): `lastAnswerTimeMs < 3000` | Answer correctly in under 3 seconds |
| `lightning` | Lightning | ⚡ | After question: `session.fastAnswerStreak >= 5` | 5 consecutive correct answers under 5 seconds |
| `quick-thinker` | Quick Thinker | 🧠 | After game: `questionsAnswered === 10 && avgAnswerTimeMs < 7000` | Finish a game with average answer time under 7s |

### 🏆 Score (4 badges)

| ID | Name | Emoji | Check Condition | Hint |
|----|------|-------|-----------------|------|
| `first-win` | First Win | 🌟 | After game: badge not already earned (first time) | Complete your very first game |
| `century` | Century | 💯 | After game: `session.score >= 100` | Score 100+ points in one game |
| `high-roller` | High Roller | 🎰 | After game: `session.score >= 150` | Score 150+ points in one game |
| `math-legend` | Math Legend | 👑 | After game: `session.score >= 200` | Score 200+ points in one game |

### 📚 Practice (3 badges)

| ID | Name | Emoji | Check Condition | Hint |
|----|------|-------|-----------------|------|
| `practice-perfect` | Practice Makes Perfect | 📚 | After Practice session: `practiceStats.sessionsCompleted >= 5` | Complete 5 Practice sessions |
| `operation-master` | Operation Master | 🔢 | After Practice session: all 4 operations in `practiceStats.operationsCompleted` | Practice all 4 operations |
| `dedication` | Dedication | 🏅 | After Practice session: `practiceStats.totalCorrect >= 50` | Answer 50 questions correctly in Practice |

### 🌈 Variety (3 badges)

| ID | Name | Emoji | Check Condition | Hint |
|----|------|-------|-----------------|------|
| `explorer` | Explorer | 🗺️ | After Practice session: all 3 difficulties in `practiceStats.difficultiesCompleted` | Complete a Practice session at each difficulty level |
| `time-lord` | Time Lord | ⏰ | After game: all 6 timer values in `timersUsed` | Complete a game with every timer setting |
| `perfectionist` | Perfectionist | ✨ | After Practice session at Hard: `totalAnswered === totalCorrect` (100% in that session) | Get every question right in a Hard Practice session |

---

## `BADGE_DEFINITIONS` Constant

The canonical array used for rendering the Badges screen and driving badge checks. Each entry:

```js
{
  id: string,           // slug matching localStorage key
  name: string,         // display name
  emoji: string,        // badge emoji
  category: string,     // 'accuracy' | 'speed' | 'score' | 'practice' | 'variety'
  hint: string,         // short earn-hint for unearned state on Badges screen
  description: string,  // one-line unlock description for popup ("You answered in under 3 seconds!")
}
```

Category display order: accuracy → speed → score → practice → variety.

---

## Popup State

Module-level transient state (not persisted):

```js
let badgePopupQueue = [];       // array of badge IDs to show
let badgePopupCallback = null;  // function to call after queue drains
let badgePopupTimer = null;     // setTimeout handle for auto-dismiss
```

No persistence needed — popup queue is ephemeral within a single page session.
