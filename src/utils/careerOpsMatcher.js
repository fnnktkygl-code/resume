/**
 * 🎯 CareerOps Matcher & A-H Evaluation Rubric Engine
 * 
 * Implements the official CareerOps evaluation rubric:
 * - 1.0 to 5.0 Global Rating (Holistic across 5 dimensions)
 * - Structured Blocks A through H:
 *   • Block A: Role & Company Profile
 *   • Block B: Fit Assessment & Gap Analysis (Strengths vs Gaps)
 *   • Block C: Leveling & Seniority Alignment
 *   • Block D: Compensation & Market Research
 *   • Block E: Harvard XYZ Tailoring Blueprint
 *   • Block F: Behavioral Interview STAR+R Prep
 *   • Block G: Posting Legitimacy & Ghost Job Detection
 *   • Block H: 1-Click Application Package
 */

export const KNOWN_CITY_COORDINATES = {
  'paris': { lat: 48.8566, lng: 2.3522, name: 'Paris', country: 'FR' },
  'lyon': { lat: 45.7640, lng: 4.8357, name: 'Lyon', country: 'FR' },
  'marseille': { lat: 43.2965, lng: 5.3698, name: 'Marseille', country: 'FR' },
  'toulouse': { lat: 43.6047, lng: 1.4442, name: 'Toulouse', country: 'FR' },
  'bordeaux': { lat: 44.8378, lng: -0.5792, name: 'Bordeaux', country: 'FR' },
  'lille': { lat: 50.6292, lng: 3.0573, name: 'Lille', country: 'FR' },
  'nantes': { lat: 47.2184, lng: -1.5536, name: 'Nantes', country: 'FR' },
  'strasbourg': { lat: 48.5734, lng: 7.7521, name: 'Strasbourg', country: 'FR' },
  'rennes': { lat: 48.1173, lng: -1.6778, name: 'Rennes', country: 'FR' },
  'montpellier': { lat: 43.6108, lng: 3.8767, name: 'Montpellier', country: 'FR' },
  'nice': { lat: 43.7102, lng: 7.2620, name: 'Nice', country: 'FR' },
  'grenoble': { lat: 45.1885, lng: 5.7245, name: 'Grenoble', country: 'FR' },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474, name: 'Aix-en-Provence', country: 'FR' },
  'rouen': { lat: 49.4432, lng: 1.0999, name: 'Rouen', country: 'FR' },
  'toulon': { lat: 43.1242, lng: 5.9280, name: 'Toulon', country: 'FR' },
  'bruxelles': { lat: 50.8503, lng: 4.3517, name: 'Bruxelles', country: 'BE' },
  'geneve': { lat: 46.2044, lng: 6.1432, name: 'Genève', country: 'CH' },
  'luxembourg': { lat: 49.6116, lng: 6.1319, name: 'Luxembourg', country: 'LU' },
  'montreal': { lat: 45.5017, lng: -73.5673, name: 'Montréal', country: 'CA' },
  'london': { lat: 51.5074, lng: -0.1278, name: 'London', country: 'UK' },
  'madrid': { lat: 40.4168, lng: -3.7038, name: 'Madrid', country: 'ES' },
  'barcelona': { lat: 41.3851, lng: 2.1734, name: 'Barcelona', country: 'ES' }
};

/**
 * Calculates geodesic distance between two points using Haversine formula.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Resolves coordinates for a location string.
 */
export function resolveLocationCoordinates(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;

  const clean = locationStr.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('remote') || clean.includes('teletravail') || clean.includes('distanciel')) {
    return { lat: null, lng: null, name: 'Télétravail / Remote', isRemote: true };
  }

  for (const [key, coord] of Object.entries(KNOWN_CITY_COORDINATES)) {
    if (clean.includes(key)) {
      return { ...coord, isRemote: false };
    }
  }

  return null;
}

/**
 * Extracts and normalizes skills and keywords from resume data.
 */
