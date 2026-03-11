const HEADINGS_DEMO = {
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
};

export const DEMO_DATA_1_PAGE = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Senior Software Engineer',
    email: 'hoshi.fenneko@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/hoshifenneko',
    github: 'github.com/hoshifenneko',
    website: 'hoshifenneko.dev',
  },
  summary: 'Results-driven full-stack engineer with 7+ years of experience building scalable web applications and distributed systems. Led the architecture of a real-time analytics platform serving 3M+ daily active users, reducing infrastructure costs by 40%.',
  experience: [
    {
      id: 1,
      company: 'Stripe',
      title: 'Senior Software Engineer',
      startMonth: 'Mar',
      startYear: '2022',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Architected and launched a real-time fraud detection pipeline processing 50K+ transactions/second, reducing chargebacks by 32% and saving $12M annually',
        'Led a cross-functional team of 6 engineers to migrate payment processing from monolith to microservices',
      ],
    },
    {
      id: 2,
      company: 'Airbnb',
      title: 'Software Engineer',
      startMonth: 'Jun',
      startYear: '2019',
      endMonth: 'Feb',
      endYear: '2022',
      current: false,
      bullets: [
        'Built a dynamic pricing engine using machine learning that increased host revenue by 18% across 4M+ listings',
        'Optimized search ranking algorithm, improving booking conversion rates by 12%',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      startYear: '2017',
      endYear: '2019',
    },
  ],
  skills: {
    technical: 'TypeScript, Python, Go, React, Node.js, PostgreSQL, Redis, AWS, Docker, Kubernetes',
    soft: 'Technical Leadership, System Design, Agile/Scrum',
    languages: 'English (Native), Mandarin (Fluent)',
  },
  projects: [
    {
      id: 1,
      name: 'OpenTrace',
      description: 'Open-source distributed tracing library for Node.js microservices.',
      techStack: 'TypeScript, Node.js',
      link: 'github.com/hoshifenneko/opentrace',
      highlights: [
        'Achieved 2.4K GitHub stars within 8 months of launch',
      ],
    },
  ],
  certifications: [],
};

export const DEMO_DATA_1_PAGE_FR = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Développeur Full-Stack Senior',
    email: 'hoshi.fenneko@email.fr',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, Île-de-France',
    linkedin: 'linkedin.com/in/hoshifenneko',
    github: 'github.com/hoshifenneko',
    website: 'hoshifenneko.dev',
  },
  summary: 'Développeur full-stack passionné avec plus de 7 ans d\'expérience dans la conception d\'architectures web scalables. Expert en JavaScript/TypeScript (React, Node.js) et architectures Cloud. Fortement axé sur la performance, l\'accessibilité et la qualité du code (Clean Code, TDD).',
  experience: [
    {
      id: 1,
      company: 'BlaBlaCar',
      title: 'Développeur Full-Stack Senior',
      startMonth: 'Mars',
      startYear: '2021',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Optimisation des performances de l\'application mobile, réduisant le temps de chargement de 40% pour 10M+ d\'utilisateurs.',
        'Direction technique de la migration vers une architecture micro-frontends avec Module Federation.',
      ],
    },
    {
      id: 2,
      company: 'Deezer',
      title: 'Développeur Web Full-Stack',
      startMonth: 'Juin',
      startYear: '2018',
      endMonth: 'Février',
      endYear: '2021',
      current: false,
      bullets: [
        'Développement de nouvelles fonctionnalités pour le lecteur web, augmentant l\'engagement utilisateur de 15%.',
        'Amélioration de la couverture de tests unitaires et d\'intégration à 90% sur les modules critiques.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'École 42',
      degree: 'Diplôme d\'Architecte en Technologie du Numérique',
      field: 'Informatique',
      startYear: '2015',
      endYear: '2018',
    },
  ],
  skills: {
    technical: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Docker, AWS, GraphQL',
    soft: 'Mentorat, Agilité, Design Thinking, Leadership Technique',
    languages: 'Français (Maternel), Anglais (C1 - Courant)',
  },
  projects: [
    {
      id: 1,
      name: 'ParisTransit',
      description: 'Application open-source de visualisation en temps réel du trafic RATP.',
      techStack: 'React, Leaflet, Node.js',
      link: 'github.com/hoshifenneko/paristransit',
      highlights: [
        'Adopté par plus de 500 utilisateurs quotidiens à Paris.',
      ],
    },
  ],
  certifications: [],
};

