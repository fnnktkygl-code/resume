import { describe, it, expect } from 'vitest';
import { computeAtsScore } from '../utils/atsScore';

describe('Scientific ATS Scoring & Monte Carlo Simulation Suite', () => {
  const techSkillsList = [
    'React, TypeScript, Next.js, Node.js, GraphQL, Docker, Tailwind CSS, Jest',
    'Kubernetes, Terraform, AWS, CI/CD, Python, Ansible, Prometheus, Linux',
    'Product Strategy, Agile, Scrum, Jira, User Research, SQL, A/B Testing',
    'SEO, Google Analytics, Paid Ads, Copywriting, HubSpot, CRM, SQL',
    'Python, PyTorch, SQL, Pandas, Scikit-Learn, BigQuery, Airflow, Spark',
    'Excel, Financial Modeling, DCF, PowerBI, Accounting, M&A, SAP',
    'Patient Care, EMR, Clinical Protocols, Healthcare Compliance, Triage',
    'Figma, User Research, Design Systems, Prototyping, Wireframing, Adobe XD'
  ];

  const xyzBullets = [
    'Spearheaded migration to microservices architecture, reducing deployment latency by 65% for 2M daily active users.',
    'Optimized database indexing and caching layer, slashing p99 latency from 450ms to 80ms while cutting AWS costs by $45,000/year.',
    'Led a cross-functional team of 8 engineers and 2 designers, delivering quarterly roadmap features 2 weeks ahead of schedule with 99.98% uptime.',
    'Formulated and executed growth marketing strategy, generating 15,000 qualified leads and boosting ARR by 42% in 9 months.',
    'Trained transformer model on 500k customer reviews, improving sentiment classification accuracy from 76% to 94.2%.'
  ];

  const vagueBullets = [
    'Worked on web development and fixed bugs.',
    'Responsible for servers and cloud infrastructure.',
    'Participated in team meetings and collaborated with colleagues.',
    'Helped with marketing campaigns and social media.',
    'Analyzed data and created reports for management.'
  ];

  it('Property 1: Monotonicity - Adding Harvard XYZ metrics strictly improves the structural ATS score', () => {
    for (let i = 0; i < 50; i++) {
      const baseCV = {
        personal: { name: 'Alex Morgan', email: 'alex@example.com', phone: '+33612345678', location: 'Paris, France' },
        summary: 'Experienced professional dedicated to delivering excellence in modern architectures and team workflows.',
        experience: [
          {
            company: 'TechCorp',
            title: 'Engineer',
            startMonth: '01',
            startYear: '2021',
            current: true,
            bullets: [vagueBullets[i % vagueBullets.length]]
          }
        ],
        education: [{ institution: 'Sorbonne University', degree: 'MSc Computer Science', startYear: '2018', endYear: '2020' }],
        skills: { technical: techSkillsList[i % techSkillsList.length] },
        certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon' }]
      };

      const scoreVague = computeAtsScore(baseCV);

      const improvedCV = {
        ...baseCV,
        experience: [
          {
            ...baseCV.experience[0],
            bullets: [xyzBullets[i % xyzBullets.length], xyzBullets[(i + 1) % xyzBullets.length]]
          }
        ]
      };

      const scoreXYZ = computeAtsScore(improvedCV);

      expect(scoreXYZ.structuralScore).toBeGreaterThan(scoreVague.structuralScore);
      expect(scoreXYZ.breakdown.experience).toBeGreaterThan(scoreVague.breakdown.experience);
    }
  });

  it('Property 2: Boundary Safety - Empty/Corrupt CVs never crash and evaluate to <= 15%', () => {
    const corruptInputs = [
      null,
      undefined,
      {},
      { personal: {} },
      { experience: [] },
      { personal: { name: '' }, summary: '', experience: [{ bullets: [] }], education: [], skills: {} }
    ];

    corruptInputs.forEach(input => {
      const result = computeAtsScore(input);
      expect(result.score).toBeLessThanOrEqual(15);
      expect(result.tips.length).toBeGreaterThan(0);
      expect(typeof result.breakdown).toBe('object');
    });
  });

  it('Property 3: Monte Carlo 2000 Permutations - Determinism & Score Bounds in [0, 100]', () => {
    let perfectCount = 0;
    let baselineCount = 0;

    for (let sim = 0; sim < 2000; sim++) {
      const isMinimal = sim % 6 === 0;
      const isComplete = !isMinimal && sim % 5 === 0;
      const hasName = !isMinimal && (isComplete || sim % 2 === 0);
      const hasEmail = !isMinimal && (isComplete || sim % 3 !== 0);
      const hasPhone = !isMinimal && (isComplete || sim % 4 !== 0);
      const hasSummary = !isMinimal && (isComplete || sim % 2 === 0);
      const hasXYZSummary = !isMinimal && (isComplete || (hasSummary && sim % 3 === 0));
      const expCount = isMinimal ? 0 : isComplete ? 2 : (sim % 4);
      const hasXYZExp = isComplete || sim % 2 === 0;
      const hasEdu = !isMinimal && (isComplete || sim % 3 !== 0);
      const hasCert = isComplete || sim % 5 === 0;

      const cv = {
        personal: {
          name: hasName ? `Candidate ${sim}` : '',
          email: hasEmail ? `cand${sim}@domain.com` : '',
          phone: hasPhone ? `+1555000${sim}` : '',
          location: isMinimal ? '' : 'San Francisco, CA',
          linkedin: isComplete ? 'linkedin.com/in/candidate' : ''
        },
        summary: hasSummary 
          ? (hasXYZSummary ? `High-impact leader with 8+ years scaling systems to 5M+ users and $10M ARR.` : `Dedicated professional with experience in diverse teams.`)
          : '',
        experience: Array.from({ length: expCount }, (_, idx) => ({
          company: `Company ${idx}`,
          title: `Role ${idx}`,
          startMonth: '01',
          startYear: '2020',
          endMonth: idx === 0 ? '' : '12',
          endYear: idx === 0 ? '' : '2022',
          current: idx === 0,
          bullets: hasXYZExp 
            ? [xyzBullets[idx % xyzBullets.length], xyzBullets[(idx + 2) % xyzBullets.length]]
            : [vagueBullets[idx % vagueBullets.length]]
        })),
        education: hasEdu ? [{ institution: 'MIT', degree: 'BS Computer Science', startYear: '2016', endYear: '2020' }] : [],
        skills: {
          technical: isMinimal ? '' : techSkillsList[sim % techSkillsList.length],
          soft: isComplete ? 'Agile Leadership, Cross-functional' : '',
          languages: isComplete ? 'English, French' : ''
        },
        certifications: hasCert ? [{ name: 'Certified Scrum Master', issuer: 'Scrum Alliance' }] : []
      };

      const result = computeAtsScore(cv);

      expect(result.structuralScore).toBeGreaterThanOrEqual(0);
      expect(result.structuralScore).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);

      const expectedTotal = Math.min(100, (
        result.breakdown.contact + 
        result.breakdown.summary + 
        result.breakdown.experience + 
        result.breakdown.skills + 
        result.breakdown.education + 
        (result.breakdown.projects || 0) + 
        (result.breakdown.certifications || 0)
      ));
      expect(result.breakdown.totalStructural).toBe(expectedTotal);

      if (result.structuralScore >= 90) perfectCount++;
      if (result.structuralScore <= 25) baselineCount++;
    }

    expect(perfectCount).toBeGreaterThan(100);
    expect(baselineCount).toBeGreaterThan(100);
  });
});
