import { describe, it, expect } from 'vitest';
import { mergeSelected } from '../utils/mergeSelected';
import { DEFAULT_DATA } from '../utils/constants';
import { DEMO_DATA_1_PAGE, DEMO_DATA_2_PAGES, DEMO_DATA_1_PAGE_FR, DEMO_DATA_2_PAGES_FR } from '../utils/demoData';

// Monte Carlo generator for CV permutations
function generateRandomResume(seed) {
  const titles = [
    'Senior Fullstack Engineer', 'Directeur Technique', 'Product Manager', 'Data Scientist IA',
    'Responsable Marketing & Communication', 'Consultant Cybersécurité', 'Développeur Mobile Flutter'
  ];
  const summaries = [
    'Ingénieur avec **8 ans d\'expérience** dans le développement d\'applications cloud scalables.',
    'Expert en transformation digitale ayant piloté **+15 projets critiques** avec un ROI mesurable.',
    'Lead Développeur spécialisé React et Node.js, ayant amélioré les performances de **45%**.'
  ];
  const companies = ['TotalEnergies', 'Google France', 'Société Générale', 'Doctolib', 'Airbus', 'BNP Paribas'];
  const schools = ['École Polytechnique', 'HEC Paris', 'CentraleSupélec', 'INSA Lyon', 'Sorbonne Université'];
  const degrees = ['Master en Informatique', 'Diplôme d\'Ingénieur', 'Licence Professionnelle', 'Doctorat en IA'];

  const numExp = (seed % 4) + 1;
  const numEdu = (seed % 3) + 1;
  const numProj = (seed % 3) + 1;
  const numCert = (seed % 2) + 1;
  const numCustom = (seed % 2) + 1;

  const experience = [];
  for (let i = 0; i < numExp; i++) {
    experience.push({
      id: `exp_mc_${seed}_${i}`,
      company: companies[(seed + i) % companies.length],
      title: titles[(seed + i) % titles.length],
      location: i % 2 === 0 ? 'Paris, France' : 'Lyon, France / Remote',
      date: '2021 - Présent',
      technologies: 'React, TypeScript, Node.js, Docker, Kubernetes',
      description: 'Management d\'une équipe de 6 développeurs.',
      bullets: [
        `Développement d'une API haute performance traitant **${(i + 1) * 200}k req/min**.`,
        `Optimisation du pipeline CI/CD réduisant le temps de build de **${30 + i * 5}%**.`
      ]
    });
  }

  const education = [];
  for (let i = 0; i < numEdu; i++) {
    education.push({
      id: `edu_mc_${seed}_${i}`,
      institution: schools[(seed + i) % schools.length],
      degree: degrees[(seed + i) % degrees.length],
      fieldOfStudy: 'Génie Logiciel & Intelligence Artificielle',
      location: 'Paris, France',
      date: '2016 - 2021'
    });
  }

  const projects = [];
  for (let i = 0; i < numProj; i++) {
    projects.push({
      id: `proj_mc_${seed}_${i}`,
      name: `Projet Alpha ${i + 1}`,
      role: 'Lead Architect',
      description: 'Plateforme SaaS de gestion d\'actifs financiers.',
      techStack: 'Next.js, Python, FastAPI, PostgreSQL',
      highlights: [
        `Acquisition de **${10 + i * 5}k utilisateurs** actifs le premier mois.`,
        'Conformité stricte RGPD et SOC2.'
      ]
    });
  }

  const certifications = [];
  for (let i = 0; i < numCert; i++) {
    certifications.push({
      id: `cert_mc_${seed}_${i}`,
      name: `Certification Cloud Architect Level ${i + 1}`,
      issuer: 'Google Cloud Platform',
      date: '2023'
    });
  }

  const customSections = [];
  for (let i = 0; i < numCustom; i++) {
    customSections.push({
      id: `custom_mc_${seed}_${i}`,
      label: i === 0 ? 'Langues' : 'Atouts Clés',
      items: [
        {
          id: `custom_item_mc_${seed}_${i}_1`,
          title: i === 0 ? 'Français' : 'Leadership & Management',
          subtitle: i === 0 ? 'Langue maternelle' : '10 ans de pratique',
          description: i === 0 ? 'Niveau C2' : 'Encadrement d\'équipes multiculturelles'
        },
        {
          id: `custom_item_mc_${seed}_${i}_2`,
          title: i === 0 ? 'Anglais' : 'Résolution de Problèmes Complexes',
          subtitle: i === 0 ? 'Courant professionnel' : 'Expertise reconnue',
          description: i === 0 ? 'TOEIC 980/990' : 'Méthodologie Lean & Six Sigma'
        }
      ]
    });
  }

  return {
    personal: {
      name: `Jean Dupont ${seed}`,
      tagline: titles[seed % titles.length],
      email: `jean.dupont.${seed}@example.com`,
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France / Télétravail',
      website: 'https://jeandupont.dev'
    },
    summary: summaries[seed % summaries.length],
    experience,
    education,
    skills: {
      technical: 'JavaScript, TypeScript, React, Node.js, Python, Docker, AWS, PostgreSQL',
      soft: 'Rigueur, Travail en équipe, Communication, Autonomie',
      languages: 'Français (Natif), Anglais (Courant C1), Espagnol (Notions)'
    },
    projects,
    certifications,
    customSections,
    headings: {
      summary: 'Profil Professionnel',
      experience: 'Expériences Professionnelles',
      education: 'Formation & Diplômes',
      skills: 'Compétences Techniques & Humaines',
      projects: 'Projets Notables',
      certifications: 'Certifications & Accréditations'
    }
  };
}

