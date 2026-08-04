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
  setShowClearConfirm,
  setIsDailyTipOpen
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
        <span 
          className="privacy-note"
          data-tooltip={language === 'fr' ? 'Vos données restent 100% privées et stockées uniquement dans votre navigateur' : 'Your data stays 100% private and stored in your browser'}
          data-tooltip-pos="bottom"
          style={{ cursor: 'help' }}
        >
          <i className="fi fi-rr-lock"></i> {t('All data stays in your browser')}
        </span>

        {/* Daily Tip Button */}
        <button
          className="btn-demo desktop-only"
          style={{ 
            marginRight: '8px', 
            border: '1px solid rgba(var(--color-accent-rgb, 99, 102, 241), 0.3)',
            background: 'var(--color-accent-light, rgba(99, 102, 241, 0.08))',
            color: 'var(--color-accent, #6366f1)',
            fontWeight: '600'
          }}
          onClick={() => setIsDailyTipOpen && setIsDailyTipOpen(true)}
          data-tooltip={language === 'fr' ? 'Recommandations & statistiques RH vérifiées du jour (CV & Lettre)' : 'Daily data-backed HR insights & tips'}
          data-tooltip-pos="bottom"
        >
          💡 {language === 'fr' ? 'Conseil du Jour' : 'Daily Pro Tip'}
        </button>

        {/* Cover Letter Generator */}
        <button 
          className="btn-demo desktop-only" 
          style={{ marginRight: '8px', border: '1px solid var(--color-border)' }} 
          onClick={() => setIsCoverLetterModalOpen(true)}
          data-tooltip={language === 'fr' ? 'Ouvrir le générateur de lettre de motivation IA' : 'Open AI cover letter generator'}
          data-tooltip-pos="bottom"
        >
          <i className="fi fi-rr-document-signed"></i> {t('Cover Letter')}
        </button>

        {/* Primary action: Import CV */}
        <button 
          className="btn-demo btn-import-primary desktop-only" 
          onClick={() => setShowImportModal(true)}
          data-tooltip={language === 'fr' ? 'Importer et analyser un CV (PDF, JSON)' : 'Import & parse existing CV (PDF, JSON)'}
          data-tooltip-pos="bottom"
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
            data-tooltip={language === 'fr' ? 'Plus d\'options et modèles' : 'More options & templates'}
            data-tooltip-pos="bottom"
          >
            <i className="fi fi-rr-menu-dots"></i>
          </button>
          
          <div className={`mobile-menu-dropdown header-dropdown${mobileMenuOpen ? ' open' : ''}`}>
            <div className="dropdown-section-label">{t('My Documents')}</div>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { setIsDailyTipOpen && setIsDailyTipOpen(true); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Conseils & statistiques RH du jour (CV & Lettre)' : 'Daily data-backed HR insights'}
              data-tooltip-pos="left"
            >
              💡 {language === 'fr' ? 'Conseil du Jour' : 'Daily Pro Tip'}
            </button>
            <button 
              className="btn-demo dropdown-item mobile-only" 
              onClick={() => { setIsCoverLetterModalOpen(true); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Rédiger une lettre de motivation IA' : 'Generate AI cover letter'}
              data-tooltip-pos="left"
            >
              <i className="fi fi-rr-document-signed"></i> {t('Cover Letter')}
            </button>
            <button 
              className="btn-demo dropdown-item mobile-only" 
              onClick={() => { setShowImportModal(true); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Importer un CV existant (PDF, JSON)' : 'Import existing CV (PDF, JSON)'}
              data-tooltip-pos="left"
            >
              <i className="fi fi-rr-magic-wand"></i> {t('Import CV')}
            </button>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { setIsCvManagerOpen(true); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Sauvegarder, charger ou exporter vos versions de CV' : 'Save, load, or export resume versions'}
              data-tooltip-pos="left"
            >
              <i className="fi fi-rr-folder"></i> {t('Manage My Resumes')}
            </button>
            
            <div className="dropdown-divider" />
            
            <div className="dropdown-section-label">{t('Examples')}</div>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { loadDemoData(1); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Charger un exemple de CV 1 page optimisé' : 'Load 1-page optimized demo resume'}
              data-tooltip-pos="left"
            >
              <i className="fi fi-rr-document"></i> {t('1-Page Demo')}
            </button>
            <button 
              className="btn-demo dropdown-item" 
              onClick={() => { loadDemoData(2); setMobileMenuOpen(false); }}
              data-tooltip={language === 'fr' ? 'Charger un exemple de CV 2 pages complet' : 'Load 2-page complete demo resume'}
              data-tooltip-pos="left"
            >
              <i className="fi fi-rr-copy"></i> {t('2-Page Demo')}
            </button>
            
            <div className="dropdown-divider" />
            
            <button
              className="btn-demo dropdown-item dropdown-danger"
              onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}
              disabled={!hasContent}
              data-tooltip={language === 'fr' ? 'Réinitialiser toutes les données du CV' : 'Reset all resume content'}
              data-tooltip-pos="left"
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
            data-tooltip={language === 'fr' ? "Changer la langue de l'application" : 'Switch application language'}
            data-tooltip-pos="bottom"
            style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '14px' }}>{language === 'fr' ? '🇫🇷' : language === 'es' ? '🇪🇸' : '🇬🇧'}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
            <i className="fi fi-rr-angle-small-down" style={{ fontSize: '11px', opacity: 0.7 }}></i>
          </button>
          
          {langMenuOpen && (
            <div className="mobile-menu-dropdown open" style={{ right: 0, left: 'auto', minWidth: '140px', top: '100%', marginTop: '8px', padding: '6px' }}>
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

        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={t('Toggle theme')}
          data-tooltip={language === 'fr' ? (theme === 'light' ? 'Basculer en Mode Sombre' : 'Basculer en Mode Clair') : (theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode')}
          data-tooltip-pos="left"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
