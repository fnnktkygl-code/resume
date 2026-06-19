import React, { useState, useRef, useEffect } from 'react';
import { importResumeWithProxy, enhanceResumeWithProxy } from '../../services/geminiService';
import { useTranslation } from '../../utils/TranslationContext';

// Lightweight inline VisualDiff for the import modal
function ImportDiff({ original, modified, selectedChanges, onToggleChange }) {
  const { t } = useTranslation();
  const diffItems = [];

  // Summary
  if (original.summary !== modified.summary && modified.summary) {
    diffItems.push({ id: 'summary', section: t('Professional Summary'), type: 'text', original: original.summary, modified: modified.summary });
  }

  // Skills
  if (original.skills?.technical !== modified.skills?.technical) {
    diffItems.push({ id: 'skills.technical', section: t('Technical Skills'), type: 'text', original: original.skills?.technical, modified: modified.skills?.technical });
  }
  if (original.skills?.soft !== modified.skills?.soft) {
    diffItems.push({ id: 'skills.soft', section: t('Soft Skills'), type: 'text', original: original.skills?.soft, modified: modified.skills?.soft });
  }

  // Experience bullets
  original.experience?.forEach((exp, idx) => {
    const modExp = modified.experience?.[idx];
    if (!modExp) return;
    exp.bullets?.forEach((bullet, bIdx) => {
      const modBullet = modExp.bullets?.[bIdx];
      if (bullet !== modBullet && modBullet) {
        diffItems.push({
          id: `exp.${idx}.bullet.${bIdx}`,
          section: `${exp.company || ''} — ${exp.title || ''}`,
          type: 'bullet',
          original: bullet,
          modified: modBullet
        });
      }
    });
    // New bullets added by AI
    if (modExp.bullets?.length > (exp.bullets?.length || 0)) {
      for (let i = exp.bullets?.length || 0; i < modExp.bullets.length; i++) {
        diffItems.push({
          id: `exp.${idx}.bullet.${i}`,
          section: `${exp.company || ''} — ${exp.title || ''}`,
          type: 'added',
          original: null,
          modified: modExp.bullets[i]
        });
      }
    }
  });

  if (diffItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
        ✅ {t('No major changes detected.')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
      {diffItems.map((item) => {
        const isSelected = selectedChanges[item.id] !== false; // default to selected
        return (
          <label
            key={item.id}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              padding: '10px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-surface-alt)',
              cursor: 'pointer',
              opacity: isSelected ? 1 : 0.6,
              transition: 'all 0.15s ease'
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleChange(item.id)}
              style={{ marginTop: '3px', accentColor: 'var(--color-accent)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '6px' }}>
                {item.section}
              </div>
              {item.original && (
                <div style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--color-danger-light)',
                  borderLeft: '3px solid var(--color-danger)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'line-through',
                  marginBottom: '4px',
                  wordBreak: 'break-word'
                }}>
                  {item.original || `(${t('Empty')})`}
                </div>
              )}
              <div style={{
                padding: '6px 10px',
                backgroundColor: 'var(--color-success-light)',
                borderLeft: '3px solid var(--color-success)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--color-text)',
                wordBreak: 'break-word'
              }}>
                {item.type === 'added' ? `+ ${item.modified}` : item.modified}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Step management: 'upload' -> 'summary' -> 'enhance' -> 'review'
  const [step, setStep] = useState('upload');
  const [extractedSummary, setExtractedSummary] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [enhancedData, setEnhancedData] = useState(null);
  const [selectedChanges, setSelectedChanges] = useState({});
  
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      setDragActive(false);
      setTextMode(false);
      setRawText('');
      setIsProcessing(false);
      setError(null);
      setStep('upload');
      setExtractedSummary(null);
      setParsedData(null);
      setEnhancedData(null);
      setSelectedChanges({});
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
      const result = await importResumeWithProxy(payload);
      if (result) {
        const summary = {
          name: result.personal?.name || '',
          email: result.personal?.email || '',
          experienceCount: result.experience?.length || 0,
          educationCount: result.education?.length || 0,
          skillsCount: result.skills?.technical ? result.skills.technical.split(',').filter(s => s.trim()).length : 0,
        };
        setExtractedSummary(summary);
        setParsedData(result);
        setStep('summary');
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

  const handleEnhance = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await enhanceResumeWithProxy(parsedData);
      if (result) {
        setEnhancedData(result);
        setSelectedChanges({}); // all selected by default
        setStep('review');
      } else {
        throw new Error(t('Failed to enhance resume.'));
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'QUOTA_EXCEEDED') {
        setError(t('API Quota Exceeded. Please try again later.'));
      } else {
        setError(err.message || t('Error enhancing resume.'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleChange = (changeId) => {
    setSelectedChanges(prev => ({
      ...prev,
      [changeId]: prev[changeId] === false ? true : false
    }));
  };

  const applySelectedChanges = () => {
    if (!enhancedData || !parsedData) return parsedData;

    // Start from parsed (original) and selectively merge enhanced changes
    const merged = structuredClone(parsedData);

    // Summary
    if (selectedChanges['summary'] !== false && enhancedData.summary !== parsedData.summary) {
      merged.summary = enhancedData.summary;
    }

    // Skills
    if (selectedChanges['skills.technical'] !== false && enhancedData.skills?.technical !== parsedData.skills?.technical) {
      merged.skills = merged.skills || {};
      merged.skills.technical = enhancedData.skills.technical;
    }
    if (selectedChanges['skills.soft'] !== false && enhancedData.skills?.soft !== parsedData.skills?.soft) {
      merged.skills = merged.skills || {};
      merged.skills.soft = enhancedData.skills.soft;
    }

    // Experience bullets
    parsedData.experience?.forEach((exp, idx) => {
      const modExp = enhancedData.experience?.[idx];
      if (!modExp || !merged.experience?.[idx]) return;

      exp.bullets?.forEach((bullet, bIdx) => {
        const changeId = `exp.${idx}.bullet.${bIdx}`;
        if (selectedChanges[changeId] !== false && modExp.bullets?.[bIdx] && modExp.bullets[bIdx] !== bullet) {
          merged.experience[idx].bullets[bIdx] = modExp.bullets[bIdx];
        }
      });

      // New bullets added by AI
      if (modExp.bullets?.length > (exp.bullets?.length || 0)) {
        for (let i = exp.bullets?.length || 0; i < modExp.bullets.length; i++) {
          const changeId = `exp.${idx}.bullet.${i}`;
          if (selectedChanges[changeId] !== false) {
            if (!merged.experience[idx].bullets) merged.experience[idx].bullets = [];
            merged.experience[idx].bullets.push(modExp.bullets[i]);
          }
        }
      }
    });

    return merged;
  };

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      setError(t('Please upload a valid PDF file.'));
      return;
    }
    
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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>
          <i className="fi fi-rr-cross"></i>
        </button>
        
        <h2 className="modal-title">{t('Import Resume')} 🪄</h2>
        
        {error && <div className="modal-error"><i className="fi fi-rr-exclamation"></i> {error}</div>}

        {isProcessing ? (
          <div className="modal-loading" style={{ margin: '40px 0', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', color: 'var(--color-text-secondary)' }}>
              {step === 'upload' || step === 'summary' ? t('AI is reading your resume...') : t('AI is enhancing your resume...')}
            </p>
          </div>

        ) : step === 'review' && enhancedData ? (
          /* Step 3: Review AI enhancements with granular checkboxes */
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(var(--success-rgb, 16, 185, 129), 0.08)',
              border: '1px solid rgba(var(--success-rgb, 16, 185, 129), 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '14px',
              fontSize: '13px',
              color: 'var(--color-text)',
              lineHeight: '1.4'
            }}>
              ✨ {t('The AI has proposed improvements below. Uncheck any changes you want to reject:')}
            </div>
            
            <ImportDiff 
              original={parsedData} 
              modified={enhancedData} 
              selectedChanges={selectedChanges}
              onToggleChange={handleToggleChange}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => {
                  setStep('summary');
                  setEnhancedData(null);
                }}
              >
                ← {t('Back')}
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, justifyContent: 'center' }}
                onClick={() => {
                  const finalData = applySelectedChanges();
                  onImportSuccess(finalData);
                  onClose();
                }}
              >
                ✅ {t('Apply & Import')}
              </button>
            </div>
          </div>

        ) : step === 'summary' && extractedSummary ? (
          /* Step 2: Post-Import Summary & choice to enhance or confirm */
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', gap: '8px' }}
                onClick={handleEnhance}
              >
                ✨ {t('Enhance with AI')}
                <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: '400' }}>({t('recommended')})</span>
              </button>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={() => {
                  onImportSuccess(parsedData);
                  onClose();
                }}
              >
                {t('Import as-is')}
              </button>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '10px', opacity: 0.7 }}
                onClick={() => {
                  setStep('upload');
                  setExtractedSummary(null);
                  setParsedData(null);
                }}
              >
                ↩ {t('Restart')}
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Initial Upload / Paste UI */
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
