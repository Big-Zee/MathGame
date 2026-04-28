# Contract: UI State Machine

**Rendered by**: `index.html` (inline `<script>`)
**Managed via**: CSS `display` toggling on screen `<section>` elements + JS state object

---

## Screens

The app renders exactly one screen visible at a time. Each screen is a `<section>` with a
unique `id`. Inactive screens have `display: none`.

| Screen ID | Visible when | Heading |
|-----------|-------------|---------|
| `#screen-start` | Initial load; after "Play Again" | `<h1>` MathGame |
| `#screen-game` | Round in progress | `<h2>` Question N of 10 |
| `#screen-results` | Round complete (all questions answered or lives = 0) | `<h2>` Round Complete |

---

## State Transitions

```
                    ┌──────────────────────────────┐
                    │                              │
         [Page load]│                   [Play Again]│
                    ▼                              │
             ┌─────────────┐                       │
             │  START      │                       │
             │  #screen-   │                       │
             │  start      │                       │
             └──────┬──────┘                       │
                    │ [Player taps "Play"]          │
                    ▼                              │
             ┌─────────────┐                       │
             │  QUESTION   │◄──────────────────┐   │
             │  #screen-   │  [Auto-advance     │   │
             │  game       │   after 1 000ms]   │   │
             │  phase=     │                    │   │
             │  'question' │                    │   │
             └──────┬──────┘                    │   │
                    │                           │   │
         ┌──────────┴──────────┐                │   │
         │ [Player taps choice]│                │   │
         │ OR [timer expires]  │                │   │
         ▼                     ▼                │   │
   ┌───────────┐         ┌───────────┐          │   │
   │ FEEDBACK  │         │ FEEDBACK  │          │   │
   │ (correct) │         │ (wrong)   │          │   │
   │ phase=    │         │ phase=    │          │   │
   │ 'feedback'│         │ 'feedback'│          │   │
   └─────┬─────┘         └─────┬─────┘          │   │
         │                     │                │   │
         │ more questions?     │                │   │
         └──────────────────►──┘                │   │
                    │                           │   │
              [questionIndex < 10               │   │
               AND lives > 0]──────────────────►┘   │
                    │                               │
              [questionIndex >= 10                  │
               OR lives === 0]                      │
                    │                               │
                    ▼                               │
             ┌─────────────┐                        │
             │  RESULTS    │                        │
             │  #screen-   │                        │
             │  results    │                        │
             └──────┬──────┘                        │
                    └───────────────────────────────┘
```

---

## QUESTION Phase Behaviour

Triggers when `phase` transitions to `'question'`:

1. Render question text: `{a} {symbol} {b} = ?`
2. Render 4 choice buttons (enabled, keyboard-focusable)
3. Start `setInterval` countdown: `timerTicks = 100` → decrement 1 every 100ms
4. Render timer bar width as `timerTicks%`
5. Focus first choice button (keyboard accessibility)

---

## FEEDBACK Phase Behaviour

Triggers on player tap or timer expiry:

1. Clear `setInterval` timer
2. Disable all choice buttons (`disabled` attribute + `aria-disabled="true"`)
3. If correct:
   - Highlight chosen button green
   - Show positive emoji (e.g., `🎉` with `aria-label="Correct!"`)
   - Update score display
4. If wrong or timer expired:
   - Highlight chosen button red (or all red if timer)
   - Highlight correct-answer button green
   - Show negative emoji (e.g., `😬` with `aria-label="Wrong!"`)
   - Decrement `lives`; update heart display
5. After 1 000ms delay: advance to next question or transition to RESULTS

---

## RESULTS Screen Content

| Element | Content |
|---------|---------|
| Star rating | 1–3 filled star icons with `aria-label="N stars out of 3"` |
| Score | "You scored **N** points" |
| Correct count | "**N** out of 10 correct" |
| High score | "Best: **N** pts" + "🏆 New high score!" if `newHighScore === true` |
| Play Again button | Resets session and transitions to START |

---

## Keyboard Navigation Contract

| Key | Screen | Action |
|-----|--------|--------|
| `Tab` / `Shift+Tab` | All | Cycle focus through interactive elements |
| `Enter` / `Space` | Any button | Activate button |
| No other key bindings required for v1 | | |

Focus MUST be set programmatically when transitioning between screens to prevent keyboard
users from losing context.

---

## ARIA Roles & Landmarks

| Element | Role / Attribute |
|---------|-----------------|
| `<main>` | `role="main"` |
| Timer bar | `role="progressbar"` `aria-valuenow="{timerTicks}"` `aria-valuemin="0"` `aria-valuemax="100"` `aria-label="Time remaining"` |
| Hearts container | `aria-label="Lives remaining: {lives}"` |
| Choice buttons | `aria-pressed="false"` (default); `aria-pressed="true"` when selected |
| Emoji feedback | `aria-live="polite"` container; emoji span has `aria-label` |
| Results heading | `role="heading"` `aria-level="2"` |
