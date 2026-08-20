// Trigger Github Sync (Video Fix)
// Atualizacao manual para o GitHub (2026-08-20)
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/notifications';
import { initAudioUnlock } from './utils/sound';

// Pre-register service worker for push and background notifications
registerServiceWorker();
initAudioUnlock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
