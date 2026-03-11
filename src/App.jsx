import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { STEPS, DEFAULT_DATA, createEmptyExperience, createEmptyEducation, createEmptyProject, createEmptyCertification } from './utils/constants';
import { DEMO_DATA_1_PAGE, DEMO_DATA_2_PAGES, DEMO_DATA_1_PAGE_FR, DEMO_DATA_2_PAGES_FR } from './utils/demoData';
import AtsScore from './components/AtsScore';
import ResumePreview from './components/ResumePreview';
import PersonalStep from './components/steps/PersonalStep';
import SummaryStep from './components/steps/SummaryStep';
import ExperienceStep from './components/steps/ExperienceStep';
import EducationStep from './components/steps/EducationStep';
import SkillsStep from './components/steps/SkillsStep';
import ProjectsStep from './components/steps/ProjectsStep';
import CertificationsStep from './components/steps/CertificationsStep';
import PreviewStep from './components/steps/PreviewStep';
import { TranslationContext } from './utils/TranslationContext';
import { getTranslation } from './utils/translations';
import LayoutControls from './components/LayoutControls';

const AIPromptModal = lazy(() => import('./components/AIPromptModal'));

const STORAGE_KEY = 'resume-builder-data';
const THEME_KEY = 'resume-builder-theme';
const LAYOUT_KEY = 'resume-builder-layout';
const TEMPLATE_KEY = 'resume-builder-template';

const DEFAULT_LAYOUT = {
  isCompact: false,
  fontSize: 10.5,
  paddingX: 0.75,
  paddingY: 0.75,
  lineHeight: 1.45,
  sectionSpacing: 10,
  itemSpacing: 8,
};

const DEFAULT_SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

function detectLanguage() {
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_DATA,
        ...parsed,
        headings: { ...DEFAULT_DATA.headings, ...parsed.headings },
        personal: { ...DEFAULT_DATA.personal, ...parsed.personal },
        skills: { ...DEFAULT_DATA.skills, ...parsed.skills },
        projects: parsed.projects || DEFAULT_DATA.projects,
        certifications: parsed.certifications || DEFAULT_DATA.certifications,
        sectionOrder: parsed.sectionOrder || DEFAULT_SECTION_ORDER,
      };
    }
  } catch {}
  return { ...DEFAULT_DATA, sectionOrder: DEFAULT_SECTION_ORDER };
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
}

function loadLayout() {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) return { ...DEFAULT_LAYOUT, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_LAYOUT;
}

