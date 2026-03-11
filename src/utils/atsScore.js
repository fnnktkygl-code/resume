export function computeAtsScore(data) {
  let score = 0;
  const tips = [];
  const p = data.personal;

  // Personal info (35 pts)
  if (p.name) score += 10; else tips.push('Add your full name');
  if (p.email) score += 8; else tips.push('Add an email address');
  if (p.phone) score += 7; else tips.push('Add a phone number');
  if (p.location) score += 5; else tips.push('Add your location');
  if (p.linkedin) score += 5;

  // Summary (10 pts)
  if (data.summary && data.summary.length > 40) score += 10;
  else tips.push('Write a professional summary (50+ characters)');

  // Experience (30 pts)
  const validExp = data.experience.filter(e => e.company && e.title);
  if (validExp.length > 0) score += 12;
  else tips.push('Add at least one work experience');

  let hasMetrics = false;
  let hasDates = true;
  validExp.forEach(e => {
    e.bullets.forEach(b => { if (/\d+%|\$[\d,]+|\d+ /.test(b)) hasMetrics = true; });
    if (!e.startMonth || !e.startYear) hasDates = false;
    if (!e.current && (!e.endMonth || !e.endYear)) hasDates = false;
  });
  if (hasMetrics) score += 12;
  else if (validExp.length > 0) tips.push('Add quantifiable metrics (%, $, numbers) to bullets');
  if (hasDates && validExp.length > 0) score += 6;
  else if (validExp.length > 0) tips.push('Use Month/Year format for all dates');

  // Education (10 pts)
  const validEdu = data.education.filter(e => e.institution && e.degree);
  if (validEdu.length > 0) score += 10;
  else tips.push('Add your education');

  // Skills (10 pts)
  if (data.skills.technical && data.skills.technical.split(',').length >= 3) score += 10;
  else tips.push('List at least 3 technical skills');

  // Projects (bonus 3 pts)
  const validProj = data.projects.filter(p => p.name && p.description);
  if (validProj.length > 0) score += 3;

  // Certifications (bonus 2 pts)
  const validCert = data.certifications.filter(c => c.name && c.issuer);
  if (validCert.length > 0) score += 2;

  return { score: Math.min(score, 100), tips: tips.slice(0, 5) };
}
