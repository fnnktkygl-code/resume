import React, { useState, useRef, useEffect } from 'react';
import { importResumeWithProxy } from '../../services/geminiService';
import { useTranslation } from '../../utils/TranslationContext';
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
          <button className="modal-close" onClick={onClose} disabled={isProcessing} aria-label={t('Close')}>
            <i className="fi fi-rr-cross"></i>
          </button>
        
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t('Import CV')}</span>
            <span style={{ fontSize: '18px' }}>🪄</span>
          </h2>
          
          {error && <div className="modal-error"><i className="fi fi-rr-exclamation"></i> {error}</div>}

          <div className="import-methods">
            <p className="modal-description" style={{ marginBottom: '16px', color: 'var(--color-text-secondary)', fontSize: '13.5px', lineHeight: '1.45' }}>
              {t('Upload your existing CV or paste its content. Our AI will automatically extract your information and format it to perfection.')}
            </p>
            
            {!textMode ? (
              <>
                <div 
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: dragActive ? 'var(--color-surface-alt)' : 'transparent',
                    borderColor: dragActive ? 'var(--color-accent)' : 'var(--color-border)'
                  }}
                >
                  <i className="fi fi-rr-document" style={{ fontSize: '2.2rem', color: 'var(--color-accent)', marginBottom: '12px', display: 'block' }}></i>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text)' }}>
                    {t('Click to upload or drag and drop')}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
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
                
                <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                  {t('OR')}
                </div>
                
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
                  onClick={() => setTextMode(true)}
                >
                  <i className="fi fi-rr-text" style={{ marginRight: '6px' }}></i> {t('Paste Raw Text Instead')}
                </button>
              </>
            ) : (
              <div className="text-import-mode">
                <textarea
                  className="input-field"
                  placeholder={t('Paste your entire resume text here...')}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  style={{ minHeight: '180px', resize: 'vertical', width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', marginBottom: '14px' }}
                />
                <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setTextMode(false)} style={{ flex: 1, padding: '10px 14px' }}>
                    {t('Back')}
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={handleTextSubmit} 
                    disabled={!rawText.trim()}
                    style={{ flex: 2, padding: '10px 14px' }}
                  >
                    {t('Import via Text')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
