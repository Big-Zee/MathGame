<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.1.0 (MINOR)
Bump rationale: New Principle VII (Deployment Integrity) added. No existing
  principles removed or redefined. New hard constraints on the GitHub Actions
  workflow file, package.json build scripts, node_modules, and index.html as
  the sole deployable entry point are additions, not redefinitions.

Modified principles:
  - None renamed or redefined.

Added sections:
  - Principle VII. Deployment Integrity — new
  - Development Workflow: step 8 added (Principle VII compliance check)

Removed sections:
  - None

Templates reviewed:
  - .specify/templates/plan-template.md   ✅ aligned (Constitution Check gate
      is dynamic; planners MUST add a Deployment Integrity row when the target
      is Azure SWA)
  - .specify/templates/spec-template.md   ✅ aligned (no deployment constraints
      belong in a feature spec; Principle VII is a delivery-layer concern)
  - .specify/templates/tasks-template.md  ✅ aligned (Polish phase notes already
      prohibit cross-story coupling; planners MUST NOT add tasks that touch
      .github/workflows/ per Principle VII)

Follow-up TODOs:
  - None — all placeholders resolved.
-->

# MathGame Constitution

## Core Principles

### I. Learning-First

Every feature MUST serve a measurable educational purpose. Game mechanics exist to
reinforce math skill acquisition for learners aged 9–10. Features that add
complexity without improving learning outcomes MUST be rejected or deferred.

- Problems MUST target specific math skills appropriate for grades 4–5
  (arithmetic, multiplication, division, basic fractions)
- Progress indicators MUST reflect genuine skill mastery, not just time played
- Difficulty scaling MUST be driven by learner performance, not arbitrary timers

### II. Kid-Friendly Design (Ages 9–10)

The game MUST be immediately playable by a 9–10 year old without adult assistance.
Visual design, language, and interactions MUST be calibrated for this age group.

- All text MUST use plain language at or below a 4th-grade reading level
- Interactive targets (buttons, inputs) MUST be large enough for children
  (minimum 44×44 CSS pixels per WCAG 2.5.5 target size)
- No feature MAY introduce UI elements that require prior tech literacy
  (e.g., hamburger menus, drag-and-drop, hover-only affordances)
- Color MUST be used to reinforce meaning, never as the sole indicator
  (supports both colorblind users and young learners)
- Animations and transitions MUST respect `prefers-reduced-motion`

### III. Accessibility (WCAG 2.1 AA)

The game MUST conform to WCAG 2.1 Level AA. Accessibility is non-negotiable
and MUST be validated, not assumed.

- All interactive elements MUST be keyboard-navigable and have visible focus
  indicators
- All images and icons MUST carry descriptive `alt` text or `aria-label`
- Color contrast ratio MUST meet 4.5:1 for normal text, 3:1 for large text
- Every page/screen MUST have a logical heading hierarchy (`h1` → `h2` → etc.)
- An accessibility audit task MUST appear in the Polish phase of every feature's
  tasks.md; features MUST NOT ship with known AA violations

### IV. Test-First (NON-NEGOTIABLE)

TDD is mandatory. Tests MUST be written and confirmed failing before any
implementation begins. The Red-Green-Refactor cycle is strictly enforced.

- Unit tests MUST cover all scoring, validation, and difficulty-scaling logic
- Acceptance scenarios from spec.md MUST map 1:1 to automated tests before coding
- No task MAY be marked complete unless all tests for that task pass

### V. Incremental Delivery

Features MUST be built as independently testable, deployable slices. Each user
story MUST deliver standalone value without requiring other stories to be complete.

- User stories MUST be prioritized (P1 → MVP, P2 → enhancement, P3 → polish)
- Phase 2 foundational work MUST be complete before any user story work begins
- Each story MUST reach a verifiable checkpoint before the next story starts

### VI. Immediate Feedback

The game MUST provide instant, clear feedback on every answer. Learners MUST
never be left uncertain about whether their answer was correct or why.

- Correct/incorrect feedback MUST be displayed within 100ms of submission
- Wrong-answer feedback MUST show the correct result (not just "wrong")
- Score and progress state MUST be persistent across sessions

