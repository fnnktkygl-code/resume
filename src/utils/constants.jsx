export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const YEARS = Array.from({ length: 30 }, (_, i) => String(2026 - i));

export const STEPS = [
  { 
    id: 'personal', 
    label: 'Personal', 
    icon: <i className="fi fi-rr-user" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'summary', 
    label: 'Summary', 
    icon: <i className="fi fi-rr-document" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'experience', 
    label: 'Experience', 
    icon: <i className="fi fi-rr-briefcase" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'education', 
    label: 'Education', 
    icon: <i className="fi fi-rr-graduation-cap" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'skills', 
    label: 'Skills', 
    icon: <i className="fi fi-rr-bulb" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    icon: <i className="fi fi-rr-folder" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
  { 
    id: 'certifications', 
    label: 'Certs', 
    icon: <i className="fi fi-rr-diploma" style={{ fontSize: '1.1rem', lineHeight: 1 }}></i> 
  },
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

export function createEmptyCustomItem() {
  return {
    id: crypto.randomUUID(),
    title: '',
    subtitle: '',
    date: '',
    description: '',
  };
}

export function createEmptyCustomSection(label) {
  return {
    id: `custom_${crypto.randomUUID()}`,
    label: label,
    items: [createEmptyCustomItem()],
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
  customSections: [],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
};

