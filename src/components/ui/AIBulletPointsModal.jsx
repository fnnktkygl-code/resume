import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { generateBulletPointsWithProxy } from '../../services/geminiService';
import { parseMarkdown } from '../../utils/formatText';
import AILoadingOverlay from './AILoadingOverlay';

export default function AIBulletPointsModal({ isOpen, onClose, experienceText, onSelectBullet }) {
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletOptions, setBulletOptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && experienceText && experienceText.trim().length >= 3 && bulletOptions.length === 0 && !isGenerating) {
      handleGenerate();
    }
  }, [isOpen, experienceText]);

  const handleGenerate = async () => {
    if (!experienceText || experienceText.trim().length < 3) {
      setError(t('Please provide some text to enhance.'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setBulletOptions([]);

    try {
      const bullets = await generateBulletPointsWithProxy(experienceText, language);
      setBulletOptions(bullets);
    } catch (err) {
      console.error(err);
      setError(t('Failed to generate bullet points. Please try again later.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (bullet) => {
    onSelectBullet(bullet);
    onClose(true);
  };

  return (
    <>
      <AILoadingOverlay 
        isGenerating={isGenerating} 
        title={language === 'fr' ? 'Génération de puces d\'expérience STAR...' : language === 'es' ? 'Generando viñetas de experiencia STAR...' : 'Generating STAR Experience Bullet Points...'} 
        initialStep={language === 'fr' ? '⚡ Analyse de l\'expérience et extraction des métriques...' : language === 'es' ? '⚡ Analizando experiencia y extrayendo métricas...' : '⚡ Analyzing experience & extracting metrics...'}
        language={language}
      />
      <Modal isOpen={isOpen} onClose={onClose} title={t('✨ AI STAR Bullet Points')} maxWidth="580px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
          {t('The AI will transform your description into 3 high-impact bullet points using the Action → Context → Result (STAR) method.')}
        </p>

        <div style={{ 
          background: 'var(--color-surface-alt)', 
          padding: '14px', 
          borderRadius: '8px', 
          fontSize: '0.88rem',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)'
        }}>
          <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>{t('Original Text')}:</strong>
          <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            {parseMarkdown(experienceText) || t('No description provided yet.')}
          </p>
        </div>

        {error && (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {!bulletOptions.length && !isGenerating && (
          <button
            onClick={handleGenerate}
            disabled={!experienceText || experienceText.trim().length < 5}
            className="btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            ✨ {t('Generate Bullet Points')}
          </button>
        )}

        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
            </svg>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('Optimizing text with Gemini...')}</span>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {bulletOptions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: 'var(--color-text)' }}>{t('Select an option to apply:')}</h4>
            {bulletOptions.map((bullet, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(bullet)}
                style={{
                  textAlign: 'left',
                  padding: '14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  color: 'var(--color-text)',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--color-accent)', fontWeight: '700', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ✨ {t('Option')} {idx + 1}
                  </div>
                  <div style={{ textAlign: 'left', color: 'var(--color-text)' }}>
                    {parseMarkdown(bullet)}
                  </div>
                </div>
              </button>
            ))}
            
            <button
              onClick={handleGenerate}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.85rem',
                marginTop: '8px'
              }}
            >
              {t('Regenerate options')}
            </button>
          </div>
        )}
      </div>
    </Modal>
    </>
  );
}
