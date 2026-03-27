import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './index.css';
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext';

const hideInitialLoader = (): void => {
  const loader = document.getElementById('initial-loader');
  if (!loader) return;

  loader.classList.add('is-hidden');
  window.setTimeout(() => {
    loader.remove();
  }, 240);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </HashRouter>
  </StrictMode>,
);

window.requestAnimationFrame(hideInitialLoader);
