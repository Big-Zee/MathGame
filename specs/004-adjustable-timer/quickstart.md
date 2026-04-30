# Quickstart: Adjustable Timer

**Branch**: `004-adjustable-timer` | **Date**: 2026-04-30

For general setup (local server, deployment, base unit tests) see
[`specs/001-math-quiz-game/quickstart.md`](../001-math-quiz-game/quickstart.md).
This file covers Adjustable Timer-specific development and testing steps.

---

## Run the game locally

```bash
python -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080`. The Start screen should show the timer selector
with 15 seconds pre-selected and label "Normal 🎯".

---

## Timer selector smoke test (manual)

1. Load the Start screen — verify timer shows "15s · Normal 🎯" by default.
2. Tap ▶ — verify "20s · Relaxed 😊" is shown.
3. Tap ▶ four more times — verify sequence: 25s, 30s, 5s (wrap), 10s.
4. Tap ◀ — verify wraps back to 5s → 30s.
5. Select 10s, tap ▶ Play! — verify game starts.
6. Verify countdown bar empties in exactly 10 seconds.
7. Answer a question within 5 seconds — verify speed bonus (⚡) appears.
8. Let timer expire — verify time-out fires at exactly 10 seconds.
9. After round ends, reload page — verify 10s is still pre-selected.
10. Select 15s and play — verify unchanged classic behaviour (15s countdown, ~7s bonus threshold).

---

## Unit tests for new math-engine.js exports

Run all tests:

```bash
node --test tests/math-engine.test.js
```

Expected new test cases (written **before** implementation per Constitution IV):

```
▶ TIMER_OPTIONS
  ✔ has exactly 6 entries (Xms)
  ✔ index 2 has seconds === 15 (the default) (Xms)
  ✔ entries are ordered ascending by seconds (Xms)
  ✔ all entries have non-empty label strings (Xms)
▶ getGameConfigForTimer
  ✔ returns config with timerSeconds matching input (Xms)
  ✔ bonusThreshold === Math.floor(seconds * 0.5) for all 6 values (Xms)
  ✔ all other GameConfig fields are unchanged (Xms)
  ✔ applyTimerBonus works correctly with getGameConfigForTimer(5) (Xms)
  ✔ applyTimerBonus works correctly with getGameConfigForTimer(30) (Xms)
▶ getTimerPreference
  ✔ returns 15 when localStorage is empty (Xms)
  ✔ returns saved value when a valid seconds value is stored (Xms)
  ✔ returns 15 for an invalid stored value (Xms)
  ✔ returns 15 for a non-numeric stored value (Xms)
```

All existing tests (56) must still pass — backward-compatibility is confirmed by
`GameConfig.timerSeconds` remaining 15 and all prior test assertions unchanged.

---

## Key IDs for browser testing

| ID | Element |
|----|---------|
| `#timer-selector` | Timer selector group container |
| `#timer-selector-label` | "⏱️ How much time per question?" label |
| `#btn-timer-prev` | ◀ Previous option button |
| `#btn-timer-next` | ▶ Next option button |
| `#timer-value-display` | Current seconds value (e.g. "15s") |
| `#timer-label-display` | Current option label (e.g. "Normal 🎯") |
| `#timer-hud-label` | In-game HUD label (e.g. "⏱️ 15s") |

---

## Accessibility check (Timer Selector)

1. Tab to `#btn-timer-prev` — verify focus ring visible.
2. Press Enter — verify value changes.
3. Tab to `#btn-timer-next` — verify focus ring.
4. Press Space — verify value changes.
5. Verify `#timer-value-display` and `#timer-label-display` have `aria-live="polite"`.
6. Verify `#timer-selector` has `role="group"` with `aria-labelledby="timer-selector-label"`.
7. Verify both ◀/▶ buttons are ≥ 44×44 CSS px.
