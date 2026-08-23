import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getTranslation } from '../utils/translations';
import { DEMO_DATA_1_PAGE_FR, DEMO_DATA_1_PAGE, DEMO_DATA_1_PAGE_ES } from '../utils/demoData';
import ResumePreview from './ResumePreview';
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

  const [activeTemplate, setActiveTemplate] = useState('standard');
  const [activeMobileTab, setActiveMobileTab] = useState('preview');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const langMenuRef = useRef(null);

  const t = (k) => getTranslation(lang, k);

  const activeDemoData = useMemo(() => {
    if (lang === 'fr') return DEMO_DATA_1_PAGE_FR;
    if (lang === 'es') return DEMO_DATA_1_PAGE_ES;
    return DEMO_DATA_1_PAGE;
  }, [lang]);

  const studioLayout = useMemo(() => ({
    isCompact: true,
    fontSize: 9.5,
    paddingX: 0.5,
    paddingY: 0.5,
    lineHeight: 1.3,
    sectionSpacing: 6,
    itemSpacing: 6,
    accentColor: '#0F3A8C',
    fontFamily: 'Inter'
  }), []);

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
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="landing-logo">
          Resu<span>Me</span>
          <span className="landing-badge">ATS Ready</span>
        </div>
        
        <div className="landing-nav-actions">
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
                <button className={`landing-lang-option ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleLanguageChange('fr')}><span>🇫🇷</span> Français</button>
                <button className={`landing-lang-option ${lang === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}><span>🇬🇧</span> English</button>
                <button className={`landing-lang-option ${lang === 'es' ? 'active' : ''}`} onClick={() => handleLanguageChange('es')}><span>🇪🇸</span> Español</button>
              </div>
            )}
          </div>

          <button className="landing-cta-small" onClick={onStart}>
            ✨ {t('Open Studio')}
          </button>
        </div>
      </nav>

      <main className="landing-main">
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

          <div className="hero-showcase animate-on-scroll staggered-4">
            <div className="showcase-glow"></div>
            <div className="studio-mockup-frame">
              <div className="mockup-window-bar">
                <div className="window-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="window-title">
                  ResuMe Studio — {lang === 'fr' ? 'Aperçu & Éditeur Réels en Direct' : 'Live Real Studio & ATS Preview'}
                </div>
                <div className="window-controls-row">
                  <div className="template-switch-pill">
                    <button className={`tpl-mini-btn ${activeTemplate === 'standard' ? 'active' : ''}`} onClick={() => setActiveTemplate('standard')}>Classic</button>
                    <button className={`tpl-mini-btn ${activeTemplate === 'njm' ? 'active' : ''}`} onClick={() => setActiveTemplate('njm')}>NJM</button>
                    <button className={`tpl-mini-btn ${activeTemplate === 'modern' ? 'active' : ''}`} onClick={() => setActiveTemplate('modern')}>Modern</button>
                    <button className={`tpl-mini-btn ${activeTemplate === 'minimalist' ? 'active' : ''}`} onClick={() => setActiveTemplate('minimalist')}>Minimalist</button>
                  </div>
                  <div className="window-status">
                    <span className="status-indicator"></span>
                    {lang === 'fr' ? 'Sauvegardé' : 'Saved'}
                  </div>
                </div>
              </div>

              <div className="studio-mockup-body">
                <div className="studio-left-pane">
                  <div className="studio-pane-header">
                    <span className="pane-tag"><i className="fi fi-rr-edit"></i> {lang === 'fr' ? 'Éditeur & IA' : 'Live Editor & AI'}</span>
                    <span className="pane-badge-xyz">⚡ {lang === 'fr' ? 'Formule Harvard XYZ' : 'Harvard XYZ Formula'}</span>
                  </div>

                  <div className="live-editor-preview-card">
                    <div className="form-group-item">
                      <label>{lang === 'fr' ? 'Intitulé de poste cible' : 'Target Job Title'}</label>
                      <div className="live-mock-input">{activeDemoData.personal?.tagline || 'Lead Product Manager & Data Strategist'}</div>
                    </div>
                    <div className="form-group-item">
                      <label>{lang === 'fr' ? 'Expérience clé (Format Impact Harvard XYZ)' : 'Key Experience (Harvard XYZ Impact)'}</label>
                      <div className="live-mock-bullet-box">
                        <span className="tag-accent">[X] +40% de conversion</span> {lang === 'fr' ? 'mesuré par' : 'measured by'} <span className="tag-accent">[Y] le taux d’activation utilisateur</span> {lang === 'fr' ? 'en déployant une refonte complète des parcours' : 'by delivering full workflow redesign'} <span className="tag-accent">[Z]</span>.
                      </div>
                    </div>
                    <div className="skills-chips-live">
                      <span className="skill-badge-item active">Product Strategy</span>
                      <span className="skill-badge-item active">Data Analytics</span>
                      <span className="skill-badge-item active">SQL & BI</span>
                      <span className="skill-badge-item active">A/B Testing</span>
                      <span className="skill-badge-item active">Scrum</span>
                    </div>
                  </div>
                </div>

                <div className="studio-right-pane">
                  <div className="preview-top-badge">
                    <span className="ats-score-pill">🎯 Score ATS : <strong>96 / 100</strong></span>
                    <span className="template-pill">{lang === 'fr' ? 'Modèle actif :' : 'Active template:'} <strong>{activeTemplate.toUpperCase()}</strong></span>
                  </div>

                  <div className="live-resume-container-wrapper">
                    <div className="live-resume-scaler">
                      <ResumePreview data={activeDemoData} layout={studioLayout} language={lang} compact={true} template={activeTemplate} />
                    </div>
                  </div>
                </div>
              </div>

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

        <section id="features" className="landing-bento-section">
          <div className="bento-header animate-on-scroll">
            <h2>{t('Pro-level tools.')}</h2>
            <p>{t('Everything you need, intelligently organized for your device.')}</p>
          </div>

          <div className="bento-grid">
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
                    <span className="careerops-status-badge">● {lang === 'fr' ? 'Distance Géodésique Réelle' : 'Geodesic Distance'}</span>
                  </div>

                  <div className="careerops-job-item">
                    <div className="job-meta">
                      <h4>Lead Product Manager & Data Analyst</h4>
                      <span className="job-company">TechSolutions • Montpellier (0 km) • CDI</span>
                    </div>
                    <div className="job-rating-pill">
                      <span className="score-num">4.8 / 5.0</span>
                      <span className="score-stars">★★★★★</span>
                    </div>
                  </div>

                  <div className="careerops-skills-match">
                    <span className="skill-match-tag match">✓ Product Strategy</span>
                    <span className="skill-match-tag match">✓ SQL & Analytics</span>
                    <span className="skill-match-tag match">✓ Formule Harvard XYZ</span>
                    <span className="skill-match-tag neutral">+ Machine Learning</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">⚡ {lang === 'fr' ? 'Impact Mesurable' : 'Proven Impact'}</span>
                <h3>{t('1-Click Tailor & Harvard XYZ Impact')}</h3>
                <p>{t('Instantly tailor your resume to any job posting. The AI algorithm applies the Harvard XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) and smartly bolds key ATS keywords.')}</p>
              </div>

              <div className="bento-diff-card">
                <div className="diff-item diff-before">
                  <span className="diff-label">❌ {lang === 'fr' ? 'Avant (Description passive) :' : 'Before (Passive description):'}</span>
                  <p>« Responsable de l'analyse des indicateurs clés et gestion des sprints. »</p>
                </div>
                <div className="diff-item diff-after">
                  <span className="diff-label">✅ {lang === 'fr' ? 'Après (Harvard XYZ & Mots-clés ATS en gras) :' : 'After (Harvard XYZ & Bolds):'}</span>
                  <p>« <strong>Amélioration de +32% du taux de rétention</strong> mesurée sur 10 000 utilisateurs actifs en pilotant l'analyse produit et 12 sprints Agile. »</p>
                </div>
              </div>
            </div>

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
                    <span>{lang === 'fr' ? "Resserre interlignes et marges dès que le CV > 1 page" : "Tightens spacing & margins if resume > 1 page"}</span>
                  </div>
                  <div className="mock-toggle on"></div>
                </div>
              </div>
            </div>

            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">✉️ {lang === 'fr' ? 'Suite Complète' : 'AI Assistant'}</span>
                <h3>{t('AI Cover Letters & Translation')}</h3>
                <p>{t('Generate customized cover letters aligned with your profile and target job offer. Instantly translate your resume into French, English or Spanish.')}</p>
              </div>

              <div className="bento-letter-preview">
                <div className="letter-header-snippet">
                  <span className="letter-to">Destinataire : TechSolutions — Recrutement</span>
                  <span className="letter-subject">Candidature : Lead Product Manager</span>
                </div>
                <div className="letter-body-snippet">
                  « Madame, Monsieur, particulièrement enthousiaste à l'idée d'accélérer l'impact de vos produits digitaux, je mets à profit mon expertise éprouvée en stratégie Data et pilotage de fonctionnalités... »
                </div>
              </div>
            </div>

            <div className="bento-box bx-half animate-on-scroll">
              <div className="bento-text">
                <span className="bento-eyebrow">📱 {lang === 'fr' ? 'Mobilité Totale' : 'Mobile First'}</span>
                <h3>{t('Flawless Mobile Experience')}</h3>
                <p>{t('Create, update and preview your resume natively on your smartphone with a dedicated ergonomic tactile interface.')}</p>
              </div>

              <div className="smartphone-showcase">
                <div className="smartphone-chassis">
                  <div className="phone-dynamic-island">
                    <span className="phone-camera-lens"></span>
                  </div>
                  <div className="phone-screen">
                    <div className="phone-status-bar">
                      <span className="phone-time">9:41</span>
                      <div className="phone-status-icons">
                        <span className="signal-bar"></span>
                        <span className="battery-icon"></span>
                      </div>
                    </div>
                    <div className="phone-app-header">
                      <span className="phone-app-title">Resu<span>Me</span></span>
                      <span className="phone-ats-score">🎯 96/100</span>
                    </div>
                    <div className="phone-mobile-nav-tabs">
                      <button className={`phone-tab-btn ${activeMobileTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveMobileTab('editor')}>
                        {lang === 'fr' ? 'Édition' : 'Editor'}
                      </button>
                      <button className={`phone-tab-btn ${activeMobileTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveMobileTab('preview')}>
                        {lang === 'fr' ? 'Aperçu CV' : 'Preview'}
                      </button>
                    </div>
                    <div className="phone-content-area">
                      {activeMobileTab === 'preview' ? (
                        <div className="phone-resume-mini-preview">
                          <div className="p-mini-name">{activeDemoData.personal?.name}</div>
                          <div className="p-mini-role">{activeDemoData.personal?.tagline}</div>
                          <div className="p-mini-divider"></div>
                          <div className="p-mini-section">EXPÉRIENCE</div>
                          <div className="p-mini-exp-item">
                            <strong>{activeDemoData.experience?.[0]?.title}</strong> — {activeDemoData.experience?.[0]?.company}
                            <p>{activeDemoData.experience?.[0]?.bullets?.[0]}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="phone-editor-mini-fields">
                          <div className="p-field">
                            <label>{lang === 'fr' ? 'Nom complet' : 'Full Name'}</label>
                            <input type="text" readOnly value={activeDemoData.personal?.name} />
                          </div>
                          <div className="p-field">
                            <label>{lang === 'fr' ? 'Intitulé' : 'Tagline'}</label>
                            <input type="text" readOnly value={activeDemoData.personal?.tagline} />
                          </div>
                          <div className="p-field">
                            <label>{lang === 'fr' ? 'Formule Harvard XYZ' : 'Harvard XYZ'}</label>
                            <div className="p-xyz-chip">✓ Formule [X]-[Y]-[Z] activée</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="phone-bottom-bar">
                      <button className="phone-export-btn" onClick={onStart}>
                        ✨ {lang === 'fr' ? 'Ouvrir sur mobile' : 'Open on mobile'}
                      </button>
                    </div>
                  </div>
                  <div className="phone-home-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        <section className="landing-final-cta animate-on-scroll">
          <div className="cta-glow"></div>
          <h2>{t('Ready to stand out?')}</h2>
          <p>{t('Join thousands of candidates who landed interviews faster with elite resumes.')}</p>
          <button className="landing-cta-primary large mt-6" onClick={onStart}>
            ✨ {t('Start Building Free')}
          </button>
        </section>

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