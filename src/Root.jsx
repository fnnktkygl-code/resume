import React, { useState, useEffect, lazy, Suspense } from 'react';
const App = lazy(() => import('./App.jsx'));
import Landing from './components/Landing.jsx';

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const Security = lazy(() => import('./pages/Security.jsx'));

const VALID_VIEWS = new Set(['landing', 'app', 'privacy', 'terms', 'security']);

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'landing';
  return VALID_VIEWS.has(hash) ? hash : 'landing';
}

function AppLoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg, #F7F6F3)',
      color: 'var(--color-text, #1A1917)',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
      gap: '16px'
    }}>
      <div style={{
        fontSize: '32px',
        fontWeight: '800',
        letterSpacing: '-0.03em',
        display: 'flex',
        alignItems: 'center',
        gap: '2px'
      }}>
        <span>Resu</span>
        <span style={{ color: 'var(--color-accent, #1B6B3A)' }}>Me</span>
      </div>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(27, 107, 58, 0.2)',
        borderTopColor: 'var(--color-accent, #1B6B3A)',
        borderRadius: '50%',
        animation: 'spinLoader 0.8s linear infinite'
      }} />
      <p style={{
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--color-text-secondary, #6B6860)',
        letterSpacing: '0.01em',
        margin: 0
      }}>
        Chargement de l'atelier...
      </p>
      <style>{`
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
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

  if (view === 'app') return <Suspense fallback={<AppLoadingFallback />}><App /></Suspense>;

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
