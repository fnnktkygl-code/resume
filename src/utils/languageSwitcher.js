/**
 * Language switching logic for resume headings and custom sections.
 * Extracted from App.jsx to reduce its size (Audit §4.1).
 * 
 * Contains the heading translation maps and custom section label maps
 * used when switching the UI language.
 */

// Default heading values per language — used to detect "stock" headings
// that should be translated vs. user-customized headings that should be preserved.
const HEADING_DEFAULTS = {
  en: {
    summary: 'Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages:',
    technical: 'Technical:',
    interpersonal: 'Interpersonal:',
    projects: 'Projects',
    certifications: 'Certifications',
    present: 'Present',
  },
  fr: {
    summary: 'Profil',
    experience: 'Expériences Professionnelles',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    technical: 'Compétences Techniques',
    interpersonal: 'Soft Skills',
    projects: 'Projets',
    certifications: 'Certifications',
    present: 'Présent',
  },
  es: {
    summary: 'Resumen Profesional',
    experience: 'Experiencia Profesional',
    education: 'Educación',
    skills: 'Habilidades',
    languages: 'Idiomas',
    technical: 'Habilidades Técnicas',
    interpersonal: 'Soft Skills',
    projects: 'Proyectos',
    certifications: 'Certificaciones',
    present: 'Presente',
  },
};

// Custom section label translations
const CUSTOM_SECTION_LABELS = {
  en: { custom_langues: 'Languages', custom_atouts: 'Strengths', custom_loisirs: 'Hobbies' },
  fr: { custom_langues: 'Langues', custom_atouts: 'Atouts', custom_loisirs: 'Loisirs' },
  es: { custom_langues: 'Idiomas', custom_atouts: 'Fortalezas', custom_loisirs: 'Aficiones' },
};

/**
 * Checks if a heading value is a "stock" (default) value that should be translated,
 * as opposed to a user-customized value that should be preserved.
 */
function isStockHeading(key, value) {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  if (!v) return true;
  // Check against all languages' defaults for this key
  for (const lang of Object.values(HEADING_DEFAULTS)) {
    if (lang[key] && v === lang[key].toLowerCase()) return true;
  }
  // Legacy values that should also be considered "stock"
  if (key === 'languages' && v === 'languages') return true;
  if (key === 'technical' && v === 'technical skills') return true;
  return false;
}

/**
 * Translates resume headings to the target language.
 * Only translates headings that are still at their default/stock value.
 * User-customized headings are preserved as-is.
 * 
 * @param {Object} currentHeadings - The current headings object
 * @param {string} targetLang - Target language code ('en', 'fr', 'es')
 * @returns {Object} Translated headings object
 */
export function translateHeadings(currentHeadings, targetLang) {
  const target = HEADING_DEFAULTS[targetLang] || HEADING_DEFAULTS.en;
  const result = { ...currentHeadings };

  for (const key of Object.keys(target)) {
    if (isStockHeading(key, currentHeadings[key])) {
      result[key] = target[key];
    }
  }

  return result;
}

/**
 * Translates custom section labels (Langues, Atouts, Loisirs) to the target language.
 * 
 * @param {Array} customSections - The current custom sections array
 * @param {string} targetLang - Target language code
 * @returns {Array} Updated custom sections array
 */
export function translateCustomSectionLabels(customSections, targetLang) {
  const labels = CUSTOM_SECTION_LABELS[targetLang] || CUSTOM_SECTION_LABELS.en;
  return (customSections || []).map(s => {
    if (labels[s.id]) return { ...s, label: labels[s.id] };
    return s;
  });
}
