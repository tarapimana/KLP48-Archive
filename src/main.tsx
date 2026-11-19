import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// TEMPORARY: Expose admin permission test helper in development only.
// Remove this block after testing is complete.
if (import.meta.env.DEV) {
  import('./services/liveService').then(({ runAdminPermissionTest }) => {
    (window as unknown as Record<string, unknown>).__runAdminTest = runAdminPermissionTest;
    console.info('[DEV] window.__runAdminTest is available. Run it in the console after signing in as admin.');
  });
}

createRoot(document.getElementById('root')!).render(<App />);
