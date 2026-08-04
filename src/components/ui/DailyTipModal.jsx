import { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { getTipsList } from '../../data/dailyTips';

export default function DailyTipModal({ isOpen, onClose, onAppAction, initialTab = 'creator' }) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab); // 'creator', 'cv', or 'letter'
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const creatorTips = getTipsList('creator', language);
  const cvTips = getTipsList('cv', language);
  const letterTips = getTipsList('letter', language);

  const currentTips = getTipsList(activeTab, language);
  const tip = currentTips[currentIndex] || currentTips[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentTips.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentTips.length) % currentTips.length);
  };

  const handleTriggerAction = () => {
    if (tip?.appAction && onAppAction) {
      onClose();
      onAppAction(tip.appAction.actionKey);
    }
  };

  // Localized UI Labels
  const uiText = {
    title: {
      fr: 'Conseils du Créateur & Études RH',
      en: 'Creator Insights & HR Data Tips',
      es: 'Consejos del Creador y Estudios RH'
    },
    subtitle: {
      fr: 'Retour d\'expérience terrain et solutions prêtes à l\'emploi',
      en: 'Recruiter experience, cognitive insights & instant solutions',
      es: 'Experiencia real de selección y soluciones instantáneas'
    },
    tabCreator: {
      fr: `👑 Créateur (${creatorTips.length})`,
      en: `👑 Creator (${creatorTips.length})`,
      es: `👑 Creador (${creatorTips.length})`
    },
    tabCv: {
      fr: `📄 Conseils CV (${cvTips.length})`,
      en: `📄 Resume Tips (${cvTips.length})`,
      es: `📄 Consejos CV (${cvTips.length})`
    },
    tabLetter: {
      fr: `📝 Lettre (${letterTips.length})`,
      en: `📝 Cover Letter (${letterTips.length})`,
      es: `📝 Carta (${letterTips.length})`
    },
    tipCounter: {
      fr: `Fiche ${currentIndex + 1} sur ${currentTips.length}`,
      en: `Tip ${currentIndex + 1} of ${currentTips.length}`,
      es: `Ficha ${currentIndex + 1} de ${currentTips.length}`
    },
    actionableHeader: {
      fr: 'À appliquer dans votre document :',
      en: 'Actionable guidance:',
      es: 'Para aplicar en tu documento:'
    },
    toolSolutionHeader: {
      fr: 'Solution disponible dans l\'application',
      en: 'Built-in tool solution available',
      es: 'Solución disponible en la aplicación'
    },
    sourceHeader: {
      fr: 'Source / Référence :',
      en: 'HR Reference:',
      es: 'Fuente / Referencia:'
    },
    prevBtn: {
      fr: '← Précédent',
      en: '← Previous',
      es: '← Anterior'
    },
    nextBtn: {
      fr: 'Suivant →',
      en: 'Next →',
      es: 'Siguiente →'
    },
    rotationNote: {
      fr: 'Rotation quotidienne',
      en: 'Rotates daily',
      es: 'Rotación diaria'
    },
    closeTooltip: {
      fr: 'Fermer la fenêtre',
      en: 'Close window',
      es: 'Cerrar ventana'
    }
  };

  const currentLangKey = (language === 'en' || language === 'es') ? language : 'fr';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
      <div 
        className="modal-container daily-tip-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '92%', 
          borderRadius: '16px', 
          padding: '0', 
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          background: 'var(--color-surface)',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb, 99, 102, 241), 0.1), rgba(var(--color-primary-rgb, 14, 165, 233), 0.06))',
          padding: '18px 56px 14px 20px',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
              {uiText.title[currentLangKey]}
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 26px', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            {uiText.subtitle[currentLangKey]}
          </p>

          {/* Absolute Positioned Close Button */}
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              position: 'absolute',
              top: '14px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-alt)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-surface)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            title={uiText.closeTooltip[currentLangKey]}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher — 3 tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '0 8px',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('creator'); setCurrentIndex(0); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              border: 'none',
              borderBottom: activeTab === 'creator' ? '3px solid var(--color-accent)' : '3px solid transparent',
              background: 'none',
              color: activeTab === 'creator' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'creator' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease'
            }}
          >
            {uiText.tabCreator[currentLangKey]}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('cv'); setCurrentIndex(0); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              border: 'none',
              borderBottom: activeTab === 'cv' ? '3px solid var(--color-accent)' : '3px solid transparent',
              background: 'none',
              color: activeTab === 'cv' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'cv' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease'
            }}
          >
            {uiText.tabCv[currentLangKey]}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('letter'); setCurrentIndex(0); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              border: 'none',
              borderBottom: activeTab === 'letter' ? '3px solid var(--color-accent)' : '3px solid transparent',
              background: 'none',
              color: activeTab === 'letter' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'letter' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease'
            }}
          >
            {uiText.tabLetter[currentLangKey]}
          </button>
        </div>

        {/* Tip Body */}
        <div style={{ padding: '18px 20px' }}>
          {/* Badge & Day Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              background: activeTab === 'creator' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-accent-light)',
              color: activeTab === 'creator' ? '#d97706' : 'var(--color-accent)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}>
              {tip.category} • {tip.badge}
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {uiText.tipCounter[currentLangKey]}
            </span>
          </div>

          {/* Hero Stat Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.12))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '14px'
          }}>
            <div style={{
              fontSize: '26px',
              fontWeight: 900,
              color: 'var(--color-accent)',
              lineHeight: 1,
              whiteSpace: 'nowrap'
            }}>
              {tip.stat}
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {tip.statLabel}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px', lineHeight: 1.3 }}>
                {tip.title}
              </div>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: 'var(--color-text)',
            marginBottom: '12px'
          }}>
            {tip.description}
          </p>

          {/* Actionable Box */}
          <div style={{
            backgroundColor: 'var(--color-background, #f8fafc)',
            borderLeft: '4px solid var(--color-accent)',
            borderRadius: '0 8px 8px 0',
            padding: '10px 12px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚀</span> {uiText.actionableHeader[currentLangKey]}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text)', lineHeight: '1.4' }}>
              {tip.actionable}
            </div>
          </div>

          {/* Tool Solution Box */}
          {tip.appAction && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.12))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛠️</span>
                <span>{uiText.toolSolutionHeader[currentLangKey]}</span>
              </div>
              <button
                type="button"
                onClick={handleTriggerAction}
                style={{
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                {tip.appAction.label} →
              </button>
            </div>
          )}

          {/* Citation Source */}
          <div style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingTop: '8px',
            borderTop: '1px dashed var(--color-border)'
          }}>
            <span>📚</span>
            <span><strong>{uiText.sourceHeader[currentLangKey]}</strong> {tip.source}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          backgroundColor: 'var(--color-background, #f8fafc)',
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-alt)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
          >
            {uiText.prevBtn[currentLangKey]}
          </button>
          
          <span style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            background: 'var(--color-surface)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--color-border)'
          }}>
            🗓️ {uiText.rotationNote[currentLangKey]}
          </span>

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-accent)',
              color: 'var(--color-accent-contrast, #ffffff)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
          >
            {uiText.nextBtn[currentLangKey]}
          </button>
        </div>
      </div>
    </div>
  );
}
