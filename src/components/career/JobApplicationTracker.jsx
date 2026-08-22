import React, { useState } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { updateApplicationStatus, deleteApplication } from '../../services/careerOpsService';

const STATUS_COLUMNS = [
  { key: 'saved', label: '★ Sauvegardées', color: '#64748B' },
  { key: 'tailored', label: '⚡ CV & Lettre Prêts', color: '#3B82F6' },
  { key: 'applied', label: '📨 Candidatures Envoyées', color: '#F59E0B' },
  { key: 'interview', label: '🤝 Entretiens', color: '#8B5CF6' },
  { key: 'offer', label: '🎉 Offres Reçues', color: '#10B981' }
];

export default function JobApplicationTracker({
  applications = [],
  onUpdateApplications,
  onLoadTailoredResume,
  onOpenLetter
}) {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');

  const handleStatusChange = (appId, newStatus) => {
    const updated = updateApplicationStatus(appId, newStatus);
    onUpdateApplications(updated);
  };

  const handleDelete = (appId) => {
    if (window.confirm(t('Voulez-vous supprimer cette candidature de votre suivi ?'))) {
      const updated = deleteApplication(appId);
      onUpdateApplications(updated);
    }
  };

  return (
    <div className="career-tracker flex flex-col gap-6">
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
            📊 {t('Suivi de Candidatures (Pipeline Kanban)')}
          </h3>
          <p className="text-xs opacity-75 mt-0.5">
            {applications.length} {t('candidature(s) suivie(s) en mémoire locale')}
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('Toutes')} ({applications.length})
          </button>
          {STATUS_COLUMNS.map((col) => {
            const count = applications.filter((a) => a.status === col.key).length;
            return (
              <button
                key={col.key}
                onClick={() => setFilterStatus(col.key)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  filterStatus === col.key
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {col.label.split(' ')[0]} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Columns / Cards */}
      {applications.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-semibold text-sm mb-1">{t('Aucune candidature en cours')}</p>
          <p className="text-xs opacity-75 max-w-md mx-auto">
            {t('Recherchez des offres d\'emploi dans l\'onglet "Recherche & Matching IA", puis cliquez sur "Adapter" ou "Sauvegarder" pour les suivre ici.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications
            .filter((a) => filterStatus === 'all' || a.status === filterStatus)
            .map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between gap-3 transition-all hover:border-slate-400"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                      {app.jobTitle || app.title}
                    </span>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-xs text-red-500 hover:text-red-700 p-1 opacity-70 hover:opacity-100"
                      title={t('Supprimer')}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs font-medium opacity-80 mb-2">
                    🏢 {app.company} {app.location ? `• 📍 ${app.location}` : ''}
                  </p>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-[11px] opacity-70 font-semibold">{t('Statut :')}</label>
                    <select
                      value={app.status || 'saved'}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium"
                    >
                      {STATUS_COLUMNS.map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick actions for tailored resume / cover letter */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  {app.tailoredResume && (
                    <button
                      onClick={() => onLoadTailoredResume(app.tailoredResume)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-500/20"
                    >
                      📄 {t('Charger CV')}
                    </button>
                  )}
                  {app.coverLetter && (
                    <button
                      onClick={() => onOpenLetter(app.coverLetter)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/20"
                    >
                      ✉️ {t('Voir Lettre')}
                    </button>
                  )}
                  {app.url && app.url !== '#' && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 ml-auto"
                    >
                      ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
