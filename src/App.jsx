import { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef } from 'react';
import { STEPS, DEFAULT_DATA, createEmptyExperience, createEmptyEducation, createEmptyProject, createEmptyCertification, createEmptyCustomSection, createEmptySpacer } from './utils/constants';
import { DEMO_DATA_1_PAGE, DEMO_DATA_2_PAGES, DEMO_DATA_1_PAGE_FR, DEMO_DATA_2_PAGES_FR, DEMO_DATA_1_PAGE_ES, DEMO_DATA_2_PAGES_ES } from './utils/demoData';
import AtsScoreModal from './components/ui/AtsScoreModal';
import ResumePreview from './components/ResumePreview';
import FullscreenPreview from './components/FullscreenPreview';
import { Document, Page, pdfjs } from 'react-pdf';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = PDFWorker;

import PersonalStep from './components/steps/PersonalStep';
import SummaryStep from './components/steps/SummaryStep';
import ExperienceStep from './components/steps/ExperienceStep';
import EducationStep from './components/steps/EducationStep';
import SkillsStep from './components/steps/SkillsStep';
import ProjectsStep from './components/steps/ProjectsStep';
import CertificationsStep from './components/steps/CertificationsStep';
import CustomStep from './components/steps/CustomStep';
import SpacerStep from './components/steps/SpacerStep';
import { exportMarkdown, exportJson, importJson, exportDocx } from './utils/exporters';
import { sanitizeResumeData } from './utils/sanitize';
import { computeAtsScore } from './utils/atsScore';
import { TranslationContext } from './utils/TranslationContext';
import { getTranslation } from './utils/translations';
import LayoutControls from './components/LayoutControls';
import Modal from './components/ui/Modal';
import Header from './components/Header';
import useResumeHistory from './hooks/useResumeHistory';
import useResumeDocuments from './hooks/useResumeDocuments';
import resumeReducer from './reducers/resumeReducer';
import { translateHeadings, translateCustomSectionLabels } from './utils/languageSwitcher';
import { getAdaptiveAccentColor, hexToRgbStr, getContrastTextColor } from './utils/colorUtils';
const AIPromptModal = lazy(() => import('./components/AIPromptModal'));
const AIBoldModal = lazy(() => import('./components/AIBoldModal'));
const AITailorModal = lazy(() => import('./components/ui/AITailorModal'));
const AIBoldifyModal = lazy(() => import('./components/ui/AIBoldifyModal'));
const AIBulletPointsModal = lazy(() => import('./components/ui/AIBulletPointsModal'));
const OnboardingModal = lazy(() => import('./components/ui/OnboardingModal'));
const CVManagerModal = lazy(() => import('./components/ui/CVManagerModal'));
const ReorderSectionsModal = lazy(() => import('./components/ui/ReorderSectionsModal'));
const CoverLetterModal = lazy(() => import('./components/ui/CoverLetterModal'));
const AISectionFillModal = lazy(() => import('./components/ui/AISectionFillModal'));
const ATSKeywordsModal = lazy(() => import('./components/ui/ATSKeywordsModal'));
const CareerOpsHub = lazy(() => import('./components/career/CareerOpsHub'));
import ImportModal from './components/ui/ImportModal';
import DailyTipModal from './components/ui/DailyTipModal';
import { buildResumeContext, checkResumeReadiness } from './utils/buildResumeContext';

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
  accentColor: '#1B6B3A',
  fontFamily: 'Inter',
  splitLinks: true,
  coloredSkills: false,
};

const DEFAULT_SECTION_ORDER = ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom_langues', 'custom_atouts', 'custom_loisirs'];

function detectLanguage() {
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
  } catch {
    return 'en';
  }
}

function loadData() {
  const lang = detectLanguage();
  const getLocalizedDefaultData = () => {
    const defaultData = structuredClone(DEFAULT_DATA);
    if (lang === 'fr') {
      defaultData.customSections[0].label = 'Langues';
      defaultData.customSections[1].label = 'Atouts';
      defaultData.customSections[2].label = 'Loisirs';
    } else if (lang === 'es') {
      defaultData.customSections[0].label = 'Idiomas';
      defaultData.customSections[1].label = 'Fortalezas';
      defaultData.customSections[2].label = 'Aficiones';
    } else {
      defaultData.customSections[0].label = 'Languages';
      defaultData.customSections[1].label = 'Strengths';
      defaultData.customSections[2].label = 'Hobbies';
    }
    return defaultData;
  };

  try {
    const listSaved = localStorage.getItem('resume-builder-cv-list');
    const activeId = localStorage.getItem('resume-builder-active-cv-id') || 'default';
    if (listSaved) {
      const parsed = JSON.parse(listSaved);
      const activeCv = parsed.find(c => c.id === activeId);
      if (activeCv && activeCv.data) {
        return activeCv.data;
      }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeResumeData(parsed);
      const localizedDefaults = getLocalizedDefaultData();
      return {
        ...localizedDefaults,
        ...sanitized,
        headings: { ...localizedDefaults.headings, ...sanitized.headings },
        personal: { ...localizedDefaults.personal, ...sanitized.personal },
        skills: { ...localizedDefaults.skills, ...sanitized.skills },
        projects: sanitized.projects || localizedDefaults.projects,
        certifications: sanitized.certifications || localizedDefaults.certifications,
        sectionOrder: sanitized.sectionOrder || DEFAULT_SECTION_ORDER,
        customSections: (sanitized.customSections && sanitized.customSections.length > 0) ? sanitized.customSections : localizedDefaults.customSections,
      };
    }
  } catch {}
  return { ...getLocalizedDefaultData(), sectionOrder: [...DEFAULT_SECTION_ORDER] };
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
    const val = localStorage.getItem(TEMPLATE_KEY);
    if (val === 'recruiter') return 'njm';
    return val || 'standard';
  } catch {
    return 'standard';
  }
}

