import React, { useState } from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export default function JobCard({
  job,
  matchDetails,
  onAdaptClick,
  onSaveJob,
  isSaved = false,
  isAdapting = false
}) {
  const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);

  const scoreAts = matchDetails?.score ?? 0;
  const rating = matchDetails?.scoreRating ?? (scoreAts > 0 ? (scoreAts / 20).toFixed(1) : '1.0');
  const verdict = matchDetails?.verdict || (scoreAts >= 80 ? t('Top Match (Recommandé)') : scoreAts >= 50 ? t('Match Modéré') : t('Écart important'));
  const blocks = matchDetails?.careerOpsBlocks;

  // Determine styling based on Rating
  let scorePillClass = 'career-ats-pill score-mid';
  if (scoreAts === 0) {
    scorePillClass = 'career-ats-pill score-low';
  } else if (rating >= 4.0 || scoreAts >= 80) {
    scorePillClass = 'career-ats-pill score-high';
  } else if (rating < 3.0 || scoreAts < 50) {
    scorePillClass = 'career-ats-pill score-low';
  }

  return (
    <div className="career-job-card">
      {/* Header: Title + CareerOps Score */}
      <div className="career-job-header">
        <div className="career-job-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 className="career-job-title">{job.title}</h3>
            {job.isRemote && (
              <span className="career-tag-pill remote">
                🌐 {t('100% Télétravail')}
              </span>
            )}
          </div>
          <div className="career-job-meta">
            <span>🏢 <strong>{job.company}</strong></span>
            {job.sector && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{job.sector}</span>
              </>
            )}
            <span>•</span>
            <span>📍 {job.location}</span>
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
            <span>{scoreAts > 0 ? `⭐ ${rating}/5.0 • ${scoreAts}% ATS` : `📄 ${t('0% ATS')}`}</span>
          </div>
          <span className="career-ats-label">{verdict}</span>
        </div>
      </div>

      {/* Contract, Salary & Source Tags */}
      <div className="career-job-tags">
        <span className="career-tag-pill">
          📄 {job.contractType || 'CDI'}
        </span>
        {job.salary && (
          <span className="career-tag-pill salary">
            💰 {job.salary}
          </span>
        )}
        <span className="career-tag-pill" style={{ opacity: 0.85 }}>
          🔍 {job.source || 'Direct Job Board'}
        </span>
      </div>

      {/* Skills Match Chips (Block B Summary) */}
      <div className="career-skills-row">
        {/* Matched skills */}
        {(matchDetails?.matchedSkills || []).slice(0, 5).map((skill, idx) => (
          <span key={`match-${idx}`} className="career-skill-chip matched">
            ✓ {skill}
          </span>
        ))}

        {/* Missing skills */}
        {(matchDetails?.missingSkills || []).slice(0, 3).map((skill, idx) => (
          <span key={`miss-${idx}`} className="career-skill-chip missing" title={t('Compétence demandée à valoriser')}>
            + {skill}
          </span>
        ))}
      </div>

      {/* Snippet Description */}
      <p className="career-job-description">
        {job.description}
      </p>

      {/* Expandable CareerOps A-G Rubric Report */}
      {showReport && blocks && (
        <div style={{
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          margin: '12px 0',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-accent)' }}>
            📊 {t('Rapport d\'Évaluation CareerOps (Rubric A-G)')}
          </div>

          {/* Block B: Gap Analysis */}
          <div>
            <strong>🎯 {t('Bloc B — Analyse des Écarts (Gaps) :')}</strong>
            <div style={{ marginTop: '4px' }}>
              <span style={{ color: 'var(--color-success)' }}>✓ {blocks.blockB?.matchedSkills?.length || 0} {t('compétences maîtrisées')}</span>
              {' • '}
              <span style={{ color: 'var(--color-warning)' }}>⚠️ {blocks.blockB?.missingSkills?.length || 0} {t('compétences à valoriser')}</span>
            </div>
          </div>

          {/* Block C & D: Leveling & Comp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <strong>📈 {t('Bloc C — Niveau :')}</strong> {blocks.blockC?.seniority || '-'}
            </div>
            <div>
              <strong>💰 {t('Bloc D — Rémunération :')}</strong> {blocks.blockD?.salaryEstimate || '-'}
            </div>
          </div>

          {/* Block E: Harvard XYZ Blueprint */}
          {blocks.blockE?.suggestedMetrics?.length > 0 && (
            <div>
              <strong>📝 {t('Bloc E — Blueprint Harvard XYZ :')}</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {blocks.blockE.suggestedMetrics.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Block F: STAR+R Interview Prep */}
          {blocks.blockF?.interviewQuestions?.length > 0 && (
            <div>
              <strong>🎤 {t('Bloc F — Question Entretien STAR+R :')}</strong>
              <div style={{ fontStyle: 'italic', marginTop: '2px', color: 'var(--color-text-secondary)' }}>
                « {blocks.blockF.interviewQuestions[0]} »
              </div>
            </div>
          )}

          {/* Block G: Legitimacy & Ghost Job Check */}
          <div>
            <strong>🛡️ {t('Bloc G — Vérification Légitimité :')}</strong> {blocks.blockG?.legitimacyStatus} ({t('Risque Ghost Job :')} {blocks.blockG?.ghostJobRisk})
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
            {isSaved ? '★' : '☆'} <span>{isSaved ? t('Sauvegardée') : t('Sauvegarder')}</span>
          </button>

          <button
            onClick={() => setShowReport(!showReport)}
            className="career-icon-btn"
            style={{ fontSize: '11.5px' }}
          >
            📊 {showReport ? t('Masquer le rapport') : t('Rapport CareerOps')}
          </button>

          {job.url && job.url !== '#' && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="career-link-btn"
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
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
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
