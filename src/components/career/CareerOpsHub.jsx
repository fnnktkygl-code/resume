import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../ui/Modal';
import JobCard from './JobCard';
import JobApplicationTracker from './JobApplicationTracker';
import { useTranslation } from '../../utils/TranslationContext';
import { matchResumeWithJob } from '../../utils/careerOpsMatcher';
import {
  searchCareerJobs,
  batchAdaptForJob,
  getSavedApplications,
  saveApplication,
  updateApplicationStatus,
  deleteApplication
} from '../../services/careerOpsService';

const STANDARD_INDUSTRY_DOMAINS = [
  { nameFr: 'Tous les secteurs', nameEn: 'All Industries', nameEs: 'Todos los sectores', value: 'all', icon: '🌐' },
  { nameFr: 'Artisanat & Métiers de bouche', nameEn: 'Crafts & Food Trades', nameEs: 'Artesanía y Alimentación', value: 'Artisanat', query: 'Artisanat', icon: '🥖' },
  { nameFr: 'Santé, Soins & Paramédical', nameEn: 'Healthcare & Nursing', nameEs: 'Salud y Cuidados', value: 'Santé', query: 'Santé', icon: '🏥' },
  { nameFr: 'Commerce, Vente & Distribution', nameEn: 'Retail & Sales', nameEs: 'Comercio y Ventas', value: 'Commerce', query: 'Vente', icon: '🛍️' },
  { nameFr: 'BTP, Bâtiment & Énergie', nameEn: 'Construction & Energy', nameEs: 'Construcción y Energía', value: 'BTP', query: 'BTP', icon: '🏗️' },
  { nameFr: 'Gestion, Comptabilité & RH', nameEn: 'Finance, HR & Admin', nameEs: 'Gestión, Finanzas y RRHH', value: 'Comptabilité', query: 'Comptabilité', icon: '💼' },
  { nameFr: 'Transport, Logistique & Achat', nameEn: 'Logistics & Supply Chain', nameEs: 'Transporte y Logística', value: 'Logistique', query: 'Logistique', icon: '🚚' },
  { nameFr: 'Hôtellerie & Restauration', nameEn: 'Hospitality & Catering', nameEs: 'Hostelería y Restauración', value: 'Restauration', query: 'Restauration', icon: '🍽️' },
  { nameFr: 'Informatique, Digital & Télécoms', nameEn: 'Tech, IT & Software', nameEs: 'Informática y Tecnología', value: 'Tech', query: 'Informatique', icon: '💻' },
  { nameFr: 'Industrie & Ingénierie', nameEn: 'Manufacturing & Engineering', nameEs: 'Industria e Ingeniería', value: 'Industrie', query: 'Industrie', icon: '⚙️' }
];

