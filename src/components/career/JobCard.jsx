import React from 'react';
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
  const score = matchDetails?.score || 50;

  // Determine styling based on ATS Score
  let scorePillClass = 'career-ats-pill score-mid';
  let scoreLabel = t('Bon Match');

  if (score >= 80) {
    scorePillClass = 'career-ats-pill score-high';
    scoreLabel = t('Top Match');
  } else if (score < 50) {
    scorePillClass = 'career-ats-pill score-low';
    scoreLabel = t('Match Modéré');
  }

  return (
    <div className="career-job-card">
      {/* Header: Title + ATS Pill */}
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
            <span>•</span>
            <span>📍 {job.location}</span>
            {matchDetails?.locationDistanceKm != null && matchDetails.locationDistanceKm > 0 && (
              <span className="career-distance-badge">
                ~{matchDetails.locationDistanceKm} km
              </span>
            )}
          </div>
        </div>

        {/* ATS Score Indicator */}
        <div className="career-ats-score-box">
          <div className={scorePillClass}>
            <span>🎯 {score}% ATS</span>
          </div>
          <span className="career-ats-label">{scoreLabel}</span>
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
        <span className="career-tag-pill" style={{ opacity: 0.8 }}>
          🔍 {job.source || 'France Travail'}
        </span>
      </div>

      {/* Skills Match Chips */}
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

          {job.url && job.url !== '#' && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="career-icon-btn"
            >
              <span>{t('Voir l\'offre')}</span> ↗
            </a>
          )}
        </div>

        {/* 1-Click Adaptation Action Button */}
        <button
          onClick={() => onAdaptClick(job)}
          disabled={isAdapting}
          className="career-btn-1click"
        >
          {isAdapting ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
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
              <span>{t('Adapter CV & Lettre (1-Clic)')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
