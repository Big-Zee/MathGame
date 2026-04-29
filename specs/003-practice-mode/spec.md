# Feature Specification: Practice Mode

**Feature Branch**: `003-practice-mode`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Add a new feature called 'Practice Mode' to Math Blaster — a pressure-free way for kids to drill a specific math operation at their own pace with no timer, no lives, and no game over."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter Practice Mode and Select Operation (Priority: P1)

A child on the Start screen taps "Practice Mode", chooses a math operation (Addition, Subtraction, Multiplication, or Division), then picks a difficulty level (Easy, Medium, Hard) before their first question appears.

**Why this priority**: Without the entry flow and operation/difficulty selection, Practice Mode cannot begin. This is the gateway for every other story.

**Independent Test**: Can be fully tested by navigating from the Start screen through operation selection to difficulty selection, verifying all options appear and a valid selection leads to the practice session.

**Acceptance Scenarios**:

1. **Given** the Start screen is visible, **When** the child taps "Practice Mode", **Then** an operation selection menu appears showing Addition (➕), Subtraction (➖), Multiplication (✖️), and Division (➗).
2. **Given** the operation menu is visible, **When** the child selects an operation, **Then** a difficulty selection screen appears showing Easy, Medium, and Hard options.
3. **Given** the difficulty selection screen is visible, **When** the child selects a difficulty, **Then** the first practice question for that operation and difficulty appears immediately.

---

### User Story 2 - Answer Questions Without Pressure (Priority: P2)

The child sees one question at a time with no countdown timer and no heart/life display. They type their answer and submit via the Enter key or the "Check" button. The question stays on screen indefinitely until they submit.

**Why this priority**: The core value proposition of Practice Mode is the absence of time and life pressure. This is what distinguishes it from the main game.

**Independent Test**: Can be tested by entering a practice session and leaving a question unanswered for 30+ seconds, verifying no timer appears, no lives are deducted, and the question remains unchanged.

**Acceptance Scenarios**:

1. **Given** a practice question is displayed, **When** 30 seconds pass without input, **Then** the question remains unchanged, no timer is shown, and no life is deducted.
2. **Given** a practice question is displayed, **When** the child types a numeric answer and presses Enter, **Then** the answer is submitted and feedback is displayed immediately.
3. **Given** a practice question is displayed, **When** the child clicks "Check", **Then** the answer is submitted and feedback is displayed immediately.

---

### User Story 3 - Receive Friendly Feedback (Priority: P3)

After each answer, the child sees clear, encouraging feedback. Correct answers show a green highlight and an encouraging message with the current streak. Wrong answers show the correct answer kindly with a motivating message. No penalty is ever applied.

**Why this priority**: Feedback is the learning loop. Without it, the practice session has no educational value. Absence of all penalties is essential to the confidence-building purpose.

**Independent Test**: Can be tested by submitting a correct answer and a wrong answer in sequence, verifying correct gets green highlight and streak shown, wrong gets the correct answer revealed with kind language, and no score or life changes in either case.

**Acceptance Scenarios**:

1. **Given** a question is displayed, **When** the child submits the correct answer, **Then** a green highlight appears on the answer field and an encouraging message is shown displaying the current streak count.
2. **Given** a question is displayed, **When** the child submits a wrong answer, **Then** the correct answer is revealed with a kind message (e.g. "Not quite! The answer was [X]. You've got this! 💪"), no penalty is applied, and the child can proceed to the next question.
3. **Given** a correct answer was just shown, **When** the child proceeds to the next question, **Then** the streak counter in the running tally increments by one.

---

### User Story 4 - Monitor Running Tally (Priority: P4)

During the session, the child can always see how many questions they have answered, how many were correct, and their current consecutive-correct streak. The operation and difficulty being practised are shown clearly throughout.

**Why this priority**: The running tally replaces score and lives as the child's sense of progress. It is low-risk to implement and high value for motivation and self-monitoring.

