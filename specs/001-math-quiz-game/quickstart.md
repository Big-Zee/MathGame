# Quickstart: Math Quiz Game

**Branch**: `001-math-quiz-game`

## Prerequisites

- A modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Node.js 18+ (for running unit tests only — not needed to play the game)
- Git (for deployment workflow)

---

## Run locally

Because `js/math-engine.js` is loaded as an ES module (`<script type="module">`), the file must
be served over HTTP — opening `index.html` directly via `file://` will fail due to browser CORS
restrictions on module imports.

**Option A — VS Code Live Server (recommended)**:

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**
3. Browser opens at `http://127.0.0.1:5500/`

**Option B — Python (if installed)**:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

**Option C — Node.js (if installed)**:

```bash
npx serve .
# then open the printed URL
```

---

## Run unit tests

No installation required. Node.js 18+ built-in test runner is used.

```bash
node --test tests/math-engine.test.js
```

Expected output (all green):

```
▶ generateQuestion
  ✔ returns 4 unique choices (Xms)
  ✔ correct answer is among choices (Xms)
  ✔ division produces whole-number answer (Xms)
  ✔ subtraction result is positive (Xms)
▶ updateStreak
  ✔ activates at threshold (Xms)
  ✔ resets on wrong answer (Xms)
▶ calculateStars
  ✔ returns 1 star below two-star threshold (Xms)
  ✔ returns 2 stars in middle band (Xms)
  ✔ returns 3 stars at three-star threshold (Xms)
```

---

## Deploy to Azure Static Web Apps (free tier)

### One-time setup

1. **Create an Azure Static Web App resource** in the Azure Portal:
   - Source: GitHub (connect this repo)
   - Branch: `main`
   - Build preset: **Custom**
   - App location: `/` (repo root)
   - Output location: `/` (no build step)
   - API location: (leave blank)

2. Azure auto-generates a GitHub Actions workflow file
   (`/.github/workflows/azure-static-web-apps-*.yml`). Commit and push it.

3. The `staticwebapp.config.json` at the repo root is picked up automatically.

### Deploy on every push

After setup, every push to `main` triggers the Azure GitHub Actions workflow. No manual steps.

### Verify deployment

1. Open the Azure Portal → your SWA resource → **Browse** button
2. Play a full round — verify timer, hearts, scoring, and Results screen all work
3. Check the browser console for any errors
4. Run the WCAG accessibility audit (see below)

---

## Accessibility audit (required before shipping)

Use the [axe DevTools browser extension](https://www.deque.com/axe/devtools/) or Chrome
Lighthouse:

1. Open the deployed URL
2. Run Lighthouse → Accessibility → score MUST be 90+ (target: 100)
3. Open axe DevTools → Analyze → zero critical/serious violations permitted
4. Manual check: play the full round using keyboard only (Tab + Enter) — every
   interaction must be reachable and operable

Document results in `specs/001-math-quiz-game/checklists/accessibility.md`.
