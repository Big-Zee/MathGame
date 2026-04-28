# Implementation Plan: Math Quiz Game

**Branch**: `001-math-quiz-game` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-math-quiz-game/spec.md`

## Summary

A 10-question math quiz for learners aged 9–10 covering addition, subtraction, multiplication, and
division. The game runs as a fully static single-page web app (index.html + js/math-engine.js)
with zero external dependencies, deployed to Azure Static Web Apps free tier. Core mechanics:
3-heart lives system, 10-second per-question countdown, streak bonus scoring, emoji feedback, and
a 1–3 star end-screen rating. A pure-logic JS module (`js/math-engine.js`) isolates question
generation, answer evaluation, and scoring from the DOM to enable unit testing without a browser.

## Technical Context

**Language/Version**: HTML5 + ES6+ JavaScript (no transpilation) + CSS3
**Primary Dependencies**: None — zero external libraries or frameworks
**Storage**: `localStorage` (high-score persistence between sessions); all in-session state held
  in plain JS variables (no IndexedDB, no sessionStorage needed)
**Testing**: Node.js 18+ built-in test runner (`node --test`) for `js/math-engine.js` pure-logic
  unit tests; no browser required
**Target Platform**: Modern evergreen browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
  served via Azure Static Web Apps free tier
**Project Type**: Static single-page web app (no SPA router needed — one screen rendered at a
  time via CSS `display` toggling)
**Performance Goals**: Feedback rendered within 100ms of answer submission; timer UI updated at
  100ms intervals; total page load < 200KB uncompressed
**Constraints**: Zero build tools; WCAG 2.1 AA — zero known violations at ship; Azure SWA free
  tier limits (0.5GB storage, 100GB/month bandwidth); all division problems produce whole-number
  results only
**Scale/Scope**: Single player, single device, one active round at a time; no server calls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ PASS | FR-001–FR-003: addition/subtraction/multiplication/division, grades 4–5 number ranges; streak rewards accuracy. **Deferral**: v1 has fixed difficulty (no adaptive scaling). When scaling is added it MUST be learner-performance-driven per constitution. |
| II. Kid-Friendly Design (9–10) | ✅ PASS | Answer buttons ≥44×44px enforced in CSS; game text at ≤4th-grade reading level; no hover-only affordances; color reinforces meaning (green/red + emoji + label); `prefers-reduced-motion` respected. |
| III. Accessibility (WCAG 2.1 AA) | ✅ PASS | Keyboard nav via Tab+Enter on all interactive elements; visible `:focus-visible` ring; emoji icons carry `aria-label`; contrast targets ≥4.5:1 (dark text on light bg); `h1` → `h2` hierarchy; accessibility audit task in Polish phase. |
| IV. Test-First | ✅ PASS | `js/math-engine.js` unit tests written first (failing), then implemented. All acceptance scenarios from spec.md have corresponding test assertions before coding. |
| V. Incremental Delivery | ✅ PASS | 3 user stories (P1/P2/P3) with independent checkpoints; P1 delivers a playable round without scoring depth; P2 adds lives; P3 adds streaks. |
| VI. Immediate Feedback | ✅ PASS | Feedback rendered synchronously (<100ms). **Resolved**: constitution requires persistence "across sessions" → high score tracked in `localStorage`; game-session score held in memory (satisfies spirit: learner can see improvement across visits). |
| Technical Standards | ✅ PASS | Vanilla HTML5/ES6+/CSS3; zero frameworks; zero build tools; Azure SWA `staticwebapp.config.json` at repo root; math logic in pure DOM-free module; config as JS data object. |

*Post-Phase 1 re-check*: All gates still pass after design (see data-model.md and contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/001-math-quiz-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── math-engine-api.md      # Pure-logic JS module contract
│   └── ui-state-machine.md     # Screen/state transitions
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html                  # Complete game UI (HTML + inline CSS + UI JS)
js/
└── math-engine.js          # Pure logic module (no DOM): question gen, scoring
tests/
└── math-engine.test.js     # Node.js --test unit tests for math-engine.js
staticwebapp.config.json    # Azure Static Web Apps routing config
```

**Structure Decision**: Single-page app (one HTML file). All CSS is in an inline `<style>` block;
all UI JavaScript is in an inline `<script>` block that imports functions from
`js/math-engine.js`. The pure-logic module lives in a separate file to enable Node.js unit
testing without a browser, satisfying Constitution Principle IV. No build step is required.

## Complexity Tracking

> No constitution violations requiring justification.
