/**
 * Shared resume template helpers.
 * Extracted from 5 template files to eliminate duplication (Audit §4.2).
 * 
 * These functions encapsulate the logic that was previously copy-pasted
 * across ResumePreview, ModernTemplate, CreativeTemplate, MinimalistTemplate, and NjmTemplate.
 */

import { getTranslation } from './translations';

/**
 * Checks if any contact field is present in the personal data.
 * @param {Object} personal - The personal data object
 * @returns {boolean}
 */
export function hasContactInfo(personal) {
  if (!personal) return false;
  const p = personal;
  return !!(p.name || p.email || p.phone || p.location || p.linkedin || p.github || p.website);
}

/**
 * Returns the heading to display for a given section.
 * If the user has customized the heading, it's returned as-is.
 * Otherwise, the translated default is returned.
 * 
 * @param {Object} headings - The headings data object (h)
 * @param {string} key - The heading key (e.g. 'experience')
 * @param {string} defaultEn - The default English value to compare against
 * @param {string} tKey - The translation key to use when returning the default
 * @param {string} language - The current language code
 * @returns {string}
 */
export function displayHeading(headings, key, defaultEn, tKey, language) {
  const t = (k) => getTranslation(language, k);
  if (!headings[key]) return t(tKey);
  const val = headings[key].trim();
  if (!val) return t(tKey);
  const vLower = val.toLowerCase();
  if (
    vLower === defaultEn.toLowerCase() ||
    vLower === key.toLowerCase() ||
    vLower === 'technical:' ||
    vLower === 'interpersonal:' ||
    vLower === 'languages:'
  ) {
    return t(tKey);
  }
  return val;
}

/**
 * Formats a date from month abbreviation and year.
 * Translates the month using the current language.
 * 
 * @param {string} month - Month abbreviation (e.g. 'Jan')
 * @param {string} year - Year string (e.g. '2024')
 * @param {string} language - The current language code
 * @returns {string}
 */
export function formatResumeDate(month, year, language) {
  const t = (k) => getTranslation(language, k);
  if (!month && !year) return '';
  if (month && year) return `${t(month)} ${year}`;
  return year || t(month) || '';
}
