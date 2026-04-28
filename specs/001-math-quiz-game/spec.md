# Feature Specification: Math Quiz Game

**Feature Branch**: `001-math-quiz-game`
**Created**: 2026-04-28
**Amended**: 2026-04-28
**Status**: Amended
**Input**: User description: "Build a fun math quiz game for 9-10 year olds covering addition,
subtraction, multiplication and division. Kids earn points, have 3 lives (hearts), face a 15-second
timer per question, get streak bonuses, see emoji feedback, and a star rating at the end."
**Amendment**: Timer increased from 10 s to 15 s; +5 bonus points awarded for answers within 8 s;
all question results capped at ≤ 100.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Full Game Round (Priority: P1)

A child opens the game, starts a quiz, answers questions one-by-one against a 15-second countdown,
receives emoji feedback after each answer, and reaches an end screen with a star rating and final
score.

**Why this priority**: This is the complete core game loop. Every other feature exists to enhance
this flow. Without it, there is no game.

**Independent Test**: Can be fully tested by a single player completing a round from the Start
screen through to the Results screen, verifying all 10 questions are presented, feedback shown,
and star rating displayed.

**Acceptance Scenarios**:

1. **Given** the game is on the Start screen, **When** the player taps "Play", **Then** the first
   question appears with four answer choices and a 15-second countdown begins.
2. **Given** a question is displayed, **When** the player selects the correct answer before the
   timer reaches zero, **Then** a positive emoji (e.g. ✅ or 🎉) is displayed and the next
   question loads.
3. **Given** a question is displayed, **When** the timer counts down to zero without an answer,
   **Then** a wrong-answer emoji is shown, the correct answer is revealed, and one heart is
   removed.
4. **Given** all 10 questions have been answered (or 3 lives lost), **When** the round ends,
   **Then** the Results screen shows total score, correct answer count, and a 1–3 star rating.

---

### User Story 2 - Lose a Life for Wrong Answers (Priority: P2)

The player starts with 3 heart icons. Each wrong answer or timer expiry costs one heart. When all
3 hearts are gone the game ends early and the Results screen appears.

**Why this priority**: The lives system creates the primary tension and risk that makes the game
engaging. It's the second-most critical mechanic after the core question loop.

**Independent Test**: Can be tested by deliberately answering every question incorrectly and
verifying hearts decrement correctly, game ends after the third wrong answer, and the Results
screen appears with the appropriate score.

**Acceptance Scenarios**:

1. **Given** the game has started, **When** the player gives a wrong answer, **Then** one heart
   icon changes to an empty/broken state and the remaining heart count decreases by one.
2. **Given** the player has 1 heart remaining, **When** they give a wrong answer, **Then** all
   hearts are empty, the round ends immediately, and the Results screen appears.
3. **Given** a question is active, **When** the 15-second timer expires, **Then** it is treated
   identically to a wrong answer (one heart lost, correct answer shown, no timer bonus awarded).

---

### User Story 3 - Earn Points and Streak Bonuses (Priority: P3)

The player earns base points for each correct answer. Answering 3 or more questions correctly in
a row activates a streak multiplier that increases the points awarded per correct answer.

**Why this priority**: Points and streaks add depth and replay motivation once the core loop and
lives system work.

**Independent Test**: Can be tested by answering multiple consecutive correct answers and
verifying the streak indicator activates at 3-in-a-row, bonus points are added on top of the
base award, and a single wrong answer resets the streak counter to zero.

**Acceptance Scenarios**:

1. **Given** a correct answer is submitted, **When** it is the player's first, second, or
   non-consecutive correct answer, **Then** base points (10 pts) are added to the score.
2. **Given** the player has answered 3 consecutive questions correctly, **When** they answer the
   4th correctly, **Then** a streak indicator appears and bonus points (5 pts extra) are added on
   top of base points.
3. **Given** a streak is active, **When** the player gives a wrong answer or the timer expires,
   **Then** the streak counter resets to zero and no bonus points are awarded for the next
   correct answer.
4. **Given** a question is displayed, **When** the player answers correctly within 8 seconds,
   **Then** an extra 5 bonus points are added to their score in addition to any base or streak
   points; answering after 8 seconds awards no timer bonus.

---

### Edge Cases

