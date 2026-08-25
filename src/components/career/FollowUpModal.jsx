import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateFollowUpWithProxy } from '../../services/geminiService';

export default function FollowUpModal({
  isOpen,
  onClose,
  application,
  candidateName = ''
}) {
  const { t, language } = useTranslation();
  const [emailType, setEmailType] = useState('followup'); // 'followup' | 'thankyou'
  const [daysElapsed, setDaysElapsed] = useState(8);
  const [customContext, setCustomContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (application) {
      // Calculate days elapsed since updated/created
      const date = new Date(application.updatedAt || application.createdAt || Date.now());
      const diffDays = Math.max(1, Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
      setDaysElapsed(diffDays);

      // Default type based on status
      if (application.status === 'interview') {
        setEmailType('thankyou');
      } else {
        setEmailType('followup');
      }
      setEmailData(null);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateFollowUpWithProxy({
        companyName: application.company || 'Entreprise',
        jobTitle: application.jobTitle || 'Poste',
        type: emailType,
        daysElapsed,
        candidateName,
        context: customContext,
        language
      });
      setEmailData(res);
    } catch (err) {
      console.error("Follow-up generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!emailData) return;
    const fullText = `${t("Objet de l'email")} : ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✉️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {t("Générateur d'Email de Relance & Remerciement")}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                🏢 {application.company} • 🎯 {application.jobTitle}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Type Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => { setEmailType('followup'); setEmailData(null); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${emailType === 'followup' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                backgroundColor: emailType === 'followup' ? 'rgba(99, 102, 241, 0.08)' : 'var(--color-surface)',
                color: emailType === 'followup' ? 'var(--color-accent)' : 'var(--color-text)',
                fontWeight: emailType === 'followup' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>⏳</span>
              <span>{t("Relance Candidature (Silence)")}</span>
            </button>

            <button
              type="button"
              onClick={() => { setEmailType('thankyou'); setEmailData(null); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${emailType === 'thankyou' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                backgroundColor: emailType === 'thankyou' ? 'rgba(99, 102, 241, 0.08)' : 'var(--color-surface)',
                color: emailType === 'thankyou' ? 'var(--color-accent)' : 'var(--color-text)',
                fontWeight: emailType === 'thankyou' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>💌</span>
              <span>{t("Remerciement Post-Entretien")}</span>
            </button>
          </div>

          {/* Configuration controls */}
          <div style={{ display: 'grid', gridTemplateColumns: emailType === 'followup' ? '1fr 2fr' : '1fr', gap: '12px', marginBottom: '16px' }}>
            {emailType === 'followup' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  {t("Jours écoulés")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={daysElapsed}
                  onChange={(e) => setDaysElapsed(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                {emailType === 'thankyou' 
                  ? (language === 'fr' ? 'Détail marquant de l’échange (facultatif)' : language === 'es' ? 'Detalle de la conversación (opcional)' : 'Key discussion highlight (optional)')
                  : (language === 'fr' ? 'Contexte particulier (facultatif)' : language === 'es' ? 'Contexto particular (opcional)' : 'Specific context (optional)')}
              </label>
              <input
                type="text"
                placeholder={emailType === 'thankyou' 
                  ? (language === 'fr' ? 'Ex: Discussion sur la migration React 19 et vos enjeux de perfs' : 'Ex: Discussion about technical migration & architecture')
                  : (language === 'fr' ? 'Ex: Candidature transmise via LinkedIn avec recommandation' : 'Ex: Application via LinkedIn referral')}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={isLoading}
            style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
          >
            {isLoading ? (
              <>
                <i className="fi fi-rr-spinner cl-spin"></i>
                <span>{t("Génération en cours...")}</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>{t("Générer l'email")}</span>
              </>
            )}
          </button>

          {/* Generated Result */}
          {emailData && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  📋 {t("Objet de l'email")}
                </label>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--color-text)'
                }}>
                  {emailData.subject}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  📝 {t("Corps du message")}
                </label>
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--color-text)'
                }}>
                  {emailData.body}
                </div>
              </div>

              {emailData.tips && emailData.tips.length > 0 && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: '6px' }}>
                    💡 {t("Conseils pour l'envoi")} :
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-text-secondary)' }}>
                    {emailData.tips.map((tip, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                >
                  {copied ? <span>✓ {t("Email copié dans le presse-papier !")}</span> : <span>📋 {t("Copier le texte")}</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
