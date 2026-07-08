import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/theme.css';

// Dev-only dataset integrity check.
if (import.meta.env.DEV) {
  import('./data/validate').then(({ validateDataset }) => {
    const errors = validateDataset();
    if (errors.length) {
      console.error('[dataset] Integrity problems:\n' + errors.map((e) => ` • ${e}`).join('\n'));
    } else {
      console.info('[dataset] OK — validated.');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
