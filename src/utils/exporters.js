import { sanitizeResumeData } from './sanitize';

export function exportMarkdown(data) {
  const p = data.personal;
  const h = data.headings || {};
  const order = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  let md = '';
  if (p.name) md += `# ${p.name}\n`;
  if (p.tagline) md += `*${p.tagline}*\n`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).join(' | ');
  if (contact) md += `${contact}\n\n`;

  const fmtDate = (m, y) => [m, y].filter(Boolean).join(' ');

  const sectionGenerators = {
    summary: () => {
      if (!data.summary) return '';
      return `## ${h.summary || 'Summary'}\n${data.summary}\n\n`;
    },
    experience: () => {
      const validExp = data.experience.filter(e => e.company || e.title);
      if (validExp.length === 0) return '';
      let s = `## ${h.experience || 'Work Experience'}\n`;
      validExp.forEach(exp => {
        const dateStr = `${fmtDate(exp.startMonth, exp.startYear)} — ${exp.current ? (h.present || 'Present') : fmtDate(exp.endMonth, exp.endYear)}`;
        s += `### ${exp.company}\n**${exp.title}** | ${dateStr}\n`;
        exp.bullets.filter(Boolean).forEach(b => { s += `- ${b}\n`; });
        s += '\n';
      });
      return s;
    },
    education: () => {
      const validEdu = data.education.filter(e => e.institution || e.degree);
      if (validEdu.length === 0) return '';
      let s = `## ${h.education || 'Education'}\n`;
      validEdu.forEach(edu => {
        s += `**${edu.institution}** | ${[edu.degree, edu.field].filter(Boolean).join(', ')} | ${edu.startYear}–${edu.endYear}\n`;
      });
      return s + '\n';
    },
    skills: () => {
      if (!data.skills.technical && !data.skills.soft && !data.skills.languages) return '';
      let s = `## ${h.skills || 'Skills'}\n`;
      if (data.skills.technical) s += `**${h.technical || 'Technical:'}** ${data.skills.technical}\n`;
      if (data.skills.soft) s += `**${h.interpersonal || 'Interpersonal:'}** ${data.skills.soft}\n`;
      if (data.skills.languages) s += `**${h.languages || 'Languages:'}** ${data.skills.languages}\n`;
      return s + '\n';
    },
    projects: () => {
      const validProj = data.projects.filter(pr => pr.name);
      if (validProj.length === 0) return '';
      let s = `## ${h.projects || 'Projects'}\n`;
      validProj.forEach(pr => {
        s += `### ${pr.name}${pr.link ? ` — ${pr.link}` : ''}\n`;
        if (pr.description) s += `${pr.description}\n`;
        if (pr.techStack) s += `**Tech:** ${pr.techStack}\n`;
        pr.highlights.filter(Boolean).forEach(hl => { s += `- ${hl}\n`; });
        s += '\n';
      });
      return s;
    },
    certifications: () => {
      const validCert = data.certifications.filter(c => c.name);
      if (validCert.length === 0) return '';
      let s = `## ${h.certifications || 'Certifications'}\n`;
      validCert.forEach(c => {
        s += `- **${c.name}** — ${c.issuer}${c.date ? ` (${c.date})` : ''}${c.credentialUrl ? ` | ${c.credentialUrl}` : ''}\n`;
      });
      return s + '\n';
    }
  };

  order.forEach(sectionKey => {
    if (sectionGenerators[sectionKey]) {
      md += sectionGenerators[sectionKey]();
    }
  });

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
