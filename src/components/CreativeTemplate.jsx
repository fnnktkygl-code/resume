import { memo } from 'react';
import { parseMarkdown, formatUrl } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

function CreativeTemplate({ 
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
  const displayHeading = (key, defaultEn, tKey) => {
    if (!h[key]) return t(tKey);
    const val = h[key].trim();
    if (!val) return t(tKey);
    if (val.toLowerCase() === defaultEn.toLowerCase() || val.toLowerCase() === key.toLowerCase()) return t(tKey);
    return val;
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

  const getWrapProps = (id) => {
    if (SectionWrapper) {
      return { key: id, sectionId: id, style: wrapperStyle(id) };
    }
    return {
      key: id,
      className: onSectionClick ? "preview-interactive-section" : "",
      style: wrapperStyle(id),
      onClick: onSectionClick ? () => handleSectionClick(id) : undefined
    };
  };

  const Wrapper = SectionWrapper || 'div';

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
              {p.email && <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>✉ {p.email}</a>}
              {p.phone && <a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>☎ {p.phone}</a>}
              {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {p.location}</span>}
              {p.linkedin && <a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>🔗 {p.linkedin}</a>}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.summary && (
            <Wrapper {...getWrapProps('summary')}>
              <div style={sectionHeaderStyle}>{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
              <div style={{ textAlign: 'justify', fontSize: `${fontSize}pt` }}>{parseMarkdown(data.summary)}</div>
            </Wrapper>
          )}

          {hasSkills && (
            <Wrapper {...getWrapProps('skills')}>
              <div style={sectionHeaderStyle}>{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
              {data.skills.technical && (
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '8.5pt', textTransform: 'uppercase', color: primaryColor, marginBottom: '4px' }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}</strong>
                  <div className="skills-container" style={{ gap: '4px' }}>
                    {data.skills.technical.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill" style={{ backgroundColor: 'transparent', border: `1px solid ${primaryColor}`, color: textColor }}>{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
              {data.skills.soft && (
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '8.5pt', textTransform: 'uppercase', color: primaryColor, marginBottom: '4px' }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}</strong>
                  <div className="skills-container" style={{ gap: '4px' }}>
                    {data.skills.soft.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill" style={{ backgroundColor: 'transparent', border: `1px solid #ccc`, color: textColor }}>{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '8.5pt', textTransform: 'uppercase', color: primaryColor, marginBottom: '4px' }}>{displayHeading('languages', 'Languages', 'Languages')}</strong>
                  <div className="skills-container" style={{ gap: '4px' }}>
                    {data.skills.languages.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill" style={{ backgroundColor: 'transparent', border: `1px dashed #aaa`, color: textColor }}>{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
            </Wrapper>
          )}

          {validCert.length > 0 && (
            <Wrapper {...getWrapProps('certifications')}>
              <div style={sectionHeaderStyle}>{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    <div style={{ fontSize: '9pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ fontWeight: '600', color: textColor }}>{c.name}</div>
                      <div style={{ color: 'var(--resume-text-secondary, #666)' }}>{c.issuer}{c.date ? ` • ${c.date}` : ''}</div>
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
          )}
        </div>

        {/* Right Column - Experience, Education, Projects, Custom */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Work Experience */}
          {validExp.length > 0 && (
            <Wrapper {...getWrapProps('experience')}>
              <div style={sectionHeaderStyle}>{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {exp.bullets.filter(Boolean).map((b, bi) => (
                          <div key={bi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: 'var(--resume-text-color, #333)' }}>
                            <span style={{ marginRight: '6px', color: primaryColor }}>•</span>
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
          )}

          {/* Education */}
          {validEdu.length > 0 && (
            <Wrapper {...getWrapProps('education')}>
              <div style={sectionHeaderStyle}>{displayHeading('education', 'Education', 'EDUCATION')}</div>
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
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', color: primaryColor }}>{edu.institution}</div>
                        <div style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', fontWeight: '600', textTransform: 'uppercase' }}>
                          {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                        </div>
                      </div>
                      <div style={{ fontSize: '10pt', fontWeight: '500', color: textColor, margin: '2px 0' }}>
                        {[edu.degree, edu.field].filter(Boolean).join(' • ')}
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

          {/* Projects */}
          {validProj.length > 0 && (
            <Wrapper {...getWrapProps('projects')}>
              <div style={sectionHeaderStyle}>{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
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
                      {pr.description && <div style={{ fontSize: '9pt', color: 'var(--resume-text-color, #333)', margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                      {pr.techStack && <div style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)', fontStyle: 'italic' }}>Tech: {pr.techStack}</div>}
                      {pr.highlights.filter(Boolean).map((h, hi) => (
                        <div key={hi} className="resume-bullet" style={{ display: 'flex', fontSize: '9pt', color: 'var(--resume-text-color, #333)', marginTop: '2px' }}>
                          <span style={{ marginRight: '6px', color: primaryColor }}>•</span>
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
          )}

          {/* Custom Sections */}
          {data.customSections?.map(sec => {
            if (sec.id.startsWith('spacer_')) {
              return <Wrapper {...getWrapProps(sec.id)} style={{ height: `${sec.height}px` }} />;
            }
            const validItems = sec.items?.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
            if (!validItems || !validItems.length) return null;
            return (
              <Wrapper {...getWrapProps(sec.id)}>
                <div style={sectionHeaderStyle}>{sec.label || 'Custom'}</div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: '10pt', color: textColor }}>{item.title}</strong>
                          {item.date && <span style={{ fontSize: '8.5pt', color: 'var(--resume-text-secondary, #666)' }}>{item.date}</span>}
                        </div>
                        {item.subtitle && <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600' }}>{item.subtitle}</div>}
                        {item.description && <div style={{ fontSize: '9pt', color: 'var(--resume-text-color, #333)', marginTop: '4px', whiteSpace: 'pre-line' }}>
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
    </div>
  );
}

export default memo(CreativeTemplate);
