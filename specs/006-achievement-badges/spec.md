# Feature Specification: Achievement Badges

**Feature Branch**: `006-achievement-badges`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "Add a new feature called 'Achievement Badges' to Math Blaster."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Badges Button on Start Screen (Priority: P1)

A "🏅 Badges" button appears on the Start screen, always visible. When new badges have been earned since the child last opened the Badges screen, the button displays a count: "🏅 Badges (3 new!)". Tapping the button opens the Badges screen.

**Why this priority**: Entry point for the entire feature. All other stories are unreachable without it. Adding the button alone delivers immediate discoverability — even if no badges are earned yet.

**Independent Test**: Load the game. Verify "🏅 Badges" button is present on `#screen-start`. Tap it — verify the Badges screen opens. Return to Start. Earn one badge and reopen the Badges screen — verify the "new" count increments then clears.

**Acceptance Scenarios**:

1. **Given** the Start screen is shown, **When** the page loads, **Then** a "🏅 Badges" button is visible on `#screen-start`.
2. **Given** the player has earned badges not yet viewed, **When** `#screen-start` is shown, **Then** the button label reads "🏅 Badges (N new!)" where N is the unviewed count.
3. **Given** the player has no unviewed badges, **When** `#screen-start` is shown, **Then** the button label reads "🏅 Badges" with no count suffix.
4. **Given** the Badges button is tapped, **When** the player is on `#screen-start`, **Then** the Badges screen (`#screen-badges`) is shown.
5. **Given** `#screen-badges` is opened, **When** the screen loads, **Then** the unviewed badge count resets to 0 and is persisted to `localStorage`.

---

### User Story 2 — Badges Screen: Full Grid With Earned/Unearned States (Priority: P2)

The Badges screen shows all 18 badges in a grid layout, grouped into 5 sections (Accuracy, Speed, Score, Practice, Variety). Each section has a header and a progress indicator ("N / M earned"). Earned badges display in full colour with name and unlock date (e.g. "Unlocked May 1"). Unearned badges are greyed out with name and a short hint ("Answer correctly in under 3 seconds"). A total count at the top reads "You've earned X out of 18 badges! 🏅".

**Why this priority**: Core value of the feature — children need to see what they've collected and what to aim for. Depends on US1 (Badges button).

**Independent Test**: Open Badges screen with 0 badges earned. Verify all 18 appear greyed out with hints. Verify total reads "You've earned 0 out of 18 badges! 🏅". Earn one badge. Reopen Badges screen — verify that badge shows in full colour with name and "Unlocked [date]". Verify section progress indicator updates.

**Acceptance Scenarios**:

1. **Given** the Badges screen is open, **When** it renders, **Then** all 18 badges are displayed (earned or unearned).
2. **Given** a badge is earned, **When** the Badges screen shows it, **Then** it appears in full colour with its name and "Unlocked [date]" (e.g. "Unlocked May 1").
3. **Given** a badge is not earned, **When** the Badges screen shows it, **Then** it appears greyed out with its name and a short hint about how to earn it.
4. **Given** the Badges screen is open, **When** it renders, **Then** badges are grouped into 5 labelled sections: 🎯 Accuracy, ⏱️ Speed, 🏆 Score, 📚 Practice, 🌈 Variety.
5. **Given** a section contains N earned badges out of M total, **When** rendered, **Then** the section header shows "N / M earned".
6. **Given** any number of badges earned, **When** the Badges screen renders, **Then** the top of the screen reads "You've earned X out of 18 badges! 🏅".

---

### User Story 3 — Badge Unlock Popup (Priority: P3)

When a new badge is earned, a celebratory popup appears after the current question's feedback resolves, showing the badge emoji, name, and a one-line description. The popup auto-dismisses after 3 seconds or can be tapped to dismiss early. If multiple badges are earned at once, they queue and show one after another. The popup never pauses the countdown timer.

**Why this priority**: Immediate reward feedback is the primary motivator for collecting badges. Depends on US1–2 (badge data must exist).

**Independent Test**: Play a game, answer the first question correctly in under 3 seconds. After the feedback phase ends, verify the "🏎️ Speed Demon / You answered in under 3 seconds!" popup appears. Verify it auto-dismisses after 3 s or dismisses immediately on tap. Verify the next question loads normally after dismissal.

**Acceptance Scenarios**:

