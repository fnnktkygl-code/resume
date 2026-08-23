import React, { useState } from 'react';
import { useTranslation } from '../../utils/TranslationContext';

const STATUS_COLUMNS = [
  { key: 'saved', labelFr: 'Sauvegardée', labelEn: 'Saved', labelEs: 'Guardada', icon: '📂', color: 'slate' },
  { key: 'tailored', labelFr: 'Adaptée', labelEn: 'Tailored', labelEs: 'Adaptada', icon: '⚡', color: 'emerald' },
  { key: 'applied', labelFr: 'Candidatée', labelEn: 'Applied', labelEs: 'Enviada', icon: '📨', color: 'blue' },
  { key: 'interview', labelFr: 'Entretien', labelEn: 'Interview', labelEs: 'Entrevista', icon: '🎯', color: 'purple' },
  { key: 'offer', labelFr: 'Offre reçue', labelEn: 'Offer', labelEs: 'Oferta', icon: '🎉', color: 'amber' }
];

export default function JobApplicationTracker({
  applications = [],
  onUpdateStatus,
  onDeleteApplication,
  onLoadTailoredResume,
  onViewCoverLetter,
  onOpenFollowUp,
  onOpenInterviewPrep,
  onOpenUpskill
}) {
  const { t, language } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter((app) => app.status === filterStatus);

  const getStatusLabel = (statusKey) => {
    const col = STATUS_COLUMNS.find((c) => c.key === statusKey);
    if (!col) return statusKey;
    if (language === 'fr') return col.labelFr;
    if (language === 'es') return col.labelEs;
    return col.labelEn;
  };

  return (
    <div className="career-tracker-container">
      {/* Top filter bar */}
      <div className="career-tracker-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
            {t('Pipeline Kanban des Candidatures')}
          </h3>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontWeight: 600
          }}>
            {applications.length} {t('au total')}
          </span>
        </div>

        {/* Status filter buttons */}
        <div className="career-tracker-filters">
          <button
            onClick={() => setFilterStatus('all')}
            className={`career-tracker-pill-btn ${filterStatus === 'all' ? 'active' : ''}`}
          >
            {t('Tout')} ({applications.length})
          </button>
          {STATUS_COLUMNS.map((col) => {
            const count = applications.filter((a) => a.status === col.key).length;
            const label = language === 'fr' ? col.labelFr : language === 'es' ? col.labelEs : col.labelEn;
            return (
              <button
                key={col.key}
                onClick={() => setFilterStatus(col.key)}
                className={`career-tracker-pill-btn ${filterStatus === col.key ? 'active' : ''}`}
              >
                {col.icon} {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: 'var(--color-surface-alt)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px' }}>
            {t('Aucune candidature dans cette colonne')}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {t('Recherchez des offres et cliquez sur « Adapter » pour démarrer votre pipeline.')}
          </p>
        </div>
      ) : (
        <div className="career-tracker-grid">
          {filteredApps.map((app) => {
            const dateStr = new Date(app.updatedAt || app.createdAt || Date.now()).toLocaleDateString(
              language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US',
              { day: 'numeric', month: 'short' }
            );

            return (
              <div key={app.id} className="career-tracker-card">
                <div>
                  <div className="career-tracker-card-header">
                    <div>
                      <div className="career-tracker-title">{app.jobTitle}</div>
                      <div className="career-tracker-company">
                        🏢 {app.company} • 📍 {app.location}
                      </div>
                    </div>

                    <div className="career-tracker-status-select">
                      <select
                        value={app.status || 'saved'}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                        aria-label="Statut de la candidature"
                      >
                        {STATUS_COLUMNS.map((col) => (
                          <option key={col.key} value={col.key}>
                            {col.icon} {language === 'fr' ? col.labelFr : language === 'es' ? col.labelEs : col.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)'
                  }}>
                    <span>🕒 {dateStr}</span>
                    {app.matchScore && (
                      <span style={{
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'var(--color-accent-light)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        🎯 {app.matchScore}% ATS
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="career-tracker-actions" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  {app.tailoredResume && (
                    <button
                      onClick={() => onLoadTailoredResume(app.tailoredResume)}
                      className="career-icon-btn"
                      style={{ fontSize: '11.5px', padding: '6px 10px', flex: 1, minWidth: '85px', justifyContent: 'center' }}
                      title={t('Charger ce CV personnalisé dans l\'éditeur')}
                    >
                      <span>📝</span>
                      <span>{t('Ouvrir CV')}</span>
                    </button>
                  )}

                  {app.coverLetter && (
                    <button
                      onClick={() => onViewCoverLetter(app.coverLetter)}
                      className="career-icon-btn"
                      style={{ fontSize: '11.5px', padding: '6px 10px', flex: 1, minWidth: '85px', justifyContent: 'center' }}
                      title={t('Afficher la lettre de motivation')}
                    >
                      <span>✉️</span>
                      <span>{t('Voir Lettre')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenInterviewPrep && onOpenInterviewPrep(app)}
                    className="career-icon-btn"
                    style={{ fontSize: '11.5px', padding: '6px 10px', flex: 1, minWidth: '85px', justifyContent: 'center', color: 'var(--color-accent)' }}
                    title={t("Pack de questions STAR et simulateur d'entretien")}
                  >
                    <span>🎤</span>
                    <span>{t("Entretien")}</span>
                  </button>

                  <button
                    onClick={() => onOpenFollowUp && onOpenFollowUp(app)}
                    className="career-icon-btn"
                    style={{ fontSize: '11.5px', padding: '6px 10px', flex: 1, minWidth: '85px', justifyContent: 'center' }}
                    title={t("Générer un email de relance ou de remerciement")}
                  >
                    <span>✉️</span>
                    <span>{app.status === 'interview' ? t("Remerciement") : t("Relance")}</span>
                  </button>

                  <button
                    onClick={() => onOpenUpskill && onOpenUpskill(app)}
                    className="career-icon-btn"
                    style={{ fontSize: '11.5px', padding: '6px 10px', flex: 1, minWidth: '85px', justifyContent: 'center' }}
                    title={t("Matrice de compétences et plan d'apprentissage")}
                  >
                    <span>🚀</span>
                    <span>{t("Upskill")}</span>
                  </button>

                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    className="career-icon-btn"
                    style={{ padding: '6px 10px', color: 'var(--color-danger)', marginLeft: 'auto' }}
                    title={t('Supprimer de mon suivi')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