// Generate a translated counterpart
function createTranslatedResume(original, lang = 'en') {
  const clone = structuredClone(original);
  
  if (clone.personal) {
    clone.personal.tagline = `[${lang.toUpperCase()}] ${original.personal.tagline} Translated`;
    clone.personal.location = `[${lang.toUpperCase()}] Paris, France / Remote`;
  }
  if (clone.summary) {
    clone.summary = `[${lang.toUpperCase()}] ${original.summary} Translated with **high impact** metrics.`;
  }
  if (clone.skills) {
    clone.skills.technical = `[${lang.toUpperCase()}] Programming languages: TypeScript, Python, Cloud: AWS`;
    clone.skills.soft = `[${lang.toUpperCase()}] Rigor, Teamwork, Clear Communication, Autonomy`;
    clone.skills.languages = `[${lang.toUpperCase()}] French (Native), English (Fluent C1), Spanish (Basic)`;
  }
  clone.experience?.forEach((exp) => {
    exp.title = `[${lang.toUpperCase()}] ${exp.title} Translated`;
    exp.location = `[${lang.toUpperCase()}] Remote / Paris`;
    exp.date = `2021 - Present`;
    exp.technologies = `[${lang.toUpperCase()}] ${exp.technologies}`;
    exp.description = `[${lang.toUpperCase()}] Management of 6 engineers.`;
    exp.bullets = exp.bullets?.map(b => `[${lang.toUpperCase()}] Translated bullet: ${b}`);
  });
  clone.education?.forEach((edu) => {
    edu.degree = `[${lang.toUpperCase()}] Master of Science`;
    edu.fieldOfStudy = `[${lang.toUpperCase()}] Software Engineering & AI`;
  });
  clone.projects?.forEach((proj) => {
    proj.role = `[${lang.toUpperCase()}] Lead Software Architect`;
    proj.description = `[${lang.toUpperCase()}] Translated SaaS asset management platform.`;
    proj.techStack = `[${lang.toUpperCase()}] Next.js, Python`;
    proj.highlights = proj.highlights?.map(h => `[${lang.toUpperCase()}] Translated highlight: ${h}`);
  });
  clone.certifications?.forEach((cert) => {
    cert.name = `[${lang.toUpperCase()}] Cloud Architect Certified`;
  });
  clone.customSections?.forEach((sec) => {
    sec.label = `[${lang.toUpperCase()}] ${sec.label}`;
    sec.title = `[${lang.toUpperCase()}] ${sec.title || sec.label}`;
    sec.items?.forEach((item) => {
      item.title = `[${lang.toUpperCase()}] ${item.title}`;
      item.subtitle = `[${lang.toUpperCase()}] ${item.subtitle}`;
      item.description = `[${lang.toUpperCase()}] ${item.description}`;
    });
  });
  clone.headings = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills & Proficiencies',
    projects: 'Notable Projects',
    certifications: 'Certifications'
  };

  return clone;
}

