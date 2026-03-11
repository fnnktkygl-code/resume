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
    name: 'Sarah Chen',
    tagline: 'Senior Software Engineer',
    email: 'sarah.chen@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahchen',
    github: 'github.com/sarahchen',
    website: 'sarahchen.dev',
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
      link: 'github.com/sarahchen/opentrace',
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
    name: 'Sarah Chen',
    tagline: 'Ingénieur Logiciel Sénior',
    email: 'sarah.chen@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahchen',
    github: 'github.com/sarahchen',
    website: 'sarahchen.dev',
  },
  summary: 'Ingénieur full-stack expérimentée avec plus de 7 ans d\'expérience dans la création d\'applications web évolutives et de systèmes distribués. J\'ai dirigé l\'architecture d\'une plateforme d\'analyse en temps réel desservant plus de 3 millions d\'utilisateurs actifs, réduisant les coûts de 40%.',
  experience: [
    {
      id: 1,
      company: 'Stripe',
      title: 'Ingénieur Logiciel Sénior',
      startMonth: 'Mar',
      startYear: '2022',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Conception et lancement d\'un pipeline de détection de fraudes en temps réel traitant plus de 50 000 transactions/seconde, ce qui a réduit les rétrofacturations de 32 % et économisé 12 millions de dollars par an.',
        'Direction d\'une équipe de 6 ingénieurs pour migrer le traitement des paiements d\'un système monolithique vers des microservices.',
      ],
    },
    {
      id: 2,
      company: 'Airbnb',
      title: 'Ingénieur Logiciel',
      startMonth: 'Juin',
      startYear: '2019',
      endMonth: 'Fév',
      endYear: '2022',
      current: false,
      bullets: [
        'Création d\'un moteur de tarification dynamique utilisant le machine learning qui a augmenté les revenus des hôtes de 18 % sur plus de 4 millions d\'annonces.',
        'Optimisation de l\'algorithme de classement des recherches, ce qui a amélioré les taux de conversion des réservations de 12 %.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Université de Stanford',
      degree: 'Master ès sciences',
      field: 'Informatique',
      startYear: '2017',
      endYear: '2019',
    },
  ],
  skills: {
    technical: 'TypeScript, Python, Go, React, Node.js, PostgreSQL, Redis, AWS, Docker, Kubernetes',
    soft: 'Leadership Technique, Conception de Systèmes, Méthode Agile/Scrum',
    languages: 'Anglais (Langue maternelle), Mandarin (Courant), Français (Professionnel)',
  },
  projects: [
    {
      id: 1,
      name: 'OpenTrace',
      description: 'Bibliothèque open-source de traçage distribué pour les microservices Node.js.',
      techStack: 'TypeScript, Node.js',
      link: 'github.com/sarahchen/opentrace',
      highlights: [
        'A obtenu plus de 2 400 étoiles sur GitHub dans les 8 mois suivant le lancement.',
      ],
    },
  ],
  certifications: [],
};

