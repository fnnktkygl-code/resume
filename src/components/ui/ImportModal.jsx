import React, { useState, useRef, useEffect } from 'react';
import { importResumeWithProxy } from '../../services/geminiService';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';
import AILoadingOverlay from './AILoadingOverlay';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const { t, language } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      setDragActive(false);
      setTextMode(false);
      setRawText('');
      setIsProcessing(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processWithAI = async (payload) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await importResumeWithProxy({ ...payload, language });
      if (result) {
        onImportSuccess(result, result, payload.originalInput || null);
        onClose();
      } else {
        throw new Error(t('Failed to parse resume data.'));
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'QUOTA_EXCEEDED') {
        setError(t('API Quota Exceeded. Please try again later.'));
      } else {
        setError(err.message || t('Error generating tailored content.'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError(t('Please upload a valid PDF file.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('File size exceeds 5MB limit.'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { extractTextFromPDF } = await import('../../utils/pdfExtractor.js');
      const textFromPdf = await extractTextFromPDF(file);

      const base64Data = await readFileAsBase64(file);
      const blobUrl = URL.createObjectURL(file);
      await processWithAI({ 
        base64Data, 
        mimeType: file.type, 
        originalInput: { type: 'pdf', url: blobUrl, text: textFromPdf } 
      });
    } catch (err) {
      setError(t('Failed to process file. Please try text mode.'));
      setIsProcessing(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (!rawText.trim()) {
      setError(t('Please provide some text.'));
      return;
    }
    processWithAI({ text: rawText, originalInput: { type: 'text', text: rawText } });
  };

  return (
    <>
      <AILoadingOverlay 
        isGenerating={isProcessing} 
        title={language === 'fr' ? "Extraction & structuration de votre CV..." : "Parsing & structuring your resume..."}
        initialStep={language === 'fr' ? '⚡ Lecture et mise en page haute fidélité...' : '⚡ Reading and structuring layout...'}
        language={language}
      />
      <Modal 
        isOpen={isOpen} 
        onClose={isProcessing ? undefined : onClose}
        maxWidth="520px"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t('Import CV')}</span>
            <span style={{ fontSize: '18px' }}>🪄</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--color-danger, #EF4444)',
              fontSize: '13px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>
            {t('Upload your existing CV or paste its content. Our AI will automatically extract your information and format it to perfection.')}
          </p>
          
          {!textMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div 
                className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1.5px dashed var(--color-border)',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: dragActive ? 'var(--color-surface-alt)' : 'var(--color-surface-alt, rgba(0,0,0,0.02))',
                  borderColor: dragActive ? 'var(--color-accent)' : 'var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-light, rgba(45, 90, 67, 0.1))',
                  color: 'var(--color-accent, #2D5A43)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--color-text)' }}>
                  {t('Click to upload or drag and drop')}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12.5px', margin: 0 }}>
                  {t('PDF only (max 5MB)')}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }} 
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('OR')}</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              </div>
              
              <button 
                type="button"
                className="btn-secondary" 
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  gap: '8px',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => setTextMode(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
                <span>{t('Paste Raw Text Instead')}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                placeholder={t('Paste your entire resume text here...')}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{
                  minHeight: '180px',
                  resize: 'vertical',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setTextMode(false)} 
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', justifyContent: 'center' }}
                >
                  {t('Back')}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleTextSubmit} 
                  disabled={!rawText.trim()}
                  style={{ flex: 2, padding: '10px 14px', borderRadius: '10px', justifyContent: 'center' }}
                >
                  {t('Import via Text')}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
