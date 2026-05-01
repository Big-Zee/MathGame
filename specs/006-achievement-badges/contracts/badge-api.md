# Contract: Badge Engine API (`js/badge-engine.js`)

**Feature**: `006-achievement-badges` | **Date**: 2026-05-01

This document defines the public interface of the new `js/badge-engine.js` ES module. `index.html` imports from this module; `tests/badges.test.js` tests it directly.

---

## Exports

### Constants

#### `BADGE_DEFINITIONS`
```js
export const BADGE_DEFINITIONS: BadgeDefinition[]
```
Array of 18 badge objects in display order (accuracy → speed → score → practice → variety).

```ts
type BadgeDefinition = {
  id: string;          // e.g. "speed-demon"
  name: string;        // e.g. "Speed Demon"
  emoji: string;       // e.g. "🏎️"
  category: string;    // "accuracy" | "speed" | "score" | "practice" | "variety"
  hint: string;        // short earn-hint shown on unearned badge card
  description: string; // popup description, e.g. "You answered in under 3 seconds!"
}
```

#### `BADGE_CATEGORIES`
```js
export const BADGE_CATEGORIES: { id: string; label: string; emoji: string }[]
```
Ordered array of the 5 category descriptors used for Badges screen section headers.

---

### localStorage Wrappers

All wrappers use `globalThis.localStorage?.` guard for Node.js test compatibility.

#### `getBadgeStore() → BadgeStore`
Returns the full badge store, initialised with all 18 badges as `{ earned: false, unlockedAt: null }` if the key is absent or corrupt.

#### `saveBadgeStore(store: BadgeStore) → void`
Serialises and writes the badge store to `mathblaster_badges`.

#### `getBadgesNew() → number`
Returns the current unviewed-badge count (integer). Returns 0 if key is absent.

#### `incrementBadgesNew(count: number) → void`
Adds `count` to the stored unviewed-badge counter.

#### `clearBadgesNew() → void`
Resets the unviewed-badge counter to `"0"`.

#### `getPracticeStats() → PracticeStats`
Returns cumulative practice stats, initialised to zero-state if key is absent.

```ts
type PracticeStats = {
  sessionsCompleted: number;
  operationsCompleted: string[];   // e.g. ["addition", "subtraction"]
  difficultiesCompleted: string[]; // e.g. ["easy", "hard"]
  totalCorrect: number;
}
```

#### `savePracticeStats(stats: PracticeStats) → void`
Writes practice stats to `mathblaster_practice_stats`.

#### `getTimersUsed() → number[]`
Returns array of timer values (integers, seconds) for which a completed game exists. Returns `[]` if absent.

#### `saveTimersUsed(timers: number[]) → void`
Writes timer array to `mathblaster_timers_used` as CSV string.

---

### Badge Check Functions

All badge check functions are **pure** — they take state arguments, return a boolean, and have no side effects. They do NOT read from localStorage.

#### After-Question Checks

Called from `index.html` after each question's feedback phase.

```js
export function checkHatTrick(streak: number): boolean
// true if streak >= 3

export function checkOnFire(streak: number): boolean
// true if streak >= 5

export function checkUnstoppable(streak: number): boolean
// true if streak >= 10

export function checkSpeedDemon(lastAnswerMs: number): boolean
// true if lastAnswerMs < 3000

export function checkLightning(fastAnswerStreak: number): boolean
// true if fastAnswerStreak >= 5
```

#### After-Game Checks

Called from `index.html` after `showResults()` or `showStopSummary()`, with the final session state.

```js
export function checkSharpShooter(correctAnswers: number): boolean
// true if correctAnswers === 10

export function checkComebackKid(heartsLost: number, stars: number): boolean
// true if heartsLost === 2 && stars === 3

export function checkQuickThinker(answerTimesMs: number[], questionsAnswered: number): boolean
// true if questionsAnswered === 10 && average(answerTimesMs) < 7000

export function checkFirstWin(badgeAlreadyEarned: boolean): boolean
// true if !badgeAlreadyEarned (earned on first call)

export function checkCentury(score: number): boolean
// true if score >= 100

export function checkHighRoller(score: number): boolean
// true if score >= 150

export function checkMathLegend(score: number): boolean
// true if score >= 200

export function checkTimeLord(timersUsed: number[]): boolean
// true if timersUsed contains all 6 values: [5, 10, 15, 20, 25, 30]
```