export default function App() {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(loadTheme);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(detectLanguage);
  const [layout, setLayout] = useState(loadLayout);
  const [template, setTemplate] = useState(loadTemplate);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTailorOpen, setIsTailorOpen] = useState(false);
  const [isBoldifyOpen, setIsBoldifyOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isAtsScoreModalOpen, setIsAtsScoreModalOpen] = useState(false);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isAIToolsDropdownOpen, setIsAIToolsDropdownOpen] = useState(false);
  const [draggedStepId, setDraggedStepId] = useState(null);
  const [dragOverStepId, setDragOverStepId] = useState(null);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const templateDropdownRef = useRef(null);
  const aiToolsDropdownRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeAITipCallback, setActiveAITipCallback] = useState(null);

  const [originalImportInput, setOriginalImportInput] = useState(null);
  const [aiBulletConfig, setAiBulletConfig] = useState(null);
  const [aiSectionFillConfig, setAiSectionFillConfig] = useState(null);

  const [
    data,
    dispatch,
    {
      past,
      future,
      undo,
      redo,
      aiSnapshot,
      setAiSnapshot,
      saveSnapshot,
      restoreSnapshot
    }
  ] = useResumeHistory(resumeReducer, loadData);

  const [importSnapshot, setImportSnapshot] = useState(() => {
    try {
      const listSaved = localStorage.getItem('resume-builder-cv-list');
      const activeId = localStorage.getItem('resume-builder-active-cv-id') || 'default';
      if (listSaved) {
        const parsed = JSON.parse(listSaved);
        const activeCv = parsed.find(c => c.id === activeId);
        return activeCv?.importSnapshot || null;
      }
    } catch {}
    return null;
  });

  const [fullscreenPageIndex, setFullscreenPageIndex] = useState(0);
  const [fullscreenZoom, setFullscreenZoom] = useState(1.0);
  const [editorPagesCount, setEditorPagesCount] = useState(1);
  const [isPreviewHeaderCollapsed, setIsPreviewHeaderCollapsed] = useState(false);
  
  const [isCvManagerOpen, setIsCvManagerOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isDailyTipOpen, setIsDailyTipOpen] = useState(false);
  const [isCareerOpsOpen, setIsCareerOpsOpen] = useState(false);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastSeen = localStorage.getItem('resume-builder-daily-tip-seen');
      if (lastSeen !== todayStr) {
        const timer = setTimeout(() => {
          setIsDailyTipOpen(true);
          localStorage.setItem('resume-builder-daily-tip-seen', todayStr);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const t = (key) => getTranslation(language, key);

  const {
    cvList,
    activeCvId,
    handleSaveCv,
    handleLoadCv,
    handleCreateCv,
    handleDuplicateCv,
    handleRenameCv,
    handleDeleteCv,
    handleLoadDemoCv,
    handleExportData,
    handleImportData
  } = useResumeDocuments({
    data,
    dispatch,
    importSnapshot,
    setImportSnapshot,
    setStep,
    setIsCvManagerOpen,
    language,
    t
  });

  const [saveStatus, setSaveStatus] = useState('idle');
  const handleManualSave = useCallback(() => {
    handleSaveCv();
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2200);
  }, [handleSaveCv]);

  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load demo data when ?demo=fr or ?demo=en is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoLang = params.get('demo');
    if (!demoLang) return;

    const demoId = demoLang === 'fr' ? 'demo_fr' : 'demo_en';

    fetch('/demo-data.json')
      .then(r => r.json())
      .then(demoList => {
        const target = demoList.find(cv => cv.id === demoId);
        if (target && target.data) {
          handleImportData([target]);
          // Clean the URL so a refresh doesn't reload demo again
          const url = new URL(window.location);
          url.searchParams.delete('demo');
          window.history.replaceState({}, '', url);
        }
      })
      .catch(() => {}); // silently ignore if demo-data.json is missing
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamic theme accent color sync (adapts accent contrast for dark mode)
  useEffect(() => {
    const rawAccent = layout.accentColor || '#1B6B3A';
    const accent = getAdaptiveAccentColor(rawAccent, theme);
    const contrastText = getContrastTextColor(accent);

    document.documentElement.style.setProperty('--color-accent', accent);
    document.documentElement.style.setProperty('--color-accent-contrast', contrastText);
    
    const rgbStr = hexToRgbStr(accent);
    const [r, g, b] = rgbStr.split(',').map(n => parseInt(n.trim(), 10));
    
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const lightOpacity = theme === 'dark' ? '0.18' : '0.1';
      document.documentElement.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`);
      document.documentElement.style.setProperty('--color-accent-light', `rgba(${r}, ${g}, ${b}, ${lightOpacity})`);
      document.documentElement.style.setProperty('--color-accent-hover', `rgba(${r}, ${g}, ${b}, 0.85)`);
    } else {
      document.documentElement.style.setProperty('--color-accent-light', theme === 'dark' ? 'rgba(74, 222, 128, 0.18)' : 'rgba(27, 107, 58, 0.1)');
      document.documentElement.style.setProperty('--color-accent-hover', 'rgba(27, 107, 58, 0.85)');
    }
  }, [layout.accentColor, theme]);

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isMobileLayoutOpen, setIsMobileLayoutOpen] = useState(false);

  // Close template dropdown on outside click
  useEffect(() => {
    if (!isTemplateDropdownOpen && !isAIToolsDropdownOpen) return;
    function handleOutside(e) {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target)) {
        setIsTemplateDropdownOpen(false);
      }
      if (aiToolsDropdownRef.current && !aiToolsDropdownRef.current.contains(e.target)) {
        setIsAIToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isTemplateDropdownOpen, isAIToolsDropdownOpen]);

  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [aiBoldConfig, setAiBoldConfig] = useState({ isOpen: false, text: '', contextType: '', onUpdate: null });
  const removeSection = useCallback((sectionId) => {
    dispatch({ type: 'REMOVE_SECTION', payload: sectionId });
    setSectionToDelete(null);
    setStep(prevStep => Math.max(0, prevStep - 1));
  }, []);

  const hasContent = useMemo(() => {
    const p = data.personal;
    const hasContact = p.name || p.email || p.phone;
    const validExp = data.experience.filter(e => e.company || e.title);
    const validEdu = data.education.filter(e => e.institution || e.degree);
    const validProj = data.projects.filter(pr => pr.name);
    const validCert = data.certifications.filter(c => c.name);
    const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;
    return Boolean(hasContact || data.summary || validExp.length || validEdu.length || hasSkills || validProj.length || validCert.length);
  }, [data]);

  const atsScore = useMemo(() => {
    if (!hasContent) return null;
    try { return computeAtsScore(data); } catch { return null; }
  }, [data, hasContent]);

  const calculatedFullscreenScale = useMemo(() => {
    return Math.min((viewportSize.width - 48) / 794, (viewportSize.height - 110) / 1122);
  }, [viewportSize]);

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
    const custom = (data.customSections || []).map(s => {
      let icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
      
      if (s.id === 'custom_langues') {
        icon = <i className="fi fi-rr-globe" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i>;
      } else if (s.id === 'custom_atouts') {
        icon = <i className="fi fi-rr-star" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i>;
      } else if (s.id === 'custom_loisirs') {
        icon = <i className="fi fi-rr-smile" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i>;
      } else if (s.id.startsWith('spacer_')) {
        icon = <i className="fi fi-rr-expand-arrows" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i>;
        return {
          id: s.id,
          label: 'Spacer',
          icon
        };
      }
      
      return {
        id: s.id,
        label: s.label || 'Custom',
        icon
      };
    });
    
    // Base sections map
    const baseSections = STEPS.reduce((acc, step) => {
      acc[step.id] = step;
      return acc;
    }, {});
    
    // Custom sections map
    const customSections = custom.reduce((acc, step) => {
      acc[step.id] = step;
      return acc;
    }, {});
    
    // Build ordered steps
    const orderedSteps = [baseSections['personal']]; // Personal always first
    
    const order = data.sectionOrder || DEFAULT_SECTION_ORDER;
    order.forEach(id => {
      if (baseSections[id]) orderedSteps.push(baseSections[id]);
      else if (customSections[id]) orderedSteps.push(customSections[id]);
    });
    
    // Add any missing custom sections that somehow aren't in sectionOrder
    custom.forEach(c => {
      if (!orderedSteps.find(s => s.id === c.id)) {
        orderedSteps.push(c);
      }
    });

    return orderedSteps;
  }, [data.customSections, data.sectionOrder]);

  const currentId = allSteps[step]?.id;

  const handleSectionClick = useCallback((sectionId) => {
    const idx = allSteps.findIndex(s => s.id === sectionId);
    if (idx !== -1) {
      setStep(idx);
      if (window.innerWidth <= 1024) setMobileMenuOpen(false);
      setShowMobilePreview(false); // Close preview on mobile to show the editor
      return;
    }

    // If it's a default custom section that is missing, create it
    if (sectionId === 'custom_langues' || sectionId === 'custom_atouts' || sectionId === 'custom_loisirs') {
      const isLangues = sectionId === 'custom_langues';
      const isAtouts = sectionId === 'custom_atouts';
      const label = isLangues
        ? (language === 'fr' ? 'Langues' : language === 'es' ? 'Idiomas' : 'Languages')
        : isAtouts
        ? (language === 'fr' ? 'Atouts' : language === 'es' ? 'Fortalezas' : 'Strengths')
        : (language === 'fr' ? 'Loisirs' : language === 'es' ? 'Aficiones' : 'Hobbies');
      
      const newSec = {
        id: sectionId,
        label,
        items: [{
          id: `item_${isLangues ? 'langues' : isAtouts ? 'atouts' : 'loisirs'}_1`,
          title: '',
          subtitle: '',
          date: '',
          description: ''
        }]
      };

      dispatch({
        type: 'SET_DATA',
        payload: {
          ...data,
          customSections: [...(data.customSections || []), newSec],
          sectionOrder: [...(data.sectionOrder || []), sectionId]
        }
      });

      setStep(allSteps.length);
      setShowMobilePreview(false);
    }
  }, [allSteps, language, data, dispatch]);

  const handleStepperDragStart = (e, sectionId) => {
    if (sectionId === 'personal') {
      e.preventDefault();
      return;
    }
    setDraggedStepId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  };

  const handleStepperDragOver = (e, sectionId) => {
    e.preventDefault();
    if (sectionId === 'personal') return;
    if (draggedStepId && draggedStepId !== sectionId) {
      setDragOverStepId(sectionId);
    }
  };

  const handleStepperDrop = (e, targetSectionId) => {
    e.preventDefault();
    if (targetSectionId === 'personal') return;
    if (draggedStepId && draggedStepId !== targetSectionId) {
      const newOrder = [...data.sectionOrder];
      const fromIdx = newOrder.indexOf(draggedStepId);
      const toIdx = newOrder.indexOf(targetSectionId);
      if (fromIdx !== -1 && toIdx !== -1) {
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedStepId);
        handleSectionReorder(newOrder);
      }
      
      const newAllSteps = [...allSteps];
      const stepFromIdx = newAllSteps.findIndex(s => s.id === draggedStepId);
      const stepToIdx = newAllSteps.findIndex(s => s.id === targetSectionId);
      if (stepFromIdx !== -1 && stepToIdx !== -1) {
        setStep(stepToIdx);
      }
    }
    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  const stepButtonRefs = useRef([]);

  const isSectionHidden = useCallback((sectionId) => {
    if (sectionId === 'personal') return false;
    return Array.isArray(data.sectionOrder) && !data.sectionOrder.includes(sectionId);
  }, [data.sectionOrder]);

  const handleStepperKeyDown = (e, currentIndex) => {
    let targetIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % allSteps.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + allSteps.length) % allSteps.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = allSteps.length - 1;
    }

    if (targetIndex !== null) {
      setStep(targetIndex);
      setTimeout(() => {
        if (stepButtonRefs.current[targetIndex]) {
          stepButtonRefs.current[targetIndex].focus();
        }
      }, 0);
    }
  };

  const addCustomSection = () => {
    dispatch({ type: 'ADD_CUSTOM_SECTION', payload: 'New Section' });
    setStep(allSteps.length); // Navigate to the new step right away
  };

  const addSpacerSection = () => {
    const currentStepId = allSteps[step]?.id;
    dispatch({ type: 'ADD_SPACER_SECTION', payload: { currentStepId } });
    setStep(step + 1);
  };

  const handleAddSectionSpacer = useCallback((indexInOrder, column = 'main') => {
    dispatch({ type: 'ADD_SECTION_SPACER', payload: { indexInOrder, column } });
  }, [dispatch]);

  const handleUpdateSectionSpacer = useCallback((spacerId, height) => {
    dispatch({ type: 'UPDATE_SECTION_SPACER', payload: { spacerId, height } });
  }, [dispatch]);

  const handleDeleteSectionSpacer = useCallback((spacerId) => {
    dispatch({ type: 'DELETE_SECTION_SPACER', payload: spacerId });
  }, [dispatch]);

function estimateResumeHeightInPages(resumeData) {
  if (!resumeData) return 1;
  let lines = 0;

  // Header
  if (resumeData.personal?.name) lines += 2;
  if (resumeData.personal?.tagline) lines += 1.5;
  if (resumeData.personal?.email || resumeData.personal?.phone || resumeData.personal?.location) lines += 1.5;

  // Summary
  if (resumeData.summary) {
    lines += Math.ceil(resumeData.summary.length / 80) + 2;
  }

  // Experience
  if (Array.isArray(resumeData.experience)) {
    for (const exp of resumeData.experience) {
      if (!exp.company && !exp.title && !exp.isSpacer) continue;
      lines += 2.5; // Company, title, date, location
      if (Array.isArray(exp.bullets)) {
        for (const bullet of exp.bullets) {
          if (bullet && typeof bullet === 'string') {
            lines += Math.ceil(bullet.length / 75) + 0.5;
          }
        }
      }
    }
  }

  // Education
  if (Array.isArray(resumeData.education)) {
    for (const edu of resumeData.education) {
      if (!edu.institution && !edu.degree && !edu.isSpacer) continue;
      lines += 2;
      if (Array.isArray(edu.bullets)) {
        for (const bullet of edu.bullets) {
          if (bullet && typeof bullet === 'string') {
            lines += Math.ceil(bullet.length / 75) + 0.5;
          }
        }
      }
    }
  }

  // Skills
  if (resumeData.skills) {
    lines += 2;
    if (resumeData.skills.technical) lines += Math.ceil(resumeData.skills.technical.length / 80);
    if (resumeData.skills.soft) lines += Math.ceil(resumeData.skills.soft.length / 80);
    if (resumeData.skills.languages) lines += Math.ceil(resumeData.skills.languages.length / 80);
  }

  // Projects
  if (Array.isArray(resumeData.projects)) {
    for (const pr of resumeData.projects) {
      if (pr.name) lines += 2;
    }
  }

  // Certifications
  if (Array.isArray(resumeData.certifications)) {
    for (const c of resumeData.certifications) {
      if (c.name) lines += 1.5;
    }
  }

  // Custom sections
  if (Array.isArray(resumeData.customSections)) {
    for (const cs of resumeData.customSections) {
      if (cs.items?.some(i => i.title || i.subtitle || i.description)) {
        lines += 2 + (cs.items.length * 1.5);
      }
    }
  }

  // A standard non-compact 1-page A4 resume accommodates approximately 32 text lines.
  return lines > 32 ? 2 : 1;
}

  const handleImport = useCallback((imported, originalImported = null, originalInput = null) => {
    const defaultData = structuredClone(DEFAULT_DATA);
    
    if (imported.detectedLanguage) {
      const validLangs = ['en', 'fr', 'es'];
      const lang = imported.detectedLanguage.toLowerCase().trim();
      if (validLangs.includes(lang)) {
        setLanguage(lang);
      }
      delete imported.detectedLanguage;
    }

    let newData = {
      ...defaultData,
      ...imported,
      headings: { ...defaultData.headings, ...imported.headings },
      personal: { ...defaultData.personal, ...imported.personal },
      skills: { ...defaultData.skills, ...imported.skills },
      projects: imported.projects || DEFAULT_DATA.projects,
      certifications: imported.certifications || DEFAULT_DATA.certifications,
      sectionOrder: imported.sectionOrder || DEFAULT_SECTION_ORDER,
    };

    const ensureId = (arr) => {
      if (!Array.isArray(arr)) return arr;
      return arr.map(item => ({
        ...item,
        id: item.id || `item_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`
      }));
    };

    newData.experience = ensureId(newData.experience);
    newData.education = ensureId(newData.education);
    newData.projects = ensureId(newData.projects);
    newData.certifications = ensureId(newData.certifications);
    if (Array.isArray(newData.customSections)) {
      newData.customSections = newData.customSections.map(sec => ({
        ...sec,
        id: sec.id || `custom_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
        items: ensureId(sec.items)
      }));
    }

    let snapshotData = newData;
    
    if (originalImported) {
      snapshotData = {
        ...defaultData,
        ...originalImported,
        headings: { ...defaultData.headings, ...(originalImported.headings || {}) },
        personal: { ...defaultData.personal, ...(originalImported.personal || {}) },
        skills: { ...defaultData.skills, ...(originalImported.skills || {}) },
        projects: originalImported.projects || DEFAULT_DATA.projects,
        certifications: originalImported.certifications || DEFAULT_DATA.certifications,
        sectionOrder: originalImported.sectionOrder || DEFAULT_SECTION_ORDER,
      };
      
      const copyIds = (targetArr, sourceArr) => {
        if (!Array.isArray(targetArr)) return targetArr;
        if (!Array.isArray(sourceArr)) return targetArr;
        return targetArr.map((item, i) => ({
          ...item,
          id: sourceArr[i]?.id || item.id || `item_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`
        }));
      };

      snapshotData.experience = copyIds(snapshotData.experience, newData.experience);
      snapshotData.education = copyIds(snapshotData.education, newData.education);
      snapshotData.projects = copyIds(snapshotData.projects, newData.projects);
      snapshotData.certifications = copyIds(snapshotData.certifications, newData.certifications);
      if (Array.isArray(snapshotData.customSections)) {
        snapshotData.customSections = snapshotData.customSections.map((sec, i) => ({
          ...sec,
          id: newData.customSections?.[i]?.id || sec.id || `custom_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
          items: copyIds(sec.items, newData.customSections?.[i]?.items)
        }));
      }
    }
    
    if (originalInput?.text) {
      snapshotData.originalText = originalInput.text;
    }

    // Auto-compact if imported resume exceeds 1 page
    const estimatedPages = estimateResumeHeightInPages(newData);
    if (estimatedPages > 1) {
      setLayout(prev => ({
        ...prev,
        isCompact: true,
        fontSize: 9.5,
        paddingX: 0.5,
        paddingY: 0.5,
        lineHeight: 1.25,
        sectionSpacing: 4,
        itemSpacing: 4
      }));
    } else {
      setLayout(prev => ({
        ...prev,
        isCompact: false,
        fontSize: 10.5,
        paddingX: 0.75,
        paddingY: 0.75,
        lineHeight: 1.45,
        sectionSpacing: 8,
        itemSpacing: 12
      }));
    }

    dispatch({ type: 'SET_DATA', payload: newData });
    setImportSnapshot(snapshotData);
    setOriginalImportInput(originalInput);
  }, [dispatch, setLayout]);

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('resume-builder-cv-list');
    localStorage.removeItem('resume-builder-active-cv-id');
    localStorage.removeItem('resume-builder-onboarded');
    window.location.reload();
  };

  const loadDemoData = useCallback((pages) => {
    let demoData;
    let title = '';
    if (pages === 1) {
      demoData = language === 'fr' ? DEMO_DATA_1_PAGE_FR : language === 'es' ? DEMO_DATA_1_PAGE_ES : DEMO_DATA_1_PAGE;
      title = language === 'fr' ? 'Démo 1 Page (Marie Dubois)' : language === 'es' ? 'Demo 1 Página (Marie Dubois)' : 'Demo 1-Page';
    } else {
      demoData = language === 'fr' ? DEMO_DATA_2_PAGES_FR : language === 'es' ? DEMO_DATA_2_PAGES_ES : DEMO_DATA_2_PAGES;
      title = language === 'fr' ? 'Démo 2 Pages (Marie Dubois)' : language === 'es' ? 'Demo 2 Páginas (Marie Dubois)' : 'Demo 2-Pages';
    }
    const cloned = structuredClone(demoData);
    if (!cloned.sectionOrder) cloned.sectionOrder = [...DEFAULT_SECTION_ORDER];
    
    handleLoadDemoCv(cloned, title);
  }, [language, handleLoadDemoCv]);

  const handleOnboardingSelect = useCallback((option) => {
    localStorage.setItem('resume-builder-onboarded', 'true');
    setShowOnboarding(false);
    if (option === 'import') {
      setShowImportModal(true);
    } else if (option === 'demo') {
      loadDemoData(1);
    } else if (option === 'scratch') {
      clearData();
    }
  }, [loadDemoData, clearData]);

  const handleSectionReorder = useCallback((newOrder) => {
    dispatch({ type: 'REORDER_SECTIONS', payload: newOrder });
  }, [dispatch]);

  const handleItemReorder = useCallback((sectionId, fromIdx, toIdx) => {
    dispatch({ type: 'REORDER_ITEMS', payload: { sectionId, fromIdx, toIdx } });
  }, [dispatch]);

  const handleItemDelete = useCallback((sectionId, index) => {
    dispatch({ type: 'DELETE_ITEM', payload: { sectionId, index } });
  }, [dispatch]);

  const handleItemUpdate = useCallback((sectionId, index, updatedItem) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { sectionId, index, updatedItem } });
  }, [dispatch]);

  const handleItemAddSpacer = useCallback((sectionId, index) => {
    dispatch({ type: 'ADD_ITEM_SPACER', payload: { sectionId, index } });
  }, [dispatch]);
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const demoNames = ['John Doe', 'Jean Dupont', 'Sarah Chen', 'Alexandre Martin', 'Hoshi Fenneko', 'Jane Smith', 'Marie Dubois'];
    const isDemo = demoNames.includes(data?.personal?.name);
    const isDemo2 = isDemo && (data?.experience?.length > 2 || data?.personal?.name === 'Jane Smith' || data?.personal?.name === 'Marie Dubois');
    
    // Pick the right demo dataset if we're on demo data
    const demoMap = {
      fr: isDemo2 ? DEMO_DATA_2_PAGES_FR : isDemo ? DEMO_DATA_1_PAGE_FR : null,
      es: isDemo2 ? DEMO_DATA_2_PAGES_ES : isDemo ? DEMO_DATA_1_PAGE_ES : null,
      en: isDemo2 ? DEMO_DATA_2_PAGES : isDemo ? DEMO_DATA_1_PAGE : null,
    };
    const nextData = demoMap[lang] || data;

    dispatch({
      type: 'SET_DATA',
      payload: {
        ...nextData,
        customSections: translateCustomSectionLabels(nextData.customSections, lang),
        sectionOrder: data.sectionOrder || DEFAULT_SECTION_ORDER,
        headings: translateHeadings(nextData.headings || {}, lang),
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
  const handleAITriggerAction = (action, targetIndex, onSuccess) => {
    if (onSuccess) setActiveAITipCallback(() => onSuccess);
    
    if (action === 'OPEN_STAR_GENERATOR') {
      const expIndex = targetIndex ?? 0;
      const exp = data.experience[expIndex];
      if (exp) {
        setAiBulletConfig({
          isOpen: true,
          text: exp.bullets?.[0] || exp.description || '',
          index: expIndex,
          bulletIndex: 0
        });
        const expStepIdx = allSteps.findIndex(s => s.id === 'experience');
        if (expStepIdx !== -1) setStep(expStepIdx);
      }
    } else if (action === 'OPEN_TAILOR_MODAL') {
      setIsTailorOpen(true);
    } else if (action === 'OPEN_KEYWORD_MATCHER') {
      setIsKeywordsModalOpen(true);
    }
  };

  return (
    <TranslationContext.Provider value={language}>
      <div className="app">
        {/* Skip to content — accessibility */}
        <a href="#main-content" className="skip-link">{t('Skip to main content')}</a>

        {/* Header — M1: simplified, demos in overflow menu */}
        <Header 
          t={t}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          handleLanguageChange={handleLanguageChange}
          hasContent={hasContent}
          onSave={handleManualSave}
          saveStatus={saveStatus}
          setIsCoverLetterModalOpen={setIsCoverLetterModalOpen}
          setIsCareerOpsOpen={setIsCareerOpsOpen}
          setShowImportModal={setShowImportModal}
          setIsCvManagerOpen={setIsCvManagerOpen}
          loadDemoData={loadDemoData}
          setShowClearConfirm={setShowClearConfirm}
          setIsDailyTipOpen={setIsDailyTipOpen}
        />

        {/* Main */}
        <main className="main" id="main-content">
          {/* Left: Form Panel */}
          <div className={`form-panel ${isEditorCollapsed ? 'collapsed' : ''}`}>
            {/* S2: Profile completion bar removed — integrated into ATS Score widget */}

            {/* Mobile Section Selector (< 769px) */}
            <div className="stepper-mobile-bar mobile-only">
              <button 
                className="stepper-mobile-nav-btn"
                onClick={() => setStep(prev => Math.max(0, prev - 1))}
                disabled={step === 0}
                aria-label={t('Previous section')}
              >
                <i className="fi fi-rr-angle-left"></i>
              </button>

              <div className="stepper-mobile-select-wrapper">
                <select 
                  className="stepper-mobile-select"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                >
                  {allSteps.map((s, i) => (
                    <option key={s.id} value={i}>
                      {i + 1}/{allSteps.length} — {t(s.label)} {stepHasData(s.id) ? '✓' : ''}
                    </option>
                  ))}
                </select>
                <i className="fi fi-rr-angle-small-down stepper-mobile-select-icon"></i>
              </div>

              <button 
                className="stepper-mobile-nav-btn"
                onClick={() => setStep(prev => Math.min(allSteps.length - 1, prev + 1))}
                disabled={step === allSteps.length - 1}
                aria-label={t('Next section')}
              >
                <i className="fi fi-rr-angle-right"></i>
              </button>
            </div>

            {/* Mobile Stepper Quick Actions */}
            <div className="stepper-mobile-actions mobile-only" role="toolbar" aria-label={t('Section shortcuts')}>
              <button
                type="button"
                className="stepper-mobile-chip"
                onClick={addCustomSection}
                aria-label={t('Add custom section')}
              >
                <span>➕</span> {t('Section')}
              </button>
              <button
                type="button"
                className="stepper-mobile-chip"
                onClick={addSpacerSection}
                aria-label={t('Add spacer or page break')}
              >
                <span>📐</span> {t('Spacer')}
              </button>
              <button
                type="button"
                className="stepper-mobile-chip"
                onClick={() => setIsReorderModalOpen(true)}
                aria-label={t('Reorder sections')}
              >
                <span>⇅</span> {t('Reorder')}
              </button>
            </div>

            {/* Desktop Stepper Navigation (>= 769px) */}
            <nav className="stepper desktop-only" role="tablist" aria-label="Resume sections">
              <div className="stepper-header-meta">
                <span className="stepper-progress-badge">
                  📊 {allSteps.filter(s => stepHasData(s.id)).length}/{allSteps.length} {t('sections completed')}
                </span>
                {allSteps.some(s => isSectionHidden(s.id)) && (
                  <span className="stepper-hidden-badge" data-tooltip={t('Section(s) hidden from final CV')}>
                    <i className="fi fi-rr-eye-crossed"></i> {allSteps.filter(s => isSectionHidden(s.id)).length} {t('hidden')}
                  </span>
                )}
              </div>

              <div className="stepper-nav-list">
                {allSteps.map((s, i) => {
                  const isDraggable = s.id !== 'personal';
                  const hidden = isSectionHidden(s.id);
                  const hasData = stepHasData(s.id);
                  return (
                    <button
                      key={s.id}
                      ref={el => stepButtonRefs.current[i] = el}
                      className={`step-btn${i === step ? ' active' : ''}${hasData ? ' completed' : ''}${hidden ? ' step-hidden' : ''}${draggedStepId === s.id ? ' dragging' : ''}${dragOverStepId === s.id ? ' drag-over' : ''}`}
                      onClick={() => setStep(i)}
                      onKeyDown={(e) => handleStepperKeyDown(e, i)}
                      role="tab"
                      tabIndex={i === step ? 0 : -1}
                      aria-selected={i === step}
                      draggable={isDraggable}
                      onDragStart={isDraggable ? (e) => handleStepperDragStart(e, s.id) : undefined}
                      onDragOver={isDraggable ? (e) => handleStepperDragOver(e, s.id) : undefined}
                      onDrop={isDraggable ? (e) => handleStepperDrop(e, s.id) : undefined}
                      onDragEnd={() => { setDraggedStepId(null); setDragOverStepId(null); }}
                      data-tooltip={
                        hidden
                          ? `${t(s.label)} (${t('Hidden on CV')})`
                          : `${t('Go to section:')} ${t(s.label)}`
                      }
                      data-tooltip-pos="right"
                    >
                      <span className="step-icon">{s.icon}</span>
                      <span className="step-label">{t(s.label)}</span>
                      {hasData && <span className="step-check" aria-hidden="true">✓</span>}
                      {hidden && (
                        <span className="step-hidden-icon" title={t('Section hidden on CV')}>
                          <i className="fi fi-rr-eye-crossed"></i>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="stepper-actions">
                <button 
                  className="step-action-chip" 
                  onClick={addCustomSection}
                  data-tooltip={t('Add custom section')}
                  data-tooltip-pos="right"
                  aria-label={t("Add Custom Section")}
                >
                  <span className="step-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>
                  <span>{t('Add Section')}</span>
                </button>
                <button 
                  className="step-action-chip" 
                  onClick={addSpacerSection}
                  data-tooltip={t('Add spacer or page break')}
                  data-tooltip-pos="right"
                  aria-label={t("Add Spacer (Page Break)")}
                >
                  <span className="step-icon"><i className="fi fi-rr-expand-arrows" style={{ fontSize: '12px' }}></i></span>
                  <span>{t('Add Spacer')}</span>
                </button>
                <button 
                  className="step-action-chip" 
                  onClick={() => setIsReorderModalOpen(true)}
                  data-tooltip={t('Reorder sections')}
                  data-tooltip-pos="right"
                  aria-label={t("Reorder Sections")}
                >
                  <span className="step-icon"><i className="fi fi-rr-apps-sort" style={{ fontSize: '12px' }}></i></span>
                  <span>{t('Reorder Sections')}</span>
                </button>
              </div>
            </nav>

            {/* Step Content */}
            <div className="animate-fade-in" key={currentId}>
              {!data.sectionOrder.includes(currentId) && currentId !== 'personal' && currentId !== 'summary' && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-accent-light)', border: '1px solid var(--color-accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                    <i className="fi fi-rr-eye-crossed" style={{ color: 'var(--color-accent)' }}></i>
                    <span>{t('This section is hidden from your resume.')}</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => dispatch({ type: 'REORDER_SECTIONS', payload: [...data.sectionOrder, currentId] })}
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
                  onChange={(v) => dispatch({ type: 'UPDATE_PERSONAL', payload: v })} 
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  layout={layout}
                  onLayoutChange={setLayout}
                  onAISectionFill={() => {
                    const readiness = checkResumeReadiness(data);
                    if (readiness.isEmpty) {
                      alert(t('Please fill in at least your professional title or some work experience before using AI suggestions.'));
                      return;
                    }
                    setAiSectionFillConfig({
                      isOpen: true,
                      sectionType: 'tagline',
                      sectionLabel: t('Professional Title / Tagline'),
                      resumeContext: buildResumeContext(data),
                      targetJobDescription: data.targetJobDescription || null,
                      onApply: (suggestions) => {
                        saveSnapshot();
                        if (suggestions && suggestions.length > 0) {
                          const firstSelected = suggestions[0];
                          const titleText = typeof firstSelected === 'string' ? firstSelected : (firstSelected.title || firstSelected.name || '');
                          if (titleText) {
                            dispatch({ type: 'UPDATE_PERSONAL', payload: { ...data.personal, tagline: titleText } });
                          }
                        }
                      }
                    });
                  }}
                />
              )}
              {currentId === 'summary' && (
                <SummaryStep 
                  data={data.summary} 
                  onChange={(v) => dispatch({ type: 'UPDATE_SUMMARY', payload: v })} 
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  onAIAssist={(text) => {
                    setAiSectionFillConfig({
                      isOpen: true,
                      sectionType: 'summary',
                      resumeContext: buildResumeContext(data),
                      targetJobDescription: data.targetJobDescription || null,
                      onApply: (suggestions) => {
                        saveSnapshot();
                        if (suggestions && suggestions.length > 0) {
                          const firstSelected = suggestions[0];
                          const summaryText = typeof firstSelected === 'string' ? firstSelected : (firstSelected.description || firstSelected.name || '');
                          if (summaryText) {
                            dispatch({ type: 'UPDATE_SUMMARY', payload: summaryText });
                          }
                        }
                      }
                    });
                  }}
                  onAIBold={(text) => setAiBoldConfig({ 
                    isOpen: true, 
                    text, 
                    contextType: 'summary', 
                    onUpdate: (newText) => {
                      saveSnapshot();
                      dispatch({ type: 'UPDATE_SUMMARY', payload: newText });
                    }
                  })}
                />
              )}
              {currentId === 'experience' && (
                <ExperienceStep 
                  data={data.experience} 
                  onChange={(v) => dispatch({ type: 'UPDATE_EXPERIENCE', payload: v })} 
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  layout={layout}
                  onLayoutChange={setLayout}
                  onAIAssist={(text, index, bulletIndex) => {
                    setAiBulletConfig({
                      isOpen: true, 
                      text, 
                      index,
                      bulletIndex
                    });
                  }}
                />
              )}
              {currentId === 'education' && (
                <EducationStep 
                  data={data.education} 
                  onChange={(v) => dispatch({ type: 'UPDATE_EDUCATION', payload: v })} 
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                />
              )}
              {currentId === 'skills' && (
                <SkillsStep 
                  data={data.skills} 
                  onChange={(v) => dispatch({ type: 'UPDATE_SKILLS', payload: v })} 
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  layout={layout}
                  onLayoutChange={setLayout}
                  onAISectionFill={(subSection) => {
                    const readiness = checkResumeReadiness(data);
                    if (readiness.isEmpty) {
                      alert(t('Please fill in at least your professional title or some work experience before using AI suggestions.'));
                      return;
                    }
                    const labelMap = { skills_technical: t('Technical Skills'), skills_soft: t('Soft Skills'), skills_languages: t('Languages') };
                    setAiSectionFillConfig({
                      isOpen: true,
                      sectionType: subSection,
                      sectionLabel: labelMap[subSection] || subSection,
                      resumeContext: buildResumeContext(data),
                      targetJobDescription: data.targetJobDescription || null,
                      onApply: (suggestions, type) => {
                        saveSnapshot();
                        if (type === 'skills_technical') {
                          const current = data.skills.technical ? data.skills.technical.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const merged = [...new Set([...current, ...suggestions])];
                          dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: merged.join(', ') } });
                        } else if (type === 'skills_soft') {
                          const current = data.skills.soft ? data.skills.soft.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const merged = [...new Set([...current, ...suggestions])];
                          dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, soft: merged.join(', ') } });
                        } else if (type === 'skills_languages') {
                          const langStrings = suggestions.map(l => typeof l === 'string' ? l : `${l.name} (${l.level})`);
                          const current = data.skills.languages ? data.skills.languages.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const merged = [...new Set([...current, ...langStrings])];
                          dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, languages: merged.join(', ') } });
                        }
                      }
                    });
                  }}
                />
              )}
              {currentId === 'projects' && (
                <ProjectsStep 
                  data={data.projects} 
                  onChange={(v) => dispatch({ type: 'UPDATE_PROJECTS', payload: v })} 
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  onAIAssist={(text, index, bulletIndex) => {
                    setAiBoldConfig({
                      isOpen: true, 
                      text, 
                      contextType: 'projects',
                      onUpdate: (newText) => {
                        saveSnapshot();
                        const newProj = [...data.projects];
                        if (bulletIndex === -1) {
                          newProj[index] = { ...newProj[index], description: newText };
                        } else {
                          newProj[index] = {
                            ...newProj[index],
                            highlights: newProj[index].highlights.map((hl, i) => i === bulletIndex ? newText : hl)
                          };
                        }
                        dispatch({ type: 'UPDATE_PROJECTS', payload: newProj });
                      }
                    });
                  }}
                />
              )}
              {currentId === 'certifications' && (
                <CertificationsStep 
                  data={data.certifications} 
                  onChange={(v) => dispatch({ type: 'UPDATE_CERTIFICATIONS', payload: v })}
                  headings={data.headings}
                  onHeadingsChange={(v) => dispatch({ type: 'UPDATE_HEADINGS', payload: v })}
                  onAISectionFill={() => {
                    const readiness = checkResumeReadiness(data);
                    if (readiness.isEmpty) {
                      alert(t('Please fill in at least your professional title or some work experience before using AI suggestions.'));
                      return;
                    }
                    setAiSectionFillConfig({
                      isOpen: true,
                      sectionType: 'certifications',
                      sectionLabel: t('Certifications'),
                      resumeContext: buildResumeContext(data),
                      targetJobDescription: data.targetJobDescription || null,
                      onApply: (suggestions) => {
                        saveSnapshot();
                        const newCerts = suggestions.map(cert => ({
                          id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                          name: cert.name || '',
                          issuer: cert.issuer || '',
                          date: '',
                          credentialUrl: '',
                        }));
                        dispatch({ type: 'UPDATE_CERTIFICATIONS', payload: [...data.certifications, ...newCerts] });
                      }
                    });
                  }}
                />
              )}
              {currentId?.startsWith('custom_') && (
                <CustomStep 
                  section={data.customSections.find(s => s.id === currentId)} 
                  onChange={(updatedSec) => {
                    const mapped = (data.customSections || []).map(s => s.id === currentId ? updatedSec : s);
                    dispatch({ type: 'UPDATE_CUSTOM_SECTIONS', payload: mapped });
                  }} 
                  onDelete={() => setSectionToDelete(currentId)}
                  onAISectionFill={(sectionType, sectionLabel) => {
                    const readiness = checkResumeReadiness(data);
                    if (readiness.isEmpty) {
                      alert(t('Please fill in at least your professional title or some work experience before using AI suggestions.'));
                      return;
                    }
                    setAiSectionFillConfig({
                      isOpen: true,
                      sectionType,
                      sectionLabel: sectionLabel || t('Custom Section'),
                      resumeContext: buildResumeContext(data),
                      targetJobDescription: data.targetJobDescription || null,
                      onApply: (suggestions) => {
                        saveSnapshot();
                        const currentSection = data.customSections.find(s => s.id === currentId);
                        if (!currentSection) return;
                        const newItems = suggestions.map(item => ({
                          id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                          title: item.title || item.name || (typeof item === 'string' ? item : ''),
                          subtitle: item.subtitle || item.issuer || item.level || '',
                          date: item.date || '',
                          description: item.description || '',
                        }));
                        const updatedSection = { ...currentSection, items: [...currentSection.items, ...newItems] };
                        const mapped = (data.customSections || []).map(s => s.id === currentId ? updatedSection : s);
                        dispatch({ type: 'UPDATE_CUSTOM_SECTIONS', payload: mapped });
                      }
                    });
                  }}
                />
              )}
              {currentId?.startsWith('spacer_') && (
                <SpacerStep 
                  data={data.customSections.find(s => s.id === currentId)} 
                  onChange={(updatedSec) => {
                    const mapped = (data.customSections || []).map(s => s.id === currentId ? updatedSec : s);
                    dispatch({ type: 'UPDATE_CUSTOM_SECTIONS', payload: mapped });
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
            <aside className={`preview-panel ${isPreviewHeaderCollapsed ? 'preview-panel--collapsed' : ''}`} aria-label={t('Live Preview')}>
              <div className={`preview-sticky-header ${isPreviewHeaderCollapsed ? 'preview-sticky-header--collapsed' : ''}`}>
                <div className="preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className="control-btn"
                      onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                      title={isEditorCollapsed ? t('Expand Editor') : t('Collapse Editor')}
                      style={{ padding: '4px 6px' }}
                    >
                      <i className={`fi fi-rr-angle-double-${isEditorCollapsed ? 'right' : 'left'}`}></i>
                    </button>
                    <span className="preview-label" style={{ marginBottom: 0 }}>{t('Live Preview')}</span>

                  </div>
                  {isPreviewHeaderCollapsed ? (
                    <button 
                      className="control-btn"
                      onClick={() => setIsPreviewHeaderCollapsed(false)}
                      title={t('Expand Header')}
                      aria-label="Expand Header"
                      style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700' }}
                    >
                      <i className="fi fi-rr-angle-small-down"></i> {t('Show Controls')}
                    </button>
                  ) : (
                    <div className="preview-controls">

                      <div className="control-group" style={{ gap: '4px' }}>
                        <button 
                          className="control-btn" 
                          onClick={undo} 
                          disabled={past.length === 0}
                          data-tooltip={t('Undo last action (Ctrl+Z)')}
                          data-tooltip-pos="bottom"
                          style={{ opacity: past.length === 0 ? 0.4 : 1, cursor: past.length === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '4px 6px' }}
                          aria-label="Undo"
                        >
                          ↩
                        </button>
                        <button 
                          className="control-btn" 
                          onClick={redo} 
                          disabled={future.length === 0}
                          data-tooltip={t('Redo last action (Ctrl+Y)')}
                          data-tooltip-pos="bottom"
                          style={{ opacity: future.length === 0 ? 0.4 : 1, cursor: future.length === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '4px 6px' }}
                          aria-label="Redo"
                        >
                          ↪
                        </button>
                      </div>

                      {/* Mini ATS Score Badge */}
                      {atsScore && (
                        <button
                          className="control-btn"
                          onClick={() => setIsAtsScoreModalOpen(true)}
                          data-tooltip={`Score ATS: ${atsScore.score}/100`}
                          data-tooltip-pos="bottom"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            borderRadius: '12px',
                            color: atsScore.score >= 70 ? '#059669' : atsScore.score >= 40 ? '#d97706' : '#dc2626',
                            background: atsScore.score >= 70 ? 'rgba(5,150,105,0.1)' : atsScore.score >= 40 ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
                            border: `1px solid ${atsScore.score >= 70 ? 'rgba(5,150,105,0.25)' : atsScore.score >= 40 ? 'rgba(217,119,6,0.25)' : 'rgba(220,38,38,0.25)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '10px' }}>🎯</span>
                          {atsScore.score}
                        </button>
                      )}

                      <div className="control-divider" aria-hidden="true" />

                       {/* Template picker — compact dropdown */}
                        {(() => {
                         const TEMPLATES = [
                           { id: 'standard',  name: 'Classic' },
                           { id: 'modern',    name: 'Modern' },
                           { id: 'njm',       name: 'NJM',        badgeType: 'flagship', badgeText: t("Creator's Favorite") },
                           { id: 'minimalist',name: 'Minimalist', badgeType: 'ats',      badgeText: t('ATS-Friendly') },
                         ];
                         const activeTpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
                         const getBadgeColors = (badgeType, isActive) => {
                           if (isActive) return { bg: 'rgba(255,255,255,0.18)', color: '#fff', border: 'rgba(255,255,255,0.35)' };
                           if (badgeType === 'flagship') return { bg: 'rgba(var(--color-accent-rgb,99,102,241),0.1)', color: 'var(--color-accent)', border: 'rgba(var(--color-accent-rgb,99,102,241),0.25)' };
                           if (badgeType === 'design')   return { bg: 'rgba(245,158,11,0.1)', color: 'rgb(245,158,11)', border: 'rgba(245,158,11,0.25)' };
                           return { bg: 'rgba(16,185,129,0.1)', color: 'rgb(16,185,129)', border: 'rgba(16,185,129,0.25)' };
                         };
                         const activeBadge = getBadgeColors(activeTpl.badgeType, false);
                         return (
                           <div className="tpl-dropdown-wrap" ref={templateDropdownRef}>
                             <button
                               className="tpl-dropdown-trigger"
                               onClick={() => setIsTemplateDropdownOpen(o => !o)}
                               aria-haspopup="listbox"
                               aria-expanded={isTemplateDropdownOpen}
                               data-tooltip={t('Choose resume design template')}
                               data-tooltip-pos="bottom"
                             >
                               <span className="tpl-trigger-name">{activeTpl.name}</span>
                               {activeTpl.badgeText && (
                                 <span className="tpl-trigger-badge" style={{ background: activeBadge.bg, color: activeBadge.color, border: `1px solid ${activeBadge.border}` }}>
                                   {activeTpl.badgeText}
                                 </span>
                               )}
                               <i className={`fi ${isTemplateDropdownOpen ? 'fi-rr-angle-small-up' : 'fi-rr-angle-small-down'} tpl-trigger-chevron`}></i>
                             </button>
                             {isTemplateDropdownOpen && (
                               <ul className="tpl-dropdown-menu" role="listbox">
                                 {TEMPLATES.map(tpl => {
                                   const isActive = template === tpl.id;
                                   const badge = getBadgeColors(tpl.badgeType, isActive);
                                   return (
                                     <li key={tpl.id} role="option" aria-selected={isActive}>
                                       <button
                                         className={`tpl-option${isActive ? ' tpl-option--active' : ''}`}
                                         onClick={() => { setTemplate(tpl.id); setIsTemplateDropdownOpen(false); }}
                                         data-tooltip={`${t('Activate')} ${tpl.name} ${t('template')}`}
                                         data-tooltip-pos="left"
                                       >
                                         <span className="tpl-option-name">{tpl.name}</span>
                                         {tpl.badgeText && (
                                           <span className="tpl-option-badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                             {tpl.badgeText}
                                           </span>
                                         )}
                                       </button>
                                     </li>
                                   );
                                 })}
                               </ul>
                             )}
                           </div>
                         );
                       })()}

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
                          data-tooltip={t('Toggle normal spacing vs 1-page compact layout')}
                          data-tooltip-pos="bottom"
                        >
                          📐 {layout.isCompact ? t('Normal') : t('Compact')}
                        </button>
                        <button 
                          className={`control-btn ${isLayoutOpen ? 'active' : ''}`}
                          onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                          aria-expanded={isLayoutOpen}
                          data-tooltip={t('Toggle layout settings panel (font, margins, spacing)')}
                          data-tooltip-pos="bottom"
                        >
                          <i className="fi fi-rr-settings"></i>
                        </button>

                      </div>

                      {/* AI Tools Dropdown */}
                      <div className="tpl-dropdown-wrap" ref={aiToolsDropdownRef}>
                        <button
                          className="tpl-dropdown-trigger"
                          onClick={() => setIsAIToolsDropdownOpen(o => !o)}
                          aria-haspopup="menu"
                          aria-expanded={isAIToolsDropdownOpen}
                          data-tooltip={t('Access AI suite (ATS Score, Tailor, Translate, Smart Bolding)')}
                          data-tooltip-pos="bottom"
                          style={{
                            background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb, 99, 102, 241), 0.1), rgba(var(--color-primary-rgb, 14, 165, 233), 0.1))',
                            border: '1px solid rgba(var(--color-accent-rgb, 99, 102, 241), 0.2)',
                            color: 'var(--color-accent)'
                          }}
                        >
                          <span className="tpl-trigger-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ✨ {t('AI Tools')}
                          </span>
                          <i className={`fi ${isAIToolsDropdownOpen ? 'fi-rr-angle-small-up' : 'fi-rr-angle-small-down'} tpl-trigger-chevron`}></i>
                        </button>
                        
                        {isAIToolsDropdownOpen && (
                          <div className="tpl-dropdown-menu" role="menu" style={{ minWidth: 'max-content', width: 'max-content', whiteSpace: 'nowrap', right: 0, left: 'auto' }}>
                            <button 
                              className="dropdown-item" 
                              onClick={() => { setIsAtsScoreModalOpen(true); setIsAIToolsDropdownOpen(false); }} 
                              disabled={!hasContent} 
                              data-tooltip={t('Evaluate ATS compatibility with a job posting')}
                              data-tooltip-pos="left"
                              style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}
                            >
                              🎯 {t('ATS Score & Matcher')}
                            </button>
                            <button 
                              className="dropdown-item" 
                              onClick={() => { setIsTailorOpen(true); setIsAIToolsDropdownOpen(false); }} 
                              disabled={!hasContent} 
                              data-tooltip={t('Tailor resume for a specific job offer')}
                              data-tooltip-pos="left"
                              style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}
                            >
                              ✨ {t('Tailor to Job')}
                            </button>
                            <button 
                              className="dropdown-item" 
                              onClick={() => { setIsAIOpen(true); setIsAIToolsDropdownOpen(false); }} 
                              disabled={!hasContent} 
                              data-tooltip={t('Instantly translate resume to another language')}
                              data-tooltip-pos="left"
                              style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}
                            >
                              <i className="fi fi-rr-magic-wand"></i> {t('AI Translate')}
                            </button>
                            <button 
                              className="dropdown-item" 
                              onClick={() => { setIsBoldifyOpen(true); setIsAIToolsDropdownOpen(false); }} 
                              disabled={!hasContent} 
                              data-tooltip={t('Smartly highlight key keywords in bold')}
                              data-tooltip-pos="left"
                              style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}
                            >
                              <b>B</b> {t('AI Smart Bolding')}
                            </button>
                            
                            {aiSnapshot && (
                              <>
                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }}></div>
                                <button
                                  className="dropdown-item"
                                  onClick={() => { restoreSnapshot(); setIsAIToolsDropdownOpen(false); }}
                                  data-tooltip={t('Undo AI edits and restore previous resume version')}
                                  data-tooltip-pos="left"
                                  style={{ color: 'var(--color-danger, #ef4444)' }}
                                >
                                  ↩ {t('Undo AI')}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="control-divider" aria-hidden="true" />
                      
                      <button 
                        className="control-btn"
                        onClick={() => setIsPreviewHeaderCollapsed(true)}
                        data-tooltip={t('Collapse controls bar')}
                        data-tooltip-pos="bottom"
                        aria-label="Collapse Header"
                        style={{ padding: '4px 6px' }}
                      >
                        <i className="fi fi-rr-angle-small-up"></i>
                      </button>
                    </div>
                  )}
                </div>

                {!isPreviewHeaderCollapsed && isLayoutOpen && <LayoutControls layout={layout} onChange={setLayout} />}
                
                {/* S1: Direct export — PDF and Word DOCX */}
                {!isPreviewHeaderCollapsed && (
                  <div className="preview-export-bar" style={{ position: 'relative' }}>
                    <div className="export-split-button" style={{ display: 'flex', width: '100%', gap: '1px' }}>
                      <button 
                        type="button"
                        className="btn-export btn-export-primary" 
                        onClick={() => setTimeout(() => window.print(), 100)}
                        data-tooltip={t('Generate & save resume as HD PDF')}
                        data-tooltip-pos="top"
                        style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      >
                        <i className="fi fi-rr-print"></i> {t('Export PDF')}
                      </button>
                      <button
                        type="button"
                        className="btn-export btn-export-primary"
                        onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                        data-tooltip={t('More export options (Word)')}
                        data-tooltip-pos="top"
                        style={{ 
                          flex: '0 0 auto',
                          padding: '0 12px', 
                          borderTopLeftRadius: 0, 
                          borderBottomLeftRadius: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-expanded={isExportDropdownOpen}
                        aria-label="Export options"
                      >
                        <i className={`fi ${isExportDropdownOpen ? 'fi-rr-angle-small-up' : 'fi-rr-angle-small-down'}`}></i>
                      </button>
                    </div>

                    {isExportDropdownOpen && (
                      <div className="export-dropdown-menu">
                        <button 
                          type="button"
                          className="dropdown-item" 
                          onClick={() => { try { exportDocx(data); } catch (err) { alert('Export failed: ' + err.message); } setIsExportDropdownOpen(false); }}
                          data-tooltip={t('Download as Word (.docx)')}
                          data-tooltip-pos="left"
                        >
                          <i className="fi fi-rr-file-word"></i> {t('Download as Word (.docx)')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Removed ATS Score from here, now in modal */}

              <ResumePreview 
                data={data} 
                layout={layout} 
                language={language} 
                template={template}
                onSectionReorder={handleSectionReorder}
                onSectionRemove={setSectionToDelete}
                onSectionClick={handleSectionClick}
                onPagesCountChange={setEditorPagesCount}
                onItemReorder={handleItemReorder}
                onItemDelete={handleItemDelete}
                onItemUpdate={handleItemUpdate}
                onAddSpacer={handleItemAddSpacer}
                onAddSectionSpacer={handleAddSectionSpacer}
                onUpdateSectionSpacer={handleUpdateSectionSpacer}
                onDeleteSectionSpacer={handleDeleteSectionSpacer}
                onSkillHighlightToggle={(updated) => dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, highlightedSkills: updated } })}
                compact 
              />
            </aside>
        </main>

        {/* Mobile Bottom Navigation — shown on ≤1024px */}
        <nav className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            <button 
              className={`mobile-nav-btn ${!showMobilePreview ? 'active' : ''}`}
              onClick={() => setShowMobilePreview(false)}
            >
              <i className="fi fi-rr-edit"></i>
              {t('Edit')}
            </button>
            <button 
              className={`mobile-nav-btn ${showMobilePreview ? 'active' : ''}`}
              onClick={() => setShowMobilePreview(true)}
            >
              <i className="fi fi-rr-eye"></i>
              {t('Preview')}
            </button>
          </div>
        </nav>

        {/* Mobile Preview Overlay */}
        {showMobilePreview && (
          <div className="mobile-preview-overlay" style={{ bottom: 'env(safe-area-inset-bottom, 60px)' }}>
            <div className="mobile-preview-header">
              <span className="preview-label">{t('Live Preview')}</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* Template picker */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: '4px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'standard', name: 'Classic' },
                    { id: 'modern', name: 'Modern' },
                    { id: 'njm', name: 'NJM', isFlagship: true },
                    { id: 'minimalist', name: 'Minimalist', isAts: true }
                  ].map(tpl => {
                    const isActive = template === tpl.id;
                    let dotColor = 'var(--color-text-secondary)'; // default neutral
                    if (tpl.isAts) dotColor = 'rgb(16, 185, 129)';
                    if (tpl.isFlagship) dotColor = 'var(--color-accent)';
                    if (tpl.isDesign) dotColor = 'rgb(245, 158, 11)';

                    return (
                      <button
                        key={tpl.id}
                        onClick={() => setTemplate(tpl.id)}
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '11px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          borderRadius: '6px',
                          border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                          background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: isActive ? 'var(--color-accent-contrast, #fff)' : 'var(--color-text-secondary)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {dotColor !== 'var(--color-text-secondary)' && (
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: isActive ? '#fff' : dotColor,
                            display: 'inline-block' 
                          }} />
                        )}
                        {tpl.name}
                      </button>
                    );
                  })}
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
                {/* S1 — Mobile: direct export, no modal */}
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => setTimeout(() => window.print(), 100)}
                  title={t('Print / Save as PDF')}
                >
                  <i className="fi fi-rr-print" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => { try { exportMarkdown(data); } catch (err) { alert('Export failed: ' + err.message); } }}
                  title={t('Markdown')}
                >
                  <i className="fi fi-rr-file-code" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <button 
                  type="button"
                  className="btn-export" 
                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }} 
                  onClick={() => { try { exportJson(data); } catch (err) { alert('Export failed: ' + err.message); } }}
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
                onSectionReorder={(newOrder) => dispatch({ type: 'REORDER_SECTIONS', payload: newOrder })}
                onSectionRemove={setSectionToDelete}
                onSectionClick={handleSectionClick}
                onItemReorder={handleItemReorder}
                onItemDelete={handleItemDelete}
                onItemUpdate={handleItemUpdate}
                onAddSpacer={handleItemAddSpacer}
                onAddSectionSpacer={handleAddSectionSpacer}
                onUpdateSectionSpacer={handleUpdateSectionSpacer}
                onDeleteSectionSpacer={handleDeleteSectionSpacer}
                onSkillHighlightToggle={(updated) => dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, highlightedSkills: updated } })}
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
              onTranslationSuccess={(newData) => {
                setAiSnapshot(structuredClone(data));
                dispatch({ type: 'SET_DATA', payload: newData });
              }}
            />
          )}
          {isTailorOpen && (
            <AITailorModal 
              isOpen={isTailorOpen} 
              onClose={() => setIsTailorOpen(false)} 
              data={data}
              dispatch={dispatch} 
              language={language}
              onTailorSuccess={(newData) => {
                setAiSnapshot(structuredClone(data));
                dispatch({ type: 'SET_DATA', payload: newData });
              }}
            />
          )}
          {isBoldifyOpen && (
            <AIBoldifyModal
              isOpen={isBoldifyOpen}
              onClose={() => setIsBoldifyOpen(false)}
              data={data}
              onBoldifySuccess={(newData) => {
                setAiSnapshot(structuredClone(data));
                dispatch({ type: 'SET_DATA', payload: newData });
              }}
            />
          )}
          {aiBoldConfig.isOpen && (
            <AIBoldModal
              isOpen={aiBoldConfig.isOpen}
              onClose={() => setAiBoldConfig({ ...aiBoldConfig, isOpen: false })}
              textData={aiBoldConfig.text}
              contextType={aiBoldConfig.contextType}
              onUpdate={aiBoldConfig.onUpdate}
            />
          )}
          {aiBulletConfig?.isOpen && (
            <AIBulletPointsModal
              isOpen={true}
              onClose={(applied) => {
                if (applied && activeAITipCallback) {
                  activeAITipCallback();
                  setActiveAITipCallback(null);
                }
                setAiBulletConfig(null);
              }}
              experienceText={aiBulletConfig.text}
              onSelectBullet={(newText) => {
                saveSnapshot();
                const newExp = [...data.experience];
                newExp[aiBulletConfig.index] = {
                  ...newExp[aiBulletConfig.index],
                  bullets: newExp[aiBulletConfig.index].bullets.map((b, i) => 
                    i === aiBulletConfig.bulletIndex ? newText : b
                  )
                };
                dispatch({ type: 'UPDATE_EXPERIENCE', payload: newExp });
              }}
            />
          )}
          {showOnboarding && (
            <OnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
              onSelectOption={handleOnboardingSelect}
              language={language}
            />
          )}
          {isCvManagerOpen && (
            <CVManagerModal
              isOpen={isCvManagerOpen}
              onClose={() => setIsCvManagerOpen(false)}
              cvList={cvList}
              activeCvId={activeCvId}
              onLoadCv={handleLoadCv}
              onCreateCv={handleCreateCv}
              onDuplicateCv={handleDuplicateCv}
              onRenameCv={handleRenameCv}
              onDeleteCv={handleDeleteCv}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onLoadDemo={loadDemoData}
              language={language}
            />
          )}
          {isReorderModalOpen && (
            <ReorderSectionsModal
              isOpen={isReorderModalOpen}
              onClose={() => setIsReorderModalOpen(false)}
              sectionOrder={data.sectionOrder || DEFAULT_SECTION_ORDER}
              customSections={data.customSections}
              onReorder={handleSectionReorder}
            />
          )}
          {isCoverLetterModalOpen && (
            <CoverLetterModal
              isOpen={isCoverLetterModalOpen}
              onClose={() => setIsCoverLetterModalOpen(false)}
              data={data}
              dispatch={dispatch}
              onLanguageChange={handleLanguageChange}
            />
          )}
          {isAtsScoreModalOpen && (
            <AtsScoreModal
              isOpen={isAtsScoreModalOpen}
              onClose={() => setIsAtsScoreModalOpen(false)}
              data={data}
              dispatch={dispatch}
              onTriggerAction={handleAITriggerAction}
            />
          )}
          {isKeywordsModalOpen && (
            <ATSKeywordsModal
              isOpen={isKeywordsModalOpen}
              onClose={() => setIsKeywordsModalOpen(false)}
              data={data}
              dispatch={dispatch}
            />
          )}
          {isCareerOpsOpen && (
            <CareerOpsHub
              isOpen={isCareerOpsOpen}
              onClose={() => setIsCareerOpsOpen(false)}
              resumeData={data}
              onApplyTailoredResume={(tailored) => {
                dispatch({ type: 'SET_ENTIRE_DATA', payload: tailored });
              }}
              onOpenCoverLetter={(letter) => {
                setIsCoverLetterModalOpen(true);
              }}
              onOpenImport={() => {
                setIsCareerOpsOpen(false);
                setShowImportModal(true);
              }}
              onLoadDemo={() => {
                loadDemoData(1);
              }}
              language={language}
            />
          )}
          {aiSectionFillConfig?.isOpen && (
            <AISectionFillModal
              isOpen={true}
              onClose={() => setAiSectionFillConfig(null)}
              sectionType={aiSectionFillConfig.sectionType}
              sectionLabel={aiSectionFillConfig.sectionLabel}
              resumeContext={aiSectionFillConfig.resumeContext}
              targetJobDescription={aiSectionFillConfig.targetJobDescription}
              onUpdateTargetJob={(val) => dispatch({ type: 'UPDATE_TARGET_JOB', payload: val })}
              onApply={(suggestions, type) => {
                aiSectionFillConfig.onApply(suggestions, type);
                setAiSectionFillConfig(null);
              }}
            />
          )}
        </Suspense>

        <ImportModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
          onImportSuccess={(parsedData, originalData, originalInput) => {
            handleImport(parsedData, originalData, originalInput);
            setShowImportModal(false);
          }}
          language={language}
        />

        {/* Auto-save toast */}
        {saved && (
          <div className="save-toast" key={Date.now()}>
            <span className="save-dot" />
            ✓ {t('Saved')}
          </div>
        )}



        <Modal
          isOpen={!!sectionToDelete}
          onClose={() => setSectionToDelete(null)}
          title={
            <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#ef4444', display: 'flex' }}><i className="fi fi-rr-trash"></i></span> 
              {t('Remove this section?')}
            </span>
          }
          actions={
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setSectionToDelete(null)}>{t('Cancel')}</button>
              <button 
                className="btn-primary" 
                onClick={() => removeSection(sectionToDelete)} 
                style={{ padding: '10px 24px', fontSize: '14px', background: '#ef4444', borderColor: '#ef4444' }}
              >
                {t('Confirm')}
              </button>
            </div>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px', fontSize: '14px', textAlign: 'center' }}>
            {t('This action will remove the section from your resume. You can add it back later.')}
          </p>
        </Modal>

        {/* S1: Export confirmation modal removed — exports are now direct */}

        <Modal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          title={
            <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#ef4444', display: 'flex' }}><i className="fi fi-rr-trash"></i></span> 
              {t('Clear all data?')}
            </span>
          }
          actions={
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowClearConfirm(false)}>{t('Cancel')}</button>
              <button 
                className="btn-primary" 
                onClick={clearData} 
                style={{ padding: '10px 24px', fontSize: '14px', background: '#ef4444', borderColor: '#ef4444' }}
              >
                {t('Confirm')}
              </button>
            </div>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px', fontSize: '14px', textAlign: 'center' }}>
            {t('All your resume data will be permanently lost.')}
          </p>
        </Modal>

        <DailyTipModal
          isOpen={isDailyTipOpen}
          onClose={() => setIsDailyTipOpen(false)}
          onAppAction={(actionKey) => {
            if (actionKey === 'GO_TO_PERSONAL') {
              const idx = allSteps.findIndex(s => s.id === 'personal');
              if (idx !== -1) setStep(idx);
            } else if (actionKey === 'GO_TO_EXPERIENCE') {
              const idx = allSteps.findIndex(s => s.id === 'experience');
              if (idx !== -1) setStep(idx);
            } else if (actionKey === 'GO_TO_SKILLS') {
              const idx = allSteps.findIndex(s => s.id === 'skills');
              if (idx !== -1) setStep(idx);
            } else if (actionKey === 'SET_TEMPLATE_NJM') {
              setTemplate('njm');
            } else if (actionKey === 'OPEN_BOLDIFY') {
              setIsBoldifyOpen(true);
            } else if (actionKey === 'OPEN_ATS_SCORE') {
              setIsAtsScoreModalOpen(true);
            } else if (actionKey === 'OPEN_COVER_LETTER') {
              setIsCoverLetterModalOpen(true);
            } else if (actionKey === 'TOGGLE_COMPACT') {
              setLayout(prev => ({
                ...prev,
                isCompact: !prev.isCompact,
                fontSize: prev.isCompact ? 10.5 : 9.5,
                paddingX: prev.isCompact ? 0.75 : 0.5,
                paddingY: prev.isCompact ? 0.75 : 0.5,
                lineHeight: prev.isCompact ? 1.45 : 1.25,
                sectionSpacing: prev.isCompact ? 10 : 4,
                itemSpacing: prev.isCompact ? 8 : 4
              }));
            }
          }}
        />

        {/* Print-only resume */}
        <div id="resume-print" style={{ display: 'none' }}>
          <ResumePreview data={data} layout={layout} language={language} template={template} printMode />
        </div>

      </div>
    </TranslationContext.Provider>
  );
}
