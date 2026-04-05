
# AGENTS.md - Stack & Patterns

## Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **UI Library:** React 19
*   **Styling:** CSS Modules, CSS Variables
*   **API:** TMDB API
*   **Testing:** Jest, React Testing Library

## Testing Patterns

*   Tests are co-located in `__tests__` directories within `src/components` and `src/utils`.
*   CSS files are mocked using `jest.mock`.
*   Focus on testing component rendering, user interactions, and state changes.