#### After-Practice-Session Checks

Called from `index.html` after `stopPractising()` reaches the summary screen.

```js
export function checkPracticeMakesPerfect(sessionsCompleted: number): boolean
// true if sessionsCompleted >= 5

export function checkOperationMaster(operationsCompleted: string[]): boolean
// true if all 4 of ["addition","subtraction","multiplication","division"] present

export function checkDedication(totalCorrect: number): boolean
// true if totalCorrect >= 50

export function checkExplorer(difficultiesCompleted: string[]): boolean
// true if all 3 of ["easy","medium","hard"] present

export function checkPerfectionist(
  difficulty: string,
  totalAnswered: number,
  totalCorrect: number
): boolean
// true if difficulty === "hard" && totalAnswered > 0 && totalAnswered === totalCorrect
```

---

### Orchestrators

High-level functions called by `index.html`; handle check → award → persist pipeline.

#### `checkBadgesAfterQuestion(session, badgeStore) → string[]`
```js
export function checkBadgesAfterQuestion(
  session: {
    streak: number,
    answerTimesMs: number[],
    fastAnswerStreak: number,
  },
  badgeStore: BadgeStore
): string[]
```
Runs all after-question badge checks against the current session state. Returns array of newly earned badge IDs (excludes already-earned badges). Does NOT save to localStorage — caller is responsible for persisting and incrementing the new-badge counter.

#### `checkBadgesAfterGame(session, badgeStore, timersUsed) → string[]`
```js
export function checkBadgesAfterGame(
  session: {
    correctAnswers: number,
    lives: number,
    score: number,
    config: { timerSeconds: number },
    answerTimesMs: number[],
    questionsAnswered: number,
  },
  badgeStore: BadgeStore,
  timersUsed: number[]
): string[]
```
Runs all after-game badge checks. Returns newly earned badge IDs.

#### `checkBadgesAfterPractice(practiceStats, sessionData, badgeStore) → string[]`
```js
export function checkBadgesAfterPractice(
  practiceStats: PracticeStats,
  sessionData: {
    difficulty: string,
    totalAnswered: number,
    totalCorrect: number,
  },
  badgeStore: BadgeStore
): string[]
```
Runs all Practice and Variety (Explorer, Perfectionist) badge checks. Returns newly earned badge IDs.

#### `awardBadges(badgeIds: string[], badgeStore: BadgeStore) → BadgeStore`
```js
export function awardBadges(badgeIds: string[], badgeStore: BadgeStore): BadgeStore
```
Returns a new BadgeStore with the given badge IDs marked earned with the current ISO timestamp. Does NOT save to localStorage — caller saves the returned store.

---

## Types

```ts
type BadgeRecord = {
  earned: boolean;
  unlockedAt: string | null;  // ISO date string or null
}

type BadgeStore = Record<string, BadgeRecord>;
// Keys: all 18 badge IDs
```

---

## Usage Example (index.html integration)

```js
import {
  BADGE_DEFINITIONS, BADGE_CATEGORIES,
  getBadgeStore, saveBadgeStore, getBadgesNew, incrementBadgesNew, clearBadgesNew,
  getPracticeStats, savePracticeStats,
  getTimersUsed, saveTimersUsed,
  checkBadgesAfterQuestion, checkBadgesAfterGame, checkBadgesAfterPractice,
  awardBadges,
} from './js/badge-engine.js';

// After showFeedback completes:
const store = getBadgeStore();
const newIds = checkBadgesAfterQuestion(session, store);
if (newIds.length > 0) {
  const updatedStore = awardBadges(newIds, store);
  saveBadgeStore(updatedStore);
  incrementBadgesNew(newIds.length);
  enqueueBadgePopups(newIds, advanceRound);
} else {
  session.pendingAdvance = setTimeout(advanceRound, 1000);
}
```
