import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
          title={t('Back to home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Resu<span className="logo-accent">Me</span>
        </button>
        <span className="badge">ATS Ready</span>
      </div>
      
      <div className="header-right">
        <span 
          className="privacy-note desktop-only"
          data-tooltip={t('All data stays in your browser')}
          data-tooltip-pos="bottom"
          style={{ cursor: 'help' }}
        >
          <i className="fi fi-rr-lock"></i> {t('All data stays in your browser')}
        </span>

        {/* 1. Premier Plan (Primary Action): Save Resume — Always accessible */}
        <button
          className={`btn-demo btn-save-resume ${saveStatus === 'saved' ? 'btn-save-success' : ''}`}
          onClick={onSave}
          aria-label={saveStatus === 'saved' ? t('Saved!') : t('Save')}
          data-tooltip={t('Save current resume to My Resumes')}
          data-tooltip-pos="bottom"
        >
          <i className={`fi ${saveStatus === 'saved' ? 'fi-rr-check' : 'fi-rr-disk'}`}></i>
          <span className="desktop-only">{saveStatus === 'saved' ? t('Saved!') : t('Save')}</span>
        </button>

        {/* 2. Premier Plan (Desktop): Manage Resumes */}
        <button
          className="btn-demo desktop-only"
          style={{ marginRight: '6px', border: '1px solid var(--color-border)' }}
          onClick={() => setIsCvManagerOpen(true)}
          data-tooltip={t('Manage, duplicate and organize your resume versions')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-folder"></i> {t('My Resumes')}
        </button>

        {/* 3. Premier Plan (Desktop): Import CV */}
        <button 
          className="btn-demo btn-import-primary desktop-only" 
          style={{ marginRight: '6px' }}
          onClick={() => setShowImportModal(true)}
          data-tooltip={t('Import and analyze an existing CV (PDF, JSON)')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-magic-wand"></i> {t('Import CV')}
        </button>

        {/* 4. Core Feature (Desktop): CareerOps with Beta Badge */}
        <button
          className="btn-demo desktop-only"
          style={{ 
            marginRight: '6px', 
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={() => setIsCareerOpsOpen && setIsCareerOpsOpen(true)}
          data-tooltip={t('Smart Job Search, ATS Matcher & 1-Click Apply (In active development)')}
          data-tooltip-pos="bottom"
        >
          <span>🎯 CareerOps</span>
          <span style={{ 
            fontSize: '9.5px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            padding: '1px 5px', 
            borderRadius: '4px', 
            background: 'rgba(16, 185, 129, 0.25)', 
            color: '#10B981', 
            border: '1px solid rgba(16, 185, 129, 0.4)' 
          }}>
            {t('Beta')}
          </span>
        </button>

        {/* 5. Cover Letter Generator (Desktop) */}
        <button 
          className="btn-demo desktop-only" 
          style={{ marginRight: '6px', border: '1px solid var(--color-border)' }} 
          onClick={() => setIsCoverLetterModalOpen(true)}
          data-tooltip={t('Generate tailored cover letter with AI')}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-document-signed"></i> {t('Cover Letter')}
        </button>

        {/* Overflow Menu (More Options Button) */}
        <div className="header-overflow-menu" ref={menuRef}>
          <button
            className="mobile-menu-btn header-more-btn"
            onClick={toggleMenu}
            aria-label={t('More options')}
            aria-expanded={mobileMenuOpen}
          >
            <i className="fi fi-rr-menu-dots"></i>
          </button>
        </div>

        {/* Language Selector */}
        <div className="header-language-menu" ref={langRef} style={{ position: 'relative' }}>
          <button 
            className="btn-demo" 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label={t('Change language')}
            style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '14px' }}>{language === 'fr' ? '🇫🇷' : language === 'es' ? '🇪🇸' : '🇬🇧'}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
            <i className="fi fi-rr-angle-small-down" style={{ fontSize: '11px', opacity: 0.7 }}></i>
          </button>
          
          {langMenuOpen && (
            <div className="header-dropdown open" style={{ right: 0, left: 'auto', minWidth: '140px', top: '100%', marginTop: '8px', padding: '6px', background: 'var(--color-surface)', zIndex: 10001 }}>
              <button 
                className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('en'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', fontWeight: language === 'en' ? '700' : '500' }}
              >
                <span>🇬🇧</span>
                <span>English</span>
                {language === 'en' && <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </button>
              <button 
                className={`dropdown-item ${language === 'fr' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('fr'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', fontWeight: language === 'fr' ? '700' : '500' }}
              >
                <span>🇫🇷</span>
                <span>Français</span>
                {language === 'fr' && <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </button>
              <button 
                className={`dropdown-item ${language === 'es' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('es'); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', fontWeight: language === 'es' ? '700' : '500' }}
              >
                <span>🇪🇸</span>
                <span>Español</span>
                {language === 'es' && <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={t('Toggle theme')}
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
                  <span>{t('Actions & Tools')}</span>
                </div>
                <button 
                  className="mobile-drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t('Close')}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="header-menu-body">
              {/* Premier Plan (Mobile Actions) */}
              <div className="mobile-only">
                <div className="dropdown-section-label">⚡ {t('Actions')}</div>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setIsCvManagerOpen(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-folder"></i> 
                  <span>{t('My Resumes')}</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setShowImportModal(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-magic-wand"></i> 
                  <span>{t('Import CV')}</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  style={{ color: '#10B981', fontWeight: '600' }}
                  onClick={() => { setIsCareerOpsOpen && setIsCareerOpsOpen(true); setMobileMenuOpen(false); }}
                >
                  <span>🎯 CareerOps ({t('Beta')})</span>
                </button>
                <button 
                  className="btn-demo dropdown-item" 
                  onClick={() => { setIsCoverLetterModalOpen(true); setMobileMenuOpen(false); }}
                >
                  <i className="fi fi-rr-document-signed"></i> 
                  <span>{t('Cover Letter')}</span>
                </button>
                
                <div className="dropdown-divider" />
              </div>

              {/* Second Plan (Outils & Modèles) */}
              <div className="dropdown-section-label">💡 {t('Tools & Templates')}</div>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { setIsDailyTipOpen && setIsDailyTipOpen(true); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-bulb"></i> 
                <span>{t('Daily Pro Tip')}</span>
              </button>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { loadDemoData(1); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-document"></i> 
                <span>{t('1-Page Demo')}</span>
              </button>
              <button 
                className="btn-demo dropdown-item" 
                onClick={() => { loadDemoData(2); setMobileMenuOpen(false); }}
              >
                <i className="fi fi-rr-copy"></i> 
                <span>{t('2-Page Demo')}</span>
              </button>
              
              <div className="dropdown-divider" />
              
              {/* Danger Zone */}
              <button
                className="btn-demo dropdown-item dropdown-danger"
                onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}
                disabled={!hasContent}
              >
                <i className="fi fi-rr-trash"></i> 
                <span>{t('Clear')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
