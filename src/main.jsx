import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Initialize LocatorJS in development mode
if (import.meta.env.DEV) {
  import('@locator/runtime').then((module) => {
    const setupLocatorUI = module.default || module.setupLocatorUI;
    if (setupLocatorUI) {
      setupLocatorUI();
    }
  });

  // Enable analytics for development/testing
  import('./utils/consentManager.js').then((module) => {
    const consentManager = module.default;
    // Auto-enable analytics in development for testing
    setTimeout(() => {
      consentManager.enableAnalyticsForTesting();
    }, 1000); // Delay to ensure DOM is ready
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
