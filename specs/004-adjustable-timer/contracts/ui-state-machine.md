# Contract: UI State Machine (Adjustable Timer Amendment)

**Amends**: `specs/001-math-quiz-game/contracts/ui-state-machine.md`
**Rendered by**: `index.html` (inline `<script type="module">`)
**Managed via**: CSS `display` toggling via existing `showScreen(id)` utility

---

## Screens — Unchanged

The state machine is **unchanged**. No new screens are added.

| Screen ID | Visible when |
|-----------|-------------|
| `#screen-start` | Initial load; after Play Again; after Back to Start (Practice) |
| `#screen-game` | Main quiz round in progress |
| `#screen-results` | Main quiz round complete |
| `#screen-practice-*` | Practice Mode (unchanged) |

---

## Amendments to `#screen-start`

The timer selector widget is added **within** `#screen-start`, between the rules list and the Play! button.

### New elements on Start screen

| Element | ID | Content / Role |
|---------|----|----------------|
| Timer selector container | `#timer-selector` | `role="group"` with `aria-labelledby="timer-selector-label"` |
| Selector label | `#timer-selector-label` | "⏱️ How much time per question?" |
| Previous button | `#btn-timer-prev` | ◀ (`aria-label="Previous timer option"`) |
| Current value display | `#timer-value-display` | e.g. "15s" |
| Current label display | `#timer-label-display` | e.g. "Normal 🎯" |
| Next button | `#btn-timer-next` | ▶ (`aria-label="Next timer option"`) |

### Interaction contract

- `#btn-timer-prev` click: decrement `selectedTimerIndex` (wrap 0 → 5); update `#timer-value-display` and `#timer-label-display`
- `#btn-timer-next` click: increment `selectedTimerIndex` (wrap 5 → 0); update `#timer-value-display` and `#timer-label-display`
- Both buttons: minimum 44×44 CSS px target size; focusable via Tab; activatable via Enter/Space
- On page load: initialise from `getTimerPreference()`, find matching index, render immediately
- On `#btn-play` click: call `setTimerPreference(TIMER_OPTIONS[selectedTimerIndex].seconds)` before `startGame()`

---

## Amendments to `#screen-game`

One new element added to the game HUD, adjacent to the countdown bar:

| Element | ID | Content |
|---------|----|---------|
| Timer HUD label | `#timer-hud-label` | "⏱️ Xs" where X = selected seconds; e.g. "⏱️ 15s" |

`#timer-hud-label` is set once when `startGame()` renders the first question; it does not change
during the round. `aria-hidden="true"` — it is decorative; the countdown bar already has
`aria-label="Time remaining"`.

---

## startGame() signature amendment

```js
// Before:
function startGame()

// After:
function startGame(timerOption)
```

`timerOption` is `TIMER_OPTIONS[selectedTimerIndex]`. Inside `startGame`:
- `session.timerTicks = timerOption.seconds * 10`
- The derived config (`getGameConfigForTimer(timerOption.seconds)`) replaces direct `GameConfig`
  references for `applyTimerBonus` and `startTimer`/`updateTimerBar`
- `#timer-hud-label` is set to `⏱️ ${timerOption.seconds}s`

---

## Keyboard Navigation (Timer Selector)

| Key | Element | Action |
|-----|---------|--------|
| `Tab` | `#btn-timer-prev`, `#btn-timer-next` | Move focus between controls |
| `Enter` / `Space` | `#btn-timer-prev` or `#btn-timer-next` | Activate (same as click) |

Focus order on Start screen: existing elements → `#btn-timer-prev` → `#btn-timer-next` → `#btn-play`.

---

## ARIA (Timer Selector)

| Element | Role / Attribute |
|---------|-----------------|
| `#timer-selector` | `role="group"` `aria-labelledby="timer-selector-label"` |
| `#timer-value-display`, `#timer-label-display` | `aria-live="polite"` `aria-atomic="true"` — updates announced when value changes |
| `#btn-timer-prev` | `aria-label="Previous timer option"` |
| `#btn-timer-next` | `aria-label="Next timer option"` |
| `#timer-hud-label` | `aria-hidden="true"` (decorative — countdown bar provides accessible timing info) |
