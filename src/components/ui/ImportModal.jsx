import React, { useState, useRef, useEffect } from 'react';
import { importResumeWithProxy } from '../../services/geminiService';
import { useTranslation } from '../../utils/TranslationContext';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Summary post-import verification states
  const [extractedSummary, setExtractedSummary] = useState(null);
  const [importedData, setImportedData] = useState(null);
  
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      setDragActive(false);
      setTextMode(false);
      setRawText('');
      setIsProcessing(false);
      setError(null);
      setExtractedSummary(null);
      setImportedData(null);
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
      const parsedData = await importResumeWithProxy(payload);
      if (parsedData) {
        // Compute summary counts for the user
        const summary = {
          name: parsedData.personal?.name || '',
          email: parsedData.personal?.email || '',
          experienceCount: parsedData.experience?.length || 0,
          educationCount: parsedData.education?.length || 0,
          skillsCount: parsedData.skills?.technical ? parsedData.skills.technical.split(',').filter(s => s.trim()).length : 0,
        };
        setExtractedSummary(summary);
        setImportedData(parsedData);
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
    if (file.type !== 'application/pdf') {
      setError(t('Please upload a valid PDF file.'));
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('File is too large. Please upload a PDF under 5MB.'));
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const base64Data = await readFileAsBase64(file);
      await processWithAI({ base64Data, mimeType: file.type });
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
    processWithAI({ text: rawText });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>
          <i className="fi fi-rr-cross"></i>
        </button>
        
        <h2 className="modal-title">{t('Import Resume')} 🪄</h2>
        
        {error && <div className="modal-error"><i className="fi fi-rr-exclamation"></i> {error}</div>}

        {isProcessing ? (
          <div className="modal-loading" style={{ margin: '40px 0', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', color: 'var(--color-text-secondary)' }}>{t('AI is reading your resume...')}</p>
          </div>
        ) : extractedSummary ? (
          /* Post-Import Summary & Verification UI */
          <div className="import-summary-view" style={{ textAlign: 'left', marginTop: '10px' }}>
            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.4' }}>
              {t('Here is a summary of the information parsed from your CV by the AI:')}
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              marginBottom: '20px', 
              padding: '14px', 
              backgroundColor: 'var(--color-surface-alt)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>{t('Name')} :</strong>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{extractedSummary.name || t('Not found')}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Email :</strong>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{extractedSummary.email || t('Not found')}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>{t('Experiences')} :</strong>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{extractedSummary.experienceCount}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>{t('Education')} :</strong>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{extractedSummary.educationCount}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>{t('Skills')} :</strong>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{extractedSummary.skillsCount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => {
                  setExtractedSummary(null);
                  setImportedData(null);
                }}
              >
                {t('Restart')}
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, justifyContent: 'center' }}
                onClick={() => {
                  onImportSuccess(importedData);
                  onClose();
                }}
              >
                {t('Verify & Confirm')}
              </button>
            </div>
          </div>
        ) : (
          /* Initial Upload / Paste UI */
          <div className="import-methods">
            <p className="modal-description" style={{ marginBottom: '16px' }}>
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
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: dragActive ? 'var(--color-surface-alt)' : 'transparent',
                    borderColor: dragActive ? 'var(--color-accent)' : 'var(--color-border)'
                  }}
                >
                  <i className="fi fi-rr-document" style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '10px', display: 'block' }}></i>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{t('Click to upload or drag and drop')}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{t('PDF only (max 5MB)')}</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }} 
                  />
                </div>
                
                <div style={{ textAlign: 'center', margin: '14px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>{t('OR')}</div>
                
                <button 
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
                  style={{ minHeight: '180px', resize: 'vertical', width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', marginBottom: '12px' }}
                />
                <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setTextMode(false)} style={{ flex: 1, padding: '10px 14px' }}>
                    {t('Back')}
                  </button>
                  <button 
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
        )}
      </div>
    </div>
  );
}
