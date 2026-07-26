export function computeAtsScore(data) {
  let score = 0;
  const tips = [];
  const p = data.personal;

  // --- Detect profile domain from title / summary / experience ---
  const profileSignals = [
    p.title || '',
    data.summary || '',
    ...data.experience.flatMap(e => [e.title || '', ...(e.bullets || [])]),
    data.skills?.technical || ''
  ].join(' ').toLowerCase();

  const isTech = /develop|engineer|software|devops|data scien|full.?stack|front.?end|back.?end|cloud|sre|sysadmin|cyber|infra|qa|test.?auto/i.test(profileSignals);
  const isBusiness = /market|business|sales|financ|consult|account|manag|product|strateg|analyst|revenue|growth/i.test(profileSignals);
  const isCreative = /design|ux|ui|graphic|art|photo|video|content|writer|editor|illustr|brand/i.test(profileSignals);
  const isHealthcare = /nurse|doctor|medic|pharm|clinic|patient|health|soins|infirm|aide.?soignant|chirurg/i.test(profileSignals);
  const isEducation = /teach|professor|éducati|formateur|enseignant|tutor|instruct|pédagog/i.test(profileSignals);

  // Personal info (35 pts)
  if (p.name) score += 10; else tips.push('ats_tip_add_name');
  if (p.email) score += 8; else tips.push('ats_tip_add_email');
  if (p.phone) score += 7; else tips.push('ats_tip_add_phone');
  if (p.location) score += 5; else tips.push('ats_tip_add_location');
  if (p.linkedin) score += 5;

  // Summary (10 pts)
  if (data.summary && data.summary.length > 40) score += 10;
  else tips.push('ats_tip_add_summary');

  // Experience (30 pts)
  const validExp = data.experience.filter(e => e.company && e.title);
  if (validExp.length > 0) score += 12;
  else tips.push('ats_tip_add_experience');

  let hasMetrics = false;
  let hasDates = true;
  validExp.forEach(e => {
    e.bullets.forEach(b => { if (/\d+%|\$[\d,]+|\d+ /.test(b)) hasMetrics = true; });
    if (!e.startMonth || !e.startYear) hasDates = false;
    if (!e.current && (!e.endMonth || !e.endYear)) hasDates = false;
  });
  if (hasMetrics) {
    score += 12;
  } else if (validExp.length > 0) {
    // Adapt the tip key to the detected domain
    if (isHealthcare) {
      tips.push('ats_tip_metrics_health');
    } else if (isEducation) {
      tips.push('ats_tip_metrics_education');
    } else if (isCreative) {
      tips.push('ats_tip_metrics_creative');
    } else if (isBusiness) {
      tips.push('ats_tip_metrics_business');
    } else if (isTech) {
      tips.push('ats_tip_metrics_tech');
    } else {
      tips.push('ats_tip_metrics_generic');
    }
  }
  if (hasDates && validExp.length > 0) score += 6;
  else if (validExp.length > 0) tips.push('ats_tip_dates');

  // Education (10 pts)
  const validEdu = data.education.filter(e => e.institution && e.degree);
  if (validEdu.length > 0) score += 10;
  else tips.push('ats_tip_add_education');

  // Skills (10 pts)
  if (data.skills.technical && data.skills.technical.split(',').length >= 3) score += 10;
  else tips.push('ats_tip_add_skills');

  // Projects (bonus 3 pts)
  const validProj = data.projects.filter(p => p.name && p.description);
  if (validProj.length > 0) score += 3;

  // Certifications (bonus 2 pts)
  const validCert = data.certifications.filter(c => c.name && c.issuer);
  if (validCert.length > 0) score += 2;

  // --- Live ATS Match Score (Feature 1) ---
  if (data.targetJobDescription && data.targetJobDescription.trim().length > 20) {
    // Priority 1: Use AI-calculated targetJobAnalysis if available
    if (data.targetJobAnalysis && typeof data.targetJobAnalysis.matchScore === 'number') {
      const aiScore = data.targetJobAnalysis.matchScore;
      const baseScore = Math.min(score, 100);
      const blendedScore = Math.round((baseScore * 0.2) + (aiScore * 0.8));

      const matchTips = [];
      if (data.targetJobAnalysis.missingKeywords?.length > 0) {
        matchTips.push({
          type: 'missing_keywords',
          keywords: data.targetJobAnalysis.missingKeywords.slice(0, 5)
        });
      }

      return { score: blendedScore, tips: [...matchTips, ...tips].slice(0, 5), isMatchScore: true };
    }

    // Priority 2: Local heuristic fallback with heavy noise filtering
    const stopWords = new Set([
      // English stop words & corporate boilerplate
      'the', 'and', 'for', 'with', 'that', 'this', 'you', 'are', 'your', 'from', 'will', 'have',
      'experience', 'work', 'working', 'team', 'skills', 'can', 'not', 'our', 'all', 'any', 'but',
      'about', 'company', 'role', 'looking', 'candidate', 'must', 'should', 'ability', 'strong',
      'years', 'year', 'preferred', 'required', 'responsibilities', 'qualifications', 'description',
      'job', 'join', 'help', 'make', 'more', 'other', 'their', 'them', 'they', 'which', 'what',
      
      // French stop words & corporate boilerplate
      'propos', 'offre', 'emploi', 'ensemble', 'construisons', 'chez', 'nous', 'présents', 'notre',
      'votre', 'entreprise', 'postuler', 'mission', 'profil', 'recherche', 'bureau', 'pays', 'équipe',
      'compétence', 'compétences', 'opportunité', 'opportunités', 'candidat', 'rôle', 'role',
      'plus', 'pour', 'dans', 'cœur', 'futur', 'ancrage', 'local', 'transformé', 'défis', 'aujourd',
      'durables', 'grâce', 'vers', 'sans', 'tous', 'toutes', 'fait', 'faire', 'ainsi', 'afin',
      'comme', 'aussi', 'avec', 'cette', 'sont', 'être', 'avoir', 'des', 'les', 'une', 'un',
      'qui', 'que', 'pas', 'par', 'est', 'sur', 'dans', 'aux', 'du', 'au', 'en', 'le', 'la',
      'bénéficiez', 'rejoindre', 'poste', 'niveau', 'également', 'ainsi', 'afin', 'dans', 'grâce',
      'situé', 'contexte', 'cadre', 'proposer', 'assurer', 'partie', 'auprès', 'selon', 'souhaité',
      'avenir', 'durable', 'durables', 'reden', 'plaçons', 'électricité', 'responsable', 'structure',
      'agile', 'croissance', 'ambition', 'territoires', 'bâtir', 'culture', 'environnement',
      'multiculturel', 'collaboratif', 'valorisation', 'fondations', 'impact', 'accélérer', 'véritable',
      'force', 'respect', 'inclusion', 'diversité', 'talents', 'animée', 'positif', 'tournée',
      'accompagnant', 'recherchons', 'basé', 'sein', 'pôle', 'opération', 'rattaché', 'contribuez',
      'groupe', 'analysant', 'identifiant', 'tendances', 'anomalies', 'titre', 'missions', 'suivi',
      'activités', 'indicateurs', 'causes', 'pannes', 'durée', 'équipements', 'définir', 'piloter',
      'plans', 'actions', 'visant', 'assets', 'participer', 'définition', 'reporting', 'technique',
      'outils', 'adaptés', 'existantes', 'processus', 'prioriser', 'préventives', 'nécessaires',
      'titulaire', 'minimum', 'spécialisation', 'systèmes', 'première', 'disposez', 'notions', 'atout',
      'obligatoire', 'au-delà', 'technologie', 'solides', 'principes', 'fonctionnement', 'capables',
      'interpréter', 'prévoir'
    ]);
    const jdWords = data.targetJobDescription.toLowerCase().match(/[a-zÀ-ÿ]{4,}/g) || [];
    const keywords = [...new Set(jdWords.filter(w => !stopWords.has(w)))];

    if (keywords.length > 0) {
      let matchCount = 0;
      const missingKeywords = [];
      keywords.forEach(kw => {
        if (profileSignals.includes(kw)) {
          matchCount++;
        } else {
          missingKeywords.push(kw);
        }
      });

      const matchPercentage = Math.round((matchCount / keywords.length) * 100);
      
      // Blend structure (30%) with local keyword match (70%)
      const baseScore = Math.min(score, 100);
      const blendedScore = Math.round((baseScore * 0.3) + (matchPercentage * 0.7));

      const matchTips = [];
      if (missingKeywords.length > 0) {
        matchTips.push({
          type: 'missing_keywords',
          keywords: missingKeywords.slice(0, 5)
        });
      }
      
      return { score: blendedScore, tips: [...matchTips, ...tips].slice(0, 5), isMatchScore: true };
    }
  }

  return { score: Math.min(score, 100), tips: tips.slice(0, 5), isMatchScore: false };
}
