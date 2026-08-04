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
    name: 'John Doe',
    tagline: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
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
      link: 'github.com/example/opentrace',
      highlights: [
        'Achieved 2.4K GitHub stars within 8 months of launch',
      ],
    },
  ],
  certifications: [],
  targetJobDescription: `Role Title: Senior Frontend Engineer — Design Systems & AI Platform\nCompany: Vercel — San Francisco, CA (Remote Friendly)\n\nAbout Vercel:\nVercel builds the Developer Experience Platform enabling frontend teams to develop, preview, and ship high-performance web applications.\n\nKey Responsibilities:\n- Architect and maintain enterprise Design System components in React, TypeScript, and Tailwind CSS.\n- Lead frontend performance optimizations (Core Web Vitals, streaming SSR, bundle splitting).\n- Collaborate with product design and backend teams to integrate generative AI features and real-time canvas collaboration tools.\n- Mentor junior engineers and champion accessible (a11y) UI standards across all applications.\n\nRequirements:\n- 4+ years of professional experience with React, TypeScript, Next.js, and modern CSS architecture.\n- Demonstrated expertise in building production component libraries / Design Systems.\n- Deep understanding of Web Performance, WebSockets, and state management at scale.`,
  coverLetter: `John Doe\nSan Francisco, CA\njohn.doe@email.com | +1 (415) 555-0142\n\nAugust 4, 2025\n\nSubject: Application for **Senior Frontend Engineer** at **Vercel**\n\nDear Hiring Team,\n\nAs a results-driven senior software engineer with a deep passion for web performance and frontend architecture, I am thrilled to apply for the **Senior Frontend Engineer** position at **Vercel**.\n\nAt **Stripe** and **Airbnb**, I architected high-throughput real-time systems processing **50K+ transactions/second** and built machine-learning powered pricing engines that boosted revenue by **18%**. Across these roles, I pioneered frontend performance strategies that significantly improved user conversion and reduced infrastructure costs by **40%**.\n\nMy core stack centers on **React**, **TypeScript**, **Node.js**, **Next.js**, and modern Cloud deployment tools. I am a strong advocate for technical leadership, clean component boundaries, robust **type safety**, and mentor-driven team agility (**Agile / Scrum**).\n\nVercel's vision for elevating developer experience directly aligns with my passion for building high-quality, high-performance web software. I would welcome the opportunity to discuss how my background can contribute to Vercel's growth.\n\nSincerely,\nJohn Doe`,
  coverLetterSettings: {
    companyName: "Vercel",
    targetRole: "Senior Frontend Engineer",
    industry: "Tech & Software",
    tone: "Professional",
    clLength: "Standard",
    referenceLetter: ""
  },
  aiCache: {
    atsScore: {
      score: 96,
      matchPercentage: 96,
      matchedKeywords: ["React", "TypeScript", "Next.js", "Node.js", "System Design", "Web Performance", "AWS", "Docker", "Agile", "Scrum"],
      missingKeywords: ["GraphQL"],
      strengths: [
        "Exceptional alignment with Vercel's engineering standards (React, TypeScript, Next.js)",
        "Outstanding quantifiable achievements ($12M savings, +18% host revenue)",
        "Proven experience with high-scale distributed systems"
      ],
      recommendations: [
        "Include specific CSS/Tailwind architecture examples",
        "Add accessibility (a11y) compliance testing details"
      ]
    },
    tailoredResult: {
      tailoredSummary: "Senior Full-Stack Engineer with 7+ years building scalable web applications, real-time pipelines (50K req/sec), and high-performance React/TypeScript platforms.",
      keywordHighlights: ["React", "TypeScript", "Next.js", "Node.js", "System Design", "Agile"]
    }
  }
};

