# Tasks: Theme Picker

**Input**: Design documents from `/specs/009-theme-picker/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Maps to user story from spec.md (US1–US6)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup

**Purpose**: Create empty file stubs so Phase 2 test tasks can reference them immediately.

- [ ] T001 Create js/theme-engine.js as an empty ES module stub (single line: `export {};`)
- [ ] T002 Create tests/theme-engine.test.js as an empty Node test file (import node:test, empty describe block)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme engine module (TDD) and CSS variable infrastructure that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Theme Engine — Tests First (TDD)

> **MANDATORY**: Write all tests (T003–T007) and confirm they FAIL (T008) BEFORE writing any implementation.

- [ ] T003 [P] Write failing test for THEMES data completeness in tests/theme-engine.test.js: import THEMES, verify 6 keys (space/ocean/jungle/volcano/candy/midnight), each entry has all 13 CSS var keys (--color-bg-start, --color-bg-end, --color-primary, --color-accent, --color-card-bg, --color-card-border, --color-button-bg, --color-button-text, --border-radius-btn, --color-text, --color-text-muted, --color-surface, --color-border), non-empty emoji string, exactly-3-element decorations array
- [ ] T004 [P] Write failing tests for getTheme() in tests/theme-engine.test.js: getTheme('space') returns object with id 'space'; getTheme('unknown') throws an error
- [ ] T005 [P] Write failing tests for getAllThemes() in tests/theme-engine.test.js: returns an array of exactly 6 objects; each object has an id property
- [ ] T006 [P] Write failing tests for getActiveThemeId() in tests/theme-engine.test.js: returns 'space' when localStorage is empty; returns saved value when mathblaster_theme key exists; returns 'space' when key contains unrecognised string; use mock localStorage (same pattern as badges.test.js)
- [ ] T007 [P] Write failing tests for saveActiveThemeId() in tests/theme-engine.test.js: after saveActiveThemeId('ocean'), getActiveThemeId() returns 'ocean'; confirms mathblaster_theme key is written with correct value
- [ ] T008 Confirm all theme-engine tests FAIL: run `node --test tests/theme-engine.test.js` and verify failures (proves tests are meaningful before implementation)

### Theme Engine — Implementation (after T008 confirms failures)

- [ ] T009 Implement THEMES constant as default-less named export in js/theme-engine.js: object map with all 6 theme definitions (space, ocean, jungle, volcano, candy, midnight), each containing id, name, emoji, 13-entry vars object (exact values from data-model.md), and 3-element decorations array
- [ ] T010 Implement getTheme(id), getAllThemes(), getActiveThemeId(), saveActiveThemeId(id) as named exports in js/theme-engine.js: getTheme throws on unknown id; getActiveThemeId uses `globalThis.localStorage?.getItem('mathblaster_theme')` and defaults to 'space' on absent/unrecognised value; saveActiveThemeId uses `globalThis.localStorage?.setItem('mathblaster_theme', id)`
- [ ] T011 Verify all theme-engine tests pass: run `node --test tests/theme-engine.test.js` (all tests must be green before proceeding)

### CSS Variable Foundation

- [ ] T012 [P] CSS refactor in index.html: replace entire :root block — remove all 9 existing `--clr-*` variables and `--radius`; add all 13 theme-driven CSS variables with Space theme default values from data-model.md Space entry (--color-bg-start: #0D0D2B, --color-bg-end: #1A0533, --color-primary: #4FC3F7, --color-accent: #CE93D8, --color-card-bg: #1E2A3A, --color-card-border: #4FC3F7, --color-button-bg: #4FC3F7, --color-button-text: #0D0D2B, --border-radius-btn: 12px, --color-text: #E2E8F0, --color-text-muted: #94A3B8, --color-surface: #253548, --color-border: rgba(79,195,247,0.25))
- [ ] T013 [P] CSS refactor in index.html: add 3 static game-logic variables to :root immediately after theme vars: `--color-correct: #16A34A; --color-wrong: #DC2626; --color-timer-active: #F59E0B;`
- [ ] T014 CSS refactor in index.html: replace all ~25 hardcoded hex colour values in stylesheet rules with their CSS variable equivalents — migration map: `#2563EB`/`#1D4ED8` → `var(--color-primary)`, `#FFFFFF`/`#FFF8E7`/`#F8FAFC`/`#F1F5F9` → `var(--color-card-bg)` or `var(--color-surface)`, `#E2E8F0`/`#CBD5E1` → `var(--color-border)`, `#1E293B` → `var(--color-text)`, `#64748B` → `var(--color-text-muted)`, `#DBEAFE`/`#EFF6FF`/`#BF DBFE` → `var(--color-surface)`, `#16A34A`/`#DCFCE7` → `var(--color-correct)`, `#DC2626`/`#FEE2E2`/`#FECACA` → `var(--color-wrong)`, `#F59E0B`/`#C2410C`/`#FFF7ED` → `var(--color-timer-active)`, `#CA8A04`/`#FEF9C3`/`#F0FDF4` → `var(--color-accent)`, `#78350F`/`#B45309` → `var(--color-button-text)`, `rgba(0,0,0,...)` modal overlays → keep as-is (structural, not theme); update all `var(--clr-*)` references in existing CSS rules to `var(--color-*)` equivalents
- [ ] T015 [P] CSS foundation in index.html: add `:root { transition: all 300ms ease; }` immediately after the :root variable declarations; add `@media (prefers-reduced-motion: reduce) { :root { transition: none; } }` on the next line
- [ ] T016 [P] CSS foundation in index.html: add `#decorations-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }` and `.deco { position: absolute; user-select: none; line-height: 1; }` to stylesheet
- [ ] T017 [P] CSS foundation in index.html: add `main { position: relative; z-index: 1; }` to ensure all interactive content renders above the decoration layer
- [ ] T018 [P] Add `<div id="decorations-layer"></div>` as first child of `<body>` in index.html (immediately before `<main>`)
- [ ] T019 Add ES module import at the top of the `<script type="module">` block in index.html: `import { getTheme, getAllThemes, getActiveThemeId, saveActiveThemeId } from './js/theme-engine.js';`

