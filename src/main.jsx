import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './Root.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/roboto/latin.css'
import '@fontsource/roboto/latin-ext.css'
import '@fontsource/open-sans/latin.css'
import '@fontsource/open-sans/latin-ext.css'
import '@fontsource/lato/latin.css'
import '@fontsource/lato/latin-ext.css'
import '@fontsource/lora/latin.css'
import '@fontsource/lora/latin-ext.css'
import '@fontsource/merriweather/latin.css'
import '@fontsource/merriweather/latin-ext.css'
import '@fontsource/outfit/latin.css'
import '@fontsource/outfit/latin-ext.css'
import './index.css'
import { globalTooltipManager } from './utils/tooltipManager'

try {
  globalTooltipManager.init();
} catch (e) {
  console.warn('Tooltip manager init warning:', e);
}

import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import 'mobile-drag-drop/default.css';

try {
  polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
    holdToDrag: 300
  });
} catch (e) {
  console.warn('Mobile drag drop polyfill warning:', e);
}

try {
  window.addEventListener('touchmove', function() {}, {passive: false});
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
)