### VII. Deployment Integrity

All code MUST deploy successfully to Azure Static Web Apps free tier without any
build step or modification to the deployment pipeline.

- `index.html` is the ONLY deployable entry point; all game logic MUST be
  self-contained within it or imported via relative ES module paths (e.g.,
  `./js/math-engine.js`); no bundler, transpiler, or asset pipeline is permitted
- If `package.json` exists, it MUST contain only `{"type": "module"}` to enable
  ES module resolution; it MUST NOT define build scripts, runtime dependencies,
  or `devDependencies` that imply a build step
- `node_modules/` MUST NOT exist in the repository or in any deployed output
- The GitHub Actions workflow file under `.github/workflows/` MUST NOT be
  modified, deleted, or regenerated by any implementation task; changes to the
  deployment pipeline require an explicit out-of-band decision with written
  rationale outside the normal speckit workflow
- Every merge to `main` MUST result in a passing Azure SWA deployment; a failed
  deployment on `main` is a P0 incident and MUST be resolved before any other
  work proceeds

## Technical Standards

The MathGame stack is fixed. Deviating from these constraints requires a MAJOR
constitution amendment with written justification.

**Mandatory stack**:
- **HTML5 + vanilla JavaScript (ES6+)** — No JS frameworks (React, Vue, Angular,
  Svelte, etc.) are permitted. No build tools (webpack, Vite, Parcel) unless
  required for a specific approved task; prefer zero-build by default.
- **CSS** — Plain CSS only. No CSS-in-JS, no Tailwind, no Sass unless a
  specific approved task requires it.
- **No server-side runtime** — The app MUST be fully static; all logic runs in
  the browser. No Node.js, Python, or other server code in the game runtime.

**Deployment target — Azure Static Web Apps**:
- All output MUST be static files deployable to Azure Static Web Apps
  (`index.html` + assets; no server-side rendering)
- Routing MUST be configured via `staticwebapp.config.json` at the repo root
- The `.github/workflows/` deployment pipeline MUST NOT be touched by
  implementation tasks (see Principle VII)
- Any API routes (if needed in future) MUST use Azure SWA managed functions
  (isolated under `/api`); they MUST NOT be tightly coupled to game logic

**General**:
- All math evaluation logic MUST be isolated in a pure JS module (no DOM
  dependency), enabling unit testing without a browser
- Configuration (difficulty levels, problem sets) MUST be data-driven (JSON),
  not hard-coded in JS

## Development Workflow

1. Specification MUST precede implementation (`/speckit-specify` before coding)
2. Ambiguities MUST be resolved via `/speckit-clarify` before planning begins
3. Implementation plans (`/speckit-plan`) MUST include a Constitution Check gate;
   the gate MUST explicitly verify: no frameworks, Azure SWA compatibility,
   WCAG 2.1 AA coverage plan, and Deployment Integrity (Principle VII)
4. Tasks MUST be generated from the approved plan (`/speckit-tasks`)
5. Every feature's tasks.md MUST include an accessibility audit task in the
   Polish phase
6. Each completed task MUST be committed before moving to the next
7. The `main` branch MUST always represent a working, tested, deployable state
8. No implementation task MAY touch `.github/workflows/`; if a deployment change
   is needed, it MUST be handled as a standalone out-of-band fix with explicit
   user approval before execution

## Governance

This constitution supersedes all other project practices. Amendments require:

1. A written rationale explaining why the change is necessary
2. A version bump per semantic versioning (MAJOR/MINOR/PATCH — see below)
3. A migration note if existing features are affected

**Versioning policy**:
- MAJOR — principle removed, renamed, or redefined in a backward-incompatible way;
  or a hard stack constraint added or removed
- MINOR — new principle or section added, or guidance materially expanded
- PATCH — clarifications, wording improvements, typo fixes

All pull requests MUST verify compliance with the applicable principles before
merge. Complexity violations MUST be documented in the plan's Complexity Tracking
table with justification.

**Version**: 2.1.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28
