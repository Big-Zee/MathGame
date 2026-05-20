# Research: Theme Picker

**Feature**: Theme Picker | **Branch**: `009-theme-picker` | **Date**: 2026-05-19

## Decision 1 — Module Architecture

**Decision**: New `js/theme-engine.js` ES module for THEMES data + pure storage logic. ThemeManager object in `index.html`'s `<script type="module">` for all DOM operations.

**Rationale**: Mirrors the `badge-engine.js` and `leaderboard-engine.js` pattern established in the project. The DOM-free module (`theme-engine.js`) is fully testable with `node:test` and a mock localStorage — identical to how badge and leaderboard engines are tested. DOM manipulation (CSS property setting, decoration layer updates) stays in `index.html` because it requires `document.documentElement` and live DOM access, which are not available in the Node test environment.

**Alternatives considered**:
- All logic inline in `index.html` — rejected: THEMES data + storage functions would be untestable
- ThemeManager as a separate module — rejected: ThemeManager needs DOM; extracting it to a module offers no testing benefit and adds an unnecessary file

---

## Decision 2 — FOUC (Flash of Unstyled Content) Prevention

**Decision**: A small synchronous inline `<script>` (not `type="module"`) placed in `<head>` reads `mathblaster_theme` from localStorage and immediately applies all 13 CSS variables via `document.documentElement.style.setProperty()` before the browser's first paint.

**Rationale**: ES modules are deferred — `<script type="module">` always executes after the HTML is parsed and the page has been laid out. A returning visitor who saved the Ocean theme would see a flash of the Space theme during load if we relied solely on the module. The inline synchronous script runs as soon as the parser reaches it in `<head>` — before any CSS is applied to the page — guaranteeing zero-flash. The inline script intentionally duplicates a minimal form of the THEMES vars (CSS variable strings only, no emoji/decorations); this is by design since modules cannot be used for pre-paint execution.

**Alternatives considered**:
- `DOMContentLoaded` handler in module — rejected: fires after paint; visible flash on slow connections
- CSS `@import` with theme files — rejected: would require multiple CSS files and build overhead
- No FOUC prevention — rejected: visible flash creates perception of broken UI for returning visitors

---

## Decision 3 — CSS Variable Expansion (13 variables per theme)

**Decision**: The 9 user-specified variables cover primary theming. Four additional semantic variables are added to each theme definition: `--color-text`, `--color-text-muted`, `--color-surface`, `--color-border`. Game-logic feedback colours (`--color-correct`, `--color-wrong`, `--color-timer-active`) are static `:root` constants, not overridden by themes.

**Rationale**: The existing `index.html` stylesheet contains ~25 hardcoded hex values. The 9 base vars + 4 supporting semantic vars (13 total) provide a complete mapping for all of them. The supporting vars encode design decisions that would otherwise need to be hardcoded:
- `--color-text`: body text colour (light on dark themes, e.g. `#E2E8F0`)
- `--color-text-muted`: secondary/hint text (lower contrast, e.g. `#94A3B8`)
- `--color-surface`: secondary interactive surface bg, hover states (e.g. `#1E2A3A`)
- `--color-border`: general UI dividers and input borders (e.g. `rgba(79,195,247,0.25)`)

Feedback colours are static because the spec explicitly prohibits changes to game logic and scoring feedback.

**Alternatives considered**:
- 9 variables only — rejected: ~10 hardcoded values would remain in CSS, defeating the refactor goal
- 20+ granular variables — rejected: over-engineering; 4 supporting vars cover all remaining cases

---

## Decision 4 — Button Hover State (no 14th variable)

**Decision**: Button hover and active states use CSS `filter: brightness(0.85)` applied to `--color-button-bg` rather than a separate `--color-button-bg-hover` per-theme variable.

**Rationale**: A `brightness(0.85)` darkening produces a consistent, visually appropriate hover feedback for any hue without requiring manual calculation or specification of 6 additional hex values. It degrades gracefully for accessibility (`prefers-reduced-motion` is unrelated to colour changes). The existing `--clr-primary-hover` is removed in the migration.

**Alternatives considered**:
- Per-theme hover variable — rejected: adds 6 more colour values to maintain with no benefit over filter
- No hover state — rejected: required for WCAG 2.4.11 (Focus Appearance, applied to button states)

---

## Decision 5 — Decorative Emoji Layer

**Decision**: A `<div id="decorations-layer">` placed as first child of `<body>`, `position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden`. Contains up to 9 `<span class="deco">` elements (3 emoji × 3 instances each) with semi-random positions and opacity 0.1–0.24. `<main>` has `position: relative; z-index: 1`.

**Rationale**: Fixed positioning guarantees the layer spans the full viewport on all screens without affecting layout flow. `z-index: 0` with `<main>` at `z-index: 1` ensures interactive content is always above the decorations. `pointer-events: none` is the critical spec constraint (FR-007). Three instances of each emoji with varying opacity/size creates visual depth without complex animation.

**Alternatives considered**:
- CSS `::before`/`::after` pseudo-elements — rejected: limited to 2 instances; cannot dynamically change emoji content with JavaScript
- Emoji in each `<section>` — rejected: would require 9× duplication; theme switching would need to update all copies
- CSS background-image with emoji — rejected: not supported cross-browser for emoji characters

---

## Decision 6 — Existing :root Variable Migration

**Decision**: All 9 existing `--clr-*` / `--radius` variables are replaced with `--color-*` equivalents. Migration map:

| Old variable | New variable | Nature |
|---|---|---|
| `--clr-bg` | `--color-bg-start` + `--color-bg-end` | Theme-driven (gradient pair) |
| `--clr-card` | `--color-card-bg` | Theme-driven |
| `--clr-primary` | `--color-primary` | Theme-driven |
| `--clr-primary-hover` | *(dropped — see Decision 4)* | Replaced by `filter: brightness()` |
| `--clr-correct` | `--color-correct` (static) | Game-logic (static) |
| `--clr-wrong` | `--color-wrong` (static) | Game-logic (static) |
| `--clr-timer` | `--color-timer-active` (static) | Game-logic (static) |
| `--clr-text` | `--color-text` | Theme-driven |
| `--clr-muted` | `--color-text-muted` | Theme-driven |
| `--radius` | `--border-radius-btn` | Theme-driven |

**Rationale**: Unified `--color-*` prefix makes it immediately clear in the CSS which variables exist. The migration is pure rename + split (bg gradient) — no semantic changes to any existing rule.

---

## CSS Variable Full Reference (per theme)

### Theme-driven variables (set by ThemeManager.apply + FOUC script)

| Variable | Purpose |
|---|---|
| `--color-bg-start` | Background gradient start (top) |
| `--color-bg-end` | Background gradient end (bottom) |
| `--color-primary` | Main UI accent, active highlights |
| `--color-accent` | Streak counter, secondary highlights |
| `--color-card-bg` | Question card and panel background |
| `--color-card-border` | Question card border / glow |
| `--color-button-bg` | Primary button fill |
| `--color-button-text` | Primary button label text |
| `--border-radius-btn` | Button corner radius (theme personality) |
| `--color-text` | Body text on dark backgrounds |
| `--color-text-muted` | Secondary / hint text |
| `--color-surface` | Secondary interactive surface, hover bg |
| `--color-border` | General dividers and input borders |

### Static variables (set once on :root, never overridden)

| Variable | Value | Purpose |
|---|---|---|
| `--color-correct` | `#16A34A` | Correct answer feedback (green) |
| `--color-wrong` | `#DC2626` | Wrong answer feedback (red) |
| `--color-timer-active` | `#F59E0B` | Timer bar and warning colour |
