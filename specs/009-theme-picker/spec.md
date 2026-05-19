# Feature Specification: Theme Picker

**Feature Branch**: `009-theme-picker`  
**Created**: 2026-05-19  
**Status**: Draft  
**Input**: User description: "Add a new feature called Theme Picker to Math Blaster"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Theme Picker from Start Screen (Priority: P1)

A child on the start screen sees a clearly labelled Theme button and taps it to open the Theme Picker. The Theme Picker shows all 6 available themes as visual preview cards so the child can see what each one looks like.

**Why this priority**: This is the entry point to the entire feature. Without it, no theme can be selected. It is the minimum required to deliver any value from Theme Picker.

**Independent Test**: Can be fully tested by navigating to the start screen, tapping the Theme button, and confirming the Theme Picker screen opens displaying 6 preview cards.

**Acceptance Scenarios**:

1. **Given** the child is on the start screen, **When** they tap the "🎨 Theme" button, **Then** the Theme Picker screen opens displaying all 6 theme preview cards.
2. **Given** the Theme Picker is open, **When** the child views a preview card, **Then** the card shows the theme's name and emoji, a colour swatch strip (background gradient, primary colour, accent colour), a sample button styled in that theme, and a ✅ checkmark if it is the currently active theme.
3. **Given** the Theme Picker is open, **When** no theme has been previously saved, **Then** the Space theme card is marked as active with a ✅ checkmark.

---

### User Story 2 - Select and Apply a Theme Instantly (Priority: P2)

A child taps one of the 6 theme preview cards. The entire game — including the Theme Picker screen itself — transitions to the new visual appearance within 300 milliseconds, with a smooth colour fade rather than an abrupt snap.

**Why this priority**: Immediate live preview is the core value of the feature. A child must see results of their choice straight away.

**Independent Test**: Can be fully tested by opening the Theme Picker and tapping each of the 6 themes, verifying the screen itself updates with the new colours and the selection checkmark moves to the tapped card.

**Acceptance Scenarios**:

1. **Given** the Theme Picker is open, **When** the child taps a theme card, **Then** the colours of the Theme Picker screen immediately begin transitioning to the new theme.
2. **Given** the child has tapped a theme, **When** the transition completes, **Then** it has taken no more than 300 milliseconds and the transition felt smooth (fade rather than instant snap).
3. **Given** the child has tapped a theme, **When** the transition completes, **Then** the ✅ checkmark has moved to the newly selected theme card and all other cards no longer show the checkmark.
4. **Given** the child taps a theme that is already active, **When** the tap is processed, **Then** no change occurs (the active theme remains selected).

---

### User Story 3 - Consistent Theming Across All Screens (Priority: P3)

After choosing a theme, the child navigates away from the Theme Picker. Every screen they visit — Difficulty selection, Game, Results, Leaderboard, Badges, Practice Mode — reflects the chosen theme throughout.

**Why this priority**: If theming is incomplete (some screens look different), the immersion is broken and the feature feels broken. Full consistency is necessary for the feature to feel polished.

**Independent Test**: Can be fully tested by selecting a non-default theme, returning to the start screen, and navigating to each of the 7 other screen types, confirming each applies the chosen theme's colours, button style, and decorative elements.

**Acceptance Scenarios**:

1. **Given** the child has selected a theme, **When** they return to the start screen, **Then** the start screen displays the chosen theme's colours, button styles, and decorative elements.
2. **Given** the child has selected a theme, **When** they play a game round (Difficulty → Game → Results), **Then** all three screens display the chosen theme consistently.
3. **Given** the child has selected a theme, **When** they open the Leaderboard or Badges screen, **Then** those screens also display the chosen theme.
4. **Given** the child has selected a theme, **When** they enter Practice Mode, **Then** all Practice Mode screens display the chosen theme.
5. **Given** a theme is active, **When** any screen renders, **Then** no hardcoded colours from a different theme appear on that screen.