export const DEMO_DATA_1_PAGE_FR = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Jean Dupont',
    tagline: 'Développeur Full-Stack Senior',
    email: 'jean.dupont@email.fr',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, Île-de-France',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
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
      link: 'github.com/example/paristransit',
      highlights: [
        'Adopté par plus de 500 utilisateurs quotidiens à Paris.',
      ],
    },
  ],
  certifications: [],
  targetJobDescription: `Intitulé du poste : Lead Full-Stack Engineer (H/F)\nEntreprise : TechVision — Lyon (Hybride)\n\nÀ propos de TechVision :\nTechVision développe des solutions SaaS B2B haut de gamme pour l'analyse de données temps réel et l'optimisation décisionnelle d'entreprises du Fortune 500.\n\nMissions principales :\n- Piloter l'architecture web et le développement full-stack d'une plateforme SaaS (React, Node.js, TypeScript).\n- Diriger la migration d'un système monolithique vers une micro-architecture distribuée managée sur AWS (EKS, Lambda, DynamoDB, Redis).\n- Garantir la haute disponibilité (99.95%+), la performance et la sécurité des traitements de données volumineuses.\n- Encadrer et mentorer une équipe d'ingénieurs (4 personnes) dans un cadre Agile / Scrum.\n\nProfil recherché :\n- 5+ ans d'expérience en ingénierie logicielle full-stack (React, Node.js, Python, SQL/NoSQL).\n- Solide maîtrise des pratiques DevOps, CI/CD (GitHub Actions, Docker, Kubernetes, Terraform) et du Cloud AWS.\n- Leadership technique éprouvé, goût pour les code reviews et la transmission de compétences.`,
  coverLetter: `Jean Dupont\nParis, France\njean.dupont@email.fr | +33 6 12 34 56 78\n\nParis, le 4 août 2025\n\nObjet : Candidature au poste de **Lead Full-Stack Engineer** chez **TechVision**\n\nMadame, Monsieur,\n\nPassionné par l'ingénierie logicielle et l'architecture de produits web scalables, je vous présente ma candidature pour le poste de **Lead Full-Stack Engineer** au sein de **TechVision**.\n\nAu cours de mon parcours chez **BlaBlaCar** et **Deezer**, j'ai dirigé la migration vers une **architecture micro-frontends**, réduisant le temps de chargement de **40%** pour plus de 10 millions d'utilisateurs tout en portant la couverture de tests à **90%** sur nos modules les plus critiques.\n\nMa maîtrise technique s'étend sur tout l'écosystème moderne : **React**, **Next.js**, **Node.js**, **TypeScript**, ainsi que les environnements conteneurisés (**Docker**, **AWS**). En tant que référent technique, j'attache une importance capitale aux bonnes pratiques (**Clean Code**, **TDD**), à l'encadrement des équipes en méthodologie **Agile / Scrum**, et aux revues de code exigeantes.\n\nRejoindre TechVision représente pour moi l'opportunité de mettre mon leadership technique au service d'une plateforme SaaS d'analyse de données ambitieuse. Je serais ravi de vous exposer mes projets lors d'un prochain entretien.\n\nBien cordialement,\nJean Dupont`,
  coverLetterSettings: {
    companyName: "TechVision",
    targetRole: "Lead Full-Stack Engineer",
    industry: "Tech & Software",
    tone: "Professional",
    clLength: "Standard",
    referenceLetter: ""
  },
  aiCache: {
    atsScore: {
      score: 94,
      matchPercentage: 94,
      matchedKeywords: ["React", "TypeScript", "Node.js", "AWS", "Microservices", "CI/CD", "Docker", "PostgreSQL", "Agile", "Scrum", "Kubernetes", "Leadership"],
      missingKeywords: ["GraphQL", "Terraform"],
      strengths: [
        "Excellente correspondance sur la stack principale (React, Node.js, AWS)",
        "Résultats chiffrés très convaincants (-40% temps de chargement, 90% couverture de tests)",
        "Solide leadership technique et culture de la qualité"
      ],
      recommendations: [
        "Mentionner Terraform pour la gestion de l'infrastructure as code",
        "Préciser les outils d'alerting et de suivi de performance"
      ]
    },
    tailoredResult: {
      tailoredSummary: "Développeur Full-Stack Senior avec 7+ ans d'expérience spécialisé en React, Node.js et architectures micro-services Cloud. Solide leadership technique et expertise éprouvée en performance web.",
      keywordHighlights: ["React", "Node.js", "TypeScript", "Microservices", "AWS", "CI/CD", "Agile"]
    }
  }
};

