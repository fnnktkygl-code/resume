import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateCoverLetterWithProxy, boldifyCoverLetterWithProxy } from '../../services/geminiService';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function CoverLetterModal({ isOpen, onClose, data, dispatch, onLanguageChange }) {
  const { t, language } = useTranslation();
  const defaultFontFamily = data?.layout?.fontFamily || 'Inter';
  const defaultFontSize = data?.layout?.fontSize || 10.5;

  const [jobDescription, setJobDescription] = useState(data?.targetJobDescription || '');
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [referenceLetter, setReferenceLetter] = useState('');
  const [industry, setIndustry] = useState('General');
  const [tone, setTone] = useState('Professional');
  const [clLength, setClLength] = useState('Standard');
  const [clFontFamily, setClFontFamily] = useState(defaultFontFamily);
  const [clFontSize, setClFontSize] = useState(defaultFontSize);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const [isBoldifying, setIsBoldifying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Undo / Redo History State
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const previewRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (data?.layout?.fontFamily) setClFontFamily(data.layout.fontFamily);
    if (data?.layout?.fontSize) setClFontSize(data.layout.fontSize);
  }, [data?.layout?.fontFamily, data?.layout?.fontSize]);

  useEffect(() => {
    if (isOpen && data?.targetJobDescription) {
      setJobDescription(data.targetJobDescription);
    }
  }, [isOpen, data?.targetJobDescription]);

  // Modal lifecycle & ESC key / Popstate
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-cover-letter');
      document.body.style.overflow = 'hidden';

      const stateId = Math.random().toString(36).substring(2, 9);
      window.history.pushState({ modalId: stateId }, '');

      const handlePopState = (e) => {
        if (!e.state || e.state.modalId !== stateId) {
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.classList.remove('print-cover-letter');
        document.body.style.overflow = '';
        window.removeEventListener('popstate', handlePopState);
        
        if (window.history.state && window.history.state.modalId === stateId) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);

  // Proactive Header Injection & Placeholder Replacement Helper
  const autoInjectHeaderInfo = useCallback((text) => {
    if (!text) return text;
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
  const updateLetterContent = (newText, clearHistory = false) => {
    const formatted = autoInjectHeaderInfo(newText);
    setCoverLetter(formatted);

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
  };

  const applyManualBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === undefined || end === undefined || start === end) {
      return;
    }

    const val = coverLetter || '';
    const selectedText = val.substring(start, end);
    const isBold = val.substring(start - 2, start) === '**' && val.substring(end, end + 2) === '**';

    let newValue, newCursorPos;
    if (isBold) {
      newValue = val.substring(0, start - 2) + selectedText + val.substring(end + 2);
      newCursorPos = start + selectedText.length - 2;
    } else {
      newValue = val.substring(0, start) + '**' + selectedText + '**' + val.substring(end);
      newCursorPos = start + selectedText.length + 2;
    }

    updateLetterContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCoverLetter(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCoverLetter(history[nextIndex]);
    }
  };

  // Keyboard shortcut listener for Cmd+Z (Undo) and Cmd+Shift+Z / Cmd+Y (Redo)
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
    setError(null);

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
      const result = await generateCoverLetterWithProxy(data, combinedPrompt, language);
      updateLetterContent(result, true);
      
      if (window.innerWidth <= 768 && previewRef.current) {
        setTimeout(() => {
          previewRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err.message || t('An error occurred during generation.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBoldify = async () => {
    if (!coverLetter || isBoldifying) return;
    setIsBoldifying(true);
    setError(null);
    try {
      const result = await boldifyCoverLetterWithProxy(coverLetter, jobDescription);
      updateLetterContent(result);
    } catch (err) {
      setError(err.message || t('An error occurred during boldification.'));
    } finally {
      setIsBoldifying(false);
    }
  };

  const handleRemoveBold = () => {
    if (!coverLetter) return;
    updateLetterContent(coverLetter.replace(/\*\*/g, ''));
  };

  const hasBoldMarkers = coverLetter.includes('**');

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
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        for (const part of parts) {
          if (part.startsWith('**') && part.endsWith('**')) {
            runs.push(new TextRun({
              text: part.slice(2, -2),
              font: wordFont,
              size: wordSize,
              bold: true,
            }));
          } else if (part) {
            runs.push(new TextRun({
              text: part,
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
        <button className="cl-close-btn" onClick={onClose}>
          <i className="fi fi-rr-cross"></i> {t('Close Workspace')}
        </button>
      </div>

      <div className="cl-workspace-main">
        {/* Left Panel: Settings */}
        <div className="cl-sidebar">
          <div className="cl-sidebar-header">
            <h3>{t('Content Settings')}</h3>
            <p>{t('Details to tailor your cover letter.')}</p>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-globe"></i> {t('Language')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`control-btn ${language === 'en' ? 'active' : ''}`} 
                onClick={() => onLanguageChange && onLanguageChange('en')} 
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >EN</button>
              <button 
                className={`control-btn ${language === 'fr' ? 'active' : ''}`} 
                onClick={() => onLanguageChange && onLanguageChange('fr')} 
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >FR</button>
              <button 
                className={`control-btn ${language === 'es' ? 'active' : ''}`} 
                onClick={() => onLanguageChange && onLanguageChange('es')} 
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >ES</button>
            </div>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-chart-network"></i> {t('Industry')}
            </label>
            <select className="resume-input cl-input" value={industry} onChange={e => setIndustry(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
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

          <div className="cl-form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ flex: '1 1 130px', minWidth: 0 }}>
              <label className="cl-label">
                <i className="fi fi-rr-building"></i> {t('Company')} <span style={{ fontSize: '0.8em', color: 'var(--color-text-tertiary)', fontWeight: 'normal' }}>({t('Optional')})</span>
              </label>
              <input 
                type="text" 
                className="resume-input cl-input" 
                placeholder={t('e.g. Google')}
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 130px', minWidth: 0 }}>
              <label className="cl-label" style={{ whiteSpace: 'nowrap' }}>
                <i className="fi fi-rr-briefcase"></i> {t('Role')} <span style={{ fontSize: '0.8em', color: 'var(--color-text-tertiary)', fontWeight: 'normal' }}>({t('Optional')})</span>
              </label>
              <input 
                type="text" 
                className="resume-input cl-input" 
                placeholder={t('e.g. Frontend')}
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t('Target Job Description')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <textarea
              ref={textareaRef}
              className="form-input"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (dispatch) {
                  dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: e.target.value });
                }
              }}
              placeholder={t('Paste the job description here so the AI can tailor the letter...')}
              rows={4}
            />
          </div>

          <div className="cl-form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ flex: '1 1 130px', minWidth: 0 }}>
              <label className="cl-label">
                <i className="fi fi-rr-microphone"></i> {t('Tone')}
              </label>
              <select className="resume-input cl-input" value={tone} onChange={e => setTone(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
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
            <div style={{ flex: '1 1 130px', minWidth: 0 }}>
              <label className="cl-label">
                <i className="fi fi-rr-ruler-combined"></i> {t('Length')}
              </label>
              <select className="resume-input cl-input" value={clLength} onChange={e => setClLength(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
                <option value="Concise">{t('Concise')}</option>
                <option value="Standard">{t('Standard')}</option>
                <option value="Detailed">{t('Detailed')}</option>
              </select>
            </div>
          </div>

          {tone === 'CloneStyle' && (
            <div className="cl-form-group">
              <label className="cl-label">
                <i className="fi fi-rr-copy"></i> {t('Reference Letter')}
              </label>
              <textarea
                className="resume-input cl-textarea"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder={t('Paste your past cover letter here so the AI can clone your unique writing style...')}
                value={referenceLetter}
                onChange={(e) => setReferenceLetter(e.target.value)}
              />
            </div>
          )}

          <hr style={{ borderColor: 'var(--color-border)', margin: '4px 0' }} />

          <div className="cl-sidebar-header">
            <h3>{t('Layout & Formatting')}</h3>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-text"></i> {t('Font Family')}
            </label>
            <select className="resume-input cl-input" value={clFontFamily} onChange={e => setClFontFamily(e.target.value)} style={{ fontFamily: 'inherit' }}>
              <option value="Inter">{t('Classic Sans (Inter)')}</option>
              <option value="Roboto, sans-serif">{t('Clean Sans (Roboto)')}</option>
              <option value="Open Sans, sans-serif">{t('Friendly Sans (Open Sans)')}</option>
              <option value="Lato, sans-serif">{t('Warm Sans (Lato)')}</option>
              <option value="Outfit, sans-serif">{t('Modern Geometric (Outfit)')}</option>
              <option value="Fraunces, Georgia, serif">{t('Elegant Serif (Fraunces)')}</option>
              <option value="Lora, serif">{t('Readable Serif (Lora)')}</option>
              <option value="Merriweather, serif">{t('Sturdy Serif (Merriweather)')}</option>
              <option value="JetBrains Mono, monospace">{t('Modern Mono (JetBrains)')}</option>
            </select>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-text-size"></i> {t('Font Size')}: {clFontSize}pt
            </label>
            <input type="range" min="8" max="14" step="0.5" value={clFontSize} onChange={e => setClFontSize(Number(e.target.value))} />
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

          <div className="cl-action-container">
            <button 
              type="button"
              className="btn-primary cl-generate-btn" 
              onClick={handleGenerate}
              disabled={!jobDescription.trim() || isGenerating || isResumeEmpty}
            >
              {isGenerating ? (
                <><i className="fi fi-rr-spinner cl-spin"></i> {t('Generating Magic...')}</>
              ) : (
                <><i className="fi fi-rr-magic-wand"></i> {t('Generate Cover Letter')}</>
              )}
            </button>
            <span className="cl-powered-by">Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Right Panel: Live Preview & Editor */}
        <div className="cl-preview-area" ref={previewRef}>
          <div className="cl-toolbar" style={{ flexWrap: 'wrap', gap: '6px' }}>
            {/* Undo / Redo Buttons */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{ padding: '6px 10px', opacity: historyIndex <= 0 ? 0.4 : 1 }}
              title={t('Undo (Cmd+Z)')}
            >
              ↩️ {t('Undo')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{ padding: '6px 10px', opacity: historyIndex >= history.length - 1 ? 0.4 : 1 }}
              title={t('Redo (Cmd+Shift+Z)')}
            >
              ↪️ {t('Redo')}
            </button>

            <span style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 4px' }} />

            {/* Edit / Preview Mode Toggle */}
            <button
              type="button"
              className={`btn-secondary ${isEditMode ? 'active' : ''}`}
              onClick={() => setIsEditMode(!isEditMode)}
              style={{ padding: '6px 10px' }}
            >
              {isEditMode ? `👁️ ${t('Preview Mode')}` : `✍️ ${t('Edit Text')}`}
            </button>

            {/* Manual Bold Button for selected word/text */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!isEditMode) setIsEditMode(true);
                setTimeout(applyManualBold, 50);
              }}
              style={{ padding: '6px 12px', fontWeight: 'bold' }}
              title={t('Bold Selected Text (Cmd+B)')}
            >
              <b>B</b> {t('Bold')}
            </button>

            <button 
              className="btn-secondary" 
              onClick={handleBoldify} 
              disabled={!coverLetter || isBoldifying} 
              style={{ opacity: !coverLetter ? 0.5 : 1 }}
            >
              {isBoldifying ? (
                <><i className="fi fi-rr-spinner cl-spin"></i> {t('Bolding...')}</>
              ) : (
                <><i className="fi fi-rr-star"></i> {t('Smart Bold')}</>
              )}
            </button>

            {hasBoldMarkers && (
              <button className="btn-secondary" onClick={handleRemoveBold} title={t('Remove all bold formatting')}>
                <i className="fi fi-rr-eraser"></i> {t('Remove Bold')}
              </button>
            )}

            <button className="btn-secondary" onClick={handlePrint} disabled={!coverLetter} style={{ opacity: !coverLetter ? 0.5 : 1 }}>
              <i className="fi fi-rr-print"></i> {t('Export PDF')}
            </button>

            <button className="btn-secondary" onClick={handleExportWord} disabled={!coverLetter} style={{ opacity: !coverLetter ? 0.5 : 1 }}>
              <i className="fi fi-rr-document-signed"></i> {t('Export Word')}
            </button>

            <button className="btn-secondary" onClick={() => coverLetter && navigator.clipboard.writeText(coverLetter)} disabled={!coverLetter} style={{ opacity: !coverLetter ? 0.5 : 1 }}>
              <i className="fi fi-rr-copy"></i> {t('Copy')}
            </button>
          </div>

          {isEditMode ? (
            <textarea
              ref={textareaRef}
              className="cl-a4-paper print-hidden"
              style={{
                minHeight: '60vh',
                fontFamily: clFontFamily,
                fontSize: `${clFontSize}pt`,
                width: '100%',
                padding: '24px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                lineHeight: '1.6'
              }}
              value={coverLetter}
              onChange={(e) => updateLetterContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                  e.preventDefault();
                  applyManualBold();
                }
              }}
              placeholder={t('Type or edit your cover letter text here...')}
            />
          ) : (
            <div 
              className="cl-a4-paper print-hidden"
              style={{ 
                minHeight: '60vh', 
                fontFamily: clFontFamily, 
                fontSize: `${clFontSize}pt`, 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word',
                lineHeight: '1.6',
                padding: '24px'
              }}
              dangerouslySetInnerHTML={{ 
                __html: coverLetter 
                  ? coverLetter
                      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>')
                  : '\u200B' 
              }}
            />
          )}

          <div 
            className="cl-a4-paper print-only" 
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: clFontFamily, fontSize: `${clFontSize}pt` }}
            dangerouslySetInnerHTML={{ 
              __html: coverLetter 
                ? coverLetter
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>')
                : '' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
