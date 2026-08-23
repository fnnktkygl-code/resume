/**
 * 💼 CareerOps Client Service
 * 
 * Manages job searching, matching, 1-click batch adaptation (Resume + Cover Letter),
 * and local persistence of candidate applications.
 */

import { tailorResumeWithProxy, generateCoverLetterWithProxy } from './geminiService';
import { matchResumeWithJob } from '../utils/careerOpsMatcher';

const TRACKER_STORAGE_KEY = 'resume-career-ops-tracker';

/**
 * Searches for job offers through the CareerOps API or local fallback.
 * @param {object} params 
 * @returns {Promise<Array<object>>}
 */
export async function searchCareerJobs(params = {}) {
  const { query = '', location = '', contractType = '', remoteOnly = false, limit = 20 } = params;

  try {
    const res = await fetch('/api/careerOpsSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: JSON.stringify({ query, location, contractType, remoteOnly, limit })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        return data.jobs;
      }
    }
  } catch (err) {
    console.warn('[CareerOps Service] API unavailable, using built-in catalog fallback:', err.message);
  }

  // Built-in standard fallback catalog
  const fallbackJobs = [
    {
      id: 'job-fb-001',
      title: 'Ingénieur Développement Logiciel (H/F)',
      company: 'Doctolib',
      location: 'Paris, France',
      city: 'Paris',
      contractType: 'CDI',
      remoteMode: 'hybrid',
      isRemote: false,
      salary: '55k€ - 70k€',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      description: 'Développement d\'applications web et d\'architectures scalables en équipe agile.',
      postedAt: new Date().toISOString(),
      source: 'France Travail',
      url: '#'
    },
    {
      id: 'job-fb-002',
      title: 'Infirmier Diplômé d\'État (IDE) (H/F)',
      company: 'Centre Hospitalier Universitaire',
      location: 'Lyon, France',
      city: 'Lyon',
      contractType: 'CDI',
      remoteMode: 'onsite',
      isRemote: false,
      salary: '32k€ - 42k€',
      skills: ['Soins infirmiers', 'Urgences', 'Administration médicamenteuse', 'Transmissions'],
      description: 'Prise en charge globale des patients, surveillance clinique et soins prescrits.',
      postedAt: new Date().toISOString(),
      source: 'Santé Emploi',
      url: '#'
    },
    {
      id: 'job-fb-003',
      title: 'Conseiller(ère) de Vente & Relation Client (H/F)',
      company: 'Fnac Darty',
      location: 'Bordeaux, France',
      city: 'Bordeaux',
      contractType: 'CDI',
      remoteMode: 'onsite',
      isRemote: false,
      salary: '24k€ - 30k€',
      skills: ['Vente conseil', 'Relation client', 'Encaissement', 'Merchandising'],
      description: 'Accueil, écoute et conseil personnalisé auprès des clients.',
      postedAt: new Date().toISOString(),
      source: 'Commerce RH',
      url: '#'
    },
    {
      id: 'job-fb-004',
      title: 'Développeur Fullstack React & Node.js (H/F)',
      company: 'Doctolib',
      location: 'Paris, France',
      city: 'Paris',
      contractType: 'CDI',
      remoteMode: 'hybrid',
      isRemote: false,
      salary: '55k€ - 70k€',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      description: 'Développement d\'applications web e-santé modernes en équipe agile.',
      postedAt: new Date().toISOString(),
      source: 'France Travail',
      url: '#'
    }
  ];

  if (query) {
    const q = query.toLowerCase();
    const matched = fallbackJobs.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.skills.some(s => s.toLowerCase().includes(q)) ||
      j.description.toLowerCase().includes(q)
    );
    return matched.length > 0 ? matched : [];
  }

  return fallbackJobs;
}

/**
 * ⚡ 1-Click Batch Pipeline : Generates both Tailored Resume & Custom Cover Letter
 * @param {object} resumeData 
 * @param {object} jobOffer 
 * @param {string} language 
 * @returns {Promise<{ tailoredResume: object, coverLetter: string, matchDetails: object }>}
 */
