# Implementation Plan: Theme Picker

**Branch**: `009-theme-picker` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/009-theme-picker/spec.md`

## Summary

Add a Theme Picker feature to Math Blaster that lets children choose from 6 named colour themes (Space, Ocean, Jungle, Volcano, Candy, Midnight), apply the chosen theme instantly across all game screens, and persist the preference in browser storage. The implementation introduces a new `js/theme-engine.js` ES module (THEMES data + pure storage logic, TDD-covered) and a `ThemeManager` object in `index.html`'s existing `<script type="module">` block (CSS property setter + decoration manager). A synchronous inline `<script>` in `<head>` prevents flash-of-unstyled-content for returning visitors. A new `screen-theme-picker` section slots into the existing `showScreen()` routing with no structural changes.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES modules), HTML5, CSS3  
**Primary Dependencies**: None — zero external runtime dependencies  
**Storage**: Browser localStorage; one new key — `mathblaster_theme` (string); existing keys `mathblaster_leaderboard`, `mathblaster_leaderboard_stats`, `mathblaster_last_player_name`, `mathblaster_badges`, `mathblaster_timer_preference` are untouched  
**Testing**: Node.js built-in `node:test` module; same mock localStorage pattern as `badges.test.js` and `leaderboard-engine.test.js`  
**Target Platform**: Browser — Azure Static Web Apps free tier (static files only)  
**Project Type**: Static single-page web application (`index.html` + relative ES modules)  
**Performance Goals**: Theme change visible within 300 ms; all CSS variable and localStorage operations complete synchronously in < 10 ms  
**Constraints**: Offline-capable, no build step, no bundler, no framework, no server runtime; `index.html` is sole deployable entry point  
**Scale/Scope**: 6 themes; 9 primary CSS variables per theme + 4 supporting variables; 1 new screen; 1 new ES module; 1 new test file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ Pass | Visual personalisation increases engagement and return visits, directly supporting math practice time. No educational mechanics altered. |
| II. Kid-Friendly Design | ✅ Pass (conditional) | Theme preview cards MUST be ≥ 44 × 44 CSS pixels (WCAG 2.5.5). Back button and card labels MUST use plain language at or below 4th-grade level. No hover-only affordances. Transitions MUST respect `prefers-reduced-motion` (see FR-005). |
| III. Accessibility WCAG 2.1 AA | ✅ Pass (conditional) | All 6 themes MUST pass 4.5:1 contrast ratio for body text on card backgrounds (FR-012/SC-005). Accessibility audit task MUST appear in Phase F. Theme cards MUST have `aria-label` and keyboard focus indicators. |
| IV. Test-First | ✅ Pass | `tests/theme-engine.test.js` written before `js/theme-engine.js` is implemented. All exported functions covered. |
| V. Incremental Delivery | ✅ Pass | 6 independently testable user stories (P1 → P6). P1 + P2 alone (navigation + apply) deliver standalone value; persistence, cross-screen, and polish follow independently. |
| VI. Immediate Feedback | ✅ Pass | Theme change visible on screen within 300 ms of tap (FR-005/SC-004). Active card checkmark updates instantly. |
| VII. Deployment Integrity | ✅ Pass | New module imported via `./js/theme-engine.js` relative path; no bundler; `.github/workflows/` untouched; `index.html` remains the sole entry point. |

**No violations.** Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/009-theme-picker/
├── plan.md                        # This file
├── research.md                    # Phase 0 output
├── data-model.md                  # Phase 1 output
├── quickstart.md                  # Phase 1 output
├── contracts/
│   └── ui-state-machine.md        # Phase 1 output
└── tasks.md                       # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code

```text
index.html                         # All UI: new <section id="screen-theme-picker">,
                                   #   🎨 Theme button on screen-start,
                                   #   updated :root CSS variables (refactor all
                                   #   hardcoded hex values to CSS vars),
                                   #   FOUC-prevention inline <script> in <head>,
                                   #   ThemeManager object + event wiring in
                                   #   existing <script type="module"> block

js/
├── math-engine.js                 # Unchanged
├── badge-engine.js                # Unchanged
├── leaderboard-engine.js          # Unchanged
└── theme-engine.js                # NEW — THEMES data + pure storage functions (no DOM)

