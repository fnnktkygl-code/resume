import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { STEPS, DEFAULT_DATA, createEmptyExperience, createEmptyEducation, createEmptyProject, createEmptyCertification, createEmptyCustomSection } from './utils/constants';
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
import CustomStep from './components/steps/CustomStep';
import { exportMarkdown, exportJson, importJson } from './utils/exporters';
import { sanitizeResumeData } from './utils/sanitize';
import { TranslationContext } from './utils/TranslationContext';
import { getTranslation } from './utils/translations';
import LayoutControls from './components/LayoutControls';
const AIPromptModal = lazy(() => import('./components/AIPromptModal'));
const AIBoldModal = lazy(() => import('./components/AIBoldModal'));

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
      const sanitized = sanitizeResumeData(parsed);
      return {
        ...DEFAULT_DATA,
        ...sanitized,
        headings: { ...DEFAULT_DATA.headings, ...sanitized.headings },
        personal: { ...DEFAULT_DATA.personal, ...sanitized.personal },
        skills: { ...DEFAULT_DATA.skills, ...sanitized.skills },
        projects: sanitized.projects || DEFAULT_DATA.projects,
        certifications: sanitized.certifications || DEFAULT_DATA.certifications,
        sectionOrder: sanitized.sectionOrder || DEFAULT_SECTION_ORDER,
        customSections: sanitized.customSections || [],
      };
    }
  } catch {}
  return { ...structuredClone(DEFAULT_DATA), sectionOrder: [...DEFAULT_SECTION_ORDER] };
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
  const [isMobileLayoutOpen, setIsMobileLayoutOpen] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exportConfig, setExportConfig] = useState({ type: '', title: '', message: '', action: null });
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [aiBoldConfig, setAiBoldConfig] = useState({ isOpen: false, text: '', contextType: '' });

  
  const removeSection = useCallback((sectionId) => {
    setData(prev => {
      const isCustom = sectionId.startsWith('custom_');
      return {
        ...prev,
        sectionOrder: prev.sectionOrder.filter(id => id !== sectionId),
        ...(isCustom && {
          customSections: (prev.customSections || []).filter(s => s.id !== sectionId)
        })
      };
    });
    setSectionToDelete(null);
    setStep(prevStep => Math.max(0, prevStep - 1));
  }, []);

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

  const allSteps = useMemo(() => {
    const custom = (data.customSections || []).map(s => ({
      id: s.id,
      label: s.label || 'Custom',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
    }));
    return [...STEPS, ...custom];
  }, [data.customSections]);

  const currentId = allSteps[step]?.id;

  const addCustomSection = () => {
    const newSection = createEmptyCustomSection('New Section');
    setData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection],
      sectionOrder: [...prev.sectionOrder, newSection.id]
    }));
    setStep(allSteps.length); // Navigate to the new step right away
  };

  const handleImport = useCallback((imported) => {
    const defaultData = structuredClone(DEFAULT_DATA);
    setData({
      ...defaultData,
      ...imported,
      headings: { ...defaultData.headings, ...imported.headings },
      personal: { ...defaultData.personal, ...imported.personal },
      skills: { ...defaultData.skills, ...imported.skills },
      projects: imported.projects || DEFAULT_DATA.projects,
      certifications: imported.certifications || DEFAULT_DATA.certifications,
      sectionOrder: imported.sectionOrder || DEFAULT_SECTION_ORDER,
    });
  }, []);

  const clearData = () => {
    setData({ ...structuredClone(DEFAULT_DATA), sectionOrder: [...DEFAULT_SECTION_ORDER] });
    setStep(0);
    setShowClearConfirm(false);
  };

  const loadDemoData = useCallback((pages) => {
    let demoData;
    if (pages === 1) {
      demoData = language === 'fr' ? DEMO_DATA_1_PAGE_FR : DEMO_DATA_1_PAGE;
    } else {
      demoData = language === 'fr' ? DEMO_DATA_2_PAGES_FR : DEMO_DATA_2_PAGES;
    }
    const cloned = structuredClone(demoData);
    if (!cloned.sectionOrder) cloned.sectionOrder = [...DEFAULT_SECTION_ORDER];
    setData(cloned);
    setStep(0);
    setMobileMenuOpen(false);
  }, [language]);

  const handleSectionReorder = useCallback((newOrder) => {
    setData(prev => ({ ...prev, sectionOrder: newOrder }));
  }, []);
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setData(prev => {
      const isDemo1 = prev.personal.name === 'Hoshi Fenneko';
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
      default: 
        if (stepId?.startsWith('custom_')) {
          const sec = data.customSections?.find(s => s.id === stepId);
          return sec && sec.items.some(i => i.title || i.subtitle);
        }
        return false;
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
            <span className="privacy-note"><i className="fi fi-rr-lock"></i> {t('All data stays in your browser')}</span>
            <button className="btn-demo" onClick={() => loadDemoData(1)}>
              <i className="fi fi-rr-document"></i> {t('1-Page Demo')}
            </button>
            <button className="btn-demo" onClick={() => loadDemoData(2)}>
              <i className="fi fi-rr-copy"></i> {t('2-Page Demo')}
            </button>
            <button className="btn-demo" onClick={() => setShowClearConfirm(true)}>
              <i className="fi fi-rr-trash"></i> {t('Clear')}
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
              <button className="btn-demo" onClick={() => loadDemoData(1)}>
                <i className="fi fi-rr-document"></i> {t('1-Page Demo')}
              </button>
              <button className="btn-demo" onClick={() => loadDemoData(2)}>
                <i className="fi fi-rr-copy"></i> {t('2-Page Demo')}
              </button>
              <button className="btn-demo" onClick={() => { setShowClearConfirm(true); setMobileMenuOpen(false); }}>
                <i className="fi fi-rr-trash"></i> {t('Clear')}
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
              {allSteps.map((s, i) => (
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
              <button 
                className="step-btn step-add-btn" 
                onClick={addCustomSection}
                title={t("Add Custom Section")}
                aria-label={t("Add Custom Section")}
              >
                <span className="step-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>
                <span className="step-label">{t('Add Section')}</span>
              </button>
            </nav>

            {/* ATS Score */}
            <AtsScore data={data} />

            {/* Step Content */}
            <div className="animate-fade-in" key={currentId}>
              {!data.sectionOrder.includes(currentId) && currentId !== 'personal' && currentId !== 'summary' && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                    <i className="fi fi-rr-eye-crossed" style={{ color: 'var(--color-primary)' }}></i>
                    <span>{t('This section is hidden from your resume.')}</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => setData(prev => ({ ...prev, sectionOrder: [...prev.sectionOrder, currentId] }))}
                    style={{ padding: '6px 16px', fontSize: '14px' }}
                  >
                    + {t('Add to Resume')}
                  </button>
                </div>
              )}

              {currentId === 'personal' && (
                <PersonalStep 
                  data={data.personal} 
                  headings={data.headings}
                  onChange={(v) => setData({ ...data, personal: v })} 
                  onHeadingsChange={(v) => setData({ ...data, headings: v })}
                />
              )}
              {currentId === 'summary' && (
                <SummaryStep 
                  data={data.summary} 
                  onChange={(v) => setData({ ...data, summary: v })} 
                  onAIAssist={(text) => setAiBoldConfig({ isOpen: true, text, contextType: 'summary' })}
                />
              )}
              {currentId === 'experience' && (
                <ExperienceStep 
                  data={data.experience} 
                  onChange={(v) => setData({ ...data, experience: v })} 
                  onAIAssist={(text) => setAiBoldConfig({ isOpen: true, text, contextType: 'experience' })}
                />
              )}
              {currentId === 'education' && (
                <EducationStep data={data.education} onChange={(v) => setData({ ...data, education: v })} />
              )}
              {currentId === 'skills' && (
                <SkillsStep data={data.skills} onChange={(v) => setData({ ...data, skills: v })} />
              )}
              {currentId === 'projects' && (
                <ProjectsStep 
                  data={data.projects} 
                  onChange={(v) => setData({ ...data, projects: v })} 
                  onAIAssist={(text) => setAiBoldConfig({ isOpen: true, text, contextType: 'projects' })}
                />
              )}
              {currentId === 'certifications' && (
                <CertificationsStep data={data.certifications} onChange={(v) => setData({ ...data, certifications: v })} />
              )}
              {currentId?.startsWith('custom_') && (
                <CustomStep 
                  section={data.customSections.find(s => s.id === currentId)} 
                  onChange={(updatedSec) => {
                    const mapped = (data.customSections || []).map(s => s.id === currentId ? updatedSec : s);
                    setData({ ...data, customSections: mapped });
                  }} 
                  onDelete={() => setSectionToDelete(currentId)}
                />
              )}

            </div>

            {/* Navigation */}
            <div className="step-nav">
              {step > 0 ? (
                <button className="btn-secondary" onClick={() => setStep(step - 1)}>{t('Back')}</button>
              ) : <div />}
              {step < allSteps.length - 1 && (
                <button className="btn-primary" onClick={() => setStep(step + 1)}>
                  {t('Continue')}
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
            <aside className="preview-panel" aria-label={t('Live Preview')}>
              <div className="preview-sticky-header">
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
                        onClick={() => setLayout(prev => ({
                          ...prev,
                          isCompact: !prev.isCompact,
                          fontSize: prev.isCompact ? 10.5 : 9.5,
                          paddingX: prev.isCompact ? 0.75 : 0.5,
                          paddingY: prev.isCompact ? 0.75 : 0.5,
                          lineHeight: prev.isCompact ? 1.45 : 1.25,
                          sectionSpacing: prev.isCompact ? 10 : 4,
                          itemSpacing: prev.isCompact ? 8 : 4
                        }))}
                      >
                        📐 {layout.isCompact ? t('Normal') : t('Compact')}
                      </button>
                      <button 
                        className={`control-btn ${isLayoutOpen ? 'active' : ''}`}
                        onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                        aria-expanded={isLayoutOpen}
                      >
                        <i className="fi fi-rr-settings"></i>
                      </button>
                    </div>

                    <div className="control-divider" aria-hidden="true" />

                    <button className="control-btn" onClick={() => setIsAIOpen(true)}>
                      <i className="fi fi-rr-magic-wand"></i> {t('AI Translate')}
                    </button>
                  </div>
                </div>

                {isLayoutOpen && <LayoutControls layout={layout} onChange={setLayout} />}
                
                <div className="preview-export-bar">
                  <button 
                    type="button"
                    className="btn-export" 
                    onClick={() => {
                      setExportConfig({
                        type: 'pdf',
                        icon: <i className="fi fi-rr-print" style={{ fontSize: '1.2rem' }}></i>,
                        title: t('Print / Save as PDF'),
                        message: t('Export CV to PDF?'),
                        action: () => setTimeout(() => window.print(), 100)
                      });
                      setShowExportConfirm(true);
                    }}
                  >
                    {t('Print / Save as PDF')}
                  </button>
                  <button 
                    type="button"
                    className="btn-export" 
                    onClick={() => {
                      setExportConfig({
                        type: 'markdown',
                        icon: <i className="fi fi-rr-file-code" style={{ fontSize: '1.2rem' }}></i>,
                        title: t('Markdown'),
                        message: t('Export CV to Markdown?'),
                        action: () => {
                          try {
                            exportMarkdown(data);
                          } catch (err) {
                            alert('Export failed: ' + err.message);
                          }
                        }
                      });
                      setShowExportConfirm(true);
                    }}
                  >
                    {t('Markdown')}
                  </button>
                  <button 
                    type="button"
                    className="btn-export" 
                    onClick={() => {
                      setExportConfig({
                        type: 'json',
                        icon: <i className="fi fi-rr-disk" style={{ fontSize: '1.2rem' }}></i>,
                        title: t('Export JSON'),
                        message: t('Export CV to JSON?'),
                        action: () => {
                          try {
                            exportJson(data);
                          } catch (err) {
                            alert('Export failed: ' + err.message);
                          }
                        }
                      });
                      setShowExportConfirm(true);
                    }}
                  >
                    {t('Export JSON')}
                  </button>
                </div>
              </div>
              <ResumePreview 
                data={data} 
                layout={layout} 
                language={language} 
                template={template}
                onSectionReorder={handleSectionReorder}
                onSectionRemove={setSectionToDelete}
                compact 
              />
            </aside>
        </main>

        {/* Mobile Preview FAB — shown on ≤1024px */}
        <button 
          className="mobile-preview-fab"
          onClick={() => setShowMobilePreview(true)}
        >
          <i className="fi fi-rr-eye"></i> {t('Preview')}
        </button>

        {/* Mobile Preview Overlay */}
        {showMobilePreview && (
          <div className="mobile-preview-overlay">
            <div className="mobile-preview-header">
              <span className="preview-label">{t('Live Preview')}</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* Template picker */}
                <div style={{ display: 'flex', gap: '2px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                  <button
                    className={`template-btn ${template === 'standard' ? 'active' : ''}`}
                    onClick={() => setTemplate('standard')}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >Standard</button>
                  <button
                    className={`template-btn ${template === 'modern' ? 'active' : ''}`}
                    onClick={() => setTemplate('modern')}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >Modern</button>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)', height: '16px' }} />
                {/* Compact toggle */}
                <button 
                  className={`control-btn ${layout.isCompact ? 'active' : ''}`}
                  onClick={() => setLayout(prev => ({
                    ...prev,
                    isCompact: !prev.isCompact,
                    fontSize: prev.isCompact ? 10.5 : 9.5,
                    paddingX: prev.isCompact ? 0.75 : 0.5,
                    paddingY: prev.isCompact ? 0.75 : 0.5,
                    lineHeight: prev.isCompact ? 1.45 : 1.25,
                    sectionSpacing: prev.isCompact ? 10 : 4,
                    itemSpacing: prev.isCompact ? 8 : 4
                  }))}
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  📐 {layout.isCompact ? t('Normal') : t('Compact')}
                </button>
                {/* Layout settings */}
                <button 
                  className={`control-btn ${isMobileLayoutOpen ? 'active' : ''}`}
                  onClick={() => setIsMobileLayoutOpen(!isMobileLayoutOpen)}
                  style={{ padding: '6px' }}
                ><i className="fi fi-rr-settings"></i></button>
                <div style={{ width: '1px', background: 'var(--color-border)', height: '16px' }} />
                {/* Export buttons */}
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => {
                    setExportConfig({
                      type: 'pdf',
                      icon: <i className="fi fi-rr-print" style={{ fontSize: '1.2rem' }}></i>,
                      title: t('Print / Save as PDF'),
                      message: t('Export CV to PDF?'),
                      action: () => setTimeout(() => window.print(), 100)
                    });
                    setShowExportConfirm(true);
                  }} 
                  title={t('Print / Save as PDF')}
                >
                  <i className="fi fi-rr-print" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => {
                    setExportConfig({
                      type: 'markdown',
                      icon: <i className="fi fi-rr-file-code" style={{ fontSize: '1.2rem' }}></i>,
                      title: t('Markdown'),
                      message: t('Export CV to Markdown?'),
                      action: () => {
                        try {
                          exportMarkdown(data);
                        } catch (err) {
                          alert('Export failed: ' + err.message);
                        }
                      }
                    });
                    setShowExportConfirm(true);
                  }} 
                  title={t('Markdown')}
                >
                  <i className="fi fi-rr-file-code" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => {
                    setExportConfig({
                      type: 'json',
                      icon: <i className="fi fi-rr-disk" style={{ fontSize: '1.2rem' }}></i>,
                      title: t('Export JSON'),
                      message: t('Export CV to JSON?'),
                      action: () => {
                        try {
                          exportJson(data);
                        } catch (err) {
                          alert('Export failed: ' + err.message);
                        }
                      }
                    });
                    setShowExportConfirm(true);
                  }} 
                  title={t('Export JSON')}
                >
                  <i className="fi fi-rr-disk" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <div style={{ width: '1px', background: 'var(--color-border)', height: '16px' }} />
                <button className="btn-secondary" onClick={() => setShowMobilePreview(false)} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  ✕ {t('Close')}
                </button>
              </div>
              {isMobileLayoutOpen && (
                <div style={{ padding: '12px 16px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                  <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <LayoutControls layout={layout} onChange={setLayout} />
                  </div>
                </div>
              )}
            </div>
            <div className="mobile-preview-body" style={{ flexDirection: 'column' }}>
              <ResumePreview 
                data={data} 
                layout={layout} 
                language={language} 
                template={template} 
                onSectionReorder={(newOrder) => setData(prev => ({ ...prev, sectionOrder: newOrder }))}
                onSectionRemove={setSectionToDelete}
              />
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
          {aiBoldConfig.isOpen && (
            <AIBoldModal
              isOpen={aiBoldConfig.isOpen}
              onClose={() => setAiBoldConfig({ ...aiBoldConfig, isOpen: false })}
              textData={aiBoldConfig.text}
              contextType={aiBoldConfig.contextType}
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

        {/* Section delete confirmation modal */}
        {sectionToDelete && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ color: '#ef4444', display: 'flex' }}><i className="fi fi-rr-trash"></i></span> 
                {language === 'fr' ? 'Supprimer cette section ?' : 'Remove this section?'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px', fontSize: '14px' }}>
                {language === 'fr' ? 'Cette action retirera la section de votre CV. Vous pourrez la rajouter plus tard.' : 'This action will remove the section from your resume. You can add it back later.'}
              </p>
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setSectionToDelete(null)}>{t('Cancel')}</button>
                <button 
                  className="btn-primary" 
                  onClick={() => removeSection(sectionToDelete)} 
                  style={{ padding: '10px 24px', fontSize: '14px', background: '#ef4444', borderColor: '#ef4444' }}
                >
                  {t('Confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export confirmation dialog */}
        {showExportConfirm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-confirm-title">
            <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
              <h2 id="export-confirm-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', display: 'flex' }}>{exportConfig.icon}</span> 
                {exportConfig.title}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px', fontSize: '14px' }}>
                {exportConfig.message}
              </p>
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setShowExportConfirm(false)}>{t('Cancel')}</button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setShowExportConfirm(false);
                    if (exportConfig.action) exportConfig.action();
                  }} 
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                >
                  {t('Confirm')}
                </button>
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
