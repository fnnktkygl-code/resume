import { memo, useCallback } from 'react';
import { parseMarkdown } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

function MinimalistTemplate({ data, layout = {}, language = 'en', onSectionClick }) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => (!h[key] || h[key] === defaultEn) ? t(tKey) : h[key];
  const p = data.personal;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;
  const h = data.headings || {};

  const {
    fontSize = 10,
    sectionSpacing = 12,
    itemSpacing = 8,
    lineHeight = 1.35
  } = layout;

  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${m} ${y}`;
    return y || m || '';
  };

  const primaryColor = layout.accentColor || '#1B6B3A';
  const textColor = 'var(--resume-text-color, #222)';

  const hasContact = p.name || p.email || p.phone;

  const renderSection = (sectionId) => {
    const sectionTitleStyle = {
      fontSize: '8.5pt',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: primaryColor,
      marginTop: '2px'
    };

    const sectionWrapperStyle = {
      display: 'grid',
      gridTemplateColumns: '130px 1fr',
      gap: '20px',
      marginBottom: `${sectionSpacing}px`,
      cursor: onSectionClick ? 'pointer' : 'default',
      padding: onSectionClick ? '4px' : '0',
      margin: onSectionClick ? `-4px -4px ${sectionSpacing - 4}px -4px` : `0 0 ${sectionSpacing}px 0`,
      borderRadius: '4px',
      pageBreakInside: 'avoid'
    };

    const handleSectionClick = () => {
      if (onSectionClick) onSectionClick(sectionId);
    };

    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key="summary" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div style={{ color: textColor, textAlign: 'justify' }}>{parseMarkdown(data.summary)}</div>
          </div>
        );

      case 'experience':
        if (!validExp.length) return null;
        return (
          <div key="experience" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
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
                  <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600', marginBottom: '4px' }}>
                    {exp.company}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: textColor }}>
                        <span style={{ marginRight: '6px' }}>•</span>
                        <div>{parseMarkdown(b)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!validEdu.length) return null;
        return (
          <div key="education" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('education', 'Education', 'EDUCATION')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '10pt', color: textColor }}>{edu.degree}</strong>
                    <span style={{ fontSize: '8.5pt', color: '#666', whiteSpace: 'nowrap' }}>
                      {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                    </span>
                  </div>
                  <div style={{ fontSize: '9pt', color: 'var(--resume-text-secondary, #555)' }}>
                    {edu.institution}{edu.field && `, ${edu.field}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!hasSkills) return null;
        return (
          <div key="skills" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.skills.technical && (
                <div>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px' }}>{h.technical || 'Technical'}:</span>
                  <span style={{ fontSize: '9pt', color: textColor }}>{data.skills.technical}</span>
                </div>
              )}
              {data.skills.soft && (
                <div>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px' }}>{h.interpersonal || 'Soft skills'}:</span>
                  <span style={{ fontSize: '9pt', color: textColor }}>{data.skills.soft}</span>
                </div>
              )}
              {data.skills.languages && (
                <div>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px' }}>{h.languages || 'Languages'}:</span>
                  <span style={{ fontSize: '9pt', color: textColor }}>{data.skills.languages}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'projects':
        if (!validProj.length) return null;
        return (
          <div key="projects" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '10pt', color: textColor }}>{pr.name}</strong>
                    {pr.link && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{pr.link}</span>}
                  </div>
                  {pr.description && <div style={{ fontSize: '9pt', color: textColor, margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                  {pr.techStack && <div style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', fontStyle: 'italic' }}>Tech: {pr.techStack}</div>}
                  {pr.highlights.filter(Boolean).map((h, hi) => (
                    <div key={hi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: textColor, marginTop: '2px' }}>
                      <span style={{ marginRight: '6px' }}>•</span>
                      <div>{parseMarkdown(h)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!validCert.length) return null;
        return (
          <div key="certifications" className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
            <div style={sectionTitleStyle}>{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {validCert.map((c, i) => (
                <div key={i} style={{ fontSize: '9pt', color: textColor }}>
                  <strong>{c.name}</strong> — {c.issuer}{c.date ? ` (${c.date})` : ''}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        if (sectionId.startsWith('custom_')) {
          const customSec = data.customSections?.find(s => s.id === sectionId);
          if (!customSec || !customSec.items.length) return null;
          const validItems = customSec.items.filter(i => i.title || i.subtitle || i.description);
          if (!validItems.length) return null;

          return (
            <div key={sectionId} className={onSectionClick ? "preview-interactive-section" : ""} style={sectionWrapperStyle} onClick={handleSectionClick}>
              <div style={sectionTitleStyle}>{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '10pt', color: textColor }}>{item.title}</strong>
                      {item.date && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{item.date}</span>}
                    </div>
                    {item.subtitle && <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600' }}>{item.subtitle}</div>}
                    {item.description && <div style={{ fontSize: '9pt', color: textColor, marginTop: '4px', whiteSpace: 'pre-line' }}>
                      {parseMarkdown(item.description)}
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
    }
  };

  const resumeStyles = {
    fontFamily: layout.fontFamily || "'Georgia', serif",
    color: textColor,
    lineHeight: lineHeight,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%'
  };

  return (
    <div className="minimalist-resume" style={resumeStyles}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid var(--resume-border-color, #ddd)`,
        paddingBottom: '14px',
        marginBottom: '20px'
      }}>
        <div style={{ flex: 1 }}>
          {p.name && (
            <div style={{ fontSize: '20pt', fontWeight: 'bold', color: textColor, letterSpacing: '-0.3px' }}>
              {p.name}
            </div>
          )}
          {p.tagline && (
            <div style={{ fontSize: '10pt', color: 'var(--resume-text-secondary, #555)', marginTop: '2px', fontStyle: 'italic' }}>
              {p.tagline}
            </div>
          )}
          {hasContact && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              fontSize: '8.5pt', 
              color: 'var(--resume-text-secondary, #666)', 
              marginTop: '8px'
            }}>
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>• &nbsp;{p.phone}</span>}
              {p.location && <span>• &nbsp;{p.location}</span>}
              {p.linkedin && <span>• &nbsp;{p.linkedin}</span>}
            </div>
          )}
        </div>
        {p.showPhoto && p.photo && (
          <div className="resume-photo-container" style={{ flexShrink: 0, marginLeft: '20px' }} data-testid="profile-photo-container">
            <img src={p.photo} alt={p.name || "Profile"} style={{ width: '75px', height: '75px', borderRadius: '4px', objectFit: 'cover', border: `1px solid var(--resume-border-color, #ccc)` }} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
    </div>
  );
}

export default memo(MinimalistTemplate);