export async function batchAdaptForJob(resumeData, jobOffer, language = 'fr') {
  if (!resumeData || !jobOffer) {
    throw new Error('Données du CV ou de l\'offre d\'emploi manquantes.');
  }

  const jobDesc = `${jobOffer.title} chez ${jobOffer.company}\n\nLocalisation: ${jobOffer.location}\nContrat: ${jobOffer.contractType}\n\nCompétences demandées:\n${(jobOffer.skills || []).join(', ')}\n\nDescription du poste:\n${jobOffer.description || ''}`;

  // 1. Calculate matching details
  const matchDetails = matchResumeWithJob(resumeData, jobOffer);

  // 2. Run Tailoring and Cover Letter generation in parallel
  let tailoredResume = null;
  let coverLetter = '';

  try {
    const [tailoredRes, cl] = await Promise.all([
      tailorResumeWithProxy(resumeData, jobDesc, language).catch(() => null),
      generateCoverLetterWithProxy(
        resumeData,
        jobDesc,
        language,
        jobOffer.company || '',
        jobOffer.title || '',
        'confident'
      ).catch(() => '')
    ]);
    tailoredResume = tailoredRes;
    coverLetter = cl;
  } catch (err) {
    console.warn('[CareerOps Adaptation Warning]', err);
  }

  // Ensure tailoredResume is a complete, valid CV object
  if (!tailoredResume || !tailoredResume.personal) {
    tailoredResume = {
      ...resumeData,
      personal: {
        ...(resumeData.personal || {}),
        tagline: jobOffer.title || resumeData.personal?.tagline || 'Professionnel Qualifié'
      },
      summary: resumeData.summary || `Professionnel expérimenté et engagé, motivé pour rejoindre ${jobOffer.company || 'l\'entreprise'} au poste de ${jobOffer.title || 'Data Analyst'}.`
    };
  }

  if (!coverLetter) {
    coverLetter = `Madame, Monsieur,\n\nC'est avec un vif intérêt que je vous présente ma candidature au poste de ${jobOffer.title || 'Data Analyst'} au sein de ${jobOffer.company || 'votre organisation'}.\n\nMes compétences et mon parcours correspondent aux exigences et responsabilités décrites dans votre offre d'emploi.\n\nDans l'attente d'échanger lors d'un prochain entretien, je vous prie d'agréer mes salutations distinguées.\n\n${resumeData.personal?.name || 'Le Candidat'}`;
  }

  return {
    tailoredResume,
    coverLetter,
    matchDetails
  };
}

/**
 * Retrieves saved applications from localStorage.
 * @returns {Array<object>}
 */
export function getSavedApplications() {
  try {
    const raw = localStorage.getItem(TRACKER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new or updated application in the tracker.
 * @param {object} application 
 * @returns {Array<object>} updated list
 */
export function saveApplication(application) {
  const existing = getSavedApplications();
  const index = existing.findIndex((a) => a.id === application.id);

  let updated;
  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...updated[index], ...application, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...application,
        id: application.id || `app-${Date.now()}`,
        status: application.status || 'saved', // saved, tailored, applied, interview, offer, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...existing
    ];
  }

  try {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save application to storage:', err);
  }

  return updated;
}

/**
 * Updates application status (Kanban column).
 * @param {string} appId 
 * @param {string} newStatus 
 * @returns {Array<object>}
 */
export function updateApplicationStatus(appId, newStatus) {
  const existing = getSavedApplications();
  const updated = existing.map((app) =>
    app.id === appId ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app
  );

  try {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update status:', err);
  }

  return updated;
}

/**
 * Deletes an application from the tracker.
 * @param {string} appId 
 * @returns {Array<object>}
 */
export function deleteApplication(appId) {
  const existing = getSavedApplications();
  const updated = existing.filter((a) => a.id !== appId);

  try {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete application:', err);
  }

  return updated;
}
