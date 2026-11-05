// Safeguard against browser performance.measure DataCloneError/out of memory errors in React 19 development mode
if (typeof window !== 'undefined' && window.performance && typeof window.performance.measure === 'function') {
  const origMeasure = window.performance.measure.bind(window.performance);
  window.performance.measure = function (name: string, ...rest: any[]) {
    try {
      return origMeasure(name, ...rest);
    } catch {
      try {
        return origMeasure(name);
      } catch {
        return undefined as any;
      }
    }
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