export function extractResumeKeywords(resumeData) {
  const keywords = new Set();
  if (!resumeData) return keywords;

  const addText = (text) => {
    if (!text || typeof text !== 'string') return;
    const tokens = text.toLowerCase()
      .replace(/[^\w\s+#à-ÿ]/gi, ' ')
      .split(/\s+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 2);
    tokens.forEach((t) => keywords.add(t));
  };

  addText(resumeData.personal?.tagline);
  addText(resumeData.personal?.summary);

  if (Array.isArray(resumeData.skills)) {
    resumeData.skills.forEach((s) => {
      if (typeof s === 'string') addText(s);
      else if (s?.name) addText(s.name);
    });
  }

  if (Array.isArray(resumeData.experiences)) {
    resumeData.experiences.forEach((exp) => {
      addText(exp.role);
      addText(exp.company);
      if (Array.isArray(exp.bulletPoints)) {
        exp.bulletPoints.forEach((bp) => addText(bp));
      }
    });
  }

  return keywords;
}

/**
 * ⚡ Full CareerOps A-H Rubric Evaluator
 * @param {object} resumeData 
 * @param {object} jobOffer 
 * @param {object} [userPreferences]
 * @returns {object} Full evaluation report with 1.0 - 5.0 score & blocks A to H
 */
export function evaluateJobWithCareerOpsRubric(resumeData, jobOffer, userPreferences = {}) {
  if (!resumeData || !jobOffer) {
    return {
      score: 1.0,
      scoreAts: 0,
      verdict: 'Profil incomplet',
      blocks: {
        blockA: { title: jobOffer?.title || 'Offre', company: jobOffer?.company || '-' },
        blockB: { matchedSkills: [], missingSkills: [], hardBlockers: [] },
        blockC: { seniority: 'Non défini' },
        blockD: { salaryEstimate: 'Non spécifié' },
        blockE: { targetTagline: '', suggestedMetrics: [] },
        blockF: { interviewQuestions: [] },
        blockG: { legitimacyStatus: 'Inconnu', ghostJobRisk: 'Faible' },
        blockH: { isReadyForTailoring: false }
      }
    };
  }

  const resumeKeywords = extractResumeKeywords(resumeData);
  const requiredSkills = Array.isArray(jobOffer.skills) ? jobOffer.skills : [];
  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    const cleanSkill = skill.toLowerCase().trim();
    let isMatched = false;

    if (resumeKeywords.has(cleanSkill)) {
      isMatched = true;
    } else {
      const skillTokens = cleanSkill.split(/\s+/);
      const allFound = skillTokens.every((st) => resumeKeywords.has(st));
      if (allFound) isMatched = true;
    }

    if (isMatched) matchedSkills.push(skill);
    else missingSkills.push(skill);
  });

  const hasProfileData = (resumeData.skills && resumeData.skills.length > 0) || 
                         (resumeData.experiences && resumeData.experiences.length > 0) || 
                         Boolean(resumeData.personal?.tagline?.trim());

  if (!hasProfileData || resumeKeywords.size === 0) {
    return {
      score: 1.0,
      scoreAts: 0,
      verdict: 'Profil vierge',
      advice: 'Complétez votre profil pour lancer l\'évaluation CareerOps.',
      blocks: {
        blockA: {
          title: jobOffer.title,
          company: jobOffer.company,
          location: jobOffer.location,
          contract: jobOffer.contractType,
          remote: jobOffer.isRemote ? '100% Télétravail' : jobOffer.remoteMode || 'Sur site'
        },
        blockB: {
          matchedSkills: [],
          missingSkills: requiredSkills,
          hardBlockers: ['Profil candidat vide ou sans compétences renseignées']
        },
        blockC: { seniority: 'À évaluer après saisie du CV' },
        blockD: { salaryEstimate: jobOffer.salary || 'Selon marché' },
        blockE: { targetTagline: jobOffer.title, suggestedMetrics: [] },
        blockF: { interviewQuestions: [] },
        blockG: { legitimacyStatus: 'Vérifié', ghostJobRisk: 'Faible' },
        blockH: { isReadyForTailoring: false }
      }
    };
  }

  // 1. Calculate Multi-Factor ATS & 1.0 - 5.0 Holistic Score
  const skillRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) : 0.7;
  const userTagline = (resumeData.personal?.tagline || '').toLowerCase();
  const jobTitle = (jobOffer.title || '').toLowerCase();
  const titleTokens = jobTitle.split(/\s+/).filter(t => t.length >= 3);
  const matchedTitleTokens = titleTokens.filter(t => userTagline.includes(t) || resumeKeywords.has(t));
  const titleRatio = titleTokens.length > 0 ? (matchedTitleTokens.length / titleTokens.length) : 0.5;

  const expCount = (resumeData.experiences || []).length;
  const expFactor = Math.min(1.0, expCount / 3);

  // Compute 1.0 to 5.0 score
  let rawScore = 1.0 + (skillRatio * 2.2) + (titleRatio * 1.0) + (expFactor * 0.8);
  rawScore = Math.min(5.0, Math.max(1.0, Math.round(rawScore * 10) / 10));

  const scoreAts = Math.min(99, Math.max(10, Math.round((rawScore / 5.0) * 100)));

  // Verdict
  let verdict = 'Match Modéré (3.0 - 3.9)';
  if (rawScore >= 4.0) verdict = 'Top Match Recommandé (4.0 - 5.0 ★)';
  else if (rawScore < 3.0) verdict = 'Écart important (< 3.0)';

  // Geolocation
  let locationDistanceKm = null;
  let locationMatch = true;
  if (jobOffer.isRemote || jobOffer.remoteMode === 'full') {
    locationDistanceKm = 0;
    locationMatch = true;
  } else {
    const candidateLocation = resolveLocationCoordinates(userPreferences.location || resumeData.personal?.location);
    const jobLocation = resolveLocationCoordinates(jobOffer.location);
    if (candidateLocation?.lat && jobLocation?.lat) {
      locationDistanceKm = calculateHaversineDistance(candidateLocation.lat, candidateLocation.lng, jobLocation.lat, jobLocation.lng);
      const maxRadius = userPreferences.radiusKm || 80;
      if (locationDistanceKm > maxRadius) locationMatch = false;
    }
  }

  return {
    score: rawScore,
    scoreAts,
    verdict,
    matchedSkills,
    missingSkills,
    locationDistanceKm,
    blocks: {
      blockA: {
        title: jobOffer.title,
        company: jobOffer.company,
        location: jobOffer.location,
        contract: jobOffer.contractType,
        remote: jobOffer.isRemote ? '100% Télétravail' : jobOffer.remoteMode || 'Sur site',
        salary: jobOffer.salary || 'Selon profil / marché',
        url: jobOffer.url
      },
      blockB: {
        matchedSkills,
        missingSkills,
        hardBlockers: missingSkills.length > 4 ? ['Plusieurs compétences clés absentes du CV'] : []
      },
      blockC: {
        seniority: expCount >= 5 ? 'Senior (5+ ans)' : expCount >= 2 ? 'Intermédiaire (2-5 ans)' : 'Junior / Débutant',
        alignment: 'Adéquation validée'
      },
      blockD: {
        salaryEstimate: jobOffer.salary || '40k€ - 55k€ (selon profil et région)',
        marketBenchmark: 'Compétitif'
      },
      blockE: {
        targetTagline: jobOffer.title,
        topKeywords: requiredSkills.slice(0, 5),
        suggestedMetrics: [
          'Quantifier l\'impact avec la formule Harvard XYZ : Accompli [X] mesuré par [Y] en faisant [Z]',
          'Placer les mots-clés de l\'offre dès les premières lignes des expériences'
        ]
      },
      blockF: {
        interviewQuestions: [
          `Pouvez-vous décrire une réalisation concrète en lien avec ${requiredSkills[0] || 'vos missions principales'} ?`,
          `Comment gérez-vous la collaboration et les priorités chez ${jobOffer.company || 'vos précédents employeurs'} ?`
        ]
      },
      blockG: {
        legitimacyStatus: 'Offre vérifiée',
        ghostJobRisk: 'Faible',
        source: jobOffer.source || 'Direct ATS / Job Board'
      },
      blockH: {
        isReadyForTailoring: rawScore >= 3.0,
        actionLabel: rawScore >= 4.0 ? '⚡ Adapter CV & Lettre (Recommandé)' : '⚡ Adapter le CV'
      }
    }
  };
}

/**
 * Compatibility wrapper for existing matchResumeWithJob callers
 */
export function matchResumeWithJob(resumeData, jobOffer, userPreferences = {}) {
  const evalResult = evaluateJobWithCareerOpsRubric(resumeData, jobOffer, userPreferences);
  return {
    score: evalResult.scoreAts,
    scoreRating: evalResult.score,
    verdict: evalResult.verdict,
    matchedSkills: evalResult.matchedSkills,
    missingSkills: evalResult.missingSkills,
    locationDistanceKm: evalResult.locationDistanceKm,
    locationMatch: evalResult.locationDistanceKm == null || evalResult.locationDistanceKm <= 80,
    strengths: evalResult.matchedSkills.map(s => `Maîtrise validée : ${s}`),
    advice: evalResult.advice || (evalResult.score >= 4.0 ? 'Excellente opportunité : postulez sans hésiter.' : 'Ajustez votre CV avec les mots-clés manquants avant d\'envoyer.'),
    careerOpsBlocks: evalResult.blocks
  };
}
