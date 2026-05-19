# UI Contract: Theme Picker State Machine

**Feature**: Theme Picker | **Branch**: `009-theme-picker` | **Date**: 2026-05-19

## Screen Flow Integration

### How `screen-theme-picker` slots into existing routing

The Theme Picker is a leaf screen — it is only reachable from `screen-start`, and the only exit leads back to `screen-start`.

```
screen-start
  │
  │  [tap 🎨 Theme button]
  │  → renderThemePicker()
  │  → showScreen('screen-theme-picker')
  ▼
screen-theme-picker
  │
  ├─ [tap theme card]
  │    → ThemeManager.apply(themeId)
  │    → renderThemePicker()           (re-render — move checkmark)
  │    ↩ stay on screen-theme-picker
  │
  └─ [tap 🏠 Back to Menu]
       → showScreen('screen-start')
       ▼
     screen-start
```

### Theme Picker is NOT reachable from

- `screen-game` — no Theme button present
- `screen-results` — no Theme button present
- `screen-stop-summary` — no Theme button present
- `screen-leaderboard` — no Theme button present
- `screen-badges` — no Theme button present
- `screen-practice-op` / `screen-practice-diff` / `screen-practice-session` / `screen-practice-summary` — no Theme button present

---

## Theme Picker Screen State Machine

### States

| State | Description |
|---|---|
| `VIEWING` | All 6 theme cards are shown. Active card has `--color-accent` border + ✅ badge. |

*(There is only one state — the picker has no multi-step wizard or loading state.)*

### Events

| Event | Trigger | Side Effects | Screen Change |
|---|---|---|---|
| `OPEN` | Player taps 🎨 Theme on start screen | `renderThemePicker()` called, cards built | `showScreen('screen-theme-picker')` |
| `SELECT(id)` | Player taps a theme card | `ThemeManager.apply(id)` → CSS vars updated, localStorage saved, decorations refreshed, `renderThemePicker()` re-runs | Stay on `screen-theme-picker` |
| `SELECT_ACTIVE` | Player taps the currently active theme card | No change (idempotent) | Stay on `screen-theme-picker` |
| `BACK` | Player taps 🏠 Back to Menu | None | `showScreen('screen-start')` |

---

## Theme Card Component Contract

Each `.theme-card` rendered by `renderThemePicker()` must satisfy:

### DOM Structure

```html
<div class="theme-card [active]"
     role="button"
     tabindex="0"
     aria-label="Select {name} theme"
     aria-pressed="{true|false}"
     data-theme-id="{id}">

  <!-- Gradient swatch at top (40% height) -->
  <div class="swatch-strip"
       style="background: linear-gradient(to bottom, {bg-start}, {bg-end})">
    <!-- Active checkmark overlay -->
    <span class="theme-check" aria-hidden="true">✅</span>  <!-- hidden if not active -->
  </div>

  <!-- Colour dot row -->
  <div class="swatch-dots">
    <span class="swatch-dot" style="background: {primary}"></span>
    <span class="swatch-dot" style="background: {accent}"></span>
    <span class="swatch-dot" style="background: {card-bg}"></span>
  </div>

  <!-- Sample button -->
  <div class="sample-btn"
       style="background:{button-bg}; color:{button-text}; border-radius:{border-radius-btn}">
    {emoji} {name}
  </div>

  <!-- Theme label -->
  <p class="theme-name">{emoji} {name}</p>
</div>
```

### Behaviour Invariants

1. Exactly one card has `class="theme-card active"` and `aria-pressed="true"` at any time.
2. After `ThemeManager.apply(id)`, `renderThemePicker()` is called immediately — the new card is active on the same render cycle.
3. Cards respond to both `click` and `keydown` (Enter / Space).
4. Minimum card size: 44 × 44 CSS pixels (typically much larger in a 2-column grid).
5. `.swatch-strip` background uses inline style (not a CSS class) so it accurately reflects each theme's gradient without modifying CSS rules.
6. `.theme-check` spans are `aria-hidden="true"` — the active state is communicated via `aria-pressed` instead.

---

## CSS Grid Layout Contract

```css
#theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Narrow mobile breakpoint */
@media (max-width: 480px) {
  #theme-grid {
    grid-template-columns: 1fr;
  }
}
```

The 480px breakpoint is derived from the project's existing mobile-first layout patterns — not a new convention introduced by this feature.

---

## ThemeManager Public Interface

```
ThemeManager.getActive()   → string        — active theme id ("space" if none saved)
ThemeManager.getAll()      → Theme[]       — all 6 theme objects in definition order
ThemeManager.apply(id)     → void          — update CSS vars, save, refresh decorations
ThemeManager.init()        → void          — read saved theme and apply at startup
```

`ThemeManager.apply()` is the single source of truth for theme changes. No other code path should call `document.documentElement.style.setProperty()` for theme variables.
