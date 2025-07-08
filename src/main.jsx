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
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