export const DEMO_DATA_2_PAGES = {
  headings: HEADINGS_DEMO,
  personal: {
    name: 'Sarah Chen',
    tagline: 'Staff Software Engineer & Technical Leader',
    email: 'sarah.chen@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahchen',
    github: 'github.com/sarahchen',
    website: 'sarahchen.dev',
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
      link: 'github.com/sarahchen/opentrace',
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
    name: 'Sarah Chen',
    tagline: 'Staff Software Engineer & Directrice Technique',
    email: 'sarah.chen@email.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahchen',
    github: 'github.com/sarahchen',
    website: 'sarahchen.dev',
  },
  summary: 'Ingénieur full-stack expérimentée avec plus de 7 ans d\'expérience dans la création d\'applications web évolutives et de systèmes distribués. J\'ai dirigé l\'architecture d\'une plateforme d\'analyse en temps réel desservant plus de 3 millions d\'utilisateurs actifs, réduisant les coûts de 40%. Passionnée par le clean code, l\'expérience développeur et le mentorat des ingénieurs juniors. J\'ai fait mes preuves dans la mise à l\'échelle de plateformes grand public pour gérer des charges massives tout en maintenant une disponibilité de 99,99 %. Reconnue pour avoir traduit des exigences métiers complexes en solutions techniques robustes et cloud-natives.',
  experience: [
    {
      id: 1,
      company: 'Stripe',
      title: 'Ingénieur Logiciel Sénior',
      startMonth: 'Mar',
      startYear: '2022',
      endMonth: '',
      endYear: '',
      current: true,
      bullets: [
        'Conception et lancement d\'un pipeline de détection de fraudes en temps réel traitant plus de 50 000 transactions/seconde, ce qui a réduit les rétrofacturations de 32 % et économisé 12 millions de dollars par an.',
        'Direction d\'une équipe de 6 ingénieurs pour migrer le traitement des paiements d\'un système monolithique vers des microservices, améliorant la fréquence de déploiement de 400 %.',
        'Conception et implémentation d\'un système de feature flags adopté par plus de 15 équipes, permettant des déploiements sûrs pour plus de 200 millions d\'utilisateurs et réduisant le taux d\'incidents de 45 %.',
      ],
    },
    {
      id: 2,
      company: 'Airbnb',
      title: 'Ingénieur Logiciel',
      startMonth: 'Juin',
      startYear: '2019',
      endMonth: 'Fév',
      endYear: '2022',
      current: false,
      bullets: [
        'Création d\'un moteur de tarification dynamique utilisant le machine learning qui a augmenté les revenus des hôtes de 18 % sur plus de 4 millions d\'annonces dans le monde.',
        'Optimisation de l\'algorithme de classement des recherches, ce qui a amélioré les taux de conversion des réservations de 12 % et généré 28 millions de dollars de revenus supplémentaires.',
        'Mentorat de 4 ingénieurs juniors grâce à un programme d\'intégration structuré, atteignant un taux de rétention de 100 % sur 2 ans.',
      ],
    },
    {
      id: 3,
      company: 'Google',
      title: 'Ingénieur logiciel stagiaire',
      startMonth: 'Mai',
      startYear: '2018',
      endMonth: 'Août',
      endYear: '2018',
      current: false,
      bullets: [
        'Développement d\'un nouveau tableau de bord interne en React et TypeScript, adopté par plus de 300 ingénieurs.',
        'Amélioration des temps de chargement des graphiques de rapports principaux de 60 % grâce à des stratégies personnalisées de mise en cache de données.',
        'Collaboration avec des chercheurs UX pour rationaliser les workflows complexes, réduisant le délai de traitement de 25 %.'
      ],
    },
    {
      id: 4,
      company: 'Université de Stanford (Recherche)',
      title: 'Assistante de Recherche Diplômée',
      startMonth: 'Sep',
      startYear: '2017',
      endMonth: 'Mai',
      endYear: '2019',
      current: false,
      bullets: [
        'Recherche menée sur les algorithmes de consensus des systèmes distribués sous la direction du Dr. John Ousterhout.',
        'Prototypage d\'un key-value store basé sur Raft en Go qui a obtenu une latence 15 % meilleure qu\'ETCD dans des topologies de réseau contraintes.',
        'A publié ses conclusions lors du Symposium on Operating Systems Principles (SOSP 2019).'
      ],
    },
    {
      id: 5,
      company: 'Tech Startup Inc.',
      title: 'Développeur Full Stack',
      startMonth: 'Juin',
      startYear: '2015',
      endMonth: 'Août',
      endYear: '2017',
      current: false,
      bullets: [
        'Déploiement du MVP à l\'aide de Ruby on Rails et de React, obtenant ainsi un financement d\'amorçage de 2 millions de dollars.',
        'Intégration d\'API tierces, notamment Stripe, Twilio et SendGrid, pour automatiser les principales interactions des utilisateurs.',
        'Mise en œuvre d\'une suite complète de tests d\'intégration, faisant passer la couverture des tests de 20 % à 85 %.'
      ],
    }
  ],
  education: [
    {
      id: 1,
      institution: 'Université de Stanford',
      degree: 'Master ès sciences',
      field: 'Informatique',
      startYear: '2017',
      endYear: '2019',
    },
    {
      id: 2,
      institution: 'UC Berkeley',
      degree: 'Licence en sciences',
      field: 'Ingénierie électrique & Informatique',
      startYear: '2013',
      endYear: '2017',
    },
  ],
  skills: {
    technical: 'TypeScript, Python, Go, React, Node.js, PostgreSQL, Redis, AWS (Lambda, ECS, DynamoDB), Docker, Kubernetes, Terraform, GraphQL, gRPC, Apache Kafka, CI/CD (GitHub Actions)',
    soft: 'Leadership Technique, Collaboration interfonctionnelle, Conception de Systèmes, Agile/Scrum, Mentorat, Prise de parole en public',
    languages: 'Anglais (Langue maternelle), Mandarin (Courant), Français (Professionnel)',
  },
  projects: [
    {
      id: 1,
      name: 'OpenTrace',
      description: 'Bibliothèque open source de traçage distribué pour les microservices Node.js avec instrumentation automatique et intégration de Jaeger/Zipkin.',
      techStack: 'TypeScript, Node.js, OpenTelemetry, gRPC',
      link: 'github.com/sarahchen/opentrace',
      highlights: [
        'A obtenu 2 400 étoiles sur GitHub et plus de 180 contributeurs dans les 8 mois suivant son lancement.',
        'Réduction du délai moyen de débogage des problèmes de production de 65 % dans les 3 entreprises qui l\'ont adopté.',
      ],
    },
    {
      id: 2,
      name: 'CloudSync',
      description: 'Une application de prise de notes hors ligne « local-first » qui synchronise l\'état via WebRTC et CRDTs.',
      techStack: 'React, IndexedDB, Yjs, WebRTC',
      link: 'cloudsync.app',
      highlights: [
        'A architecturé un protocole de résolution sans conflit évitant les dépendances de bases de données centrales.',
        'Présenté sur Product Hunt dans le top 5 des produits du jour avec une adoption rapide de 10k MAU.'
      ]
    }
  ],
  certifications: [
    {
      id: 1,
      name: 'Architecte en solutions AWS - Professionnel',
      issuer: 'Amazon Web Services',
      date: 'Jan 2024',
      credentialUrl: 'https://verify.aws.com/ABC123',
    },
    {
      id: 2,
      name: 'Administrateur certifié Kubernetes (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: 'Sep 2023',
      credentialUrl: '',
    },
  ],
};