---

### User Story 4 - Theme Remembered Across Sessions (Priority: P4)

A child picks their favourite theme, closes the browser, and reopens Math Blaster later. The game opens directly in their chosen theme without them needing to pick again.

**Why this priority**: Persistence makes personalisation meaningful. Without it, children must re-select their theme every visit, which is frustrating and undermines the feature's purpose.

**Independent Test**: Can be fully tested by selecting a non-default theme, closing the browser entirely, reopening the game, and confirming the same theme is applied without any interaction.

**Acceptance Scenarios**:

1. **Given** the child has selected the Ocean theme and closes the browser, **When** they reopen Math Blaster, **Then** the game opens in the Ocean theme automatically.
2. **Given** no theme preference has ever been saved, **When** the child opens Math Blaster, **Then** the game opens in the Space (default) theme.
3. **Given** the child changes their theme from Ocean to Jungle and closes the browser, **When** they reopen Math Blaster, **Then** the game opens in Jungle (the most recently selected theme).

---

### User Story 5 - Return to Start Screen Without Picking (Priority: P5)

A child opens the Theme Picker but decides not to change their theme. They tap the Back to Menu button and return to the start screen with their current theme unchanged.

**Why this priority**: An exit path is required for good UX. Children must never feel trapped in the Theme Picker.

**Independent Test**: Can be fully tested by opening the Theme Picker, tapping Back to Menu without selecting a theme, and confirming the start screen is shown with the previous theme still active.

**Acceptance Scenarios**:

1. **Given** the Theme Picker is open, **When** the child taps "🏠 Back to Menu", **Then** they are returned to the start screen.
2. **Given** the child returns to the start screen without changing the theme, **When** the start screen is displayed, **Then** the same theme that was active before opening the Theme Picker is still applied.

---

### User Story 6 - Theme Picker Not Accessible During Active Play (Priority: P6)

The Theme button is absent when the child is in an active game session or Practice Mode. They cannot open the Theme Picker mid-game.

**Why this priority**: Prevents disruptive theme changes during gameplay that could disorient the child or interfere with active scoring.

**Independent Test**: Can be fully tested by starting a game or Practice Mode session and confirming no Theme button or path to the Theme Picker is present on any in-session screen.

**Acceptance Scenarios**:

1. **Given** the child is on the game screen answering questions, **When** they look for a Theme button, **Then** no Theme button is present on the game screen.
2. **Given** the child is in Practice Mode, **When** they look for a Theme button, **Then** no Theme button is present on any Practice Mode screen.
3. **Given** the child is on the start screen, **When** they view available buttons, **Then** the "🎨 Theme" button is visible and accessible.

---

### Edge Cases

