import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { matchKeywordsWithProxy } from '../../services/geminiService';

export default function ATSKeywordsModal({ isOpen, onClose, data, dispatch, onApplied }) {
  const { t, language } = useTranslation();
  const [jobDescription, setJobDescription] = useState(data?.targetJobDescription || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [selectedMissingKeywords, setSelectedMissingKeywords] = useState([]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await matchKeywordsWithProxy(data, jobDescription, language);
      setResult(analysis);
      if (analysis?.missingKeywords) {
        setSelectedMissingKeywords([...analysis.missingKeywords]);
      }
    } catch (err) {
      setError(err.message || t('An error occurred during analysis.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleKeyword = (kw) => {
    setSelectedMissingKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const scoreColor = result?.matchScore >= 80 ? 'var(--color-success, #28a745)' : 
                     result?.matchScore >= 50 ? 'var(--color-warning, #ffc107)' : 
                     'var(--color-danger, #dc3545)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('ATS Keyword Matcher')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('Paste the job description below to see how well your resume matches it.')}
        </p>

        <textarea
          className="resume-input"
          style={{ minHeight: '150px', resize: 'vertical' }}
          placeholder={t('Paste job description here...')}
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            if (dispatch) {
              dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: e.target.value });
            }
          }}
        />

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'var(--color-danger-light, #ffe6e6)', color: 'var(--color-danger, #d32f2f)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button 
          type="button"
          className="btn-primary" 
          onClick={handleAnalyze}
          disabled={!jobDescription.trim() || isAnalyzing}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: (!jobDescription.trim() || isAnalyzing) ? 0.7 : 1 }}
        >
          {isAnalyzing ? (
            <><i className="fi fi-rr-spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i> {t('Analyzing...')}</>
          ) : (
            <><i className="fi fi-rr-search-alt" style={{ marginRight: '8px' }}></i> {t('Analyze Match')}</>
          )}
        </button>

        {result && (
          <div style={{ marginTop: '8px', padding: '16px', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('Match Score')}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: scoreColor }}>
                {result.matchScore}%
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', margin: '0 0 16px 0', fontWeight: '500' }}>
              {result.recommendation}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-danger, #d32f2f)' }}>
                      {t('Missing Keywords')} ({selectedMissingKeywords.length}/{result.missingKeywords.length})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {t('Click keywords to select/unselect')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.missingKeywords.map((kw, i) => {
                      const isSelected = selectedMissingKeywords.includes(kw);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleKeyword(kw)}
                          title={isSelected ? t('Click to exclude') : t('Click to include')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: isSelected ? 'var(--color-danger-light, #ffe6e6)' : 'var(--color-surface-alt, #f3f4f6)',
                            color: isSelected ? 'var(--color-danger, #d32f2f)' : 'var(--color-text-muted, #888)',
                            border: `1px solid ${isSelected ? 'rgba(211,47,47,0.3)' : 'var(--color-border, #ddd)'}`,
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '600' : '400',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: isSelected ? 'none' : 'line-through',
                            opacity: isSelected ? 1 : 0.6,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{isSelected ? '✓' : '✕'}</span>
                          {kw}
                        </button>
                      );
                    })}
                  </div>

                  {dispatch && (
                    <button
                      type="button"
                      disabled={selectedMissingKeywords.length === 0}
                      onClick={() => {
                        if (!selectedMissingKeywords.length) return;
                        const currentSkills = data.skills?.technical || '';
                        const missingKws = selectedMissingKeywords.join(', ');
                        const newSkills = currentSkills ? `${currentSkills}, ${missingKws}` : missingKws;
                        
                        dispatch({
                          type: 'UPDATE_SKILLS',
                          payload: { ...data.skills, technical: newSkills }
                        });
                        
                        // Re-run analysis
                        handleAnalyze();
                        if (onApplied) {
                          onApplied();
                        }
                      }}
                      style={{
                        marginTop: '14px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--color-accent-contrast, #fff)',
                        backgroundColor: selectedMissingKeywords.length > 0 ? 'var(--color-accent, #1B6B3A)' : '#ccc',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: selectedMissingKeywords.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        alignSelf: 'flex-start',
                        transition: 'all 0.15s ease',
                        opacity: selectedMissingKeywords.length > 0 ? 1 : 0.5
                      }}
                    >
                      <i className="fi fi-rr-magic-wand"></i>
                      {t(`✨ Auto-apply ${selectedMissingKeywords.length} selected keyword${selectedMissingKeywords.length > 1 ? 's' : ''}`)}
                    </button>
                  )}
                </div>
              )}

              {result.foundKeywords && result.foundKeywords.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-success, #2e7d32)' }}>{t('Matched Keywords')}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.foundKeywords.map((kw, i) => (
                      <span key={i} style={{ padding: '4px 8px', backgroundColor: 'var(--color-success-light, #e8f5e9)', color: 'var(--color-success, #2e7d32)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
