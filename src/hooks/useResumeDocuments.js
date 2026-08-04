import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_DATA, DEFAULT_SECTION_ORDER } from '../utils/constants';

export default function useResumeDocuments({
  data,
  dispatch,
  importSnapshot,
  setImportSnapshot,
  setStep,
  setIsCvManagerOpen,
  language,
  t
}) {
  // Multi-CV states initialization
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
      name: language === 'fr' ? 'Mon CV Principal' : 'My Primary Resume',
      lastModified: Date.now(),
      data: data
    };
    try {
      localStorage.setItem('resume-builder-cv-list', JSON.stringify([initialCv]));
    } catch {}
    return [initialCv];
  });

  const [activeCvId, setActiveCvId] = useState(() => {
    try {
      return localStorage.getItem('resume-builder-active-cv-id') || 'default';
    } catch {
      return 'default';
    }
  });

  // Synchroniser les modifications du CV actif dans la liste cvList
  useEffect(() => {
    setCvList(prev => {
      const updated = prev.map(cv => {
        if (cv.id === activeCvId) {
          return {
            ...cv,
            lastModified: Date.now(),
            data: data,
            importSnapshot: importSnapshot
          };
        }
        return cv;
      });
      try {
        localStorage.setItem('resume-builder-cv-list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [data, activeCvId, importSnapshot]);

  const handleLoadCv = useCallback((id) => {
    const target = cvList.find(c => c.id === id);
    if (target) {
      setActiveCvId(id);
      dispatch({ type: 'SET_DATA', payload: target.data });
      setImportSnapshot(target.importSnapshot || null);
      try {
        localStorage.setItem('resume-builder-active-cv-id', id);
      } catch {}
      setStep(0);
      setIsCvManagerOpen(false);
    }
  }, [cvList, dispatch, setImportSnapshot, setStep, setIsCvManagerOpen]);

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
    try {
      localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));
      localStorage.setItem('resume-builder-active-cv-id', newId);
    } catch {}

    setActiveCvId(newId);
    dispatch({ type: 'SET_DATA', payload: newCv.data });
    setImportSnapshot(null);
    setStep(0);
    setIsCvManagerOpen(false);
  }, [cvList, t, dispatch, setImportSnapshot, setStep, setIsCvManagerOpen]);

  const handleDuplicateCv = useCallback((id) => {
    const source = cvList.find(c => c.id === id);
    if (source) {
      const newId = 'cv_' + Date.now();
      const newCv = {
        id: newId,
        name: `${source.name} (${t('copy')})`,
        lastModified: Date.now(),
        data: structuredClone(source.data),
        importSnapshot: source.importSnapshot ? structuredClone(source.importSnapshot) : null
      };
      const nextList = [...cvList, newCv];
      setCvList(nextList);
      try {
        localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));
      } catch {}
    }
  }, [cvList, t]);

  const handleRenameCv = useCallback((id, name) => {
    setCvList(prev => {
      const next = prev.map(c => c.id === id ? { ...c, name, lastModified: Date.now() } : c);
      try {
        localStorage.setItem('resume-builder-cv-list', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleDeleteCv = useCallback((id) => {
    if (cvList.length <= 1) return;
    const nextList = cvList.filter(c => c.id !== id);
    setCvList(nextList);
    try {
      localStorage.setItem('resume-builder-cv-list', JSON.stringify(nextList));
    } catch {}

    if (activeCvId === id) {
      const fallback = nextList[0];
      setActiveCvId(fallback.id);
      dispatch({ type: 'SET_DATA', payload: fallback.data });
      setImportSnapshot(fallback.importSnapshot || null);
      try {
        localStorage.setItem('resume-builder-active-cv-id', fallback.id);
      } catch {}
      setStep(0);
    }
  }, [cvList, activeCvId, dispatch, setImportSnapshot, setStep]);

  // Automatic Recovery Scanner: Find any non-demo user data previously saved in localStorage
  useEffect(() => {
    const keysToCheck = [
      'resume-builder-data',
      'resume-data-v2',
      'resume-builder-data-backup',
      'resume-builder-last-user-cv'
    ];

    const isDemoData = (resumeObj) => {
      if (!resumeObj || !resumeObj.personal) return false;
      const name = (resumeObj.personal.name || '').toLowerCase();
      return name.includes('marie dubois') || name.includes('alexandre martin') || name.includes('sarah chen') || name.includes('hoshi fenneko') || name.includes('jean dupont');
    };

    keysToCheck.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const userName = parsed?.personal?.name;
        if (userName && !isDemoData(parsed)) {
          setCvList(prev => {
            const alreadyExists = prev.some(c => c.id === `recovered_${key}` || (c.data?.personal?.name === userName && !c.isDemo));
            if (!alreadyExists) {
              const recoveredCv = {
                id: `recovered_${key}`,
                name: `⚠️ ${userName} (CV Restauré)`,
                lastModified: Date.now(),
                data: parsed
              };
              const updated = [recoveredCv, ...prev];
              try {
                localStorage.setItem('resume-builder-cv-list', JSON.stringify(updated));
              } catch {}
              return updated;
            }
            return prev;
          });
        }
      } catch {}
    });
  }, []);

  const handleLoadDemoCv = useCallback((demoData, demoTitle) => {
    // 1. Check if current active CV has user content
    const currentName = data?.personal?.name || '';
    const isCurrentDemo = currentName.includes('Marie Dubois') || currentName.includes('Alexandre Martin') || currentName.includes('Sarah Chen') || currentName.includes('Hoshi Fenneko') || currentName.includes('Jean Dupont');

    // 2. If current CV is user work, save a backup of it in cvList before creating demo entry
    if (data && !isCurrentDemo && currentName.trim().length > 0) {
      const backupId = 'user_backup_' + Date.now();
      const backupCv = {
        id: backupId,
        name: `${currentName} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        lastModified: Date.now(),
        data: structuredClone(data),
        importSnapshot: importSnapshot ? structuredClone(importSnapshot) : null
      };
      
      setCvList(prev => {
        const next = [backupCv, ...prev];
        try {
          localStorage.setItem('resume-builder-cv-list', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // 3. Create a NEW document entry for this Demo CV in cvList
    const demoId = 'demo_doc_' + Date.now();
    const newDemoCv = {
      id: demoId,
      name: demoTitle || (language === 'fr' ? 'CV Démo' : 'Demo Resume'),
      lastModified: Date.now(),
      data: structuredClone(demoData),
      isDemo: true
    };

    setCvList(prev => {
      const updatedList = [...prev, newDemoCv];
      try {
        localStorage.setItem('resume-builder-cv-list', JSON.stringify(updatedList));
        localStorage.setItem('resume-builder-active-cv-id', demoId);
      } catch {}
      return updatedList;
    });

    setActiveCvId(demoId);
    dispatch({ type: 'SET_DATA', payload: newDemoCv.data });
    setImportSnapshot(null);
    setStep(0);
  }, [data, importSnapshot, language, dispatch, setImportSnapshot, setStep]);

  const handleExportData = useCallback(() => {
    const dataStr = JSON.stringify(cvList, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cvList]);

  const handleImportData = useCallback((importedCvList) => {
    if (Array.isArray(importedCvList) && importedCvList.length > 0) {
      setCvList(importedCvList);
      try {
        localStorage.setItem('resume-builder-cv-list', JSON.stringify(importedCvList));
      } catch {}
      const firstCv = importedCvList[0];
      setActiveCvId(firstCv.id);
      try {
        localStorage.setItem('resume-builder-active-cv-id', firstCv.id);
      } catch {}
      dispatch({ type: 'SET_DATA', payload: firstCv.data });
      setImportSnapshot(firstCv.importSnapshot || null);
      alert(t('Backup restored successfully!'));
    }
  }, [t, dispatch, setImportSnapshot]);

  return {
    cvList,
    activeCvId,
    handleLoadCv,
    handleCreateCv,
    handleDuplicateCv,
    handleRenameCv,
    handleDeleteCv,
    handleLoadDemoCv,
    handleExportData,
    handleImportData
  };
}
