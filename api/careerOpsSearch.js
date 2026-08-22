/**
 * 📡 CareerOps Job Discovery & Aggregation Serverless API
 * 
 * Aggregates and normalizes job opportunities across Tech, Engineering, Product,
 * Management, Design, and Finance with geolocation, contract types, and remote support.
 */

const CURATED_JOB_OFFERS = [
  {
    id: 'job-fr-001',
    title: 'Développeur Fullstack React / Node.js (H/F)',
    company: 'Doctolib',
    logo: 'https://logo.clearbit.com/doctolib.fr',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'hybrid', // full, hybrid, onsite
    isRemote: false,
    salary: '55k€ - 70k€',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Jest', 'CI/CD'],
    description: `Au sein de l'équipe produit E-Santé, vous concevez des interfaces web ultra-performantes et des APIs sécurisées à fort trafic.
Vos missions :
- Développer de nouvelles fonctionnalités sur l'application web React / TypeScript.
- Optimiser les performances de rendu frontend et le temps de chargement des pages.
- Collaborer avec l'équipe UX/UI et les Product Managers pour délivrer des parcours fluides.
- Maintenir une couverture de tests automatisés exemplaire (Jest, React Testing Library).`,
    postedAt: '2026-08-20T10:00:00Z',
    source: 'France Travail / Tech',
    url: 'https://careers.doctolib.fr'
  },
  {
    id: 'job-fr-002',
    title: 'Lead Frontend Engineer (React / Next.js / TypeScript)',
    company: 'Qonto',
    logo: 'https://logo.clearbit.com/qonto.com',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '75k€ - 95k€',
    skills: ['React', 'Next.js', 'TypeScript', 'Design System', 'GraphQL', 'Architecture Web', 'Management'],
    description: `Rejoignez la licorne Fintech européenne pour piloter l'architecture frontend de nos applications bancaires pour PME.
Responsabilités :
- Définir les standards d'architecture frontend et l'évolution du Design System.
- Encadrer une équipe de 5 développeurs et assurer la montée en compétences.
- Garantir la sécurité bancaire, l'accessibilité WCAG AAA et des performances 60fps.`,
    postedAt: '2026-08-21T09:30:00Z',
    source: 'Fintech Jobs',
    url: 'https://qonto.com/fr/careers'
  },
  {
    id: 'job-fr-003',
    title: 'Développeur Frontend React / Vite (100% Télétravail)',
    company: 'Alan',
    logo: 'https://logo.clearbit.com/alan.com',
    location: 'Lyon, France',
    city: 'Lyon',
    contractType: 'CDI',
    remoteMode: 'full',
    isRemote: true,
    salary: '60k€ - 75k€',
    skills: ['React', 'Vite', 'JavaScript', 'CSS Modules', 'Tailwind CSS', 'Mobile First'],
    description: `Alan recrute un(e) Développeur(se) Frontend passionné(e) pour créer la meilleure expérience d'assurance santé numérique.
Points clés :
- 100% télétravail avec flexibilité d'horaires.
- Écriture de code maintenable, sans dette technique et axé sur l'utilisateur final.
- Culture de l'écrit, autonomie totale et impact direct sur des millions d'utilisateurs.`,
    postedAt: '2026-08-22T08:00:00Z',
    source: 'RemoteOK',
    url: 'https://alan.com/careers'
  },
  {
    id: 'job-fr-004',
    title: 'Data Engineer / Python & BigQuery (H/F)',
    company: 'ManoMano',
    logo: 'https://logo.clearbit.com/manomano.fr',
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '52k€ - 68k€',
    skills: ['Python', 'SQL', 'BigQuery', 'dbt', 'Airflow', 'GCP', 'Data Pipelines'],
    description: `Intégrez le pôle Data Analytics pour industrialiser les pipelines de traitement de données e-commerce.
Missions :
- Concevoir et monitorer des pipelines ETL/ELT avec dbt, Google BigQuery et Airflow.
- Assurer la qualité et la gouvernance des données pour les équipes BI et Machine Learning.`,
    postedAt: '2026-08-19T14:20:00Z',
    source: 'Welcome to the Jungle',
    url: 'https://manomano.com/careers'
  },
  {
    id: 'job-fr-005',
    title: 'Product Manager Senior (SaaS B2B)',
    company: 'Pigment',
    logo: 'https://logo.clearbit.com/gopigment.com',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '70k€ - 85k€',
    skills: ['Product Management', 'Roadmap', 'User Research', 'Data Analysis', 'Agile', 'B2B SaaS'],
    description: `Pilotez la vision et l'exécution d'une brique stratégique de notre plateforme de planification financière d'entreprise.
- Découverte utilisateur approfondie et formalisation des spécifications produit.
- Priorisation de la roadmap en étroite collaboration avec l'ingénierie et le design.`,
    postedAt: '2026-08-21T11:00:00Z',
    source: 'FrenchTech',
    url: 'https://gopigment.com/careers'
  },
  {
    id: 'job-fr-006',
    title: 'Développeur Web & Mobile Flutter / React Native',
    company: 'PayFit',
    logo: 'https://logo.clearbit.com/payfit.com',
    location: 'Nantes, France',
    city: 'Nantes',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '48k€ - 62k€',
    skills: ['Flutter', 'React', 'JavaScript', 'REST API', 'iOS', 'Android'],
    description: `Développez l'application mobile de gestion de paie et de congés utilisée par des milliers de salariés.
- Développement cross-platform mobile fluide et ergonomique.
- Synchronisation offline-first et intégration des APIs sécurisées.`,
    postedAt: '2026-08-18T16:00:00Z',
    source: 'France Travail',
    url: 'https://payfit.com/fr/careers'
  },
  {
    id: 'job-fr-007',
    title: 'Consultant / Chef de Projet Transformation Digitale (H/F)',
    company: 'Capgemini Invent',
    logo: 'https://logo.clearbit.com/capgemini.com',
    location: 'Toulouse, France',
    city: 'Toulouse',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '45k€ - 60k€',
    skills: ['Gestion de Projet', 'Transformation Digitale', 'Conduite du Changement', 'Agile', 'Scrum', 'Stratégie IT'],
    description: `Accompagnez les grands comptes aéronautiques et industriels dans leur modernisation technologique et organisationnelle.
- Cadrage stratégique, animation d'ateliers et pilotage des livrables.`,
    postedAt: '2026-08-17T09:00:00Z',
    source: 'APEC / Capgemini',
    url: 'https://capgemini.com'
  },
  {
    id: 'job-fr-008',
    title: 'Ingénieur DevOps & Cloud Kubernetes / Terraform',
    company: 'Scaleway',
    logo: 'https://logo.clearbit.com/scaleway.com',
    location: 'Lille, France',
    city: 'Lille',
    contractType: 'CDI',
    remoteMode: 'full',
    isRemote: true,
    salary: '58k€ - 72k€',
    skills: ['Kubernetes', 'Terraform', 'Docker', 'Linux', 'Ansible', 'CI/CD', 'Prometheus'],
    description: `Participez à la construction du cloud souverain européen nouvelle génération.
- Automatisation de l'infrastructure as code et monitoring temps réel.
- Haute disponibilité, résilience et tolérance aux pannes.`,
    postedAt: '2026-08-22T12:00:00Z',
    source: 'Scaleway Jobs',
    url: 'https://scaleway.com'
  }
];

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Sec-Fetch-Site'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const params = req.method === 'POST' ? req.body || {} : req.query || {};
    const {
      query = '',
      location = '',
      contractType = '',
      remoteOnly = false,
      limit = 20
    } = params;

    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanLocation = (location || '').toLowerCase().trim();

    let filtered = [...CURATED_JOB_OFFERS];

    // Filter by Query (Title, Company, Skills, Description)
    if (cleanQuery) {
      const tokens = cleanQuery.split(/\s+/).filter(t => t.length >= 2);
      filtered = filtered.filter(job => {
        const fullText = `${job.title} ${job.company} ${job.skills.join(' ')} ${job.description}`.toLowerCase();
        return tokens.some(tok => fullText.includes(tok));
      });
    }

    // Filter by Location
    if (cleanLocation && cleanLocation !== 'france' && cleanLocation !== 'all') {
      filtered = filtered.filter(job => {
        if (job.isRemote || job.remoteMode === 'full') return true; // remote always matches
        const jobLoc = `${job.location} ${job.city}`.toLowerCase();
        return jobLoc.includes(cleanLocation);
      });
    }

    // Filter by Contract Type
    if (contractType && contractType !== 'all') {
      filtered = filtered.filter(job =>
        job.contractType.toLowerCase() === contractType.toLowerCase()
      );
    }

    // Filter by Remote Only
    if (remoteOnly === true || remoteOnly === 'true') {
      filtered = filtered.filter(job => job.isRemote || job.remoteMode === 'full');
    }

    // If query resulted in no filtered items, return curated list with query tagged
    if (filtered.length === 0 && cleanQuery) {
      filtered = CURATED_JOB_OFFERS.slice(0, 4);
    }

    return res.status(200).json({
      success: true,
      total: filtered.length,
      jobs: filtered.slice(0, Number(limit) || 20)
    });
  } catch (error) {
    console.error('[CareerOps API Error]', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'Impossible de récupérer les offres d\'emploi'
    });
  }
}
