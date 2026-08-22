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

  // Built-in fallback catalog
  const fallbackJobs = [
    {
      id: 'job-fb-001',
      title: 'Développeur Fullstack React & Node.js',
      company: 'TechCorp Innovation',
      location: 'Paris, France',
      city: 'Paris',
      contractType: 'CDI',
      remoteMode: 'hybrid',
      isRemote: false,
      salary: '50k€ - 65k€',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      description: 'Développement d\'applications web SaaS modernes en équipe agile.',
      postedAt: new Date().toISOString(),
      source: 'Direct Partner',
      url: '#'
    },
    {
      id: 'job-fb-002',
      title: 'Développeur Frontend React / Vite (100% Remote)',
      company: 'CloudNative Solutions',
      location: 'Lyon, France',
      city: 'Lyon',
      contractType: 'CDI',
      remoteMode: 'full',
      isRemote: true,
      salary: '55k€ - 70k€',
      skills: ['React', 'Vite', 'JavaScript', 'CSS', 'REST API'],
      description: 'Conception d\'interfaces web performantes et accessibles en télétravail complet.',
      postedAt: new Date().toISOString(),
      source: 'RemoteOK',
      url: '#'
    }
  ];

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
  const [tailoredResume, coverLetter] = await Promise.all([
    tailorResumeWithProxy(resumeData, jobDesc, language),
    generateCoverLetterWithProxy(
      resumeData,
      jobDesc,
      language,
      jobOffer.company || '',
      jobOffer.title || '',
      'confident'
    ).catch(() => '')
  ]);

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