1. **Given** a badge is earned during a game, **When** the question feedback resolves, **Then** a popup appears showing "🎉 New Badge Unlocked!", the badge emoji and name, and a one-line description.
2. **Given** the popup is visible, **When** 3 seconds elapse, **Then** the popup auto-dismisses.
3. **Given** the popup is visible, **When** the player taps/clicks it, **Then** it dismisses immediately.
4. **Given** multiple badges are earned in the same question resolution, **When** popups are queued, **Then** they show one after another, each for up to 3 seconds.
5. **Given** the badge popup is shown during a game, **When** the popup is visible, **Then** the countdown timer is NOT paused or reset.

---

### User Story 4 — Badge Persistence and No-Reset Guarantee (Priority: P4)

All earned badges persist in `localStorage` under key `mathblaster_badges` as a JSON object. Clearing the leaderboard (high score) does NOT clear badges. Badges can only be reset by clearing `localStorage` manually.

**Why this priority**: Persistence is a baseline trust requirement — children and parents must be confident the collection survives page reloads and browser sessions.

**Independent Test**: Earn one badge. Reload the page. Open Badges screen — verify the badge is still shown as earned. Clear the high score entry (if such a button exists). Open Badges screen — verify badges are unaffected.

**Acceptance Scenarios**:

1. **Given** a badge is earned, **When** the page is reloaded, **Then** the badge still shows as earned on the Badges screen.
2. **Given** the player clears the high score / leaderboard entry, **When** the Badges screen is opened, **Then** all previously earned badges are unchanged.
3. **Given** `localStorage` is cleared manually, **When** the page reloads, **Then** all badges reset to unearned (fresh state).

---

### User Story 5 — Practice Mode Badges (Priority: P5)

Three badges track Practice Mode usage across sessions: "Practice Makes Perfect" (5 sessions completed), "Operation Master" (at least one completed session per operation), and "Dedication" (50 correct answers across all Practice sessions combined). Cumulative counters persist in `localStorage`.

**Why this priority**: Motivates continued use of Practice Mode. Depends on the existing Practice Mode feature. Lower priority because practice badge data accumulates slowly.

**Independent Test**: Complete exactly 5 Practice Mode sessions. Open Badges screen — verify "Practice Makes Perfect" is earned. Complete at least one session each for ➕, ➖, ✖️, ➗. Verify "Operation Master" is earned. Accumulate 50 correct answers in Practice Mode total. Verify "Dedication" is earned.

**Acceptance Scenarios**:

1. **Given** the player completes their 5th Practice Mode session, **When** badge checks run, **Then** "Practice Makes Perfect" is unlocked.
2. **Given** the player has completed at least one session in each of the 4 operations, **When** badge checks run after a session end, **Then** "Operation Master" is unlocked.
3. **Given** the player's cumulative correct answers in Practice Mode reaches 50, **When** badge checks run, **Then** "Dedication" is unlocked.
4. **Given** Practice Mode cumulative stats are stored, **When** the page reloads, **Then** the accumulated counters are preserved in `localStorage`.

---

### Edge Cases

- **Badge already earned**: Re-earning a badge (e.g., answering fast again) has no effect — badge is awarded only once and its unlock date is never overwritten.
- **First-time player with no localStorage**: All badges initialize as unearned; counters initialize to 0. No crash or warning.
- **Badge earned on last question of a game**: The popup queue begins after the final question's feedback phase, before the Results screen loads. If the queue is non-empty when the Results screen would normally load, the screen waits for the queue to drain first.
- **Badges screen opened mid-popup queue**: Not possible — the Badges screen is only accessible from the Start screen; no active game or practice session is in progress.
- **Multiple badges earned simultaneously**: All are awarded in one check pass; they queue and display sequentially.
- **Timer values never used**: "Time Lord" requires all 6 timer settings (5, 10, 15, 20, 25, 30 s) to be used in completed games. A player who has never changed the timer cannot earn this badge accidentally.
- **Early-stopped game**: A game stopped early via the Stop Session feature is treated the same as a completed game for badge-checking purposes (score, streak, and accuracy at stop time are used).

---

## Requirements *(mandatory)*

### Functional Requirements

**Badge Storage & Persistence**
- **FR-001**: The system MUST store all badge state in `localStorage` under key `mathblaster_badges` as a JSON object. Each badge entry MUST include: earned status (boolean) and unlock date (ISO date string, only when earned).
- **FR-002**: The system MUST store a separate unviewed-badge counter in `localStorage` under key `mathblaster_badges_new` (integer ≥ 0).
- **FR-003**: Clearing the high score MUST NOT modify `mathblaster_badges` or `mathblaster_badges_new`.
- **FR-004**: Badge state MUST survive page reload without loss.

**Start Screen Integration**
- **FR-005**: A "🏅 Badges" button MUST be present on `#screen-start` at all times.
- **FR-006**: When `mathblaster_badges_new > 0`, the button label MUST read "🏅 Badges (N new!)"; otherwise "🏅 Badges".
- **FR-007**: Opening `#screen-badges` MUST reset `mathblaster_badges_new` to 0 and persist the reset.

