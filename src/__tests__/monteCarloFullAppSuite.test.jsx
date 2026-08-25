// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import resumeReducer from '../reducers/resumeReducer';
import { computeAtsScore } from '../utils/atsScore';
import { parseSkillsToTags, parseMarkdown, markdownToHtml, htmlToMarkdown } from '../utils/formatText';
import { exportMarkdown, exportJson, exportDocx, importJson } from '../utils/exporters';
import { sanitizeResumeData } from '../utils/sanitize';
import { mergeSelected } from '../utils/mergeSelected';
import ResumePreview from '../components/ResumePreview';
import { DEFAULT_DATA } from '../utils/constants';

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.__TEST_SKIP_DOWNLOAD__ = true;
  }
  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// Pseudo-random deterministic generator (Linear Congruential Generator)
function makePrng(seed = 123456789) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Generate chaotic resumes with extreme values, special chars, emojis, XSS payloads, RTL, asian chars
function generateChaoticResume(rnd) {
  const titles = [
    'Software Engineer', 'Développeur Full-Stack', 'Senior Lead Architect & DevOps',
    '<script>alert("xss")</script>', 'مطور برمجيات', '高级软件工程师', 'Разработчик ПО',
    '🚀 10x Unicorn Engineer 🦄 🔥', 'CEO & Founder (ex-Google / ex-Meta)',
    'A'.repeat(300), '', '   '
  ];

  const descriptions = [
    'Optimized database latency by **45%** across **10M requests/sec**.',
    'Led migration from monolith to microservices using Kubernetes & Terraform.',
    'Pioneered internal AI tools reducing ticket resolution time by **60%**.',
    '<b>Injected HTML</b> & Special chars: !@#$%^&*()_+-=[]{}|;:",.<>?/`~',
    'Short bullet.',
    'B'.repeat(2000),
    '**Unclosed markdown bold text and *italic* mismatch'
  ];

  const techStacks = [
    'React, Node.js, TypeScript, PostgreSQL, Docker, AWS',
    'Python, PyTorch, TensorFlow, CUDA, C++',
    'Java, Spring Boot, Kafka, Kubernetes, Redis',
    'Vue.js, PHP, Laravel, MySQL, Nginx',
    'Rust, WebAssembly, Go, gRPC, Protobuf',
    '', '   ', 'UnknownTech1, UnknownTech2, C#, .NET'
  ];

  const numExp = Math.floor(rnd() * 6);
  const numEdu = Math.floor(rnd() * 4);
  const numProj = Math.floor(rnd() * 4);
  const numCert = Math.floor(rnd() * 4);
  const numCustom = Math.floor(rnd() * 3);

  const experience = [];
  for (let i = 0; i < numExp; i++) {
    const isSpacer = rnd() > 0.85;
    if (isSpacer) {
      experience.push({ id: `exp_sp_${i}`, isSpacer: true, height: Math.floor(rnd() * 60) + 10 });
    } else {
      const numBullets = Math.floor(rnd() * 5);
      const bullets = [];
      for (let b = 0; b < numBullets; b++) {
        bullets.push(descriptions[Math.floor(rnd() * descriptions.length)]);
      }
      experience.push({
        id: `exp_${i}_${Math.floor(rnd() * 10000)}`,
        company: `Company ${titles[Math.floor(rnd() * titles.length)].slice(0, 20)}`,
        title: titles[Math.floor(rnd() * titles.length)],
        location: rnd() > 0.5 ? 'Paris, France' : 'Remote / New York',
        date: rnd() > 0.5 ? '2020 - Présent' : '2018 - 2020',
        technologies: techStacks[Math.floor(rnd() * techStacks.length)],
        description: descriptions[Math.floor(rnd() * descriptions.length)],
        bullets
      });
    }
  }

  const education = [];
  for (let i = 0; i < numEdu; i++) {
    education.push({
      id: `edu_${i}`,
      institution: `University of Technology ${i}`,
      degree: 'Master of Science in Computer Science',
      fieldOfStudy: 'Software Systems & AI',
      location: 'Paris, France',
      date: '2015 - 2020'
    });
  }

  const projects = [];
  for (let i = 0; i < numProj; i++) {
    projects.push({
      id: `proj_${i}`,
      name: `Project Matrix ${i}`,
      role: 'Lead Architect',
      description: descriptions[Math.floor(rnd() * descriptions.length)],
      techStack: techStacks[Math.floor(rnd() * techStacks.length)],
      highlights: [descriptions[Math.floor(rnd() * descriptions.length)]]
    });
  }

  const certifications = [];
  for (let i = 0; i < numCert; i++) {
    certifications.push({
      id: `cert_${i}`,
      name: `AWS Certified Solutions Architect Level ${i}`,
      issuer: 'Amazon Web Services',
      date: '2023'
    });
  }

  const customSections = [];
  for (let i = 0; i < numCustom; i++) {
    customSections.push({
      id: `custom_sec_${i}`,
      label: i === 0 ? 'Langues' : (i === 1 ? 'Atouts Clés' : `Custom ${i}`),
      items: [
        {
          id: `custom_item_${i}_1`,
          title: 'Français',
          subtitle: 'Langue maternelle',
          description: 'Niveau C2'
        },
        {
          id: `custom_item_${i}_2`,
          title: 'English',
          subtitle: 'Professional working proficiency',
          description: 'TOEIC 990'
        }
      ]
    });
  }

  return {
    personal: {
      name: `Candidate ${Math.floor(rnd() * 1000)}`,
      tagline: titles[Math.floor(rnd() * titles.length)],
      email: `candidate.${Math.floor(rnd() * 1000)}@domain.com`,
      phone: '+33 6 00 00 00 00',
      location: 'Paris, France',
      website: 'https://portfolio.example.com',
      linkedin: 'https://linkedin.com/in/candidate',
      github: 'https://github.com/candidate'
    },
    summary: descriptions[Math.floor(rnd() * descriptions.length)],
    skills: {
      technical: techStacks[Math.floor(rnd() * techStacks.length)],
      soft: 'Problem Solving, Team Leadership, Adaptability, Rigor',
      languages: 'French (Native), English (Fluent), Spanish (Intermediate)',
      highlightedSkills: ['react', 'python', 'docker']
    },
    experience,
    education,
    projects,
    certifications,
    customSections,
    headings: {
      summary: 'Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications'
    },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
  };
}

