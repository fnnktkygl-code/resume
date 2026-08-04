import { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { generateBulletPointsWithProxy } from '../../services/geminiService';
import AILoadingOverlay from './AILoadingOverlay';

export default function AIBulletPointsModal({ isOpen, onClose, experienceText, onSelectBullet }) {
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletOptions, setBulletOptions] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!experienceText || experienceText.trim().length < 5) {
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
        title={language === 'fr' ? 'Génération de puces d\'expérience STAR...' : 'Generating STAR Experience Bullet Points...'} 
        initialStep={language === 'fr' ? '⚡ Analyse de l\'expérience et extraction des métriques...' : '⚡ Analyzing experience & extracting metrics...'}
        language={language}
      />
      <Modal isOpen={isOpen} onClose={onClose} title={t('✨ AI STAR Bullet Points')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('The AI will transform your description into 3 high-impact bullet points using the Action → Context → Result (STAR) method.')}
        </p>

        <div style={{ 
          background: 'var(--color-bg-alt)', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          border: '1px solid var(--color-border)'
        }}>
          <strong>{t('Original Text')}:</strong>
          <p style={{ marginTop: '4px', fontStyle: 'italic' }}>{experienceText || t('No description provided yet.')}</p>
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
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            <i className="fi fi-rr-magic-wand"></i> {t('Generate Bullet Points')}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{t('Select an option to apply:')}</h4>
            {bulletOptions.map((bullet, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(bullet)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-accent)', fontWeight: 'bold', flexShrink: 0 }}>{t('Option')} {idx + 1}</div>
                  <div style={{ textAlign: 'left' }}>{bullet}</div>
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