export const DEMO_DATA_2_PAGES = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Staff Software Engineer & Technical Leader',
    email: 'hoshi.fenneko@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/hoshifenneko',
    github: 'github.com/hoshifenneko',
    website: 'hoshifenneko.dev',
  },
  summary: 'Results-driven full-stack engineer with 7+ years of experience building scalable web applications and distributed systems. Led the architecture of a real-time analytics platform serving 3M+ daily active users, reducing infrastructure costs by 40%. Passionate about clean code, developer experience, and mentoring junior engineers. Proven track record of scaling consumer-facing platforms to handle massive load while maintaining 99.99% uptime. Recognized for translating complex business requirements into robust, cloud-native technical solutions.',
  experience: [
    {
      id: 1,
      company: 'Stripe',
      title: 'Senior Software Engineer',
      startMonth: 'Mar',
      startYear: '2022',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Architected and launched a real-time fraud detection pipeline processing 50K+ transactions/second, reducing chargebacks by 32% and saving $12M annually',
        'Led a cross-functional team of 6 engineers to migrate payment processing from monolith to microservices, improving deployment frequency by 400%',
        'Designed and implemented a feature flag system adopted by 15+ teams, enabling safe rollouts for 200M+ users and reducing incident rates by 45%',
      ],
    },
    {
      id: 2,
      company: 'Airbnb',
      title: 'Software Engineer',
      startMonth: 'Jun',
      startYear: '2019',
      endMonth: 'Feb',
      endYear: '2022',
      current: false,
      bullets: [
        'Built a dynamic pricing engine using machine learning that increased host revenue by 18% across 4M+ listings worldwide',
        'Optimized search ranking algorithm, improving booking conversion rates by 12% and generating $28M in incremental revenue',
        'Mentored 4 junior engineers through structured onboarding program, achieving 100% retention over 2 years',
      ],
    },
    {
      id: 3,
      company: 'Google',
      title: 'Software Engineering Intern',
      startMonth: 'May',
      startYear: '2018',
      endMonth: 'Aug',
      endYear: '2018',
      current: false,
      bullets: [
        'Developed a new internal dashboard using React and TypeScript, adopted by 300+ engineers',
        'Improved load times of core reporting charts by 60% through custom data-caching strategies',
        'Collaborated with UX researchers to streamline complex workflows, reducing time-to-completion by 25%'
      ],
    },
    {
      id: 4,
      company: 'Stanford University (Research)',
      title: 'Graduate Research Assistant',
      startMonth: 'Sep',
      startYear: '2017',
      endMonth: 'May',
      endYear: '2019',
      current: false,
      bullets: [
        'Conducted research on distributed systems consensus algorithms under Dr. John Ousterhout.',
        'Prototyped a Raft-based key-value store in Go that achieved 15% better latency than ETCD in constrained network topologies.',
        'Published findings in the Symposium on Operating Systems Principles (SOSP 2019).'
      ],
    },
    {
      id: 5,
      company: 'Tech Startup Inc.',
      title: 'Full Stack Developer',
      startMonth: 'Jun',
      startYear: '2015',
      endMonth: 'Aug',
      endYear: '2017',
      current: false,
      bullets: [
        'Bootstrapped the MVP using Ruby on Rails and React, securing $2M in seed funding',
        'Integrated third-party APIs including Stripe, Twilio, and SendGrid to automate core user interactions',
        'Implemented comprehensive integration testing suite, pushing test coverage from 20% to 85%'
      ],
    }
  ],
  education: [
    {
      id: 1,
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      startYear: '2017',
      endYear: '2019',
    },
    {
      id: 2,
      institution: 'UC Berkeley',
      degree: 'Bachelor of Science',
      field: 'Electrical Engineering & Computer Science',
      startYear: '2013',
      endYear: '2017',
    },
  ],
  skills: {
    technical: 'TypeScript, Python, Go, React, Node.js, PostgreSQL, Redis, AWS (Lambda, ECS, DynamoDB), Docker, Kubernetes, Terraform, GraphQL, gRPC, Apache Kafka, CI/CD (GitHub Actions)',
    soft: 'Technical Leadership, Cross-functional Collaboration, System Design, Agile/Scrum, Mentoring, Public Speaking',
    languages: 'English (Native), Mandarin (Fluent), French (Conversational)',
  },
  projects: [
    {
      id: 1,
      name: 'OpenTrace',
      description: 'Open-source distributed tracing library for Node.js microservices with automatic instrumentation and Jaeger/Zipkin integration.',
      techStack: 'TypeScript, Node.js, OpenTelemetry, gRPC',
      link: 'github.com/hoshifenneko/opentrace',
      highlights: [
        'Achieved 2.4K GitHub stars and 180+ contributors within 8 months of launch',
        'Reduced mean time to debug production issues by 65% across 3 adopting companies',
      ],
    },
    {
      id: 2,
      name: 'CloudSync',
      description: 'A local-first offline-capable note-taking application that synchronizes state via WebRTC and CRDTs.',
      techStack: 'React, IndexedDB, Yjs, WebRTC',
      link: 'cloudsync.app',
      highlights: [
        'Architected a conflict-free resolution protocol avoiding central database dependencies',
        'Featured on Product Hunt top 5 products of the day with rapid 10k MAU adoption'
      ]
    }
  ],
  certifications: [
    {
      id: 1,
      name: 'AWS Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: 'Jan 2024',
      credentialUrl: 'https://verify.aws.com/ABC123',
    },
    {
      id: 2,
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: 'Sep 2023',
      credentialUrl: '',
    },
  ],
};

