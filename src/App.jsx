import { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef } from 'react';
import { STEPS, DEFAULT_DATA, createEmptyExperience, createEmptyEducation, createEmptyProject, createEmptyCertification, createEmptyCustomSection } from './utils/constants';
import { DEMO_DATA_1_PAGE, DEMO_DATA_2_PAGES, DEMO_DATA_1_PAGE_FR, DEMO_DATA_2_PAGES_FR, DEMO_DATA_1_PAGE_ES, DEMO_DATA_2_PAGES_ES } from './utils/demoData';
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
import { exportMarkdown, exportJson, importJson, exportDocx } from './utils/exporters';
import { sanitizeResumeData } from './utils/sanitize';
import { TranslationContext } from './utils/TranslationContext';
import { getTranslation } from './utils/translations';
import LayoutControls from './components/LayoutControls';
import Modal from './components/ui/Modal';
const AIPromptModal = lazy(() => import('./components/AIPromptModal'));
const AIBoldModal = lazy(() => import('./components/AIBoldModal'));
const AITailorModal = lazy(() => import('./components/ui/AITailorModal'));
const AIBoldifyModal = lazy(() => import('./components/ui/AIBoldifyModal'));
const OnboardingModal = lazy(() => import('./components/ui/OnboardingModal'));
const CVManagerModal = lazy(() => import('./components/ui/CVManagerModal'));
import ImportModal from './components/ui/ImportModal';

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
};

