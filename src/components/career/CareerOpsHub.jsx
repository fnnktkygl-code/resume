import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../ui/Modal';
import JobCard from './JobCard';
import JobApplicationTracker from './JobApplicationTracker';
import { useTranslation } from '../../utils/TranslationContext';
import { matchResumeWithJob, evaluateJobWithCareerOpsRubric } from '../../utils/careerOpsMatcher';
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
  { nameFr: 'Informatique & Télécoms', nameEn: 'IT & Software', nameEs: 'Informática y Tecnología', value: 'Informatique', icon: '💻' },
  { nameFr: 'Ingénierie & Industrie', nameEn: 'Engineering & Manufacturing', nameEs: 'Ingeniería e Industria', value: 'Ingénierie', icon: '⚙️' },
  { nameFr: 'Finance, Banque & Assurance', nameEn: 'Finance & Banking', nameEs: 'Finanzas y Banca', value: 'Finance', icon: '💼' },
  { nameFr: 'Commerce & Distribution', nameEn: 'Sales & Retail', nameEs: 'Ventas y Comercio', value: 'Commerce', icon: '🛍️' },
  { nameFr: 'Santé & Social', nameEn: 'Healthcare & Social Care', nameEs: 'Salud y Social', value: 'Santé', icon: '🏥' },
  { nameFr: 'BTP & Construction', nameEn: 'Construction & Real Estate', nameEs: 'Construcción e Inmobiliaria', value: 'BTP', icon: '🏗️' },
  { nameFr: 'Transport & Logistique', nameEn: 'Transport & Logistics', nameEs: 'Transporte y Logística', value: 'Logistique', icon: '🚚' },
  { nameFr: 'Marketing & Communication', nameEn: 'Marketing & Media', nameEs: 'Marketing y Medios', value: 'Marketing', icon: '📢' },
  { nameFr: 'Ressources Humaines & Juridique', nameEn: 'HR & Legal', nameEs: 'Recursos Humanos y Legal', value: 'RH', icon: '👥' },
  { nameFr: 'Hôtellerie & Restauration', nameEn: 'Hospitality & Food Service', nameEs: 'Hostelería y Restauración', value: 'Hôtellerie', icon: '🏨' },
  { nameFr: 'Enseignement & Formation', nameEn: 'Education & Training', nameEs: 'Educación y Formación', value: 'Enseignement', icon: '🎓' }
];

