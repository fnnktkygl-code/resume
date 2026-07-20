import { useState } from 'react';

export default function Header({
  t,
  theme,
  toggleTheme,
  language,
  handleLanguageChange,
  hasContent,
  setIsCoverLetterModalOpen,
  setShowImportModal,
  setIsCvManagerOpen,
  loadDemoData,
  setShowClearConfirm
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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
        <span className="privacy-note">
          <i className="fi fi-rr-lock"></i> {t('All data stays in your browser')}
        </span>

        {/* Cover Letter Generator */}
        <button 
          className="btn-demo desktop-only" 
          style={{ marginRight: '8px', border: '1px solid var(--color-border)' }} 
          onClick={() => setIsCoverLetterModalOpen(true)}
        >
          <i className="fi fi-rr-document-signed"></i> {t('Cover Letter')}
        </button>

        {/* Primary action: Import CV */}
        <button 
          className="btn-demo btn-import-primary desktop-only" 
          onClick={() => setShowImportModal(true)}
        >
          <i className="fi fi-rr-magic-wand"></i> {t('Import CV')}
        </button>

        {/* Overflow Menu */}
        <div className="header-overflow-menu">
          <button
            className="mobile-menu-btn header-more-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="More options"
            aria-expanded={mobileMenuOpen}
          >
            <i className="fi fi-rr-menu-dots"></i>
          </button>
          
          <div className={`mobile-menu-dropdown header-dropdown${mobileMenuOpen ? ' open' : ''}`}>
            <div className="dropdown-section-label">{t('My Documents')}</div>
            <button 
              className="btn-demo dropdown-item mobile-only" 
              onClick={() => { setIsCoverLetterModalOpen(true); setMobileMenuOpen(false); }}
            >
              <i className="fi fi-rr-document-signed"></i> {t('Cover Letter')}
            </button>
            <button 
              className="btn-demo dropdown-item mobile-only" 
              onClick={() => { setShowImportModal(true); setMobileMenuOpen(false); }}
            >
              <i className="fi fi-rr-magic-wand"></i> {t('Import CV')}
            </button>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { setIsCvManagerOpen(true); setMobileMenuOpen(false); }}
            >
              <i className="fi fi-rr-folder"></i> {t('Manage My Resumes')}
            </button>
            
            <div className="dropdown-divider" />
            
            <div className="dropdown-section-label">{t('Examples')}</div>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { loadDemoData(1); setMobileMenuOpen(false); }}
            >
              <i className="fi fi-rr-document"></i> {t('1-Page Demo')}
            </button>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { loadDemoData(2); setMobileMenuOpen(false); }}
            >
              <i className="fi fi-rr-copy"></i> {t('2-Page Demo')}
            </button>
            
            <div className="dropdown-divider" />
            
            <button
              className="btn-demo dropdown-item dropdown-danger"
              onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}
              disabled={!hasContent}
            >
              <i className="fi fi-rr-trash"></i> {t('Clear')}
            </button>
            
          </div>
        </div>

        <div className="header-language-menu" style={{ position: 'relative' }}>
          <button 
            className="btn-demo" 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label={t('Change language')}
            title={t('Change language')}
            style={{ padding: '5px 10px' }}
          >
            <i className="fi fi-rr-globe"></i>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
          </button>
          
          {langMenuOpen && (
            <div className="mobile-menu-dropdown open" style={{ right: 0, left: 'auto', minWidth: '120px', top: '100%', marginTop: '8px' }}>
              <button 
                className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('en'); setLangMenuOpen(false); }}
              >
                English
              </button>
              <button 
                className={`dropdown-item ${language === 'fr' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('fr'); setLangMenuOpen(false); }}
              >
                Français
              </button>
              <button 
                className={`dropdown-item ${language === 'es' ? 'active' : ''}`}
                onClick={() => { handleLanguageChange('es'); setLangMenuOpen(false); }}
              >
                Español
              </button>
            </div>
          )}
        </div>

        <button className="theme-toggle" onClick={toggleTheme} aria-label={t('Toggle theme')}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
