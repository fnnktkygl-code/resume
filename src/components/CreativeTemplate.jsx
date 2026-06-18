import { memo } from 'react';
import { parseMarkdown } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

function CreativeTemplate({ data, layout = {}, language = 'en', onSectionClick }) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => (!h[key] || h[key] === defaultEn) ? t(tKey) : h[key];
  const p = data.personal;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasCustomLangues = data.customSections?.some(s => 
    s.id === 'custom_langues' && s.items.some(i => i.title || i.subtitle || i.description)
  );
  const hasSkills = data.skills.technical || data.skills.soft || (data.skills.languages && !hasCustomLangues);
  const h = data.headings || {};

  const {
    fontSize = 10,
    sectionSpacing = 12,
    itemSpacing = 8,
    lineHeight = 1.35
  } = layout;

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${m} ${y}`;
    return y || m || '';
  };

  const primaryColor = layout.accentColor || '#1B6B3A';
  const textColor = 'var(--resume-text-color, #222)';
  const hasContact = p.name || p.email || p.phone;

  const sectionHeaderStyle = {
    color: primaryColor,
    fontSize: '9.5pt',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    borderBottom: `2px solid ${primaryColor}`,
    paddingBottom: '3px',
    marginBottom: '8px'
  };

  const handleSectionClick = (sectionId) => {
    if (onSectionClick) onSectionClick(sectionId);
  };

  const wrapperStyle = (sectionId) => ({
    marginBottom: `${sectionSpacing}px`,
    cursor: onSectionClick ? 'pointer' : 'default',
    padding: onSectionClick ? '4px' : '0',
    margin: onSectionClick ? `-4px` : `0 0 ${sectionSpacing}px 0`,
    borderRadius: '4px'
  });

  return (
    <div className="creative-resume" style={{ fontFamily: layout.fontFamily || "'Outfit', sans-serif", color: textColor, lineHeight: lineHeight }}>
      {/* Top Header Section */}
      <div style={{
        borderBottom: `4px solid ${primaryColor}`,
        paddingBottom: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ flex: 1 }}>
          {p.name && (
            <h1 style={{ fontSize: '24pt', fontWeight: '800', color: textColor, margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
              {p.name}
            </h1>
          )}
          {p.tagline && (
            <div style={{ fontSize: '11pt', fontWeight: '500', color: primaryColor, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {p.tagline}
            </div>
          )}
          {hasContact && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', fontSize: '8.5pt', color: 'var(--resume-text-secondary, #555)' }}>
              {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉ {p.email}</span>}
              {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>☎ {p.phone}</span>}
              {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {p.location}</span>}
              {p.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔗 LinkedIn</span>}
            </div>
          )}
        </div>

        {p.showPhoto && p.photo && (
          <div className="resume-photo-container" style={{ flexShrink: 0 }} data-testid="profile-photo-container">
            <img src={p.photo} alt={p.name || "Profile"} style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${primaryColor}`, boxShadow: '0 4px 6px rgba(0,0,0,0.08)' }} />
          </div>
        )}
      </div>

      {/* Two-Column Grid Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Left Column - Summary, Skills, Certifications */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Summary */}
          {data.summary && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('summary')} onClick={() => handleSectionClick('summary')}>
              <div style={sectionHeaderStyle}>{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
              <div style={{ fontSize: '9pt', color: 'var(--resume-text-secondary, #444)', textAlign: 'justify' }}>{parseMarkdown(data.summary)}</div>
            </div>
          )}

          {/* Skills */}
          {hasSkills && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('skills')} onClick={() => handleSectionClick('skills')}>
              <div style={sectionHeaderStyle}>{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.skills.technical && (
                  <div>
                    <strong style={{ display: 'block', fontSize: '8.5pt', color: 'var(--resume-text-secondary, #444)', marginBottom: '3px' }}>{h.technical || 'Technical'}</strong>
                    <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {data.skills.technical.split(',').map((skill, si) => skill.trim() ? (
                        <span key={si} className="skill-pill-accent" style={{ fontSize: '7.5pt', padding: '1px 5px' }}>{skill.trim()}</span>
                      ) : null)}
                    </div>
                  </div>
                )}
                {data.skills.soft && (
                  <div>
                    <strong style={{ display: 'block', fontSize: '8.5pt', color: 'var(--resume-text-secondary, #444)', marginBottom: '3px' }}>{h.interpersonal || 'Interpersonal'}</strong>
                    <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {data.skills.soft.split(',').map((skill, si) => skill.trim() ? (
                        <span key={si} className="skill-pill" style={{ fontSize: '7.5pt', padding: '1px 5px' }}>{skill.trim()}</span>
                      ) : null)}
                    </div>
                  </div>
                )}
                {data.skills.languages && !hasCustomLangues && (
                  <div>
                    <strong style={{ display: 'block', fontSize: '8.5pt', color: 'var(--resume-text-secondary, #444)', marginBottom: '3px' }}>{h.languages || 'Languages'}</strong>
                    <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {data.skills.languages.split(',').map((skill, si) => skill.trim() ? (
                        <span key={si} className="skill-pill-outline" style={{ fontSize: '7.5pt', padding: '1px 5px' }}>{skill.trim()}</span>
                      ) : null)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {validCert.length > 0 && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('certifications')} onClick={() => handleSectionClick('certifications')}>
              <div style={sectionHeaderStyle}>{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {validCert.map((c, i) => (
                  <div key={i} style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #444)' }}>
                    <strong style={{ color: textColor }}>{c.name}</strong>
                    <div style={{ fontSize: '8pt', color: 'var(--resume-text-secondary, #666)' }}>{c.issuer}{c.date ? ` (${c.date})` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Experience, Education, Projects, Custom */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Work Experience */}
          {validExp.length > 0 && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('experience')} onClick={() => handleSectionClick('experience')}>
              <div style={sectionHeaderStyle}>{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validExp.map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '10pt', color: textColor }}>{exp.title}</strong>
                      <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', whiteSpace: 'nowrap' }}>
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' — '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600', marginBottom: '4px' }}>{exp.company}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: 'var(--resume-text-color, #333)' }}>
                          <span style={{ marginRight: '6px', color: primaryColor }}>•</span>
                          <div>{parseMarkdown(b)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {validEdu.length > 0 && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('education')} onClick={() => handleSectionClick('education')}>
              <div style={sectionHeaderStyle}>{displayHeading('education', 'Education', 'EDUCATION')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validEdu.map((edu, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '10pt', color: textColor }}>{edu.degree}</strong>
                      <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', whiteSpace: 'nowrap' }}>
                        {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                      </span>
                    </div>
                    <div style={{ fontSize: '9pt', color: 'var(--resume-text-secondary, #555)' }}>{edu.institution}{edu.field && `, ${edu.field}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {validProj.length > 0 && (
            <div className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle('projects')} onClick={() => handleSectionClick('projects')}>
              <div style={sectionHeaderStyle}>{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validProj.map((pr, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '10pt', color: textColor }}>{pr.name}</strong>
                      {pr.link && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{pr.link}</span>}
                    </div>
                    {pr.description && <div style={{ fontSize: '9pt', color: 'var(--resume-text-color, #333)', margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                    {pr.techStack && <div style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', fontStyle: 'italic' }}>Tech: {pr.techStack}</div>}
                    {pr.highlights.filter(Boolean).map((h, hi) => (
                      <div key={hi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: 'var(--resume-text-color, #333)', marginTop: '2px' }}>
                        <span style={{ marginRight: '6px', color: primaryColor }}>•</span>
                        <div>{parseMarkdown(h)}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {data.customSections?.map(sec => {
            const validItems = sec.items.filter(i => i.title || i.subtitle || i.description);
            if (!validItems.length) return null;
            return (
              <div key={sec.id} className={onSectionClick ? "preview-interactive-section" : ""} style={wrapperStyle(sec.id)} onClick={() => handleSectionClick(sec.id)}>
                <div style={sectionHeaderStyle}>{sec.label || 'Custom'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                  {validItems.map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '10pt', color: textColor }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600' }}>{item.subtitle}</div>}
                      {item.description && <div style={{ fontSize: '9pt', color: 'var(--resume-text-color, #333)', marginTop: '4px', whiteSpace: 'pre-line' }}>
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
    </div>
  );
}

export default memo(CreativeTemplate);