**Badges Screen**
- **FR-008**: `#screen-badges` MUST display all 18 badges grouped into 5 sections: 🎯 Accuracy (5 badges), ⏱️ Speed (3 badges), 🏆 Score (4 badges), 📚 Practice (3 badges), 🌈 Variety (3 badges).
- **FR-009**: Each section MUST show a progress indicator in the format "N / M earned".
- **FR-010**: The top of `#screen-badges` MUST show "You've earned X out of 18 badges! 🏅".
- **FR-011**: Earned badges MUST display in full colour with name and "Unlocked [Mon DD]" (e.g. "Unlocked May 1").
- **FR-012**: Unearned badges MUST display greyed out with name and a short earn-hint.
- **FR-013**: `#screen-badges` MUST be accessible from `#screen-start` only; no link from in-game or Practice screens.

**Badge Check Timing**
- **FR-014**: Badge checks MUST run at feedback-end — after the feedback phase fully completes and all session state for that question (score, streak, answer time) is settled — and before any round-advance logic begins (i.e. before the next question loads). For session-end badges, checks run after the final question's feedback phase, before the Results screen loads. Badge checks MUST never run synchronously during an active countdown tick.
- **FR-015**: Earning a badge MUST NOT pause or reset an already-running countdown timer.

**Badge Unlock Popup**
- **FR-016**: When one or more new badges are earned, a popup MUST be shown after question feedback resolves (or after session end before the Results screen loads), displaying "🎉 New Badge Unlocked!", the badge emoji and name, and a one-line earn description.
- **FR-017**: Each popup MUST auto-dismiss after 3 seconds. A tap/click MUST dismiss it immediately.
- **FR-018**: Multiple badges earned at once MUST be displayed sequentially (queue), one popup at a time.
- **FR-019**: The next question MUST load into the DOM as normal, but its countdown MUST NOT start until the full popup queue has drained (all popups dismissed or auto-dismissed). The popup appears in the dead-zone between feedback-end and next-question-countdown-start; no running timer is ever paused by the popup.

**Badge Definitions — Accuracy Category**
- **FR-020**: "Sharp Shooter" 🎯 — earned when the player scores 100% (10/10 correct) on a completed game.
- **FR-021**: "Hat Trick" 🎩 — earned when the player gets 3 consecutive correct answers in a single game.
- **FR-022**: "On Fire" 🔥 — earned when the player gets 5 consecutive correct answers in a single game.
- **FR-023**: "Unstoppable" ⚡ — earned when the player gets 10 consecutive correct answers (perfect game, all 10).
- **FR-024**: "Comeback Kid" 💪 — earned when the player completes a game with a winning outcome (3 stars) after having lost exactly 2 hearts during that game.

**Badge Definitions — Speed Category**
- **FR-025**: "Speed Demon" 🏎️ — earned when the player answers any question correctly in under 3 seconds.
- **FR-026**: "Lightning" ⚡ — earned when the player answers 5 consecutive questions correctly in under 5 seconds each, all within the same game. The consecutive counter resets to 0 on any wrong answer OR any answer that takes 5 seconds or more.
- **FR-027**: "Quick Thinker" 🧠 — earned when the player completes a full game (10 questions) with an average answer time under 7 seconds across all answered questions.

**Badge Definitions — Score Category**
- **FR-028**: "First Win" 🌟 — earned when the player completes their very first game (any score).
- **FR-029**: "Century" 💯 — earned when the player scores 100 or more points in a single game.
- **FR-030**: "High Roller" 🎰 — earned when the player scores 150 or more points in a single game.
- **FR-031**: "Math Legend" 👑 — earned when the player scores 200 or more points in a single game.

**Badge Definitions — Practice Category**
- **FR-032**: "Practice Makes Perfect" 📚 — earned when the player completes 5 Practice Mode sessions.
- **FR-033**: "Operation Master" 🔢 — earned when the player has completed at least one Practice session in each of the 4 operations (addition, subtraction, multiplication, division). A session counts only if it reaches the Practice Summary screen; abandoned or in-progress sessions are ignored.
- **FR-034**: "Dedication" 🏅 — earned when the player accumulates 50 correct answers across all Practice Mode sessions.