const DEFAULT_SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom_langues', 'custom_atouts', 'custom_loisirs'];

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
  const [data, setData] = useState(loadData);
  const [theme, setTheme] = useState(loadTheme);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(detectLanguage);
  const [layout, setLayout] = useState(loadLayout);
  const [template, setTemplate] = useState(loadTemplate);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTailorOpen, setIsTailorOpen] = useState(false);
  const [isBoldifyOpen, setIsBoldifyOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const templateDropdownRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('resume-builder-onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Dynamic theme accent color sync
  useEffect(() => {
    const accent = layout.accentColor || '#1B6B3A';
    document.documentElement.style.setProperty('--color-accent', accent);
    
    let r = 27, g = 107, b = 58;
    if (accent.startsWith('#')) {
      const cleanHex = accent.replace('#', '');
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.slice(0, 2), 16);
        g = parseInt(cleanHex.slice(2, 4), 16);
        b = parseInt(cleanHex.slice(4, 6), 16);
      }
    }
    
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      document.documentElement.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`);
      document.documentElement.style.setProperty('--color-accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
      document.documentElement.style.setProperty('--color-accent-hover', `rgba(${r}, ${g}, ${b}, 0.85)`);
    } else {
      document.documentElement.style.setProperty('--color-accent-light', 'rgba(27, 107, 58, 0.1)');
      document.documentElement.style.setProperty('--color-accent-hover', 'rgba(27, 107, 58, 0.85)');
    }
  }, [layout.accentColor]);

  // Multi-CV states
  const [cvList, setCvList] = useState(() => {
    try {
      const saved = localStorage.getItem('resume-builder-cv-list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initialCv = {
      id: 'default',
      name: detectLanguage() === 'fr' ? 'Mon CV Principal' : 'My Primary Resume',
      lastModified: Date.now(),
      data: loadData()
    };
    localStorage.setItem('resume-builder-cv-list', JSON.stringify([initialCv]));
    return [initialCv];
  });

  const [activeCvId, setActiveCvId] = useState(() => {
    try {
      return localStorage.getItem('resume-builder-active-cv-id') || 'default';
    } catch {
      return 'default';
    }
  });

  const [isCvManagerOpen, setIsCvManagerOpen] = useState(false);

  // Sync current data edits to the active CV in cvList and persist
  useEffect(() => {
    setCvList(prev => {
      const updated = prev.map(cv => {
        if (cv.id === activeCvId) {
          return {
            ...cv,
            lastModified: Date.now(),
            data: data
          };
        }
        return cv;
      });
      localStorage.setItem('resume-builder-cv-list', JSON.stringify(updated));
      return updated;
    });
  }, [data, activeCvId]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileLayoutOpen, setIsMobileLayoutOpen] = useState(false);

  // Close template dropdown on outside click
  useEffect(() => {
    if (!isTemplateDropdownOpen) return;
    function handleOutside(e) {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target)) {
        setIsTemplateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isTemplateDropdownOpen]);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [aiBoldConfig, setAiBoldConfig] = useState({ isOpen: false, text: '', contextType: '', onUpdate: null });
  // A2 — AI Snapshot: stores a copy of data before any AI mutation for one-click undo
  const [aiSnapshot, setAiSnapshot] = useState(null);
  const saveSnapshot = useCallback(() => setAiSnapshot(structuredClone(data)), [data]);
  const restoreSnapshot = useCallback(() => { if (aiSnapshot) { setData(aiSnapshot); setAiSnapshot(null); } }, [aiSnapshot]);

  // A1 — Undo/Redo state stack
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const lastPushedStateRef = useRef(JSON.stringify(data));
  const debounceTimerRef = useRef(null);

  const pushToHistory = useCallback((newState) => {
    const serialized = JSON.stringify(newState);
    if (serialized === lastPushedStateRef.current) return;

    setPast(prev => {
      const nextPast = [...prev, JSON.parse(lastPushedStateRef.current)];
      if (nextPast.length > 50) nextPast.shift();
      return nextPast;
    });
    setFuture([]); // Clear future on new edits
    lastPushedStateRef.current = serialized;
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture(prev => [data, ...prev]);
    
    lastPushedStateRef.current = JSON.stringify(previous);
    setData(previous);
  }, [past, data]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);
    setPast(prev => [...prev, data]);

    lastPushedStateRef.current = JSON.stringify(next);
    setData(next);
  }, [future, data]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      pushToHistory(data);
    }, 1000); // Debounce typing history to 1s

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [data, pushToHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
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
      }
      
      return {
        id: s.id,
        label: s.label || 'Custom',
        icon
      };
    });
    return [...STEPS, ...custom];
  }, [data.customSections]);

  const currentId = allSteps[step]?.id;

  const handleSectionClick = useCallback((sectionId) => {
    // If it's a custom section, we want to match its id.
    const idx = allSteps.findIndex(s => s.id === sectionId);
    if (idx !== -1) {
      setStep(idx);
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

      setData(prev => {
        const customSections = [...(prev.customSections || [])];
        if (!customSections.some(s => s.id === sectionId)) {
          customSections.push(newSec);
        }
        const sectionOrder = [...(prev.sectionOrder || [])];
        if (!sectionOrder.includes(sectionId)) {
          sectionOrder.push(sectionId);
        }
        return {
          ...prev,
          customSections,
          sectionOrder
        };
      });

      setStep(allSteps.length);
      setShowMobilePreview(false);
    }
  }, [allSteps, language]);

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
      demoData = language === 'fr' ? DEMO_DATA_1_PAGE_FR : language === 'es' ? DEMO_DATA_1_PAGE_ES : DEMO_DATA_1_PAGE;
    } else {
      demoData = language === 'fr' ? DEMO_DATA_2_PAGES_FR : language === 'es' ? DEMO_DATA_2_PAGES_ES : DEMO_DATA_2_PAGES;
    }
    const cloned = structuredClone(demoData);
    if (!cloned.sectionOrder) cloned.sectionOrder = [...DEFAULT_SECTION_ORDER];
    setData(cloned);
    setStep(0);
    setMobileMenuOpen(false);
  }, [language]);

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

  const handleLoadCv = useCallback((id) => {
    const target = cvList.find(c => c.id === id);
    if (target) {
      setActiveCvId(id);
      setData(target.data);
      localStorage.setItem('resume-builder-active-cv-id', id);
      setStep(0);
      setIsCvManagerOpen(false);
    }
  }, [cvList]);

  const handleCreateCv = useCallback(() => {
    const newId = 'cv_' + Date.now();
    const newCv = {
      id: newId,
      name: `${t('New Resume')} (${cvList.length + 1})`,
      lastModified: Date.now(),
      data: { ...structuredClone(DEFAULT_DATA), sectionOrder: [...DEFAULT_SECTION_ORDER] }
    };
    const nextList = [...cvList, newCv];
    setCvList(nextList);
    localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));

    setActiveCvId(newId);
    setData(newCv.data);
    localStorage.setItem('resume-builder-active-cv-id', newId);
    setStep(0);
    setIsCvManagerOpen(false);
  }, [cvList, t]);

  const handleDuplicateCv = useCallback((id) => {
    const source = cvList.find(c => c.id === id);
    if (source) {
      const newId = 'cv_' + Date.now();
      const newCv = {
        id: newId,
        name: `${source.name} (${t('copy')})`,
        lastModified: Date.now(),
        data: structuredClone(source.data)
      };
      const nextList = [...cvList, newCv];
      setCvList(nextList);
      localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));
    }
  }, [cvList, t]);

  const handleRenameCv = useCallback((id, name) => {
    setCvList(prev => {
      const next = prev.map(c => c.id === id ? { ...c, name, lastModified: Date.now() } : c);
      localStorage.setItem('resume-builder-cv-list', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleDeleteCv = useCallback((id) => {
    if (cvList.length <= 1) return;
    const nextList = cvList.filter(c => c.id !== id);
    setCvList(nextList);
    localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));

    if (activeCvId === id) {
      const fallback = nextList[0];
      setActiveCvId(fallback.id);
      setData(fallback.data);
      localStorage.setItem('resume-builder-active-cv-id', fallback.id);
      setStep(0);
    }
  }, [cvList, activeCvId]);

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

        const customSections = (nextData.customSections || []).map(s => {
          if (s.id === 'custom_langues') return { ...s, label: 'Langues' };
          if (s.id === 'custom_atouts') return { ...s, label: 'Atouts' };
          if (s.id === 'custom_loisirs') return { ...s, label: 'Loisirs' };
          return s;
        });

        return { 
          ...nextData,
          customSections,
          sectionOrder: prev.sectionOrder || DEFAULT_SECTION_ORDER,
          headings: {
            ...nextData.headings,
            summary: (nextData.headings.summary === 'Summary' || nextData.headings.summary === 'Resumen Profesional') ? 'Profil' : nextData.headings.summary,
            experience: (nextData.headings.experience === 'Work Experience' || nextData.headings.experience === 'Experiencia Profesional') ? 'Expériences Professionnelles' : nextData.headings.experience,
            education: (nextData.headings.education === 'Education' || nextData.headings.education === 'Educación') ? 'Formation' : nextData.headings.education,
            skills: (nextData.headings.skills === 'Skills' || nextData.headings.skills === 'Habilidades') ? 'Compétences' : nextData.headings.skills,
            projects: (nextData.headings.projects === 'Projects' || nextData.headings.projects === 'Proyectos') ? 'Projets' : nextData.headings.projects,
            certifications: (nextData.headings.certifications === 'Certifications' || nextData.headings.certifications === 'Certificaciones') ? 'Certifications' : nextData.headings.certifications,
            technical: (nextData.headings.technical === 'Technical:' || nextData.headings.technical === 'Técnicas:') ? 'Technique:' : nextData.headings.technical,
            interpersonal: (nextData.headings.interpersonal === 'Interpersonal:' || nextData.headings.interpersonal === 'Interpersonales:') ? 'Interpersonnelles:' : nextData.headings.interpersonal,
            languages: (nextData.headings.languages === 'Languages:' || nextData.headings.languages === 'Idiomas:') ? 'Langues:' : nextData.headings.languages,
            present: (nextData.headings.present === 'Present' || nextData.headings.present === 'Presente') ? 'Présent' : nextData.headings.present
          }
        };
      } else if (lang === 'es') {
        if (isDemo2) nextData = DEMO_DATA_2_PAGES_ES;
        else if (isDemo1) nextData = DEMO_DATA_1_PAGE_ES;

        const customSections = (nextData.customSections || []).map(s => {
          if (s.id === 'custom_langues') return { ...s, label: 'Idiomas' };
          if (s.id === 'custom_atouts') return { ...s, label: 'Fortalezas' };
          if (s.id === 'custom_loisirs') return { ...s, label: 'Aficiones' };
          return s;
        });

        return { 
          ...nextData,
          customSections,
          sectionOrder: prev.sectionOrder || DEFAULT_SECTION_ORDER,
          headings: {
            ...nextData.headings,
            summary: (nextData.headings.summary === 'Summary' || nextData.headings.summary === 'Profil') ? 'Resumen Profesional' : nextData.headings.summary,
            experience: (nextData.headings.experience === 'Work Experience' || nextData.headings.experience === 'Expériences Professionnelles') ? 'Experiencia Profesional' : nextData.headings.experience,
            education: (nextData.headings.education === 'Education' || nextData.headings.education === 'Formation') ? 'Educación' : nextData.headings.education,
            skills: (nextData.headings.skills === 'Skills' || nextData.headings.skills === 'Compétences') ? 'Habilidades' : nextData.headings.skills,
            projects: (nextData.headings.projects === 'Projects' || nextData.headings.projects === 'Projets') ? 'Proyectos' : nextData.headings.projects,
            certifications: (nextData.headings.certifications === 'Certifications' || nextData.headings.certifications === 'Certifications') ? 'Certificaciones' : nextData.headings.certifications,
            technical: (nextData.headings.technical === 'Technical:' || nextData.headings.technical === 'Technique:') ? 'Técnicas:' : nextData.headings.technical,
            interpersonal: (nextData.headings.interpersonal === 'Interpersonal:' || nextData.headings.interpersonal === 'Interpersonnelles:') ? 'Interpersonales:' : nextData.headings.interpersonal,
            languages: (nextData.headings.languages === 'Languages:' || nextData.headings.languages === 'Langues:') ? 'Idiomas:' : nextData.headings.languages,
            present: (nextData.headings.present === 'Present' || nextData.headings.present === 'Présent') ? 'Presente' : nextData.headings.present
          }
        };
      } else {
        if (isDemo2) nextData = DEMO_DATA_2_PAGES;
        else if (isDemo1) nextData = DEMO_DATA_1_PAGE;

        const customSections = (nextData.customSections || []).map(s => {
          if (s.id === 'custom_langues') return { ...s, label: 'Languages' };
          if (s.id === 'custom_atouts') return { ...s, label: 'Strengths' };
          if (s.id === 'custom_loisirs') return { ...s, label: 'Hobbies' };
          return s;
        });

        return { 
          ...nextData,
          customSections,
          sectionOrder: prev.sectionOrder || DEFAULT_SECTION_ORDER,
          headings: {
            ...nextData.headings,
            summary: (nextData.headings.summary === 'Profil' || nextData.headings.summary === 'Resumen Profesional') ? 'Summary' : nextData.headings.summary,
            experience: (nextData.headings.experience === 'Expériences Professionnelles' || nextData.headings.experience === 'Experiencia Profesional') ? 'Work Experience' : nextData.headings.experience,
            education: (nextData.headings.education === 'Formation' || nextData.headings.education === 'Educación') ? 'Education' : nextData.headings.education,
            skills: (nextData.headings.skills === 'Compétences' || nextData.headings.skills === 'Habilidades') ? 'Skills' : nextData.headings.skills,
            projects: (nextData.headings.projects === 'Projets' || nextData.headings.projects === 'Proyectos') ? 'Projects' : nextData.headings.projects,
            certifications: (nextData.headings.certifications === 'Certifications' || nextData.headings.certifications === 'Certificaciones') ? 'Certifications' : nextData.headings.certifications,
            technical: (nextData.headings.technical === 'Technique:' || nextData.headings.technical === 'Técnicas:') ? 'Technical:' : nextData.headings.technical,
            interpersonal: (nextData.headings.interpersonal === 'Interpersonnelles:' || nextData.headings.interpersonal === 'Interpersonales:') ? 'Interpersonal:' : nextData.headings.interpersonal,
            languages: (nextData.headings.languages === 'Langues:' || nextData.headings.languages === 'Idiomas:') ? 'Languages:' : nextData.headings.languages,
            present: (nextData.headings.present === 'Présent' || nextData.headings.present === 'Presente') ? 'Present' : nextData.headings.present
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

        {/* Header — M1: simplified, demos in overflow menu */}
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
            <span className="privacy-note"><i className="fi fi-rr-lock"></i> {t('All data stays in your browser')}</span>

            {/* Primary action: Import CV */}
            <button className="btn-demo btn-import-primary" onClick={() => setShowImportModal(true)}>
              <i className="fi fi-rr-magic-wand"></i> {t('Import CV')}
            </button>

            {/* S3: Demos + Clear moved to overflow menu */}
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
                <button className="btn-demo dropdown-item" onClick={() => { setIsCvManagerOpen(true); setMobileMenuOpen(false); }}>
                  <i className="fi fi-rr-folder"></i> {t('Manage My Resumes')}
                </button>
                <div className="dropdown-divider" />
                <div className="dropdown-section-label">{t('Examples')}</div>
                <button className="btn-demo dropdown-item" onClick={() => { loadDemoData(1); setMobileMenuOpen(false); }}>
                  <i className="fi fi-rr-document"></i> {t('1-Page Demo')}
                </button>
                <button className="btn-demo dropdown-item" onClick={() => { loadDemoData(2); setMobileMenuOpen(false); }}>
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

            <button className="theme-toggle" onClick={toggleTheme} aria-label={t('Toggle theme')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="main" id="main-content">
          {/* Left: Form Panel */}
          <div className="form-panel">
            {/* S2: Profile completion bar removed — integrated into ATS Score widget */}

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
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-accent-light)', border: '1px solid var(--color-accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                    <i className="fi fi-rr-eye-crossed" style={{ color: 'var(--color-accent)' }}></i>
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
                  onAIAssist={(text) => setAiBoldConfig({ 
                    isOpen: true, 
                    text, 
                    contextType: 'summary', 
                    onUpdate: (newText) => {
                      setAiSnapshot(structuredClone(data));
                      setData(prev => ({...prev, summary: newText}));
                    }
                  })}
                />
              )}
              {currentId === 'experience' && (
                <ExperienceStep 
                  data={data.experience} 
                  onChange={(v) => setData({ ...data, experience: v })} 
                  onAIAssist={(text, index, bulletIndex) => {
                    setAiBoldConfig({
                      isOpen: true, 
                      text, 
                      contextType: 'experience',
                      onUpdate: (newText) => {
                        setAiSnapshot(structuredClone(data));
                        setData(prev => {
                          const newExp = [...prev.experience];
                          newExp[index] = {
                            ...newExp[index],
                            bullets: newExp[index].bullets.map((b, i) => i === bulletIndex ? newText : b)
                          };
                          return {...prev, experience: newExp};
                        });
                      }
                    });
                  }}
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
                  onAIAssist={(text, index, bulletIndex) => {
                    setAiBoldConfig({
                      isOpen: true, 
                      text, 
                      contextType: 'projects',
                      onUpdate: (newText) => {
                        setAiSnapshot(structuredClone(data));
                        setData(prev => {
                          const newProj = [...prev.projects];
                          if (bulletIndex === -1) {
                            newProj[index] = { ...newProj[index], description: newText };
                          } else {
                            newProj[index] = {
                              ...newProj[index],
                              highlights: newProj[index].highlights.map((hl, i) => i === bulletIndex ? newText : hl)
                            };
                          }
                          return {...prev, projects: newProj};
                        });
                      }
                    });
                  }}
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
                      <button 
                        className={`control-btn ${language === 'es' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('es')}
                        aria-label="Switch to Spanish"
                      >ES</button>
                    </div>

                    <div className="control-group" style={{ gap: '4px' }}>
                      <button 
                        className="control-btn" 
                        onClick={undo} 
                        disabled={past.length === 0}
                        title={t('Undo (Ctrl+Z)')}
                        style={{ opacity: past.length === 0 ? 0.4 : 1, cursor: past.length === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '4px 6px' }}
                        aria-label="Undo"
                      >
                        ↩
                      </button>
                      <button 
                        className="control-btn" 
                        onClick={redo} 
                        disabled={future.length === 0}
                        title={t('Redo (Ctrl+Y)')}
                        style={{ opacity: future.length === 0 ? 0.4 : 1, cursor: future.length === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '4px 6px' }}
                        aria-label="Redo"
                      >
                        ↪
                      </button>
                    </div>

                    <div className="control-divider" aria-hidden="true" />

                     {/* Template picker — compact dropdown */}
                     {(() => {
                       const TEMPLATES = [
                         { id: 'standard',  name: 'Classic',    badgeType: 'ats',      badgeText: t('ATS-Friendly') },
                         { id: 'modern',    name: 'Modern',     badgeType: 'ats',      badgeText: t('ATS-Friendly') },
                         { id: 'njm',       name: 'NJM',        badgeType: 'flagship', badgeText: t("Creator's Favorite") },
                         { id: 'creative',  name: 'Creative',   badgeType: 'design',   badgeText: t('Visual Design') },
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
                             title={t('Choose Template')}
                           >
                             <span className="tpl-trigger-name">{activeTpl.name}</span>
                             <span className="tpl-trigger-badge" style={{ background: activeBadge.bg, color: activeBadge.color, border: `1px solid ${activeBadge.border}` }}>
                               {activeTpl.badgeText}
                             </span>
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
                                     >
                                       <span className="tpl-option-name">{tpl.name}</span>
                                       <span className="tpl-option-badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                         {tpl.badgeText}
                                       </span>
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

                    {/* A2: snapshot saved before tailor opens */}
                    <div className="ai-btn-wrapper" title={!hasContent ? t('Please fill out your resume first') : t('AI rewrites your resume to match a specific job description')}>
                      <button className="control-btn" onClick={() => { setIsTailorOpen(true); }} disabled={!hasContent} style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}>
                        ✨ {t('Tailor to Job')}
                      </button>
                    </div>

                    {/* A2: snapshot saved before translation opens */}
                    <div className="ai-btn-wrapper" title={!hasContent ? t('Please fill out your resume first') : t('AI translates your entire resume to the other language')}>
                      <button className="control-btn" onClick={() => { setIsAIOpen(true); }} disabled={!hasContent} style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}>
                        <i className="fi fi-rr-magic-wand"></i> {t('AI Translate')}
                      </button>
                    </div>

                    {/* S2: Smart Bolding whole CV */}
                    <div className="ai-btn-wrapper" title={!hasContent ? t('Please fill out your resume first') : t('AI Smart Bolding')}>
                      <button className="control-btn" onClick={() => { setIsBoldifyOpen(true); }} disabled={!hasContent} style={{ opacity: hasContent ? 1 : 0.5, cursor: hasContent ? 'pointer' : 'not-allowed' }}>
                        <b>B</b> {t('AI Smart Bolding')}
                      </button>
                    </div>

                    {/* A2: Undo AI changes button — appears only when snapshot is available */}
                    {aiSnapshot && (
                      <button
                        className="control-btn ai-undo-btn"
                        onClick={restoreSnapshot}
                        title={t('Undo AI changes and restore previous version')}
                      >
                        ↩ {t('Undo AI')}
                      </button>
                    )}
                  </div>
                </div>

                {isLayoutOpen && <LayoutControls layout={layout} onChange={setLayout} />}
                
                {/* S1: Direct export — no confirmation modal */}
                <div className="preview-export-bar" style={{ position: 'relative' }}>
                  <div className="export-split-button" style={{ display: 'flex', width: '100%', gap: '1px' }}>
                    <button 
                      type="button"
                      className="btn-export btn-export-primary" 
                      onClick={() => setTimeout(() => window.print(), 100)}
                      title={t('Print / Save as PDF')}
                      style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                      <i className="fi fi-rr-print"></i> {t('Export PDF')}
                    </button>
                    <button
                      type="button"
                      className="btn-export btn-export-primary"
                      onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
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
                      >
                        <i className="fi fi-rr-file-word"></i> {t('Download as Word (DOC)')}
                      </button>
                      <button 
                        type="button"
                        className="dropdown-item" 
                        onClick={() => { try { exportMarkdown(data); } catch (err) { alert('Export failed: ' + err.message); } setIsExportDropdownOpen(false); }}
                      >
                        <i className="fi fi-rr-file-code"></i> {t('Download as Markdown')}
                      </button>
                      <button 
                        type="button"
                        className="dropdown-item" 
                        onClick={() => { try { exportJson(data); } catch (err) { alert('Export failed: ' + err.message); } setIsExportDropdownOpen(false); }}
                      >
                        <i className="fi fi-rr-disk"></i> {t('Download as JSON')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <ResumePreview 
                data={data} 
                layout={layout} 
                language={language} 
                template={template}
                onSectionReorder={handleSectionReorder}
                onSectionRemove={setSectionToDelete}
                onSectionClick={handleSectionClick}
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
                {/* Template picker */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: '4px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'standard', name: 'Classic', isAts: true },
                    { id: 'modern', name: 'Modern', isAts: true },
                    { id: 'njm', name: 'NJM', isFlagship: true },
                    { id: 'creative', name: 'Creative', isDesign: true },
                    { id: 'minimalist', name: 'Minimalist', isAts: true }
                  ].map(tpl => {
                    const isActive = template === tpl.id;
                    let dotColor = 'rgb(16, 185, 129)'; // default ATS
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
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: isActive ? '#fff' : dotColor,
                          display: 'inline-block' 
                        }} />
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
                onSectionReorder={(newOrder) => setData(prev => ({ ...prev, sectionOrder: newOrder }))}
                onSectionRemove={setSectionToDelete}
                onSectionClick={handleSectionClick}
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
                setData(newData);
              }}
            />
          )}
          {isTailorOpen && (
            <AITailorModal 
              isOpen={isTailorOpen} 
              onClose={() => setIsTailorOpen(false)} 
              data={data} 
              language={language}
              onTailorSuccess={(newData) => {
                setAiSnapshot(structuredClone(data));
                setData(newData);
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
                setData(newData);
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
              language={language}
            />
          )}
        </Suspense>

        <ImportModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
          onImportSuccess={(parsedData) => {
            handleImport(parsedData);
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
        {/* Print-only resume */}
        <div id="resume-print" style={{ display: 'none' }}>
          <ResumePreview data={data} layout={layout} language={language} template={template} printMode />
        </div>
      </div>
    </TranslationContext.Provider>
  );
}
