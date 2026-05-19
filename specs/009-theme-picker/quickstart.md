# Quickstart: Theme Picker

**Feature**: Theme Picker | **Branch**: `009-theme-picker` | **Date**: 2026-05-19

## Running the Tests

```bash
node --test tests/theme-engine.test.js
```

Run all project tests:

```bash
node --test tests/
```

## Opening the Game

Open `index.html` directly in a browser (no server required):

```
file:///path/to/MathGame/index.html
```

Or serve with any static file server:

```bash
npx serve .
```

---

## Manual Test Scenarios

### Scenario 1 — Access Theme Picker from Start Screen (P1)

1. Open `index.html` — the Start screen is shown
2. Verify a "🎨 Theme" button is visible on the Start screen
3. Click "🎨 Theme"
4. **Expected**: Theme Picker screen opens, showing 6 preview cards in a 2-column grid
5. **Expected**: Each card shows: theme name + emoji, a gradient swatch strip (top), 3 colour dots, a sample button, and the theme name label
6. **Expected**: The Space theme card has a ✅ badge and gold border (it is the default)

---

### Scenario 2 — Select a Theme and See Live Preview (P2)

1. Open the Theme Picker (Scenario 1)
2. Click the "🌊 Ocean" card
3. **Expected**: The picker screen itself immediately transitions to Ocean colours (teal/blue gradient, aqua accents) within ~300 ms
4. **Expected**: The ✅ badge moves to the Ocean card; Space card loses its ✅
5. Click "🔥 Volcano"
6. **Expected**: Picker transitions to dark charcoal/red with orange accents; Volcano card now has ✅
7. Verify the transition is a smooth fade, not a snap (watch for gradual colour change)

---

### Scenario 3 — Theme Applies Across All Screens (P3)

1. Select "🌿 Jungle" in Theme Picker
2. Click "🏠 Back to Menu"
3. **Expected**: Start screen displays lime green primary colours, dark forest background
4. Start a game (any difficulty)
5. **Expected**: Game screen (question card, buttons, HUD) all show Jungle colours
6. Answer all questions, reach Results screen
7. **Expected**: Results screen shows Jungle colours
8. Click Leaderboard from Start screen
9. **Expected**: Leaderboard screen shows Jungle colours
10. Click Badges from Start screen
11. **Expected**: Badges screen shows Jungle colours
12. Enter Practice Mode
13. **Expected**: All practice screens (op picker, difficulty picker, session, summary) show Jungle colours

---

### Scenario 4 — Theme Persists Across Sessions (P4)

1. Select "🍬 Candy" in Theme Picker
2. Verify the game shows Candy colours (pink/magenta)
3. Close the browser tab entirely
4. Reopen `index.html` (fresh browser load)
5. **Expected**: Start screen opens directly in Candy theme — no flash of Space theme
6. Open Theme Picker
7. **Expected**: Candy card has ✅ checkmark

---

### Scenario 5 — Back to Menu Without Picking (P5)

1. Note the currently active theme (e.g., Space — default)
2. Click "🎨 Theme"
3. On the Theme Picker screen, do NOT click any card
4. Click "🏠 Back to Menu"
5. **Expected**: Start screen is shown, Space theme still active, nothing changed

---

### Scenario 6 — No Theme Button During Active Play (P6)

1. Start a game (click Start → choose difficulty)
2. **Expected**: Game screen has no "🎨 Theme" button anywhere
3. Answer a question (correct or wrong)
4. **Expected**: Still no Theme button visible
5. Let the game end → Results screen
6. **Expected**: Results screen has no Theme button

---

### Scenario 7 — Default Theme on First Visit (Edge Case)

1. Open browser DevTools → Application → Local Storage
2. Delete the `mathblaster_theme` key (or clear all storage)
3. Reload `index.html`
4. **Expected**: Game opens in Space theme
5. Open Theme Picker
6. **Expected**: Space card has ✅ checkmark

---

### Scenario 8 — prefers-reduced-motion (Accessibility)

1. In OS settings (or DevTools → Rendering → Emulate CSS media), enable `prefers-reduced-motion: reduce`
2. Open Theme Picker and click a different theme
3. **Expected**: Theme change is instantaneous (no 300ms fade) — colour snap is acceptable under reduced-motion preference
4. **Expected**: Game remains fully functional

---

## Checking WCAG Contrast

For each theme, verify text on card background meets 4.5:1:

1. In DevTools → Elements, inspect `--color-text` and `--color-card-bg` on `:root`
2. Use the browser's accessibility panel or an online contrast checker (e.g., webaim.org/resources/contrastchecker)
3. Enter foreground = `--color-text` value, background = `--color-card-bg` value
4. **Expected**: Ratio ≥ 4.5:1 for all 6 themes

Reference values (from data-model.md):

| Theme | `--color-text` | `--color-card-bg` | Expected ratio |
|---|---|---|---|
| Space | `#E2E8F0` | `#1E2A3A` | ≥ 4.5:1 |
| Ocean | `#E0F7FA` | `#0D2B2E` | ≥ 4.5:1 |
| Jungle | `#F1F8E9` | `#132B12` | ≥ 4.5:1 |
| Volcano | `#FBE9E7` | `#1F1F1F` | ≥ 4.5:1 |
| Candy | `#FCE4EC` | `#2A0F1F` | ≥ 4.5:1 |
| Midnight | `#ECEFF1` | `#0A0A0A` | ≥ 4.5:1 |
