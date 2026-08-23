import React, { useEffect, useState, useRef } from 'react';
import { getTranslation } from '../utils/translations';
import ImportModal from './ui/ImportModal';
import '../styles/landing.css';

export default function Landing({ onStart, onNavigate }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('resume-builder-lang');
      if (saved && ['fr', 'en', 'es'].includes(saved)) return saved;
      const browserLang = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('en')) return 'en';
      return 'fr';
    } catch {
      return 'fr';
    }
  });

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const langMenuRef = useRef(null);

  const t = (k) => getTranslation(lang, k);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('resume-builder-lang', newLang);
    } catch {}
    setLangDropdownOpen(false);
  };

  const handleImportSuccess = (parsedData) => {
    try {
      localStorage.setItem('resume-builder-data', JSON.stringify(parsedData));
    } catch {}
    onStart();
  };

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLangDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Scroll header effect & intersection animations
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      {/* HEADER NAVIGATION */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="landing-logo">
          Resu<span>Me</span>
          <span className="landing-badge">ATS Ready</span>
        </div>
        
        <div className="landing-nav-actions">
          {/* Language Switcher */}
          <div className="landing-lang-wrapper" ref={langMenuRef}>
            <button 
              className="landing-lang-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              aria-label="Change Language"
              aria-expanded={langDropdownOpen}
            >
              <span>{lang === 'fr' ? '🇫🇷 FR' : lang === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}</span>
              <i className={`fi ${langDropdownOpen ? 'fi-rr-angle-small-up' : 'fi-rr-angle-small-down'}`}></i>
            </button>

            {langDropdownOpen && (
              <div className="landing-lang-dropdown">
                <button 
                  className={`landing-lang-option ${lang === 'fr' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('fr')}
                >
                  <span>🇫🇷</span> Français
                </button>
                <button 
                  className={`landing-lang-option ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span>🇬🇧</span> English
                </button>
                <button 
                  className={`landing-lang-option ${lang === 'es' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('es')}
                >
                  <span>🇪🇸</span> Español
                </button>
              </div>
            )}
          </div>

          {/* Single High-Priority Call to Action */}
          <button className="landing-cta-small" onClick={onStart}>
            ✨ {t('Open Studio')}
          </button>
        </div>
      </nav>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="landing-hero">
          <div className="hero-content">
            <div className="hero-pill animate-on-scroll">
              <span className="hero-pill-badge">Bêta</span>
              <span className="hero-pill-text">🎯 {t('Job Scanner & Multi-Factor ATS Matcher (Beta)')}</span>
            </div>

            <h1 className="landing-title animate-on-scroll staggered-1">
              {t('Craft your story.')}<br />
              <span className="text-gradient">{t('Land the job.')}</span>
            </h1>

            <p className="landing-subtitle animate-on-scroll staggered-2">
              {t('The all-in-one studio to craft elite resumes, audit ATS compatibility, match verified job offers with CareerOps, and tailor applications in 1 click.')}
            </p>

            <div className="hero-actions animate-on-scroll staggered-3">
              <button className="landing-cta-primary" onClick={onStart}>
                ✨ {t('Start Building Free')}
              </button>
              <button className="landing-cta-secondary" onClick={() => setShowImportModal(true)}>
                <i className="fi fi-rr-magic-wand"></i> {t('Import Resume')}
              </button>
            </div>
          </div>

          {/* HERO STUDIO SHOWCASE MOCKUP */}
          <div className="hero-showcase animate-on-scroll staggered-4">
            <div className="showcase-glow"></div>
            <div className="studio-mockup-frame">
              {/* Studio Window Header */}
              <div className="mockup-window-bar">
                <div className="window-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="window-title">ResuMe Studio — {lang === 'fr' ? 'Éditeur & Audit ATS en direct' : 'Live ATS Resume Studio'}</div>
                <div className="window-status">
                  <span className="status-indicator"></span>
                  {lang === 'fr' ? 'Sauvegardé en local' : 'Saved locally'}
                </div>
              </div>

              {/* Dual-Pane Studio Body */}
              <div className="studio-mockup-body">
                {/* Left Pane: Editor */}
                <div className="studio-left-pane">
                  <div className="studio-pane-header">
                    <span className="pane-tag">{lang === 'fr' ? 'Éditeur Structuré' : 'Structured Editor'}</span>
                    <span className="pane-badge-xyz">⚡ Formule Harvard XYZ</span>
                  </div>
                  <div className="mock-input-group">
                    <label>{lang === 'fr' ? 'Intitulé recherché' : 'Target Role'}</label>
                    <div className="mock-input">Consultant Power BI & Data Analyst</div>
                  </div>
                  <div className="mock-input-group">
                    <label>{lang === 'fr' ? 'Réalisation percutante (Formule XYZ)' : 'Impact Achievement (XYZ)'}</label>
                    <div className="mock-input-highlight">
                      <span className="highlight-tag">[X] +35% de performance</span> mesuré par <span className="highlight-tag">[Y] réduction du temps de refresh</span> en automatisant les pipelines DAX & Power Query <span className="highlight-tag">[Z]</span>.
                    </div>
                  </div>
                  <div className="mock-tags-row">
                    <span className="mock-chip active">Power BI</span>
                    <span className="mock-chip active">DAX</span>
                    <span className="mock-chip active">SQL</span>
                    <span className="mock-chip active">Azure Data Factory</span>
                  </div>
                </div>

                {/* Right Pane: Live ATS Resume Preview */}
                <div className="studio-right-pane">
                  <div className="preview-top-badge">
                    <span className="ats-score-pill">
                      🎯 Score ATS : <strong>96 / 100</strong>
                    </span>
                    <span className="template-pill">Modèle : Classic ATS</span>
                  </div>

                  <div className="mini-resume-sheet">
                    <div className="sheet-header">
                      <div className="sheet-name">ALEXANDRE DUPONT</div>
                      <div className="sheet-role">Consultant Business Intelligence & Data Analyst</div>
                      <div className="sheet-contact">Montpellier, France • linkedin.com/in/alexandre-dupont • 06 12 34 56 78</div>
                    </div>
                    <div className="sheet-divider"></div>
                    <div className="sheet-section">
                      <div className="sheet-section-title">EXPÉRIENCE PROFESSIONNELLE</div>
                      <div className="sheet-exp-header">
                        <strong>Senior Data Analyst</strong> — DataCorp Solutions
                        <span className="sheet-date">2022 - Présent</span>
                      </div>
                      <ul className="sheet-bullets">
                        <li><strong>+35% de performance</strong> des rapports décisionnels en optimisant les modèles de données tabulaires DAX.</li>
                        <li><strong>Déploiement de 14 dashboards Power BI</strong> pour 250 utilisateurs métiers clés.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Highlight Chips */}
              <div className="floating-badge badge-careerops">
                <span className="badge-icon">🎯</span>
                <div className="badge-text">
                  <strong>CareerOps Match</strong>
                  <span>4.8 / 5.0 ★ ({lang === 'fr' ? 'Top Adéquation' : 'Top Match'})</span>
                </div>
              </div>

              <div className="floating-badge badge-compact">
                <span className="badge-icon">📐</span>
                <div className="badge-text">
                  <strong>Mode Compact Auto</strong>
                  <span>{lang === 'fr' ? 'Ajusté au millimètre sur 1 page' : 'Fitted to exactly 1 page'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID: COMPREHENSIVE FEATURE SHOWCASE */}
        <section id="features" className="landing-bento-section">
          <div className="bento-header animate-on-scroll">
            <h2>{t('Pro-level tools.')}</h2>
            <p>{t('Everything you need, intelligently organized for your device.')}</p>
          </div>

          <div className="bento-grid">
            {/* FEATURE 1 (FULL WIDTH): CAREEROPS HUB */}
            <div className="bento-box bx-full animate-on-scroll">
              <div className="bento-text bento-centered-top">
                <span className="bento-eyebrow">🎯 {lang === 'fr' ? 'Nouveau Module' : 'Flagship Feature'}</span>
                <h3>{t('Job Scanner & Multi-Factor ATS Matcher (Beta)')}</h3>
                <p>{t('Connected directly to major job portals (France Travail, HelloWork, Indeed, APEC, Welcome to the Jungle, Michael Page, LinkedIn). Automated evaluation using the A-H rubric with match rating, seniority alignment, and real geodesic distance calculation.')}</p>
              </div>

              <div className="careerops-showcase-container">
                <div className="careerops-mockup-card">
                  <div className="careerops-mock-header">
                    <div className="career-portals-pills">
                      <span className="portal-tag">France Travail</span>
                      <span className="portal-tag">HelloWork</span>
                      <span className="portal-tag">Indeed</span>
                      <span className="portal-tag">APEC</span>
                      <span className="portal-tag">LinkedIn</span>
                    </div>
                    <span className="careerops-status-badge">● {lang === 'fr' ? 'Géolocalisation Réelle' : 'Geodesic Distance'}</span>
                  </div>

                  <div className="careerops-job-item">
                    <div className="job-meta">
                      <h4>Consultant Power BI / Data Analyst</h4>
                      <span className="job-company">DataCorp Solutions • Montpellier (0 km) • CDI</span>
                    </div>
                    <div className="job-rating-pill">
                      <span className="score-num">4.8 / 5.0</span>
                      <span className="score-stars">★★★★★</span>
                    </div>
                  </div>

                  <div className="careerops-skills-match">
                    <span className="skill-match-tag match">✓ Power BI</span>
                    <span className="skill-match-tag match">✓ SQL & DAX</span>
                    <span className="skill-match-tag match">✓ Modélisation de données</span>
                    <span className="skill-match-tag neutral">+ Azure Data</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE 2 (HALF): 1-CLICK TAILOR & HARVARD XYZ */}
            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">⚡ {lang === 'fr' ? 'Impact Mesurable' : 'Proven Impact'}</span>
                <h3>{t('1-Click Tailor & Harvard XYZ Impact')}</h3>
                <p>{t('Instantly tailor your resume to any job posting. The AI algorithm applies the Harvard XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) and smartly bolds key ATS keywords.')}</p>
              </div>

              <div className="bento-diff-card">
                <div className="diff-item diff-before">
                  <span className="diff-label">❌ {lang === 'fr' ? 'Avant :' : 'Before:'}</span>
                  <p>« En charge de la création de dashboards et analyse des ventes. »</p>
                </div>
                <div className="diff-item diff-after">
                  <span className="diff-label">✅ {lang === 'fr' ? 'Après (Harvard XYZ & Gras IA) :' : 'After (Harvard XYZ & AI Bold):'}</span>
                  <p>« <strong>Augmentation de +28% de la vélocité commerciale</strong> mesurée par le délai de reporting en concevant 8 dashboards Power BI automatisés. »</p>
                </div>
              </div>
            </div>

            {/* FEATURE 3 (HALF): SURGICAL LAYOUT & AUTO-COMPACT */}
            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">📐 {lang === 'fr' ? 'Mise en Page Parfaite' : 'Smart Spacing'}</span>
                <h3>{t('Surgical Layout & Auto-Compact')}</h3>
                <p>{t('Classic, Modern, NJM or Minimalist. The editor automatically detects when your resume exceeds 1 page and engages compact mode to ensure a flawless 1-page fit.')}</p>
              </div>

              <div className="bento-layout-controls">
                <div className="layout-pill-row">
                  <span className="layout-chip active">Classic</span>
                  <span className="layout-chip">Modern</span>
                  <span className="layout-chip">NJM</span>
                  <span className="layout-chip">Minimalist</span>
                </div>
                <div className="compact-toggle-card">
                  <div className="toggle-info">
                    <strong>Mode Compact Automatique</strong>
                    <span>{lang === 'fr' ? "Resserre interlignes et marges si > 1 page" : "Tightens spacing & margins if > 1 page"}</span>
                  </div>
                  <div className="mock-toggle on"></div>
                </div>
              </div>
            </div>

            {/* FEATURE 4 (HALF): AI COVER LETTERS & TRANSLATION */}
            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">✉️ {lang === 'fr' ? 'Suite Complète' : 'AI Assistant'}</span>
                <h3>{t('AI Cover Letters & Translation')}</h3>
                <p>{t('Generate customized cover letters aligned with your profile and target job offer. Instantly translate your resume into French, English or Spanish.')}</p>
              </div>

              <div className="bento-letter-preview">
                <div className="letter-header-snippet">
                  <span className="letter-to">Destinataire : DataCorp — Département Data</span>
                  <span className="letter-subject">Candidature au poste de Consultant Power BI</span>
                </div>
                <div className="letter-body-snippet">
                  « Madame, Monsieur, fort d'une expertise reconnue en modélisation DAX et reporting stratégique... »
                </div>
              </div>
            </div>

            {/* FEATURE 5 (HALF): FLAWLESS MOBILE FREEDOM */}
            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">📱 {lang === 'fr' ? 'Mobilité Totale' : 'Mobile First'}</span>
                <h3>{t('Flawless Mobile Experience')}</h3>
                <p>{t('Create, update and preview your resume natively on your smartphone with a dedicated ergonomic tactile interface.')}</p>
              </div>

              {/* REALISTIC SMARTPHONE CHASSIS (PROPERLY PROPORTIONED, NO CUT-OFF) */}
              <div className="smartphone-showcase">
                <div className="smartphone-chassis">
                  <div className="phone-dynamic-island"></div>
                  <div className="phone-screen">
                    <div className="phone-app-bar">
                      <span className="phone-logo">Resu<span>Me</span></span>
                      <span className="phone-ats-badge">🎯 96</span>
                    </div>
                    <div className="phone-card">
                      <span className="phone-card-title">Consultant Power BI</span>
                      <div className="phone-chip-group">
                        <span className="p-chip">1 Page</span>
                        <span className="p-chip">Compact</span>
                        <span className="p-chip">PDF</span>
                      </div>
                    </div>
                    <div className="phone-action-btn">
                      ✨ {lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                    </div>
                  </div>
                  <div className="phone-home-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & PRIVACY PILLARS */}
        <section className="landing-pillars animate-on-scroll">
          <div className="pillar-item">
            <div className="pillar-icon">🔒</div>
            <h4>{t('100% Local, Private & Secure')}</h4>
            <p>{t('Your data stays 100% in your browser. No account needed, no hidden tracking, zero unwanted cloud storage.')}</p>
          </div>
          <div className="pillar-item">
            <div className="pillar-icon">🎯</div>
            <h4>{lang === 'fr' ? 'Norme ATS Internationale' : 'Global ATS Compliance'}</h4>
            <p>{lang === 'fr' ? 'Structure sémantique sans tableaux invisibles, compatible avec Taleo, Workday, Greenhouse et Lever.' : 'Semantic single-column typography parsed perfectly by Taleo, Workday, Greenhouse and Lever.'}</p>
          </div>
          <div className="pillar-item">
            <div className="pillar-icon">📄</div>
            <h4>{lang === 'fr' ? 'Export Vectoriel Haute Fidélité' : 'Vector High-Fidelity Export'}</h4>
            <p>{lang === 'fr' ? 'Génération PDF vectorielle nette, compatible impression professionnelle, export Word DOCX et sauvegarde JSON.' : 'Crystal-clear vector PDF rendering, print-ready layout, DOCX Word export, and JSON backups.'}</p>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="landing-final-cta animate-on-scroll">
          <div className="cta-glow"></div>
          <h2>{t('Ready to stand out?')}</h2>
          <p>{t('Join thousands of candidates who landed interviews faster with elite resumes.')}</p>
          <button className="landing-cta-primary large mt-6" onClick={onStart}>
            ✨ {t('Start Building Free')}
          </button>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="landing-logo">Resu<span>Me</span></div>
          
          <nav className="footer-nav">
            <button onClick={() => onNavigate('privacy')}>Privacy Policy</button>
            <button onClick={() => onNavigate('terms')}>Terms of Service</button>
            <button onClick={() => onNavigate('security')}>Security</button>
          </nav>

          <div className="footer-links">
            <span className="footer-tag">ATS Ready</span>
            <span className="footer-tag">CareerOps Bêta</span>
            <span className="footer-tag">Privacy First</span>
          </div>
          <p>© {new Date().getFullYear()} ResuMe — Studio de Candidatures d'Élite.</p>
        </footer>
      </main>

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onImportSuccess={handleImportSuccess}
        language={lang}
      />
    </div>
  );
}