export const DEMO_DATA_2_PAGES = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Jane Smith',
    tagline: 'Staff Software Engineer & Technical Leader',
    email: 'jane.smith@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
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
      link: 'github.com/example/opentrace',
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
  targetJobDescription: `Role Title: Staff Software Engineer & Technical Leader\nCompany: Vercel — San Francisco, CA (Remote Friendly)\n\nAbout Vercel:\nVercel builds the Developer Experience Platform enabling frontend teams to develop, preview, and ship high-performance web applications.\n\nKey Responsibilities:\n- Architect and maintain enterprise Design System components in React, TypeScript, and Tailwind CSS.\n- Lead frontend performance optimizations (Core Web Vitals, streaming SSR, bundle splitting).\n- Collaborate with product design and backend teams to integrate generative AI features and real-time canvas collaboration tools.\n- Mentor junior engineers and champion accessible (a11y) UI standards across all applications.\n\nRequirements:\n- 6+ years of professional experience with React, TypeScript, Next.js, and modern CSS architecture.\n- Demonstrated expertise in building production component libraries / Design Systems.\n- Deep understanding of Web Performance, WebSockets, and state management at scale.`,
  coverLetter: `Jane Smith\nSan Francisco, CA\njane.smith@email.com | +1 (415) 555-0142\n\nAugust 4, 2025\n\nSubject: Application for **Staff Software Engineer** at **Vercel**\n\nDear Hiring Team,\n\nAs a Staff Software Engineer with 10+ years of technical leadership experience building distributed microservices and real-time platforms, I am excited to apply for the **Staff Software Engineer** position at **Vercel**.\n\nThroughout my career at top tech organizations, I have driven large-scale architectural migrations, mentored dozens of engineers, and engineered systems supporting **10M+ daily active users**. My technical expertise spans **React**, **TypeScript**, **Next.js**, **Node.js**, **AWS**, and distributed system design.\n\nI am deeply aligned with Vercel's mission to shape the future of frontend architecture and developer experience. I look forward to connecting to discuss how my background can help elevate Vercel's platforms.\n\nSincerely,\nJane Smith`,
  coverLetterSettings: {
    companyName: "Vercel",
    targetRole: "Staff Software Engineer",
    industry: "Tech & Software",
    tone: "Professional",
    clLength: "Standard",
    referenceLetter: ""
  },
  aiCache: {
    atsScore: {
      score: 98,
      matchPercentage: 98,
      matchedKeywords: ["React", "TypeScript", "Next.js", "Node.js", "System Design", "AWS", "Docker", "Kubernetes", "Leadership", "Agile"],
      missingKeywords: ["GraphQL"],
      strengths: [
        "Outstanding technical depth and leadership profile",
        "Extensive experience scaling platforms to 10M+ DAU",
        "Strong credentials (AWS Professional, CKA)"
      ],
      recommendations: [
        "Include links to open-source contributions"
      ]
    },
    tailoredResult: {
      tailoredSummary: "Staff Software Engineer & Technical Leader with 10+ years architecting distributed systems, real-time analytics platforms, and microservices for high-scale enterprise applications.",
      keywordHighlights: ["React", "TypeScript", "Next.js", "System Design", "Leadership"]
    }
  }
};