**Independent Test**: Can be tested by answering a mixed sequence of correct and wrong answers, verifying each tally count increments correctly and the streak reflects only consecutive correct answers.

**Acceptance Scenarios**:

1. **Given** a practice session is active, **When** the child answers any question, **Then** the "Questions answered" count increments by 1.
2. **Given** a practice session is active, **When** the child answers correctly, **Then** the "Questions correct" count increments by 1.
3. **Given** the child has answered 3 questions correctly in a row, **When** they answer a 4th correctly, **Then** the streak counter shows 4 and a 🔥 icon is visible.
4. **Given** the session header is visible, **When** the child looks at the screen at any point, **Then** they can see both the current operation (e.g. "➕ Addition") and difficulty (e.g. "Medium").

---

### User Story 5 - Stop Practising and View Summary (Priority: P5)

The child can tap "Stop Practising" at any time. A summary screen shows total questions answered, total correct, accuracy percentage, best streak, and a tailored encouraging message. Two buttons let them practise again (same settings) or return to the Start screen.

**Why this priority**: The graceful exit and summary complete the confidence-building loop with positive reinforcement, and the "Practise Again" button supports repetition without friction.

**Independent Test**: Can be tested by pressing "Stop Practising" after answering at least one question, verifying all five summary statistics are correct, the accuracy-based message matches the right tier, and both action buttons function correctly.

**Acceptance Scenarios**:

1. **Given** a practice session is active, **When** the child taps "Stop Practising", **Then** the summary screen appears showing: total questions answered, correct answers, accuracy %, best streak, and an accuracy-based encouraging message.
2. **Given** accuracy is 90–100%, **When** the summary is shown, **Then** the message "You're a Math Blaster master! 🏆" is displayed.
3. **Given** accuracy is 70–89%, **When** the summary is shown, **Then** "Amazing work, keep it up! 🌟" is displayed.
4. **Given** accuracy is 50–69%, **When** the summary is shown, **Then** "Good effort! A little more practice and you'll ace it! 💪" is displayed.
5. **Given** accuracy is 0–49%, **When** the summary is shown, **Then** "Keep going, every question makes you smarter! 🧠" is displayed.
6. **Given** the summary screen is displayed, **When** the child taps "Practise Again", **Then** a fresh session starts with the same operation and difficulty with all tally counters reset to zero.
7. **Given** the summary screen is displayed, **When** the child taps "Back to Start", **Then** the Start screen is shown.

---

### Edge Cases

