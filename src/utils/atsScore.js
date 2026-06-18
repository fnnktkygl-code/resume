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

  return { score: Math.min(score, 100), tips: tips.slice(0, 5) };
}