**Checkpoint**: Foundation complete — game still loads, CSS uses variables (Space default colours show), theme-engine module is imported, all tests pass.

---

## Phase 3: User Story 1 — Open Theme Picker from Start Screen (Priority: P1) 🎯 MVP

**Goal**: Child taps 🎨 Theme on start screen, sees 6 preview cards in 2-column grid (name/emoji/gradient swatch/colour dots/sample button/✅ on active), and can return to start screen with Back to Menu.

**Independent Test**: Open game → tap 🎨 Theme button → Theme Picker opens showing 6 cards in 2-column grid → Space card has ✅ badge → tap 🏠 Back to Menu → Start screen returns, theme unchanged.

- [ ] T020 [P] [US1] Add `<section id="screen-theme-picker" hidden>` to index.html (after `section#screen-badges`): `<h1>🎨 Choose Your Theme</h1>`, `<div id="theme-grid"></div>`, `<button id="btn-theme-back" class="btn-secondary">🏠 Back to Menu</button>`
- [ ] T021 [P] [US1] Add CSS to index.html stylesheet for Theme Picker: `#screen-theme-picker` (padding, max-width centred), `#theme-grid` (display:grid; grid-template-columns:repeat(2,1fr); gap:16px), `.theme-card` (cursor:pointer; border-radius:12px; overflow:hidden; min-height:180px; display:flex; flex-direction:column; border:2px solid transparent; transition:border 150ms), `.theme-card.active` (border:3px solid gold), `.swatch-strip` (flex:0 0 40%; position:relative), `.theme-check` (position:absolute; top:6px; right:8px; font-size:1.4rem; display:none), `.theme-card.active .theme-check` (display:block), `.swatch-dots` (display:flex; gap:6px; padding:8px 10px; align-items:center), `.swatch-dot` (width:18px; height:18px; border-radius:50%; flex-shrink:0), `.sample-btn` (display:inline-block; padding:5px 14px; margin:6px 10px; font-size:0.85rem), `.theme-name` (text-align:center; font-weight:600; padding:6px; font-size:0.95rem; color:var(--color-text))
- [ ] T022 [US1] Add `renderThemePicker()` function to index.html `<script type="module">` block: calls `getAllThemes()`, reads `getActiveThemeId()`, clears `#theme-grid`, creates 6 `.theme-card` div elements — each with `.swatch-strip` (inline `background: linear-gradient(to bottom, {bg-start}, {bg-end})`), `.theme-check` span (text ✅), `.swatch-dots` with 3 `.swatch-dot` spans (inline bg: primary, accent, card-bg colours), `.sample-btn` (inline bg/color/border-radius from theme vars), `.theme-name` text (`{emoji} {name}`); add `.active` class to card whose id matches active theme id; appends each card to `#theme-grid`
- [ ] T023 [US1] Add `<button id="btn-open-theme" class="btn-secondary">🎨 Theme</button>` inside `<section id="screen-start">` in index.html (after existing start-screen buttons)
- [ ] T024 [US1] Wire `#btn-open-theme` click event in index.html `<script type="module">`: `document.getElementById('btn-open-theme').addEventListener('click', () => { renderThemePicker(); showScreen('screen-theme-picker'); });`
- [ ] T025 [US1] Wire `#btn-theme-back` click event in index.html `<script type="module">`: `document.getElementById('btn-theme-back').addEventListener('click', () => showScreen('screen-start'));`

