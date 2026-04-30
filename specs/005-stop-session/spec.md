# Feature Specification: Stop Session

**Feature Branch**: `005-stop-session`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Add a 'Stop Session' feature to Math Blaster's main quiz game."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Stop Button on Game Screen (Priority: P1)

During an active quiz round the child sees a small ⛔ Stop button in the top-right corner of the game screen, always visible but visually unobtrusive. The button is absent from Practice Mode and from the Start and Results screens.

**Why this priority**: All other stories are unreachable without this entry point. A child who never taps Stop gets the identical classic experience — making this a safe non-breaking MVP on its own.

**Independent Test**: Start a quiz game. Verify the ⛔ Stop button is visible in the top-right corner of the game screen on every question, including after answering (feedback phase). Navigate to Practice Mode — verify no Stop button appears anywhere in the practice flow. Return to Start screen — verify no Stop button is visible there either.

**Acceptance Scenarios**:

1. **Given** a quiz round is in progress, **When** any question is displayed (question or feedback phase), **Then** the ⛔ Stop button is visible in the top-right area of `#screen-game`.
2. **Given** the player is in Practice Mode, **When** any practice screen (`#screen-practice-op`, `#screen-practice-diff`, `#screen-practice-session`, `#screen-practice-summary`) is active, **Then** no ⛔ Stop button is visible.
3. **Given** the player is on `#screen-start` or `#screen-results`, **When** those screens are shown, **Then** the ⛔ Stop button is not visible.

---

### User Story 2 — Confirmation Prompt Before Stopping (Priority: P2)

When the child taps ⛔ Stop, a confirmation overlay appears over the game UI: "Are you sure you want to stop? 🤔 / Your progress so far will be shown." with two buttons: "Yes, stop 🛑" and "Keep playing ▶️".

**Why this priority**: Prevents accidental session termination. Requires the Stop button (US1) to be tapped first.

**Independent Test**: Start a game, answer one question, tap ⛔ Stop. Verify the confirmation overlay appears with the correct text and both buttons. Tap "Keep playing ▶️" — verify the overlay dismisses and the game is still on the same question with the same score and lives.

**Acceptance Scenarios**:

1. **Given** a quiz round is in progress, **When** the child taps ⛔ Stop, **Then** a confirmation overlay appears with message "Are you sure you want to stop? 🤔" and subtitle "Your progress so far will be shown."
2. **Given** the confirmation overlay is visible, **When** the child taps "Keep playing ▶️", **Then** the overlay dismisses and the quiz resumes in exactly the state it was in before.
3. **Given** the confirmation overlay is visible, **When** the child taps "Yes, stop 🛑", **Then** the session ends and the early-stop summary screen is shown.
4. **Given** the confirmation overlay is visible, **When** the child presses Escape, **Then** the overlay dismisses and the game resumes (same as "Keep playing").

---

### User Story 3 — Timer Pauses During Confirmation (Priority: P3)

The countdown timer pauses immediately when the confirmation overlay appears and resumes from the exact same remaining time if the child chooses "Keep playing ▶️".

**Why this priority**: Without a paused timer a child loses valuable seconds while reading the prompt — unfair and confusing. Depends on US1 and US2.

**Independent Test**: Start a game, wait until ~5 seconds remain on the timer bar. Tap ⛔ Stop. Wait 3 full seconds. Tap "Keep playing ▶️". Verify the timer bar shows approximately the same remaining width as when Stop was tapped, and the countdown continues from that point (not reset).

**Acceptance Scenarios**:

1. **Given** a question is being timed, **When** the confirmation overlay appears, **Then** `session.timerTicks` stops decrementing immediately.
2. **Given** the confirmation overlay is dismissed with "Keep playing ▶️", **When** the game resumes, **Then** `session.timerTicks` is the exact value it held when the overlay appeared, and the countdown interval restarts.
3. **Given** the timer was already stopped (feedback phase between questions), **When** the confirmation overlay is dismissed, **Then** the timer remains stopped as it was — no double-start.

---

### User Story 4 — Early-Stop Summary Screen (Priority: P4)

After confirming stop, a dedicated summary screen shows the child's partial-session stats: questions answered / total, correct and incorrect counts, accuracy %, score, best streak, hearts remaining, a 1–3 star rating based on accuracy of attempted questions, and an accuracy-based encouraging message. The screen header is "Session stopped early 🛑" — visually distinct from the normal results screen.

**Why this priority**: Delivers the core player value of the feature. Depends on US1–3.

**Independent Test**: Answer exactly 6 questions (4 correct, 2 wrong), then confirm stop. Verify: header is "Session stopped early 🛑"; stats show "6 of 10 questions answered", "4 correct ✅", "2 incorrect ❌", "67% accuracy", correct score total, correct hearts remaining, 2-star rating (67% falls in 50-79% band), and the message "Great session, keep building on this! 💪".

**Acceptance Scenarios**:

1. **Given** the child confirms stop after answering 6 questions, **When** the summary appears, **Then** the header reads "Session stopped early 🛑".
2. **Given** the child answered 4 of 6 correctly (67% accuracy on attempted), **When** the summary appears, **Then** 2 stars are awarded (50-79% band).
3. **Given** accuracy is 80-100% on attempted questions, **Then** the message reads "Brilliant effort, you were on fire! 🔥".
4. **Given** accuracy is 50-79% on attempted questions, **Then** the message reads "Great session, keep building on this! 💪".
5. **Given** accuracy is 0-49% on attempted questions, **Then** the message reads "Every question counts, well done for trying! 🧠".
6. **Given** the child stops before answering any questions (0 answered), **When** the summary appears, **Then** all stats show 0, the message reads "You didn't answer any questions yet — give it a go! 😊", and only the "🏠 Main Menu" button is shown.

---

### User Story 5 — Summary Screen Navigation Buttons (Priority: P5)

The early-stop summary screen offers "🏠 Main Menu" (returns to `#screen-start`) and "🔄 Play Again" (starts a new full game with the same timer selection). "🔄 Play Again" is hidden when 0 questions were answered.

**Why this priority**: Navigation back to the game loop. Depends on US4.

**Independent Test**: Stop after answering 1 question. Verify both buttons are visible. Tap "🏠 Main Menu" — verify `#screen-start` is shown. Repeat from start, stop after 1 question, tap "🔄 Play Again" — verify a new 10-question game begins with the same timer setting active.

**Acceptance Scenarios**:

1. **Given** the early-stop summary is shown and ≥1 questions were answered, **When** the child taps "🏠 Main Menu", **Then** `#screen-start` is shown and the game session is cleared.
2. **Given** the early-stop summary is shown and ≥1 questions were answered, **When** the child taps "🔄 Play Again", **Then** a new full 10-question game begins using `TIMER_OPTIONS[selectedTimerIndex]`.
3. **Given** 0 questions were answered, **When** the early-stop summary is shown, **Then** only "🏠 Main Menu" is visible; "🔄 Play Again" is hidden.

---

### User Story 6 — Score Eligible for High Score (Priority: P6)

The score earned in a partial session is saved to the high score on the same terms as a completed game. When the current best score came from an early-stopped session, the high score display on the Start screen shows a 🛑 indicator.

**Why this priority**: Prevents stopping early from feeling like a punishment. Depends on US4–5.

**Independent Test**: Set a new personal best via early stop (ensure no previous high score, or confirm the early-stop score beats it). Return to Start screen. Verify the high score reads "Best: Xpts 🛑". Complete a full game beating that score — verify the 🛑 indicator is gone on the next Start screen load.

**Acceptance Scenarios**:

1. **Given** an early-stop score beats the existing high score, **When** the summary is shown, **Then** the new score is saved and the Start screen shows it with a 🛑 indicator on next load.
2. **Given** the best score was set via an early stop, **When** `#screen-start` loads, **Then** the high score display shows "Best: Xpts 🛑".
3. **Given** the best score was set via a completed game (no early stop), **When** `#screen-start` loads, **Then** the high score shows "Best: Xpts" with no 🛑.
4. **Given** 0 questions were answered on early stop, **When** the summary is shown, **Then** no score is saved regardless of previous high score.

---

### Edge Cases