tests/
├── math-engine.test.js            # Unchanged
├── badges.test.js                 # Unchanged
├── leaderboard-engine.test.js     # Unchanged
└── theme-engine.test.js           # NEW — TDD, written before implementation
```

**Structure Decision**: Follows the established single-project layout. One new module (`theme-engine.js`) mirrors the `badge-engine.js` and `leaderboard-engine.js` pattern: pure functions + data, `globalThis.localStorage` access, no DOM dependency, fully testable without a browser. All DOM manipulation (CSS property setting, decorations, screen rendering) remains in `index.html`.

---

## Phase 0: Research Findings

*See [research.md](./research.md) for full detail. Key decisions summarised here.*

### Decision 1 — Module Architecture

**Chosen**: `js/theme-engine.js` exports THEMES data + pure functions (getTheme, getAllThemes, getActiveThemeId, saveActiveThemeId). ThemeManager object in `index.html` handles all DOM operations.  
**Rationale**: Keeps testable logic DOM-free (node:test compatible). Follows badge-engine and leaderboard-engine patterns exactly.

### Decision 2 — FOUC Prevention

**Chosen**: A small synchronous inline `<script>` (not type="module") placed in `<head>` reads `mathblaster_theme` from localStorage and immediately calls `document.documentElement.style.setProperty()` for all 13 CSS variables before first paint.  
**Rationale**: ES modules (`type="module"`) are deferred by the browser — they cannot prevent flash of default theme. A synchronous inline script runs before any paint. This script is intentionally duplicated/minimal (no shared code with theme-engine.js); it is a one-time page-load guard, not feature logic.

### Decision 3 — CSS Variable Expansion

**Chosen**: The 9 user-specified variables (`--color-bg-start` … `--border-radius-btn`) cover primary theming. Four additional per-theme semantic variables cover the remaining hardcoded values: `--color-text`, `--color-text-muted`, `--color-surface`, `--color-border`. Game-logic feedback colors (`--color-correct`, `--color-wrong`, `--color-timer-active`) are defined as static `:root` constants — not overridden by themes.  
**Rationale**: The existing CSS contains ~25 hardcoded hex values. The 9 base vars + 4 supporting vars (13 total) map all of them. Feedback colors are left static to honour the spec constraint that game logic is unchanged.

### Decision 4 — Hover State

**Chosen**: Button hover/active states use CSS `filter: brightness(0.85)` applied on top of `--color-button-bg`, rather than a 14th theme variable.  
**Rationale**: Keeps the theme definition lean. `filter: brightness()` produces a consistent darkening effect across all theme colours without requiring manual per-theme hover colour computation.

### Decision 5 — Decorative Emoji Layer

**Chosen**: A `<div id="decorations-layer">` placed as a direct child of `<body>` (sibling to `<main>`), with `position: fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`. Contains up to 9 `<span>` elements (3 emoji × 3 instances, varied position/opacity/size). ThemeManager.updateDecorations() clears and rebuilds this layer on each theme apply.  
**Rationale**: `<main>` gets `position: relative; z-index: 1` so all interactive content always renders above the fixed layer. Fixed positioning ensures full-viewport coverage regardless of scroll state.

### Decision 6 — Existing :root Variable Migration

**Chosen**: All 9 existing `--clr-*` variables are replaced. Mapping: `--clr-primary` → `--color-primary`, `--clr-card` → `--color-card-bg`, `--clr-bg` → `--color-bg-start`/`--color-bg-end` (gradient), `--radius` → `--border-radius-btn`, `--clr-text` → `--color-text`, `--clr-muted` → `--color-text-muted`, `--clr-correct` → `--color-correct` (static), `--clr-wrong` → `--color-wrong` (static), `--clr-timer` → `--color-timer-active` (static). `--clr-primary-hover` dropped in favour of `filter: brightness()`.  
**Rationale**: Unified `--color-*` prefix simplifies maintenance and makes it immediately clear which variables are theme-driven vs. static.

---

## Phase 1: Design

### Data Model

*See [data-model.md](./data-model.md) for full field-level detail.*

Two entities:

- **Theme** — 6 instances (space, ocean, jungle, volcano, candy, midnight). Each has: id, name, emoji, 13-variable `vars` object, 3-element `decorations` array.
- **ThemePreference** — single localStorage string (`mathblaster_theme`). Default `"space"` when absent or unrecognised.

### Contracts

*See [contracts/ui-state-machine.md](./contracts/ui-state-machine.md) for full state diagrams.*

One contract defined:

1. **Theme Picker screen flow + state machine** — how `screen-theme-picker` integrates into existing routing and the card selection/back navigation flow.

### Implementation Phases

#### Phase A — Theme Engine (TDD)

**Prerequisite**: None (pure module, no DOM).  
**Tests-first**: Write `tests/theme-engine.test.js` covering all exported functions.  
**Then implement**: `js/theme-engine.js`.

Exported symbols:

| Export | Purpose |
|--------|---------|
| `THEMES` | Object map `{ space: {...}, ocean: {...}, … }` — all 6 theme definitions |
| `getTheme(id)` | Returns theme object for given id; throws if id unknown |
| `getAllThemes()` | Returns array of all 6 theme objects |
| `getActiveThemeId()` | Reads `mathblaster_theme` from localStorage; returns `"space"` if absent/unrecognised |
| `saveActiveThemeId(id)` | Writes theme id to `mathblaster_theme` in localStorage |

Test coverage required:

- THEMES completeness: all 6 ids present, each has all 13 CSS variable keys, valid emoji, 3-element decorations array
- `getTheme` — known id returns correct object; unknown id throws
- `getActiveThemeId` — returns `"space"` when localStorage empty; returns saved value; returns `"space"` on unrecognised value
- `saveActiveThemeId` — writes correct key; subsequent `getActiveThemeId` returns saved value

#### Phase B — CSS Refactor

**Prerequisite**: Phase A complete (variable names confirmed).  
**Scope**: `index.html` stylesheet block only — no logic changes.

Changes:

1. Remove all 9 existing `--clr-*` / `--radius` declarations from `:root`
2. Add 13 new CSS variable declarations to `:root` for the Space theme defaults (the synchronous inline script will override these at runtime for non-Space users)
3. Add static variables to `:root`: `--color-correct: #16A34A`, `--color-wrong: #DC2626`, `--color-timer-active: #F59E0B`
4. Add `:root { transition: all 300ms ease; }` — plus `@media (prefers-reduced-motion: reduce) { :root { transition: none; } }`
5. Add `#decorations-layer` CSS: `position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;` with child `.deco` styles
6. Add `main { position: relative; z-index: 1; }` to ensure interactive content always renders above the decoration layer
7. Replace all ~25 hardcoded hex values in the CSS with the appropriate `--color-*` variable references
8. Update all `--clr-*` references in existing CSS rules to `--color-*` equivalents

