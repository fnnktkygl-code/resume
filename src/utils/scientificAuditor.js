/**
 * Real-Time Scientific Auditor & Nudge Engine
 * Evaluates candidate data against verified scientific HR benchmarks (Conseils CV Basés sur Études.md)
 */

export function auditResumeData(resumeData, language = 'fr') {
  const nudges = [];
  if (!resumeData) return nudges;

  const isEn = language === 'en';
  const isEs = language === 'es';

  // 1. Informal Email Check (van Toorenburg et al., 2015)
  const email = resumeData.personal?.email || '';
  if (email) {
    const username = email.split('@')[0] || '';
    const informalRegex = /(cool|boss|gamer|dark|killer|angel|prince|princess|lover|xX|1234|69|420)/i;
    if (informalRegex.test(username) || username.length < 4) {
      nudges.push({
        id: 'nudge_email',
        category: 'cr_5',
        type: 'warning',
        icon: '✉️',
        title: isEn ? 'Informal Email Warning' : isEs ? 'Advertencia de Email Informal' : 'Alerte E-mail Informel',
        message: isEn 
          ? 'van Toorenburg (2015) Study: Using an informal email address reduces perceived conscientiousness as severely as 5 spelling mistakes. Prefer firstname.lastname@provider.com.'
          : isEs
          ? 'Estudio van Toorenburg (2015): Usar un email informal reduce la percepción de rigor tanto como 5 faltas de ortografía. Utiliza nombre.apellido@proveedor.com.'
          : 'Étude van Toorenburg (2015) : L\'usage d\'un e-mail informel dégrade la perception de rigueur autant que 5 fautes d\'orthographe. Privilégiez prenom.nom@provider.com.',
        actionKey: 'GO_TO_PERSONAL'
      });
    }
  }

  // 2. LinkedIn Digital Anchor Check (ResumeGo 24k Study)
  const linkedin = resumeData.personal?.linkedin || '';
  if (!linkedin.trim()) {
    nudges.push({
      id: 'nudge_linkedin',
      category: 'cr_6',
      type: 'suggestion',
      icon: '🔗',
      title: isEn ? 'LinkedIn Link Recommendation' : isEs ? 'Recomendación Enlace LinkedIn' : 'Conseil Lien LinkedIn',
      message: isEn
        ? 'ResumeGo Field Study (24k apps): Including a complete LinkedIn URL boosts interview callback rate by +71%.'
        : isEs
        ? 'Estudio ResumeGo (24k solicitudes): Incluir un enlace a LinkedIn completo aumenta un +71% las llamadas a entrevista.'
        : 'Étude ResumeGo (24k candidatures) : Ajouter un profil LinkedIn complet augmente le taux de rappel de +71%.',
      actionKey: 'GO_TO_PERSONAL'
    });
  }

  // 3. Front-Loading & Metrics Check (Ladders Eye-Tracking & NACE)
  let totalBullets = 0;
  let bulletsWithMetrics = 0;
  let mispositionedMetrics = 0;

  resumeData.experience?.forEach((exp) => {
    exp.bullets?.forEach((bullet) => {
      totalBullets++;
      const hasNumber = /\b\d+(?:[\.,]\d+)?\s*(?:%|k|M|k€|€|\$|k\$|ans|mois|users|projets|collaborateurs|personnes)?\b/i.test(bullet);
      if (hasNumber) {
        bulletsWithMetrics++;
        // Check if metric is within the first 4 words
        const words = bullet.trim().split(/\s+/).slice(0, 4).join(' ');
        const isFrontLoaded = /\b\d+(?:[\.,]\d+)?\s*(?:%|k|M|k€|€|\$|k\$|users|projets|collaborateurs|personnes)?\b/i.test(words);
        if (!isFrontLoaded) {
          mispositionedMetrics++;
        }
      }
    });
  });

  if (totalBullets > 0 && bulletsWithMetrics === 0) {
    nudges.push({
      id: 'nudge_no_metrics',
      category: 'cv_3',
      type: 'warning',
      icon: '📊',
      title: isEn ? 'Quantified Impact Missing' : isEs ? 'Faltan Métricas Cuantitativas' : 'Absence de Données Chiffrées',
      message: isEn
        ? 'NACE Study: Quantifying achievements increases callback rates by 40%. Add at least 1 concrete metric (%, budget, team size) per role.'
        : isEs
        ? 'Estudio NACE: Cuantificar tus logros aumenta las llamadas un 40%. Añade al menos 1 métrica concreta (%, presupuesto) por puesto.'
        : 'Étude NACE : Quantifier vos réussites augmente de 40% vos chances d\'entretien. Intégrez au moins 1 chiffre (%, budget, volume) par poste.',
      actionKey: 'GO_TO_EXPERIENCE'
    });
  } else if (mispositionedMetrics > 0) {
    nudges.push({
      id: 'nudge_front_loading',
      category: 'cv_12',
      type: 'suggestion',
      icon: '👁️',
      title: isEn ? 'Front-Loading Eye-Tracking Tip' : isEs ? 'Consejo de Lectura F-Pattern' : 'Conseil Oculométrie (Pattern en F)',
      message: isEn
        ? 'Ladders Eye-Tracking Study: Recruiters scan in an F-pattern. Place key numbers within the FIRST 3 WORDS of bullet points to capture foveal vision.'
        : isEs
        ? 'Estudio Ladders Eye-Tracking: Los reclutadores leen en "F". Ubica los números en las PRIMERAS 3 PALABRAS de cada viñeta.'
        : 'Étude Ladders Eye-Tracking : Les recruteurs lisent en "F". Placez vos chiffres dès les 3 PREMIERS MOTS de chaque puce pour les capter en 7s.',
      actionKey: 'GO_TO_EXPERIENCE'
    });
  }

  // 4. Experience Seniority vs. Length Check (ResumeGo 482 Recruiters Study)
  const expCount = resumeData.experience?.length || 0;
  if (expCount >= 4) {
    nudges.push({
      id: 'nudge_length_2page',
      category: 'cv_4',
      type: 'info',
      icon: '📄',
      title: isEn ? '2-Page Resume Recommendation' : isEs ? 'Recomendación 2 Páginas' : 'Conseil Format 2 Pages',
      message: isEn
        ? 'ResumeGo Field Study (482 recruiters): 2-page resumes are preferred 2.3x more for experienced profiles (>5 yrs) and rated 21% higher in quality.'
        : isEs
        ? 'Estudio ResumeGo (482 reclutadores): El CV de 2 páginas es preferido 2,3 veces más para perfiles experimentados (>5 años).'
        : 'Étude ResumeGo (482 RH) : Le CV 2 pages est préféré 2,3x plus souvent pour les profils confirmés (>5 ans d\'XP) et noté +21% en qualité.',
      actionKey: 'TOGGLE_COMPACT'
    });
  }

  return nudges;
}

export function auditCoverLetterText(letterText, language = 'fr') {
  const nudges = [];
  if (!letterText) return nudges;

  const isEn = language === 'en';
  const isEs = language === 'es';

  const wordCount = letterText.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount > 320) {
    nudges.push({
      id: 'nudge_cl_wordcount',
      category: 'cl_2',
      type: 'warning',
      icon: '📝',
      title: isEn ? 'Cover Letter Over 300 Words' : isEs ? 'Carta de Más de 300 Palabras' : 'Lettre Dépassant 300 Mots',
      message: isEn
        ? `Current count: ${wordCount} words. SHRM Study: Cover letters under 300 words achieve an 83% full reading rate vs 12% for long letters.`
        : isEs
        ? `Recuento actual: ${wordCount} palabras. Estudio SHRM: Cartas de menos de 300 palabras se leen al completo en el 83% de los casos.`
        : `Nombre actuel : ${wordCount} mots. Étude SHRM : Les lettres de moins de 300 mots ont un taux de lecture complète de 83% contre 12% si trop longues.`,
      actionKey: 'OPEN_COVER_LETTER'
    });
  }

  return nudges;
}
