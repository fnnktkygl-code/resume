import React from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export default function JobCard({
  job,
  matchDetails,
  onAdaptClick,
  onViewDetails,
  onSaveJob,
  isSaved = false,
  isAdapting = false
}) {
  const { t } = useTranslation();
  const score = matchDetails?.score || 50;

  // Determine color theme based on ATS Score
  let scoreBadgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  let scoreColor = '#F59E0B';
  let scoreLabel = t('Bon Match');

  if (score >= 85) {
    scoreBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    scoreColor = '#10B981';
    scoreLabel = t('Top Match');
  } else if (score < 60) {
    scoreBadgeClass = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    scoreColor = '#64748B';
    scoreLabel = t('Match Modéré');
  }

  return (
    <div 
      className="job-card group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderColor: 'var(--color-border, #e2e8f0)'
      }}
    >
      {/* Top row: Title + ATS Match Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
              {job.title}
            </span>
            {job.isRemote && (
              <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                🌐 {t('100% Télétravail')}
              </span>
            )}
          </div>
          <p className="text-sm font-medium opacity-80 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            🏢 {job.company} • 📍 {job.location}
            {matchDetails?.locationDistanceKm != null && matchDetails.locationDistanceKm > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-normal">
                ~{matchDetails.locationDistanceKm} km
              </span>
            )}
          </p>
        </div>

        {/* ATS Score Dial / Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
          <div 
            className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${scoreBadgeClass}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scoreColor }} />
            <span>{score}% ATS</span>
          </div>
          <span className="text-[11px] opacity-70 font-medium">{scoreLabel}</span>
        </div>
      </div>

      {/* Badges: Contract, Salary, Source */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-medium">
          📄 {job.contractType || 'CDI'}
        </span>
        {job.salary && (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
            💰 {job.salary}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-medium opacity-80">
          🔍 {job.source || 'CareerOps'}
        </span>
      </div>

      {/* Skills Match Section */}
      <div className="mb-4 text-xs">
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Matched skills */}
          {(matchDetails?.matchedSkills || []).slice(0, 5).map((skill, idx) => (
            <span 
              key={`match-${idx}`}
              className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1"
            >
              ✓ {skill}
            </span>
          ))}

          {/* Missing skills */}
          {(matchDetails?.missingSkills || []).slice(0, 3).map((skill, idx) => (
            <span 
              key={`miss-${idx}`}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 opacity-80"
              title={t('Compétence demandée à valoriser')}
            >
              + {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Snippet */}
      <p className="text-xs line-clamp-2 mb-4 leading-relaxed opacity-75" style={{ color: 'var(--color-text)' }}>
        {job.description}
      </p>

      {/* Card Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveJob(job)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              isSaved 
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            title={isSaved ? t('Offre sauvegardée') : t('Sauvegarder l\'offre')}
            aria-label={t('Sauvegarder')}
          >
            {isSaved ? '★' : '☆'}
          </button>

          {job.url && job.url !== '#' && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
            >
              {t('Voir l\'offre')} ↗
            </a>
          )}
        </div>

        {/* 1-Click Adaptation Action Button */}
        <button
          onClick={() => onAdaptClick(job)}
          disabled={isAdapting}
          className="btn-primary text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isAdapting ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" />
              </svg>
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
