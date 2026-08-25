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

  if (typeof document !== 'undefined') {
    download(md, `${(p?.name || 'resume').replace(/\s+/g, '_')}_resume.md`, 'text/markdown');
  }
  return md;
}

export function exportJson(data) {
  const json = JSON.stringify(data, null, 2);
  if (typeof document !== 'undefined') {
    download(json, `${(data?.personal?.name || 'resume').replace(/\s+/g, '_')}_data.json`, 'application/json');
  }
  return json;
}

export function exportDocx(data) {
  const p = data.personal;
  const h = data.headings || {};
  const order = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${p.name || 'Resume'}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  @page {
    size: 8.5in 11in;
    margin: 0.75in 0.75in 0.75in 0.75in;
  }
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.25;
    color: #333333;
  }
  h1 {
    font-size: 20pt;
    font-weight: bold;
    color: #111111;
    margin: 0 0 4pt 0;
    text-transform: uppercase;
  }
  .tagline {
    font-size: 11pt;
    font-style: italic;
    color: #666666;
    margin: 0 0 6pt 0;
  }
  .contact-info {
    font-size: 9.5pt;
    color: #555555;
    margin-bottom: 18pt;
    border-bottom: 1.5pt solid #1B6B3A;
    padding-bottom: 6pt;
  }
  h2 {
    font-size: 13pt;
    font-weight: bold;
    color: #1B6B3A;
    margin: 16pt 0 6pt 0;
    text-transform: uppercase;
    border-bottom: 1px solid #E2E0DA;
    padding-bottom: 2pt;
  }
  .section {
    margin-bottom: 12pt;
  }
  .company-name {
    font-weight: bold;
    font-size: 11.5pt;
    color: #111111;
  }
  .job-title {
    font-style: italic;
    color: #444444;
  }
  .date-col {
    color: #666666;
    font-size: 10pt;
  }
  .bullets {
    margin: 4pt 0 8pt 0;
    padding-left: 18pt;
  }
  .bullet-item {
    margin-bottom: 3pt;
    font-size: 10.5pt;
  }
  .skill-label {
    font-weight: bold;
    color: #111111;
  }
</style>
</head>
<body>
`;

  if (p.name) html += `<h1>${p.name}</h1>`;
  if (p.tagline) html += `<div class="tagline">${p.tagline}</div>`;
  
  const contact = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).join('  |  ');
  if (contact) html += `<div class="contact-info">${contact}</div>`;

  const fmtDate = (m, y) => [m, y].filter(Boolean).join(' ');

  const sectionGenerators = {
    summary: () => {
      if (!data.summary) return '';
      return `<h2>${h.summary || 'Summary'}</h2>
<div class="section" style="font-size: 10.5pt; text-align: justify;">${data.summary}</div>`;
    },
    experience: () => {
      const validExp = data.experience.filter(e => e.company || e.title);
      if (validExp.length === 0) return '';
      let s = `<h2>${h.experience || 'Work Experience'}</h2>`;
      validExp.forEach(exp => {
        const dateStr = `${fmtDate(exp.startMonth, exp.startYear)} — ${exp.current ? (h.present || 'Present') : fmtDate(exp.endMonth, exp.endYear)}`;
        s += `<div class="section">
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom: 2pt;">
  <tr>
    <td style="text-align:left;"><span class="company-name">${exp.company}</span>, <span class="job-title">${exp.title}</span></td>
    <td style="text-align:right;" class="date-col">${dateStr}</td>
  </tr>
</table>
<ul class="bullets">`;
        exp.bullets.filter(Boolean).forEach(b => {
          s += `<li class="bullet-item">${b}</li>`;
        });
        s += `</ul></div>`;
      });
      return s;
    },
    education: () => {
      const validEdu = data.education.filter(e => e.institution || e.degree);
      if (validEdu.length === 0) return '';
      let s = `<h2>${h.education || 'Education'}</h2>`;
      validEdu.forEach(edu => {
        s += `<div class="section">
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
  <tr>
    <td style="text-align:left;"><span class="company-name">${edu.institution}</span> — <span class="job-title">${[edu.degree, edu.field].filter(Boolean).join(', ')}</span></td>
    <td style="text-align:right;" class="date-col">${edu.startYear ? `${edu.startYear} – ${edu.endYear || ''}` : ''}</td>
  </tr>