**Checkpoint**: Open game → Start screen shows 🎨 Theme button → tap it → Theme Picker appears with 6 preview cards in a 2-column grid → Space card has ✅ and gold border → tap 🏠 Back to Menu → Start screen shown with theme unchanged.

---

## Phase 4: User Story 2 — Select and Apply Theme Instantly (Priority: P2)

**Goal**: Tapping a theme card applies that theme to the entire game immediately, including the picker screen itself, with a smooth ≤300ms colour transition.

**Independent Test**: Open Theme Picker → tap 🌊 Ocean → picker screen transitions to teal/aqua colours within 300ms → ✅ badge moves from Space to Ocean → tap Back to Start → Start screen is teal/aqua.

- [ ] T026 [US2] Add `ThemeManager` object to index.html `<script type="module">` block (place before renderThemePicker): `const ThemeManager = { getActive() { return getActiveThemeId(); }, getAll() { return getAllThemes(); }, apply(id) { const theme = getTheme(id); const root = document.documentElement; Object.entries(theme.vars).forEach(([k,v]) => root.style.setProperty(k,v)); saveActiveThemeId(id); this.updateDecorations(theme.decorations); }, init() { this.apply(this.getActive()); }, updateDecorations(emojis) { const layer = document.getElementById('decorations-layer'); if (!layer) return; layer.innerHTML = ''; const positions = [[10,15],[25,60],[50,20],[70,75],[80,35],[15,80],[60,50],[90,10],[40,90]]; emojis.forEach((em,i) => { for (let j=0; j<3; j++) { const s = document.createElement('span'); s.className='deco'; const p=positions[i*3+j]; s.style.cssText=`left:${p[0]}%;top:${p[1]}%;opacity:${0.1+j*0.07};font-size:${1.2+j*0.4}rem;`; s.textContent=em; layer.appendChild(s); } }); } };`
- [ ] T027 [US2] Update `renderThemePicker()` in index.html to wire each card's click handler: inside the card-creation loop, add `card.addEventListener('click', () => { ThemeManager.apply(theme.id); renderThemePicker(); });` — this enables live preview on the picker screen itself
- [ ] T028 [US2] Add `ThemeManager.init()` call inside the `DOMContentLoaded` (or equivalent startup) event handler in index.html, as the first statement before any `showScreen()` call, so decorations are rendered immediately on load

**Checkpoint**: Open Theme Picker → tap 🔥 Volcano → picker screen begins transitioning to dark charcoal/orange in ≤300ms → 🔥 Volcano card has ✅ and gold border → all other cards have no ✅ → tap Back → Start screen shows Volcano colours.

---

## Phase 5: User Story 4 — Theme Remembered Across Sessions (Priority: P4)

**Goal**: The chosen theme is automatically applied when the game reopens, with zero flash of the Space (default) theme for returning visitors.

**Independent Test**: Select 🌙 Midnight theme → close browser tab entirely → reopen index.html → game opens directly in Midnight theme (black/silver/gold) with no white or blue flash during load.

- [ ] T029 [US4] Add FOUC-prevention inline `<script>` (no `type="module"`) in index.html `<head>` — place as the LAST element in `<head>`, after all `<style>` and `<link>` tags: IIFE that reads `localStorage.getItem('mathblaster_theme')`, falls back to `'space'` if absent/unrecognised, then calls `document.documentElement.style.setProperty(key, value)` for all 13 CSS variables using an inline copy of each theme's `vars` object (copy the exact key/value pairs from the 6 theme definitions in data-model.md — no emoji, no decorations needed here); wrap localStorage access in try/catch for private-browsing safety

**Checkpoint**: Select 🍬 Candy → close browser → reopen game → game opens in Candy (dark pink/magenta) with no Space flash → open Theme Picker → Candy card has ✅.

---

## Phase 6: User Story 3 — Consistent Theming Across All Screens (Priority: P3)

**Goal**: The active theme applies consistently to all 9 game screens — no screen retains hardcoded colours from the old light theme after Phase 2's CSS refactor.