- What happens if "Stop Practising" is pressed before any question is answered? The summary screen shows zeroes for all stats; accuracy is shown as 0%; both action buttons still work.
- What happens if the child types a non-numeric character in the answer field? The input is rejected; only numeric characters are accepted; the question stays active.
- What if the same question would be generated again within the session? The generator skips it and selects a different question.
- What if the question pool for a given operation and difficulty is exhausted? [NEEDS CLARIFICATION: behaviour when all unique questions have been shown is not specified]
- What happens when the child uses the browser Back button during practice? The session ends and the Start screen is shown; no summary is displayed for browser-navigated exits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Start screen MUST display a "Practice Mode" button alongside the existing "Play!" button.
- **FR-002**: Practice Mode MUST present an operation selection screen with four options: Addition (➕), Subtraction (➖), Multiplication (✖️), Division (➗).
- **FR-003**: After selecting an operation, Practice Mode MUST present a difficulty selection screen with three options: Easy, Medium, Hard.
- **FR-004**: Difficulty levels MUST control the operand ranges used for question generation; Easy uses small numbers, Medium uses mid-range numbers, Hard uses larger numbers within the ≤ 100 result cap. [NEEDS CLARIFICATION: exact operand ranges per difficulty per operation not defined — main game has no difficulty levels]
- **FR-005**: Each practice question MUST display a text-entry input field for the child to type their answer (not multiple-choice).
- **FR-006**: Practice Mode MUST NOT display a countdown timer or any life/heart indicator at any point.
- **FR-007**: The child MUST be able to submit an answer by pressing Enter or clicking a "Check" button.
- **FR-008**: A correct answer MUST trigger green visual feedback on the answer field and display an encouraging message with the current streak count.
- **FR-009**: A wrong answer MUST reveal the correct answer using a kind message and MUST NOT apply any penalty (no lives lost, no score deducted, no negative indicator).
- **FR-010**: The practice session MUST display a persistent running tally showing: questions answered, questions correct, and current correct-answer streak with 🔥 icon.
- **FR-011**: The currently selected operation and difficulty MUST be visible throughout the practice session.
- **FR-012**: A "Stop Practising" button MUST be visible at all times during the practice session.
- **FR-013**: Tapping "Stop Practising" MUST navigate to a summary screen showing: total questions answered, total correct, accuracy percentage (rounded to nearest whole %), best streak, and an accuracy-based encouraging message.
- **FR-014**: Accuracy-based messages MUST follow these tiers: 90–100% → "You're a Math Blaster master! 🏆"; 70–89% → "Amazing work, keep it up! 🌟"; 50–69% → "Good effort! A little more practice and you'll ace it! 💪"; 0–49% → "Keep going, every question makes you smarter! 🧠".
- **FR-015**: The summary screen MUST provide two buttons: "Practise Again" (same operation/difficulty, fresh session) and "Back to Start" (return to Start screen).
- **FR-016**: Questions within a single session MUST NOT repeat; the generator MUST track previously shown questions by a canonical key (e.g. "operandA-operator-operandB").
- **FR-017**: Division questions MUST produce whole-number answers ≤ 100.
- **FR-018**: Subtraction questions MUST produce non-negative answers ≤ 100.
- **FR-019**: All question results MUST be ≤ 100.
- **FR-020**: No data from a Practice Mode session MUST be written to any leaderboard, score store, or shared persistent state.
- **FR-021**: Practice Mode state MUST be completely isolated from main game state; entering or exiting Practice Mode MUST NOT alter any main game variable.

### Key Entities

- **PracticeSession**: selected operation, selected difficulty, set of shown question keys (for deduplication), total answered, total correct, current streak, best streak
- **PracticeQuestion**: operation type, operand A, operand B, correct answer
- **PracticeSummary**: derived view — total answered, total correct, accuracy %, best streak, message tier

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child can navigate from the Start screen to their first practice question in under 30 seconds without adult assistance.
- **SC-002**: 90% of children aged 9–10 report understanding that Practice Mode has no time limit or lives after completing their first question.
- **SC-003**: A child who answers incorrectly 5 times in a row continues the session without encountering any negative score or life indicator.
- **SC-004**: The running tally updates within 1 second of each answer being submitted.
- **SC-005**: The summary screen appears within 1 second of "Stop Practising" being tapped.
- **SC-006**: "Practise Again" restarts the session with a fresh tally in under 2 seconds.

## Assumptions

- Practice Mode uses a free-text numeric entry answer (not multiple-choice), as the pressure-free format gives children time to think and type without needing scaffolded choices.
- The main game's question generator logic (operand constraints, result caps) is reusable for Practice Mode; difficulty tiers introduce operand ranges that do not exist in the main game.
- No user accounts, login, or persistent history are involved; the practice session is entirely in-memory and discarded on exit.
- The leaderboard referenced in the acceptance criteria ("no score saved to leaderboard") refers to a feature that either already exists in the main game or is planned; Practice Mode must be explicitly excluded regardless.
- "Never repeat" deduplication is achievable for normal session lengths; extreme pool exhaustion is handled by a defined fallback (to be clarified).
- The "Stop Practising" button is always a deliberate child action; no automatic session end occurs.
- Keyboard accessibility (Tab + Enter navigation) applies to Practice Mode to match the main game's accessibility standard.
