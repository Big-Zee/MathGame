# Data Model: Adjustable Question Timer

**Branch**: `004-adjustable-timer` | **Date**: 2026-04-30
**Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

All timer state is derived at game-start and held in the existing `session` object.
Nothing new is written to `localStorage` except `mathblaster_timer_preference`.
`GameConfig` is not mutated.

---

## New Export: TIMER_OPTIONS

Immutable array of six display-only option objects. Lives in `js/math-engine.js`.

```js
export const TIMER_OPTIONS = [
  { seconds: 5,  label: 'Super Speed! ⚡' },
  { seconds: 10, label: 'Fast! 🚀'         },
  { seconds: 15, label: 'Normal 🎯'         },
  { seconds: 20, label: 'Relaxed 😊'        },
  { seconds: 25, label: 'Easy Going 🌈'     },
  { seconds: 30, label: 'Take Your Time 🐢' },
];
```

**Valid `seconds` values**: `5 | 10 | 15 | 20 | 25 | 30`.
**Guarantee**: Array is ordered ascending by seconds; callers may safely use index arithmetic
for ◀/▶ navigation.

---

## New Export: getTimerPreference()

```js
export function getTimerPreference(): number
```

Reads `globalThis.localStorage?.getItem('mathblaster_timer_preference')`, parses to integer,
validates it is one of the six valid seconds values. Returns the valid integer or `15` as fallback.

**Guarantee**: Always returns one of `5 | 10 | 15 | 20 | 25 | 30`. Never throws.

---

## New Export: setTimerPreference(seconds)

```js
export function setTimerPreference(seconds: number): void
```

Writes `String(seconds)` to `globalThis.localStorage?.setItem('mathblaster_timer_preference', ...)`.
Called once when the child taps ▶ Play!, before `startGame()` runs.

**Guarantee**: Silently no-ops if `localStorage` is unavailable. Does not validate the seconds
value before writing (caller is responsible for passing a valid value from `TIMER_OPTIONS`).

---

## New Export: getGameConfigForTimer(seconds)

```js
export function getGameConfigForTimer(seconds: number): GameConfig-compatible object
```

Returns a spread of `GameConfig` with `timerSeconds` and `timerBonusThreshold` overridden:

```js
{
  ...GameConfig,
  timerSeconds:          seconds,
  timerBonusThreshold:   Math.floor(seconds * 0.5),
}
```

**Guarantee**: Safe to pass directly to all existing game functions (`generateRound`,
`applyTimerBonus`, `updateStreak`, `calculateStars`). All other `GameConfig` fields
(`totalQuestions`, `basePts`, `streakPts`, `streakThreshold`, `starThresholds`,
`operations`, `numberRanges`) are inherited unchanged.

**Bonus threshold by timer value**:

| seconds | `Math.floor(seconds * 0.5)` | effective bonus window |
|---------|----------------------------|------------------------|
| 5       | 2                          | answer within ~2 s     |
| 10      | 5                          | answer within ~5 s     |
| 15      | 7                          | answer within ~7 s     |
| 20      | 10                         | answer within ~10 s    |
| 25      | 12                         | answer within ~12 s    |
| 30      | 15                         | answer within ~15 s    |

Note: "effective bonus window" = `timerSeconds - bonusThreshold` seconds from question
appearing. The formula supersedes the spec table for 5 s, 15 s, and 25 s (see research.md Decision 3).

---

## Amended: GameSession (inline `session` object in index.html)

No new fields added. The existing `timerTicks` field is initialized from the selected
timer option rather than from `GameConfig.timerSeconds`:

### Before:
```js
timerTicks: GameConfig.timerSeconds * 10,
```

### After:
```js
timerTicks: selectedTimerOption.seconds * 10,
```

The `session` object is created inside `startGame(timerOption)`, which now receives
the selected `TimerOption` as a parameter. The derived config (`getGameConfigForTimer`)
is passed wherever `GameConfig` was previously used within the session.

---

## Amended: index.html module-level state

Two new variables added below existing `let session = null`:

```js
let selectedTimerIndex = 2; // index into TIMER_OPTIONS; 2 = 15 s (default)
```

`selectedTimerIndex` is updated by ◀/▶ button clicks and read when Play! is tapped.
It is NOT persisted directly — `setTimerPreference` is called on Play! only.

On page load, `selectedTimerIndex` is initialized from `getTimerPreference()` by finding
the matching index in `TIMER_OPTIONS`.

---

## Unchanged Exports

The following are **reused without modification**:

| Export | Why unchanged |
|--------|---------------|
| `GameConfig` | Immutable const; `getGameConfigForTimer` spreads it |
| `applyTimerBonus(timerTicks, config)` | Already reads `config.timerSeconds` and `config.timerBonusThreshold` dynamically |
| `generateRound(config)` | Timer-agnostic |
| `evaluateAnswer` | Timer-agnostic |
| `calculateStars` | Timer-agnostic |
| `updateStreak` | Timer-agnostic |
| `PracticeRanges`, `getPracticeConfig`, `getAccuracyTier`, `ENCOURAGING_MESSAGES` | Practice Mode — completely isolated |

---

## Entity Relationships

```
TIMER_OPTIONS (singleton, read-only)
     │
     ├─ display ─→ timer selector widget on #screen-start
     │                    │
     │             [◀/▶ navigation]
     │                    │
     │             selectedTimerIndex (in-memory)
     │                    │
     │             [Play! tapped]
     │                    │
     │             setTimerPreference(seconds)  ─→ localStorage
     │                    │
     └─ passed to ─→ getGameConfigForTimer(seconds)
                          │
                          └─→ session { timerTicks, config }
                                          │
                          applyTimerBonus(timerTicks, config)
                                          │
                                          └─→ bonusPts

getTimerPreference()  ←─ localStorage
     │
     └─→ selectedTimerIndex (on page load)
```
