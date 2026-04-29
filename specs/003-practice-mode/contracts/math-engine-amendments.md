# Contract: math-engine.js Amendments (Practice Mode)

**Amends**: `specs/001-math-quiz-game/contracts/math-engine-api.md`
**Module**: `js/math-engine.js`
**Amendment date**: 2026-04-29
**Backward-compatible**: Yes — all existing function signatures and return shapes unchanged.

---

## New Export: PracticeRanges

```
PracticeRanges: {
  easy:   { add: NumberRange, sub: NumberRange, mul: NumberRange, div: NumberRange },
  medium: { add: NumberRange, sub: NumberRange, mul: NumberRange, div: NumberRange },
  hard:   { add: NumberRange, sub: NumberRange, mul: NumberRange, div: NumberRange },
}
```

Where `NumberRange` matches the existing shape used by `GameConfig.numberRanges`:
`{ aMin, aMax, bMin, bMax }` — `bMax` may be `null` (dynamic bound).

**Hard tier values are identical to `GameConfig.numberRanges`** — this is the contract guarantee
that enables Practice Mode Hard to produce the same question distribution as the main game.

---

## New Export: ENCOURAGING_MESSAGES

```
ENCOURAGING_MESSAGES: string[]
```

Array of 8 positive feedback strings. Values:
`['🎉 Brilliant!', '⭐ Excellent!', '🌟 You got it!', '💪 Amazing!',
  '🔥 Correct!', '👏 Well done!', '✅ Perfect!', '🚀 Spot on!']`

**Guarantee**: `ENCOURAGING_MESSAGES.length >= 1` always holds; callers may safely index
with `Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)`.

---

## New Export: getPracticeConfig(operation, difficulty)

```
getPracticeConfig(operation: string, difficulty: string): GameConfig-compatible object
```

| Parameter | Type | Values |
|-----------|------|--------|
| `operation` | `string` | `'add' \| 'sub' \| 'mul' \| 'div'` |
| `difficulty` | `string` | `'easy' \| 'medium' \| 'hard'` |

**Returns**: A spread of `GameConfig` with `numberRanges` overridden to contain only the
relevant operation's range for the given difficulty:

```js
{
  ...GameConfig,
  numberRanges: { [operation]: PracticeRanges[difficulty][operation] }
}
```

**Guarantee**: The returned object is always safe to pass directly to `generateQuestion(operation, config, id)`.

**Throws**: Does not throw; if `operation` or `difficulty` is invalid, `PracticeRanges[difficulty]?.[operation]`
is `undefined` and `generateQuestion` will throw its existing `Unknown operation` error — the
caller is responsible for passing valid values.

---

## Amended Export: generateQuestion(operation, config, id)

**Signature unchanged.** Two lines changed internally (backward-compatible):

### Before (add case):
```js
b = randInt(r.bMin, 100 - a);
```

### After (add case):
```js
b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, 100 - a));
```

### Before (sub case):
```js
b = randInt(r.bMin, a - 1);
```

### After (sub case):
```js
b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, a - 1));
```

**Behavioral change for callers that pass `bMax: null`** (i.e., the main game): none.
`null ?? Infinity` → `Math.min(Infinity, 100-a)` = `100-a` — identical to previous behavior.

**Behavioral change for callers that pass a numeric `bMax`**: `b` is now capped to
`Math.min(bMax, 100-a)` for add and `Math.min(bMax, a-1)` for sub. This is the intended
behavior for Practice Mode difficulty configs.

**Updated test requirement**: A new test must assert that `generateQuestion('add', config, 0)`
with `config.numberRanges.add.bMax = 5` never produces a question where `b > 5`. This test
must be written and confirmed failing before the amendment is implemented (Constitution IV).

---

## Unchanged Exports

The following exports are **reused by Practice Mode without modification**:

| Export | How Practice Mode uses it |
|--------|--------------------------|
| `evaluateAnswer(question, selectedChoice)` | Called with `parseInt(inputValue, 10)` as `selectedChoice` |
| `updateStreak(streak, correct, config)` | Called with `GameConfig`; `pts` return value discarded |
| `generateQuestion(operation, config, id)` | Core question generator; amended as above |
| `buildChoices(answer, operation, config)` | Called internally by `generateQuestion`; choices field generated but not rendered |
| `GameConfig` | Passed to `updateStreak` and used as the base for `getPracticeConfig` |

The following exports are **not used by Practice Mode**:

| Export | Reason |
|--------|--------|
| `generateRound(config)` | Generates 10 mixed-operation questions; Practice Mode generates one-at-a-time for a single operation |
| `calculateStars(score, config)` | Practice Mode has no score or star rating |
| `applyTimerBonus(timerTicks, config)` | Practice Mode has no timer |
| `applyWrongAnswer(lives)` | Practice Mode has no lives |
| `getHighScore()` / `setHighScore(score)` | Practice Mode writes nothing to `localStorage` |
