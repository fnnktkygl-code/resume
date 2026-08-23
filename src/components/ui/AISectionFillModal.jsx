import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { generateSectionContentWithProxy } from '../../services/geminiService';
import AILoadingOverlay from './AILoadingOverlay';

/**
 * Reusable AI Section Fill Modal.
 *
 * Props:
 *   isOpen, onClose
 *   sectionType: 'skills_technical' | 'skills_soft' | 'skills_languages' | 'certifications' | 'custom_atouts' | 'custom_loisirs' | 'custom_langues' | 'custom_generic'
 *   sectionLabel: Human-readable section name (e.g., "Technical Skills", "Atouts")
 *   resumeContext: Condensed context from buildResumeContext()
 *   targetJobDescription: Optional job description
 *   onApply: (suggestions) => void — callback with selected suggestions
 */
export default function AISectionFillModal({
  isOpen,
  onClose,
  sectionType,
  sectionLabel,
  resumeContext,
  targetJobDescription,
  onUpdateTargetJob,
  onApply,
}) {
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [localJobDescription, setLocalJobDescription] = useState(targetJobDescription || '');
  const [showJdInput, setShowJdInput] = useState(!targetJobDescription?.trim());

  useEffect(() => {
    if (isOpen && targetJobDescription) {
      setLocalJobDescription(targetJobDescription);
      setShowJdInput(false);
    }
  }, [isOpen, targetJobDescription]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSuggestions(null);
    setSelected(new Set());

    try {
      const contextWithLabel = { ...resumeContext };
      if (sectionType === 'custom_generic') {
        contextWithLabel._customSectionLabel = sectionLabel;
      }

      const result = await generateSectionContentWithProxy(
        sectionType,
        contextWithLabel,
        localJobDescription,
        language
      );
      setSuggestions(result);

      const items = extractItems(result);
      if (sectionType === 'tagline') {
        setSelected(new Set(items.length > 0 ? [0] : []));
      } else {
        setSelected(new Set(items.map((_, i) => i)));
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'QUOTA_EXCEEDED' || err.message === 'QUOTA_EXCEEDED') {
        setError(t('AI quota exceeded. Please try again later or use your own API key.'));
      } else {
        setError(err.message || t('Failed to generate suggestions. Please try again.'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const extractItems = (data) => {
    if (!data) return [];
    if (data.skills) return data.skills;
    if (data.languages) return data.languages;
    if (data.certifications) return data.certifications;
    if (data.items) return data.items;
    return [];
  };

  const toggleSelection = (index) => {
    if (sectionType === 'tagline') {
      setSelected(new Set([index]));
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleApply = () => {
    const items = extractItems(suggestions);
    const selectedItems = items.filter((_, i) => selected.has(i));
    onApply(selectedItems, sectionType);
    onClose();
  };

  const renderSuggestionItem = (item, index) => {
    const isSelected = selected.has(index);

    // Simple string item (skills)
    if (typeof item === 'string') {
      return (
        <button
          key={index}
          onClick={() => toggleSelection(index)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
            border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: isSelected ? '600' : '400',
            color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
            transition: 'all 0.15s ease',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isSelected ? 'var(--color-accent)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          {item}
        </button>
      );
    }

    // Object item (certification, custom item, language)
    return (
      <button
        key={index}
        onClick={() => toggleSelection(index)}
        style={{
          textAlign: 'left',
          padding: '14px',
          background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
          border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: sectionType === 'tagline' ? '50%' : '4px',
              border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isSelected ? 'var(--color-accent)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            {isSelected && sectionType !== 'tagline' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {isSelected && sectionType === 'tagline' && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
            )}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              {item.title || item.name}
            </div>
            {(item.subtitle || item.issuer || item.level) && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {item.subtitle || item.issuer || item.level}
              </div>
            )}
            {item.description && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                {item.description}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const isSkillType = sectionType?.startsWith('skills_');
  const items = extractItems(suggestions);

  return (
    <>
      <AILoadingOverlay 
        isGenerating={isGenerating} 
        title={language === 'fr' ? `Génération de la section "${sectionLabel}"...` : language === 'es' ? `Generando sección "${sectionLabel}"...` : `Generating "${sectionLabel}" section...`}
        initialStep={language === 'fr' ? '⚡ Analyse du contexte et création de suggestions sur-mesure...' : language === 'es' ? '⚡ Analizando contexto y generando sugerencias a medida...' : '⚡ Analyzing context & generating tailored suggestions...'}
        language={language}
      />
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="620px" title={`✨ ${t('AI Suggestions')}: ${sectionLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* JD Banner info */}
        {/* Job Description Optional Input */}
        <div
          style={{
            padding: '12px',
            background: localJobDescription?.trim() ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-surface-alt)',
            border: `1px solid ${localJobDescription?.trim() ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border)'}`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: localJobDescription?.trim() ? 'rgb(16, 185, 129)' : 'var(--color-text)' }}>
              <span>{localJobDescription?.trim() ? '🎯' : '💡'}</span>
              <span>{localJobDescription?.trim() ? t('Tailoring to Job Offer / ATS') : t('Tip: Tailor to a Job Offer (Optional)')}</span>
            </div>
            {localJobDescription?.trim() && (
              <button
                type="button"
                onClick={() => setShowJdInput(!showJdInput)}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
              >
                {showJdInput ? t('Hide') : t('Edit offer')}
              </button>
            )}
          </div>

          {!localJobDescription?.trim() && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {t('Paste the target job advertisement below so AI aligns keywords specifically for this role:')}
            </div>
          )}

          {showJdInput && (
            <textarea
              placeholder={t('Paste target job advertisement / offer here (optional)...')}
              value={localJobDescription}
              onChange={(e) => {
                setLocalJobDescription(e.target.value);
                onUpdateTargetJob && onUpdateTargetJob(e.target.value);
              }}
              style={{
                width: '100%',
                minHeight: '70px',
                padding: '8px',
                fontSize: '0.8rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                resize: 'vertical',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          )}
        </div>

        {/* Profile Context used */}
        {resumeContext && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <strong>{t('Context used')}:</strong>{' '}
            {resumeContext.title || t('Profile')} &bull;{' '}
            {resumeContext.experience?.length || 0} {t('experience(s)')} &bull;{' '}
            {resumeContext.projects?.length || 0} {t('project(s)')}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: 'rgb(239, 68, 68)',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Generate button — only when no suggestions yet */}
        {!suggestions && !isGenerating && (
          <button onClick={handleGenerate} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <i className="fi fi-rr-magic-wand"></i> {t('Generate Suggestions')}
          </button>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <svg
              style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }}
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414"
              />
            </svg>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
              {t('Analyzing your profile...')}
            </span>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Suggestions list */}
        {suggestions && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>
                {sectionType === 'tagline' ? t('Select the best title for your resume') : t('Select suggestions to apply')}:
              </h4>
              {sectionType !== 'tagline' && (
                <button
                  onClick={() => {
                    if (selected.size === items.length) {
                      setSelected(new Set());
                    } else {
                      setSelected(new Set(items.map((_, i) => i)));
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'underline',
                  }}
                >
                  {selected.size === items.length ? t('Deselect All') : t('Select All')}
                </button>
              )}
            </div>

            <div
              style={{
                display: isSkillType ? 'flex' : 'flex',
                flexWrap: isSkillType ? 'wrap' : undefined,
                flexDirection: isSkillType ? 'row' : 'column',
                gap: isSkillType ? '8px' : '10px',
              }}
            >
              {items.map((item, idx) => renderSuggestionItem(item, idx))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleGenerate}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.82rem',
                }}
              >
                🔄 {t('Regenerate')}
              </button>
              <button
                onClick={handleApply}
                className="btn btn-primary"
                disabled={selected.size === 0}
                style={{ opacity: selected.size === 0 ? 0.5 : 1 }}
              >
                ✓ {t('Apply')} ({selected.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
    </>
  );
}
