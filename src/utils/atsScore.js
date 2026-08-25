/**
 * Scientific & Deterministic ATS Scoring Engine.
 * Provides radical transparency by clearly separating:
 * 1. Structural ATS Health Score (Machine readability, Harvard XYZ metrics, canonical sections)
 * 2. Targeted Job Match Score (Semantic cosine similarity, Hard skills keyword coverage)
 */

export function computeAtsScore(data) {
  if (!data) return { score: 0, structuralScore: 0, tips: ['ats_tip_add_name', 'ats_tip_add_email', 'ats_tip_add_phone', 'ats_tip_add_location', 'ats_tip_add_summary'], breakdown: { contact: 0, summary: 0, experience: 0, skills: 0, education: 0, totalStructural: 0 }, isMatchScore: false };

  let score = 0;
  const tips = [];
  const p = data.personal || {};
  const expList = Array.isArray(data.experience) ? data.experience : [];
  const eduList = Array.isArray(data.education) ? data.education : [];
  const skillsData = data.skills || {};

  // --- Detect profile domain from title / summary / experience ---
  const profileSignals = [
    p.title || '',
    data.summary || '',
    ...expList.flatMap(e => [e.title || '', ...(e.bullets || [])]),
    skillsData.technical || ''
  ].join(' ').toLowerCase();

  const isTech = /develop|engineer|software|devops|data scien|full.?stack|front.?end|back.?end|cloud|sre|sysadmin|cyber|infra|qa|test.?auto/i.test(profileSignals);
  const isBusiness = /market|business|sales|financ|consult|account|manag|product|strateg|analyst|revenue|growth/i.test(profileSignals);
  const isCreative = /design|ux|ui|graphic|art|photo|video|content|writer|editor|illustr|brand/i.test(profileSignals);
  const isHealthcare = /nurse|doctor|medic|pharm|clinic|patient|health|soins|infirm|aide.?soignant|chirurg/i.test(profileSignals);
  const isEducation = /teach|professor|éducati|formateur|enseignant|tutor|instruct|pédagog/i.test(profileSignals);

  // 1. Personal info (35 pts)
  let contactPts = 0;
  if (p.name && p.name.trim().length > 0) contactPts += 10; else tips.push('ats_tip_add_name');
  if (p.email && p.email.trim().length > 0) contactPts += 8; else tips.push('ats_tip_add_email');
  if (p.phone && p.phone.trim().length > 0) contactPts += 7; else tips.push('ats_tip_add_phone');
  if (p.location && p.location.trim().length > 0) contactPts += 5; else tips.push('ats_tip_add_location');
  if (p.linkedin && p.linkedin.trim().length > 0) contactPts += 5;
  score += contactPts;

  // 2. Summary (10 pts)
  let summaryPts = 0;
  if (data.summary && data.summary.trim().length > 40) {
    summaryPts += 10;
  } else {
    tips.push('ats_tip_add_summary');
  }
  score += summaryPts;

  // 3. Experience (30 pts)
  let expPts = 0;
  const validExp = expList.filter(e => e && (e.company || e.title) && !e.isSpacer);
  if (validExp.length > 0) {
    expPts += 12;
  } else {
    tips.push('ats_tip_add_experience');
  }

  let hasMetrics = false;
  let hasDates = true;
  validExp.forEach(e => {
    const bullets = Array.isArray(e.bullets) ? e.bullets : [];
    bullets.forEach(b => {
      if (b && (/\d+%|\$[\d,]+|\b\d+\b\s*(?:users|clients|projets|projects|ms|sec|M€|k€|\$|M|k|fois|x|ans|years|%)/i.test(b))) {
        hasMetrics = true;
      }
    });
    if (!e.startMonth || !e.startYear) hasDates = false;
    if (!e.current && (!e.endMonth || !e.endYear)) hasDates = false;
  });

  if (hasMetrics) {
    expPts += 12;
  } else if (validExp.length > 0) {
    if (isHealthcare) tips.push('ats_tip_metrics_health');
    else if (isEducation) tips.push('ats_tip_metrics_education');
    else if (isCreative) tips.push('ats_tip_metrics_creative');
    else if (isBusiness) tips.push('ats_tip_metrics_business');
    else if (isTech) tips.push('ats_tip_metrics_tech');
    else tips.push('ats_tip_metrics_generic');
  }

  if (hasDates && validExp.length > 0) {
    expPts += 6;
  } else if (validExp.length > 0) {
    tips.push('ats_tip_dates');
  }
  score += expPts;

  // 4. Education (10 pts)
  let eduPts = 0;
  const validEdu = eduList.filter(e => e && (e.institution || e.degree) && !e.isSpacer);
  if (validEdu.length > 0) {
    eduPts += 10;
  } else {
    tips.push('ats_tip_add_education');
  }
  score += eduPts;

  // 5. Skills (10 pts)
  let skillsPts = 0;
  const techSkills = skillsData.technical || '';
  if (techSkills && techSkills.split(',').filter(s => s.trim()).length >= 3) {
    skillsPts += 10;
  } else {
    tips.push('ats_tip_add_skills');
  }
  score += skillsPts;

  // 6. Projects (bonus 3 pts)
  const validProj = (data.projects || []).filter(pr => pr && pr.name && pr.description && !pr.isSpacer);
  let projPts = validProj.length > 0 ? 3 : 0;
  score += projPts;

  // 7. Certifications (bonus 2 pts)
  const validCert = (data.certifications || []).filter(c => c && c.name && c.issuer && !c.isSpacer);
  let certPts = validCert.length > 0 ? 2 : 0;
  score += certPts;

  const finalStructuralScore = Math.min(100, Math.max(0, score));

  const breakdown = {
    contact: contactPts,
    summary: summaryPts,
    experience: expPts,
    skills: skillsPts,
    education: eduPts,
    projects: projPts,
    certifications: certPts,
    totalStructural: finalStructuralScore
  };

  // --- Live ATS Match Score (AI-Driven) ---
  if (data.targetJobDescription && data.targetJobDescription.trim().length > 20) {
    if (data.targetJobAnalysis && typeof data.targetJobAnalysis.matchScore === 'number') {
      const aiScore = data.targetJobAnalysis.matchScore;
      const blendedScore = Math.round((finalStructuralScore * 0.2) + (aiScore * 0.8));

      const matchTips = [];
      if (data.targetJobAnalysis.missingKeywords?.length > 0) {
        matchTips.push({
          type: 'missing_keywords',
          keywords: data.targetJobAnalysis.missingKeywords.slice(0, 5)
        });
      }

      return {
        score: blendedScore,
        structuralScore: finalStructuralScore,
        matchScore: aiScore,
        tips: [...matchTips, ...tips].slice(0, 5),
        breakdown: { ...breakdown, matchScore: aiScore },
        isMatchScore: true
      };
    }
  }

  return {
    score: finalStructuralScore,
    structuralScore: finalStructuralScore,
    tips: tips.slice(0, 5),
    breakdown,
    isMatchScore: false
  };
}
