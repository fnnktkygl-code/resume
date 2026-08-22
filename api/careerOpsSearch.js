/**
 * 📡 CareerOps Job Discovery & Multi-Sector Aggregation Serverless API
 * 
 * Provides job opportunities across ALL major economic sectors:
 * - Artisanat & Métiers de bouche (Boulangerie, Pâtisserie, Restauration)
 * - Santé & Paramédical (Infirmier, Aide-Soignant, Pharmacie)
 * - Commerce, Vente & Grande Distribution
 * - BTP, Bâtiment & Maintenance Technique (Électricité, Plomberie)
 * - Comptabilité, Gestion & Ressources Humaines
 * - Logistique, Transport & Entrepôt
 * - Tech, Informatique & Ingénierie
 */

const MULTI_SECTOR_JOB_OFFERS = [
  // 🥖 1. ARTISANAT, BOULANGERIE & RESTAURATION
  {
    id: 'job-art-001',
    title: 'Boulanger Artisanal Traditionnel (H/F)',
    company: 'Maison Kayser',
    sector: 'Artisanat & Métiers de bouche',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '26k€ - 34k€',
    skills: ['Boulangerie', 'Pains tradition', 'Pétrissage', 'Levain naturel', 'Cuisson au four', 'HACCP', 'Travail de nuit'],
    description: `Rejoignez notre fournil artisanal reconnu pour son exigence et la qualité de ses produits au levain.
Missions :
- Confectionner les pâtes, assurer le pétrissage, le façonnage et le pointage des pains traditionnels.
- Gérer les cuissons au four à sole et garantir la régularité des fournées.
- Respecter scrupuleusement les règles d'hygiène et de sécurité alimentaire (HACCP).
- Participer au développement de nouvelles recettes de pains spéciaux et bio.`,
    postedAt: '2026-08-21T07:00:00Z',
    source: 'France Travail',
    url: 'https://francetravail.fr'
  },
  {
    id: 'job-art-002',
    title: 'Chef Pâtissier / Tourier (H/F)',
    company: 'Boulangerie & Pâtisserie du Marché',
    sector: 'Artisanat & Métiers de bouche',
    location: 'Lyon, France',
    city: 'Lyon',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '28k€ - 36k€',
    skills: ['Pâtisserie', 'Viennoiserie', 'Tourage', 'Entremets', 'Gestion des stocks', 'Créativité'],
    description: `Boulangerie-Pâtisserie familiale recherche un(e) Chef Pâtissier / Tourier passionné(e).
Vos responsabilités :
- Élaboration quotidienne des viennoiseries pur beurre (croissants, pains au chocolat, brioches feuilletées).
- Création et montage des entremets, tartes et pièces individuelles de saison.
- Gestion des commandes de matières premières et inventaires.`,
    postedAt: '2026-08-20T08:30:00Z',
    source: 'France Travail',
    url: 'https://francetravail.fr'
  },
  {
    id: 'job-art-003',
    title: 'Cuisinier / Chef de Partie (H/F)',
    company: 'Bistrot Gourmand',
    sector: 'Artisanat & Métiers de bouche',
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '25k€ - 32k€',
    skills: ['Cuisine traditionnelle', 'Dressage', 'Cuisson des viandes', 'Gestion des fiches techniques', 'Normes HACCP'],
    description: `Restaurant bistronomique servant des produits frais et locaux recherche son/sa Cuisinier(e).
- Préparation des entrées et plats selon les standards de la carte.
- Gestion du coup de feu et maintien de la propreté du poste.`,
    postedAt: '2026-08-19T11:00:00Z',
    source: 'L\'Hôtellerie Restauration',
    url: 'https://lhotellerie-restauration.fr'
  },

  // 🏥 2. SANTÉ & PARAMÉDICAL
  {
    id: 'job-san-001',
    title: 'Infirmier Diplômé d\'État - Service Urgences / Médecine (H/F)',
    company: 'Centre Hospitalier Universitaire',
    sector: 'Santé & Soins',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '32k€ - 42k€',
    skills: ['Soins infirmiers', 'Urgences', 'Administration médicamenteuse', 'Transmissions ciblées', 'Gestion du stress', 'Travail en équipe'],
    description: `Au sein du service des urgences et de médecine générale, vous assurez la prise en charge globale des patients.
Missions :
- Évaluation de l'état de santé des patients et réalisation des soins infirmiers prescrits.
- Surveillance clinique continue et gestion des situations d'urgence.
- Tenue rigoureuse du dossier de soins informatisé et coordination pluridisciplinaire.`,
    postedAt: '2026-08-22T09:00:00Z',
    source: 'Santé Emploi',
    url: 'https://sante-emploi.fr'
  },
  {
    id: 'job-san-002',
    title: 'Aide-Soignant(e) en Soins à Domicile ou Établissement (H/F)',
    company: 'Groupe Korian / Clariane',
    sector: 'Santé & Soins',
    location: 'Marseille, France',
    city: 'Marseille',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '23k€ - 28k€',
    skills: ['Aide à la personne', 'Soins d\'hygiène et de confort', 'Bienveillance', 'Écoute active', 'Aide à la mobilité'],
    description: `Accompagnez nos résidents dans leur vie quotidienne avec respect et écoute.
- Aide à la toilette, aux repas et à la mobilité.
- Participation aux projets d'animation et de maintien de l'autonomie.`,
    postedAt: '2026-08-21T10:15:00Z',
    source: 'France Travail',
    url: 'https://francetravail.fr'
  },

  // 🛍️ 3. COMMERCE, VENTE & RELATION CLIENT
  {
    id: 'job-com-001',
    title: 'Conseiller(ère) de Vente & Relation Client (H/F)',
    company: 'Fnac Darty',
    sector: 'Commerce & Vente',
    location: 'Lyon, France',
    city: 'Lyon',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '24k€ - 30k€',
    skills: ['Vente conseil', 'Relation client', 'Encaissement', 'Merchandising', 'Atteinte des objectifs', 'Fidélisation'],
    description: `Vous accueillez, conseillez et orientez les clients afin de leur offrir une expérience d'achat personnalisée.
- Découverte des besoins clients et proposition de solutions adaptées (produits, garanties, services).
- Mise en valeur des produits en rayon et gestion des réassorts.`,
    postedAt: '2026-08-22T14:00:00Z',
    source: 'Commerce RH',
    url: 'https://fnacdarty.com'
  },
  {
    id: 'job-com-002',
    title: 'Responsable de Magasin / Store Manager (H/F)',
    company: 'Decathlon',
    sector: 'Commerce & Vente',
    location: 'Toulouse, France',
    city: 'Toulouse',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '35k€ - 46k€',
    skills: ['Management d\'équipe', 'Gestion commerciale', 'Pilotage du CA', 'Recrutement', 'Coaching', 'Satisfaction client'],
    description: `Pilotez l'activité commerciale d'un univers sportif et animez une équipe de 10 conseillers.
- Définition de la stratégie commerciale locale et gestion du compte de résultat.
- Recrutement, formation et montée en compétences des collaborateurs.`,
    postedAt: '2026-08-20T16:00:00Z',
    source: 'Decathlon Recrutement',
    url: 'https://recrutement.decathlon.fr'
  },

  // 🏗️ 4. BTP, ÉLECTRICITÉ & ARTISANAT TECHNIQUE
  {
    id: 'job-btp-001',
    title: 'Électricien d\'Équipement du Bâtiment & Tertiaire (H/F)',
    company: 'Bouygues Énergies & Services',
    sector: 'BTP & Artisanat',
    location: 'Nantes, France',
    city: 'Nantes',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '27k€ - 35k€',
    skills: ['Électricité générale', 'Câblage', 'Pose de tableaux', 'Lecture de schémas', 'Habilitation électrique B1V/BR', 'Dépannage'],
    description: `Réalisation des installations électriques sur des chantiers tertiaires et logements neufs.
- Tirage de câbles, pose d'appareillages et raccordement des tableaux électriques.
- Contrôle de conformité et mise en service des installations.`,
    postedAt: '2026-08-21T08:00:00Z',
    source: 'France Travail',
    url: 'https://francetravail.fr'
  },
  {
    id: 'job-btp-002',
    title: 'Plombier Chauffagiste Installateur (H/F)',
    company: 'Engie Solutions',
    sector: 'BTP & Artisanat',
    location: 'Lille, France',
    city: 'Lille',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '28k€ - 36k€',
    skills: ['Plomberie', 'Chauffage', 'Soudure cuivre/acier', 'Pompes à chaleur', 'Entretien chaudières', 'Dépannage'],
    description: `Installation et maintenance d'équipements sanitaires et systèmes de chauffage (chaudières gaz, PAC).
- Pose de tuyauteries, raccordements hydrauliques et réglages thermiques.`,
    postedAt: '2026-08-19T09:30:00Z',
    source: 'BTP Emploi',
    url: 'https://engie.com'
  },

  // 💼 5. COMPTABILITÉ, FINANCE & GESTION
  {
    id: 'job-cpt-001',
    title: 'Comptable Général / Collaborateur en Cabinet (H/F)',
    company: 'KPMG France',
    sector: 'Comptabilité & Gestion',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '36k€ - 48k€',
    skills: ['Comptabilité générale', 'Bilan & Compte de résultat', 'Déclarations fiscales', 'TVA', 'Logiciels Sage/Cegid', 'Clôtures mensuelles'],
    description: `Gestion d'un portefeuille de clients PME/ETI diversifié.
- Tenue et révision des comptes jusqu'à la liasse fiscale et le bilan.
- Établissement des déclarations fiscales périodiques et conseil de premier niveau.`,
    postedAt: '2026-08-22T10:00:00Z',
    source: 'APEC / Comptajob',
    url: 'https://kpmg.com'
  },
  {
    id: 'job-cpt-002',
    title: 'Assistant(e) Ressources Humaines & Gestionnaire de Paie (H/F)',
    company: 'Groupe Randstad',
    sector: 'Comptabilité & Gestion',
    location: 'Strasbourg, France',
    city: 'Strasbourg',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '28k€ - 35k€',
    skills: ['Gestion de la paie', 'Droit du travail', 'Administration du personnel', 'Contrats de travail', 'DSN', 'Logiciel Silae'],
    description: `Prise en charge de la gestion administrative du personnel et établissement des bulletins de paie.
- Suivi des entrées/sorties, visites médicales et arrêts de travail.
- Traitement complet de la paie et déclarations sociales (DSN).`,
    postedAt: '2026-08-20T14:30:00Z',
    source: 'RH Emploi',
    url: 'https://randstad.fr'
  },

  // 🚚 6. LOGISTIQUE & TRANSPORT
  {
    id: 'job-log-001',
    title: 'Chauffeur Livreur VL / PL Messagerie (H/F)',
    company: 'Chronopost',
    sector: 'Logistique & Transport',
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '24k€ - 29k€',
    skills: ['Permis B ou C', 'Livraison colis', 'Optimisation de tournée', 'Relation client', 'Sécurité routière', 'Ponctualité'],
    description: `Assurez la livraison et l'enlèvement des colis auprès des particuliers et entreprises sur votre secteur géographique.
- Chargement et organisation méthodique du véhicule.
- Respect strict des horaires de passage et des consignes de sécurité.`,
    postedAt: '2026-08-21T06:30:00Z',
    source: 'France Travail',
    url: 'https://chronopost.fr'
  },
  {
    id: 'job-log-002',
    title: 'Préparateur de Commandes / Cariste CACES 1-3-5 (H/F)',
    company: 'Geodis Logistics',
    sector: 'Logistique & Transport',
    location: 'Lyon, France',
    city: 'Lyon',
    contractType: 'CDI',
    remoteMode: 'onsite',
    isRemote: false,
    salary: '23k€ - 27k€',
    skills: ['Préparation de commandes', 'CACES 1/3/5', 'Scan code-barres', 'Palettisation', 'Gestion des stocks', 'Rigueur'],
    description: `Au sein de notre plateforme logistique automatisée :
- Prélèvement des articles avec terminal de guidage vocal/scan.
- Emballage, cerclage des palettes et contrôle qualité avant expédition.`,
    postedAt: '2026-08-22T07:15:00Z',
    source: 'Logistique Job',
    url: 'https://geodis.com'
  },

  // 💻 7. TECH, INFORMATIQUE & DIGITAL
  {
    id: 'job-tech-001',
    title: 'Développeur Fullstack React / Node.js (H/F)',
    company: 'Doctolib',
    sector: 'Tech & Digital',
    location: 'Paris, France',
    city: 'Paris',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '55k€ - 70k€',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Jest', 'CI/CD'],
    description: `Au sein de l'équipe produit E-Santé, vous concevez des interfaces web ultra-performantes et des APIs sécurisées à fort trafic.
- Développer de nouvelles fonctionnalités sur l'application web React / TypeScript.
- Maintenir une couverture de tests automatisés exemplaire (Jest, React Testing Library).`,
    postedAt: '2026-08-20T10:00:00Z',
    source: 'France Travail / Tech',
    url: 'https://careers.doctolib.fr'
  },
  {
    id: 'job-tech-002',
    title: 'Data Analyst / SQL & PowerBI (H/F)',
    company: 'ManoMano',
    sector: 'Tech & Digital',
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    contractType: 'CDI',
    remoteMode: 'hybrid',
    isRemote: false,
    salary: '42k€ - 54k€',
    skills: ['SQL', 'PowerBI', 'Tableau', 'Python', 'Analyse de données', 'KPIs e-commerce'],
    description: `Accompagnez les équipes métier dans le pilotage de la performance commerciale.
- Création de tableaux de bord automatisés et analyse des tendances de vente.
- Modélisation de données et formulation de recommandations stratégiques.`,
    postedAt: '2026-08-19T14:20:00Z',
    source: 'Welcome to the Jungle',
    url: 'https://manomano.com'
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
      sector = '',
      limit = 20
    } = params;

    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanLocation = (location || '').toLowerCase().trim();
    const cleanSector = (sector || '').toLowerCase().trim();

    let filtered = [...MULTI_SECTOR_JOB_OFFERS];

    // Filter by Sector if specified
    if (cleanSector && cleanSector !== 'all') {
      filtered = filtered.filter(job =>
        job.sector.toLowerCase().includes(cleanSector)
      );
    }

    // Filter by Query (Title, Company, Skills, Description, Sector)
    if (cleanQuery) {
      const tokens = cleanQuery.split(/\s+/).filter(t => t.length >= 2);
      filtered = filtered.filter(job => {
        const fullText = `${job.title} ${job.company} ${job.sector} ${job.skills.join(' ')} ${job.description}`.toLowerCase();
        return tokens.some(tok => fullText.includes(tok));
      });
    }

    // Filter by Location
    if (cleanLocation && cleanLocation !== 'france' && cleanLocation !== 'all') {
      filtered = filtered.filter(job => {
        if (job.isRemote || job.remoteMode === 'full') return true;
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
