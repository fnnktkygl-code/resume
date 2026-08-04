import React, { useState, useEffect } from 'react';

/**
 * Reusable AI Loading Overlay & Shimmer Progress Bar
 * Full-screen frosted glass backdrop with live dynamic progress timer.
 */
export default function AILoadingOverlay({ isGenerating, title, initialStep, language = 'fr' }) {
  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState(initialStep || (language === 'fr' ? '⚡ Analyse de la requête par Gemini...' : '⚡ Processing request with Gemini AI...'));

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }

    setProgress(15);
    let current = 15;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 7) + 4;
      if (current >= 95) {
        current = 95;
        clearInterval(interval);
      }
      setProgress(current);

      if (current < 35) {
        setStep(language === 'fr' ? '⚡ Connexion aux serveurs Gemini...' : '⚡ Connecting to Gemini AI...');
      } else if (current < 65) {
        setStep(language === 'fr' ? '🧠 Génération et optimisation du contenu par l\'IA...' : '🧠 Generating & optimizing content with AI...');
      } else if (current < 90) {
        setStep(language === 'fr' ? '✍️ Structuration et alignement sur votre profil...' : '✍️ Structuring & aligning to your profile...');
      } else {
        setStep(language === 'fr' ? '✨ Polissage final et insertion...' : '✨ Final polishing & insertion...');
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isGenerating, language, initialStep]);

  if (!isGenerating) return null;

  return (
    <div className="cl-loading-overlay">
      <div className="cl-loading-card">
        <div className="cl-loading-spinner-ring"></div>
        <div className="cl-loading-content">
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
            {title || (language === 'fr' ? 'Génération IA en cours...' : 'AI Generation in Progress...')}
          </h4>
          <p style={{ margin: '6px 0 14px 0', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
            {step}
          </p>

          <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-accent), #818cf8)', 
                borderRadius: '10px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'block' }}>
            {progress}% • {language === 'fr' ? 'Traitement sécurisé par Gemini' : 'Secure processing by Gemini'}
          </span>
        </div>
      </div>
    </div>
  );
}