function extractSkillsList(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map(s => (typeof s === 'string' ? s : s?.name || String(s))).filter(Boolean);
  }
  if (typeof skills === 'object') {
    const list = [];
    if (skills.technical) list.push(...skills.technical.split(/[,;\n]/));
    if (skills.soft) list.push(...skills.soft.split(/[,;\n]/));
    if (skills.languages) list.push(...skills.languages.split(/[,;\n]/));
    return list.map(s => s.trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function extractCleanJobTitle(resumeData) {
  if (!resumeData) return '';
  const rawTagline = resumeData.personal?.tagline?.trim() || '';

  // If tagline is clean, concise (<= 6 words, not a full sentence/pitch)
  const isPitchSentence = /^(je\s|en\s+recherche|recherche|au\s+service|passionn|mon\s+objectif)/i.test(rawTagline) || rawTagline.split(/\s+/).length > 6 || rawTagline.length > 55;

  if (rawTagline && !isPitchSentence) {
    return rawTagline;
  }

  // Check latest experience title
  const latestExpTitle = resumeData.experience?.find(e => e.title?.trim())?.title?.trim();
  if (latestExpTitle && latestExpTitle.split(/\s+/).length <= 6) {
    return latestExpTitle;
  }

  // Extract key technical role from pitch tagline if present (e.g. "EXPERTISE POWER BI" -> "Expertise Power BI")
  if (rawTagline) {
    const match = rawTagline.match(/(?:expertise|poste\s+de|comme|en\s+tant\s+que)\s+([A-Za-z0-9+#.\s]{3,30})(?:\s+au\s+service|\s+pour|\s+dans|$)/i);
    if (match && match[1]) {
      const clean = match[1].trim();
      if (clean.length > 2 && clean.length < 35) return clean;
    }
    const words = rawTagline.split(/\s+/).slice(0, 4).join(' ');
    return words.length < 35 ? words : words.slice(0, 35);
  }

  return '';
}

export default function CareerOpsHub({
  isOpen,
  onClose,
  resumeData,
  onApplyTailoredResume,
  onOpenImport,
  onLoadDemo,
  language = 'fr'
}) {
  const { t } = useTranslation();

  // Navigation tabs: 'pipeline' (Auto-Pipeline URL/JD) | 'search' (Portals & APIs) | 'tracker' (Kanban) | 'review' (Diff)
  const [activeTab, setActiveTab] = useState('pipeline');

  // Auto-Pipeline URL / Text Input State
  const [inputUrlOrJd, setInputUrlOrJd] = useState('');
  const [isEvaluatingJd, setIsEvaluatingJd] = useState(false);
  const [evaluatedJob, setEvaluatedJob] = useState(null);

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
  const cleanJobTitle = useMemo(() => extractCleanJobTitle(resumeData), [resumeData]);
  const candidateLocation = resumeData?.personal?.location?.trim() || '';

  // Master Profile validation
  const hasProfileData = useMemo(() => {
    if (!resumeData) return false;
    const hasSkills = Boolean(
      (typeof resumeData.skills === 'string' && resumeData.skills.trim()) ||
      (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) ||
      (typeof resumeData.skills === 'object' && (resumeData.skills?.technical?.trim() || resumeData.skills?.soft?.trim() || resumeData.skills?.languages?.trim()))
    );
    const hasExp = Array.isArray(resumeData.experience) && resumeData.experience.some(e => e.company || e.title);
    const hasTagline = Boolean(resumeData.personal?.tagline?.trim());
    return hasSkills || hasExp || hasTagline;
  }, [resumeData]);

  // Initialize search criteria from user resume data
  useEffect(() => {
    if (isOpen && resumeData) {
      if (cleanJobTitle && !query) {
        setQuery(cleanJobTitle);
      }
      if (candidateLocation && !location) {
        setLocation(candidateLocation);
      }
    }
  }, [isOpen, resumeData, cleanJobTitle, candidateLocation, query, location]);

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

  // ⚡ Auto-Pipeline : Evaluate pasted Job URL or Raw JD text with CareerOps A-H Rubric
  const handleAutoPipeline = async () => {
    if (!inputUrlOrJd.trim()) {
      setErrorMessage(t('Veuillez coller une URL d\'offre d\'emploi ou le texte de l\'annonce.'));
      return;
    }

    setIsEvaluatingJd(true);
    setErrorMessage('');

    try {
      const textInput = inputUrlOrJd.trim();
      const lines = textInput.split('\n').map(l => l.trim()).filter(Boolean);

      let parsedTitle = 'Poste Ciblé';
      let parsedCompany = 'Entreprise';
      let parsedLocation = candidateLocation || 'France';
      let parsedSalary = 'Selon profil / marché';
      let parsedContract = 'CDI';
      let parsedUrl = '#';
      let parsedSource = 'Fiche de Poste (JD)';

      // 1. Detect if an URL is present in the text
      const urlMatch = textInput.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        parsedUrl = urlMatch[0];
        try {
          const u = new URL(parsedUrl);
          const hostname = u.hostname.toLowerCase();

          if (hostname.includes('indeed.')) {
            parsedCompany = 'Indeed France';
            parsedSource = 'Indeed (Auto-Pipeline)';
            // Parse Indeed URL slug like: /q-data-analyst-l-montpellier-(34)-emplois.html
            const pathname = decodeURIComponent(u.pathname);
            const indeedMatch = pathname.match(/q-(.+?)(?:-l-(.+?))?(?:-(?:emplois|jobs))?\.html/i);
            if (indeedMatch) {
              const rawTitle = (indeedMatch[1] || '').replace(/[-_]/g, ' ').trim();
              if (rawTitle) {
                parsedTitle = rawTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              }
              if (indeedMatch[2]) {
                parsedLocation = indeedMatch[2].replace(/[-_]/g, ' ').replace(/\((\d+)\)/, '($1)').trim();
                parsedLocation = parsedLocation.charAt(0).toUpperCase() + parsedLocation.slice(1);
              }
            }
          } else if (hostname.includes('linkedin.')) {
            parsedCompany = 'LinkedIn Jobs';
            parsedSource = 'LinkedIn (Auto-Pipeline)';
          } else if (hostname.includes('welcometothejungle.')) {
            parsedCompany = 'Welcome to the Jungle';
            parsedSource = 'WTTJ (Auto-Pipeline)';
            const parts = u.pathname.split('/').filter(Boolean);
            const compIdx = parts.indexOf('companies');
            if (compIdx !== -1 && parts[compIdx + 1]) {
              parsedCompany = parts[compIdx + 1].replace(/[-_]/g, ' ').toUpperCase();
            }
            const jobIdx = parts.indexOf('jobs');
            if (jobIdx !== -1 && parts[jobIdx + 1]) {
              parsedTitle = parts[jobIdx + 1].replace(/[-_]/g, ' ');
              parsedTitle = parsedTitle.charAt(0).toUpperCase() + parsedTitle.slice(1);
            }
          } else if (hostname.includes('francetravail.')) {
            parsedCompany = 'France Travail';
            parsedSource = 'France Travail (Auto-Pipeline)';
          } else if (hostname.includes('greenhouse.io') || hostname.includes('lever.co') || hostname.includes('ashbyhq.com')) {
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length > 0) {
              parsedCompany = parts[0].toUpperCase();
            }
            parsedSource = 'ATS Direct (Auto-Pipeline)';
          } else {
            parsedCompany = u.hostname.replace(/^www\./, '').split('.')[0].toUpperCase();
            parsedSource = 'Auto-Pipeline URL';
          }
        } catch {
          // Fallback ignored
        }
      }

      // 2. Parse multi-line structured snippet if pasted from Indeed/LinkedIn/WTTJ
      for (const line of lines) {
        if (/https?:\/\//i.test(line)) {
          // Line with URL and possible title attached
          const withoutUrl = line.replace(/https?:\/\/[^\s]+/i, '').replace(/[-–—]/g, ' ').trim();
          if (withoutUrl.length > 3 && withoutUrl.length < 80) {
            parsedTitle = withoutUrl.replace(/\bjob\s+post\b/i, '').replace(/\bemplois?\b/i, '').trim();
          }
        } else if (!parsedCompany || parsedCompany === 'Entreprise' || parsedCompany === 'FR' || parsedCompany.includes('Indeed')) {
          if (/^[A-Z0-9\s&.-]{2,40}$/.test(line) && !/CDI|CDD|Stage|PAR AN|PAR MOIS|MONTPELLIER|PARIS|LYON/i.test(line)) {
            parsedCompany = line;
          }
        }
        
        // Location detection (e.g. 34000 Montpellier or Paris)
        if (/\b\d{5}\s+[A-Za-zÀ-ÿ-]+/i.test(line) || /^(Paris|Lyon|Marseille|Toulouse|Bordeaux|Nantes|Montpellier|Lille|Rennes|Strasbourg|Nice)/i.test(line)) {
          parsedLocation = line;
        }

        // Salary detection
        if (/\d+[\s\d]*\s*€/i.test(line) || /\d+k€/i.test(line)) {
          parsedSalary = line;
        }

        // Contract detection
        if (/\b(CDI|CDD|Freelance|Alternance|Stage|Intérim)\b/i.test(line)) {
          const match = line.match(/\b(CDI|CDD|Freelance|Alternance|Stage|Intérim)\b/i);
          if (match) parsedContract = match[0].toUpperCase();
        }
      }

      // Clean title from common noisy affixes
      parsedTitle = parsedTitle
        .replace(/\b(emplois?|recrutement|job post|h\/f|f\/h)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!parsedTitle) parsedTitle = 'Poste Ciblé';

      // 3. Extract skills tokens from whole text & title
      const skillMatches = [];
      const commonTerms = [
        'react', 'node', 'javascript', 'typescript', 'python', 'java', 'sql', 'data analyst', 'power bi',
        'tableau', 'excel', 'aws', 'docker', 'kubernetes', 'management', 'vente', 'commerce', 'finance',
        'comptabilité', 'rh', 'recrutement', 'marketing', 'seo', 'gestion de projet', 'agile', 'scrum', 'anglais'
      ];
      commonTerms.forEach(term => {
        if (textInput.toLowerCase().includes(term) || parsedTitle.toLowerCase().includes(term)) {
          skillMatches.push(term.charAt(0).toUpperCase() + term.slice(1));
        }
      });

      // Formulate a clean description
      let cleanDesc = lines.filter(l => !/^https?:\/\//i.test(l)).join(' \n ').slice(0, 800);
      if (!cleanDesc || cleanDesc.length < 20) {
        cleanDesc = `Offre d'emploi « ${parsedTitle} » chez ${parsedCompany} (${parsedLocation}). Évaluée via le rubric CareerOps. Cliquez sur "Voir l'offre" pour consulter l'annonce d'origine ou postulez directement.`;
      }

      const syntheticJob = {
        id: `pipeline-${Date.now()}`,
        title: parsedTitle,
        company: parsedCompany,
        location: parsedLocation,
        contractType: parsedContract,
        salary: parsedSalary,
        skills: skillMatches,
        description: cleanDesc,
        url: parsedUrl,
        source: parsedSource
      };

      const match = matchResumeWithJob(resumeData, syntheticJob, {
        userCity: candidateLocation || parsedLocation,
        maxRadiusKm: radiusKm
      });

      setEvaluatedJob({
        ...syntheticJob,
        matchDetails: match
      });
    } catch (err) {
      setErrorMessage(err.message || t('Échec de l\'évaluation CareerOps.'));
    } finally {
      setIsEvaluatingJd(false);
    }
  };

  // Search execution for Tab 2
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

  // Computed matching details for all searched jobs
  const rankedJobs = useMemo(() => {
    if (!jobs || !jobs.length) return [];

    const searchLoc = (location || candidateLocation || '').trim();

    const scored = jobs.map((job) => {
      const match = matchResumeWithJob(resumeData || {}, job, {
        userCity: searchLoc,
        location: searchLoc,
        maxRadiusKm: Number(radiusKm) || 100,
        radiusKm: Number(radiusKm) || 100
      });
      return {
        ...job,
        matchDetails: match
      };
    });

    let filtered = scored;
    // If a search location is specified and remote-only is unchecked, filter out jobs out of range
    if (searchLoc && !remoteOnly) {
      filtered = scored.filter((job) => {
        // If distance was calculated and is greater than radiusKm, filter out
        if (job.matchDetails?.locationDistanceKm != null && job.matchDetails.locationDistanceKm > Number(radiusKm)) {
          return false;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => (Number(b.matchDetails?.scoreRating) || 0) - (Number(a.matchDetails?.scoreRating) || 0));
  }, [jobs, resumeData, location, candidateLocation, radiusKm, remoteOnly]);

  // Handle Save Job
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

  // Handle 1-Click Adaptation (Harvard XYZ + Cover Letter)
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
          label: t('Ajustement du CV selon la formule Harvard XYZ...')
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
      maxWidth="940px"
      title={t('🎯 CareerOps — Command Center IA de Recherche d\'Emploi')}
      ariaLabelledby="career-ops-modal-title"
    >
      <div className="career-ops-hub">
        {/* Top Navigation Tabs */}
        <div className="career-top-nav">
          <div className="career-tab-group">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`career-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            >
              <span>⚡</span>
              <span>{t('Auto-Pipeline (URL / JD)')}</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`career-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            >
              <span>🔍</span>
              <span>{t('Scanner de Portails & APIs')}</span>
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
            {cleanJobTitle && (
              <span style={{ opacity: 0.85 }}>• {cleanJobTitle}</span>
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

        {/* Master Profile Gate Banner when resume is empty */}
        {!hasProfileData && (
          <div style={{
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>📋</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {t('Master Profile requis pour une analyse pertinente')}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  {t('Pour calculer un score ATS fiable, détecter les écarts de compétences et adapter votre CV avec la formule Harvard XYZ, chargez d\'abord votre CV de référence.')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              {onOpenImport && (
                <button
                  onClick={onOpenImport}
                  className="btn-primary"
                  style={{ fontSize: '12.5px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📄</span>
                  <span>{t('Importer mon CV (PDF / Texte)')}</span>
                </button>
              )}
              {onLoadDemo && (
                <button
                  onClick={onLoadDemo}
                  className="btn-secondary"
                  style={{ fontSize: '12.5px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>✨</span>
                  <span>{t('Charger un profil Démo')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: Auto-Pipeline (Paste Job URL or Raw JD) */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>⚡</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                    {t('Auto-Pipeline CareerOps — Évaluation A-H & Adaptation 1-Clic')}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {t('Collez l\'URL d\'une offre (Greenhouse, Ashby, Lever, France Travail, Indeed, LinkedIn...) ou le texte de l\'annonce pour lancer l\'évaluation.')}
                  </p>
                </div>
              </div>

              <textarea
                value={inputUrlOrJd}
                onChange={(e) => setInputUrlOrJd(e.target.value)}
                placeholder={t('Collez ici l\'URL de l\'offre (ex : https://jobs.ashbyhq.com/... ou https://candidat.francetravail.fr/...) OU le texte complet de la fiche de poste...')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-alt)',
                  color: 'var(--color-text)',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={handleAutoPipeline}
                  disabled={isEvaluatingJd || !inputUrlOrJd.trim()}
                  className="btn-primary"
                  style={{ height: '40px', padding: '0 20px', fontSize: '13px' }}
                >
                  {isEvaluatingJd ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      <span>{t('Évaluation du Rubric en cours...')}</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>{t('Évaluer avec le Rubric CareerOps (1.0 - 5.0)')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evaluated Job Card Result */}
            {evaluatedJob && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
                  ✅ {t('Résultat de l\'Évaluation')} :
                </div>
                <JobCard
                  job={evaluatedJob}
                  matchDetails={evaluatedJob.matchDetails}
                  onAdaptClick={handle1ClickAdapt}
                  onSaveJob={handleSaveJob}
                  isSaved={applications.some((a) => a.jobId === evaluatedJob.id)}
                  isAdapting={adaptingJobId === evaluatedJob.id}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Search & Live Portals Scanner */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Filter Box */}
            <div className="career-filter-box">
              <div className="career-filter-grid">
                <div className="career-input-field">
                  <label>{t('Intitulé de poste / Mots-clés')}</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                    placeholder={t('ex : Développeur, Chef de projet, Infirmier, Comptable...')}
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
                        <span>{t('Scanner les Portails')}</span>
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

            {/* Job Listings / Scan Results */}
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
                    {t('Interrogation des flux en direct et calcul de compatibilité ATS...')}
                  </p>
                </div>
              ) : !hasSearched && jobs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>
                    {t('Scanner les Portails de Recrutement en Direct')}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {t('Saisissez votre intitulé de poste et votre localisation ci-dessus pour lancer l\'analyse multi-portails.')}
                  </p>
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

        {/* TAB 3: Application Tracker (Kanban) */}
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

        {/* TAB 4: Visual Diff & Review */}
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
                  onClick={() => setActiveTab('pipeline')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {t('Retour')}
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
                    {extractSkillsList(pendingReview.tailoredResume?.skills).map((s, idx) => (
                      <span key={idx} className="career-skill-chip matched">
                        ✓ {s}
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