export default function CareerOpsHub({
  isOpen,
  onClose,
  resumeData,
  onApplyTailoredResume,
  language = 'fr'
}) {
  const { t } = useTranslation();

  // Navigation tabs: 'search' | 'tracker' | 'review'
  const [activeTab, setActiveTab] = useState('search');

  // Search & Filter state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [radiusKm, setRadiusKm] = useState(50);
  const [contractType, setContractType] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Adaptation & Review state
  const [adaptingJobId, setAdaptingJobId] = useState(null);
  const [adaptationProgress, setAdaptationProgress] = useState(null);
  const [pendingReview, setPendingReview] = useState(null); // { job, tailoredResume, coverLetter }
  const [viewingCoverLetter, setViewingCoverLetter] = useState(null);

  // Candidate CV context
  const candidateTagline = resumeData?.personal?.tagline?.trim() || '';
  const candidateLocation = resumeData?.personal?.location?.trim() || '';

  // Search execution
  const executeSearch = useCallback(async (searchQuery = query, searchLocation = location, sector = selectedSector) => {
    setIsLoadingJobs(true);
    setErrorMessage('');
    setHasSearched(true);
    try {
      const fetchedJobs = await searchCareerJobs({
        query: searchQuery,
        location: searchLocation,
        sector,
        contractType,
        remoteOnly,
        radius: radiusKm
      });
      setJobs(fetchedJobs);
    } catch (err) {
      setErrorMessage(err.message || t('Une erreur est survenue lors de la recherche'));
    } finally {
      setIsLoadingJobs(false);
    }
  }, [query, location, selectedSector, contractType, remoteOnly, radiusKm, t]);

  // Initialize search criteria from user resume data
  useEffect(() => {
    if (isOpen && resumeData) {
      if (candidateTagline && !query) {
        setQuery(candidateTagline);
      }
      if (candidateLocation && !location) {
        setLocation(candidateLocation);
      }

      // If user has a specific tagline or trade in their CV, auto-search for THEIR trade
      if (candidateTagline && !hasSearched) {
        executeSearch(candidateTagline, candidateLocation || location, selectedSector);
      }
    }
  }, [isOpen, resumeData, candidateTagline, candidateLocation, query, location, selectedSector, hasSearched, executeSearch]);

  // Load saved applications
  const loadApps = useCallback(() => {
    try {
      const list = getSavedApplications();
      setApplications(list);
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadApps();
    }
  }, [isOpen, loadApps]);

  // Quick-select an industry domain
  const handleSelectDomain = (domain) => {
    if (domain.value === 'all') {
      setSelectedSector('all');
      executeSearch('', location, 'all');
    } else {
      setSelectedSector(domain.value);
      setQuery(domain.query || domain.nameFr);
      executeSearch(domain.query || domain.nameFr, location, domain.value);
    }
  };

  // Computed matching details for all jobs
  const rankedJobs = useMemo(() => {
    if (!resumeData || !jobs.length) return jobs;

    const scored = jobs.map((job) => {
      const match = matchResumeWithJob(resumeData, job, {
        userCity: location || candidateLocation,
        maxRadiusKm: radiusKm
      });
      return {
        ...job,
        matchDetails: match
      };
    });

    // Sort by ATS score descending
    return scored.sort((a, b) => (b.matchDetails?.score || 0) - (a.matchDetails?.score || 0));
  }, [jobs, resumeData, location, candidateLocation, radiusKm]);

  // Handle Save / Bookmark Job
  const handleSaveJob = (job) => {
    const existing = applications.find((a) => a.jobId === job.id);
    if (existing) {
      const updated = deleteApplication(existing.id);
      setApplications(updated);
    } else {
      const newApp = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        status: 'saved',
        matchScore: job.matchDetails?.score || 0,
        jobUrl: job.url
      };
      const updated = saveApplication(newApp);
      setApplications(updated);
    }
  };

  // Handle 1-Click Adaptation
  const handle1ClickAdapt = async (job) => {
    setAdaptingJobId(job.id);
    setAdaptationProgress({
      step: 1,
      total: 3,
      label: t('Analyse de l\'offre et calcul des mots-clés ATS...')
    });

    try {
      setTimeout(() => {
        setAdaptationProgress({
          step: 2,
          total: 3,
          label: t('Ajustement du CV & valorisation des compétences...')
        });
      }, 900);

      const result = await batchAdaptForJob(resumeData, job, language);

      setAdaptationProgress({
        step: 3,
        total: 3,
        label: t('Finalisation de la lettre de motivation...')
      });

      // Save into tracker as tailored
      const appRecord = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        status: 'tailored',
        matchScore: job.matchDetails?.score || 85,
        tailoredResume: result.tailoredResume,
        coverLetter: result.coverLetter,
        jobUrl: job.url
      };
      const updatedApps = saveApplication(appRecord);
      setApplications(updatedApps);

      // Open Visual Diff Review screen
      setPendingReview({
        job,
        tailoredResume: result.tailoredResume,
        coverLetter: result.coverLetter
      });
      setActiveTab('review');
    } catch (err) {
      setErrorMessage(err.message || t('Échec de l\'adaptation'));
    } finally {
      setAdaptingJobId(null);
      setAdaptationProgress(null);
    }
  };

  // Handle Diff Application
  const handleAcceptTailoredResume = () => {
    if (pendingReview?.tailoredResume) {
      onApplyTailoredResume(pendingReview.tailoredResume);
      setPendingReview(null);
      setActiveTab('tracker');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="920px"
      title={t('🎯 Big CareerOps — Recherche & Candidature 1-Clic')}
      ariaLabelledby="career-ops-modal-title"
    >
      <div className="career-ops-hub">
        {/* Top Navigation Tabs */}
        <div className="career-top-nav">
          <div className="career-tab-group">
            <button
              onClick={() => setActiveTab('search')}
              className={`career-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            >
              <span>🔍</span>
              <span>{t('Offres & Matching IA')}</span>
              {hasSearched && (
                <span className="career-tab-count">{rankedJobs.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`career-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            >
              <span>📊</span>
              <span>{t('Suivi de Candidatures')}</span>
              <span className="career-tab-count blue">{applications.length}</span>
            </button>

            {pendingReview && (
              <button
                onClick={() => setActiveTab('review')}
                className={`career-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                style={{ color: 'var(--color-accent)' }}
              >
                <span>⚡</span>
                <span>{t('Revue Express')}</span>
              </button>
            )}
          </div>

          <div className="career-candidate-badge">
            <span>👤</span>
            <span><strong>{resumeData?.personal?.name || t('Candidat')}</strong></span>
            {candidateTagline ? (
              <span style={{ opacity: 0.8 }}>• {candidateTagline}</span>
            ) : (
              <span style={{ opacity: 0.6, fontStyle: 'italic' }}>• {t('Tous secteurs')}</span>
            )}
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: Search & AI Job Board */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Filter Box */}
            <div className="career-filter-box">
              <div className="career-filter-grid">
                <div className="career-input-field">
                  <label>{t('Métier recherché / Mots-clés')}</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                    placeholder={t('ex : Boulanger, Infirmier, Commercial, Comptable, Développeur...')}
                  />
                </div>

                <div className="career-input-field">
                  <label>📍 {t('Ville / Localisation')}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                    placeholder={t('ex : Paris, Lyon, Bordeaux, Marseille...')}
                  />
                </div>

                <div className="career-filter-btn-cell">
                  <button
                    onClick={() => executeSearch()}
                    disabled={isLoadingJobs}
                    className="btn-primary"
                    style={{ height: '40px', padding: '0 22px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    {isLoadingJobs ? (
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>{t('Rechercher & Filtrer')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-filters: Industry Domain, Radius, Contract, Remote */}
              <div className="career-filter-row">
                <div className="career-filter-options">
                  <div className="career-filter-option-item">
                    <span style={{ color: 'var(--color-text-secondary)' }}>🏢 {t('Secteur :')}</span>
                    <select
                      value={selectedSector}
                      onChange={(e) => {
                        setSelectedSector(e.target.value);
                        executeSearch(query, location, e.target.value);
                      }}
                      aria-label="Secteur d'activité"
                    >
                      {STANDARD_INDUSTRY_DOMAINS.map((dom) => (
                        <option key={dom.value} value={dom.value}>
                          {dom.icon} {language === 'fr' ? dom.nameFr : language === 'es' ? dom.nameEs : dom.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="career-filter-option-item">
                    <span style={{ color: 'var(--color-text-secondary)' }}>📏 {t('Rayon :')}</span>
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      aria-label="Rayon géographique"
                    >
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                      <option value={500}>{t('France entière')}</option>
                    </select>
                  </div>

                  <div className="career-filter-option-item">
                    <span style={{ color: 'var(--color-text-secondary)' }}>📄 {t('Contrat :')}</span>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      aria-label="Type de contrat"
                    >
                      <option value="all">{t('Tous les contrats')}</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Stage">Stage</option>
                      <option value="Alternance">Alternance</option>
                    </select>
                  </div>

                  <label className="career-checkbox-label">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                    />
                    <span>🌐 {t('Télétravail uniquement')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Adaptation Progress Overlay Modal/Banner */}
            {adaptationProgress && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-accent-light)',
                border: '1px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(27, 107, 58, 0.2)',
                  borderTopColor: 'var(--color-accent)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-accent)' }}>
                    ⚡ {t('Adaptation 1-Clic en cours')} ({adaptationProgress.step}/{adaptationProgress.total})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>
                    {adaptationProgress.label}
                  </div>
                </div>
              </div>
            )}

            {/* Job Listings / Onboarding State */}
            <div className="career-job-list">
              {isLoadingJobs ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(27, 107, 58, 0.2)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {t('Recherche des offres réelles et calcul de compatibilité ATS en direct...')}
                  </p>
                </div>
              ) : !hasSearched && jobs.length === 0 ? (
                /* Welcome / Discovery State when user hasn't typed a search */
                <div style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ fontSize: '36px' }}>🎯</div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>
                      {t('Recherchez des offres dans n\'importe quel domaine d\'activité')}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
                      {t('Saisissez votre métier et votre ville ci-dessus ou choisissez un secteur d\'activité standard pour accéder aux offres en direct (France Travail, Indeed, LinkedIn, etc.).')}
                    </p>
                  </div>

                  {/* Standard Industry Sector Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    width: '100%',
                    marginTop: '8px'
                  }}>
                    {STANDARD_INDUSTRY_DOMAINS.filter(d => d.value !== 'all').map((dom, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectDomain(dom)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface-alt)',
                          color: 'var(--color-text)',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{dom.icon}</span>
                        <span>{language === 'fr' ? dom.nameFr : language === 'es' ? dom.nameEs : dom.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : rankedJobs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔎</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>
                    {t('Aucune offre trouvée pour')} « {query} »
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {t('Essayez d\'élargir le rayon kilométrique ou d\'utiliser des mots-clés plus généraux.')}
                  </p>
                </div>
              ) : (
                rankedJobs.map((job) => {
                  const isSaved = applications.some((a) => a.jobId === job.id);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      matchDetails={job.matchDetails}
                      onAdaptClick={handle1ClickAdapt}
                      onSaveJob={handleSaveJob}
                      isSaved={isSaved}
                      isAdapting={adaptingJobId === job.id}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Application Tracker (Kanban) */}
        {activeTab === 'tracker' && (
          <JobApplicationTracker
            applications={applications}
            onUpdateStatus={(appId, newStatus) => {
              const updated = updateApplicationStatus(appId, newStatus);
              setApplications(updated);
            }}
            onDeleteApplication={(appId) => {
              const updated = deleteApplication(appId);
              setApplications(updated);
            }}
            onLoadTailoredResume={(tailored) => {
              onApplyTailoredResume(tailored);
              onClose();
            }}
            onViewCoverLetter={(letter) => {
              setViewingCoverLetter(letter);
            }}
          />
        )}

        {/* TAB 3: Visual Diff & Review */}
        {activeTab === 'review' && pendingReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="career-review-banner">
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                  ✅ {t('Candidature générée avec succès pour')} : {pendingReview.job?.title} ({pendingReview.job?.company})
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text)' }}>
                  {t('Vérifiez les ajustements apportés à votre CV et votre lettre de motivation avant de les valider.')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('search')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {t('Retour aux offres')}
                </button>
                <button
                  onClick={handleAcceptTailoredResume}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  ⚡ {t('Appliquer ce CV dans l\'atelier')}
                </button>
              </div>
            </div>

            {/* Split View: Resume Tailoring & Cover Letter */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {/* Left: Tailored Resume Highlights */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                  📝 {t('Points Clés du CV Adapté')}
                </h5>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <strong>{t('Titre ciblé :')}</strong> {pendingReview.tailoredResume?.personal?.tagline || '-'}
                </div>
                {pendingReview.tailoredResume?.personal?.summary && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-alt)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                    <strong>{t('Accroche :')}</strong> {pendingReview.tailoredResume.personal.summary}
                  </div>
                )}
                <div style={{ fontSize: '12px' }}>
                  <strong>{t('Compétences mises en avant :')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {(pendingReview.tailoredResume?.skills || []).map((s, idx) => (
                      <span key={idx} className="career-skill-chip matched">
                        {typeof s === 'string' ? s : s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Cover Letter Preview */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                  ✉️ {t('Lettre de Motivation Personnalisée')}
                </h5>
                <textarea
                  readOnly
                  value={pendingReview.coverLetter || ''}
                  rows={8}
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-alt)',
                    color: 'var(--color-text)',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Cover Letter Preview Popup */}
        {viewingCoverLetter && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  ✉️ {t('Lettre de Motivation')}
                </h4>
                <button
                  onClick={() => setViewingCoverLetter(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  ✕
                </button>
              </div>

              <textarea
                readOnly
                value={viewingCoverLetter}
                rows={12}
                style={{
                  width: '100%',
                  fontSize: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-alt)',
                  color: 'var(--color-text)',
                  lineHeight: '1.5'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingCoverLetter);
                    alert(t('Lettre copiée dans le presse-papier !'));
                  }}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  📋 {t('Copier')}
                </button>
                <button
                  onClick={() => setViewingCoverLetter(null)}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {t('Fermer')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="modal-actions" style={{ marginTop: '16px' }}>
        <button onClick={onClose} className="btn-secondary">
          {t('Fermer')}
        </button>
      </div>
    </Modal>
  );
}