export const DEMO_DATA_2_PAGES_FR = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Marie Dubois',
    tagline: 'Staff Engineer & Architecte Solutions Cloud',
    email: 'marie.dubois@email.fr',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, Île-de-France',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
  },
  summary: 'Architecte logicielle et Staff Engineer avec plus de 10 ans d\'expérience dans la conception de plateformes web distribuées et d\'infrastructures Cloud haute performance. Experte React, TypeScript et Node.js.',
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
      link: 'github.com/example/ecocloud',
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
  targetJobDescription: `Intitulé du poste : Senior / Staff Engineer (H/F)\nEntreprise : Walter Learning — Marseille (13008) / Présentiel\n\nÀ propos de Walter Learning :\nWalter Learning conçoit, produit et dispense des formations en ligne à destination des professionnels (Walter Santé, compétences transverses, alternance).\nDepuis 2019 : 130 000 formations dispensées à fin 2025, près de 20 M€ de CA, rentable dès le premier jour et sans levée de fonds.\n\nMissions & Contexte Technique :\n- Prendre l’ownership de systèmes techniques critiques (LMS maison, CRM interne, outils métiers, nombreuses intégrations API).\n- Concevoir des architectures robustes et structurer l'évolution de systèmes existants (pas un rôle "feature factory").\n- Encadrer et structurer l’usage de l’IA dans les workflows (code, outils internes, opérations) avec un enjeu fort sur la qualité, la cohérence et la maintenabilité.\n- Stack principale : Python / Django, React / Next.js, PostgreSQL, AWS (ECS, Lambda).\n- Travail en lien direct avec le CTO au sein d'une petite équipe tech à fort impact (6 personnes).\n\nProfil recherché :\n- 5+ ans d’expérience sur des systèmes complexes en production.\n- Solide maîtrise backend (Python/Django) et frontend moderne (React/Next.js), bases SQL.\n- À l’aise avec la gestion des risques techniques, les edge cases et l’intégration pragmatique de l’IA.`,
  coverLetter: `Marie Dubois\nMarseille, France\nmarie.dubois@email.fr | +33 6 12 34 56 78\n\nMarseille, le 4 août 2025\n\nObjet : Candidature au poste de **Senior / Staff Engineer** chez **Walter Learning**\n\nMadame, Monsieur,\n\nImpressionnée par le modèle de croissance de **Walter Learning** — rentable dès le premier jour, comptabilisant près de 20 M€ de chiffre d'affaires et 130 000 formations dispensées — je vous présente ma candidature pour le poste de **Senior / Staff Engineer**.\n\nForte de plus de 10 ans d'expérience en ingénierie logicielle sur des systèmes complexes en production (notamment chez **Qonto** sur des architectures bancaires temps réel gérant **100K+ transactions/jour**), je me retrouve pleinement dans votre philosophie : concevoir des architectures pérennes, arbitrer les trade-offs techniques et refuser la logique de "feature factory".\n\nMon expertise couvre l'ensemble de vos enjeux techniques :\n- **Backend & Bases de données** : Maîtrise approfondie de **Python / Django** et modélisation complexe sur **PostgreSQL**.\n- **Frontend Moderne** : Conception d'interfaces réactives et modulaires avec **React** et **Next.js**.\n- **Services & Intégrations Cloud** : Orchestration de workflows critiques sur **AWS (ECS, Lambda)** et intégrations robustes d'APIs tierces.\n- **Usage Critique & Maintenable de l'IA** : Intégration pragmatique des outils d'IA dans les workflows métiers, axée sur la qualité du code, la gestion des edge cases et la fiabilité système.\n\nTravailler en lien direct avec le CTO au sein d'une équipe agile de 6 personnes pour faire évoluer votre LMS et votre CRM maison constitue un défi stimulant. Je serais ravie de vous exposer mon parcours lors d'un entretien.\n\nCordialement,\nMarie Dubois`,
  coverLetterSettings: {
    companyName: "Walter Learning",
    targetRole: "Senior / Staff Engineer",
    industry: "EdTech & Software",
    tone: "Professional",
    clLength: "Standard",
    referenceLetter: ""
  },
  aiCache: {
    atsScore: {
      score: 98,
      matchPercentage: 98,
      matchedKeywords: ["Python", "Django", "React", "Next.js", "PostgreSQL", "AWS", "ECS", "Lambda", "IA", "Architecture", "Ownership", "System Design"],
      missingKeywords: [],
      strengths: [
        "Alignement parfait sur la stack (Python/Django, React/Next.js, PostgreSQL, AWS)",
        "Expérience avérée sur des systèmes critiques en production (Qonto)",
        "Positionnement orienté ownership et architecture (hors feature factory)"
      ],
      recommendations: []
    },
    tailoredResult: {
      tailoredSummary: "Staff Engineer & Architecte Solutions avec 10+ ans d'expérience sur des systèmes critiques. Spécialisée en Python/Django, React/Next.js, PostgreSQL et architectures AWS, axée sur la fiabilité et l'intégration pragmatique de l'IA.",
      keywordHighlights: ["Python", "Django", "React", "Next.js", "PostgreSQL", "AWS", "IA", "Ownership"]
    }
  }
};