- What happens when the player answers on the last frame of the timer (at exactly 0)?
  The answer is treated as correct if submitted before the timer fully expires; a simultaneous
  tap and expiry favours the player.
- What if the same wrong answer is generated as a multiple-choice option twice?
  The question generator MUST ensure all four answer choices are unique.
- What happens if the device/browser tab is hidden mid-question?
  The timer continues counting; no pause mechanic is required for v1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST present exactly 10 questions per round (unless all 3 lives are
  lost earlier).
- **FR-002**: Each question MUST be drawn randomly from the four operations: addition,
  subtraction, multiplication, and division.
- **FR-003**: All numbers used in questions MUST be appropriate for ages 9–10:
  operands chosen so that the result of every operation is ≤ 100; multiplication operands
  MUST be in the range 1–12 with their product ≤ 100; addition operands MUST be chosen so
  their sum ≤ 100; subtraction MUST produce a positive result ≤ 100; division MUST produce
  a whole-number result ≤ 100.
- **FR-004**: Each question MUST display exactly 4 multiple-choice answer options; one option
  MUST be the correct answer; all four options MUST be unique.
- **FR-005**: A 15-second countdown timer MUST be visible and actively counting down from the
  moment a question appears.
- **FR-006**: Timer expiry MUST be treated as a wrong answer: one life is deducted and the
  correct answer is revealed before the next question loads.
- **FR-007**: The player MUST start each round with exactly 3 lives represented by heart icons.
- **FR-008**: Each wrong answer or timer expiry MUST deduct exactly one heart; when all 3 hearts
  are gone the round MUST end immediately.
- **FR-009**: A correct answer MUST award 10 base points.
- **FR-010**: Answering 3 or more consecutive questions correctly MUST activate a streak state;
  while streak is active, each correct answer MUST award 15 points instead of 10.
- **FR-011**: A wrong answer or timer expiry MUST reset the streak counter to zero.
- **FR-012**: Emoji feedback (distinct positive vs. negative) MUST be displayed immediately after
  each answer or timer expiry.
- **FR-013**: The Results screen MUST display: total score, number of correct answers out of 10,
  and a star rating of 1–3 stars.
- **FR-014**: Star rating MUST be determined by score: 1 star = any completed round; 2 stars =
  70 pts or more; 3 stars = 130 pts or more (achievable with a full streak run).
- **FR-015**: The player MUST be able to start a new round from the Results screen without
  reloading the page.
- **FR-016**: A correct answer submitted within 8 seconds of a question appearing MUST award
  an additional 5 bonus points on top of any base or streak points for that answer.

### Key Entities

- **Question**: math operation type, two operands, correct answer, four displayed choices
- **GameSession**: current score, lives remaining, streak counter, question index,
  list of questions for the round
- **PlayerResult**: final score, correct answer count, star rating (1–3)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 9–10 can start and complete a full round without adult assistance
  during usability testing.
- **SC-002**: The timer countdown is understood as a time limit by 90% of test players without
  verbal explanation.
- **SC-003**: The hearts/lives mechanic is understood by 90% of test players on first play.
- **SC-004**: Emoji feedback is perceived as clearly positive or negative by 95% of test players.
- **SC-005**: The star rating on the Results screen is perceived as fair by 80% of test players
  when shown their score.
- **SC-006**: A new round can be started from the Results screen in under 5 seconds.
- **SC-007**: The game is fully playable using keyboard alone (Tab + Enter) to satisfy
  accessibility requirements.

## Assumptions

- Answer input is multiple-choice (4 options); free-text entry is out of scope for v1 to keep
  the experience accessible and fast for young players.
- A round consists of exactly 10 questions.
- Difficulty is fixed (no difficulty selection screen); problems are randomly generated within
  the grade 4–5 number range defined in FR-003, with all results capped at ≤ 100.
- Operations are mixed randomly within a round; the player does not choose operation types.
- Score and progress are session-only; no persistent storage or user accounts in v1.
- The game targets a single player on a single device at a time; multiplayer is out of scope.
- A "pause" feature is out of scope for v1; the timer runs regardless of tab visibility.
- The timer bonus threshold (8 seconds) is measured from the moment the question first appears
  on screen; the 15-second total limit gives players a comfortable window to think before the
  bonus window closes.
