export const DAILY_TIPS_DATA = {
  creator: {
    fr: [
      {
        id: 'cr_1',
        category: 'Sécurité & Vie Privée',
        badge: '👑 Avis du Créateur',
        title: 'Ne publiez jamais votre adresse postale complète sur un CV',
        stat: 'Adresse',
        statLabel: 'Protection de la vie privée',
        description: 'Afficher votre numéro d\'appartement et votre rue exacte n\'apporte aucune valeur au recruteur, présente des risques de sécurité et peut générer des biais de discrimination géographique (quartier, temps de transport supposé).',
        source: 'Étude DARES & CNRS sur les discriminations territoriales à l\'embauche',
        actionable: 'Indiquez uniquement votre Ville et votre Département/Code Postal (ex: "Paris (75)" ou "Lyon, Auvergne-Rhône-Alpes").',
        appAction: { label: 'Éditer mes Infos de Contact', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_2',
        category: 'Originalité Visuelle',
        badge: '👑 Avis du Créateur',
        title: 'Évitez la saturation des modèles génériques (Canva)',
        stat: 'Banalité',
        statLabel: 'Saturation visuelle des recruteurs',
        description: 'À force de voir 50 fois par jour les mêmes templates surchargés de barres de niveau colorées et d\'icônes kitsch, le cerveau du recruteur s\'épuise et décroche. Un design épuré, élégant et structuré se démarque immédiatement par sa sobriété professionnelle.',
        source: 'Principe d\'Isolation de von Restorff (Psychologie Cognitive)',
        actionable: 'Optez pour une mise en page claire et aérée qui valorise vos accomplissements plutôt que des artifices graphiques.',
        appAction: { label: 'Activer le modèle NJM (Favori)', actionKey: 'SET_TEMPLATE_NJM' }
      },
      {
        id: 'cr_3',
        category: 'Guidage Visuel',
        badge: '👑 Avis du Créateur',
        title: 'Orientez le regard du recruteur grâce au gras stratégique',
        stat: 'Attention',
        statLabel: 'Guidage inconscient du regard',
        description: 'Le recruteur survolant votre CV en quelques secondes, la mise en gras sélective d\'un mot-clé ou d\'une réalisation majeure capte instantanément son regard sur vos plus grands succès et les prérequis de l\'offre.',
        source: 'Nielsen Norman Group - Visual Hierarchy & Scanning Patterns',
        actionable: 'Sélectionnez vos termes clés les plus percutants et appliquez un gras net sans encombrer la lecture.',
        appAction: { label: 'Lancer le Gras IA Automatique', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cr_4',
        category: 'Stratégie Portrait',
        badge: '👑 Avis du Créateur',
        title: 'Gérez votre photo de profil avec discernement',
        stat: 'Biais RH',
        statLabel: 'Prévention des biais inconscients',
        description: 'En France et en Europe, la photo n\'est pas obligatoire. Si vous craignez des biais inconscients lors de la première sélection, omettez-la sans hésiter. Si vous la mettez, exigez une qualité irréprochable et professionnelle.',
        source: 'Rapport du Défenseur des Droits & Bureau International du Travail (BIT)',
        actionable: 'Activez ou désactivez la photo en 1 clic selon la culture du secteur visé (Tech, Conseil, Corporate).',
        appAction: { label: 'Gérer la photo dans le CV', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_5',
        category: 'E-mail Professionnel',
        badge: '👑 Avis du Créateur',
        title: 'Utilisez une adresse e-mail neutre et professionnelle',
        stat: '= -5 Fautes',
        statLabel: 'Pénalité d\'une adresse informelle',
        description: 'L\'usage d\'une adresse e-mail informelle ou fantaisiste (ex: pseudo123@...) dégrade la perception de rigueur et d\'honnêteté de la même façon que 5 fautes d\'orthographe au sein du document.',
        source: 'van Toorenburg, Oostrom & Pollet (2015) — Cyberpsychology Study',
        actionable: 'Privilégiez une structure neutre de type prenom.nom@provider.com.',
        appAction: { label: 'Modifier mon E-mail', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_6',
        category: 'Ancrage Digital',
        badge: '👑 Avis du Créateur',
        title: 'Ajoutez un lien vers votre profil LinkedIn complet',
        stat: '+71%',
        statLabel: 'Hausse des appels pour entretien',
        description: 'Les candidatures incluant l\'URL d\'un profil LinkedIn bien renseigné obtiennent un taux de rappel supérieur de 71% par rapport aux candidatures sans lien.',
        source: 'Étude Terrain ResumeGo (24 570 candidatures analysées)',
        actionable: 'Copiez votre lien LinkedIn personnalisé dans vos coordonnées de contact.',
        appAction: { label: 'Ajouter mon LinkedIn', actionKey: 'GO_TO_PERSONAL' }
      }
    ],
    en: [
      {
        id: 'cr_1',
        category: 'Security & Privacy',
        badge: '👑 Creator\'s Advice',
        title: 'Never publish your full street address on a resume',
        stat: 'Address',
        statLabel: 'Privacy & Bias Prevention',
        description: 'Including your exact street name and apartment number provides zero value to recruiters, poses security risks, and can trigger unconscious postal code discrimination.',
        source: 'DARES & CNRS Study on Geographic Hiring Discrimination',
        actionable: 'Include only your City and Region/State (e.g., "San Francisco, CA" or "London, UK").',
        appAction: { label: 'Edit Contact Info', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_2',
        category: 'Visual Originality',
        badge: '👑 Creator\'s Advice',
        title: 'Avoid generic template fatigue (overused Canva layouts)',
        stat: 'Banal Layouts',
        statLabel: 'Recruiter Visual Fatigue',
        description: 'Recruiters reviewing dozens of identical templates with skill progress bars and decorative icons experience visual burnout. A clean, structured, and elegant layout stands out instantly through professional restraint.',
        source: 'Von Restorff Isolation Effect (Cognitive Psychology)',
        actionable: 'Choose an airy, structured template that highlights achievements rather than graphic gimmicks.',
        appAction: { label: 'Switch to NJM Template (Favorite)', actionKey: 'SET_TEMPLATE_NJM' }
      },
      {
        id: 'cr_3',
        category: 'Visual Scanning',
        badge: '👑 Creator\'s Advice',
        title: 'Guide recruiter attention with strategic bolding',
        stat: 'Focus',
        statLabel: 'Involuntary Eye Guidance',
        description: 'Since recruiters scan resumes in seconds, selectively bolding key metrics and job-matching terms instantly anchors their gaze on your strongest qualifications.',
        source: 'Nielsen Norman Group - Eye Tracking & Reading Patterns',
        actionable: 'Highlight key impact metrics and core skills with crisp bold formatting without cluttering paragraphs.',
        appAction: { label: 'Launch AI Smart Bolding', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cr_4',
        category: 'Profile Photo Strategy',
        badge: '👑 Creator\'s Advice',
        title: 'Manage your profile picture strategically',
        stat: 'Bias Risk',
        statLabel: 'Unconscious Bias Prevention',
        description: 'Photos are optional in many markets. If you suspect unconscious hiring bias in initial screenings, feel free to omit it. If included, ensure a crisp, professional headshot.',
        source: 'International Labour Organization (ILO) Diversity Report',
        actionable: 'Toggle photo visibility on or off with 1 click based on target industry practices (Tech, Consulting, Corporate).',
        appAction: { label: 'Manage Photo in CV', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_5',
        category: 'Professional Email',
        badge: '👑 Creator\'s Advice',
        title: 'Use a clean, professional email address',
        stat: '= -5 Typos',
        statLabel: 'Informal Email Penalty',
        description: 'Using an informal or playful email address reduces perceived conscientiousness and honesty as severely as having 5 spelling mistakes on your resume.',
        source: 'van Toorenburg, Oostrom & Pollet (2015) — Cyberpsychology Study',
        actionable: 'Use a neutral email format like firstname.lastname@provider.com.',
        appAction: { label: 'Update Email Address', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_6',
        category: 'Digital Presence',
        badge: '👑 Creator\'s Advice',
        title: 'Include a link to a comprehensive LinkedIn profile',
        stat: '+71%',
        statLabel: 'Interview callback boost',
        description: 'Resumes featuring a complete LinkedIn profile URL achieve a 71% higher callback rate compared to applications without a link.',
        source: 'ResumeGo Field Experiment (24,570 applications tested)',
        actionable: 'Paste your custom LinkedIn profile URL into your contact header.',
        appAction: { label: 'Add LinkedIn Link', actionKey: 'GO_TO_PERSONAL' }
      }
    ],
    es: [
      {
        id: 'cr_1',
        category: 'Seguridad y Privacidad',
        badge: '👑 Consejo del Creador',
        title: 'Nunca publiques tu dirección postal completa en el CV',
        stat: 'Dirección',
        statLabel: 'Protección de privacidad',
        description: 'Incluir el número de calle y departamento no aporta valor al reclutador, presenta riesgos de seguridad y puede generar sesgos de discriminación geográfica.',
        source: 'Estudio DARES & CNRS sobre discriminación territorial en la contratación',
        actionable: 'Indica únicamente tu Ciudad y Provincia/Región (ej: "Madrid" o "Barcelona, Cataluña").',
        appAction: { label: 'Editar Información de Contacto', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_2',
        category: 'Originalidad Visual',
        badge: '👑 Consejo del Creador',
        title: 'Evita la saturación de plantillas genéricas (estilo Canva)',
        stat: 'Banalidad',
        statLabel: 'Saturación visual de los reclutadores',
        description: 'Al ver 50 veces al día las mismas plantillas sobrecargadas con barras de progreso e íconos recargados, el cerebro del reclutador se agota. Un diseño limpio, estructurado y sobrio destaca de inmediato.',
        source: 'Efecto de Aislamiento de von Restorff (Psicología Cognitiva)',
        actionable: 'Opta por una plantilla clara y ordenada que resalte tus logros sin artificios gráficos.',
        appAction: { label: 'Activar plantilla NJM (Favorita)', actionKey: 'SET_TEMPLATE_NJM' }
      },
      {
        id: 'cr_3',
        category: 'Guiado Visual',
        badge: '👑 Consejo del Creador',
        title: 'Guía la mirada del reclutador usando negritas estratégicas',
        stat: 'Enfoque',
        statLabel: 'Guía inconsciente de la mirada',
        description: 'Dado que el reclutador escanea tu CV en segundos, resaltar en negrita ciertos números clave y habilidades ancla su mirada directamente en tus mayores éxitos.',
        source: 'Nielsen Norman Group - Patrones de Lectura y Ocular',
        actionable: 'Selecciona términos de alto impacto y aplica negrita precisa sin recargar la lectura.',
        appAction: { label: 'Ejecutar Negrita IA', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cr_4',
        category: 'Estrategia de Foto',
        badge: '👑 Consejo del Creador',
        title: 'Gestiona tu foto de perfil estratégicamente',
        stat: 'Sesgo RH',
        statLabel: 'Prevención de sesgos inconscientes',
        description: 'La foto no es obligatoria en la mayoría de países. Si temes sesgos inconscientes en el primer filtro, no dudes en omitirla. Si la incluyes, exige máxima calidad profesional.',
        source: 'Informe de la Organización Internacional del Trabajo (OIT)',
        actionable: 'Activa o desactiva la foto con 1 clic según el sector objetivo (Tech, Consultoría, Corporativo).',
        appAction: { label: 'Gestionar foto en el CV', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_5',
        category: 'Email Profesional',
        badge: '👑 Consejo del Creador',
        title: 'Usa una dirección de correo neutra y profesional',
        stat: '= -5 Errores',
        statLabel: 'Penalización por email informal',
        description: 'El uso de un email informal (ej: usuario123@...) reduce la percepción de seriedad de la misma forma que cometer 5 faltas de ortografía en el documento.',
        source: 'van Toorenburg, Oostrom & Pollet (2015) — Cyberpsychology Study',
        actionable: 'Usa una estructura neutra tipo nombre.apellido@proveedor.com.',
        appAction: { label: 'Modificar Email', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cr_6',
        category: 'Presencia Digital',
        badge: '👑 Consejo del Creador',
        title: 'Añade un enlace a tu perfil de LinkedIn completo',
        stat: '+71%',
        statLabel: 'Aumento de llamadas para entrevista',
        description: 'Las postulaciones que incluyen el enlace a un perfil de LinkedIn bien estructurado obtienen un 71% más de llamadas que las solicitudes sin enlace.',
        source: 'Estudio de Campo ResumeGo (24,570 solicitudes analizadas)',
        actionable: 'Copia el enlace de tu perfil de LinkedIn en tus datos de contacto.',
        appAction: { label: 'Añadir LinkedIn', actionKey: 'GO_TO_PERSONAL' }
      }
    ]
  },
  cv: {
    fr: [
      {
        id: 'cv_1',
        category: 'Lecture & Lisibilité',
        badge: 'Étude Eye-Tracking',
        title: 'Les recruteurs lisent votre CV en 7,4 secondes',
        stat: '7,4s',
        statLabel: 'Temps de lecture moyen initial',
        description: 'Placez vos informations cruciales (Titre professionnel, 3 compétences clés et dernier poste) tout en haut. Un profil clair retient l\'attention 40% plus longtemps.',
        source: 'Étude Ladders Eye-Tracking Study (2018 / 2023)',
        actionable: 'Ajoutez un titre professionnel précis (ex: "Développeur Full-Stack React & Node") en haut de votre CV.',
        appAction: { label: 'Mettre à jour mon Titre / Slogan', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cv_2',
        category: 'Mots-clés & ATS',
        badge: 'Robot ATS',
        title: 'Les logiciels de recrutement (ATS) trient sur les mots-clés exacts',
        stat: '98,4%',
        statLabel: 'Entreprises Fortune 500 utilisant un ATS',
        description: 'Les ATS n\'éliminent pas arbitrairement les CV, mais échouent à lire les mises en page trop complexes et classent les candidats selon la présence exacte des mots-clés de l\'offre.',
        source: 'Jobscan — Fortune 500 ATS Adoption & Parsing Benchmark Data',
        actionable: 'Utilisez l\'outil "🎯 Score ATS" dans l\'application pour faire matcher vos mots-clés et sécuriser la lisibilité.',
        appAction: { label: 'Analyser mon Score ATS', actionKey: 'OPEN_ATS_SCORE' }
      },
      {
        id: 'cv_3',
        category: 'Chiffrage & Impact',
        badge: 'Résultats Mesurables',
        title: 'Quantifier vos réalisations augmente de 40% vos chances d\'entretien',
        stat: '+40%',
        statLabel: 'Taux de rappel avec données chiffrées',
        description: 'Remplacer des phrases vagues par des résultats mesurables (ex: "+25% de productivité", "gestion d\'un budget de 50K€") valide immédiatement vos compétences.',
        source: 'National Association of Colleges and Employers (NACE)',
        actionable: 'Intégrez au moins 1 chiffre concret (pourcentage, volume, durée, budget) dans chaque expérience.',
        appAction: { label: 'Enrichir mes Expériences', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_4',
        category: 'Longueur & Structure',
        badge: 'Étude Terrain (482 RH)',
        title: 'Le CV 2 pages est préféré 2,3x plus souvent pour un profil confirmé',
        stat: '2,3x',
        statLabel: 'Préférence RH pour le format 2 pages',
        description: 'Une étude de recrutement grandeur nature montre que les recruteurs sélectionnent des CV 2 pages 2,3 fois plus souvent pour les profils > 5 ans d\'XP, et les notent 21% plus haut en qualité perçue.',
        source: 'ResumeGo (2018) — étude de simulation sur 7 712 CVs & 482 recruteurs',
        actionable: 'Ne compressez pas artificiellement un parcours riche sur 1 page. Gardez le format 1-page pour les profils juniors.',
        appAction: { label: 'Ajuster la mise en page', actionKey: 'TOGGLE_COMPACT' }
      },
      {
        id: 'cv_5',
        category: 'Verbes d\'Action',
        badge: 'Dynamisme',
        title: 'Commencer chaque puce par un verbe d\'action augmente la mémorisation de 140%',
        stat: 'x2,4',
        statLabel: 'Mémorisation des accomplissements',
        description: 'Évitez les formulations passives comme "Chargé de...". Privilégiez des verbes dynamiques : Piloter, Concevoir, Automatiser, Optimiser, Négocier.',
        source: 'Harvard Business Review - Resume Writing Guide',
        actionable: 'Commencez chaque puce d\'expérience par un verbe au passé composé ou à l\'infinitif actif.',
        appAction: { label: 'Optimiser mes Expériences', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_6',
        category: 'Section Compétences',
        badge: 'Hard & Soft Skills',
        title: '89% des échecs au recrutement sont liés aux Soft Skills',
        stat: '89%',
        statLabel: 'Importance des compétences comportementales',
        description: 'Les recruteurs recherchent un équilibre entre maîtrise technique (Hard Skills) et aptitudes humaines (Communication, Résolution de problèmes, Adaptabilité).',
        source: 'Leadership IQ — "Hiring for Attitude" (20 000+ recrutements suivis)',
        actionable: 'Mettez en avant 4 à 6 compétences techniques principales accompagnées de 2 à 3 qualités relationnelles clés.',
        appAction: { label: 'Éditer mes Compétences', actionKey: 'GO_TO_SKILLS' }
      },
      {
        id: 'cv_7',
        category: 'Mise en valeur',
        badge: 'Gras Intelligents',
        title: 'La mise en gras ciblée accélère le repérage visuel de 65%',
        stat: '+65%',
        statLabel: 'Vitesse de repérage des mots-clés',
        description: 'Mettre en gras 1 à 2 mots-clés stratégiques par paragraphe guide le regard du recruteur directement sur vos points forts majeurs.',
        source: 'Nielsen Norman Group - UX Reading Patterns',
        actionable: 'Utilisez notre outil "B Gras IA" pour accentuer automatiquement les concepts clés de votre CV.',
        appAction: { label: 'Lancer le Gras IA', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cv_8',
        category: 'Relecture & Rigueur',
        badge: 'Erreur Fatale',
        title: '77% des recruteurs éliminent immédiatement un CV contenant une faute',
        stat: '77%',
        statLabel: 'Taux de rejet immédiat pour faute',
        description: 'Une simple coquille est interprétée comme un manque de rigueur. C\'est la première cause de rejet instantané citée par les évaluateurs.',
        source: 'CareerBuilder Survey & Martin-Lacroux (2017) Study',
        actionable: 'Relisez attentivement et faites relire votre CV avant l\'exportation.',
        appAction: { label: 'Relire mes Expériences', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_9',
        category: 'Mise en Page',
        badge: 'Pattern en F',
        title: 'Placez les chiffres clés dès les 3 premiers mots de chaque puce',
        stat: 'Pattern F',
        statLabel: 'Optimisation de l\'oculométrie',
        description: 'Les recruteurs lisent en "F". Placer le résultat chiffré en tout début de puce (ex: "Réduction de 25% des coûts via...") garantit sa captation visuelle.',
        source: 'Nielsen Norman Group & Ladders Eye-Tracking Study',
        actionable: 'Reformulez vos puces : [Verbe d\'action] + [Résultat chiffré] + [Contexte].',
        appAction: { label: 'Optimiser mes Puces', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_10',
        category: 'Parsing ATS',
        badge: 'Sécurité ATS',
        title: 'Les structures multi-colonnes génèrent >60% d\'erreurs de lecture ATS',
        stat: '>60%',
        statLabel: 'Erreurs de parsing en 2 colonnes',
        description: 'Les moteurs ATS lisent horizontalement de gauche à droite. Une mise en page 2 colonnes complexe peut fusionner des phrases incohérentes.',
        source: 'Jobscan ATS Parser Benchmark',
        actionable: 'Utilisez nos modèles mono-colonne ou aérés conçus pour un parsing 100% garanti.',
        appAction: { label: 'Activer le modèle NJM', actionKey: 'SET_TEMPLATE_NJM' }
      }
    ],
    en: [
      {
        id: 'cv_1',
        category: 'Readability',
        badge: 'Eye-Tracking Study',
        title: 'Recruiters scan your resume in 7.4 seconds',
        stat: '7.4s',
        statLabel: 'Average initial scan time',
        description: 'Place vital details (Title, 3 core skills, latest role) at the top. Clear layouts retain recruiter attention 40% longer.',
        source: 'Ladders Eye-Tracking Study (2018 / 2023)',
        actionable: 'Add a sharp professional title (e.g. "Senior Full-Stack Engineer") at the top.',
        appAction: { label: 'Update Title / Tagline', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cv_2',
        category: 'Keywords & ATS',
        badge: 'ATS Screening',
        title: 'Applicant Tracking Systems (ATS) rank applicants by exact keyword match',
        stat: '98.4%',
        statLabel: 'Fortune 500 ATS adoption rate',
        description: 'ATS parsers do not reject resumes arbitrarily, but struggle with complex graphic elements and rank candidates based on keyword frequency and exact phrasing.',
        source: 'Jobscan — Fortune 500 ATS Adoption & Parsing Benchmark Data',
        actionable: 'Use the "🎯 ATS Score" tool to verify ATS readability and match job keywords.',
        appAction: { label: 'Check ATS Score', actionKey: 'OPEN_ATS_SCORE' }
      },
      {
        id: 'cv_3',
        category: 'Quantified Impact',
        badge: 'Measurable Metrics',
        title: 'Quantifying achievements increases callback rates by 40%',
        stat: '+40%',
        statLabel: 'Callback boost with metrics',
        description: 'Replacing vague bullet points with numbers (e.g. "+25% efficiency", "managed $50K budget") instantly validates your expertise.',
        source: 'National Association of Colleges and Employers (NACE)',
        actionable: 'Include at least 1 concrete metric (percentage, revenue, team size) per work experience.',
        appAction: { label: 'Enrich Work Experience', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_4',
        category: 'Structure & Length',
        badge: 'Field Study (482 HRs)',
        title: '2-page resumes are 2.3x more preferred for experienced candidates',
        stat: '2.3x',
        statLabel: 'Recruiter preference for 2-page format',
        description: 'A large-scale hiring simulation showed recruiters choose 2-page resumes 2.3x more often for candidates with >5 yrs experience, rating them 21% higher in quality.',
        source: 'ResumeGo (2018) — Field Simulation (7,712 Resumes, 482 Recruiters)',
        actionable: 'Do not artificially compress a rich career onto 1 page. Reserve 1-page formats for junior roles.',
        appAction: { label: 'Adjust Layout Spacing', actionKey: 'TOGGLE_COMPACT' }
      },
      {
        id: 'cv_5',
        category: 'Action Verbs',
        badge: 'Dynamic Phrasing',
        title: 'Starting bullet points with action verbs boosts recall by 140%',
        stat: 'x2.4',
        statLabel: 'Achievement recall retention',
        description: 'Avoid passive phrases like "Responsible for". Use bold action verbs: Spearheaded, Architected, Automated, Negotiated.',
        source: 'Harvard Business Review - Resume Guide',
        actionable: 'Begin every bullet point with a strong action verb in past or active tense.',
        appAction: { label: 'Optimize Experience Wording', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_6',
        category: 'Skills Section',
        badge: 'Hard & Soft Skills',
        title: '89% of hiring failures stem from soft skill mismatches',
        stat: '89%',
        statLabel: 'Impact of interpersonal skills',
        description: 'Recruiters seek a balance between technical proficiency (Hard Skills) and collaborative traits (Communication, Problem Solving).',
        source: 'Leadership IQ — "Hiring for Attitude" (20,000+ hires tracked)',
        actionable: 'Feature 4-6 primary hard skills alongside 2-3 key soft skills.',
        appAction: { label: 'Edit Skills List', actionKey: 'GO_TO_SKILLS' }
      },
      {
        id: 'cv_7',
        category: 'Visual Accent',
        badge: 'Smart Bolding',
        title: 'Targeted bolding speeds up key skill detection by 65%',
        stat: '+65%',
        statLabel: 'Key term scanning speed',
        description: 'Bolding 1-2 core keywords per paragraph draws the recruiter\'s eyes straight to your standout highlights.',
        source: 'Nielsen Norman Group - UX Reading Patterns',
        actionable: 'Use the "B Smart Bolding" tool to automatically highlight impact terms.',
        appAction: { label: 'Run AI Smart Bolding', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cv_8',
        category: 'Proofreading',
        badge: 'Fatal Mistake',
        title: '77% of recruiters reject a resume instantly due to typos',
        stat: '77%',
        statLabel: 'Instant rejection for spelling errors',
        description: 'A single typo is interpreted as a lack of thoroughness. It is the #1 cited reason for immediate resume rejection.',
        source: 'CareerBuilder Survey & Martin-Lacroux (2017) Study',
        actionable: 'Proofread thoroughly and use grammar check tools before exporting.',
        appAction: { label: 'Review Experiences', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_9',
        category: 'Layout & F-Pattern',
        badge: 'F-Pattern Scan',
        title: 'Front-load key metrics within the first 3 words of bullet points',
        stat: 'F-Pattern',
        statLabel: 'Eye-tracking placement optimization',
        description: 'Recruiters scan in an F-pattern. Placing key metrics at the start of bullets (e.g. "Reduced costs by 25% via...") ensures instant visual capture.',
        source: 'Nielsen Norman Group & Ladders Eye-Tracking Study',
        actionable: 'Format bullets: [Action Verb] + [Quantified Metric] + [Context].',
        appAction: { label: 'Optimize Bullet Points', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_10',
        category: 'ATS Parsing',
        badge: 'ATS Safety',
        title: 'Multi-column layouts trigger >60% parsing errors in ATS systems',
        stat: '>60%',
        statLabel: 'Parsing errors in 2-column formats',
        description: 'ATS parsers read horizontally left to right. Complex 2-column layouts can mangle sentences and misread dates.',
        source: 'Jobscan ATS Parser Benchmark',
        actionable: 'Use our single-column, clean ATS templates for 100% parsing safety.',
        appAction: { label: 'Switch to NJM Template', actionKey: 'SET_TEMPLATE_NJM' }
      }
    ],
    es: [
      {
        id: 'cv_1',
        category: 'Lectura y Legibilidad',
        badge: 'Estudio Eye-Tracking',
        title: 'Los reclutadores leen tu CV en 7,4 segundos',
        stat: '7,4s',
        statLabel: 'Tiempo medio de lectura inicial',
        description: 'Ubica la información vital (Título, 3 competencias clave y último puesto) arriba. Un diseño claro retiene la atención un 40% más de tiempo.',
        source: 'Estudio Ladders Eye-Tracking (2018 / 2023)',
        actionable: 'Añade un título profesional preciso (ej: "Ingeniero Full-Stack React & Node") en la parte superior.',
        appAction: { label: 'Actualizar Título', actionKey: 'GO_TO_PERSONAL' }
      },
      {
        id: 'cv_2',
        category: 'Palabras Clave y ATS',
        badge: 'Filtro ATS',
        title: 'Los sistemas ATS clasifican a los candidatos por coincidencia de palabras clave',
        stat: '98,4%',
        statLabel: 'Empresas Fortune 500 que usan ATS',
        description: 'Los ATS no eliminan arbitrariamente, sino que fallan al leer plantillas recargadas y ordenan a los postulantes según las palabras clave requeridas.',
        source: 'Jobscan — Fortune 500 ATS Adoption & Parsing Benchmark Data',
        actionable: 'Usa "🎯 Score ATS" en la app para alinear palabras clave y asegurar legibilidad.',
        appAction: { label: 'Verificar Puntuación ATS', actionKey: 'OPEN_ATS_SCORE' }
      },
      {
        id: 'cv_3',
        category: 'Impacto Cuantitativo',
        badge: 'Métricas Medibles',
        title: 'Cuantificar tus logros aumenta las llamadas a entrevista en un 40%',
        stat: '+40%',
        statLabel: 'Aumento de llamadas con números',
        description: 'Reemplazar frases vagas por números (+25% de productividad, presupuesto de 50K€) valida de inmediato tu experiencia.',
        source: 'National Association of Colleges and Employers (NACE)',
        actionable: 'Incluye al menos 1 cifra concreta (porcentaje, volumen, presupuesto) en cada experiencia.',
        appAction: { label: 'Enriquecer Experiencias', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_4',
        category: 'Estructura y Longitud',
        badge: 'Estudio de Campo (482 RH)',
        title: 'El CV de 2 páginas es preferido 2,3 veces más para perfiles con experiencia',
        stat: '2,3x',
        statLabel: 'Preferencia RH por formato 2 páginas',
        description: 'Un estudio de contratación muestra que los reclutadores eligen el CV de 2 páginas 2,3 veces más para postulantes con >5 años de experiencia y lo valoran un 21% más.',
        source: 'ResumeGo (2018) — Simulación de campo (7,712 CVs, 482 Reclutadores)',
        actionable: 'No comprimas artificialmente una trayectoria amplia en 1 página. Reserva 1 página para roles júnior.',
        appAction: { label: 'Ajustar Espaciado', actionKey: 'TOGGLE_COMPACT' }
      },
      {
        id: 'cv_5',
        category: 'Verbos de Acción',
        badge: 'Dinamismo',
        title: 'Empezar cada viñeta con un verbo de acción aumenta la retención un 140%',
        stat: 'x2,4',
        statLabel: 'Retención de logros',
        description: 'Evita frases pasivas. Usa verbos dinámicos: Liderar, Diseñar, Automatizar, Optimizar, Negociar.',
        source: 'Harvard Business Review - Guía de CV',
        actionable: 'Comienza cada punto con un verbo fuerte en pasado o infinitivo activo.',
        appAction: { label: 'Optimizar Redacción', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_6',
        category: 'Sección Habilidades',
        badge: 'Hard & Soft Skills',
        title: 'El 89% de los fracasos de contratación se deben a habilidades blandas',
        stat: '89%',
        statLabel: 'Importancia de competencias interpersonales',
        description: 'Los reclutadores buscan equilibrio entre nivel técnico y cualidades humanas (Comunicación, Resolución de problemas).',
        source: 'Leadership IQ — "Hiring for Attitude" (20,000+ contrataciones analizadas)',
        actionable: 'Destaca de 4 a 6 habilidades técnicas clave acompañadas de 2 o 3 fortalezas blandas.',
        appAction: { label: 'Editar Habilidades', actionKey: 'GO_TO_SKILLS' }
      },
      {
        id: 'cv_7',
        category: 'Resaltado Visual',
        badge: 'Negrita Inteligente',
        title: 'El resaltado en negrita acelera la detección de claves un 65%',
        stat: '+65%',
        statLabel: 'Velocidad de escaneo visual',
        description: 'Resaltar 1 o 2 palabras clave por párrafo guía la vista del reclutador hacia tus fortalezas principales.',
        source: 'Nielsen Norman Group - UX Reading Patterns',
        actionable: 'Usa nuestra herramienta "B Negrita IA" para destacar conceptos clave automáticamente.',
        appAction: { label: 'Ejecutar Negrita IA', actionKey: 'OPEN_BOLDIFY' }
      },
      {
        id: 'cv_8',
        category: 'Revisión y Rigor',
        badge: 'Error Fatal',
        title: 'El 77% de reclutadores rechaza un CV de inmediato por faltas de ortografía',
        stat: '77%',
        statLabel: 'Rechazo inmediato por faltas',
        description: 'Una simple errata se interpreta como falta de rigor. Es la causa #1 de descarte inmediato expresada por evaluadores.',
        source: 'CareerBuilder Survey & Estudio Martin-Lacroux (2017)',
        actionable: 'Revisa minuciosamente y usa correctores antes de exportar.',
        appAction: { label: 'Revisar Experiencias', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_9',
        category: 'Diseño y Patrón F',
        badge: 'Patrón F',
        title: 'Ubica las métricas clave en las primeras 3 palabras de cada viñeta',
        stat: 'Patrón F',
        statLabel: 'Optimización de escaneo ocular',
        description: 'Los reclutadores leen en "F". Poner el número al inicio (ej: "Reducción del 25% de costes mediante...") garantiza su captura visual.',
        source: 'Nielsen Norman Group & Ladders Eye-Tracking Study',
        actionable: 'Formatea las viñetas: [Verbo de Acción] + [Métrica Cuantitativa] + [Contexto].',
        appAction: { label: 'Optimizar Viñetas', actionKey: 'GO_TO_EXPERIENCE' }
      },
      {
        id: 'cv_10',
        category: 'Parsing ATS',
        badge: 'Seguridad ATS',
        title: 'Las plantillas de dos columnas generan >60% de errores en sistemas ATS',
        stat: '>60%',
        statLabel: 'Errores de lectura en 2 columnas',
        description: 'Los ATS leen horizontalmente de izquierda a derecha. Diseños complejos de 2 columnas pueden mezclar frases y alterar fechas.',
        source: 'Jobscan ATS Parser Benchmark',
        actionable: 'Usa nuestras plantillas sobrias de una sola columna diseñadas para un parsing 100% seguro.',
        appAction: { label: 'Activar plantilla NJM', actionKey: 'SET_TEMPLATE_NJM' }
      }
    ]
  },
  letter: {
    fr: [
      {
        id: 'cl_1',
        category: 'Accroche & Impact',
        badge: 'Première Impression',
        title: 'La première phrase détermine 80% du temps de lecture',
        stat: '80%',
        statLabel: 'Décision d\'attention dès l\'accroche',
        description: 'Évitez les formules banales comme "Je vous adresse ma candidature...". Attirez l\'attention en exprimant directement votre valeur ajoutée et votre passion pour l\'entreprise.',
        source: 'Forbes Career & HR Insights',
        actionable: 'Commencez par un fait marquant ou l\'enjeu principal du poste pour lequel vous apportez une solution.',
        appAction: { label: 'Ouvrir le Générateur de Lettre IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_2',
        category: 'Longueur Idéale',
        badge: 'Format Concis',
        title: 'Les lettres de moins de 300 mots ont 50% de taux de réponse en plus',
        stat: '< 300',
        statLabel: 'Nombre de mots optimal',
        description: 'Une lettre courte de 3 à 4 paragraphes percutants est lue intégralement par 83% des recruteurs, contre seulement 12% pour les lettres dépassant une page.',
        source: 'Society for Human Resource Management (SHRM)',
        actionable: 'Structurez votre lettre en 3 blocs clairs : VOUS (l\'entreprise), MOI (mes réussites), NOUS (notre collaboration).',
        appAction: { label: 'Générer une Lettre Épurée', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_3',
        category: 'Personnalisation',
        badge: 'Ciblage Précis',
        title: '84% des recruteurs éliminent les lettres génériques de type copier-coller',
        stat: '84%',
        statLabel: 'Rejet des lettres génériques',
        description: 'Citer le nom de l\'entreprise, ses projets récents ou ses valeurs prouve que votre démarche est réfléchie et sincère.',
        source: 'CareerBuilder Recruiter Survey',
        actionable: 'Copiez-collez l\'offre d\'emploi dans notre espace Lettre pour que l\'IA personnalise automatiquement les enjeux.',
        appAction: { label: 'Auto-Cibler ma Lettre', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_4',
        category: 'Résolution de Problème',
        badge: 'Valeur Ajoutée',
        title: 'Proposer une solution concrète multiplie par 3 l\'intérêt du recruteur',
        stat: 'x3',
        statLabel: 'Impact d\'une approche centrée besoins',
        description: 'Au lieu de lister vos souhaits, expliquez quel problème vous allez résoudre pour l\'équipe dès vos 90 premiers jours.',
        source: 'Glassdoor HR Executive Study',
        actionable: 'Identifiez le principal défi de l\'entreprise (ex: croissance, refonte, expansion) et indiquez votre apport.',
        appAction: { label: 'Personnaliser avec l\'IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_5',
        category: 'Tonalité & Style',
        badge: 'Postures RH',
        title: 'Adapter la tonalité au secteur augmente la perception d\'adéquation de 72%',
        stat: '+72%',
        statLabel: 'Perception de Fit Culturel',
        description: 'Une startup privilégie un ton enthousiaste et direct, tandis qu\'un cabinet d\'avocats exige un style formel et structuré.',
        source: 'McKinsey Talent & Organization Report',
        actionable: 'Basculez entre le ton "Professionnel", "Enthousiaste" ou "Direct" dans le panneau IA de votre lettre.',
        appAction: { label: 'Choisir la Tonalité IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_6',
        category: 'Appel à l\'Action',
        badge: 'Conclusion',
        title: 'Un appel à l\'action assertif génère 35% d\'invitations d\'entretien en plus',
        stat: '+35%',
        statLabel: 'Conversions en entretien',
        description: 'Terminez en proposant de vive voix un échange (ex: "Je serais ravi d\'échanger lors d\'un entretien...") plutôt qu\'une formule d\'attente passive.',
        source: 'Inc. Magazine HR Best Practices',
        actionable: 'Proposez proactivement un court entretien téléphonique ou une rencontre dans votre paragraphe de conclusion.',
        appAction: { label: 'Rédiger ma Lettre', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_7',
        category: 'Preuve & Exemples',
        badge: 'Crédibilité',
        title: 'Illustrer par un exemple concret renforce la crédibilité de 90%',
        stat: '90%',
        statLabel: 'Indice de confiance des recruteurs',
        description: 'Toute affirmation ("Je suis rigoureux") doit être étayée par un exemple concis de projet mené avec succès.',
        source: 'Association for Psychological Science - Credibility Study',
        actionable: 'Associez chaque qualité mentionnée à une réalisation marquante récente.',
        appAction: { label: 'Créer ma Lettre', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_8',
        category: 'Lecture Réelle',
        badge: 'Trame Vous / Moi / Nous',
        title: '83% des responsables RH en PME lisent la lettre de motivation attentivement',
        stat: '83%',
        statLabel: 'Taux de lecture en PME & cabinets',
        description: 'La lettre reste un critère clé en PME et cabinets. Adopter la trame tripartite "VOUS (l\'entreprise), MOI (mes réalisations), NOUS (notre synergie)" garantit un score d\'adhésion maximal.',
        source: 'Resume Genius / Pollfish (625 responsables RH, 2026) & SHRM Study',
        actionable: 'Appliquez la structure en 3 temps Vous / Moi / Nous grâce au générateur de lettre IA.',
        appAction: { label: 'Ouvrir le Générateur de Lettre IA', actionKey: 'OPEN_COVER_LETTER' }
      }
    ],
    en: [
      {
        id: 'cl_1',
        category: 'Hook & Impact',
        badge: 'First Impression',
        title: 'The opening sentence dictates 80% of reading time',
        stat: '80%',
        statLabel: 'Attention decision at first line',
        description: 'Avoid cliché openers like "I am writing to apply for...". Hook recruiters by stating your direct value proposition and genuine passion for the company.',
        source: 'Forbes Career & HR Insights',
        actionable: 'Start with a compelling achievement or the core challenge you are equipped to solve.',
        appAction: { label: 'Open AI Cover Letter Generator', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_2',
        category: 'Ideal Length',
        badge: 'Concise Format',
        title: 'Letters under 300 words receive 50% higher response rates',
        stat: '< 300',
        statLabel: 'Optimal word count',
        description: 'A tight 3-to-4 paragraph letter is read in full by 83% of hiring managers, compared to only 12% for multi-page letters.',
        source: 'Society for Human Resource Management (SHRM)',
        actionable: 'Structure your letter into 3 clear blocks: YOU (the company), ME (my proof), WE (our synergy).',
        appAction: { label: 'Generate Concise Letter', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_3',
        category: 'Personalization',
        badge: 'Targeted Relevance',
        title: '84% of recruiters reject generic copy-pasted cover letters',
        stat: '84%',
        statLabel: 'Generic letter rejection rate',
        description: 'Referencing company goals, recent milestones, or cultural values proves your application is thoughtful and deliberate.',
        source: 'CareerBuilder Recruiter Survey',
        actionable: 'Paste the job description into our Cover Letter workspace for instant AI tailoring.',
        appAction: { label: 'Auto-Target Letter', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_4',
        category: 'Problem Solving',
        badge: 'Value Proposition',
        title: 'Offering concrete solutions triples recruiter interest',
        stat: 'x3',
        statLabel: 'Needs-centered impact boost',
        description: 'Instead of listing personal wishes, articulate what operational problem you will solve in your first 90 days.',
        source: 'Glassdoor HR Executive Study',
        actionable: 'Identify the employer\'s key growth or tech challenge and position yourself as the solution.',
        appAction: { label: 'Tailor with AI', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_5',
        category: 'Tone & Style',
        badge: 'Cultural Fit',
        title: 'Adapting tone to industry increases cultural fit perception by 72%',
        stat: '+72%',
        statLabel: 'Perceived cultural match',
        description: 'Startups respond to enthusiastic, direct phrasing, while law firms or corporate banks expect formal structure.',
        source: 'McKinsey Talent & Organization Report',
        actionable: 'Switch between "Professional", "Enthusiastic", or "Direct" tone options in the AI panel.',
        appAction: { label: 'Choose AI Voice Tone', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_6',
        category: 'Call to Action',
        badge: 'Closing Line',
        title: 'A proactive call-to-action yields 35% more interview invites',
        stat: '+35%',
        statLabel: 'Interview conversion rate',
        description: 'Conclude by expressing enthusiasm for a brief conversation rather than passive waiting formulas.',
        source: 'Inc. Magazine HR Best Practices',
        actionable: 'Proactively suggest a short call or meeting in your closing paragraph.',
        appAction: { label: 'Draft My Letter', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_7',
        category: 'Proof & Evidence',
        badge: 'Credibility',
        title: 'Illustrating statements with real examples boosts credibility by 90%',
        stat: '90%',
        statLabel: 'Recruiter trust index',
        description: 'Every self-claim ("I am detail-oriented") must be backed by a concise project example.',
        source: 'Association for Psychological Science - Credibility Study',
        actionable: 'Pair every key soft skill mentioned with a recent concrete milestone.',
        appAction: { label: 'Create Cover Letter', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_8',
        category: 'Reading Practice',
        badge: 'You / Me / We Framework',
        title: '83% of hiring managers at SMBs read cover letters carefully',
        stat: '83%',
        statLabel: 'Reading rate in SMBs & agencies',
        description: 'Cover letters remain a decisive factor in mid-sized firms. Structuring your letter using the tripartite framework "YOU (the company), ME (my proof), WE (our synergy)" achieves top relevance scores.',
        source: 'Resume Genius / Pollfish (625 HR Leaders, 2026) & SHRM Study',
        actionable: 'Apply the 3-step You / Me / We framework using our AI cover letter generator.',
        appAction: { label: 'Open AI Cover Letter Generator', actionKey: 'OPEN_COVER_LETTER' }
      }
    ],
    es: [
      {
        id: 'cl_1',
        category: 'Gancho e Impacto',
        badge: 'Primera Impresión',
        title: 'La primera frase determina el 80% del tiempo de lectura',
        stat: '80%',
        statLabel: 'Decisión de atención en la 1ª línea',
        description: 'Evita frases cliché como "Le escribo para postular a...". Atrae atención expresando tu valor directo y entusiasmo genuino.',
        source: 'Forbes Career & HR Insights',
        actionable: 'Empieza con un logro relevante o el reto principal que estás capacitado para resolver.',
        appAction: { label: 'Abrir Generador de Carta IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_2',
        category: 'Longitud Ideal',
        badge: 'Formato Conciso',
        title: 'Cartas de menos de 300 palabras tienen 50% más de respuesta',
        stat: '< 300',
        statLabel: 'Número óptimo de palabras',
        description: 'Una carta concisa de 3 a 4 párrafos es leída por el 83% de los reclutadores, frente a solo el 12% en cartas largas.',
        source: 'Society for Human Resource Management (SHRM)',
        actionable: 'Estructura tu carta en 3 bloques: USTEDES (empresa), YO (mis logros), NOSOTROS (sinergia).',
        appAction: { label: 'Generar Carta Concisa', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_3',
        category: 'Personalización',
        badge: 'Relevancia',
        title: 'El 84% de los reclutadores descarta cartas genéricas de copiar y pegar',
        stat: '84%',
        statLabel: 'Tasa de rechazo por clichés',
        description: 'Citar proyectos recientes o valores de la empresa demuestra que tu postulación es meditada y sincera.',
        source: 'Encuesta de Reclutamiento CareerBuilder',
        actionable: 'Pega la oferta de empleo en el área de Carta para que la IA personalice el contenido.',
        appAction: { label: 'Personalizar Carta', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_4',
        category: 'Resolución de Problemas',
        badge: 'Propuesta de Valor',
        title: 'Ofrecer una solución concreta triplica el interés del reclutador',
        stat: 'x3',
        statLabel: 'Aumento de interés enfocado',
        description: 'En lugar de listar deseos, explica qué problema operativo resolverás en tus primeros 90 días.',
        source: 'Estudio de Ejecutivos RH Glassdoor',
        actionable: 'Identifica el principal desafío de la empresa y posiciónate como la solución.',
        appAction: { label: 'Adaptar con IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_5',
        category: 'Tono y Estilo',
        badge: 'Ajuste Cultural',
        title: 'Adaptar el tono al sector aumenta la percepción de encaje un 72%',
        stat: '+72%',
        statLabel: 'Encaje cultural percibido',
        description: 'Las startups responden mejor a un tono directo y entusiasta, mientras empresas tradicionales exigen estructura formal.',
        source: 'Informe McKinsey Talent & Organization',
        actionable: 'Cambia entre tonos "Profesional", "Entusiasta" o "Directo" en el panel de IA.',
        appAction: { label: 'Elegir Tono de IA', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_6',
        category: 'Llamada a la Acción',
        badge: 'Cierre Proactivo',
        title: 'Llamar a la acción proactivamente genera 35% más entrevistas',
        stat: '+35%',
        statLabel: 'Conversión a entrevistas',
        description: 'Concluye proponiendo una breve conversación telefónica en lugar de fórmulas pasivas de espera.',
        source: 'Inc. Magazine HR Best Practices',
        actionable: 'Propón proactivamente una breve llamada o reunión en tu párrafo final.',
        appAction: { label: 'Redactar mi Carta', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_7',
        category: 'Pruebas y Ejemplos',
        badge: 'Credibilidad',
        title: 'Ilustrar con ejemplos reales aumenta la credibilidad un 90%',
        stat: '90%',
        statLabel: 'Índice de confianza RH',
        description: 'Cada afirmación ("Soy meticuloso") debe estar respaldada por un ejemplo conciso de proyecto exitoso.',
        source: 'Association for Psychological Science Credibility Study',
        actionable: 'Acompaña cada cualidad mencionada con un hito profesional reciente.',
        appAction: { label: 'Crear Carta de Presentación', actionKey: 'OPEN_COVER_LETTER' }
      },
      {
        id: 'cl_8',
        category: 'Lectura Real',
        badge: 'Estructura Ustedes / Yo / Nosotros',
        title: 'El 83% de los responsables RH en PYMEs lee la carta con atención',
        stat: '83%',
        statLabel: 'Tasa de lectura en PYMEs y agencias',
        description: 'La carta sigue siendo un factor decisivo en PYMEs y agencias. Estructurarla en la trama "USTEDES (empresa), YO (logros), NOSOTROS (sinergia)" logra la máxima adherencia.',
        source: 'Resume Genius / Pollfish (625 Líderes RH, 2026) y Estudio SHRM',
        actionable: 'Aplica la estructura en 3 tiempos Ustedes / Yo / Nosotros con nuestro generador de carta IA.',
        appAction: { label: 'Abrir Generador de Carta IA', actionKey: 'OPEN_COVER_LETTER' }
      }
    ]
  }
};

export function getTipsList(category = 'creator', language = 'fr') {
  const langKey = (language === 'en' || language === 'es') ? language : 'fr';
  const catKey = (category === 'cv' || category === 'letter') ? category : 'creator';
  return DAILY_TIPS_DATA[catKey]?.[langKey] || DAILY_TIPS_DATA[catKey]?.fr || [];
}

export function getDailyTip(category = 'creator', dayIndex = null, language = 'fr') {
  const tips = getTipsList(category, language);
  if (dayIndex !== null && dayIndex >= 0 && dayIndex < tips.length) {
    return tips[dayIndex];
  }
  const today = new Date();
  const dayOfWeek = today.getDay();
  const idx = dayOfWeek % tips.length;
  return tips[idx];
}