describe('Monte Carlo Full-App Resiliency & Stress Test Battery', () => {

  it('Stress Test 1: Chaos Monkey Reducer (1,000 randomized state mutations)', () => {
    const rnd = makePrng(42);
    let state = structuredClone(DEFAULT_DATA);

    const actionTypes = [
      'SET_DATA', 'UPDATE_PERSONAL', 'UPDATE_HEADINGS', 'UPDATE_SUMMARY',
      'UPDATE_SKILLS', 'UPDATE_EXPERIENCE', 'UPDATE_EDUCATION', 'UPDATE_PROJECTS',
      'UPDATE_CERTIFICATIONS', 'UPDATE_CUSTOM_SECTIONS', 'UPDATE_LAYOUT',
      'REORDER_SECTIONS', 'REMOVE_SECTION', 'ADD_CUSTOM_SECTION', 'ADD_SPACER_SECTION',
      'ADD_SECTION_SPACER', 'UPDATE_SECTION_SPACER', 'DELETE_SECTION_SPACER',
      'REORDER_ITEMS', 'DELETE_ITEM', 'UPDATE_ITEM', 'ADD_ITEM_SPACER',
      'UNKNOWN_CHAOS_ACTION'
    ];

    for (let i = 0; i < 1000; i++) {
      const type = actionTypes[Math.floor(rnd() * actionTypes.length)];
      let payload;

      if (type === 'SET_DATA') {
        payload = rnd() > 0.1 ? generateChaoticResume(rnd) : null;
      } else if (type === 'UPDATE_SUMMARY') {
        payload = rnd() > 0.5 ? `Summary text ${i}` : { summary: `Nested summary ${i}` };
      } else if (type === 'UPDATE_PERSONAL') {
        payload = { name: `Name ${i}`, tagline: `Tagline ${i}` };
      } else if (type === 'UPDATE_SKILLS') {
        payload = { technical: 'React, Node', soft: 'Leadership', highlightedSkills: ['react'] };
      } else if (type === 'REORDER_SECTIONS') {
        payload = ['skills', 'summary', 'experience'];
      } else if (type === 'REMOVE_SECTION') {
        payload = rnd() > 0.5 ? 'summary' : `custom_sec_${Math.floor(rnd() * 5)}`;
      } else if (type === 'ADD_CUSTOM_SECTION') {
        payload = `New Section ${i}`;
      } else if (type === 'ADD_SPACER_SECTION') {
        payload = { currentStepId: 'experience' };
      } else if (type === 'REORDER_ITEMS') {
        payload = { sectionId: 'experience', fromIdx: 0, toIdx: 1 };
      } else if (type === 'DELETE_ITEM') {
        payload = { sectionId: 'experience', index: 0 };
      } else if (type === 'UPDATE_ITEM') {
        payload = { sectionId: 'experience', index: 0, updatedItem: { title: 'Updated' } };
      } else if (type === 'ADD_ITEM_SPACER') {
        payload = { sectionId: 'experience', index: 0 };
      } else {
        payload = null;
      }

      // Must never throw, crash, or return undefined
      expect(() => {
        state = resumeReducer(state, { type, payload });
      }).not.toThrow();

      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    }
  });

  it('Stress Test 2: Multi-Template Visual Render Matrix (200 template & layout combinations)', () => {
    const rnd = makePrng(101);
    const templates = ['standard', 'modern', 'njm', 'minimalist'];
    const languages = ['en', 'fr', 'es'];
    const skillStyles = ['outline', 'pill-outline', 'square', 'pill', 'text'];

    for (let i = 0; i < 200; i++) {
      const template = templates[i % templates.length];
      const language = languages[i % languages.length];
      const skillStyle = skillStyles[i % skillStyles.length];
      const data = generateChaoticResume(rnd);

      const layout = {
        skillStyle,
        fontSize: 9 + (i % 4) * 0.5,
        lineHeight: 1.2 + (i % 3) * 0.1,
        paddingX: 0.5 + (i % 3) * 0.2,
        paddingY: 0.5 + (i % 3) * 0.2,
        accentColor: i % 2 === 0 ? '#1B6B3A' : '#1E3A8A',
        coloredSkills: i % 2 === 0,
        coloredSkillsMode: i % 3 === 0 ? 'all' : (i % 3 === 1 ? 'highlighted' : 'neutral')
      };

      const { container } = render(
        <ResumePreview
          data={data}
          layout={layout}
          language={language}
          template={template}
          compact={i % 2 === 0}
        />
      );

      expect(container.firstChild).toBeTruthy();
    }
  });

  it('Stress Test 3: Exporters & Importers Roundtrip Fuzzing (500 permutations)', () => {
    const rnd = makePrng(777);

    for (let i = 0; i < 500; i++) {
      const data = generateChaoticResume(rnd);

      // 1. Markdown export must not throw and must return a string
      const md = exportMarkdown(data);
      expect(typeof md).toBe('string');
      expect(md.length).toBeGreaterThan(0);

      // 2. JSON export
      const json = exportJson(data);
      expect(typeof json).toBe('string');

      // 3. DOCX export
      const docx = exportDocx(data);
      expect(typeof docx).toBe('string');
      expect(docx.length).toBeGreaterThan(0);

      // 4. Sanitize resume data
      const parsed = JSON.parse(json);
      const sanitized = sanitizeResumeData(parsed);
      expect(sanitized.personal).toBeDefined();
      expect(Array.isArray(sanitized.experience)).toBe(true);
      expect(Array.isArray(sanitized.education)).toBe(true);
      expect(Array.isArray(sanitized.projects)).toBe(true);
      expect(Array.isArray(sanitized.certifications)).toBe(true);
      expect(Array.isArray(sanitized.customSections)).toBe(true);
    }
  });

  it('Stress Test 4: ATS Scoring & Keyword Matcher Robustness (500 regex & edge cases)', () => {
    const rnd = makePrng(888);

    const pathologicalJobPostings = [
      '',
      '   ',
      'Senior React Developer with Node.js and TypeScript expertise.',
      'Special regex symbols: [.*+?^${}()|/\\$100% discount! (C++ & C#)]',
      'HTML / Injection: <script>alert("ats")</script> <img src=x onerror=attack()>',
      'Emoji spam: 🚀🔥💻🎯🏆🥇📈💯🎉',
      'Arabic / Hebrew: مهندس برمجيات محترف متمكن من الحوسبة السحابية',
      'Chinese / Japanese: 具有5年React和Node.js全栈开发经验的资深工程师',
      'Long posting: ' + 'Required skills: React, TypeScript, Docker, Kubernetes. '.repeat(200)
    ];

    for (let i = 0; i < 500; i++) {
      const resume = generateChaoticResume(rnd);
      const jobDesc = pathologicalJobPostings[i % pathologicalJobPostings.length];

      resume.targetJobDescription = jobDesc;
      if (i % 2 === 0) {
        resume.targetJobAnalysis = { matchScore: Math.floor(rnd() * 100), missingKeywords: ['React', 'Docker'] };
      }

      const ats = computeAtsScore(resume);

      expect(ats).toBeDefined();
      expect(typeof ats.score).toBe('number');
      expect(Number.isNaN(ats.score)).toBe(false);
      expect(ats.score).toBeGreaterThanOrEqual(0);
      expect(ats.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(ats.tips)).toBe(true);
    }
  });

  it('Stress Test 5: AI Merge & Visual Diff Selection Permutations (500 permutations)', () => {
    const rnd = makePrng(999);

    for (let i = 0; i < 500; i++) {
      const original = generateChaoticResume(rnd);
      const modified = generateChaoticResume(rnd);

      // Random subset of selected IDs
      const selectedIds = new Set();
      if (rnd() > 0.5) selectedIds.add('tagline');
      if (rnd() > 0.5) selectedIds.add('summary');
      if (rnd() > 0.5) selectedIds.add('skills.technical');
      if (rnd() > 0.5) selectedIds.add('skills.soft');

      original.experience.forEach((exp, idx) => {
        const id = exp.id || idx;
        if (rnd() > 0.5) selectedIds.add(`exp.${id}.title`);
        exp.bullets?.forEach((_, bIdx) => {
          if (rnd() > 0.5) selectedIds.add(`exp.${id}.bullet.${bIdx}`);
        });
      });

      const merged = mergeSelected(original, { translatedResume: modified }, selectedIds);

      expect(merged).toBeDefined();
      if (selectedIds.has('summary') && modified.summary !== undefined) {
        expect(merged.summary).toBe(modified.summary);
      } else {
        expect(merged.summary).toBe(original.summary);
      }
    }
  });

  it('Stress Test 6: WYSIWYG & Markdown Formatter Fuzzer (1,000 strings)', () => {
    const rnd = makePrng(555);

    const testStrings = [
      'Normal text without bold',
      '**Bold text** in the middle',
      '**Unclosed bold text at end',
      '***Triple star bold italic***',
      '****Quad star empty bold****',
      '**Bold with \n newline**',
      'Special & < > " characters',
      'Empty string: ',
      'Emoji **🚀 High Impact** metric: **+45%**',
      'Nested <b>HTML</b> and **Markdown** mixed',
      'Mathematical: $E=mc^2$ and \\$100 price'
    ];

    for (let i = 0; i < 1000; i++) {
      const base = testStrings[i % testStrings.length];
      const randomized = `${base} ${Math.floor(rnd() * 10000)} ${'*'.repeat(Math.floor(rnd() * 6))}`;

      // parseSkillsToTags
      expect(() => parseSkillsToTags(randomized)).not.toThrow();

      // markdownToHtml & htmlToMarkdown roundtrip
      const html = markdownToHtml(randomized);
      expect(typeof html).toBe('string');

      const md = htmlToMarkdown(html);
      expect(typeof md).toBe('string');
    }
  });

});