export const DEMO_DATA_1_PAGE_ES = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Desarrollador Full-Stack Senior',
    email: 'hoshi.fenneko@email.es',
    phone: '+34 612 34 56 78',
    location: 'Madrid, España',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
  },
  summary: 'Desarrollador full-stack apasionado con más de 7 años de experiencia en el diseño de arquitecturas web escalables. Experto en JavaScript/TypeScript (React, Node.js) y arquitecturas Cloud. Enfocado en el rendimiento, la accesibilidad y la calidad del código (Clean Code, TDD).',
  experience: [
    {
      id: 1,
      company: 'Cabify',
      title: 'Desarrollador Full-Stack Senior',
      startMonth: 'Marzo',
      startYear: '2021',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Optimización del rendimiento de la aplicación móvil, reduciendo el tiempo de carga en un 40% para más de 10 millones de usuarios.',
        'Dirección técnica de la migración hacia una arquitectura de micro-frontends con Module Federation.',
      ],
    },
    {
      id: 2,
      company: 'Zara',
      title: 'Desarrollador Web Full-Stack',
      startMonth: 'Junio',
      startYear: '2018',
      endMonth: 'Febrero',
      endYear: '2021',
      current: false,
      bullets: [
        'Desarrollo de nuevas funcionalidades para la plataforma web, aumentando la interacción de los usuarios en un 15%.',
        'Mejora de la cobertura de pruebas unitarias y de integración al 90% en módulos críticos.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Universidad Politécnica de Madrid',
      degree: 'Grado en Ingeniería Informática',
      field: 'Informática',
      startYear: '2015',
      endYear: '2018',
    },
  ],
  skills: {
    technical: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Docker, AWS, GraphQL',
    soft: 'Mentoría, Agilidad, Design Thinking, Liderazgo Técnico',
    languages: 'Español (Nativo), Inglés (C1 - Fluido)',
  },
  projects: [
    {
      id: 1,
      name: 'MadridTransit',
      description: 'Aplicación de código abierto para la visualización en tiempo real del transporte público.',
      techStack: 'React, Leaflet, Node.js',
      link: 'github.com/example/madridtransit',
      highlights: [
        'Alcanzó 2.4k estrellas en GitHub a los 8 meses de su lanzamiento',
      ],
    },
  ],
  certifications: [],
};

export const DEMO_DATA_2_PAGES_ES = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Hoshi Fenneko',
    tagline: 'Staff Engineer y Arquitecto de Soluciones Cloud',
    email: 'hoshi.fenneko@email.es',
    phone: '+34 612 34 56 78',
    location: 'Madrid, España',
    linkedin: 'linkedin.com/in/example',
    github: 'github.com/example',
    website: 'example.dev',
  },
  summary: 'Arquitecto y desarrollador senior con más de 10 años de experiencia en el ecosistema tecnológico. Especialista en escalabilidad de startups (SaaS, FinTech) y modernización de arquitecturas heredadas. Apasionado por la excelencia operativa y el desarrollo de equipos. Co-organizador de meetups de tecnología y colaborador activo en proyectos de código abierto.',
  experience: [
    {
      id: 1,
      company: 'Qonto',
      title: 'Staff Software Engineer',
      startMonth: 'Enero',
      startYear: '2021',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Rediseño completo del sistema de transacciones bancarias, incrementando la velocidad de procesamiento en un 500% sin interrupciones.',
        'Mentoría técnica de 15 ingenieros, estableciendo estándares de código y revisiones de arquitectura en todo el equipo.',
        'Creación de un flujo de CI/CD automatizado, reduciendo los tiempos de despliegue de 2 días a 15 minutos.',
      ],
    },
    {
      id: 2,
      company: 'OVHcloud',
      title: 'Arquitecto Cloud / Lead Developer',
      startMonth: 'Agosto',
      startYear: '2017',
      endMonth: 'Diciembre',
      endYear: '2020',
      current: false,
      bullets: [
        'Diseño e implementación de una solución de almacenamiento distribuido altamente disponible en Kubernetes.',
        'Optimización del sistema de facturación multi-región para millones de transacciones mensuales en más de 20 países.',
      ],
    },
    {
      id: 3,
      company: 'Criteo',
      title: 'Software Engineer',
      startMonth: 'Septiembre',
      startYear: '2014',
      endMonth: 'Julio',
      endYear: '2017',
      current: false,
      bullets: [
        'Desarrollo de algoritmos de ofertas en tiempo real (real-time bidding) procesando petabytes de datos semanales.',
        'Reducción de la latencia media de los servicios de recomendación en 20ms.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Universidad Politécnica de Madrid',
      degree: 'Grado en Ingeniería Informática',
      field: 'Informática',
      startYear: '2010',
      endYear: '2014',
    },
  ],
  skills: {
    technical: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Docker, AWS, GraphQL',
    soft: 'Mentoría, Agilidad, Design Thinking, Liderazgo Técnico',
    languages: 'Español (Nativo), Inglés (C1 - Fluido)',
  },
  projects: [
    {
      id: 1,
      name: 'MadridTransit',
      description: 'Aplicación de código abierto para la visualización en tiempo real del transporte público.',
      techStack: 'React, Leaflet, Node.js',
      link: 'github.com/example/madridtransit',
      highlights: [
        'Alcanzó 2.4k estrellas en GitHub a los 8 meses de su lanzamiento',
      ],
    },
  ],
  certifications: [
    {
      id: 1,
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: 'Dic 2023',
    },
    {
      id: 2,
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      date: 'May 2022',
    },
  ],
};
