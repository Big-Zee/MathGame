# Contract: math-engine.js Amendments (Adjustable Timer)

**Amends**: `specs/001-math-quiz-game/contracts/math-engine-api.md`
**Module**: `js/math-engine.js`
**Amendment date**: 2026-04-30
**Backward-compatible**: Yes — all existing function signatures and return shapes unchanged.

---

## New Export: TIMER_OPTIONS

```js
TIMER_OPTIONS: Array<{ seconds: number, label: string }>
```

Six entries, ordered ascending by `seconds`.

| Index | seconds | label |
|-------|---------|-------|
| 0 | 5  | `'Super Speed! ⚡'` |
| 1 | 10 | `'Fast! 🚀'` |
| 2 | 15 | `'Normal 🎯'` |
| 3 | 20 | `'Relaxed 😊'` |
| 4 | 25 | `'Easy Going 🌈'` |
| 5 | 30 | `'Take Your Time 🐢'` |

**Guarantee**: `TIMER_OPTIONS[2].seconds === 15` (the default). Index 2 is always the default.

---

## New Export: getTimerPreference()

```js
getTimerPreference(): number
```

Returns the saved timer preference in seconds. Reads `globalThis.localStorage?.getItem('mathblaster_timer_preference')`,
parses to integer, validates against `TIMER_OPTIONS`. Returns `15` if absent, unparseable, or invalid.

**Guarantee**: Return value is always a member of `TIMER_OPTIONS.map(o => o.seconds)`.
Never throws. Safe to call before `TIMER_OPTIONS` navigation is rendered.

---

## New Export: setTimerPreference(seconds)

```js
setTimerPreference(seconds: number): void
```

Writes `String(seconds)` to `localStorage` under key `'mathblaster_timer_preference'`.
Silently no-ops if `localStorage` is unavailable.

**When to call**: Once, immediately before `startGame()`, when the child taps ▶ Play!.
Not called on every ◀/▶ tap.

---

## New Export: getGameConfigForTimer(seconds)

```js
getGameConfigForTimer(seconds: number): GameConfig-compatible object
```

Returns `{ ...GameConfig, timerSeconds: seconds, timerBonusThreshold: Math.floor(seconds * 0.5) }`.

**Guarantee**: The returned object is safe to pass to all existing game functions.
`applyTimerBonus(timerTicks, config)` will use the overridden `timerSeconds` and
`timerBonusThreshold` values.

---

## Unchanged Exports

All existing exports are **unchanged** — signatures, behaviour, and return shapes
are identical:

| Export | Notes |
|--------|-------|
| `GameConfig` | Still has `timerSeconds: 15, timerBonusThreshold: 8` — these are now defaults only, overridden at game-start |
| `applyTimerBonus(timerTicks, config)` | No change — already reads config fields dynamically |
| `generateQuestion`, `generateRound`, `buildChoices` | Timer-agnostic; no change |
| `evaluateAnswer`, `calculateStars`, `updateStreak`, `applyWrongAnswer` | No change |
| `getHighScore`, `setHighScore` | No change |
| `PracticeRanges`, `ENCOURAGING_MESSAGES`, `getPracticeConfig`, `getAccuracyTier` | No change |
