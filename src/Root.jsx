import React, { useState, useEffect, lazy, Suspense } from 'react';
import App from './App.jsx';
import Landing from './components/Landing.jsx';

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const Security = lazy(() => import('./pages/Security.jsx'));

const VALID_VIEWS = new Set(['landing', 'app', 'privacy', 'terms', 'security']);

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'landing';
  return VALID_VIEWS.has(hash) ? hash : 'landing';
}

export default function Root() {
  const [view, setView] = useState(getViewFromHash);

  useEffect(() => {
    const onHashChange = () => setView(getViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (target) => {
    window.location.hash = target === 'landing' ? '' : target;
  };

  if (view === 'app') return <App />;

  const lazyPage = (() => {
    switch (view) {
      case 'privacy': return <PrivacyPolicy onBack={() => navigate('landing')} />;
      case 'terms': return <TermsOfService onBack={() => navigate('landing')} />;
      case 'security': return <Security onBack={() => navigate('landing')} />;
      default: return null;
    }
  })();

  if (lazyPage) {
    return <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>{lazyPage}</Suspense>;
  }

  return <Landing onStart={() => navigate('app')} onNavigate={navigate} />;
}
