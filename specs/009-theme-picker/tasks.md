# Tasks: Theme Picker

**Input**: Design documents from `/specs/009-theme-picker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Maps to user story from spec.md (US1-US6)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup

**Purpose**: Create empty file stubs so Phase 2 test tasks can reference them immediately.

- [x] T001 Create js/theme-engine.js as an empty ES module stub (`export {};`)
- [x] T002 Create tests/theme-engine.test.js as an empty Node test file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme engine module (TDD) and CSS variable infrastructure that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

### Theme Engine — Tests First (TDD)

> **MANDATORY**: Write all tests (T003-T007) and confirm they FAIL (T008) BEFORE writing any implementation.

- [x] T003 [P] Write failing test for THEMES data completeness in tests/theme-engine.test.js: import THEMES, verify 6 keys (space/ocean/jungle/volcano/candy/midnight), each entry has all 13 CSS var keys, non-empty emoji string, exactly-3-element decorations array
- [x] T004 [P] Write failing tests for getTheme() in tests/theme-engine.test.js: getTheme('space') returns object with id 'space'; getTheme('unknown') throws an error
- [x] T005 [P] Write failing tests for getAllThemes() in tests/theme-engine.test.js: returns an array of exactly 6 objects; each object has an id property
- [x] T006 [P] Write failing tests for getActiveThemeId() in tests/theme-engine.test.js: returns 'space' when localStorage is empty; returns saved value when mathblaster_theme key exists; returns 'space' when key contains unrecognised string; use mock localStorage (same pattern as badges.test.js)
- [x] T007 [P] Write failing tests for saveActiveThemeId() in tests/theme-engine.test.js: after saveActiveThemeId('ocean'), getActiveThemeId() returns 'ocean'; confirms mathblaster_theme key is written with correct value
- [x] T008 Confirm all theme-engine tests FAIL: run `node --test tests/theme-engine.test.js` and verify failures (proves tests are meaningful before implementation)

### Theme Engine — Implementation (after T008 confirms failures)

- [x] T009 Implement THEMES constant as default-less named export in js/theme-engine.js: object map with all 6 theme definitions (space, ocean, jungle, volcano, candy, midnight), each containing id, name, emoji, 13-entry vars object (exact values from data-model.md), and 3-element decorations array
- [x] T010 Implement getTheme(id), getAllThemes(), getActiveThemeId(), saveActiveThemeId(id) as named exports in js/theme-engine.js: getTheme throws on unknown id; getActiveThemeId uses `globalThis.localStorage?.getItem('mathblaster_theme')` and defaults to 'space' on absent/unrecognised value; saveActiveThemeId uses `globalThis.localStorage?.setItem('mathblaster_theme', id)`
- [x] T011 Verify all theme-engine tests pass: run `node --test tests/theme-engine.test.js` (all tests must be green before proceeding)

### CSS Variable Foundation

- [x] T012 [P] CSS refactor in index.html: replace entire :root block — remove all 9 existing `--clr-*` variables and `--radius`; add all 13 theme-driven CSS variables with Space theme default values from data-model.md
- [x] T013 [P] CSS refactor in index.html: add 3 static game-logic variables to :root: `--color-correct: #16A34A; --color-wrong: #DC2626; --color-timer-active: #F59E0B;`
- [x] T014 CSS refactor in index.html: replace all ~25 hardcoded hex colour values in stylesheet rules with their CSS variable equivalents
- [x] T015 [P] CSS foundation in index.html: add `:root { transition: all 300ms ease; }` and `@media (prefers-reduced-motion: reduce) { :root { transition: none; } }`
- [x] T016 [P] CSS foundation in index.html: add `#decorations-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }` and `.deco { position: absolute; user-select: none; line-height: 1; }`
- [x] T017 [P] CSS foundation in index.html: add `main { position: relative; z-index: 1; }`
- [x] T018 [P] Add `<div id="decorations-layer"></div>` as first child of `<body>` in index.html (immediately before `<main>`)
- [x] T019 Add ES module import at the top of the `<script type="module">` block in index.html: `import { getTheme, getAllThemes, getActiveThemeId, saveActiveThemeId } from './js/theme-engine.js';`

