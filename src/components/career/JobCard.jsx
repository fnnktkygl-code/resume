import React, { useState } from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export default function JobCard({
  job = {},
  matchDetails = {},
  onAdaptClick,
  onSaveJob,
  isSaved = false,
  isAdapting = false
}) {
  const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);

  const scoreAts = typeof matchDetails?.score === 'number' ? matchDetails.score : 0;
  const rating = matchDetails?.scoreRating ?? (scoreAts > 0 ? (scoreAts / 20).toFixed(1) : '1.0');
  const verdict = matchDetails?.verdict || (scoreAts >= 80 ? t('Top Match (Recommandé)') : scoreAts >= 50 ? t('Match Modéré') : scoreAts > 0 ? t('Écart important') : t('Profil à compléter'));
  const blocks = matchDetails?.careerOpsBlocks;

  // Determine styling based on Rating
  let scorePillClass = 'career-ats-pill score-mid';
  if (scoreAts === 0) {
    scorePillClass = 'career-ats-pill score-neutral';
  } else if (Number(rating) >= 4.0 || scoreAts >= 80) {
    scorePillClass = 'career-ats-pill score-high';
  } else if (Number(rating) < 3.0 || scoreAts < 50) {
    scorePillClass = 'career-ats-pill score-low';
  }

  const jobTitle = String(job?.title || 'Offre d\'emploi');
  const jobCompany = String(job?.company || 'Entreprise');
  const jobLocation = String(job?.location || 'France');
  const jobContract = String(job?.contractType || 'CDI');
  const jobSource = String(job?.source || 'Job Board');
  
  // Clean description - never display a raw URL in description
  let jobDescription = String(job?.description || '');
  if (/^https?:\/\//i.test(jobDescription.trim()) && jobDescription.trim().length < 250) {
    jobDescription = `Offre d'emploi « ${jobTitle} » localisée à ${jobLocation}. Importée via l'Auto-Pipeline CareerOps. Consultez l'annonce originale ou adaptez votre CV en 1 clic.`;
  }

  const matchedSkills = Array.isArray(matchDetails?.matchedSkills) ? matchDetails.matchedSkills : [];
  const missingSkills = Array.isArray(matchDetails?.missingSkills) ? matchDetails.missingSkills : [];

  return (
    <div className="career-job-card">
      {/* Header: Title + CareerOps Score */}
      <div className="career-job-header">
        <div className="career-job-title-group">
          <div className="career-job-title-row">
            <h3 className="career-job-title">{jobTitle}</h3>
            {job.isRemote && (
              <span className="career-tag-pill remote">
                🌐 {t('100% Télétravail')}
              </span>
            )}
          </div>
          <div className="career-job-meta">
            <span className="career-meta-item">🏢 <strong>{jobCompany}</strong></span>
            {job.sector && (
              <>
                <span className="career-meta-sep">•</span>
                <span className="career-meta-sector">{String(job.sector)}</span>
              </>
            )}
            <span className="career-meta-sep">•</span>
            <span className="career-meta-item">📍 {jobLocation}</span>
            {matchDetails?.locationDistanceKm != null && matchDetails.locationDistanceKm > 0 && (
              <span className="career-distance-badge">
                ~{matchDetails.locationDistanceKm} km
              </span>
            )}
          </div>
        </div>

        {/* CareerOps 1.0 - 5.0 Rating & ATS Score Indicator */}
        <div className="career-ats-score-box">
          <div className={scorePillClass}>
            <span>{scoreAts > 0 ? `⭐ ${rating}/5.0 • ${scoreAts}% ATS` : `ℹ️ ${t('Profil à compléter')}`}</span>
          </div>
          <span className="career-ats-label">{verdict}</span>
        </div>
      </div>

      {/* Contract, Salary & Source Tags */}
      <div className="career-job-tags">
        <span className="career-tag-pill contract">
          📄 {jobContract}
        </span>
        {job.salary && job.salary !== 'Selon profil / marché' && (
          <span className="career-tag-pill salary">
            💰 {String(job.salary)}
          </span>
        )}
        <span className="career-tag-pill source">
          🔍 {jobSource}
        </span>
      </div>

      {/* Skills Match Chips (Block B Summary) - Only render genuine skills */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="career-skills-row">
          {matchedSkills.slice(0, 5).map((skill, idx) => {
            const label = typeof skill === 'string' ? skill : skill?.name || String(skill);
            return (
              <span key={`match-${idx}`} className="career-skill-chip matched">
                ✓ {label}
              </span>
            );
          })}

          {missingSkills.slice(0, 4).map((skill, idx) => {
            const label = typeof skill === 'string' ? skill : skill?.name || String(skill);
            return (
              <span key={`miss-${idx}`} className="career-skill-chip missing" title={t('Compétence demandée à valoriser')}>
                + {label}
              </span>
            );
          })}
        </div>
      )}

      {/* Snippet Description */}
      {jobDescription && (
        <p className="career-job-description">
          {jobDescription}
        </p>
      )}

      {/* Expandable CareerOps A-G Rubric Report */}
      {showReport && blocks && (
        <div className="career-report-panel">
          <div className="career-report-title">
            📊 {t('Rapport d\'Évaluation CareerOps (Rubric A-G)')}
          </div>

          {/* Block B: Gap Analysis */}
          <div className="career-report-section">
            <strong>🎯 {t('Bloc B — Analyse des Écarts (Gaps) :')}</strong>
            <div style={{ marginTop: '4px' }}>
              <span style={{ color: 'var(--color-success)' }}>✓ {blocks.blockB?.matchedSkills?.length || 0} {t('compétences maîtrisées')}</span>
              {' • '}
              <span style={{ color: 'var(--color-warning)' }}>⚠️ {blocks.blockB?.missingSkills?.length || 0} {t('compétences à valoriser')}</span>
            </div>
          </div>

          {/* Block C & D: Leveling & Comp */}
          <div className="career-report-grid">
            <div>
              <strong>📈 {t('Bloc C — Niveau :')}</strong> {String(blocks.blockC?.seniority || '-')}
            </div>
            <div>
              <strong>💰 {t('Bloc D — Rémunération :')}</strong> {String(blocks.blockD?.salaryEstimate || '-')}
            </div>
          </div>

          {/* Block E: Harvard XYZ Blueprint */}
          {Array.isArray(blocks.blockE?.suggestedMetrics) && blocks.blockE.suggestedMetrics.length > 0 && (
            <div className="career-report-section">
              <strong>📝 {t('Bloc E — Blueprint Harvard XYZ :')}</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {blocks.blockE.suggestedMetrics.map((m, i) => (
                  <li key={i}>{String(m)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Block F: STAR+R Interview Prep */}
          {Array.isArray(blocks.blockF?.interviewQuestions) && blocks.blockF.interviewQuestions.length > 0 && (
            <div className="career-report-section">
              <strong>🎤 {t('Bloc F — Question Entretien STAR+R :')}</strong>
              <div style={{ fontStyle: 'italic', marginTop: '2px', color: 'var(--color-text-secondary)' }}>
                « {String(blocks.blockF.interviewQuestions[0])} »
              </div>
            </div>
          )}

          {/* Block G: Legitimacy & Ghost Job Check */}
          <div className="career-report-section">
            <strong>🛡️ {t('Bloc G — Vérification Légitimité :')}</strong> {String(blocks.blockG?.legitimacyStatus || 'Vérifié')} ({t('Risque Ghost Job :')} {String(blocks.blockG?.ghostJobRisk || 'Faible')})
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="career-job-footer">
        <div className="career-job-actions-left">
          <button
            onClick={() => onSaveJob(job)}
            className={`career-icon-btn ${isSaved ? 'saved' : ''}`}
            title={isSaved ? t('Offre sauvegardée') : t('Sauvegarder l\'offre')}
            aria-label={t('Sauvegarder')}
          >
            <span>{isSaved ? '★' : '☆'}</span>
            <span>{isSaved ? t('Sauvegardée') : t('Sauvegarder')}</span>
          </button>

          <button
            onClick={() => setShowReport(!showReport)}
            className="career-icon-btn"
          >
            <span>📊</span>
            <span>{showReport ? t('Masquer rapport') : t('Rapport CareerOps')}</span>
          </button>

          {job.url && job.url !== '#' && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="career-link-btn"
              title={t('Ouvrir l\'annonce originale dans un nouvel onglet')}
            >
              <span>{t('Voir l\'offre')}</span>
              <span>↗</span>
            </a>
          )}
        </div>

        <button
          onClick={() => onAdaptClick(job)}
          disabled={isAdapting}
          className="btn-primary career-adapt-btn"
        >
          {isAdapting ? (
            <>
              <div className="career-btn-spinner" />
              <span>{t('Adaptation en cours...')}</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>{t('1-Clic Adapter & Postuler')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
