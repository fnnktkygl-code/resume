import { memo, useCallback } from 'react';
import { parseMarkdown, formatUrl, formatSkills } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

function MinimalistTemplate({ 
  data, 
  layout = {}, 
  language = 'en', 
  onSectionClick, 
  SectionWrapper,
  // New props:
  ItemWrapper,
  NestedSpacer,
  InsertSpacerButton,
  onItemReorder,
  onItemDelete,
  onItemUpdate,
  onAddSpacer,
  onAddSectionSpacer,
  onUpdateSectionSpacer,
  onDeleteSectionSpacer,
  printMode = false
}) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => {
    if (!h[key]) return t(tKey);
    const val = h[key].trim();
    if (!val) return t(tKey);
    const vLower = val.toLowerCase();
    if (vLower === defaultEn.toLowerCase() || vLower === key.toLowerCase() || vLower === 'technical:' || vLower === 'interpersonal:' || vLower === 'languages:') return t(tKey);
    return val;
  };

  const renderSkills = (skillsString, defaultClass) => {
    if (!skillsString) return null;
    const style = layout.skillStyle || 'pill';
    if (style === 'text') {
      const skillsArray = formatSkills(skillsString).split(',').map(s => s.trim()).filter(Boolean);
      return (
        <span style={{ fontSize: '9pt', color: textColor, lineHeight: '1.5' }}>
          {skillsArray.map((skill, si) => (
            <span key={si}>
              {si > 0 && ' • '}
              {parseMarkdown(skill)}
            </span>
          ))}
        </span>
      );
    }
    const className = style === 'square' ? defaultClass.replace('pill', 'square') : defaultClass;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {formatSkills(skillsString).split(',').map((skill, si) => skill.trim() ? <span key={si} className={className}>{parseMarkdown(skill.trim())}</span> : null)}
      </div>
    );
  };

  const p = data.personal;
  const validExp = data.experience.filter(e => e.company || e.title || e.isSpacer);
  const validEdu = data.education.filter(e => e.institution || e.degree || e.isSpacer);
  const validProj = data.projects.filter(pr => pr.name || pr.isSpacer);
  const validCert = data.certifications.filter(c => c.name || c.isSpacer);
  const hasCustomLangues = data.customSections?.some(s => 
    s.id === 'custom_langues' && s.items.some(i => i.title || i.subtitle || i.description || i.isSpacer)
  );
  const hasSkills = data.skills.technical || data.skills.soft || (data.skills.languages && !hasCustomLangues);
  const h = data.headings || {};

  const getWrapProps = (id, style) => {
    if (SectionWrapper) {
      return { key: id, sectionId: id, style: style };
    }
    return {
      key: id,
      className: onSectionClick ? "preview-interactive-section" : "",
      style: style,
      onClick: onSectionClick ? () => onSectionClick(id) : undefined
    };
  };

  const Wrapper = SectionWrapper || 'div';

  const {
    fontSize = 10,
    sectionSpacing = 12,
    itemSpacing = 8,
    lineHeight = 1.35
  } = layout;

  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${t(m)} ${y}`;
    return y || t(m) || '';
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
          <Wrapper {...getWrapProps('summary', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div style={{ color: textColor, textAlign: 'justify' }}>{parseMarkdown(data.summary)}</div>
          </Wrapper>
        );

      case 'experience':
        if (!validExp.length) return null;
        return (
          <Wrapper {...getWrapProps('experience', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => {
                const itemContent = exp.isSpacer ? (
                  printMode ? (
                    <div style={{ height: `${exp.height}px` }} />
                  ) : (
                    <NestedSpacer 
                      height={exp.height} 
                      onChangeHeight={(h) => onItemUpdate('experience', i, { ...exp, height: h })}
                      onDelete={() => onItemDelete('experience', i)}
                    />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '10pt', color: textColor }}>{exp.title}</strong>
                      <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', whiteSpace: 'nowrap' }}>
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' — '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600', marginBottom: '4px' }}>
                      {exp.link ? (
                        <a href={formatUrl(exp.link)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }} onClick={(e) => e.stopPropagation()}>
                          {exp.company}
                          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', verticalAlign: 'middle'}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ) : exp.company}
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
                );

                return (
                  <div key={exp.id || i}>
                    {!printMode && i > 0 && (
                      <InsertSpacerButton onClick={() => onAddSpacer('experience', i)} />
                    )}
                    <ItemWrapper sectionId="experience" itemId={exp.id} index={i}>
                      {itemContent}
                    </ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case 'education':
        if (!validEdu.length) return null;
        return (
          <Wrapper {...getWrapProps('education', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('education', 'Education', 'EDUCATION')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => {
                const itemContent = edu.isSpacer ? (
                  printMode ? (
                    <div style={{ height: `${edu.height}px` }} />
                  ) : (
                    <NestedSpacer 
                      height={edu.height} 
                      onChangeHeight={(h) => onItemUpdate('education', i, { ...edu, height: h })}
                      onDelete={() => onItemDelete('education', i)}
                    />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
                );

                return (
                  <div key={edu.id || i}>
                    {!printMode && i > 0 && (
                      <InsertSpacerButton onClick={() => onAddSpacer('education', i)} />
                    )}
                    <ItemWrapper sectionId="education" itemId={edu.id} index={i}>
                      {itemContent}
                    </ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case 'skills':
        if (!hasSkills) return null;
        return (
          <Wrapper {...getWrapProps('skills', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.skills.technical && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px', flexShrink: 0 }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}:</span>
                  {renderSkills(data.skills.technical, 'skill-pill-accent')}
                </div>
              )}
              {data.skills.soft && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px', flexShrink: 0 }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}:</span>
                  {renderSkills(data.skills.soft, 'skill-pill')}
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: 'var(--resume-text-secondary, #555)', display: 'inline-block', width: '100px', flexShrink: 0 }}>{displayHeading('languages', 'Languages', 'Languages')}:</span>
                  {renderSkills(data.skills.languages, 'skill-pill-outline')}
                </div>
              )}
            </div>
          </Wrapper>
        );

      case 'projects':
        if (!validProj.length) return null;
        return (
          <Wrapper {...getWrapProps('projects', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => {
                const itemContent = pr.isSpacer ? (
                  printMode ? (
                    <div style={{ height: `${pr.height}px` }} />
                  ) : (
                    <NestedSpacer 
                      height={pr.height} 
                      onChangeHeight={(h) => onItemUpdate('projects', i, { ...pr, height: h })}
                      onDelete={() => onItemDelete('projects', i)}
                    />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
                );

                return (
                  <div key={pr.id || i}>
                    {!printMode && i > 0 && (
                      <InsertSpacerButton onClick={() => onAddSpacer('projects', i)} />
                    )}
                    <ItemWrapper sectionId="projects" itemId={pr.id} index={i}>
                      {itemContent}
                    </ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case 'certifications':
        if (!validCert.length) return null;
        return (
          <Wrapper {...getWrapProps('certifications', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {validCert.map((c, i) => {
                const itemContent = c.isSpacer ? (
                  printMode ? (
                    <div style={{ height: `${c.height}px` }} />
                  ) : (
                    <NestedSpacer 
                      height={c.height} 
                      onChangeHeight={(h) => onItemUpdate('certifications', i, { ...c, height: h })}
                      onDelete={() => onItemDelete('certifications', i)}
                    />
                  )
                ) : (
                  <div style={{ fontSize: '9pt', color: textColor, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{c.name}</strong> — {c.issuer}{c.date ? ` (${c.date})` : ''}
                  </div>
                );

                return (
                  <div key={c.id || i}>
                    {!printMode && i > 0 && (
                      <InsertSpacerButton onClick={() => onAddSpacer('certifications', i)} />
                    )}
                    <ItemWrapper sectionId="certifications" itemId={c.id} index={i}>
                      {itemContent}
                    </ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      default:
        if (sectionId.startsWith('spacer_')) {
          const spacerSec = data.customSections?.find(s => s.id === sectionId);
          if (!spacerSec) return null;
          return (
            <Wrapper {...getWrapProps(sectionId)}>
              {printMode ? (
                <div style={{ height: `${spacerSec.height}px` }} />
              ) : (
                <NestedSpacer
                  height={spacerSec.height}
                  onChangeHeight={(h) => onUpdateSectionSpacer && onUpdateSectionSpacer(sectionId, h)}
                  onDelete={() => onDeleteSectionSpacer && onDeleteSectionSpacer(sectionId)}
                />
              )}
            </Wrapper>
          );
        }

        if (sectionId.startsWith('custom_')) {
          const customSec = data.customSections?.find(s => s.id === sectionId);
          if (!customSec || !customSec.items.length) return null;
          const validItems = customSec.items.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems.length) return null;

          return (
            <Wrapper {...getWrapProps(sectionId, sectionWrapperStyle)}>
              <div style={sectionTitleStyle}>{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? (
                      <div style={{ height: `${item.height}px` }} />
                    ) : (
                      <NestedSpacer 
                        height={item.height} 
                        onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })}
                        onDelete={() => onItemDelete(sectionId, i)}
                      />
                    )
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '10pt', color: textColor }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600' }}>{item.subtitle}</div>}
                      {item.description && <div style={{ fontSize: '9pt', color: textColor, marginTop: '4px', whiteSpace: 'pre-line' }}>
                        {parseMarkdown(item.description)}
                      </div>}
                    </div>
                  );

                  return (
                    <div key={item.id || i}>
                      {!printMode && i > 0 && (
                        <InsertSpacerButton onClick={() => onAddSpacer(sectionId, i)} />
                      )}
                      <ItemWrapper sectionId={sectionId} itemId={item.id} index={i}>
                        {itemContent}
                      </ItemWrapper>
                    </div>
                  );
                })}
              </div>
            </Wrapper>
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
              {p.email && <a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a>}
              {p.phone && <span>• &nbsp;<a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a></span>}
              {p.location && <span>• &nbsp;{p.location}</span>}
              {p.linkedin && <span>• &nbsp;<a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a></span>}
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
        {sectionOrder.map((sectionId, sectionIdx) => {
          const rendered = renderSection(sectionId);
          if (!rendered) return null;
          return (
            <div key={sectionId}>
              {!printMode && onAddSectionSpacer && InsertSpacerButton && (
                <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId) - 1)} />
              )}
              {rendered}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MinimalistTemplate);
