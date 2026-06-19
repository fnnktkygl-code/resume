import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';
import { boldifyResumeWithProxy } from '../../services/geminiService';
import VisualDiff from './VisualDiff';

function mergeSelected(original, modified, selectedIds) {
  const merged = structuredClone(original);

  if (selectedIds.has('summary') && modified.summary !== original.summary) {
    merged.summary = modified.summary;
  }
  if (selectedIds.has('skills.technical') && modified.skills?.technical !== original.skills?.technical) {
    merged.skills = merged.skills || {};
    merged.skills.technical = modified.skills.technical;
  }
  if (selectedIds.has('skills.soft') && modified.skills?.soft !== original.skills?.soft) {
    merged.skills = merged.skills || {};
    merged.skills.soft = modified.skills.soft;
  }

  original.experience?.forEach((exp, idx) => {
    const modExp = modified.experience?.[idx];
    if (!modExp || !merged.experience?.[idx]) return;

    if (selectedIds.has(`exp.${idx}.title`) && modExp.title !== exp.title) {
      merged.experience[idx].title = modExp.title;
    }
    exp.bullets?.forEach((bullet, bIdx) => {
      if (selectedIds.has(`exp.${idx}.bullet.${bIdx}`) && modExp.bullets?.[bIdx] && modExp.bullets[bIdx] !== bullet) {
        merged.experience[idx].bullets[bIdx] = modExp.bullets[bIdx];
      }
    });
  });

  original.projects?.forEach((proj, idx) => {
    const modProj = modified.projects?.[idx];
    if (!modProj || !merged.projects?.[idx]) return;

    if (selectedIds.has(`proj.${idx}.desc`) && modProj.description !== proj.description) {
      merged.projects[idx].description = modProj.description;
    }
    proj.highlights?.forEach((h, bIdx) => {
      if (selectedIds.has(`proj.${idx}.highlight.${bIdx}`) && modProj.highlights?.[bIdx] && modProj.highlights[bIdx] !== h) {
        merged.projects[idx].highlights[bIdx] = modProj.highlights[bIdx];
      }
    });
  });

  if (modified.headings) merged.headings = modified.headings;

  return merged;
}

export default function AIBoldifyModal({ isOpen, onClose, data, onBoldifySuccess }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [boldedResult, setBoldedResult] = useState(null);
  const selectedRef = useRef(new Set());

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setBoldedResult(null);
      setIsLoading(false);
      selectedRef.current = new Set();
    }
  }, [isOpen]);

  const handleBoldify = async () => {
    setError('');
    setIsLoading(true);

    try {
      const boldedData = await boldifyResumeWithProxy(data);
      setBoldedResult(boldedData);
    } catch (err) {
      setError(err.message || t('Failed to process. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionChange = useCallback((ids) => {
    selectedRef.current = ids;
  }, []);

  const handleApply = () => {
    if (boldedResult) {
      const merged = mergeSelected(data, boldedResult, selectedRef.current);
      onBoldifySuccess(merged);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title={`✨ ${t('AI Smart Bolding')}`}
      actions={
        boldedResult ? (
          <>
            <button 
              className="btn-secondary" 
              onClick={() => setBoldedResult(null)}
            >
              {t('Cancel')}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleApply}
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
              onClick={handleBoldify}
              disabled={isLoading}
            >
              {isLoading ? t('Generating...') : t('Apply Smart Bolding')}
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
        ) : boldedResult ? (
          <div className="animate-fade-in">
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {t('Select the changes you want to apply:')}
            </p>
            <VisualDiff original={data} modified={boldedResult} onSelectionChange={handleSelectionChange} />
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t('Google Gemini will analyze your entire CV to selectively bold core metrics, action verbs, and key technical skills in a clean, minimalist style. This improves readability for recruiters and ATS parsers.')}
            </p>
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