**Independent Test**: Select 🌿 Jungle → navigate through all 9 screens (Start, Game, Results, Stop Summary, Leaderboard, Badges, Practice Op/Diff/Session/Summary) → every screen shows lime-green Jungle colours; no white or blue defaults appear.

- [ ] T030 [US3] Audit index.html: search for any remaining hardcoded hex colour values outside the `:root` block and the FOUC `<script>` (pattern: `#[0-9a-fA-F]{3,6}` or `rgb(`); replace any found with the appropriate `var(--color-*)` reference (same mapping as T014)
- [ ] T031 [US3] Verify decoration layer on all screens: with a non-default theme active, navigate through all 9 screens and confirm themed emoji decorations appear in the background on each; confirm decorations do not overlap any button, input, or text element

**Checkpoint**: After selecting 🌊 Ocean, navigate all 9 screens — every screen displays teal/aqua Ocean colours consistently; no screen retains white/blue default values; Ocean emoji decorations (🌊🐠🐙) visible in background without blocking interactions.

---

## Phase 7: User Story 5 — Return to Start Screen Without Picking (Priority: P5)

**Goal**: Tapping Back to Menu exits the Theme Picker without changing the active theme or any saved preference.

**Independent Test**: With Space active (default) → tap 🎨 Theme → tap 🏠 Back to Menu without tapping any card → Start screen shown → theme still Space → localStorage mathblaster_theme still absent or still 'space'.

*Back navigation is implemented in Phase 3 (T025). This phase verifies no side effects.*

- [ ] T032 [US5] Verify in index.html that `#btn-theme-back` handler contains only `showScreen('screen-start')` with no calls to `ThemeManager.apply()`, `saveActiveThemeId()`, or any other state mutation; confirm by reading the wired event listener code

**Checkpoint**: Open Theme Picker → tap 🏠 Back to Menu without selecting → return to Start screen → active theme unchanged → localStorage key unchanged.

---

## Phase 8: User Story 6 — Theme Picker Not Accessible During Active Play (Priority: P6)

**Goal**: The 🎨 Theme button does not exist on any screen other than Start, making mid-game theme changes impossible by design.

**Independent Test**: Start a game (any difficulty) → game screen has no Theme button → answer questions to Results → Results screen has no Theme button → open Leaderboard and Badges → no Theme button → enter Practice Mode → no Theme button on any practice screen.

*Access restriction is implemented by design in Phase 3 (T023 adds button only to screen-start). This phase verifies correctness.*

- [ ] T033 [US6] Verify index.html: confirm `id="btn-open-theme"` appears ONLY inside `<section id="screen-start">` and is absent from `screen-game`, `screen-results`, `screen-stop-summary`, `screen-leaderboard`, `screen-badges`, `screen-practice-op`, `screen-practice-diff`, `screen-practice-session`, `screen-practice-summary`

**Checkpoint**: Play a full game session — no 🎨 Theme button appears on game, results, leaderboard, badges, or any practice screen.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, responsive layout, edge-case handling, keyboard support, final test run.