**Checkpoint**: Foundation complete — game still loads, CSS uses variables (Space default colours show), theme-engine module is imported, all tests pass.

---

## Phase 3: User Story 1 — Open Theme Picker from Start Screen (Priority: P1) MVP

**Goal**: Child taps Theme on start screen, sees 6 preview cards in 2-column grid, and can return to start screen with Back to Menu.

**Independent Test**: Open game -> tap Theme button -> Theme Picker opens showing 6 cards in 2-column grid -> Space card has checkmark -> tap Back to Menu -> Start screen returns, theme unchanged.

- [x] T020 [P] [US1] Add `<section id="screen-theme-picker" hidden>` to index.html (after section#screen-badges): h1, #theme-grid div, #btn-theme-back button
- [x] T021 [P] [US1] Add CSS to index.html stylesheet for Theme Picker: #screen-theme-picker, #theme-grid (2-col grid), .theme-card, .active, .swatch-strip, .theme-check, .swatch-dots, .swatch-dot, .sample-btn, .theme-name
- [x] T022 [US1] Add `renderThemePicker()` function to index.html `<script type="module">` block
- [x] T023 [US1] Add `<button id="btn-open-theme" class="btn btn-secondary">Theme</button>` inside `<section id="screen-start">` in index.html
- [x] T024 [US1] Wire #btn-open-theme click event: renderThemePicker() -> showScreen('screen-theme-picker')
- [x] T025 [US1] Wire #btn-theme-back click event: showScreen('screen-start')

**Checkpoint**: Open game -> Start screen shows Theme button -> tap it -> Theme Picker appears with 6 preview cards in a 2-column grid -> Space card has checkmark and gold border -> tap Back to Menu -> Start screen shown with theme unchanged.

---

## Phase 4: User Story 2 — Select and Apply Theme Instantly (Priority: P2)

**Goal**: Tapping a theme card applies that theme to the entire game immediately, including the picker screen itself, with a smooth <=300ms colour transition.

**Independent Test**: Open Theme Picker -> tap Ocean -> picker screen transitions to teal/aqua colours within 300ms -> checkmark moves from Space to Ocean -> tap Back to Start -> Start screen is teal/aqua.

- [x] T026 [US2] Add `ThemeManager` object to index.html `<script type="module">` block (place before renderThemePicker): getActive, getAll, apply, init, updateDecorations methods
- [x] T027 [US2] Update `renderThemePicker()` in index.html to wire each card's click handler to call ThemeManager.apply(id) then re-render picker
- [x] T028 [US2] Add `ThemeManager.init()` call inside the startup event handler in index.html, as the first statement before any showScreen() call

**Checkpoint**: Open Theme Picker -> tap Volcano -> picker screen begins transitioning to dark charcoal/orange in <=300ms -> Volcano card has checkmark -> tap Back -> Start screen shows Volcano colours.

---

## Phase 5: User Story 4 — Theme Remembered Across Sessions (Priority: P4)

**Goal**: The chosen theme is automatically applied when the game reopens, with zero flash of the Space (default) theme for returning visitors.

**Independent Test**: Select Midnight theme -> close browser tab entirely -> reopen index.html -> game opens directly in Midnight theme with no white or blue flash during load.

- [x] T029 [US4] Add FOUC-prevention inline `<script>` (no type="module") in index.html `<head>`: IIFE that reads localStorage, falls back to 'space' if absent/unrecognised, then calls document.documentElement.style.setProperty() for all 13 CSS variables using an inline copy of each theme's vars object; wrap localStorage access in try/catch for private-browsing safety

**Checkpoint**: Select Candy -> close browser -> reopen game -> game opens in Candy (dark pink/magenta) with no Space flash -> open Theme Picker -> Candy card has checkmark.

---

## Phase 6: User Story 3 — Consistent Theming Across All Screens (Priority: P3)

**Goal**: The active theme applies consistently to all 9 game screens.

**Independent Test**: Select Jungle -> navigate through all 9 screens -> every screen shows lime-green Jungle colours; no white or blue defaults appear.

- [x] T030 [US3] Audit index.html: search for any remaining hardcoded hex colour values outside the :root block and the FOUC script; replace any found with the appropriate var(--color-*) reference
- [x] T031 [US3] Verify decoration layer on all screens: with a non-default theme active, navigate through all 9 screens and confirm themed emoji decorations appear in the background on each; confirm decorations do not overlap any button, input, or text element

**Checkpoint**: After selecting Ocean, navigate all 9 screens — every screen displays teal/aqua Ocean colours consistently.

---

## Phase 7: User Story 5 — Return to Start Screen Without Picking (Priority: P5)

**Goal**: Tapping Back to Menu exits the Theme Picker without changing the active theme.

**Independent Test**: With Space active -> tap Theme -> tap Back to Menu without tapping any card -> Start screen shown -> theme still Space.

- [x] T032 [US5] Verify in index.html that #btn-theme-back handler contains only showScreen('screen-start') with no calls to ThemeManager.apply() or saveActiveThemeId()

**Checkpoint**: Open Theme Picker -> tap Back to Menu without selecting -> return to Start screen -> active theme unchanged.

---

## Phase 8: User Story 6 — Theme Picker Not Accessible During Active Play (Priority: P6)

**Goal**: The Theme button does not exist on any screen other than Start.

**Independent Test**: Start a game -> game screen has no Theme button -> results, leaderboard, badges, practice screens also have no Theme button.

- [x] T033 [US6] Verify index.html: confirm id="btn-open-theme" appears ONLY inside section#screen-start and is absent from all other screens

**Checkpoint**: Play a full game session — no Theme button appears on game, results, leaderboard, badges, or any practice screen.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, responsive layout, edge-case handling, keyboard support, final test run.

- [x] T034 [P] WCAG contrast audit: for all 6 themes verify --color-text on --color-card-bg meets >=4.5:1 contrast ratio; reference expected pairs from quickstart.md; if any theme fails, adjust its --color-text value in both js/theme-engine.js and the FOUC script in index.html
- [x] T035 [P] Touch target audit in index.html CSS: .theme-card min-height >=44px (180px from T021), #btn-open-theme and #btn-theme-back each have min-height:44px and min-width:44px
- [x] T036 [P] Add responsive CSS to index.html stylesheet: @media (max-width: 480px) { #theme-grid { grid-template-columns: 1fr; } }
- [x] T037 Add keyboard accessibility to theme cards in renderThemePicker(): tabindex="0", role="button", aria-label, aria-pressed, Enter/Space keydown handler
- [x] T038 Add role="list" to #theme-grid and role="listitem" semantics in renderThemePicker()
- [x] T039 Add aria-hidden="true" to each .theme-check span in renderThemePicker()
- [x] T040 Add localStorage error handling in js/theme-engine.js: try/catch in getActiveThemeId() (return 'space' on error) and saveActiveThemeId() (silently swallow error)
- [x] T041 Run full test suite: `node --test tests/*.test.js` — all tests must pass before feature is considered complete

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

---

## Notes

- [P] tasks = different files or CSS sections — no blocking dependency between them
- **TDD is mandatory** (Constitution IV): T003-T007 tests MUST fail before T009-T010 code
- Commit after each task or logical group (Constitution 6)
- The FOUC `<script>` (T029) is the only intentional code duplication — it must mirror the vars from THEMES in js/theme-engine.js; keep in sync if theme colour values change
- Do NOT create `node_modules/` or modify `.github/workflows/` (Constitution Principle VII)
- `js/theme-engine.js` uses named exports only (no default export) — matches badge-engine.js pattern
- The `math-engine.js`, `badge-engine.js`, and `leaderboard-engine.js` modules are **unchanged** by this feature
