export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const YEARS = Array.from({ length: 30 }, (_, i) => String(2026 - i));

export const STEPS = [
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certs', icon: '🏆' },
];

export function createEmptyExperience() {
  return {
    id: crypto.randomUUID(),
    company: '',
    title: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    current: false,
    bullets: [''],
  };
}

export function createEmptyEducation() {
  return {
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
  };
}

export function createEmptyProject() {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    techStack: '',
    link: '',
    highlights: [''],
  };
}

export function createEmptyCertification() {
  return {
    id: crypto.randomUUID(),
    name: '',
    issuer: '',
    date: '',
    credentialUrl: '',
  };
}

// Keep backward-compat aliases
export const EMPTY_EXPERIENCE = createEmptyExperience();
export const EMPTY_EDUCATION = createEmptyEducation();
export const EMPTY_PROJECT = createEmptyProject();
export const EMPTY_CERTIFICATION = createEmptyCertification();

export const DEFAULT_DATA = {
  personal: { name: '', tagline: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '' },
  headings: {
    summary: 'Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    technical: 'Technical:',
    interpersonal: 'Interpersonal:',
    languages: 'Languages:',
    present: 'Present',
  },
  summary: '',
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
  skills: { technical: '', soft: '', languages: '' },
  projects: [createEmptyProject()],
  certifications: [createEmptyCertification()],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
};