- What happens when the browser's local storage is cleared or unavailable? → The game falls back to the Space (default) theme gracefully, with no error shown to the child.
- What happens if a theme's decorative emoji elements overlap a button? → Decorative elements are placed in a background layer and never block or interfere with any interactive element.
- What happens when the child rapidly taps multiple themes in quick succession? → The final tapped theme is applied; intermediate rapid changes may be visually collapsed but must not leave the UI in an inconsistent state.
- What happens on a very narrow mobile screen? → Theme preview cards switch to a single-column layout so all 6 cards remain usable without horizontal scrolling.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a "🎨 Theme" button on the start screen that opens the Theme Picker.
- **FR-002**: The Theme Picker MUST display all 6 themes (Space, Ocean, Jungle, Volcano, Candy, Midnight) as interactive preview cards arranged in a 2-column grid on standard screens and a 1-column layout on narrow mobile screens.
- **FR-003**: Each theme preview card MUST display: the theme's name and emoji, a colour swatch strip showing the background gradient, primary colour, and accent colour, a sample button styled in that theme's button style, and a ✅ checkmark when that theme is currently active.
- **FR-004**: Tapping a theme preview card MUST apply that theme to the entire game immediately, including the Theme Picker screen itself (live preview), without requiring a page reload or confirmation step.
- **FR-005**: Theme changes MUST complete their visual transition within 300 milliseconds using a smooth fade effect (not an instantaneous colour snap).
- **FR-006**: The applied theme MUST be consistent across all game screens: Start, Difficulty selection, Game (question card, HUD, timer bar, buttons), Results/summary, Leaderboard, Badges, and all Practice Mode screens.
- **FR-007**: Decorative emoji elements defined for each theme MUST appear in the background of themed screens and MUST NOT obstruct or intercept any interactive element (buttons, inputs, cards).
- **FR-008**: The player's selected theme MUST be saved to browser storage and automatically restored the next time the game is opened.
- **FR-009**: When no saved theme preference exists, the game MUST default to the Space theme.
- **FR-010**: The Theme Picker MUST be accessible from the start screen only. No route to the Theme Picker MAY exist from the game screen, results screen, leaderboard screen, badges screen, or any Practice Mode screen.
- **FR-011**: The Theme Picker MUST include a "🏠 Back to Menu" button that returns the child to the start screen without requiring a theme change.
- **FR-012**: All 6 themes MUST maintain text-on-card-background contrast that meets WCAG AA accessibility standards (minimum 4.5:1 contrast ratio for normal text).
- **FR-013**: Theme Picker MUST NOT alter any game logic, scoring rules, timer behaviour, leaderboard data, achievement badge rules, or Practice Mode behaviour.

### Key Entities

- **Theme**: A named visual style identified by a unique ID. Each theme has: a name, an emoji, a background gradient (start and end colours), a primary colour, an accent colour, a button style variant, and a set of decorative emoji elements. The 6 defined themes are: Space (default), Ocean, Jungle, Volcano, Candy, Midnight.
- **Theme Preference**: The record of which theme the player has chosen. Stored in the browser between sessions. Contains a single value: the ID of the active theme. Defaults to "space" when absent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Children can open the Theme Picker, browse all 6 themes, select one, and return to the start screen in under 30 seconds.
- **SC-002**: The chosen theme is applied consistently to 100% of game screens — no screen retains colours from a previously active theme.
- **SC-003**: The player's theme preference is restored correctly on 100% of subsequent browser sessions after the initial selection.
- **SC-004**: Theme transitions are completed within 300 milliseconds, perceptibly smooth — no abrupt colour jumps visible to the user.
- **SC-005**: All 6 themes pass WCAG AA contrast checks (4.5:1 minimum) for text displayed on question card backgrounds.
- **SC-006**: Zero changes to game score, timer, leaderboard standings, achievement badge criteria, or Practice Mode behaviour result from changing a theme.
- **SC-007**: Theme preview cards display as a 2-column grid on standard screens and switch to a single-column layout on narrow mobile screens — all 6 theme cards are reachable without horizontal scrolling on any supported device.

## Assumptions

- The game already has a start screen with sufficient space and layout flexibility to accommodate a new Theme button without disrupting existing buttons.
- The Space theme (deep navy/dark purple with electric blue and purple accents) is the current visual style of Math Blaster and becomes the official default theme; existing hardcoded colours will be migrated to the Space theme definition.
- "Before or during play" in the feature overview means before starting a session (from the start screen), not during active gameplay; the Theme Picker is not accessible mid-game as clarified by the acceptance criteria.
- Players are children aged approximately 6–12; all interactive elements must be large, clearly labelled, and immediately understandable without instructions.
- All screens listed in FR-006 (Start, Difficulty, Game, Results, Leaderboard, Badges, Practice Mode) already exist in the current game and do not need to be created as part of this feature.
- Decorative emoji elements are cosmetic only; their exact positions, sizes, and density are left to the designer within the constraint that they never block interactive elements.
- The feature is delivered as an enhancement to the existing single-page browser-based game; no server-side storage or user accounts are required.
