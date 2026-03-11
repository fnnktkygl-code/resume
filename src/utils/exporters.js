import { sanitizeResumeData } from './sanitize';

export function exportMarkdown(data) {
  const p = data.personal;
  const h = data.headings || {};
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const fmtDate = (m, y) => [m, y].filter(Boolean).join(' ');

  let md = '';
  if (p.name) md += `# ${p.name}\n`;
  if (p.tagline) md += `*${p.tagline}*\n`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).join(' | ');
  if (contact) md += `${contact}\n\n`;
  if (data.summary) md += `## ${h.summary || 'Summary'}\n${data.summary}\n\n`;

  if (validExp.length > 0) {
    md += `## ${h.experience || 'Work Experience'}\n`;
    validExp.forEach(exp => {
      const dateStr = `${fmtDate(exp.startMonth, exp.startYear)} — ${exp.current ? (h.present || 'Present') : fmtDate(exp.endMonth, exp.endYear)}`;
      md += `### ${exp.company}\n**${exp.title}** | ${dateStr}\n`;
      exp.bullets.filter(Boolean).forEach(b => { md += `- ${b}\n`; });
      md += '\n';
    });
  }

  if (validEdu.length > 0) {
    md += `## ${h.education || 'Education'}\n`;
    validEdu.forEach(edu => {
      md += `**${edu.institution}** | ${[edu.degree, edu.field].filter(Boolean).join(', ')} | ${edu.startYear}–${edu.endYear}\n`;
    });
    md += '\n';
  }

  if (data.skills.technical || data.skills.soft || data.skills.languages) {
    md += `## ${h.skills || 'Skills'}\n`;
    if (data.skills.technical) md += `**${h.technical || 'Technical:'}** ${data.skills.technical}\n`;
    if (data.skills.soft) md += `**${h.interpersonal || 'Interpersonal:'}** ${data.skills.soft}\n`;
    if (data.skills.languages) md += `**${h.languages || 'Languages:'}** ${data.skills.languages}\n`;
    md += '\n';
  }

  if (validProj.length > 0) {
    md += `## ${h.projects || 'Projects'}\n`;
    validProj.forEach(pr => {
      md += `### ${pr.name}${pr.link ? ` — ${pr.link}` : ''}\n`;
      if (pr.description) md += `${pr.description}\n`;
      if (pr.techStack) md += `**Tech:** ${pr.techStack}\n`;
      pr.highlights.filter(Boolean).forEach(h => { md += `- ${h}\n`; });
      md += '\n';
    });
  }

  if (validCert.length > 0) {
    md += `## ${h.certifications || 'Certifications'}\n`;
    validCert.forEach(c => {
      md += `- **${c.name}** — ${c.issuer}${c.date ? ` (${c.date})` : ''}${c.credentialUrl ? ` | ${c.credentialUrl}` : ''}\n`;
    });
  }

  download(md, `${(p.name || 'resume').replace(/\s+/g, '_')}_resume.md`, 'text/markdown');
}

export function exportJson(data) {
  const json = JSON.stringify(data, null, 2);
  download(json, `${(data.personal.name || 'resume').replace(/\s+/g, '_')}_data.json`, 'application/json');
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const sanitized = sanitizeResumeData(parsed);
        resolve(sanitized);
      } catch (err) {
        reject(new Error('Invalid JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
