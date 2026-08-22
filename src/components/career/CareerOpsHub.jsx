import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../ui/Modal';
import JobCard from './JobCard';
import JobApplicationTracker from './JobApplicationTracker';
import VisualDiff from '../ui/VisualDiff';
import { useTranslation } from '../../utils/TranslationContext';
import { searchCareerJobs, batchAdaptForJob, getSavedApplications, saveApplication } from '../../services/careerOpsService';
import { matchResumeWithJob } from '../../utils/careerOpsMatcher';
import { mergeSelected } from '../../utils/mergeSelected';

const PREFS_STORAGE_KEY = 'resume-career-ops-prefs';

export default function CareerOpsHub({
  isOpen,
  onClose,
  resumeData,
  onApplyTailoredResume,
  onOpenCoverLetter,
  language = 'fr'
}) {
  const { t } = useTranslation();

  // Active Tab: 'search' | 'tracker'
  const [activeTab, setActiveTab] = useState('search');

  // Search parameters
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [contractType, setContractType] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Results & Loading state
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [error, setError] = useState('');

  // 1-Click Batch Pipeline State
  const [adaptingJobId, setAdaptingJobId] = useState(null);
  const [adaptationProgress, setAdaptationProgress] = useState('');
  const [reviewData, setReviewData] = useState(null); // { job, tailoredResume, coverLetter, matchDetails }
  const [selectedDiffIds, setSelectedDiffIds] = useState(new Set());

  // Tracker saved applications
  const [applications, setApplications] = useState([]);

  // Load saved preferences and initial jobs on mount / open
  useEffect(() => {
    if (isOpen) {
      setApplications(getSavedApplications());

      // Auto-detect default query from user tagline or skills
      try {
        const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.query) setQuery(parsed.query);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.radiusKm) setRadiusKm(parsed.radiusKm);
          if (parsed.contractType) setContractType(parsed.contractType);
          if (parsed.remoteOnly != null) setRemoteOnly(parsed.remoteOnly);
        } else {
          // Prefill with resume tagline and location
          const defaultQuery = resumeData?.personal?.tagline || '';
          const defaultLoc = resumeData?.personal?.location || 'Paris';
          setQuery(defaultQuery);
          setLocation(defaultLoc);
        }
      } catch {}

      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async (overrideParams = {}) => {
    setIsLoadingJobs(true);
    setError('');

    const searchParams = {
      query: overrideParams.query ?? query,
      location: overrideParams.location ?? location,
      radiusKm: overrideParams.radiusKm ?? radiusKm,
      contractType: overrideParams.contractType ?? contractType,
      remoteOnly: overrideParams.remoteOnly ?? remoteOnly
    };

    // Save preferences
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(searchParams));
    } catch {}

    try {
      const results = await searchCareerJobs(searchParams);
      setJobs(results);
    } catch (err) {
      setError(t('Impossible de charger les offres.'));
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Calculate ATS match for all fetched jobs in real-time
  const matchedJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    const userPrefs = { location, radiusKm };
    const withScores = jobs.map((job) => {
      const matchDetails = matchResumeWithJob(resumeData, job, userPrefs);
      return {
        job,
        matchDetails
      };
    });

    // Sort descending by ATS Match Score
    return withScores.sort((a, b) => b.matchDetails.score - a.matchDetails.score);
  }, [jobs, resumeData, location, radiusKm]);

  // ⚡ 1-Click Trigger: Adapt CV + Cover Letter
  const handleTrigger1ClickAdapt = async (job) => {
    setAdaptingJobId(job.id);
    setAdaptationProgress(t('⚡ Analyse ATS & Adaptation chirurgicale du CV...'));
    setError('');

    try {
      const result = await batchAdaptForJob(resumeData, job, language);
      setReviewData({
        job,
        tailoredResume: result.tailoredResume,
        coverLetter: result.coverLetter,
        matchDetails: result.matchDetails
      });
    } catch (err) {
      setError(err.message || t('Échec de l\'adaptation automatique.'));
    } finally {
      setAdaptingJobId(null);
      setAdaptationProgress('');
    }
  };

  const handleSaveJob = (job) => {
    const updated = saveApplication({
      id: `app-${job.id}`,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      status: 'saved',
      jobOffer: job
    });
    setApplications(updated);
  };

  const handleDiffSelectionChange = useCallback((ids) => {
    setSelectedDiffIds(ids);
  }, []);

  const handleApplyReviewChanges = () => {
    if (!reviewData) return;

    // Merge selected changes into active resume
    const merged = mergeSelected(resumeData, reviewData.tailoredResume, selectedDiffIds);
    merged.targetJobDescription = `${reviewData.job.title} chez ${reviewData.job.company}\n\n${reviewData.job.description}`;
    
    // Save to application tracker
    const updated = saveApplication({
      id: `app-${reviewData.job.id}`,
      jobTitle: reviewData.job.title,
      company: reviewData.job.company,
      location: reviewData.job.location,
      url: reviewData.job.url,
      status: 'tailored',
      tailoredResume: merged,
      coverLetter: reviewData.coverLetter,
      jobOffer: reviewData.job
    });
    setApplications(updated);

    onApplyTailoredResume(merged);
    setReviewData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!adaptingJobId ? onClose : () => {}}
      title={`🎯 ${t('Big CareerOps — Agrégateur & Candidature 1-Clic')}`}
      maxWidth="1100px"
      actions={
        reviewData ? (
          <>
            <button className="btn-secondary" onClick={() => setReviewData(null)}>
              {t('Retour aux offres')}
            </button>
            <button className="btn-primary" onClick={handleApplyReviewChanges}>
              {t('✅ Appliquer les modifications au CV')}
            </button>
          </>
        ) : (
          <button className="btn-secondary" onClick={onClose}>
            {t('Fermer')}
          </button>
        )
      }
    >
      <div className="career-ops-container flex flex-col gap-5 text-sm">
        {/* Top Tab Bar (Recherche vs Tracker) */}
        {!reviewData && (
          <div className="flex items-center justify-between border-b pb-3 gap-2 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all text-xs flex items-center gap-1.5 ${
                  activeTab === 'search'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>🔍</span>
                <span>{t('Offres & Matching IA')}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 font-bold">
                  {matchedJobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all text-xs flex items-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>📊</span>
                <span>{t('Suivi de Candidatures')}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-600 font-bold">
                  {applications.length}
                </span>
              </button>
            </div>

            {/* Candidate Quick Context */}
            <div className="text-xs opacity-75 hidden sm:block">
              👤 <strong>{resumeData?.personal?.name || t('Candidat')}</strong> • {resumeData?.personal?.tagline || t('Profil Actif')}
            </div>
          </div>
        )}

        {/* REVIEW SCREEN: Instant Diff & Letter Preview */}
        {reviewData ? (
          <div className="review-flow animate-fade-in flex flex-col gap-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ✨ {t('Adaptation 1-Clic Terminée pour')} : {reviewData.job.title} ({reviewData.job.company})
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {t('Vérifiez les modifications apportées à votre CV ci-dessous avant de valider.')}
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 text-emerald-600 border border-emerald-500/30">
                🎯 {reviewData.matchDetails.score}% ATS Match
              </div>
            </div>

            {/* Visual Diff for Resume */}
            <div>
              <h5 className="font-semibold text-xs mb-2 opacity-80 uppercase tracking-wider">
                1. {t('Modifications suggérées sur votre CV')} :
              </h5>
              <VisualDiff
                original={resumeData}
                modified={reviewData.tailoredResume}
                onSelectionChange={handleDiffSelectionChange}
              />
            </div>

            {/* Generated Cover Letter Preview */}
            {reviewData.coverLetter && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-xs opacity-80 uppercase tracking-wider">
                    2. {t('Lettre de motivation personnalisée générée')} :
                  </h5>
                  <button
                    onClick={() => onOpenCoverLetter && onOpenCoverLetter(reviewData.coverLetter)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {t('Ouvrir dans l\'éditeur complet')} ↗
                  </button>
                </div>
                <textarea
                  readOnly
                  value={reviewData.coverLetter}
                  className="w-full h-40 p-3 rounded-xl border text-xs font-mono bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        ) : activeTab === 'tracker' ? (
          /* KANBAN APPLICATION TRACKER TAB */
          <JobApplicationTracker
            applications={applications}
            onUpdateApplications={setApplications}
            onLoadTailoredResume={(tailored) => {
              onApplyTailoredResume(tailored);
              onClose();
            }}
            onOpenLetter={(letter) => {
              if (onOpenCoverLetter) onOpenCoverLetter(letter);
              onClose();
            }}
          />
        ) : (
          /* SEARCH & ATS MATCHING TAB */
          <div className="search-flow flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search Keywords */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {t('Poste recherché / Mots-clés')}
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('ex: Développeur React, Data Engineer, Chef de projet...')}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    📍 {t('Ville / Localisation')}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('ex: Paris, Lyon, Bordeaux, Remote...')}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Search Action Button */}
                <div className="sm:col-span-2 flex items-end">
                  <button
                    onClick={() => handleSearch()}
                    disabled={isLoadingJobs}
                    className="btn-primary w-full py-2 text-xs rounded-xl font-semibold flex items-center justify-center gap-1 shadow-sm"
                  >
                    {isLoadingJobs ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>{t('Filtrer')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Secondary Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Radius */}
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-75">📏 {t('Rayon :')}</span>
                    <select
                      value={radiusKm}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRadiusKm(val);
                        handleSearch({ radiusKm: val });
                      }}
                      className="px-2 py-1 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                      <option value={500}>{t('National')}</option>
                    </select>
                  </div>

                  {/* Contract Type */}
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-75">📄 {t('Contrat :')}</span>
                    <select
                      value={contractType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContractType(val);
                        handleSearch({ contractType: val });
                      }}
                      className="px-2 py-1 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="all">{t('Tous les contrats')}</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Stage">Stage</option>
                      <option value="Alternance">Alternance</option>
                    </select>
                  </div>

                  {/* Remote Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setRemoteOnly(val);
                        handleSearch({ remoteOnly: val });
                      }}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <span>🌐 {t('Télétravail uniquement')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
                ⚠️ {error}
              </div>
            )}

            {/* Loading or Progress Indicator */}
            {adaptingJobId && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-pulse">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    {adaptationProgress}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {t('Génération en parallèle du CV sur-mesure et de la lettre de motivation...')}
                  </p>
                </div>
              </div>
            )}

            {/* Job Offers List sorted by ATS Match */}
            <div className="grid grid-cols-1 gap-4">
              {isLoadingJobs ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="font-medium text-xs opacity-80">{t('Analyse des offres et calcul de compatibilité ATS...')}</p>
                </div>
              ) : matchedJobs.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-semibold text-sm mb-1">{t('Aucune offre trouvée pour ces critères')}</p>
                  <p className="text-xs opacity-75">{t('Élargissez votre recherche géographique ou modifiez l\'intitulé de poste.')}</p>
                </div>
              ) : (
                matchedJobs.map(({ job, matchDetails }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchDetails={matchDetails}
                    isSaved={applications.some((a) => a.id === `app-${job.id}`)}
                    isAdapting={adaptingJobId === job.id}
                    onAdaptClick={handleTrigger1ClickAdapt}
                    onSaveJob={handleSaveJob}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