#### Phase C — ThemeManager + FOUC Prevention

**Prerequisite**: Phase B complete (CSS variable names are stable).

Changes to `index.html`:

1. **FOUC prevention** — add inline `<script>` in `<head>` (synchronous, not type="module"):
   ```
   (function() {
     var THEME_VARS = { space: { ... }, ocean: { ... }, ... };
     var id = (localStorage.getItem('mathblaster_theme') || 'space');
     if (!THEME_VARS[id]) id = 'space';
     var vars = THEME_VARS[id];
     var root = document.documentElement;
     Object.keys(vars).forEach(function(k) { root.style.setProperty(k, vars[k]); });
   })();
   ```
   This script contains a minimal inline copy of each theme's 13 CSS vars (no emoji, no decorations — only the properties needed to style the page before paint).

2. **ThemeManager object** — add to `<script type="module">` block:

   ```
   const ThemeManager = {
     getActive()  { return getActiveThemeId(); },
     getAll()     { return getAllThemes(); },
     apply(id) {
       const theme = getTheme(id);
       const root = document.documentElement;
       Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
       saveActiveThemeId(id);
       this.updateDecorations(theme.decorations);
     },
     init() {
       const id = this.getActive();
       this.apply(id);
     },
     updateDecorations(emojis) {
       const layer = document.getElementById('decorations-layer');
       layer.innerHTML = '';
       const positions = [ [10,15],[25,60],[50,20],[70,75],[80,35],[15,80],[60,50],[90,10],[40,90] ];
       emojis.forEach((em, i) => {
         for (let j = 0; j < 3; j++) {
           const span = document.createElement('span');
           span.className = 'deco';
           const pos = positions[i * 3 + j];
           span.style.cssText = `left:${pos[0]}%;top:${pos[1]}%;opacity:${0.1 + j * 0.07};font-size:${1.2 + j * 0.4}rem;`;
           span.textContent = em;
           layer.appendChild(span);
         }
       });
     }
   };
   ```