- [ ] T034 [P] WCAG contrast audit: for all 6 themes verify `--color-text` on `--color-card-bg` meets ≥ 4.5:1 contrast ratio using browser DevTools accessibility panel or webaim.org checker; reference expected pairs from quickstart.md; if any theme fails, adjust its `--color-text` value in both `js/theme-engine.js` and the FOUC `<script>` in index.html
- [ ] T035 [P] Touch target audit in index.html CSS: verify `.theme-card` has `min-height: 44px` (should already be ≥180px from T021), and `#btn-open-theme`, `#btn-theme-back` each have `min-height: 44px` and `min-width: 44px`; adjust padding/dimensions if needed
- [ ] T036 [P] Add responsive CSS to index.html stylesheet: `@media (max-width: 480px) { #theme-grid { grid-template-columns: 1fr; } }` to switch to single-column layout on narrow mobile screens
- [ ] T037 Add keyboard accessibility to theme cards in `renderThemePicker()` in index.html: each card gets `tabindex="0"`, `role="button"`, `aria-label="Select ${theme.name} theme"`, `aria-pressed="${isActive ? 'true' : 'false'}"` attributes; add `card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ThemeManager.apply(theme.id); renderThemePicker(); } });`
- [ ] T038 Add ARIA list semantics to theme grid in `renderThemePicker()` in index.html: set `themeGrid.setAttribute('role', 'list')` on `#theme-grid` element; set `card.setAttribute('role', 'listitem')` on each card (note: cards also have `role="button"` — use `role="button"` as the primary interactive role; set `role="listitem"` on a wrapper div if nesting is needed, or omit list role and rely on heading structure)
- [ ] T039 Add `aria-hidden="true"` to each `.theme-check` span in `renderThemePicker()` in index.html (active state is communicated via `aria-pressed` on the card, not the visual ✅ emoji)
- [ ] T040 Add localStorage error handling in js/theme-engine.js: wrap `globalThis.localStorage?.getItem()` in `getActiveThemeId()` in try/catch (return `'space'` on any error); wrap `globalThis.localStorage?.setItem()` in `saveActiveThemeId()` in try/catch (silently swallow error); add corresponding test in tests/theme-engine.test.js verifying getActiveThemeId returns 'space' when localStorage throws
- [ ] T041 Run full test suite: `node --test tests/` — all tests must pass before feature is considered complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (CSS vars and engine import ready)
- **US2 (Phase 4)**: Depends on Phase 3 (needs `renderThemePicker` for card wiring in T027)
- **US4 (Phase 5)**: Depends on Phase 4 (FOUC script must inline final vars from T009/T034)
- **US3 (Phase 6)**: Depends on Phase 2 (CSS refactor) — verification only
- **US5 (Phase 7)**: Depends on Phase 3 (back button wired in T025)
- **US6 (Phase 8)**: Depends on Phase 3 (Theme button placement in T023)
- **Polish (Phase 9)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Independently deliverable after Phase 2 — MVP
- **US2 (P2)**: Requires US1 (T027 updates renderThemePicker from T022)
- **US3 (P3)**: Requires Phase 2 CSS refactor — no dependency on US1/US2
- **US4 (P4)**: Requires US2 (ThemeManager.apply final vars must be stable before duplicating into FOUC script)
- **US5 (P5)**: Requires US1 (back button implemented in T025)
- **US6 (P6)**: Requires US1 (button placement in T023)

### Within Phase 2

- T003–T007 can be written in parallel (5 different test blocks in the same file)
- T008 must follow T003–T007 (confirms failures)
- T009–T010 must follow T008 (implement after confirmed failing tests)
- T011 must follow T009–T010 (verifies implementation)
- T012–T018 can largely run in parallel (different CSS sections / HTML sections)
- T014 (full hex refactor) should run after T012–T013 (vars must exist first to reference)
- T015–T018 can run in parallel with T014 (different concerns)
- T019 must follow T009–T010 (import names must match implemented exports)

### Parallel Opportunities

```
Phase 2 — TDD parallel batch:
  T003, T004, T005, T006, T007  (parallel — different test blocks)

Phase 2 — CSS parallel batch (after T012 adds vars):
  T013, T015, T016, T017, T018  (parallel — different rules/elements)

Phase 3 — US1 parallel batch:
  T020 (HTML section), T021 (CSS)  (parallel — different concerns)

Phase 9 — Polish parallel batch:
  T034 (contrast), T035 (touch), T036 (responsive)
```

---

## Implementation Strategy

### MVP First (User Stories 1–2 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T019)
3. Complete Phase 3: User Story 1 (T020–T025)
4. **STOP and VALIDATE**: Open game → tap 🎨 Theme → see 6 cards → tap Back
5. Complete Phase 4: User Story 2 (T026–T028)
6. **STOP and VALIDATE**: Tap a theme card → see live theme change on picker

### Full Incremental Delivery

1. Phase 1 + 2 → Engine tested + CSS using variables (no visible change yet)
2. Phase 3 (US1) → Navigation works — MVP!
3. Phase 4 (US2) → Theme selection + live preview
4. Phase 5 (US4) → Persistence + no flash on reload
5. Phase 6 (US3) → Cross-screen consistency verified
6. Phase 7–8 (US5, US6) → Edge-case verification (quick)
7. Phase 9 (Polish) → Accessibility complete, all tests pass

---

## Notes

- [P] tasks = different files or CSS sections — no blocking dependency between them
- **TDD is mandatory** (Constitution §IV): T003–T007 tests MUST fail before T009–T010 code
- Commit after each task or logical group (Constitution §6)
- The FOUC `<script>` (T029) is the only intentional code duplication — it must mirror the vars from THEMES in js/theme-engine.js; keep in sync if theme colour values change
- Do NOT create `node_modules/` or modify `.github/workflows/` (Constitution Principle VII)
- `js/theme-engine.js` uses named exports only (no default export) — matches badge-engine.js pattern
- The `math-engine.js`, `badge-engine.js`, and `leaderboard-engine.js` modules are **unchanged** by this feature
