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
    id: safeUUID(),
    company: '',
    title: '',
    link: '',
    icon: 'chart',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    current: false,
    bullets: [''],
    technologies: '',
  };
}

export function createEmptyEducation() {
  return {
    id: safeUUID(),
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    location: '',
    technologies: '',
  };
}

export function createEmptyProject() {
  return {
    id: safeUUID(),
    name: '',
    description: '',
    techStack: '',
    link: '',
    highlights: [''],
  };
}

export function createEmptyCertification() {
  return {
    id: safeUUID(),
    name: '',
    issuer: '',
    date: '',
    credentialUrl: '',
  };
}

export function createEmptySpacer(column = 'main') {
  return {
    id: `spacer_${column}_${safeUUID()}`,
    type: 'spacer',
    height: 32,
  };
}

export function safeUUID() {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}

export function createEmptyCustomItem() {
  return {
    id: safeUUID(),
    title: '',
    subtitle: '',
    date: '',
    description: '',
  };
}

export function createEmptyCustomSection(label) {
  return {
    id: `custom_${safeUUID()}`,
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
    technical: 'Technical Skills',
    interpersonal: 'Soft Skills',
    languages: 'Languages',
    present: 'Present',
  },
  summary: '',
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
  skills: { technical: '', soft: '', languages: '' },
  projects: [createEmptyProject()],
  certifications: [createEmptyCertification()],
  customSections: [
    {
      id: 'custom_langues',
      label: 'Langues',
      items: [
        {
          id: 'item_langues_1',
          title: '',
          subtitle: '',
          date: '',
          description: ''
        }
      ]
    },
    {
      id: 'custom_atouts',
      label: 'Atouts',
      items: [
        {
          id: 'item_atouts_1',
          title: '',
          subtitle: '',
          date: '',
          description: ''
        }
      ]
    },
    {
      id: 'custom_loisirs',
      label: 'Loisirs',
      items: [
        {
          id: 'item_loisirs_1',
          title: '',
          subtitle: '',
          date: '',
          description: ''
        }
      ]
    }
  ],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom_langues', 'custom_atouts', 'custom_loisirs'],
  sectionSpacers: {},
};