</table>
</div>`;
      });
      return s;
    },
    skills: () => {
      if (!data.skills.technical && !data.skills.soft && !data.skills.languages) return '';
      let s = `<h2>${h.skills || 'Skills'}</h2><div class="section">`;
      if (data.skills.technical) s += `<p style="margin: 0 0 4pt 0;"><span class="skill-label">${h.technical || 'Technical:'}</span> ${data.skills.technical}</p>`;
      if (data.skills.soft) s += `<p style="margin: 0 0 4pt 0;"><span class="skill-label">${h.interpersonal || 'Interpersonal:'}</span> ${data.skills.soft}</p>`;
      if (data.skills.languages) s += `<p style="margin: 0;"><span class="skill-label">${h.languages || 'Languages:'}</span> ${data.skills.languages}</p>`;
      return s + '</div>';
    },
    projects: () => {
      const validProj = data.projects.filter(pr => pr.name);
      if (validProj.length === 0) return '';
      let s = `<h2>${h.projects || 'Projects'}</h2>`;
      validProj.forEach(pr => {
        s += `<div class="section">
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom: 2pt;">
  <tr>
    <td style="text-align:left;"><span class="company-name">${pr.name}</span>${pr.link ? ` (${pr.link})` : ''}</td>
    <td style="text-align:right;" class="date-col">${pr.techStack ? `Tech: ${pr.techStack}` : ''}</td>
  </tr>
</table>
<p style="margin: 0 0 4pt 0; font-size: 10.5pt;">${pr.description || ''}</p>
<ul class="bullets">`;
        pr.highlights.filter(Boolean).forEach(hl => {
          s += `<li class="bullet-item">${hl}</li>`;
        });
        s += `</ul></div>`;
      });
      return s;
    },
    certifications: () => {
      const validCert = data.certifications.filter(c => c.name);
      if (validCert.length === 0) return '';
      let s = `<h2>${h.certifications || 'Certifications'}</h2><ul class="bullets" style="margin-top: 2pt;">`;
      validCert.forEach(c => {
        s += `<li class="bullet-item"><strong>${c.name}</strong> — ${c.issuer}${c.date ? ` (${c.date})` : ''}</li>`;
      });
      return s + '</ul>';
    }
  };

  order.forEach(sectionKey => {
    if (sectionGenerators[sectionKey]) {
      html += sectionGenerators[sectionKey]();
    } else if (sectionKey.startsWith('custom_') && data.customSections) {
      const customSec = data.customSections.find(s => s.id === sectionKey);
      if (customSec && customSec.items && customSec.items.length) {
        const validItems = customSec.items.filter(item => item.title || item.subtitle || item.description);
        if (validItems.length > 0) {
          html += `<h2>${customSec.label || 'Custom'}</h2>`;
          validItems.forEach(item => {
            html += `<div class="section">
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom: 2pt;">
  <tr>
    <td style="text-align:left;"><span class="company-name">${item.title || ''}</span></td>
    <td style="text-align:right;" class="date-col">${item.date || ''}</td>
  </tr>
</table>
${item.subtitle ? `<p style="margin: 0 0 2pt 0; font-style: italic; color: #444;">${item.subtitle}</p>` : ''}
${item.description ? `<p style="margin: 0; font-size: 10.5pt; white-space: pre-line;">${item.description}</p>` : ''}
</div>`;
          });
        }
      }
    }
  });

  html += `</body>\n</html>`;

  if (typeof document !== 'undefined') {
    download(html, `${(p?.name || 'resume').replace(/\s+/g, '_')}_resume.doc`, 'application/msword');
  }
  return html;
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size exceeds the 5MB limit.'));
      return;
    }
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
  if (typeof window !== 'undefined' && window.__TEST_SKIP_DOWNLOAD__) return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Append to body for better browser compatibility
  a.click();
  
  // Clean up with a small delay to ensure the browser has started the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
