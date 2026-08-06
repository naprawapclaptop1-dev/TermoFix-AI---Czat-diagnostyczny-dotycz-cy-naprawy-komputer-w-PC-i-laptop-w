import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent DataCloneError in performance.measure/mark during React profiling / browser hooks
if (typeof window !== 'undefined' && window.performance) {
  const origMeasure = window.performance.measure?.bind(window.performance);
  if (origMeasure) {
    window.performance.measure = function (measureName: string, startMarkOrOptions?: string | PerformanceMeasureOptions, endMark?: string) {
      try {
        return origMeasure(measureName as any, startMarkOrOptions as any, endMark as any);
      } catch (err) {
        console.warn('Caught performance.measure DataCloneError, ignoring:', err);
        return {} as any;
      }
    };
  }

  const origMark = window.performance.mark?.bind(window.performance);
  if (origMark) {
    window.performance.mark = function (markName: string, markOptions?: PerformanceMarkOptions) {
      try {
        return origMark(markName, markOptions);
      } catch (err) {
        console.warn('Caught performance.mark error, ignoring:', err);
        return {} as any;
      }
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for 100% Offline operation for component databases
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[ServiceWorker] Zarejestrowany pomyślnie dla trybu offline:', reg.scope))
      .catch((err) => console.warn('[ServiceWorker] Błąd rejestracji:', err));
  });
}

