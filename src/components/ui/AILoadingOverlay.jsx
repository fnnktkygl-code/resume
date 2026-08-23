import React, { useState, useEffect } from 'react';

/**
 * Reusable AI Loading Overlay & Shimmer Progress Bar
 * Full-screen frosted glass backdrop with live dynamic progress timer.
 */
export default function AILoadingOverlay({ isGenerating, title, initialStep, language = 'fr' }) {
  const isFr = language === 'fr';
  const isEs = language === 'es';

  const defaultInitial = isFr 
    ? '⚡ Analyse de la requête par Gemini...' 
    : isEs 
      ? '⚡ Procesando la solicitud con Gemini AI...' 
      : '⚡ Processing request with Gemini AI...';

  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState(initialStep || defaultInitial);

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
        setStep(isFr ? '⚡ Connexion aux serveurs Gemini...' : isEs ? '⚡ Conectando con Gemini AI...' : '⚡ Connecting to Gemini AI...');
      } else if (current < 65) {
        setStep(isFr ? '🧠 Génération et optimisation du contenu par l\'IA...' : isEs ? '🧠 Generando y optimizando contenido con IA...' : '🧠 Generating & optimizing content with AI...');
      } else if (current < 90) {
        setStep(isFr ? '✍️ Structuration et alignement sur votre profil...' : isEs ? '✍️ Estructurando y alineando con tu perfil...' : '✍️ Structuring & aligning to your profile...');
      } else {
        setStep(isFr ? '✨ Polissage final et insertion...' : isEs ? '✨ Ajustes finales e inserción...' : '✨ Final polishing & insertion...');
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isGenerating, language, isFr, isEs, initialStep]);

  if (!isGenerating) return null;

  return (
    <div className="cl-loading-overlay">
      <div className="cl-loading-card">
        <div className="cl-loading-spinner-ring"></div>
        <div className="cl-loading-content">
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
            {title || (isFr ? 'Génération IA en cours...' : isEs ? 'Generación IA en curso...' : 'AI Generation in Progress...')}
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
            {progress}% • {isFr ? 'Traitement sécurisé par Gemini' : isEs ? 'Procesamiento seguro con Gemini' : 'Secure processing by Gemini'}
          </span>
        </div>
      </div>
    </div>
  );
}

