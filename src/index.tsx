import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// hydrateRoot (not createRoot) so React adopts the build-time pre-rendered DOM
// instead of discarding and re-rendering it — keeps LCP at the pre-render paint
// (~1.3s) instead of gating it on JS execution (~4-5s on throttled mobile).
ReactDOM.hydrateRoot(
  rootElement,
  <React.StrictMode>
    <App />
  </React.StrictMode>
);