export const DEMO_DATA_2_PAGES_FR = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Staff Engineer & Architecte Solutions Cloud',
    email: 'hoshi.fenneko@email.fr',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, Île-de-France',
    linkedin: 'linkedin.com/in/hoshifenneko',
    github: 'github.com/hoshifenneko',
    website: 'hoshifenneko.dev',
  },
  summary: 'Architecte et développeur senior avec plus de 10 ans d\'expérience dans l\'écosystème tech français. Expertise pointue dans le passage à l\'échelle de startups (SaaS, FinTech) et la modernisation d\'architectures legacy. Convaincu par l\'excellence opérationnelle et le mentorat, j\'aime résoudre des problèmes complexes avec des solutions simples et maintenables. Co-fondateur du meetup "React Paris" et contributeur actif à plusieurs projets open-source majeurs.',
  experience: [
    {
      id: 1,
      company: 'Qonto',
      title: 'Staff Software Engineer',
      startMonth: 'Janvier',
      startYear: '2021',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Refonte complète du système de ledger bancaire, augmentant le débit de transactions de 500% sans interruption de service.',
        'Mentorat technique de 15 ingénieurs, mise en place de standards de code et de revues d\'architecture à l\'échelle de la tribu.',
        'Architecture d\'un pipeline CI/CD automatisé réduisant le cycle de déploiement de 2 jours à 15 minutes.',
      ],
    },
    {
      id: 2,
      company: 'OVHcloud',
      title: 'Architecte Cloud / Lead Developer',
      startMonth: 'Août',
      startYear: '2017',
      endMonth: 'Décembre',
      endYear: '2020',
      current: false,
      bullets: [
        'Conception et déploiement d\'une solution de stockage distribué hautement disponible sur Kubernetes.',
        'Optimisation du système de facturation multi-régions, traitant des millions de transactions mensuelles dans 20+ pays.',
      ],
    },
    {
      id: 3,
      company: 'Criteo',
      title: 'Software Engineer',
      startMonth: 'Septembre',
      startYear: '2014',
      endMonth: 'Juillet',
      endYear: '2017',
      current: false,
      bullets: [
        'Développement d\'algorithmes de real-time bidding traitant des pétaoctets de données hebdomadaires.',
        'Amélioration de la latence des services de recommandation de 20ms en moyenne.',
      ],
    },
    {
      id: 4,
      company: 'EPITA (Recherche)',
      title: 'Chercheur en Intelligence Artificielle',
      startMonth: 'Mars',
      startYear: '2012',
      endMonth: 'Août',
      endYear: '2014',
      current: false,
      bullets: [
        'Recherche appliquée sur le NLP (Traitement Automatique des Langues) pour la détection de sentiments.',
        'Publication de 3 articles scientifiques dans des conférences internationales (ACL, EMNLP).',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'EPITA Paris',
      degree: 'Expert en Ingénierie Informatique',
      field: 'Intelligence Artificielle & Systèmes Distribués',
      startYear: '2009',
      endYear: '2012',
    },
    {
      id: 2,
      institution: 'Lycée Louis-le-Grand',
      degree: 'CPGE - MPSI / MP*',
      field: 'Mathématiques et Physique',
      startYear: '2007',
      endYear: '2009',
    },
  ],
  skills: {
    technical: 'Node.js, Go, Rust, React, Kubernetes, AWS, Terraform, Kafka, Distributed Systems, Microservices',
    soft: 'Leadership Technique, Architecture de Systèmes, Recrutement, Stratégie Produit',
    languages: 'Français (Maternel), Anglais (Bilingue - 980 au TOEIC)',
  },
  projects: [
    {
      id: 1,
      name: 'EcoCloud',
      description: 'Outil de monitoring d\'empreinte carbone pour infrastructures AWS/GCP.',
      techStack: 'Go, React, Prometheus',
      link: 'github.com/hoshifenneko/ecocloud',
      highlights: [
        'Utilisé par 50+ entreprises pour atteindre leurs objectifs RSE.',
        'Lauréat du hackathon "Tech for Good" Paris 2022.',
      ],
    },
  ],
  certifications: [
    {
      id: 1,
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: 'Déc 2023',
    },
    {
      id: 2,
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      date: 'Mai 2022',
    },
  ],
};
