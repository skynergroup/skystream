
# ARCHITECTURE.md - System Overview

## Directory Structure

*   `src/app`: Next.js App Router pages.
*   `src/components`: Reusable UI components.
*   `src/services`: API clients and service layers.
*   `src/utils`: Utility functions and configuration.
*   `src/styles`: Global and responsive styles.
*   `public`: Static assets.

## Data Flow

1.  **User Interaction:** User interacts with the UI (e.g., searches for a movie).
2.  **Component:** The component's event handler is triggered.
3.  **Service:** The component calls a function from a service in `src/services`.
4.  **API:** The service makes a request to the TMDB API.
5.  **State Update:** The component updates its state with the fetched data.
6.  **UI Update:** The UI re-renders to display the new data.