- **Stop during feedback phase**: The timer is already paused between questions; the confirmation overlay appears; if "Keep playing" is chosen, the game resumes the feedback countdown (the `setTimeout` for `advanceRound` continues).
- **Stop on question 10** (last question, before submitting): Early-stop summary shows 9 or fewer answers.
- **0 questions answered**: Show all-zero summary, special message, only "🏠 Main Menu" — no Play Again, no score save.
- **Escape key dismissal**: Pressing Escape while the confirmation overlay is visible acts as "Keep playing ▶️".
- **Focus management**: When the confirmation overlay appears, focus moves to the "Keep playing ▶️" button (safer default). When dismissed, focus returns to the ⛔ Stop button.
- **Double-tap prevention**: Tapping ⛔ Stop while the confirmation overlay is already visible has no effect.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `#btn-stop-game` (⛔ Stop) MUST be present in the DOM of `#screen-game` and visible at all times while a quiz round is in progress.
- **FR-002**: `#btn-stop-game` MUST NOT appear on `#screen-start`, `#screen-results`, or any `#screen-practice-*` screen.
- **FR-003**: Tapping `#btn-stop-game` MUST show a confirmation overlay (`#stop-confirm-overlay`) with the text "Are you sure you want to stop? 🤔", subtitle "Your progress so far will be shown.", and buttons `#btn-confirm-stop` ("Yes, stop 🛑") and `#btn-keep-playing` ("Keep playing ▶️").
- **FR-004**: When `#stop-confirm-overlay` is shown, the active timer interval MUST be cleared immediately; `session.timerTicks` MUST retain its current value.
- **FR-005**: Tapping `#btn-keep-playing` (or pressing Escape) MUST hide `#stop-confirm-overlay` and restart the countdown from the preserved `session.timerTicks` — no reset, no additional decrement.
- **FR-006**: Tapping `#btn-confirm-stop` MUST end the session and navigate to `#screen-stop-summary`.
- **FR-007**: `#screen-stop-summary` MUST display the "Session stopped early 🛑" header and all of: questions answered / total (e.g. "6 of 10 questions answered"), correct count (e.g. "4 correct ✅"), incorrect count (e.g. "2 incorrect ❌"), accuracy % (e.g. "67% accuracy"), score, best streak 🔥, hearts remaining ❤️, star rating (1–3), and accuracy-based message.
- **FR-008**: Star rating on `#screen-stop-summary` is accuracy-based (attempted questions only): 3 stars = 80-100%, 2 stars = 50-79%, 1 star = 0-49%. This is distinct from the score-based `calculateStars` used on `#screen-results`.
- **FR-009**: Accuracy messages: 80-100% → "Brilliant effort, you were on fire! 🔥"; 50-79% → "Great session, keep building on this! 💪"; 0-49% → "Every question counts, well done for trying! 🧠".
- **FR-010**: When `session.questionsAnswered === 0`, `#screen-stop-summary` MUST show all zero stats, the message "You didn't answer any questions yet — give it a go! 😊", and ONLY `#btn-stop-main-menu`. `#btn-stop-play-again` MUST be hidden.
- **FR-011**: When `session.questionsAnswered >= 1`, both `#btn-stop-main-menu` ("🏠 Main Menu") and `#btn-stop-play-again` ("🔄 Play Again") MUST be visible.
- **FR-012**: `#btn-stop-main-menu` MUST show `#screen-start` and clear `session`.
- **FR-013**: `#btn-stop-play-again` MUST start a new full game via `startGame(TIMER_OPTIONS[selectedTimerIndex])`.
- **FR-014**: When `session.questionsAnswered >= 1` and the current `session.score` is greater than the stored high score, the score MUST be saved via `setHighScore` and a 🛑 flag stored in `localStorage` under key `mathgame_highscore_early` (value `"1"`).
- **FR-015**: When the current best high score has the 🛑 flag set, `#screen-start` high score display MUST append " 🛑" to the display string (e.g. "Best: 40pts 🛑"). When a completed-game score replaces it, the 🛑 flag MUST be cleared.

### Key Entities

- **ConfirmationState**: Transient overlay state; no new persistent fields needed.
- **EarlyStopHighScoreFlag**: `localStorage` key `mathgame_highscore_early` — `"1"` when best score is from an early-stopped session; absent or `"0"` otherwise.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The ⛔ Stop button is visible within one animation frame of the game screen rendering — verified by DOM presence check.
- **SC-002**: Timer bar width is identical (within ±1 CSS pixel) immediately before and immediately after the confirmation overlay is dismissed via "Keep playing ▶️".
- **SC-003**: All stats on `#screen-stop-summary` are arithmetically correct for any combination of `questionsAnswered` (0–10) and `correctAnswers` (0–questionsAnswered).
- **SC-004**: Practice Mode (`#screen-practice-session`) never shows `#btn-stop-game` under any test configuration.
- **SC-005**: The 🛑 high score flag appears on `#screen-start` on next load after an early-stop session sets a new best, and is absent after a completed-game score replaces it.

---

## Assumptions

- The current game has no multi-entry leaderboard — only a single `localStorage` high score. "Leaderboard eligibility" therefore means: the early-stop score is compared against `mathgame_highscore` and saved if it is higher, using the existing `setHighScore` function. A separate boolean flag (`mathgame_highscore_early`) indicates whether the saved score came from an early stop. No name-entry screen is added.
- The confirmation overlay is a custom HTML element (not a native browser `confirm()` dialog), allowing programmatic timer pausing and accessible focus management.
- "Same timer settings for Play Again" means re-using `TIMER_OPTIONS[selectedTimerIndex]` from in-memory state — no additional `localStorage` key needed.
- The new star rating (accuracy-based, 80/50 thresholds) is calculated inline on the stop summary — it does not replace or modify the existing `calculateStars(score, config)` export in `math-engine.js`.
- Practice Mode's "Stop Practising" button is unaffected; this feature touches only `#screen-game` and the new `#screen-stop-summary`.
- `#screen-results` (normal game end) is visually and functionally unchanged.
- No modifications to `js/math-engine.js` are required.

---

## Clarifications

### Session 2026-04-30

- Q: What does "leaderboard" mean in the context of the current codebase? → A: The game currently has only a single `localStorage` high score (no multi-entry leaderboard). "Leaderboard eligibility" is interpreted as: early-stop scores are saved on the same terms as completed-game scores (highest score wins). A `localStorage` flag (`mathgame_highscore_early`) marks the saved score as partial. A full multi-entry leaderboard is out of scope for this feature.
