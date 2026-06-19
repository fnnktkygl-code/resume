import { memo } from 'react';
import { parseMarkdown, formatUrl } from '../utils/formatText';

import { getTranslation } from '../utils/translations';

function ModernTemplate({ 
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
  printMode = false
}) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => (!h[key] || h[key] === defaultEn) ? t(tKey) : h[key];
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

  const getWrapProps = (id) => {
    if (SectionWrapper) {
      return { key: id, sectionId: id };
    }
    return {
      key: id,
      className: onSectionClick ? "preview-interactive-section" : "",
      style: { cursor: onSectionClick ? 'pointer' : 'default', padding: '2px', margin: '-2px', borderRadius: '4px' },
      onClick: onSectionClick ? () => onSectionClick(id) : undefined
    };
  };

  const Wrapper = SectionWrapper || 'div';

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
    <div className="modern-resume" style={{ fontSize: `${fontSize}pt`, fontFamily: layout.fontFamily || 'Inter' }}>
      {/* Left Sidebar */}
      <div className="modern-sidebar">
        {p.showPhoto && p.photo && (
          <div className="resume-photo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }} data-testid="profile-photo-container">
            <img src={p.photo} alt={p.name || "Profile"} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--resume-accent-color, #1B6B3A)` }} />
          </div>
        )}
        {p.name && <div className="resume-name">{p.name}</div>}
        {p.tagline && <div className="resume-tagline">{p.tagline}</div>}

        {/* Contact — only render if at least one field is filled */}
        {(p.email || p.phone || p.location || p.linkedin || p.github || p.website) && (
          <div>
            <div className="modern-sidebar-section-title">
              {t('Contact')}
            </div>
            {p.email && <div className="modern-sidebar-item"><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a></div>}
            {p.phone && <div className="modern-sidebar-item"><a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a></div>}
            {p.location && <div className="modern-sidebar-item">{p.location}</div>}
            {p.linkedin && <div className="modern-sidebar-item"><a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a></div>}
            {p.github && <div className="modern-sidebar-item"><a href={formatUrl(p.github)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.github}</a></div>}
            {p.website && <div className="modern-sidebar-item"><a href={formatUrl(p.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.website}</a></div>}
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <Wrapper {...getWrapProps('skills')}>
            <div className="modern-sidebar-section-title">{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            {data.skills.technical && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{h.technical}</strong>
                <div className="skills-container">
                  {data.skills.technical.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill-accent">{skill.trim()}</span> : null)}
                </div>
              </div>
            )}
            {data.skills.soft && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{h.interpersonal}</strong>
                <div className="skills-container">
                  {data.skills.soft.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill">{skill.trim()}</span> : null)}
                </div>
              </div>
            )}
            {data.skills.languages && !hasCustomLangues && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{h.languages}</strong>
                <div className="skills-container">
                  {data.skills.languages.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill-outline">{skill.trim()}</span> : null)}
                </div>
              </div>
            )}
          </Wrapper>
        )}

        {/* Certifications */}
        {validCert.length > 0 && (
          <Wrapper {...getWrapProps('certifications')}>
            <div className="modern-sidebar-section-title">{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
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
                <div className="modern-sidebar-item">
                  <strong>{c.name}</strong>
                  {c.issuer}{c.date ? ` (${c.date})` : ''}
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
          </Wrapper>
        )}
      </div>

      {/* Right Main */}
      <div className="modern-main" style={{ gap: `${sectionSpacing}px` }}>
        {data.summary && (
          <Wrapper {...getWrapProps('summary')}>
            <div className="resume-section-header">{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div>{parseMarkdown(data.summary)}</div>
          </Wrapper>
        )}

        {validExp.length > 0 && (
          <Wrapper {...getWrapProps('experience')}>
            <div className="resume-section-header">{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
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
                    <div className="resume-exp-header">
                      {exp.link ? (
                        <a href={formatUrl(exp.link)} target="_blank" rel="noopener noreferrer" className="resume-company" style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                          {exp.company} <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '3px', display: 'inline-block', verticalAlign: 'middle'}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ) : (
                        <span className="resume-company">{exp.company}</span>
                      )}
                      <span className="resume-dates">
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' — '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div className="resume-title">{exp.title}</div>
                    <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px` }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(b)}</div>
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
        )}

        {validEdu.length > 0 && (
          <Wrapper {...getWrapProps('education')}>
            <div className="resume-section-header">{displayHeading('education', 'Education', 'EDUCATION')}</div>
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
        )}

        {validProj.length > 0 && (
          <Wrapper {...getWrapProps('projects')}>
            <div className="resume-section-header">{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
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
        )}

        {data.customSections?.map(sec => {
          if (sec.id.startsWith('spacer_')) {
            return <Wrapper {...getWrapProps(sec.id)} style={{ height: `${sec.height}px` }} />;
          }
          const validItems = sec.items?.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems || !validItems.length) return null;
          return (
            <Wrapper {...getWrapProps(sec.id)}>
              <div className="resume-section-header">{sec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? (
                      <div style={{ height: `${item.height}px` }} />
                    ) : (
                      <NestedSpacer 
                        height={item.height} 
                        onChangeHeight={(h) => onItemUpdate(sec.id, i, { ...item, height: h })}
                        onDelete={() => onItemDelete(sec.id, i)}
                      />
                    )
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div className="resume-exp-header">
                        {item.title && <span className="resume-company">{item.title}</span>}
                        {item.date && <span className="resume-dates">{item.date}</span>}
                      </div>
                      {item.subtitle && <div className="resume-title">{item.subtitle}</div>}
                      {item.description && <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px`, whiteSpace: 'pre-line' }}>
                        {parseMarkdown(item.description)}
                      </div>}
                    </div>
                  );

                  return (
                    <div key={item.id || i}>
                      {!printMode && i > 0 && (
                        <InsertSpacerButton onClick={() => onAddSpacer(sec.id, i)} />
                      )}
                      <ItemWrapper sectionId={sec.id} itemId={item.id} index={i}>
                        {itemContent}
                      </ItemWrapper>
                    </div>
                  );
                })}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ModernTemplate);
