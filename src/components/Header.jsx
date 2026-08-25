import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function FlagIcon({ lang, size = 16 }) {
  if (lang === 'fr') {
    return (
      <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 3 2" style={{ borderRadius: '2px', flexShrink: 0, boxShadow: '0 0 1px rgba(0,0,0,0.3)', verticalAlign: 'middle' }}>
        <rect width="1" height="2" fill="#002395" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#ED2939" />
      </svg>
    );
  }
  if (lang === 'es') {
    return (
      <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 3 2" style={{ borderRadius: '2px', flexShrink: 0, boxShadow: '0 0 1px rgba(0,0,0,0.3)', verticalAlign: 'middle' }}>
        <rect width="3" height="0.5" fill="#AA151B" />
        <rect width="3" height="1" y="0.5" fill="#F1BF00" />
        <rect width="3" height="0.5" y="1.5" fill="#AA151B" />
      </svg>
    );
  }
  return (
    <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 60 30" style={{ borderRadius: '2px', flexShrink: 0, boxShadow: '0 0 1px rgba(0,0,0,0.3)', verticalAlign: 'middle' }}>
      <clipPath id="header-uk-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="header-uk-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#header-uk-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#header-uk-diag)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

export default function Header({
  t,
  theme,
  toggleTheme,
  language,
  handleLanguageChange,
  hasContent,
  onSave,
  saveStatus,
  setIsCoverLetterModalOpen,
  setIsCareerOpsOpen,
  setShowImportModal,
  setIsCvManagerOpen,
  loadDemoData,
  setShowClearConfirm,
  setIsDailyTipOpen
}) {
  const tr = typeof t === 'function' ? t : ((k) => k);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 60, right: 16 });
  const menuRef = useRef(null);
  const langRef = useRef(null);

  const toggleMenu = () => {
    if (!mobileMenuOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right)
      });
    }
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click was inside menuRef or inside the portal
      const portalEl = document.getElementById('header-menu-portal-root');
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target) &&
        (!portalEl || !portalEl.contains(e.target))
      ) {
        setMobileMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="logo logo-btn"
          onClick={() => { window.location.hash = ''; }}
          title={tr('Back to home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Resu<span className="logo-accent">Me</span>
        </button>
        <span className="badge">ATS Ready</span>
      </div>
      
      <div className="header-right">
        <span 
          className="privacy-note desktop-only"
          data-tooltip={tr('Toutes vos données restent stockées localement dans votre navigateur')}
          data-tooltip-pos="bottom"
          style={{ cursor: 'help' }}
        >
          <i className="fi fi-rr-lock"></i>
          <span className="privacy-note-text">{tr('100% Local & Privé')}</span>
        </span>

        {/* 1. Primary Action: Save Resume */}
        <button
          className={`btn-demo btn-save-resume ${saveStatus === 'saved' ? 'btn-save-success' : ''}`}
          onClick={onSave}
          aria-label={saveStatus === 'saved' ? tr('Saved!') : tr('Save')}
          data-tooltip={tr('Save current resume to My Resumes')}
          data-tooltip-pos="bottom"
        >
          <i className={`fi ${saveStatus === 'saved' ? 'fi-rr-check' : 'fi-rr-disk'}`}></i>
          <span className="desktop-only">{saveStatus === 'saved' ? tr('Saved!') : tr('Save')}</span>
        </button>

        {/* 2. Desktop Button: Manage Resumes */}
        <button
          className="btn-demo desktop-only header-btn-secondary"
          style={{ border: '1px solid var(--color-border)' }}
          onClick={() => setIsCvManagerOpen(true)}
          data-tooltip={tr('Manage, duplicate and organize your resume versions')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-folder"></i> <span>{tr('My Resumes')}</span>
        </button>

        {/* 3. Desktop Button: Import CV */}
        <button 
          className="btn-demo btn-import-primary desktop-only header-btn-secondary" 
          onClick={() => setShowImportModal(true)}
          data-tooltip={tr('Import and analyze an existing CV (PDF, JSON)')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-magic-wand"></i> <span>{tr('Import CV')}</span>
        </button>

        {/* 4. Core Feature: CareerOps */}
        <button
          className="btn-demo btn-careerops-nav desktop-only"
          onClick={() => setIsCareerOpsOpen && setIsCareerOpsOpen(true)}
          data-tooltip={tr('Smart Job Search, ATS Matcher & 1-Click Apply (In active development)')}
          data-tooltip-pos="bottom"
        >
          <span>🎯 CareerOps</span>
          <span className="careerops-beta-chip">
            {tr('Beta')}
          </span>
        </button>

        {/* 5. Cover Letter Generator */}
        <button 
          className="btn-demo desktop-only header-btn-secondary" 
          style={{ border: '1px solid var(--color-border)' }} 
          onClick={() => setIsCoverLetterModalOpen(true)}
          data-tooltip={tr('Generate tailored cover letter with AI')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-document-signed"></i> <span>{tr('Cover Letter')}</span>
        </button>

        {/* Overflow Menu (More Options Button) */}
        <div className="header-overflow-menu" ref={menuRef}>
          <button
            className="mobile-menu-btn header-more-btn"
            onClick={toggleMenu}
            aria-label={tr('More options')}
            aria-expanded={mobileMenuOpen}
          >
            <i className="fi fi-rr-menu-dots"></i>
          </button>
        </div>

        {/* Multiplatform Vector Flag Language Selector */}
        <div className="header-language-menu" ref={langRef} style={{ position: 'relative' }}>
          <button 
            className="btn-demo" 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label={tr('Change language')}
            style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FlagIcon lang={language || 'en'} size={16} />
            <span style={{ fontSize: '11.5px', fontWeight: '700' }}>{(language || 'en').toUpperCase()}</span>
            <i className="fi fi-rr-angle-small-down" style={{ fontSize: '10px', opacity: 0.7 }}></i>
          </button>
          
          {langMenuOpen && (
            <div className="header-dropdown open" style={{ right: 0, left: 'auto', minWidth: '130px', top: '100%', marginTop: '6px', padding: '4px', background: 'var(--color-surface)', zIndex: 10001, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <button 
                className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('en'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: language === 'en' ? '700' : '500' }}
              >
                <FlagIcon lang="en" size={16} />
                <span>English</span>
                {language === 'en' && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
              </button>
              <button 
                className={`dropdown-item ${language === 'fr' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('fr'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: language === 'fr' ? '700' : '500' }}
              >
                <FlagIcon lang="fr" size={16} />
                <span>Français</span>
                {language === 'fr' && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
              </button>
              <button 
                className={`dropdown-item ${language === 'es' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('es'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: language === 'es' ? '700' : '500' }}
              >
                <FlagIcon lang="es" size={16} />
                <span>Español</span>
                {language === 'es' && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={tr('Toggle theme')}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* PORTALED MENU CONTAINER (Directly attached to document.body, free from header stacking contexts) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div id="header-menu-portal-root">
          {/* Backdrop on mobile */}
          <div 
            className="mobile-drawer-backdrop mobile-only" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          
          <div 
            className="header-menu-portal" 
            style={{ 
              top: `${menuCoords.top}px`, 
              right: `${menuCoords.right}px` 
            }}
            role="menu"
          >
            {/* Mobile Drawer Top Drag Handle & Header */}
            <div className="mobile-drawer-header mobile-only">
              <div className="mobile-drawer-handle" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div className="mobile-drawer-title">
                  <i className="fi fi-rr-apps" style={{ color: 'var(--color-accent)' }}></i>
                  <span>{tr('Actions & Tools')}</span>
                </div>
                <button 
                  className="mobile-drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={tr('Close')}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="header-menu-body">
              {/* Premier Plan (Mobile Actions) */}
              <div className="mobile-only">
                <div className="dropdown-section-label">⚡ {tr('Actions')}</div>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setIsCvManagerOpen(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-folder"></i> 
                  <span>{tr('My Resumes')}</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setShowImportModal(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-magic-wand"></i> 
                  <span>{tr('Import CV')}</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  style={{ color: '#10B981', fontWeight: '600' }}
                  onClick={() => { setIsCareerOpsOpen && setIsCareerOpsOpen(true); setMobileMenuOpen(false); }}
                >
                  <span>🎯 CareerOps ({tr('Beta')})</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setIsCoverLetterModalOpen(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-document-signed"></i> 
                  <span>{tr('Cover Letter')}</span>
                </button>
                
                <div className="dropdown-divider" />
              </div>

              {/* Second Plan (Outils & Modèles) */}
              <div className="dropdown-section-label">💡 {tr('Tools & Templates')}</div>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { setIsDailyTipOpen && setIsDailyTipOpen(true); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-bulb"></i> 
                <span>{tr('Daily Pro Tip')}</span>
              </button>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { loadDemoData(1); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-document"></i> 
                <span>{tr('1-Page Demo')}</span>
              </button>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { loadDemoData(2); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-copy"></i> 
                <span>{tr('2-Page Demo')}</span>
              </button>
              
              <div className="dropdown-divider" />
              
              {/* Danger Zone */}
              <button
                className="btn-demo dropdown-item dropdown-danger"
                onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}
                disabled={!hasContent}
              >
                <i className="fi fi-rr-trash"></i> 
                <span>{tr('Clear')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
