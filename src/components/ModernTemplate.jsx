import { memo } from 'react';
import { parseMarkdown } from '../utils/formatText';

function ModernTemplate({ data, layout = {}, language = 'en' }) {
  const p = data.personal;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;
  const h = data.headings || {};

  const {
    fontSize = 10.5,
    sectionSpacing = 8,
    itemSpacing = 8,
  } = layout;

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${m} ${y}`;
    return y || m || '';
  };

  return (
    <div className="modern-resume" style={{ fontSize: `${fontSize}pt` }}>
      {/* Left Sidebar */}
      <div className="modern-sidebar">
        {p.name && <div className="resume-name">{p.name}</div>}
        {p.tagline && <div className="resume-tagline">{p.tagline}</div>}

        {/* Contact */}
        <div>
          <div className="modern-sidebar-section-title">
            {language === 'fr' ? 'Contact' : 'Contact'}
          </div>
          {p.email && <div className="modern-sidebar-item">{p.email}</div>}
          {p.phone && <div className="modern-sidebar-item">{p.phone}</div>}
          {p.location && <div className="modern-sidebar-item">{p.location}</div>}
          {p.linkedin && <div className="modern-sidebar-item">{p.linkedin}</div>}
          {p.github && <div className="modern-sidebar-item">{p.github}</div>}
          {p.website && <div className="modern-sidebar-item">{p.website}</div>}
        </div>

        {/* Skills */}
        {hasSkills && (
          <div>
            <div className="modern-sidebar-section-title">{h.skills}</div>
            {data.skills.technical && (
              <div className="modern-sidebar-item">
                <strong>{h.technical}</strong> {data.skills.technical}
              </div>
            )}
            {data.skills.soft && (
              <div className="modern-sidebar-item">
                <strong>{h.interpersonal}</strong> {data.skills.soft}
              </div>
            )}
            {data.skills.languages && (
              <div className="modern-sidebar-item">
                <strong>{h.languages}</strong> {data.skills.languages}
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {validCert.length > 0 && (
          <div>
            <div className="modern-sidebar-section-title">{h.certifications}</div>
            {validCert.map((c, i) => (
              <div key={i} className="modern-sidebar-item">
                <strong>{c.name}</strong>
                {c.issuer}{c.date ? ` (${c.date})` : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Main */}
      <div className="modern-main" style={{ gap: `${sectionSpacing}px` }}>
        {data.summary && (
          <div>
            <div className="resume-section-header">{h.summary}</div>
            <div>{parseMarkdown(data.summary)}</div>
          </div>
        )}

        {validExp.length > 0 && (
          <div>
            <div className="resume-section-header">{h.experience}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{exp.company}</span>
                    <span className="resume-dates">
                      {formatDate(exp.startMonth, exp.startYear)}
                      {(exp.startMonth || exp.startYear) && ' — '}
                      {exp.current ? h.present : formatDate(exp.endMonth, exp.endYear)}
                    </span>
                  </div>
                  <div className="resume-title">{exp.title}</div>
                  <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px` }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(b)}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {validEdu.length > 0 && (
          <div>
            <div className="resume-section-header">{h.education}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{edu.institution}</span>
                    <span className="resume-dates">
                      {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                    </span>
                  </div>
                  <div className="resume-title">
                    {[edu.degree, edu.field].filter(Boolean).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {validProj.length > 0 && (
          <div>
            <div className="resume-section-header">{h.projects}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{pr.name}</span>
                    {pr.link && <span className="resume-dates">{pr.link}</span>}
                  </div>
                  {pr.description && <div style={{ marginBottom: '2px' }}>{parseMarkdown(pr.description)}</div>}
                  {pr.techStack && <div className="resume-tech-stack"><em>Tech: {pr.techStack}</em></div>}
                  {pr.highlights.filter(Boolean).map((h, hi) => (
                    <div key={hi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(h)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.customSections?.map(sec => {
          const validItems = sec.items.filter(i => i.title || i.subtitle || i.description);
          if (!validItems.length) return null;
          return (
            <div key={sec.id}>
              <div className="resume-section-header">{sec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => (
                  <div key={i}>
                    <div className="resume-exp-header">
                      {item.title && <span className="resume-company">{item.title}</span>}
                      {item.date && <span className="resume-dates">{item.date}</span>}
                    </div>
                    {item.subtitle && <div className="resume-title">{item.subtitle}</div>}
                    {item.description && <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px`, whiteSpace: 'pre-line' }}>
                      {parseMarkdown(item.description)}
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ModernTemplate);