function loadTemplate() {
  try {
    return localStorage.getItem(TEMPLATE_KEY) || 'standard';
  } catch {
    return 'standard';
  }
}

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(loadData);
  const [theme, setTheme] = useState(loadTheme);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(detectLanguage);
  const [layout, setLayout] = useState(loadLayout);
  const [template, setTemplate] = useState(loadTemplate);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const t = (key) => getTranslation(language, key);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Auto-save data
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  // Persist layout
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  // Persist template
  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, template);
  }, [template]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const currentId = STEPS[step].id;
  const isPreview = currentId === 'preview';

  const handleImport = useCallback((imported) => {
    setData({
      ...DEFAULT_DATA,
      ...imported,
      headings: { ...DEFAULT_DATA.headings, ...imported.headings },
      personal: { ...DEFAULT_DATA.personal, ...imported.personal },
      skills: { ...DEFAULT_DATA.skills, ...imported.skills },
      projects: imported.projects || DEFAULT_DATA.projects,
      certifications: imported.certifications || DEFAULT_DATA.certifications,
      sectionOrder: imported.sectionOrder || DEFAULT_SECTION_ORDER,
    });
  }, []);

  const clearData = () => {
    setData({ ...DEFAULT_DATA, sectionOrder: DEFAULT_SECTION_ORDER });
    setStep(0);
    setShowClearConfirm(false);
  };

  const handleSectionReorder = useCallback((newOrder) => {
    setData(prev => ({ ...prev, sectionOrder: newOrder }));
  }, []);
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setData(prev => {
      const isDemo1 = prev.personal.name === 'Sarah Chen' || prev.personal.name === 'Sarah Dubois';
      const isDemo2 = isDemo1 && prev.experience.length > 2;
      
      let nextData = prev;
      if (lang === 'fr') {
        if (isDemo2) nextData = DEMO_DATA_2_PAGES_FR;
        else if (isDemo1) nextData = DEMO_DATA_1_PAGE_FR;

        return { 
          ...nextData,
          sectionOrder: prev.sectionOrder || DEFAULT_SECTION_ORDER,
          headings: {
            ...nextData.headings,
            summary: nextData.headings.summary === 'Summary' ? 'Profil' : nextData.headings.summary,
            experience: nextData.headings.experience === 'Work Experience' ? 'Expériences Professionnelles' : nextData.headings.experience,
            education: nextData.headings.education === 'Education' ? 'Formation' : nextData.headings.education,
            skills: nextData.headings.skills === 'Skills' ? 'Compétences' : nextData.headings.skills,
            projects: nextData.headings.projects === 'Projects' ? 'Projets' : nextData.headings.projects,
            certifications: nextData.headings.certifications === 'Certifications' ? 'Certifications' : nextData.headings.certifications,
            technical: nextData.headings.technical === 'Technical:' ? 'Technique:' : nextData.headings.technical,
            interpersonal: nextData.headings.interpersonal === 'Interpersonal:' ? 'Interpersonnelles:' : nextData.headings.interpersonal,
            languages: nextData.headings.languages === 'Languages:' ? 'Langues:' : nextData.headings.languages,
            present: nextData.headings.present === 'Present' ? 'Présent' : nextData.headings.present
          }
        };
      } else {
        if (isDemo2) nextData = DEMO_DATA_2_PAGES;
        else if (isDemo1) nextData = DEMO_DATA_1_PAGE;

        return { 
          ...nextData,
          sectionOrder: prev.sectionOrder || DEFAULT_SECTION_ORDER,
          headings: {
            ...nextData.headings,
            summary: nextData.headings.summary === 'Profil' ? 'Summary' : nextData.headings.summary,
            experience: nextData.headings.experience === 'Expériences Professionnelles' ? 'Work Experience' : nextData.headings.experience,
            education: nextData.headings.education === 'Formation' ? 'Education' : nextData.headings.education,
            skills: nextData.headings.skills === 'Compétences' ? 'Skills' : nextData.headings.skills,
            projects: nextData.headings.projects === 'Projets' ? 'Projects' : nextData.headings.projects,
            certifications: nextData.headings.certifications === 'Certifications' ? 'Certifications' : nextData.headings.certifications,
            technical: nextData.headings.technical === 'Technique:' ? 'Technical:' : nextData.headings.technical,
            interpersonal: nextData.headings.interpersonal === 'Interpersonnelles:' ? 'Interpersonal:' : nextData.headings.interpersonal,
            languages: nextData.headings.languages === 'Langues:' ? 'Languages:' : nextData.headings.languages,
            present: nextData.headings.present === 'Présent' ? 'Present' : nextData.headings.present
          }
        };
      }
    });
  };

  // Check which steps have data for completion indicators
  const stepHasData = (stepId) => {
    switch (stepId) {
      case 'personal': return !!(data.personal.name || data.personal.email);
      case 'summary': return !!(data.summary && data.summary.length > 10);
      case 'experience': return data.experience.some(e => e.company || e.title);
      case 'education': return data.education.some(e => e.institution || e.degree);
      case 'skills': return !!(data.skills.technical);
      case 'projects': return data.projects.some(p => p.name);
      case 'certifications': return data.certifications.some(c => c.name);
      default: return false;
    }
  };

  return (
    <TranslationContext.Provider value={language}>
      <div className="app">
        {/* Skip to content — accessibility */}
        <a href="#main-content" className="skip-link">{t('Skip to main content')}</a>

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <span className="logo">Resu<span className="logo-accent">Me</span></span>
            <span className="badge">ATS Ready</span>
          </div>
          <div className="header-right">
            <span className="privacy-note">{t('All data stays in your browser')}</span>
            <button className="btn-demo" onClick={() => setData(language === 'fr' ? DEMO_DATA_1_PAGE_FR : DEMO_DATA_1_PAGE)}>
              {t('1-Page Demo')}
            </button>
            <button className="btn-demo" onClick={() => setData(language === 'fr' ? DEMO_DATA_2_PAGES_FR : DEMO_DATA_2_PAGES)}>
              {t('2-Page Demo')}
            </button>
            <button className="btn-demo" onClick={() => setShowClearConfirm(true)}>
              {t('Clear')}
            </button>

            {/* Mobile menu for small screens */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              ⋯
            </button>
            <div className={`mobile-menu-dropdown${mobileMenuOpen ? ' open' : ''}`}>
              <button className="btn-demo" onClick={() => { setData(language === 'fr' ? DEMO_DATA_1_PAGE_FR : DEMO_DATA_1_PAGE); setMobileMenuOpen(false); }}>
                {t('1-Page Demo')}
              </button>
              <button className="btn-demo" onClick={() => { setData(language === 'fr' ? DEMO_DATA_2_PAGES_FR : DEMO_DATA_2_PAGES); setMobileMenuOpen(false); }}>
                {t('2-Page Demo')}
              </button>
              <button className="btn-demo" onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}>
                {t('Clear')}
              </button>
            </div>

            <button className="theme-toggle" onClick={toggleTheme} aria-label={t('Toggle theme')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="main" id="main-content">
          {/* Left: Form Panel */}
          <div className="form-panel">
            {/* Stepper */}
            <nav className="stepper" role="tablist" aria-label="Resume sections">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  className={`step-btn${i === step ? ' active' : ''}${stepHasData(s.id) ? ' completed' : ''}`}
                  onClick={() => setStep(i)}
                  role="tab"
                  aria-selected={i === step}
                >
                  <span className="step-icon">{s.icon}</span>
                  <span className="step-label">{t(s.label)}</span>
                  {stepHasData(s.id) && <span className="step-check" aria-hidden="true">✓</span>}
                </button>
              ))}
            </nav>

            {/* ATS Score */}
            <AtsScore data={data} />

            {/* Step Content */}
            <div className="animate-fade-in" key={currentId}>
              {currentId === 'personal' && (
                <PersonalStep 
                  data={data.personal} 
                  headings={data.headings}
                  onChange={(v) => setData({ ...data, personal: v })} 
                  onHeadingsChange={(v) => setData({ ...data, headings: v })}
                />
              )}
              {currentId === 'summary' && (
                <SummaryStep data={data.summary} onChange={(v) => setData({ ...data, summary: v })} />
              )}
              {currentId === 'experience' && (
                <ExperienceStep data={data.experience} onChange={(v) => setData({ ...data, experience: v })} />
              )}
              {currentId === 'education' && (
                <EducationStep data={data.education} onChange={(v) => setData({ ...data, education: v })} />
              )}
              {currentId === 'skills' && (
                <SkillsStep data={data.skills} onChange={(v) => setData({ ...data, skills: v })} />
              )}
              {currentId === 'projects' && (
                <ProjectsStep data={data.projects} onChange={(v) => setData({ ...data, projects: v })} />
              )}
              {currentId === 'certifications' && (
                <CertificationsStep data={data.certifications} onChange={(v) => setData({ ...data, certifications: v })} />
              )}
              {currentId === 'preview' && <PreviewStep data={data} layout={layout} language={language} template={template} onImport={handleImport} />}
            </div>

            {/* Navigation */}
            <div className="step-nav">
              {step > 0 ? (
                <button className="btn-secondary" onClick={() => setStep(step - 1)}>{t('Back')}</button>
              ) : <div />}
              {step < STEPS.length - 1 && (
                <button className="btn-primary" onClick={() => setStep(step + 1)}>
                  {t('Continue')}
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          {!isPreview && (
            <aside className="preview-panel" aria-label={t('Live Preview')}>
              <div className="preview-header">
                <span className="preview-label" style={{ marginBottom: 0 }}>{t('Live Preview')}</span>
                <div className="preview-controls">
                  <div className="control-group">
                    <button 
                      className={`control-btn ${language === 'en' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('en')}
                      aria-label="Switch to English"
                    >EN</button>
                    <button 
                      className={`control-btn ${language === 'fr' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('fr')}
                      aria-label="Switch to French"
                    >FR</button>
                  </div>

                  <div className="control-divider" aria-hidden="true" />

                  {/* Template picker */}
                  <div className="control-group">
                    <span className="control-group-label">Template</span>
                    <button
                      className={`template-btn ${template === 'standard' ? 'active' : ''}`}
                      onClick={() => setTemplate('standard')}
                    >
                      Classic
                    </button>
                    <button
                      className={`template-btn ${template === 'modern' ? 'active' : ''}`}
                      onClick={() => setTemplate('modern')}
                    >
                      Modern
                    </button>
                  </div>

                  <div className="control-divider" aria-hidden="true" />

                  <div className="control-group">
                    <button 
                      className={`control-btn ${layout.isCompact ? 'active' : ''}`}
                      onClick={() => setLayout({
                        isCompact: !layout.isCompact,
                        fontSize: layout.isCompact ? 10.5 : 9.5,
                        paddingX: layout.isCompact ? 0.75 : 0.5,
                        paddingY: layout.isCompact ? 0.75 : 0.5,
                        lineHeight: layout.isCompact ? 1.45 : 1.25,
                        sectionSpacing: layout.isCompact ? 10 : 4,
                        itemSpacing: layout.isCompact ? 8 : 4
                      })}
                    >
                      📐 {layout.isCompact ? t('Normal') : t('Compact')}
                    </button>
                    <button 
                      className={`control-btn ${isLayoutOpen ? 'active' : ''}`}
                      onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                      aria-expanded={isLayoutOpen}
                    >
                      ⚙️
                    </button>
                  </div>

                  <div className="control-divider" aria-hidden="true" />

                  <button className="control-btn" onClick={() => setIsAIOpen(true)}>
                    ✨ {t('AI Translate')}
                  </button>
                </div>
              </div>
              {isLayoutOpen && <LayoutControls layout={layout} onChange={setLayout} />}
              <ResumePreview 
                data={data} 
                layout={layout} 
                language={language} 
                template={template}
                onSectionReorder={handleSectionReorder}
                compact 
              />
            </aside>
          )}
        </main>

        {/* Mobile Preview FAB — shown on ≤1024px */}
        {!isPreview && (
          <button 
            className="mobile-preview-fab"
            onClick={() => setShowMobilePreview(true)}
          >
            👁 {t('Preview')}
          </button>
        )}

        {/* Mobile Preview Overlay */}
        {showMobilePreview && (
          <div className="mobile-preview-overlay">
            <div className="mobile-preview-header">
              <span className="preview-label">{t('Live Preview')}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className={`template-btn ${template === 'standard' ? 'active' : ''}`}
                  onClick={() => setTemplate('standard')}
                >Standard</button>
                <button
                  className={`template-btn ${template === 'modern' ? 'active' : ''}`}
                  onClick={() => setTemplate('modern')}
                >Modern</button>
                <button className="btn-secondary" onClick={() => setShowMobilePreview(false)} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  ✕ {t('Close')}
                </button>
              </div>
            </div>
            <div className="mobile-preview-body">
              <ResumePreview data={data} layout={layout} language={language} template={template} />
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          {isAIOpen && (
            <AIPromptModal 
              isOpen={isAIOpen} 
              onClose={() => setIsAIOpen(false)} 
              data={data} 
              language={language} 
            />
          )}
        </Suspense>

        {/* Auto-save toast */}
        {saved && (
          <div className="save-toast" key={Date.now()}>
            <span className="save-dot" />
            ✓ {t('Saved')}
          </div>
        )}

        {/* Clear confirmation dialog */}
        {showClearConfirm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="clear-confirm-title">
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
              <h2 id="clear-confirm-title" style={{ fontSize: '18px' }}>⚠️ {t('Are you sure?')}</h2>
              <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px' }}>
                {t('This will erase all your resume data. This action cannot be undone.')}
              </p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowClearConfirm(false)}>{t('Cancel')}</button>
                <button className="btn-danger" onClick={clearData} style={{ padding: '10px 20px', fontSize: '14px' }}>{t('Yes, clear everything')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Print-only resume */}
        <div id="resume-print" style={{ display: 'none' }}>
          <ResumePreview data={data} layout={layout} language={language} template={template} printMode />
        </div>
      </div>
    </TranslationContext.Provider>
  );
}
