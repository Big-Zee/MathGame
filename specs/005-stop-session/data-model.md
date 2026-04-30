# Data Model: Stop Session

**Branch**: `005-stop-session` | **Date**: 2026-04-30

---

## Existing Entities (Read-Only Reference)

### `session` object (in-memory, defined by `newSession(config)`)

No new fields added to the existing session object. Fields used by the stop feature:

| Field | Type | Used By Stop Feature |
|-------|------|----------------------|
| `score` | `number` | Displayed on stop summary; compared against high score |
| `lives` | `number` | Displayed on stop summary (hearts remaining) |
| `streak` | `number` | n/a (best streak not tracked in session; see below) |
| `questionIndex` | `number` | Used to compute `totalQuestions - questionsAnswered` |
| `correctAnswers` | `number` | Accuracy calculation on stop summary |
| `questionsAnswered` | `number` | All stat display; 0-answered edge case |
| `config.totalQuestions` | `number` | "6 of 10 questions answered" display |
| `timerTicks` | `number` | Preserved on overlay open; restored on resume |
| `timerHandle` | `number \| null` | Cleared on overlay open (via `stopTimer()`) |
| `phase` | `'question' \| 'feedback'` | Determines whether `resumeTimer()` is called on overlay dismiss |

**Note**: `bestStreak` is not currently tracked in `session` — it needs to be added (see New Fields below).

---

## New Fields

### `session.bestStreak` — `number`

| Attribute | Value |
|-----------|-------|
| Type | `number` |
| Initial value | `0` (set in `newSession()`) |
| Updated | In `showFeedback()`: after `updateStreak()`, if `session.streak > session.bestStreak`, set `session.bestStreak = session.streak` |
| Displayed | On `#screen-stop-summary` as "Best streak 🔥: N" |
| Lifecycle | Lives on `session`; cleared with `session = null` |

---

## New Transient State

### `stopOverlayActive` — module-level `boolean`

| Attribute | Value |
|-----------|-------|
| Type | `boolean` |
| Initial value | `false` |
| Set to `true` | In `showStopOverlay()` |
| Set to `false` | In `hideStopOverlay()` |
| Guards | `startTimer()` (returns early if `true`) |
| Not persisted | Lives in JS module scope; reset on page reload |

---

## localStorage Keys

### Existing Keys (unchanged)

| Key | Type | Owner |
|-----|------|-------|
| `mathgame_highscore` | `string` (integer) | `getHighScore()` / `setHighScore()` in math-engine.js |
| `mathblaster_timer_preference` | `string` (integer) | `getTimerPreference()` / `setTimerPreference()` |

### New Key

| Key | Value | Type | Lifetime |
|-----|-------|------|----------|
| `mathgame_highscore_early` | `"1"` when current high score was set by early stop; absent otherwise | `string \| null` | Set in `setEarlyStopFlag()`; cleared in `clearEarlyStopFlag()` (called from `showResults()` when a completed game sets a new high score) |

**Invariant**: `mathgame_highscore_early === "1"` is only valid when `mathgame_highscore > 0`. If `getHighScore()` returns `0`, the flag is ignored.

---

## New math-engine.js Exports

### `calculateEarlyStopStars(totalAnswered, totalCorrect)` → `0 | 1 | 2 | 3`

| Input | Constraint |
|-------|------------|
| `totalAnswered` | `number`, ≥ 0, integer |
| `totalCorrect` | `number`, 0 ≤ `totalCorrect` ≤ `totalAnswered` |

| Output | Condition |
|--------|-----------|
| `0` | `totalAnswered === 0` |
| `3` | `pct >= 80` |
| `2` | `pct >= 50` |
| `1` | `pct < 50` |

Where `pct = Math.round(totalCorrect / totalAnswered * 100)`.

### `getEarlyStopMessage(totalAnswered, totalCorrect)` → `string`

| Output | Condition |
|--------|-----------|
| `"You didn't answer any questions yet — give it a go! 😊"` | `totalAnswered === 0` |
| `"Brilliant effort, you were on fire! 🔥"` | `pct >= 80` |
| `"Great session, keep building on this! 💪"` | `pct >= 50` |
| `"Every question counts, well done for trying! 🧠"` | `pct < 50` |

### `getEarlyStopFlag()` → `boolean`

Reads `globalThis.localStorage?.getItem('mathgame_highscore_early')`. Returns `true` iff value is `"1"`.

### `setEarlyStopFlag()` → `void`

Calls `globalThis.localStorage?.setItem('mathgame_highscore_early', '1')`. Silent no-op if localStorage unavailable.

### `clearEarlyStopFlag()` → `void`

Calls `globalThis.localStorage?.removeItem('mathgame_highscore_early')`. Silent no-op if localStorage unavailable.

---

## New DOM Elements

### Inside `#screen-game`

| ID | Element | Purpose |
|----|---------|---------|
| `#btn-stop-game` | `<button>` | ⛔ Stop trigger; `position: absolute; top: 16px; right: 16px` |
| `#stop-confirm-overlay` | `<div>` | Confirmation overlay; `role="dialog"` `aria-modal="true"` |
| `#stop-confirm-title` | `<p>` | "Are you sure you want to stop? 🤔" |
| `#btn-keep-playing` | `<button>` | Dismisses overlay; focus target on overlay open |
| `#btn-confirm-stop` | `<button>` | Confirms stop; triggers `showStopSummary()` |

### New Section `#screen-stop-summary`

| ID | Element | Content |
|----|---------|---------|
| `#stop-stars-container` | `<div>` | Accuracy-based star rating (0–3 ⭐) |
| `#stop-questions-answered` | `<p>` | "6 of 10 questions answered" |
| `#stop-correct` | `<p>` | "4 correct ✅" |
| `#stop-incorrect` | `<p>` | "2 incorrect ❌" |
| `#stop-accuracy` | `<p>` | "67% accuracy" |
| `#stop-score` | `<p>` | "Score: Xpts" |
| `#stop-streak` | `<p>` | "Best streak 🔥: N" |
| `#stop-hearts` | `<p>` | "Hearts remaining: ❤️❤️❤️" |
| `#stop-highscore` | `<p>` | "Best: Xpts" (current best after possible save) |
| `#stop-new-highscore` | `<p>` | "🏆 New high score!" (hidden unless new best) |
| `#stop-message` | `<p>` | Accuracy-based encouraging message |
| `#btn-stop-main-menu` | `<button>` | 🏠 Main Menu |
| `#btn-stop-play-again` | `<button>` | 🔄 Play Again (hidden when `questionsAnswered === 0`) |
