import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateCoverLetterWithProxy } from '../../services/geminiService';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function CoverLetterModal({ isOpen, onClose, data }) {
  const { t, language } = useTranslation();
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const previewRef = useRef(null);
  const textareaRef = useRef(null);

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
      const combinedPrompt = `${jobDescription}\n\nCompany Name: ${companyName}\nTarget Role: ${targetRole}\nTone: ${tone}`;
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
      const paragraphs = coverLetter.split('\n').map(line => {
        return new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Times New Roman",
              size: 22,
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
            <h3>{t('Job Details')}</h3>
            <p>{t('Fill in the specifics below. Our AI will automatically tailor your cover letter using your resume data.')}</p>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-building"></i> {t('Company Name')}
            </label>
            <input 
              type="text" 
              className="resume-input cl-input" 
              placeholder={t('e.g. Google')}
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-briefcase"></i> {t('Target Role')}
            </label>
            <input 
              type="text" 
              className="resume-input cl-input" 
              placeholder={t('e.g. Frontend Engineer')}
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-document-signed"></i> {t('Job Description')}
            </label>
            <textarea
              className="resume-input cl-textarea"
              style={{ minHeight: '160px', resize: 'vertical' }}
              placeholder={t('Paste the full job description here...')}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <span className="cl-help-text">{t('The AI uses this to match your skills with their requirements.')}</span>
          </div>

          <div className="cl-form-group">
            <label className="cl-label">
              <i className="fi fi-rr-microphone"></i> {t('Tone of Voice')}
            </label>
            <select className="resume-input cl-input" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="Professional">{t('Professional & Polished')}</option>
              <option value="Confident">{t('Confident & Direct')}</option>
              <option value="Enthusiastic">{t('Enthusiastic & Passionate')}</option>
            </select>
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
            style={{ overflow: 'hidden', minHeight: '60vh' }}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder={t('Edit directly on the page...')}
          />
          <div className="cl-a4-paper print-only" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {coverLetter}
          </div>
        </div>
      </div>
    </div>
  );
}
