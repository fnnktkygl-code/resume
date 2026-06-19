import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateCoverLetterWithProxy } from '../../services/geminiService';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function CoverLetterModal({ isOpen, onClose, data, onLanguageChange }) {
  const { t, language } = useTranslation();
  const defaultFontFamily = data?.layout?.fontFamily || 'Inter';
  const defaultFontSize = data?.layout?.fontSize || 10.5;

  const [jobDescription, setJobDescription] = useState('');
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
  const previewRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (data?.layout?.fontFamily) setClFontFamily(data.layout.fontFamily);
    if (data?.layout?.fontSize) setClFontSize(data.layout.fontSize);
  }, [data?.layout?.fontFamily, data?.layout?.fontSize]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [coverLetter]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-cover-letter');
    } else {
      document.body.classList.remove('print-cover-letter');
    }
    return () => document.body.classList.remove('print-cover-letter');
  }, [isOpen]);

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
      setCoverLetter(result);
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    if (!coverLetter) return;
    try {
      const wordFont = clFontFamily.split(',')[0].replace(/['"]/g, '').trim();
      const wordSize = Math.round(clFontSize * 2);

      const paragraphs = coverLetter.split('\n').map(line => {
        return new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: wordFont,
              size: wordSize,
            }),
          ],
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

          {/* Language Selector inside Modal for Mobile/Convenience */}
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

          <div className="cl-form-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
              <label className="cl-label">
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

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-document-signed"></i> {t('Job Description')}
            </label>
            <textarea
              className="resume-input cl-textarea"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder={t('Paste the full job description here...')}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="cl-form-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <div style={{ flex: 1 }}>
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
                  <option value="Speak as someone who is brutally honest and only applying for this job because they need money to pay bills, buy things, and survive. Make zero effort to pretend you are passionate about the company or the role itself. Be extremely direct about the fact that you will work hard solely because you need the paycheck.">{t('Brutally Honest (Need Money)')}</option>
                  <option value="Speak exactly like a very imaginative, enthusiastic 5-year-old child. Use very simple words, talk about your toys or mommy/daddy, and use childish logic to explain why you are good for the job. Do not be professional.">{t('5-Year-Old Child')}</option>
                </optgroup>
                <optgroup label={t('Generations')}>
                  <option value="Speak exactly like a stereotypical Baby Boomer. Emphasize hard work, pulling yourself up by your bootstraps, company loyalty, and traditional workplace values. Complain slightly about technology or younger generations' work ethic, and use slightly outdated corporate jargon.">{t('Boomer')}</option>
                  <option value="Speak exactly like a stereotypical Millennial. Mention work-life balance, imposter syndrome, or 'adulting'. Use terms like 'doggo', 'aesthetic', or 'vibes'. Show a mix of existential dread and over-enthusiasm for perks like bean bag chairs and cold brew.">{t('Millennial')}</option>
                  <option value="Speak exactly like a stereotypical Gen Z person. Use heavy modern slang like 'no cap', 'fr fr', 'bet', 'slay', 'main character energy', 'sus', and 'lit'. Focus on mental health, boundaries, side hustles, and being chronically online.">{t('Gen Z')}</option>
                  <option value="Speak exactly like a stereotypical iPad kid / Gen Alpha. Use hyper-specific internet slang like 'skibidi toilet', 'rizz', 'sigma', 'gyat', 'fanum tax'. Have an insanely short attention span and talk about iPad, Roblox, or TikTok.">{t('Gen Alpha')}</option>
                </optgroup>
                <optgroup label={t('Custom')}>
                  <option value="CloneStyle">{t('My Own Style')}</option>
                </optgroup>
              </select>
            </div>
            <div style={{ flex: 1 }}>
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

        {/* Right Panel: Live Preview */}
        <div className="cl-preview-area" ref={previewRef}>
          <div className="cl-toolbar">
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

          <textarea 
            ref={textareaRef}
            className="cl-a4-paper print-hidden"
            style={{ overflow: 'hidden', minHeight: '60vh', fontFamily: clFontFamily, fontSize: `${clFontSize}pt` }}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder={t('Edit directly on the page...')}
          />
          <div className="cl-a4-paper print-only" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: clFontFamily, fontSize: `${clFontSize}pt` }}>
            {coverLetter}
          </div>
        </div>
      </div>
    </div>
  );
}
