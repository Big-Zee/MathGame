# Developer Quickstart: Achievement Badges

**Feature**: `006-achievement-badges` | **Date**: 2026-05-01

---

## Prerequisites

- Node.js 18+ (for `node --test`)
- A browser (Chrome/Edge/Firefox/Safari)
- No install step — open `index.html` directly from `file://` or serve with any static file server

---

## Files Changed / Added

| File | Status | Notes |
|------|--------|-------|
| `js/badge-engine.js` | **NEW** | Pure badge logic module (no DOM) |
| `index.html` | **MODIFIED** | New HTML + CSS + badge UI + integration calls |
| `tests/badges.test.js` | **NEW** | Unit tests for badge-engine.js |

**NOT changed**: `js/math-engine.js`, `tests/math-engine.test.js`, `.github/workflows/`, `package.json`, `staticwebapp.config.json`

---

## Running Tests

```bash
# Run all tests
node --test

# Run badge tests only
node --test tests/badges.test.js

# Run math-engine tests only
node --test tests/math-engine.test.js
```

Tests must be written and confirmed **failing** before implementation begins (Red-Green-Refactor, Principle IV).

---

## Manual Testing: Key Badge Scenarios

### 1. Speed Demon 🏎️ (answer in under 3 s)

1. Set timer to 30 s (gives most headroom).
2. Start a game; tap any correct answer within the first 2 seconds.
3. After the feedback fades, the popup "🎉 New Badge Unlocked! / 🏎️ Speed Demon / You answered in under 3 seconds!" should appear.
4. Popup should auto-dismiss after 3 s OR on tap.
5. Open Badges screen: Speed Demon should show as earned with today's date.

### 2. Hat Trick 🎩 (3 correct in a row)

1. Answer 3 consecutive questions correctly.
2. After the 3rd correct answer's feedback, the "Hat Trick" popup appears.
3. If On Fire (5 in a row) is also earned later, both should appear sequentially.

### 3. Lightning ⚡ (5 consecutive correct, each under 5 s)

1. Set timer to 30 s.
2. Answer 5 consecutive questions correctly within 5 s each.
3. A wrong answer or slow answer (≥ 5 s) resets the counter — Hat Trick popup should NOT appear after the reset, only after a fresh run of 3+ fast-correct.

### 4. Badge popup queue

1. Earn "Hat Trick" and "Speed Demon" simultaneously (e.g. the 3rd correct answer was also under 3 s).
2. Verify first popup shows Hat Trick, auto-dismisses, then Speed Demon popup appears.
3. After both dismiss, the next question should start.

### 5. Badges screen new-badge counter

1. Earn any badge.
2. Go to Start screen. Button should read "🏅 Badges (1 new!)".
3. Tap the button. The counter should disappear — button reverts to "🏅 Badges".
4. Earn another badge. Counter shows "🏅 Badges (1 new!)" again.

### 6. Persistence across reload

1. Earn a badge.
2. Reload the page (F5 / Ctrl+R).
3. Open Badges screen — badge still shows as earned.

### 7. Practice badges

1. Complete 5 Practice sessions (any operation, any difficulty). "Practice Makes Perfect" badge earns on the 5th session's summary.
2. Complete at least one session each for ➕, ➖, ✖️, ➗. "Operation Master" earns when the 4th operation is completed.
3. Accumulate 50 correct answers in Practice Mode total (across any number of sessions). "Dedication" earns when the 50th correct answer is submitted and the session completes.

### 8. Explorer 🗺️ (all 3 Practice difficulties)

1. Complete one Practice session at Easy, one at Medium, one at Hard (any operation, any order, across any number of sessions).
2. "Explorer" earns after the session that completes the third difficulty.

### 9. Perfectionist ✨ (100% in Hard Practice)

1. Start a Practice session at Hard difficulty (any operation).
2. Answer every question correctly (miss none).
3. Tap "Stop Practising". On the summary screen, "Perfectionist" popup appears.

### 10. Time Lord ⏰ (all 6 timer settings)

1. Complete a game with each of the six timer settings: 5s, 10s, 15s, 20s, 25s, 30s.
2. Games can be across different sessions. Each completed game (reaching Results or Stop Summary) with a new timer setting adds it to the tracker.
3. "Time Lord" earns when the 6th unique timer value is completed.

---

## Resetting Badge State (Development / QA)

Open the browser DevTools console:

```js
// Clear all badge data
localStorage.removeItem('mathblaster_badges');
localStorage.removeItem('mathblaster_badges_new');
localStorage.removeItem('mathblaster_practice_stats');
localStorage.removeItem('mathblaster_timers_used');

// Reload
location.reload();
```

Or clear all localStorage for the origin:

```js
localStorage.clear(); location.reload();
```

---

## Architecture Quick Reference

```
js/badge-engine.js          Pure module. No DOM.
  ├── BADGE_DEFINITIONS[]    18 badge objects
  ├── BADGE_CATEGORIES[]     5 category descriptors
  ├── localStorage wrappers  get/save BadgeStore, PracticeStats, TimersUsed
  ├── check*() functions     Pure boolean checks (one per badge)
  ├── checkBadgesAfterQuestion()  Orchestrator
  ├── checkBadgesAfterGame()      Orchestrator
  ├── checkBadgesAfterPractice()  Orchestrator
  └── awardBadges()              Returns new BadgeStore (no side effects)

index.html (JS section)
  ├── Import from badge-engine.js
  ├── session.answerTimesMs[]    New field on session object
  ├── session.fastAnswerStreak   New field on session object
  ├── showFeedback() amendment   Capture answer time + badge check + popup gate
  ├── showResults() amendment    Badge check + popup gate
  ├── showStopSummary() amendment Badge check + popup gate
  ├── stopPractising() amendment  Update practice stats + badge check + popup gate
  ├── showBadgesScreen()         Clears new counter + renders + shows screen
  ├── updateBadgesButton()       Updates Start screen button label
  ├── renderBadgesScreen()       Populates badge grid from store
  ├── enqueueBadgePopups()       Adds badges to queue + starts chain
  ├── showNextBadgePopup()       Shows first item in queue
  └── dismissCurrentPopup()      Dismisses + advances queue or fires callback
```

---

## Complexity Budget

This feature adds approximately:
- `js/badge-engine.js`: ~250 lines (badge definitions + 18 check functions + 3 orchestrators + localStorage wrappers)
- `index.html` JS additions: ~150 lines (popup management + integration amendments + screen handlers)
- `index.html` HTML additions: ~80 lines (#screen-badges structure + #badge-unlock-popup)
- `index.html` CSS additions: ~60 lines (badge grid, card states, popup animation)
- `tests/badges.test.js`: ~200 lines (18+ unit tests)

Total additions: ~740 lines across 3 files. No existing code deleted.
