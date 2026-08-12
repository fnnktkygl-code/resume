import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateCoverLetterWithProxy, boldifyCoverLetterWithProxy } from '../../services/geminiService';
import { extractJobDetails, cleanJobTitle, cleanCompanyName } from '../../utils/jobExtractor';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function CoverLetterModal({ isOpen, onClose, data, dispatch, onLanguageChange }) {
  const { t, language } = useTranslation();
  const defaultFontFamily = data?.layout?.fontFamily || 'Inter';
  const defaultFontSize = data?.layout?.fontSize || 10.5;

  const [jobDescription, setJobDescription] = useState(data?.targetJobDescription || '');
  
  // Safe persistence state initialization
  const [companyName, setCompanyName] = useState(() => {
    try { return data?.coverLetterSettings?.companyName || localStorage.getItem('resume-cl-company') || ''; } catch { return ''; }
  });
  const [targetRole, setTargetRole] = useState(() => {
    try { return data?.coverLetterSettings?.targetRole || localStorage.getItem('resume-cl-role') || ''; } catch { return ''; }
  });
  const [referenceLetter, setReferenceLetter] = useState(() => {
    try { return data?.coverLetterSettings?.referenceLetter || localStorage.getItem('resume-cl-ref') || ''; } catch { return ''; }
  });
  const [industry, setIndustry] = useState(() => {
    try { return data?.coverLetterSettings?.industry || localStorage.getItem('resume-cl-industry') || 'General'; } catch { return 'General'; }
  });
  const [tone, setTone] = useState(() => {
    try { return data?.coverLetterSettings?.tone || localStorage.getItem('resume-cl-tone') || 'Professional'; } catch { return 'Professional'; }
  });
  const [clLength, setClLength] = useState(() => {
    try { return data?.coverLetterSettings?.clLength || localStorage.getItem('resume-cl-length') || 'Standard'; } catch { return 'Standard'; }
  });
  const [useSearchGrounding, setUseSearchGrounding] = useState(() => {
    try { return localStorage.getItem('resume-cl-search-grounding') === 'true'; } catch { return false; }
  });
  const [clFontFamily, setClFontFamily] = useState(defaultFontFamily);
  const [clFontSize, setClFontSize] = useState(defaultFontSize);
  const [boldStyle, setBoldStyle] = useState(() => {
    try { return localStorage.getItem('resume-cl-bold-style') || 'standard'; } catch { return 'standard'; }
  });

  useEffect(() => {
    try { localStorage.setItem('resume-cl-search-grounding', String(useSearchGrounding)); } catch {}
  }, [useSearchGrounding]);

  useEffect(() => {
    try { localStorage.setItem('resume-cl-bold-style', boldStyle); } catch {}
  }, [boldStyle]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  
  const [coverLetter, setCoverLetter] = useState(() => {
    try {
      if (typeof data?.coverLetter === 'string' && data.coverLetter) return data.coverLetter;
      const saved = localStorage.getItem('resume-cover-letter-text');
      if (saved) return saved;
    } catch {}
    return '';
  });

  const [error, setError] = useState(null);
  const [isBoldifying, setIsBoldifying] = useState(false);
  const [extractionNotice, setExtractionNotice] = useState(null);

  const handleAutoExtractInfo = (textToAnalyze) => {
    const text = textToAnalyze || jobDescription;
    if (!text || text.trim().length < 10) return;
    const extracted = extractJobDetails(text);
    let extractedCompany = extracted.companyName;
    let extractedRole = extracted.targetRole;

    if (extractedCompany) setCompanyName(extractedCompany);
    if (extractedRole) setTargetRole(extractedRole);

    if (extractedCompany || extractedRole) {
      setExtractionNotice(
        language === 'fr'
          ? `✨ Extrait de l'offre : Entreprise = "${extractedCompany || companyName}" • Poste = "${extractedRole || targetRole}"`
          : `✨ Extracted: Company = "${extractedCompany || companyName}" • Role = "${extractedRole || targetRole}"`
      );
      setTimeout(() => setExtractionNotice(null), 6000);
    }
  };

  // Undo / Redo History State
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const previewRef = useRef(null);
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // Helper to convert Markdown / text to HTML with <strong> tags safely
  const textToHtml = useCallback((text) => {
    if (!text || typeof text !== 'string') return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return html;
  }, []);

  // Helper to convert HTML from contentEditable back to clean text with **bold**
  const htmlToText = (html) => {
    if (!html || typeof html !== 'string') return '';
    let text = html
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    return text.trim();
  };

  useEffect(() => {
    if (data?.layout?.fontFamily) setClFontFamily(data.layout.fontFamily);
    if (data?.layout?.fontSize) setClFontSize(data.layout.fontSize);
  }, [data?.layout?.fontFamily, data?.layout?.fontSize]);

  // Sync saved cover letter & settings into editor when modal opens
  useEffect(() => {
    if (isOpen) {
      let savedCompany = '';
      let savedRole = '';
      let savedJd = '';
      try {
        savedCompany = localStorage.getItem('resume-cl-company') || '';
        savedRole = localStorage.getItem('resume-cl-role') || '';
        savedJd = localStorage.getItem('resume-cl-job-desc') || '';
      } catch {}

      const companyToLoad = (data?.coverLetterSettings?.companyName && !data.coverLetterSettings.companyName.includes('TechVision'))
        ? data.coverLetterSettings.companyName 
        : (savedCompany && !savedCompany.includes('TechVision') ? savedCompany : (language === 'fr' ? 'Walter Learning' : 'Vercel'));
      
      const roleToLoad = (data?.coverLetterSettings?.targetRole && !data.coverLetterSettings.targetRole.includes('TechVision'))
        ? data.coverLetterSettings.targetRole 
        : (savedRole && !savedRole.includes('TechVision') ? savedRole : (language === 'fr' ? 'Senior / Staff Engineer' : 'Senior Software Engineer'));

      setCompanyName(cleanCompanyName(companyToLoad));
      setTargetRole(cleanJobTitle(roleToLoad));

      if (data?.coverLetterSettings) {
        const s = data.coverLetterSettings;
        if (s.industry) setIndustry(s.industry);
        if (s.tone) setTone(s.tone);
        if (s.clLength) setClLength(s.clLength);
        if (s.referenceLetter) setReferenceLetter(s.referenceLetter);
      }

      // Load job description (prioritize saved/current, fallback only if empty)
      let jdToLoad = data?.targetJobDescription || savedJd || '';
      if (!jdToLoad || jdToLoad.includes('TechVision') || jdToLoad.includes('SaaS B2B')) {
        jdToLoad = language === 'fr'
          ? `Intitulé du poste : Senior / Staff Engineer (H/F)\nEntreprise : Walter Learning — Marseille (13008) / Présentiel\n\nÀ propos de Walter Learning :\nWalter Learning conçoit, produit et dispense des formations en ligne à destination des professionnels (Walter Santé, compétences transverses, alternance).\nDepuis 2019 : 130 000 formations dispensées à fin 2025, près de 20 M€ de CA, rentable dès le premier jour et sans levée de fonds.\n\nMissions & Contexte Technique :\n- Prendre l’ownership de systèmes techniques critiques (LMS maison, CRM interne, outils métiers, nombreuses intégrations API).\n- Concevoir des architectures robustes et structurer l'évolution de systèmes existants (pas un rôle "feature factory").\n- Encadrer et structurer l’usage de l’IA dans les workflows (code, outils internes, opérations) avec un enjeu fort sur la qualité, la cohérence et la maintenabilité.\n- Stack principale : Python / Django, React / Next.js, PostgreSQL, AWS (ECS, Lambda).\n- Travail en lien direct avec le CTO au sein d'une petite équipe tech à fort impact (6 personnes).\n\nProfil recherché :\n- 5+ ans d’expérience sur des systèmes complexes en production.\n- Solide maîtrise backend (Python/Django) et frontend moderne (React/Next.js), bases SQL.\n- À l’aise avec la gestion des risques techniques, les edge cases et l’intégration pragmatique de l’IA.`
          : `Role Title: Senior / Staff Engineer\nCompany: Walter Learning — Marseille / Hybrid\n\nKey Responsibilities:\n- Take ownership of critical technical systems (LMS, internal CRM, business tools).\n- Architecture & scalability using Python/Django, React/Next.js, PostgreSQL, AWS.\n- Pragmatic AI integration in engineering workflows with high standards for code quality.`;
        
        if (dispatch) {
          dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: jdToLoad });
        }
      }
      setJobDescription(jdToLoad);

      let textToLoad = '';
      if (typeof data?.coverLetter === 'string' && data.coverLetter && !data.coverLetter.includes('TechVision')) {
        textToLoad = data.coverLetter;
      } else {
        try {
          const saved = localStorage.getItem('resume-cover-letter-text');
          if (saved && !saved.includes('TechVision')) textToLoad = saved;
        } catch {}
      }

      if (!textToLoad || textToLoad.includes('TechVision')) {
        const name = data?.personal?.name || (language === 'fr' ? 'Marie Dubois' : 'Sarah Chen');
        const email = data?.personal?.email || (language === 'fr' ? 'marie.dubois@email.fr' : 'sarah.chen@email.com');
        const phone = data?.personal?.phone || (language === 'fr' ? '+33 6 12 34 56 78' : '+1 (415) 555-0147');
        const location = data?.personal?.location || (language === 'fr' ? 'Marseille, France' : 'San Francisco, CA');

        if (language === 'fr') {
          textToLoad = `${name}\n${location}\n${email} | ${phone}\n\nMarseille, le 4 août 2025\n\nObjet : Candidature au poste de **Senior / Staff Engineer** chez **Walter Learning**\n\nMadame, Monsieur,\n\nImpressionnée par le modèle de croissance de **Walter Learning** — rentable dès le premier jour, comptabilisant près de 20 M€ de chiffre d'affaires et 130 000 formations dispensées — je vous présente ma candidature pour le poste de **Senior / Staff Engineer**.\n\nForte de plus de 10 ans d'expérience en ingénierie logicielle sur des systèmes complexes en production (notamment chez **Qonto** sur des architectures bancaires temps réel gérant **100K+ transactions/jour**), je me retrouve pleinement dans votre philosophie : concevoir des architectures pérennes, arbitrer les trade-offs techniques et refuser la logique de "feature factory".\n\nMon expertise couvre l'ensemble de vos enjeux techniques :\n- **Backend & Bases de données** : Maîtrise approfondie de **Python / Django** et modélisation complexe sur **PostgreSQL**.\n- **Frontend Moderne** : Conception d'interfaces réactives et modulaires avec **React** et **Next.js**.\n- **Services & Intégrations Cloud** : Orchestration de workflows critiques sur **AWS (ECS, Lambda)** et intégrations robustes d'APIs tierces.\n- **Usage Critique & Maintenable de l'IA** : Intégration pragmatique des outils d'IA dans les workflows métiers, axée sur la qualité du code, la gestion des edge cases et la fiabilité système.\n\nTravailler en lien direct avec le CTO au sein d'une équipe agile de 6 personnes pour faire évoluer votre LMS et votre CRM maison constitue un défi stimulant. Je serais ravie de vous exposer mon parcours lors d'un entretien.\n\nCordialement,\n${name}`;
        } else {
          textToLoad = `${name}\n${location}\n${email} | ${phone}\n\nAugust 4, 2025\n\nSubject: Application for **Senior / Staff Engineer** at **Walter Learning**\n\nDear Hiring Team,\n\nAs a staff engineer with extensive experience building high-performance systems and managing cloud architecture, I am excited to apply for the **Senior / Staff Engineer** role at **Walter Learning**.\n\nThroughout my career, I have specialized in **Python/Django**, **React/Next.js**, **PostgreSQL**, and scalable AWS architecture. I have led technical initiatives that improved core reliability and streamlined business workflows.\n\nI am strongly aligned with Walter Learning's ownership mindset and would welcome the opportunity to discuss how my technical expertise can support your team's goals.\n\nSincerely,\n${name}`;
        }

        if (dispatch) {
          dispatch({ type: 'UPDATE_COVER_LETTER', payload: textToLoad });
        }
      }

      setCoverLetter(textToLoad);
      setHistory([textToLoad]);
      setHistoryIndex(0);

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = textToHtml(textToLoad);
        }
      }, 50);
    }
  }, [isOpen]); // Only re-init when modal opens, NOT on data mutation

  // Save cover letter to localStorage safely
  useEffect(() => {
    if (typeof coverLetter === 'string') {
      try {
        localStorage.setItem('resume-cover-letter-text', coverLetter);
      } catch {}
    }
  }, [coverLetter]);

  // Save settings & job description to localStorage & dispatch safely
  useEffect(() => {
    try {
      localStorage.setItem('resume-cl-company', companyName);
      localStorage.setItem('resume-cl-role', targetRole);
      localStorage.setItem('resume-cl-job-desc', jobDescription);
      localStorage.setItem('resume-cl-industry', industry);
      localStorage.setItem('resume-cl-tone', tone);
      localStorage.setItem('resume-cl-length', clLength);
      localStorage.setItem('resume-cl-ref', referenceLetter);
    } catch {}

    if (dispatch) {
      dispatch({
        type: 'UPDATE_COVER_LETTER_SETTINGS',
        payload: { companyName, targetRole, industry, tone, clLength, referenceLetter }
      });
      if (jobDescription) {
        dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: jobDescription });
      }
    }
  }, [companyName, targetRole, jobDescription, industry, tone, clLength, referenceLetter, dispatch]);

  // Modal lifecycle & ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-cover-letter');
      document.body.style.overflow = 'hidden';

      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };

      window.addEventListener('keydown', handleEscape);

      return () => {
        document.body.classList.remove('print-cover-letter');
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Proactive Header Injection & Placeholder Replacement Helper
  const autoInjectHeaderInfo = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;
    let result = text;
    
    // 1. Clean markdown codeblock wrappers if Gemini returns ```markdown ... ```
    result = result.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    const todayStr = new Date().toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );

    // 2. Replace residual generic placeholders
    if (data?.personal) {
      const p = data.personal;
      if (p.name) {
        result = result.replace(/\[(Your Name|Candidate Name|Nom Prénom|Nom|Full Name|Votre Nom)\]/gi, p.name);
      }
      if (p.email) {
        result = result.replace(/\[(Your Email|Email Address|Email|Votre Email)\]/gi, p.email);
      }
      if (p.phone) {
        result = result.replace(/\[(Your Phone|Phone Number|Téléphone|Phone|Votre Téléphone)\]/gi, p.phone);
      }
      if (p.location) {
        result = result.replace(/\[(Your Address|Address|City, State|Ville, Pays|Adresse|Your Location)\]/gi, p.location);
      }
    }

    result = result.replace(/\[(Date|Today's Date|Date du jour)\]/gi, todayStr);

    if (companyName) {
      result = result.replace(/\[(Company Name|Nom de l'entreprise|Entreprise)\]/gi, companyName);
    }
    if (targetRole) {
      result = result.replace(/\[(Target Role|Title|Job Title|Poste)\]/gi, targetRole);
    }

    // 3. Prepend candidate header block if letter lacks a header entirely
    const p = data?.personal;
    const hasHeaderName = p?.name && result.toLowerCase().includes(p.name.toLowerCase());
    if (p?.name && !hasHeaderName) {
      let headerBlock = `${p.name}\n`;
      if (p.location) headerBlock += `${p.location}\n`;
      if (p.phone || p.email) headerBlock += `${[p.phone, p.email].filter(Boolean).join(' | ')}\n`;
      headerBlock += `${todayStr}\n\n`;
      result = headerBlock + result;
    }

    return result;
  }, [data?.personal, language, companyName, targetRole]);

  // Update Cover Letter state with Undo/Redo history tracking
  const updateLetterContent = useCallback((newText, clearHistory = false) => {
    const formatted = autoInjectHeaderInfo(newText);
    setCoverLetter(formatted);
    
    if (dispatch) {
      dispatch({ type: 'UPDATE_COVER_LETTER', payload: formatted });
    }

    // Synchronize HTML into contentEditable editor
    if (editorRef.current) {
      editorRef.current.innerHTML = textToHtml(formatted);
    }
    isInternalChangeRef.current = false;

    if (clearHistory) {
      setHistory([formatted]);
      setHistoryIndex(0);
    } else {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced[sliced.length - 1] === formatted) return prev;
        return [...sliced, formatted];
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [autoInjectHeaderInfo, historyIndex, textToHtml, dispatch]);

  const debounceDispatchRef = useRef(null);
  const debounceHistoryRef = useRef(null);

  // Sync content editable changes in real time
  const handleEditorInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      const text = htmlToText(editorRef.current.innerHTML);
      setCoverLetter(text);

      // Real-time debounced sync with main state & ATS auditor (250ms)
      if (dispatch) {
        if (debounceDispatchRef.current) clearTimeout(debounceDispatchRef.current);
        debounceDispatchRef.current = setTimeout(() => {
          dispatch({ type: 'UPDATE_COVER_LETTER', payload: text });
        }, 250);
      }

      // Debounced history recording (500ms) to avoid single-char history bloat
      if (debounceHistoryRef.current) clearTimeout(debounceHistoryRef.current);
      debounceHistoryRef.current = setTimeout(() => {
        setHistory(prev => {
          const sliced = prev.slice(0, historyIndex + 1);
          if (sliced[sliced.length - 1] === text) return prev;
          return [...sliced, text];
        });
        setHistoryIndex(prev => prev + 1);
      }, 500);
    }
  };

  const handleManualBoldClick = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('bold', false, null);
      handleEditorInput();
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const text = history[prevIndex];
      setCoverLetter(text);
      if (editorRef.current) {
        editorRef.current.innerHTML = textToHtml(text);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const text = history[nextIndex];
      setCoverLetter(text);
      if (editorRef.current) {
        editorRef.current.innerHTML = textToHtml(text);
      }
    }
  };

  // Keyboard shortcut listener for Cmd+Z / Cmd+Y / Cmd+B
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          handleManualBoldClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, historyIndex, history]);

  if (!isOpen) return null;

  const isResumeEmpty = !data || !data.experience || data.experience.length === 0;

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationStep(language === 'fr' ? '⚡ Analyse de l\'offre d\'emploi...' : '⚡ Analyzing job description...');
    setError(null);

    // Smooth Progress Timer (advances smoothly while API request is in-flight)
    let currentProgress = 15;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 7) + 4; // Increment 4-10% every 350ms
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(progressInterval);
      }

      setGenerationProgress(currentProgress);

      if (currentProgress < 35) {
        setGenerationStep(language === 'fr' ? '⚡ Analyse de l\'offre d\'emploi et des exigences...' : '⚡ Analyzing job description & requirements...');
      } else if (currentProgress < 65) {
        setGenerationStep(useSearchGrounding 
          ? (language === 'fr' ? '🌐 Recherche en direct des actualités et culture de l\'entreprise sur Google...' : '🌐 Researching company news & culture on Google...')
          : (language === 'fr' ? '🧠 Alignement des compétences et de l\'expérience candidat...' : '🧠 Mapping skills & candidate experience...')
        );
      } else if (currentProgress < 90) {
        setGenerationStep(language === 'fr' ? '✍️ Rédaction de la lettre sur-mesure par l\'IA...' : '✍️ Drafting tailored cover letter with AI...');
      } else {
        setGenerationStep(language === 'fr' ? '✨ Polissage final et mise en forme...' : '✨ Final polishing & formatting...');
      }
    }, 350);

    try {
      let combinedPrompt = `${jobDescription}\n\n`;
      if (companyName) combinedPrompt += `Company Name: ${companyName}\n`;
      if (targetRole) combinedPrompt += `Target Role: ${targetRole}\n`;
      if (industry && industry !== 'General') combinedPrompt += `Industry Context: ${industry}\n`;
      
      if (tone === 'CloneStyle' && referenceLetter.trim()) {
        combinedPrompt += `\n\nCRITICAL INSTRUCTION: I have provided a 'Reference Cover Letter' below. You MUST deeply analyze its writing style, tone of voice, vocabulary, sentence structure, and level of formality. Then, write the NEW cover letter by EXACTLY mimicking this writing style. Do NOT just copy the content, but clone the author's unique voice.\n\n--- REFERENCE COVER LETTER (Clone this style) ---\n${referenceLetter}\n------------------------------------------\n`;
      } else {
        combinedPrompt += `Tone: ${tone}\n`;
      }
      
      combinedPrompt += `Length Constraint: ${clLength} (Ensure the letter strictly reflects this length constraint)`;
      
      const result = await generateCoverLetterWithProxy(
        data, 
        combinedPrompt, 
        language, 
        { tone, clLength, companyName, targetRole, useSearchGrounding, forceRegenerate: true }
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStep(language === 'fr' ? '✨ Lettre générée avec succès !' : '✨ Cover letter generated successfully!');

      // Smooth 300ms pause to let user see 100% progress
      await new Promise(r => setTimeout(r, 300));
      updateLetterContent(result, true);
      
      if (window.innerWidth <= 768 && previewRef.current) {
        setTimeout(() => {
          previewRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || t('An error occurred during generation.'));
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  const handleBoldify = async () => {
    if (!coverLetter || isBoldifying) return;
    setIsBoldifying(true);
    setError(null);
    setGenerationProgress(15);
    setGenerationStep(language === 'fr' ? '⚡ Analyse de la lettre et mise en valeur des termes d\'impact...' : '⚡ Analyzing cover letter & highlighting impact terms...');

    let currentProgress = 15;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 5;
      if (currentProgress >= 92) {
        currentProgress = 92;
        clearInterval(progressInterval);
      }
      setGenerationProgress(currentProgress);
    }, 300);

    try {
      const result = await boldifyCoverLetterWithProxy(coverLetter, jobDescription);
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStep(language === 'fr' ? '✨ Mise en gras intelligente effectuée !' : '✨ Smart bolding applied!');
      await new Promise(r => setTimeout(r, 250));
      updateLetterContent(result);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || t('An error occurred during boldification.'));
    } finally {
      clearInterval(progressInterval);
      setIsBoldifying(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  const handleRemoveBold = () => {
    if (!coverLetter) return;
    updateLetterContent(coverLetter.replace(/\*\*/g, ''));
  };

  const handleClearAll = useCallback(() => {
    if (coverLetter || companyName || targetRole || jobDescription || referenceLetter) {
      const confirmMsg = language === 'fr' 
        ? 'Voulez-vous vraiment effacer tous les paramètres et le texte de la lettre de motivation ?' 
        : 'Are you sure you want to clear all cover letter settings and text?';
      if (!window.confirm(confirmMsg)) return;
    }

    setCompanyName('');
    setTargetRole('');
    setReferenceLetter('');
    setIndustry('General');
    setTone('Professional');
    setClLength('Standard');
    setJobDescription('');
    setCoverLetter('');
    setError(null);

    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }

    setHistory(['']);
    setHistoryIndex(0);

    try {
      localStorage.removeItem('resume-cl-company');
      localStorage.removeItem('resume-cl-role');
      localStorage.removeItem('resume-cl-ref');
      localStorage.removeItem('resume-cl-industry');
      localStorage.removeItem('resume-cl-tone');
      localStorage.removeItem('resume-cl-length');
      localStorage.removeItem('resume-cover-letter-text');
    } catch {}

    if (dispatch) {
      dispatch({ type: 'UPDATE_COVER_LETTER', payload: '' });
      dispatch({ 
        type: 'UPDATE_COVER_LETTER_SETTINGS', 
        payload: { companyName: '', targetRole: '', referenceLetter: '', industry: 'General', tone: 'Professional', clLength: 'Standard' } 
      });
      dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: '' });
    }
  }, [coverLetter, companyName, targetRole, jobDescription, referenceLetter, language, dispatch]);

  const hasBoldMarkers = (typeof coverLetter === 'string' && coverLetter.includes('**')) || (editorRef.current && editorRef.current.innerHTML.includes('<strong>'));

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    if (!coverLetter) return;
    try {
      const wordFont = clFontFamily.split(',')[0].replace(/['"]/g, '').trim();
      const wordSize = Math.round(clFontSize * 2);

      const parseLineToRuns = (line) => {
        const runs = [];
        const parts = line.split(/(\*\*[^*]+\*\*|<strong>.*?<\/strong>)/g);
        for (const part of parts) {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('<strong>') && part.endsWith('</strong>'))) {
            const clean = part.replace(/^(\*\*|<strong>)/, '').replace(/(\*\*|<\/strong>)$/, '');
            const accentHex = (data?.layout?.accentColor || '#6366f1').replace('#', '');
            runs.push(new TextRun({
              text: clean,
              font: wordFont,
              size: wordSize,
              bold: true,
              color: boldStyle === 'accent' ? accentHex : undefined,
            }));
          } else if (part) {
            runs.push(new TextRun({
              text: part.replace(/<[^>]*>/g, ''),
              font: wordFont,
              size: wordSize,
            }));
          }
        }
        return runs;
      };

      const paragraphs = coverLetter.split('\n').map(line => {
        return new Paragraph({
          children: parseLineToRuns(line),
          spacing: {
            after: 120,
          }
        });
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "Cover_Letter.docx");
    } catch (err) {
      console.error("Docx generation error:", err);
      setError(t('An error occurred while generating the document.'));
    }
  };

  return (
    <div 
      className="cl-workspace-overlay" 
      onClick={(e) => {
        if (e.target.classList.contains('cl-workspace-overlay')) onClose();
      }}
    >
      <div className="cl-header">
        <h2>
          <i className="fi fi-rr-document"></i> {t('Cover Letter Workspace')}
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button"
            className="control-btn"
            onClick={handleClearAll}
            data-tooltip={language === 'fr' ? "Réinitialise l'offre, la lettre et tous les champs de ciblage" : 'Reset job offer, cover letter, and target fields'}
            data-tooltip-pos="bottom"
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px', 
              color: 'var(--color-danger)', 
              borderColor: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent'
            }}
          >
            🧹 {language === 'fr' ? 'Tout effacer' : 'Clear All'}
          </button>
          <button 
            className="cl-close-btn" 
            onClick={onClose}
            data-tooltip={language === 'fr' ? "Fermer l'espace de travail de la lettre de motivation" : 'Close cover letter workspace'}
            data-tooltip-pos="bottom"
          >
            <i className="fi fi-rr-cross"></i> {t('Close Workspace')}
          </button>
        </div>
      </div>

      <div className="cl-workspace-main">
        {/* Left Panel: Settings */}
        <div className="cl-sidebar">
          {/* Top Scrollable Content */}
          <div className="cl-sidebar-scroll">
            <div className="cl-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{language === 'fr' ? 'Paramètres de la Lettre' : 'Cover Letter Settings'}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{language === 'fr' ? 'Ciblage, style IA et mise en page' : 'Tailor, style, and format your letter'}</p>
              </div>
              <button 
                type="button"
                onClick={handleClearAll}
                title={language === 'fr' ? 'Effacer tous les champs' : 'Clear all fields'}
                style={{
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-danger)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                data-tooltip={language === 'fr' ? "Réinitialise le texte de l'offre et les champs entreprise/poste" : 'Reset job description and company/role fields'}
                data-tooltip-pos="bottom"
              >
                🧹 {language === 'fr' ? 'Effacer tout' : 'Clear'}
              </button>
            </div>

            {/* CARD 1: Cible & Entreprise */}
            <div className="cl-section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="cl-section-title" style={{ margin: 0 }}>🎯 {language === 'fr' ? 'Poste & Entreprise Cible' : 'Target Role & Company'}</span>
                <button 
                  type="button"
                  onClick={() => handleAutoExtractInfo(jobDescription)}
                  disabled={!jobDescription || jobDescription.trim().length < 10}
                  data-tooltip={language === 'fr' ? "Lit l'offre ci-dessous et remplit le nom de l'entreprise et du poste" : 'Reads job offer below and auto-fills company & role'}
                  data-tooltip-pos="bottom"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: jobDescription && jobDescription.trim().length >= 10 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: jobDescription && jobDescription.trim().length >= 10 ? 1 : 0.5
                  }}
                >
                  🪄 {language === 'fr' ? 'Auto-remplir depuis l\'offre' : 'Auto-fill from offer'}
                </button>
              </div>

              {extractionNotice && (
                <div style={{
                  padding: '6px 10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#059669',
                  fontWeight: 600,
                  marginBottom: '10px',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {extractionNotice}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className="cl-label" style={{ fontSize: '11px' }}>
                    <i className="fi fi-rr-building"></i> {t('Company')}
                  </label>
                  <input 
                    type="text" 
                    className="resume-input cl-input" 
                    placeholder={t('e.g. Google')}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className="cl-label" style={{ fontSize: '11px' }}>
                    <i className="fi fi-rr-briefcase"></i> {t('Role')}
                  </label>
                  <input 
                    type="text" 
                    className="resume-input cl-input" 
                    placeholder={t('e.g. Frontend')}
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="cl-switch-card">
                <input 
                  type="checkbox" 
                  id="cl-search-grounding-check"
                  checked={useSearchGrounding} 
                  onChange={(e) => setUseSearchGrounding(e.target.checked)}
                />
                <label htmlFor="cl-search-grounding-check" style={{ cursor: 'pointer', margin: 0, flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>
                    🌐 {language === 'fr' ? 'Recherche Web en Direct (Google Search)' : 'Live Web Research (Google Search)'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px', lineHeight: '1.3' }}>
                    {language === 'fr' 
                      ? 'Recherche en direct les actualités et la culture de l’entreprise pour personnaliser la lettre.' 
                      : 'Live researches company news & culture via Google for authentic customization.'}
                  </span>
                </label>
              </div>

              <div className="field-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="field-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <i className="fi fi-rr-document"></i> {language === 'fr' ? "Description de l'offre d'emploi" : 'Target Job Description'} <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                    {language === 'fr' ? '⚡ Auto-détection de l\'entreprise au collage' : '⚡ Auto-detects company on paste'}
                  </span>
                </div>
                <textarea
                  className="input cl-textarea"
                  value={jobDescription}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setJobDescription(newText);
                    if (newText && newText.length > 15) {
                      handleAutoExtractInfo(newText);
                    }
                  }}
                  placeholder={t('Paste the job description here so the AI can tailor the letter...')}
                  rows={4}
                  style={{ padding: '8px 10px', fontSize: '12px', minHeight: '90px' }}
                />
              </div>
            </div>

            {/* CARD 2: Style & Ton IA */}
            <div className="cl-section-card">
              <span className="cl-section-title">✍️ {language === 'fr' ? 'Style IA & Persona' : 'AI Style & Voice'}</span>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-globe"></i> {t('Language')}
                </label>
                <div className="cl-segment-group">
                  <button 
                    type="button"
                    className={`cl-segment-btn ${language === 'en' ? 'active' : ''}`} 
                    onClick={() => onLanguageChange && onLanguageChange('en')}
                    data-tooltip="Anglais / English"
                  >🇬🇧 EN</button>
                  <button 
                    type="button"
                    className={`cl-segment-btn ${language === 'fr' ? 'active' : ''}`} 
                    onClick={() => onLanguageChange && onLanguageChange('fr')}
                    data-tooltip="Français"
                  >🇫🇷 FR</button>
                  <button 
                    type="button"
                    className={`cl-segment-btn ${language === 'es' ? 'active' : ''}`} 
                    onClick={() => onLanguageChange && onLanguageChange('es')}
                    data-tooltip="Espagnol / Español"
                  >🇪🇸 ES</button>
                </div>
              </div>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-chart-network"></i> {t('Industry')}
                </label>
                <select className="resume-input cl-input" value={industry} onChange={e => setIndustry(e.target.value)} style={{ padding: '8px 10px', fontSize: '12px' }}>
                  <option value="General">{t('General / Unspecified')}</option>
                  <option value="Tech & Software">{t('Tech & Software')}</option>
                  <option value="Finance & Banking">{t('Finance & Banking')}</option>
                  <option value="Retail & Sales">{t('Retail & Sales')}</option>
                  <option value="Healthcare & Medical">{t('Healthcare & Medical')}</option>
                  <option value="Education & Teaching">{t('Education & Teaching')}</option>
                  <option value="Arts & Design">{t('Arts & Design')}</option>
                  <option value="Engineering & Manufacturing">{t('Engineering & Manufacturing')}</option>
                  <option value="Marketing & Communications">{t('Marketing & Communications')}</option>
                </select>
              </div>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-microphone"></i> {t('Tone')}
                </label>
                <select className="resume-input cl-input" value={tone} onChange={e => setTone(e.target.value)} style={{ padding: '8px 10px', fontSize: '12px' }}>
                  <optgroup label={t('Standard')}>
                    <option value="Professional">{t('Professional')}</option>
                    <option value="Confident">{t('Confident')}</option>
                    <option value="Enthusiastic">{t('Enthusiastic')}</option>
                  </optgroup>
                  <optgroup label={t('Creative & Fun')}>
                    <option value="Speak exactly like Kylian Mbappé. Use football/soccer metaphors, be extremely ambitious, confident, focused on winning, breaking records, teamwork, and use a professional yet determined tone. Mention 'projet', 'performance', 'collectif'.">{t('Kylian Mbappé')}</option>
                    <option value="Speak exactly like Naruto Uzumaki from the anime Naruto. Be extremely energetic, use 'Believe it!' (or dattebayo equivalents), talk about never giving up, the 'Will of Fire', friendship, and your dream to be the best.">{t('Naruto Uzumaki')}</option>
                    <option value="Speak exactly like Wednesday Addams from the Addams Family. Be incredibly deadpan, dark, morbid, cynical, and highly intelligent. Use sophisticated vocabulary with gothic undertones. Show zero enthusiasm but immense, terrifying competence.">{t('Wednesday Addams')}</option>
                    <option value="Manga Protagonist (Passionate, Determined, Shōnen anime style)">{t('Manga / Anime Hero')}</option>
                    <option value="Gamer (Strategic, Quest-Oriented, RPG style)">{t('Gamer / RPG Hero')}</option>
                    <option value="Epic Cinematic (Marvel style, Bold, Superhero flair)">{t('Cinematic / Superhero')}</option>
                    <option value="Jedi / Zen Master (Wise, calm, Star Wars style)">{t('Jedi Master')}</option>
                    <option value="Write the cover letter with extreme suspense and mystery. Act as if your resume is deliberately vague to keep them guessing. Promise them that you are the 'chef's surprise' and that they will be pleasantly shocked when they finally meet you in an interview. Build dramatic tension, use cliffhangers, and act like hiring you is unlocking a legendary secret character.">{t('Mysterious / Suspenseful')}</option>
                    <option value="Speak as someone who is brutally honest and only applying for this job because they need money to pay bills, buy things, and survive. Make zero effort to pretend you are passionate about the company or the role itself. Be extremely direct about the fact that you will work hard solely because you need the paycheck.">{t('Brutally Honest (Need Money)')}</option>
                    <option value="Speak exactly like a very imaginative, enthusiastic 5-year-old child. Use very simple words, talk about your toys or mommy/daddy, and use childish logic to explain why you are good for the job. Do not be professional.">{t('5-Year-Old Child')}</option>
                  </optgroup>
                  <optgroup label={t('Generations')}>
                    <option value="Write the cover letter as an extreme stereotype of a Baby Boomer. Use ALL CAPS randomly, double spaces after periods, and sign off with 'Sent from my iPad'. Constantly mention how hard you worked for 40 years, complain about 'kids today' not wanting to work, demand a 'firm handshake', emphasize traditional 9-to-5 office hours, and complain about remote work.">{t('Boomer')}</option>
                    <option value="Write the cover letter as an extreme stereotype of Generation X. Be incredibly cynical, sarcastic, and apathetic. Mention surviving without the internet, latchkey kid independence, grunge music, MTV, and how nobody ever remembers Gen X exists. Show zero corporate enthusiasm ('whatever') but prove you are highly competent.">{t('Gen X')}</option>
                    <option value="Write the cover letter as an extreme stereotype of a Millennial. Start by apologizing for no reason. Talk about your anxiety, imposter syndrome, therapy, Hogwarts houses, avocado toast, and fur-babies. Use phrases like 'I did a thing', 'adulting is hard', 'living my best life'. Emphasize 'company culture' over salary.">{t('Millennial')}</option>
                    <option value="Write the cover letter as an extreme stereotype of Gen Z. Use an overwhelming amount of Gen Z TikTok slang: 'no cap', 'fr fr', 'bet', 'slay', 'main character energy', 'sus', 'red flag', 'lowkey'. Refuse to work past 5 PM to protect your 'peace' and 'boundaries'. Mention your side hustle and astrology sign.">{t('Gen Z')}</option>
                    <option value="Write the cover letter as an extreme stereotype of an iPad Kid / Gen Alpha. This should be pure brainrot. Overload the letter with 'skibidi toilet', 'rizz', 'sigma male', 'gyat', 'fanum tax', 'mewing', 'Ohio'. Have zero attention span, mention watching Subway Surfers gameplay while writing this. It should look like a chaotic Twitch chat.">{t('Gen Alpha')}</option>
                  </optgroup>
                  <optgroup label={t('Custom')}>
                    <option value="CloneStyle">{t('My Own Style')}</option>
                  </optgroup>
                </select>
              </div>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-ruler-combined"></i> {t('Length')}
                </label>
                <div className="cl-segment-group">
                  <button 
                    type="button"
                    className={`cl-segment-btn ${clLength === 'Concise' ? 'active' : ''}`}
                    onClick={() => setClLength('Concise')}
                    data-tooltip={language === 'fr' ? 'Lettre directe et synthétique (~200 mots)' : 'Short & direct letter (~200 words)'}
                  >{language === 'fr' ? 'Concise' : 'Concise'}</button>
                  <button 
                    type="button"
                    className={`cl-segment-btn ${clLength === 'Standard' ? 'active' : ''}`}
                    onClick={() => setClLength('Standard')}
                    data-tooltip={language === 'fr' ? 'Format optimal recommandé par les RH (~260 mots, <300 mots - Étude SHRM)' : 'Optimal HR recommended format (~260 words, <300 words - SHRM Study)'}
                  >{language === 'fr' ? 'Standard' : 'Standard'}</button>
                  <button 
                    type="button"
                    className={`cl-segment-btn ${clLength === 'Detailed' ? 'active' : ''}`}
                    onClick={() => setClLength('Detailed')}
                    data-tooltip={language === 'fr' ? 'Lettre complète au seuil maximal (~300 mots - Limite de lisibilité RH)' : 'Detailed letter at upper threshold (~300 words - HR readability limit)'}
                  >{language === 'fr' ? 'Détaillée' : 'Detailed'}</button>
                </div>
              </div>

              {tone === 'CloneStyle' && (
                <div className="cl-form-group" style={{ marginBottom: 0 }}>
                  <label className="cl-label" style={{ fontSize: '11px' }}>
                    <i className="fi fi-rr-copy"></i> {t('Reference Letter')}
                  </label>
                  <textarea
                    className="resume-input cl-textarea"
                    style={{ minHeight: '90px', resize: 'vertical', fontSize: '12px' }}
                    placeholder={t('Paste your past cover letter here so the AI can clone your unique writing style...')}
                    value={referenceLetter}
                    onChange={(e) => setReferenceLetter(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* CARD 3: Mise en page */}
            <div className="cl-section-card">
              <span className="cl-section-title">🎨 {language === 'fr' ? 'Police & Texting' : 'Document Typography'}</span>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-text"></i> {t('Font Family')}
                </label>
                <select className="resume-input cl-input" value={clFontFamily} onChange={e => setClFontFamily(e.target.value)} style={{ padding: '8px 10px', fontSize: '12px' }}>
                  <option value="Inter">Inter (Modern Clean)</option>
                  <option value="Roboto">Roboto (Technical)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                  <option value="'Merriweather', serif">Merriweather (Classic Editorial)</option>
                  <option value="'Lora', serif">Lora (Refined Book)</option>
                  <option value="'Fira Code', monospace">Fira Code (Tech / Code)</option>
                </select>
              </div>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span><i className="fi fi-rr-text-size"></i> {t('Font Size')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{clFontSize}pt</span>
                </label>
                <input type="range" min="8" max="14" step="0.5" value={clFontSize} onChange={e => setClFontSize(Number(e.target.value))} />
              </div>

              <div className="cl-form-group" style={{ marginBottom: 0 }}>
                <label className="cl-label" style={{ fontSize: '11px' }}>
                  <i className="fi fi-rr-bold"></i> {language === 'fr' ? 'Style des termes en gras' : 'Bold Highlight Style'}
                </label>
                <div className="cl-segment-group">
                  <button 
                    type="button"
                    className={`cl-segment-btn ${boldStyle === 'standard' ? 'active' : ''}`}
                    onClick={() => setBoldStyle('standard')}
                  >
                    ⬛ {language === 'fr' ? 'Standard (Noir)' : 'Standard (Dark)'}
                  </button>
                  <button 
                    type="button"
                    className={`cl-segment-btn ${boldStyle === 'accent' ? 'active' : ''}`}
                    onClick={() => setBoldStyle('accent')}
                    style={{
                      color: boldStyle === 'accent' ? 'var(--color-accent)' : undefined,
                      fontWeight: boldStyle === 'accent' ? 700 : 500
                    }}
                  >
                    🎨 {language === 'fr' ? 'Couleur Accent' : 'Accent Color'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="cl-error-banner">
                <i className="fi fi-rr-exclamation"></i> {error}
              </div>
            )}

            {isResumeEmpty && (
              <div className="cl-error-banner" style={{ backgroundColor: 'var(--color-warning-light, #fff3cd)', color: 'var(--color-warning-dark, #856404)', borderColor: 'rgba(133, 100, 4, 0.2)' }}>
                <i className="fi fi-rr-info"></i> {t('Your resume is currently empty. Please fill out your experiences and skills before generating a personalized cover letter.')}
              </div>
            )}
          </div>

          {/* Sticky Bottom Action */}
          <div className="cl-sidebar-footer">
            <button 
              type="button"
              className="cl-generate-btn-primary" 
              onClick={handleGenerate}
              disabled={!jobDescription.trim() || isGenerating || isResumeEmpty}
              data-tooltip={language === 'fr' ? 'Générer la lettre sur-mesure par IA (Gemini)' : 'Generate tailored cover letter via Gemini AI'}
              data-tooltip-pos="top"
            >
              {isGenerating ? (
                <><i className="fi fi-rr-spinner cl-spin"></i> {t('Generating Magic...')}</>
              ) : (
                <><i className="fi fi-rr-magic-wand"></i> {language === 'fr' ? 'Générer la Lettre par IA' : 'Generate Cover Letter'}</>
              )}
            </button>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textAlign: 'center', display: 'block' }}>Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Right Panel: Clean WYSIWYG Live Editor */}
        <div className="cl-preview-area" style={{ position: 'relative' }} ref={previewRef}>
          {(isGenerating || isBoldifying) && (
            <div className="cl-loading-overlay">
              <div className="cl-loading-card">
                <div className="cl-loading-spinner-ring"></div>
                <div className="cl-loading-content">
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {language === 'fr' ? 'Génération IA en cours...' : 'AI Generation in Progress...'}
                  </h4>
                  <p style={{ margin: '6px 0 14px 0', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
                    {generationStep || (language === 'fr' ? '⚡ Connexion aux serveurs Gemini...' : '⚡ Connecting to Gemini AI...')}
                  </p>

                  <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${generationProgress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--color-accent), #818cf8)', 
                        borderRadius: '10px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'block' }}>
                    {generationProgress}% • {language === 'fr' ? 'Vous pouvez naviguer, la tâche se poursuit en arrière-plan.' : 'You can navigate away, task runs in background.'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="cl-toolbar" style={{ flexWrap: 'wrap', gap: '6px' }}>
            {/* Undo / Redo Buttons */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{ padding: '6px 10px', opacity: historyIndex <= 0 ? 0.4 : 1 }}
              data-tooltip={language === 'fr' ? 'Annuler la dernière modification (Cmd+Z)' : 'Undo last change (Cmd+Z)'}
              data-tooltip-pos="bottom"
            >
              ↩️ {t('Undo')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{ padding: '6px 10px', opacity: historyIndex >= history.length - 1 ? 0.4 : 1 }}
              data-tooltip={language === 'fr' ? 'Rétablir la dernière modification (Cmd+Shift+Z)' : 'Redo change (Cmd+Shift+Z)'}
              data-tooltip-pos="bottom"
            >
              ↪️ {t('Redo')}
            </button>

            <span style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 4px' }} />

            {/* Direct Bold Button for selected word/text */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleManualBoldClick}
              style={{ padding: '6px 12px', fontWeight: 'bold' }}
              data-tooltip={language === 'fr' ? 'Mettre en gras le texte sélectionné (Cmd+B)' : 'Bold selected text (Cmd+B)'}
              data-tooltip-pos="bottom"
            >
              <b>B</b> {t('Bold')}
            </button>

            <button 
              className="btn-secondary" 
              onClick={handleBoldify} 
              disabled={!coverLetter || isBoldifying} 
              style={{ opacity: !coverLetter ? 0.5 : 1 }}
              data-tooltip={language === 'fr' ? 'IA : Mettre en valeur automatiquement les mots-clés stratégiques' : 'AI: Highlight strategic skills & keywords'}
              data-tooltip-pos="bottom"
            >
              {isBoldifying ? (
                <><i className="fi fi-rr-spinner cl-spin"></i> {t('Bolding...')}</>
              ) : (
                <><i className="fi fi-rr-star"></i> {t('Smart Bold')}</>
              )}
            </button>

            {/* Bold Style Accent Toggle */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setBoldStyle(prev => prev === 'accent' ? 'standard' : 'accent')}
              data-tooltip={language === 'fr' ? 'Basculer le style du gras : Noir Standard ou Couleur Accent' : 'Toggle bold style: Standard Dark or Accent Color'}
              data-tooltip-pos="bottom"
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                color: boldStyle === 'accent' ? 'var(--color-accent)' : 'var(--color-text)',
                borderColor: boldStyle === 'accent' ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: boldStyle === 'accent' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                fontWeight: 600
              }}
            >
              🎨 {boldStyle === 'accent' ? (language === 'fr' ? 'Gras Accent' : 'Accent Bold') : (language === 'fr' ? 'Gras Standard' : 'Standard Bold')}
            </button>

            {hasBoldMarkers && (
              <button 
                className="btn-secondary" 
                onClick={handleRemoveBold} 
                data-tooltip={language === 'fr' ? 'Effacer toutes les mises en gras' : 'Remove all bold formatting'}
                data-tooltip-pos="bottom"
              >
                <i className="fi fi-rr-eraser"></i> {t('Remove Bold')}
              </button>
            )}

            <button 
              className="btn-secondary" 
              onClick={handlePrint} 
              disabled={!coverLetter} 
              style={{ opacity: !coverLetter ? 0.5 : 1 }}
              data-tooltip={language === 'fr' ? 'Télécharger la lettre au format PDF impression' : 'Export letter as PDF'}
              data-tooltip-pos="bottom"
            >
              <i className="fi fi-rr-print"></i> {t('Export PDF')}
            </button>

            <button 
              className="btn-secondary" 
              onClick={handleExportWord} 
              disabled={!coverLetter} 
              style={{ opacity: !coverLetter ? 0.5 : 1 }}
              data-tooltip={language === 'fr' ? 'Télécharger au format Word (.docx)' : 'Export as Word (.docx)'}
              data-tooltip-pos="bottom"
            >
              <i className="fi fi-rr-document-signed"></i> {t('Export Word')}
            </button>

            <button 
              className="btn-secondary" 
              onClick={() => coverLetter && navigator.clipboard.writeText(coverLetter)} 
              disabled={!coverLetter} 
              style={{ opacity: !coverLetter ? 0.5 : 1 }}
              data-tooltip={language === 'fr' ? 'Copier le texte dans le presse-papier' : 'Copy text to clipboard'}
              data-tooltip-pos="bottom"
            >
              <i className="fi fi-rr-copy"></i> {t('Copy')}
            </button>

            {/* Scientific RH Word Count Indicator */}
            {coverLetter && coverLetter.trim().length > 0 && (() => {
              const count = coverLetter.trim().replace(/\*\*/g, '').split(/\s+/).filter(Boolean).length;
              const isOptimal = count <= 300;
              return (
                <div style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: isOptimal ? 'var(--color-accent)' : '#E53E3E',
                  backgroundColor: 'var(--color-bg)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: `1px solid ${isOptimal ? 'var(--color-border)' : '#FEB2B2'}`
                }}>
                  <span>📝 {count} {language === 'fr' ? 'mots' : 'words'}</span>
                  <span style={{ fontSize: '10px', opacity: 0.9 }}>
                    {isOptimal 
                      ? (language === 'fr' ? '• Optimal RH (<300)' : '• HR Optimal (<300)')
                      : (language === 'fr' ? '• ⚠️ SHRM: >300 mots (-83% de lecture)' : '• ⚠️ SHRM: >300 words (-83% reading rate)')}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Dynamic Bold Style Rule */}
          <style>{`
            .cl-a4-paper strong, .cl-a4-paper b, .cl-a4-paper span[style*="font-weight: bold"], .cl-a4-paper span[style*="font-weight: 700"] {
              color: ${boldStyle === 'accent' ? 'var(--color-accent, #6366f1)' : 'inherit'} !important;
              font-weight: 700 !important;
            }
          `}</style>

          {/* Clean Direct WYSIWYG A4 Editor Paper - Automatically Theme Synchronized */}
          <div 
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="cl-a4-paper print-hidden"
            style={{ 
              minHeight: '60vh', 
              fontFamily: clFontFamily, 
              fontSize: `${clFontSize}pt`, 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              lineHeight: '1.6',
              padding: '32px',
              outline: 'none',
              cursor: 'text'
            }}
            onInput={handleEditorInput}
          />

          <div 
            className="cl-a4-paper print-only" 
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: clFontFamily, fontSize: `${clFontSize}pt` }}
            dangerouslySetInnerHTML={{ 
              __html: textToHtml(coverLetter)
            }}
          />
        </div>
      </div>
    </div>
  );
}
