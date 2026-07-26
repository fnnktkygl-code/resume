import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';
import { tailorResumeWithProxy } from '../../services/geminiService';
import VisualDiff from './VisualDiff';
import { mergeSelected } from '../../utils/mergeSelected';

export default function AITailorModal({ isOpen, onClose, data, onTailorSuccess, language }) {
  const { t } = useTranslation();
  const [jobDescription, setJobDescription] = useState(data?.targetJobDescription || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tailoredResult, setTailoredResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (isOpen && data?.targetJobDescription) {
      setJobDescription(data.targetJobDescription);
    }
  }, [isOpen, data?.targetJobDescription]);

  useEffect(() => {
    if (!isOpen) {
      // Don't reset job description to empty, keep the global state
      setError('');
      setError('');
      setTailoredResult(null);
      setIsLoading(false);
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError(t('Please paste a job description.'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const tailoredData = await tailorResumeWithProxy(data, jobDescription, language);
      setTailoredResult(tailoredData);
    } catch (err) {
      setError(err.message || t('Failed to generate resume. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionChange = useCallback((ids) => {
    setSelectedIds(ids);
  }, []);

  const handleApply = () => {
    if (tailoredResult) {
      const merged = mergeSelected(data, tailoredResult, selectedIds);
      merged.targetJobDescription = jobDescription;
      onTailorSuccess(merged);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title={`✨ ${t('Tailor to Job Description')}`}
      actions={
        tailoredResult ? (
          <>
            <button 
              className="btn-secondary" 
              onClick={() => setTailoredResult(null)}
            >
              {t('Cancel')}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleApply}
              disabled={selectedIds.size === 0}
            >
              {t('Apply Selected Changes')}
            </button>
          </>
        ) : (
          <>
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              {t('Cancel')}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleTailor}
              disabled={isLoading || !jobDescription.trim()}
            >
              {isLoading ? t('Generating...') : t('Generate Tailored CV')}
            </button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <svg style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
            </svg>
            <p style={{ marginTop: '16px', fontWeight: '500' }}>{t('Optimizing your resume...')}</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : tailoredResult ? (
          /* Show Diff view with checkboxes */
          <div className="animate-fade-in">
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {t('Select the changes you want to apply:')}
            </p>
            <VisualDiff original={data} modified={tailoredResult} onSelectionChange={handleSelectionChange} />
          </div>
        ) : (
          /* Show JD Input view */
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            {t('Paste the job description below. The AI will adapt your summary, skills, and experience to perfectly match the role.')}
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {t('Job Description')} <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (dispatch) {
                  dispatch({ type: 'UPDATE_TARGET_JOB_DESCRIPTION', payload: e.target.value });
                }
              }}
              placeholder={t('Paste job description here...')}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>
          </>
        )}

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-light, rgba(239, 68, 68, 0.1))', borderLeft: '4px solid var(--color-danger)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
