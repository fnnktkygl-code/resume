/**
 * 🎯 CareerOps Intelligent Matcher & Geodesic Calculation Engine
 * 
 * Features:
 * 1. Geodesic distance calculation via Haversine formula (Earth radius = 6371 km).
 * 2. Hard and soft skills extraction and normalization.
 * 3. Multi-factor ATS compatibility scoring (Skills, Title, Experience, Geolocation).
 * 4. Transparent gap analysis (Matched skills vs Missing skills).
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
 * Calculates geodesic distance between two points using the Haversine formula.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
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
 * Resolves coordinates for a location string (city name, postal code, or 'remote').
 * @param {string} locationStr 
 * @returns {{ lat: number, lng: number, name: string, isRemote: boolean } | null}
 */
export function resolveLocationCoordinates(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;

  const clean = locationStr.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents

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
 * @param {object} resumeData 
 * @returns {Set<string>}
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

  // 1. Tagline & Summary
  addText(resumeData.personal?.tagline);
  addText(resumeData.personal?.summary);

  // 2. Skills list
  if (Array.isArray(resumeData.skills)) {
    resumeData.skills.forEach((s) => {
      if (typeof s === 'string') addText(s);
      else if (s?.name) addText(s.name);
    });
  }

  // 3. Experiences
  if (Array.isArray(resumeData.experiences)) {
    resumeData.experiences.forEach((exp) => {
      addText(exp.role);
      addText(exp.company);
      if (Array.isArray(exp.bulletPoints)) {
        exp.bulletPoints.forEach((bp) => addText(bp));
      }
    });
  }

  // 4. Projects & Education
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach((p) => {
      addText(p.title);
      addText(p.description);
    });
  }

  if (Array.isArray(resumeData.education)) {
    resumeData.education.forEach((edu) => {
      addText(edu.degree);
      addText(edu.school);
      addText(edu.field);
    });
  }

  return keywords;
}

/**
 * Calculates ATS compatibility score and gap analysis between a Resume and a Job Posting.
 * @param {object} resumeData 
 * @param {object} jobOffer 
 * @param {object} [userPreferences]
 * @returns {{ score: number, matchedSkills: string[], missingSkills: string[], locationDistanceKm: number | null, locationMatch: boolean, strengths: string[], advice: string }}
 */
export function matchResumeWithJob(resumeData, jobOffer, userPreferences = {}) {
  if (!resumeData || !jobOffer) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      locationDistanceKm: null,
      locationMatch: true,
      strengths: [],
      advice: ''
    };
  }

  const resumeKeywords = extractResumeKeywords(resumeData);
  const requiredSkills = Array.isArray(jobOffer.skills) ? jobOffer.skills : [];

  const matchedSkills = [];
  const missingSkills = [];

  // Evaluate required skills
  requiredSkills.forEach((skill) => {
    const cleanSkill = skill.toLowerCase().trim();
    let isMatched = false;

    if (resumeKeywords.has(cleanSkill)) {
      isMatched = true;
    } else {
      // Check multi-word or partial token match
      const skillTokens = cleanSkill.split(/\s+/);
      const allFound = skillTokens.every((st) => resumeKeywords.has(st));
      if (allFound) isMatched = true;
    }

    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate Base Skills Score (0 - 50 points)
  let skillsScore = 35;
  if (requiredSkills.length > 0) {
    skillsScore = Math.round((matchedSkills.length / requiredSkills.length) * 50);
  }

  // Calculate Title & Role Relevance (0 - 25 points)
  let roleScore = 10;
  const userTagline = (resumeData.personal?.tagline || '').toLowerCase();
  const jobTitle = (jobOffer.title || '').toLowerCase();
  
  const titleTokens = jobTitle.split(/\s+/).filter(t => t.length >= 3);
  const matchedTitleTokens = titleTokens.filter(t => userTagline.includes(t) || resumeKeywords.has(t));
  if (titleTokens.length > 0) {
    roleScore = Math.min(25, Math.round((matchedTitleTokens.length / titleTokens.length) * 25));
  }

  // Calculate Experience & Context Score (0 - 15 points)
  const experienceCount = (resumeData.experiences || []).length;
  const expScore = Math.min(15, experienceCount * 10);

  // Baseline structure & completeness points (10 points)
  const baseCompleteness = resumeData.personal?.name ? 10 : 0;

  // Geolocation evaluation
  let locationDistanceKm = null;
  let locationMatch = true;

  const candidateLocation = resolveLocationCoordinates(userPreferences.location || resumeData.personal?.location);
  const jobLocation = resolveLocationCoordinates(jobOffer.location);

  if (jobOffer.isRemote || jobOffer.remoteMode === 'full') {
    locationMatch = true;
    locationDistanceKm = 0;
  } else if (candidateLocation && jobLocation && candidateLocation.lat && jobLocation.lat) {
    locationDistanceKm = calculateHaversineDistance(
      candidateLocation.lat, candidateLocation.lng,
      jobLocation.lat, jobLocation.lng
    );

    const maxRadius = userPreferences.radiusKm || 50;
    if (locationDistanceKm > maxRadius) {
      locationMatch = false;
    }
  }

  // If resume has NO content (no skills, no experiences, no tagline)
  const hasProfileData = (resumeData.skills && resumeData.skills.length > 0) || 
                         (resumeData.experiences && resumeData.experiences.length > 0) || 
                         Boolean(resumeData.personal?.tagline?.trim());

  if (!hasProfileData || resumeKeywords.size === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: requiredSkills,
      locationDistanceKm,
      locationMatch,
      strengths: [],
      advice: 'Complétez votre CV (métier, compétences, expériences) pour obtenir un score ATS précis.'
    };
  }

  // Aggregate Total ATS Score (Bounded 5 - 99%)
  let totalScore = baseCompleteness + skillsScore + roleScore + expScore;
  if (!locationMatch && locationDistanceKm && locationDistanceKm > 100) {
    totalScore = Math.max(10, totalScore - 15); // penalize distant non-remote jobs
  }

  totalScore = Math.max(5, Math.min(98, totalScore));

  // Strengths & Advice
  const strengths = [];
  if (matchedSkills.length > 0) {
    strengths.push(`${matchedSkills.length} compétence(s) clé(s) alignée(s) : ${matchedSkills.slice(0, 4).join(', ')}`);
  }
  if (matchedTitleTokens.length > 0) {
    strengths.push(`Intitulé de poste bien ciblé avec votre profil`);
  }
  if (experienceCount >= 2) {
    strengths.push(`Historique d'expérience solide pour ce rôle`);
  }

  let advice = '';
  if (missingSkills.length > 0) {
    advice = `Mettez en avant vos réalisations connexes pour compenser : ${missingSkills.slice(0, 3).join(', ')}.`;
  } else {
    advice = `Excellente compatibilité. Prêt pour une candidature directe !`;
  }

  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    locationDistanceKm,
    locationMatch,
    strengths,
    advice
  };
}
