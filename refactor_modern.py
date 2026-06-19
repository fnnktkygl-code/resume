import re

with open('src/components/ModernTemplate.jsx', 'r') as f:
    content = f.read()

# We want to replace everything from `return (` inside `ModernTemplate` to the end of the file,
# with a dynamic rendering function.

# Find the start of the return statement
match = re.search(r'  return \(\n    <div className="modern-resume"', content)
start_idx = match.start()

header_part = content[:start_idx]

# I have pre-written the new layout code for ModernTemplate
new_layout = """  const hasContact = p.email || p.phone || p.location || p.linkedin || p.github || p.website;

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'contact':
        if (!hasContact) return null;
        return (
          <div key="contact">
            <div className="modern-sidebar-section-title">{t('Contact')}</div>
            {p.email && <div className="modern-sidebar-item"><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a></div>}
            {p.phone && <div className="modern-sidebar-item"><a href={`tel:${p.phone.replace(/\\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a></div>}
            {p.location && <div className="modern-sidebar-item">{p.location}</div>}
            {p.linkedin && <div className="modern-sidebar-item"><a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a></div>}
            {p.github && <div className="modern-sidebar-item"><a href={formatUrl(p.github)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.github}</a></div>}
            {p.website && <div className="modern-sidebar-item"><a href={formatUrl(p.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.website}</a></div>}
          </div>
        );
      case 'skills':
        if (!hasSkills) return null;
        return (
          <Wrapper {...getWrapProps('skills')}>
            <div className="modern-sidebar-section-title">{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            {data.skills.technical && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.technical, 'skill-pill-accent')}
                </div>
              </div>
            )}
            {data.skills.soft && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.soft, 'skill-pill')}
                </div>
              </div>
            )}
            {data.skills.languages && !hasCustomLangues && (
              <div className="modern-sidebar-item">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{displayHeading('languages', 'Languages', 'Languages')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.languages, 'skill-pill-outline')}
                </div>
              </div>
            )}
          </Wrapper>
        );
      case 'certifications':
        if (!validCert.length) return null;
        return (
          <Wrapper {...getWrapProps('certifications')}>
            <div className="modern-sidebar-section-title">{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            {validCert.map((c, i) => {
              const itemContent = c.isSpacer ? (
                printMode ? <div style={{ height: `${c.height}px` }} /> : (
                  <NestedSpacer height={c.height} onChangeHeight={(h) => onItemUpdate('certifications', i, { ...c, height: h })} onDelete={() => onItemDelete('certifications', i)} />
                )
              ) : (
                <div className="modern-sidebar-item">
                  <strong>{c.name}</strong><br/>
                  {c.issuer}{c.date ? ` (${c.date})` : ''}
                </div>
              );
              return (
                <div key={c.id || i}>
                  {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer('certifications', i)} />}
                  <ItemWrapper sectionId="certifications" itemId={c.id} index={i}>{itemContent}</ItemWrapper>
                </div>
              );
            })}
          </Wrapper>
        );
      case 'summary':
        if (!data.summary) return null;
        return (
          <Wrapper {...getWrapProps('summary')}>
            <div className="resume-section-header">{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div>{parseMarkdown(data.summary)}</div>
          </Wrapper>
        );
      case 'experience':
        if (!validExp.length) return null;
        return (
          <Wrapper {...getWrapProps('experience')}>
            <div className="resume-section-header">{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => {
                const itemContent = exp.isSpacer ? (
                  printMode ? <div style={{ height: `${exp.height}px` }} /> : (
                    <NestedSpacer height={exp.height} onChangeHeight={(h) => onItemUpdate('experience', i, { ...exp, height: h })} onDelete={() => onItemDelete('experience', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="resume-exp-header">
                      {exp.link ? (
                        <a href={formatUrl(exp.link)} target="_blank" rel="noopener noreferrer" className="resume-company" style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                          {exp.company}
                        </a>
                      ) : <span className="resume-company">{exp.company}</span>}
                      <span className="resume-dates">
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' — '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div className="resume-title">{exp.title}</div>
                    <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px` }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(b)}</div>)}
                    </div>
                  </div>
                );
                return (
                  <div key={exp.id || i}>
                    {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer('experience', i)} />}
                    <ItemWrapper sectionId="experience" itemId={exp.id} index={i}>{itemContent}</ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );
      case 'education':
        if (!validEdu.length) return null;
        return (
          <Wrapper {...getWrapProps('education')}>
            <div className="resume-section-header">{displayHeading('education', 'Education', 'EDUCATION')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => {
                const itemContent = edu.isSpacer ? (
                  printMode ? <div style={{ height: `${edu.height}px` }} /> : (
                    <NestedSpacer height={edu.height} onChangeHeight={(h) => onItemUpdate('education', i, { ...edu, height: h })} onDelete={() => onItemDelete('education', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="resume-exp-header">
                      <span className="resume-company">{edu.institution}</span>
                      <span className="resume-dates">{edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}</span>
                    </div>
                    <div className="resume-title">{[edu.degree, edu.field].filter(Boolean).join(', ')}</div>
                  </div>
                );
                return (
                  <div key={edu.id || i}>
                    {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer('education', i)} />}
                    <ItemWrapper sectionId="education" itemId={edu.id} index={i}>{itemContent}</ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );
      case 'projects':
        if (!validProj.length) return null;
        return (
          <Wrapper {...getWrapProps('projects')}>
            <div className="resume-section-header">{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => {
                const itemContent = pr.isSpacer ? (
                  printMode ? <div style={{ height: `${pr.height}px` }} /> : (
                    <NestedSpacer height={pr.height} onChangeHeight={(h) => onItemUpdate('projects', i, { ...pr, height: h })} onDelete={() => onItemDelete('projects', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="resume-exp-header">
                      <span className="resume-company">{pr.name}</span>
                      {pr.link && <a href={formatUrl(pr.link)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: 'var(--resume-accent-color)', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>Link</a>}
                    </div>
                    {pr.description && <div style={{ fontSize: '0.95em', marginBottom: '4px' }}>{pr.description}</div>}
                    {pr.techStack && <div style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)', marginBottom: '4px' }}><strong>Tech:</strong> {pr.techStack}</div>}
                    <div>
                      {pr.highlights.filter(Boolean).map((h, hi) => <div key={hi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(h)}</div>)}
                    </div>
                  </div>
                );
                return (
                  <div key={pr.id || i}>
                    {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer('projects', i)} />}
                    <ItemWrapper sectionId="projects" itemId={pr.id} index={i}>{itemContent}</ItemWrapper>
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
              {printMode ? <div style={{ height: `${spacerSec.height}px` }} /> : (
                <NestedSpacer height={spacerSec.height} onChangeHeight={(h) => onUpdateSectionSpacer && onUpdateSectionSpacer(sectionId, h)} onDelete={() => onDeleteSectionSpacer && onDeleteSectionSpacer(sectionId)} />
              )}
            </Wrapper>
          );
        }
        if (sectionId.startsWith('custom_')) {
          const customSec = data.customSections?.find(s => s.id === sectionId);
          if (!customSec) return null;
          const validItems = customSec.items.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems.length) return null;
          return (
            <Wrapper {...getWrapProps(sectionId)}>
              <div className={['custom_langues', 'custom_atouts', 'custom_loisirs'].includes(sectionId) && isSidebar(sectionId) ? "modern-sidebar-section-title" : "resume-section-header"}>{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? <div style={{ height: `${item.height}px` }} /> : (
                      <NestedSpacer height={item.height} onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })} onDelete={() => onItemDelete(sectionId, i)} />
                    )
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div className="resume-exp-header">
                        {item.title && <span className="resume-company">{item.title}</span>}
                        {item.date && <span className="resume-dates">{item.date}</span>}
                      </div>
                      {item.subtitle && <div className="resume-title" style={{ marginBottom: '2px' }}>{item.subtitle}</div>}
                      {item.description && <div>{parseMarkdown(item.description)}</div>}
                    </div>
                  );
                  return (
                    <div key={item.id || i}>
                      {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer(sectionId, i)} />}
                      <ItemWrapper sectionId={sectionId} itemId={item.id} index={i}>{itemContent}</ItemWrapper>
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

  const isSidebar = (id) => {
    return ['contact', 'skills', 'certifications'].includes(id) || id.startsWith('spacer_sidebar_');
  };

  const sectionOrder = data.sectionOrder || [];
  const sidebarOrder = sectionOrder.filter(id => isSidebar(id));
  const mainOrder = sectionOrder.filter(id => !isSidebar(id));

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

        {sidebarOrder.map((sectionId, idx) => {
          const rendered = renderSection(sectionId);
          if (!rendered) return null;
          return (
            <div key={sectionId}>
              {!printMode && onAddSectionSpacer && InsertSpacerButton && idx > 0 && (
                <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId), 'sidebar')} />
              )}
              {rendered}
            </div>
          );
        })}
      </div>

      {/* Right Main */}
      <div className="modern-main" style={{ gap: `${sectionSpacing}px` }}>
        {mainOrder.map((sectionId, idx) => {
          const rendered = renderSection(sectionId);
          if (!rendered) return null;
          return (
            <div key={sectionId}>
              {!printMode && onAddSectionSpacer && InsertSpacerButton && idx > 0 && (
                <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId), 'main')} />
              )}
              {rendered}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ModernTemplate);
"""

new_content = header_part + new_layout
with open('src/components/ModernTemplate.jsx', 'w') as f:
    f.write(new_content)