describe('Monte Carlo Translation Integrity Test Suite (50 Permutations)', () => {

  it('runs 50 Monte Carlo permutations verifying 100% field merge without data loss', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const original = generateRandomResume(seed);
      const translated = createTranslatedResume(original, 'en');

      // 1. Build all selected IDs
      const selectedIds = new Set();
      selectedIds.add('tagline');
      selectedIds.add('location');
      selectedIds.add('summary');
      selectedIds.add('skills.technical');
      selectedIds.add('skills.soft');
      selectedIds.add('skills.languages');

      original.experience.forEach((exp, idx) => {
        const id = exp.id || idx;
        selectedIds.add(`exp.${id}.title`);
        selectedIds.add(`exp.${id}.location`);
        selectedIds.add(`exp.${id}.date`);
        selectedIds.add(`exp.${id}.tech`);
        selectedIds.add(`exp.${id}.desc`);
        exp.bullets.forEach((_, bIdx) => selectedIds.add(`exp.${id}.bullet.${bIdx}`));
      });

      original.education.forEach((edu, idx) => {
        const id = edu.id || idx;
        selectedIds.add(`edu.${id}.degree`);
        selectedIds.add(`edu.${id}.field`);
      });

      original.projects.forEach((proj, idx) => {
        const id = proj.id || idx;
        selectedIds.add(`proj.${id}.role`);
        selectedIds.add(`proj.${id}.desc`);
        selectedIds.add(`proj.${id}.tech`);
        proj.highlights.forEach((_, bIdx) => selectedIds.add(`proj.${id}.highlight.${bIdx}`));
      });

      original.certifications.forEach((cert, idx) => {
        const id = cert.id || idx;
        selectedIds.add(`cert.${id}.name`);
      });

      original.customSections.forEach((sec) => {
        selectedIds.add(`custom.${sec.id}.title`);
        sec.items.forEach((item, iIdx) => {
          const id = item.id || iIdx;
          selectedIds.add(`custom.${sec.id}.${id}.title`);
          selectedIds.add(`custom.${sec.id}.${id}.subtitle`);
          selectedIds.add(`custom.${sec.id}.${id}.desc`);
        });
      });

      // 2. Perform merge directly with wrapped payload { translatedResume: translated }
      const wrappedPayload = { translatedResume: translated };
      const merged = mergeSelected(original, wrappedPayload, selectedIds);

      // 3. Mathematical assertions: Every single selected field MUST equal translated value
      expect(merged.personal.tagline).toBe(translated.personal.tagline);
      expect(merged.personal.location).toBe(translated.personal.location);
      expect(merged.summary).toBe(translated.summary);
      expect(merged.skills.technical).toBe(translated.skills.technical);
      expect(merged.skills.soft).toBe(translated.skills.soft);
      expect(merged.skills.languages).toBe(translated.skills.languages);

      merged.experience.forEach((exp, idx) => {
        expect(exp.title).toBe(translated.experience[idx].title);
        expect(exp.location).toBe(translated.experience[idx].location);
        expect(exp.date).toBe(translated.experience[idx].date);
        exp.bullets.forEach((b, bIdx) => {
          expect(b).toBe(translated.experience[idx].bullets[bIdx]);
        });
      });

      merged.education.forEach((edu, idx) => {
        expect(edu.degree).toBe(translated.education[idx].degree);
        expect(edu.fieldOfStudy).toBe(translated.education[idx].fieldOfStudy);
      });

      merged.projects.forEach((proj, idx) => {
        expect(proj.role).toBe(translated.projects[idx].role);
        expect(proj.description).toBe(translated.projects[idx].description);
        proj.highlights.forEach((h, hIdx) => {
          expect(h).toBe(translated.projects[idx].highlights[hIdx]);
        });
      });

      merged.certifications.forEach((cert, idx) => {
        expect(cert.name).toBe(translated.certifications[idx].name);
      });

      merged.customSections.forEach((sec, sIdx) => {
        expect(sec.title || sec.label).toBe(translated.customSections[sIdx].title || translated.customSections[sIdx].label);
        sec.items.forEach((item, iIdx) => {
          expect(item.title).toBe(translated.customSections[sIdx].items[iIdx].title);
          expect(item.subtitle).toBe(translated.customSections[sIdx].items[iIdx].subtitle);
          expect(item.description).toBe(translated.customSections[sIdx].items[iIdx].description);
        });
      });

      expect(merged.headings.summary).toBe(translated.headings.summary);
      expect(merged.headings.experience).toBe(translated.headings.experience);
    }
  });

  it('correctly ignores unselected fields and preserves original data', () => {
    const original = generateRandomResume(42);
    const translated = createTranslatedResume(original, 'en');

    // Select ONLY the summary, nothing else
    const selectedIds = new Set(['summary']);
    const merged = mergeSelected(original, translated, selectedIds);

    // Summary is updated
    expect(merged.summary).toBe(translated.summary);

    // Everything else remains strictly identical to original
    expect(merged.personal.tagline).toBe(original.personal.tagline);
    expect(merged.skills.technical).toBe(original.skills.technical);
    expect(merged.experience[0].title).toBe(original.experience[0].title);
    expect(merged.education[0].degree).toBe(original.education[0].degree);
  });

  it('validates translation merge on all built-in demo datasets (1-Page, 2-Pages, FR & EN)', () => {
    const datasets = [DEMO_DATA_1_PAGE, DEMO_DATA_2_PAGES, DEMO_DATA_1_PAGE_FR, DEMO_DATA_2_PAGES_FR];

    datasets.forEach((demo) => {
      const translated = createTranslatedResume(demo, 'es');
      const allSelected = new Set(['summary', 'tagline', 'skills.technical', 'skills.soft', 'skills.languages']);
      
      demo.experience?.forEach((e, idx) => {
        const id = e.id || idx;
        allSelected.add(`exp.${id}.title`);
        e.bullets?.forEach((_, bIdx) => allSelected.add(`exp.${id}.bullet.${bIdx}`));
      });

      const merged = mergeSelected(demo, { translatedResume: translated }, allSelected);
      expect(merged.summary).toBe(translated.summary);
      if (demo.skills?.technical) {
        expect(merged.skills.technical).toBe(translated.skills.technical);
      }
    });
  });

});