3. Call `ThemeManager.init()` inside the DOMContentLoaded event handler (at the beginning, before any screen renders). The inline FOUC script handles pre-paint; ThemeManager.init() reconciles decorations after DOM is ready.

4. Add `<div id="decorations-layer"></div>` as first child of `<body>` (before `<main>`).

#### Phase D — Theme Picker Screen UI

**Prerequisite**: Phase C complete.

Changes to `index.html`:

1. Add `<section id="screen-theme-picker" hidden>` after `section#screen-badges`:
   ```html
   <section id="screen-theme-picker" hidden>
     <h1>🎨 Choose Your Theme</h1>
     <div id="theme-grid"></div>
     <button id="btn-theme-back" class="btn-secondary">🏠 Back to Menu</button>
   </section>
   ```

2. Add `renderThemePicker()` function to the `<script type="module">` block:
   - Calls `ThemeManager.getAll()` to get all 6 themes
   - Reads `ThemeManager.getActive()` for active id
   - Clears `#theme-grid` and rebuilds 6 `.theme-card` elements:
     - Card HTML: gradient swatch div, 3 colour dots (`<span class="swatch-dot">`), sample button, theme name
     - Active card: adds `.active` class (gold border + ✅ badge overlay)
   - Wires each card: `card.addEventListener('click', () => { ThemeManager.apply(id); renderThemePicker(); })`
   - Each card `aria-label`: `"Select {name} theme"`, `role="button"`, `tabindex="0"`, `aria-pressed` for active state

3. Add CSS for `#theme-grid`, `.theme-card`, `.swatch-strip`, `.swatch-dot`, `.theme-card.active`, `.theme-check` badge overlay — responsive: 2 columns default, 1 column at narrow breakpoint.

4. Wire `#btn-theme-back`: `showScreen('screen-start')`

#### Phase E — Start Screen Integration

**Prerequisite**: Phase D complete.

Changes to `index.html`:

1. Add `<button id="btn-open-theme" class="btn-secondary">🎨 Theme</button>` to `<section id="screen-start">` (below existing buttons, above footer if present)

2. Wire button: `document.getElementById('btn-open-theme').addEventListener('click', () => { renderThemePicker(); showScreen('screen-theme-picker'); })`

3. **Do NOT** add any theme button or route to `screen-theme-picker` on any other screen (screen-game, screen-results, screen-stop-summary, screen-leaderboard, screen-badges, screen-practice-*)

#### Phase F — Polish & Accessibility Audit

**Prerequisite**: All prior phases complete.

- **WCAG contrast audit**: For each of the 6 themes, verify `--color-text` on `--color-card-bg` meets 4.5:1 minimum. Document results.
- **Touch targets**: All `.theme-card` elements ≥ 44 × 44 CSS pixels. `#btn-open-theme` and `#btn-theme-back` ≥ 44 × 44 px.
- **Keyboard navigation**: Theme cards respond to Enter/Space keypress (same handler as click). Focus visible on all interactive elements.
- **`prefers-reduced-motion`**: Verify `:root { transition: none; }` media query is applied — theme changes should be instant on affected devices.
- **Screen reader**: `#theme-grid` has `role="list"`, each card has `role="listitem"`. Active card `aria-pressed="true"`. Back button has descriptive label.
- **Edge cases**: localStorage unavailable (private browsing) → getActiveThemeId falls back to `"space"`, apply() catches localStorage write errors silently. Rapid card taps → final theme applied, no inconsistent state.
- **Decoration overlap**: Visual check that `.deco` spans never obscure any button, input, or text across all 6 themes on mobile and desktop.

---

## Quickstart

*See [quickstart.md](./quickstart.md) for manual test scenarios.*
