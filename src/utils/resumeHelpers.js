/**
 * Shared resume template helpers.
 * Extracted from 5 template files to eliminate duplication (Audit §4.2).
 * 
 * These functions encapsulate the logic that was previously copy-pasted
 * across ResumePreview, ModernTemplate, MinimalistTemplate, and NjmTemplate.
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
  if (!headings || headings[key] === undefined || headings[key] === null) return t(tKey);
  const val = String(headings[key]).trim();
  if (!val) return t(tKey);
  return val;
}

const MONTH_MAP = {
  // 0 - January / Janvier / Enero / 01
  'jan': 0, 'janv': 0, 'janv.': 0, 'janvier': 0, 'january': 0, 'ene': 0, 'ene.': 0, 'enero': 0, '01': 0, '1': 0,
  // 1 - February / Février / Febrero / 02
  'feb': 1, 'feb.': 1, 'fevr': 1, 'fevr.': 1, 'févr': 1, 'févr.': 1, 'fevrier': 1, 'février': 1, 'february': 1, 'febrero': 1, '02': 1, '2': 1,
  // 2 - March / Mars / Marzo / 03
  'mar': 2, 'mar.': 2, 'mars': 2, 'march': 2, 'marzo': 2, '03': 2, '3': 2,
  // 3 - April / Avril / Abril / 04
  'apr': 3, 'apr.': 3, 'avr': 3, 'avr.': 3, 'avril': 3, 'april': 3, 'abr': 3, 'abr.': 3, 'abril': 3, '04': 3, '4': 3,
  // 4 - May / Mai / Mayo / 05
  'may': 4, 'mai': 4, 'mayo': 4, '05': 4, '5': 4,
  // 5 - June / Juin / Junio / 06
  'jun': 5, 'jun.': 5, 'juin': 5, 'june': 5, 'junio': 5, '06': 5, '6': 5,
  // 6 - July / Juillet / Julio / 07
  'jul': 6, 'jul.': 6, 'juil': 6, 'juil.': 6, 'juillet': 6, 'july': 6, 'julio': 6, '07': 6, '7': 6,
  // 7 - August / Août / Agosto / 08
  'aug': 7, 'aug.': 7, 'aout': 7, 'août': 7, 'august': 7, 'ago': 7, 'ago.': 7, 'agosto': 7, '08': 7, '8': 7,
  // 8 - September / Septembre / Septiembre / 09
  'sep': 8, 'sep.': 8, 'sept': 8, 'sept.': 8, 'septembre': 8, 'september': 8, 'septiembre': 8, '09': 8, '9': 8,
  // 9 - October / Octobre / Octubre / 10
  'oct': 9, 'oct.': 9, 'octobre': 9, 'october': 9, 'octubre': 9, '10': 9,
  // 10 - November / Novembre / Noviembre / 11
  'nov': 10, 'nov.': 10, 'novembre': 10, 'november': 10, 'noviembre': 10, '11': 10,
  // 11 - December / Décembre / Diciembre / 12
  'dec': 11, 'dec.': 11, 'déc': 11, 'déc.': 11, 'decembre': 11, 'décembre': 11, 'december': 11, 'dic': 11, 'dic.': 11, 'diciembre': 11, '12': 11
};

const STANDARD_MONTH_KEYS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Normalizes any month representation (French, Spanish, English, numeric, full name, abbreviation)
 * into a standard 3-letter English key ('Jan'...'Dec').
 * 
 * @param {string|number} val
 * @returns {string}
 */
export function normalizeMonthValue(val) {
  if (!val && val !== 0) return '';
  const clean = String(val).toLowerCase().trim().replace(/[.,]/g, '');
  if (MONTH_MAP[clean] !== undefined) {
    return STANDARD_MONTH_KEYS[MONTH_MAP[clean]];
  }
  return String(val).trim();
}

/**
 * Formats a date from month abbreviation and year.
 * Translates the month accurately into the target language, normalizing any input format.
 * 
 * @param {string} month - Month string in any language/format (e.g. 'Jan', 'Avr', 'Août', '04', 'Janvier')
 * @param {string} year - Year string (e.g. '2024')
 * @param {string} language - The current language code ('en', 'fr', 'es')
 * @returns {string}
 */
export function formatResumeDate(month, year, language) {
  const t = (k) => getTranslation(language, k);
  if (!month && !year) return '';

  let formattedMonth = '';
  if (month) {
    const stdMonthKey = normalizeMonthValue(month);
    // If recognized in our universal month index, translate the standard key (Jan..Dec)
    if (STANDARD_MONTH_KEYS.includes(stdMonthKey)) {
      formattedMonth = t(stdMonthKey);
    } else {
      // Fallback for custom text
      formattedMonth = t(month) || month;
    }
  }

  if (formattedMonth && year) return `${formattedMonth} ${year}`;
  return year || formattedMonth || '';
}
