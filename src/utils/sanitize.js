/**
 * Sanitize imported JSON resume data.
 * Strips HTML tags from all string values and validates structure.
 */

import { safeUUID } from './constants';

const KNOWN_SECTION_IDS = new Set(['summary', 'experience', 'education', 'skills', 'projects', 'certifications']);
const PERSONAL_KEYS = ['name', 'tagline', 'email', 'phone', 'location', 'linkedin', 'website', 'github'];
const PERSONAL_URL_KEYS = ['linkedin', 'website', 'github'];

const domParser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  if (domParser) {
    const doc = domParser.parseFromString(str, 'text/html');
    return (doc.body.textContent || '').trim();
  }
  return str.replace(/<[^>]*>/g, '').trim();
}

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed, 'https://placeholder.invalid');
    if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) return '';
    return trimmed;
  } catch {
    return '';
  }
}

function sanitizeString(val) {
  if (typeof val === 'string') return stripHtml(val);
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val;
  return '';
}

function sanitizeObject(obj, allowedKeys, urlKeys = []) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const key of allowedKeys) {
    if (key in obj) {
      result[key] = urlKeys.includes(key) ? sanitizeUrl(obj[key]) : sanitizeString(obj[key]);
    }
  }
  return result;
}

function sanitizeExperience(exp) {
  if (!exp || typeof exp !== 'object') return null;
  return {
    id: exp.id || safeUUID(),
    company: stripHtml(exp.company || ''),
    title: stripHtml(exp.title || ''),
    startMonth: stripHtml(exp.startMonth || ''),
    startYear: stripHtml(exp.startYear || ''),
    endMonth: stripHtml(exp.endMonth || ''),
    endYear: stripHtml(exp.endYear || ''),
    current: Boolean(exp.current),
    bullets: Array.isArray(exp.bullets) ? exp.bullets.map(b => stripHtml(b || '')) : [''],
  };
}

function sanitizeEducation(edu) {
  if (!edu || typeof edu !== 'object') return null;
  return {
    id: edu.id || safeUUID(),
    institution: stripHtml(edu.institution || ''),
    degree: stripHtml(edu.degree || ''),
    field: stripHtml(edu.field || ''),
    startYear: stripHtml(edu.startYear || ''),
    endYear: stripHtml(edu.endYear || ''),
  };
}

function sanitizeProject(proj) {
  if (!proj || typeof proj !== 'object') return null;
  return {
    id: proj.id || safeUUID(),
    name: stripHtml(proj.name || ''),
    description: stripHtml(proj.description || ''),
    techStack: stripHtml(proj.techStack || ''),
    link: sanitizeUrl(proj.link || ''),
    highlights: Array.isArray(proj.highlights) ? proj.highlights.map(h => stripHtml(h || '')) : [''],
  };
}

function sanitizeCertification(cert) {
  if (!cert || typeof cert !== 'object') return null;
  return {
    id: cert.id || safeUUID(),
    name: stripHtml(cert.name || ''),
    issuer: stripHtml(cert.issuer || ''),
    date: stripHtml(cert.date || ''),
    credentialUrl: sanitizeUrl(cert.credentialUrl || ''),
  };
}

function sanitizeCustomSection(section) {
  if (!section || typeof section !== 'object') return null;
  return {
    id: section.id || `custom_${safeUUID()}`,
    label: stripHtml(section.label || ''),
    items: Array.isArray(section.items)
      ? section.items.map(item => {
          if (!item || typeof item !== 'object') return null;
          return {
            id: item.id || safeUUID(),
            title: stripHtml(item.title || ''),
            subtitle: stripHtml(item.subtitle || ''),
            date: stripHtml(item.date || ''),
            description: stripHtml(item.description || ''),
          };
        }).filter(Boolean)
      : [],
  };
}

function sanitizeSectionOrder(order, customSections) {
  if (!Array.isArray(order)) return undefined;
  const validCustomIds = new Set(
    Array.isArray(customSections) ? customSections.map(s => s?.id).filter(Boolean) : []
  );
  return order.filter(id =>
    typeof id === 'string' && (KNOWN_SECTION_IDS.has(id) || validCustomIds.has(id))
  );
}

export function sanitizeResumeData(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid resume data: expected an object');
  }

  const customSections = Array.isArray(raw.customSections)
    ? raw.customSections.map(sanitizeCustomSection).filter(Boolean)
    : [];

  const sectionOrder = sanitizeSectionOrder(raw.sectionOrder, customSections);

  return {
    personal: sanitizeObject(raw.personal, PERSONAL_KEYS, PERSONAL_URL_KEYS),
    headings: raw.headings && typeof raw.headings === 'object'
      ? Object.fromEntries(Object.entries(raw.headings).map(([k, v]) => [k, stripHtml(v)]))
      : undefined,
    summary: stripHtml(raw.summary || ''),
    experience: Array.isArray(raw.experience)
      ? raw.experience.map(sanitizeExperience).filter(Boolean)
      : [],
    education: Array.isArray(raw.education)
      ? raw.education.map(sanitizeEducation).filter(Boolean)
      : [],
    skills: raw.skills && typeof raw.skills === 'object'
      ? { technical: stripHtml(raw.skills.technical || ''), soft: stripHtml(raw.skills.soft || ''), languages: stripHtml(raw.skills.languages || '') }
      : { technical: '', soft: '', languages: '' },
    projects: Array.isArray(raw.projects)
      ? raw.projects.map(sanitizeProject).filter(Boolean)
      : [],
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications.map(sanitizeCertification).filter(Boolean)
      : [],
    customSections,
    ...(sectionOrder ? { sectionOrder } : {}),
  };
}