**Badge Definitions — Variety Category**
- **FR-035**: "Explorer" 🗺️ — earned when the player completes a game on all 3 difficulty levels (Easy, Medium, Hard) — each level need not be played in the same session.
- **FR-036**: "Time Lord" ⏰ — earned when the player has completed at least one game (reached the Results screen or Stop Session summary) using each of the 6 timer settings (5, 10, 15, 20, 25, 30 seconds). Each timer setting need not be used in the same session; progress accumulates across sessions in `localStorage`.
- **FR-037**: "Perfectionist" ✨ — earned when the player earns 3 stars on a completed game at Hard difficulty.

**Isolation Constraint**
- **FR-038**: All badge logic MUST be self-contained and MUST NOT modify the existing game loop, Practice Mode flow, timer logic, or leaderboard/high-score logic.

### Key Entities

- **BadgeRecord**: One entry per badge — fields: `id` (string slug), `earned` (boolean), `unlockedAt` (ISO date string | null).
- **BadgeStore**: The full `mathblaster_badges` localStorage object — a map of badge ID → BadgeRecord.
- **CumulativePracticeStats**: Persisted counters used by Practice badges — `sessionsCompleted`, `operationsCompleted` (set of operation IDs), `totalCorrect`.
- **GameBadgeContext**: Transient per-game data for badge evaluation — `streak`, `fastAnswerCount`, `totalAnswerTimeMs`, `questionsAnswered`, `score`, `heartsLost`, `difficulty`, `timerSetting`, `stars`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 18 badges can be earned without refreshing the page — earned state is visible on the Badges screen within the same session.
- **SC-002**: Opening the Badges screen after earning badges consistently clears the "N new!" counter on the Start screen button on the very next Start screen load.
- **SC-003**: Badge checks complete before the next question or results screen appears — the player never sees a delay attributable to badge evaluation.
- **SC-004**: The badge popup queue processes all queued badges without dropping any, even when the maximum number of badges are earned simultaneously (theoretically up to 18 at once for a new player completing specific conditions).
- **SC-005**: Earned badge state and practice cumulative counters survive a page reload with 100% fidelity (no data loss).
- **SC-006**: The Badges screen renders all 18 badges with correct earned/unearned state and accurate section progress counts matching the stored badge data.
- **SC-007**: The countdown timer value is identical immediately before and immediately after the badge popup appears and dismisses during a game.

---

## Assumptions

- The game's existing per-question answer time is already tracked (or will be added as a prerequisite) — badge checks for "Speed Demon", "Lightning", and "Quick Thinker" depend on per-question elapsed time being available after answer submission.
- "Completing a game" means reaching the Results screen (either by answering all 10 questions, or by stopping early via the Stop Session feature). A game that closes via the browser back button or page refresh does NOT count.
- "Completing a Practice session" means the player reaches the Practice Summary screen. An in-progress or abandoned Practice session does NOT count toward Practice badge counters.
- "3 stars" in the "Comeback Kid" and "Perfectionist" criteria uses the existing `calculateStars` scoring logic already defined in `math-engine.js`.
- "Hearts lost" for "Comeback Kid" means exactly 2 hearts were consumed (wrong answers or timeouts) during the game, regardless of when they were lost.
- The unviewed-badge counter (`mathblaster_badges_new`) increments once per newly earned badge per session; it MUST NOT increment for badges that were already earned.
- The Badges screen is a new screen (`#screen-badges`) added alongside the existing screens. It is not a modal or overlay.
- Badge popup z-index is above all game UI but MUST NOT intercept answer button clicks (the popup must appear after the feedback phase, when answer buttons are inactive).
- Per-question answer time tracking is scoped to the main quiz game only; Practice Mode does not feed into any speed badge.
- The `mathblaster_badges` localStorage key is independent of any existing keys (`mathgame_highscore`, `mathgame_timer`, `mathgame_practice_*`).

---

## Clarifications

### Session 2026-05-01

- Q: When a badge popup is showing mid-game, does the next question's countdown start immediately (running behind the popup) or does it wait until the popup queue drains? → A: Countdown is held — next question loads into the DOM but its countdown does NOT start until the full popup queue has drained.
- Q: What resets the "Lightning" badge fast-answer counter mid-game? → A: Resets on any wrong answer OR any answer ≥ 5 seconds — must be 5 consecutive fast-correct answers.
- Q: For "Time Lord", does completing a game mean reaching Results/Stop Summary, or just starting a game with each timer setting? → A: Must complete a game (reach Results or Stop Session summary screen) using each of the 6 timer settings; cumulative progress persists across sessions.
- Q: For "Operation Master", does an early-stopped Practice session count toward the operation? → A: No — only sessions that reach the Practice Summary screen count; abandoned sessions are ignored.
- Q: When exactly are badge checks triggered after a question? → A: At feedback-end, after all session state (score, streak, answer time) is fully settled and before any round-advance logic begins.
