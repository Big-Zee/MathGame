# Contract: math-engine.js Public API

**Module**: `js/math-engine.js`
**Consumed by**: `index.html` (inline `<script>`), `tests/math-engine.test.js`
**Dependencies**: None (pure functions, no DOM, no imports)
**Export style**: ES module named exports (`export function ...`)
**Amended**: 2026-04-28 — `generateQuestion` enforces ≤ 100 result cap; `applyTimerBonus` added;
  `GameConfig` gains `timerSeconds: 15`, `timerBonusThreshold: 8`, `timerBonusPts: 5`

---

## generateRound(config)

Generates the full array of 10 questions for one round.

```
generateRound(config: GameConfig): Question[]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `GameConfig` | Runtime configuration object |

**Returns**: Array of exactly `config.totalQuestions` `Question` objects, with operations
distributed across all four types (random order).

**Guarantees**:
- Length equals `config.totalQuestions` (10)
- Each question has 4 unique choices including the correct answer
- All answers are ≤ 100
- All division questions have whole-number answers
- All subtraction results are positive

---

## generateQuestion(operation, config, id)

Generates one question for the given operation.

```
generateQuestion(operation: string, config: GameConfig, id: number): Question
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `operation` | `'add' \| 'sub' \| 'mul' \| 'div'` | Math operation |
| `config` | `GameConfig` | Runtime configuration object |
| `id` | `number` | 0-based position in the round (0–9) |

**Returns**: A `Question` object with `id`, `operation`, `symbol`, `a`, `b`, `answer`, `choices`.

**Guarantees** (per-operation ≤ 100 enforcement):
- `add`: `a + b ≤ 100`; `b ∈ [1, 100 − a]`
- `sub`: `a − b > 0` and `a − b ≤ 100`
- `mul`: `a × b ≤ 100`; `a ∈ [2, floor(100 / b)]`
- `div`: answer (quotient) `≤ floor(100 / b)`

---

## buildChoices(answer, operation, config)

Generates 4 unique multiple-choice options (including the correct answer) in shuffled order.

```
buildChoices(answer: number, operation: string, config: GameConfig): number[]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `answer` | `number` | Correct answer to include |
| `operation` | `string` | Used to tune distractor plausibility |
| `config` | `GameConfig` | Used for number-range context |

**Returns**: Array of exactly 4 unique positive integers in random order.

**Guarantees**:
- Result length is always 4
- `result.includes(answer) === true`
- No duplicates
- All values are positive integers

---

## evaluateAnswer(question, selectedChoice)

Determines if the selected choice is correct.

```
evaluateAnswer(question: Question, selectedChoice: number): { correct: boolean }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `question` | `Question` | The active question |
| `selectedChoice` | `number` | The value the player tapped |

**Returns**: `{ correct: boolean }` — `true` when `selectedChoice === question.answer`.

---

## updateStreak(streak, correct, config)

Returns the new streak count and points earned after one answer.

```
updateStreak(streak: number, correct: boolean, config: GameConfig):
  { newStreak: number, pts: number }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `streak` | `number` | Current consecutive-correct count |
| `correct` | `boolean` | Whether the answer was correct |
| `config` | `GameConfig` | For `streakThreshold`, `basePts`, `streakPts` |

**Returns**:

| Scenario | `newStreak` | `pts` |
|----------|-------------|-------|
| Correct, streak below threshold | `streak + 1` | `config.basePts` |
| Correct, streak at/above threshold | `streak + 1` | `config.streakPts` |
| Wrong or timer expiry | `0` | `0` |

---

## calculateStars(score, config)

Maps a final score to a 1–3 star rating.

```
calculateStars(score: number, config: GameConfig): 1 | 2 | 3
```

| Score range | Stars |
|-------------|-------|
| `score < config.starThresholds.two` | `1` |
| `config.starThresholds.two <= score < config.starThresholds.three` | `2` |
| `score >= config.starThresholds.three` | `3` |

---

## applyTimerBonus(timerTicks, config)

Returns the bonus points earned based on how many ticks remain when the player answered.

```
applyTimerBonus(timerTicks: number, config: GameConfig): { bonusPts: number }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `timerTicks` | `number` | Remaining ticks at moment of answer (0–150) |
| `config` | `GameConfig` | For `timerSeconds`, `timerBonusThreshold`, `timerBonusPts` |

**Returns**: `{ bonusPts: number }` — `config.timerBonusPts` (5) when the answer was given
within `config.timerBonusThreshold` seconds, otherwise `0`.

**Threshold logic**: Elapsed seconds = `(config.timerSeconds × 10 − timerTicks) / 10`.
Bonus applies when elapsed seconds `< config.timerBonusThreshold`.
Equivalently: `timerTicks > config.timerSeconds × 10 − config.timerBonusThreshold × 10`
→ `timerTicks > 70` for the default 15 s / 8 s configuration.

**Note**: Only called for correct answers. The caller (`showFeedback` in `index.html`) is
responsible for gating: `applyTimerBonus` is not called on wrong answers or timer expiry.

---

## getHighScore() / setHighScore(score)

Read and write the persisted high score from `localStorage`.

```
getHighScore(): number
setHighScore(score: number): void
```

**Note**: These are the only functions in `math-engine.js` that interact with the browser
environment (`localStorage`). They are excluded from Node.js unit tests (or stubbed) since
`localStorage` is not available in Node. All other functions are pure and testable without
a browser.
