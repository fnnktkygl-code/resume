import re

with open('src/components/CreativeTemplate.jsx', 'r') as f:
    content = f.read()

# Find the start of the return statement
# We want to keep the header as is, and just refactor the body
# Look for {/* Two-Column Grid Body */}
match = re.search(r'      \{\/\* Two-Column Grid Body \*\/\}', content)
start_idx = match.start()

header_part = content[:start_idx]

# I have pre-written the new layout code for CreativeTemplate
new_layout = """      {/* Two-Column Grid Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
    </div>
  );
}

export default memo(CreativeTemplate);
"""

# Now we also need to inject `renderSection`, `isSidebar`, `sidebarOrder`, and `mainOrder` right before the `return` statement.
match_return = re.search(r'  return \(\n    <div className="creative-resume"', content)
pre_return_idx = match_return.start()

setup_part = content[:pre_return_idx]
post_setup_part = content[pre_return_idx:start_idx]

# But wait, `renderSection` must be defined in `setup_part`.
setup_additions = """
  const isSidebar = (id) => {
    return ['summary', 'skills', 'certifications'].includes(id) || id.startsWith('spacer_sidebar_');
  };

  const sectionOrder = data.sectionOrder || [];
  const sidebarOrder = sectionOrder.filter(id => isSidebar(id));
  const mainOrder = sectionOrder.filter(id => !isSidebar(id));

  const SectionHeading = ({ children, icon }) => (
    <div style={{ 
      color: primaryColor, 
      borderBottom: `2px solid ${primaryColor}`, 
      paddingBottom: '4px', 
      marginBottom: '12px',
      textTransform: 'uppercase',
      fontWeight: '800',
      letterSpacing: '0.5px',
      fontSize: '1em',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {icon} {children}
    </div>
  );

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <Wrapper {...getWrapProps('summary')} style={{ backgroundColor: 'var(--resume-surface, #f8f9fa)', padding: '16px', borderRadius: '12px', border: `1px solid var(--resume-border-color, #eaeaea)` }}>
            <div style={{ fontWeight: '700', color: textColor, marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.9em', letterSpacing: '0.5px' }}>
              {displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}
            </div>
            <div style={{ fontSize: '0.95em', lineHeight: '1.6' }}>{parseMarkdown(data.summary)}</div>
          </Wrapper>
        );
      case 'skills':
        if (!hasSkills) return null;
        return (
          <Wrapper {...getWrapProps('skills')} style={{ backgroundColor: 'var(--resume-surface, #f8f9fa)', padding: '16px', borderRadius: '12px', border: `1px solid var(--resume-border-color, #eaeaea)` }}>
            <div style={{ fontWeight: '700', color: textColor, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.9em', letterSpacing: '0.5px' }}>
              {displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.skills.technical && (
                <div>
                  <strong style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)', display: 'block', marginBottom: '6px' }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.technical, 'skill-pill-accent')}
                  </div>
                </div>
              )}
              {data.skills.soft && (
                <div>
                  <strong style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)', display: 'block', marginBottom: '6px' }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.soft, 'skill-pill')}
                  </div>
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div>
                  <strong style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)', display: 'block', marginBottom: '6px' }}>{displayHeading('languages', 'Languages', 'Languages')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.languages, 'skill-pill-outline')}
                  </div>
                </div>
              )}
            </div>
          </Wrapper>
        );
      case 'certifications':
        if (!validCert.length) return null;
        return (
          <Wrapper {...getWrapProps('certifications')} style={{ backgroundColor: 'var(--resume-surface, #f8f9fa)', padding: '16px', borderRadius: '12px', border: `1px solid var(--resume-border-color, #eaeaea)` }}>
            <div style={{ fontWeight: '700', color: textColor, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.9em', letterSpacing: '0.5px' }}>
              {displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {validCert.map((c, i) => {
                const itemContent = c.isSpacer ? (
                  printMode ? <div style={{ height: `${c.height}px` }} /> : <NestedSpacer height={c.height} onChangeHeight={(h) => onItemUpdate('certifications', i, { ...c, height: h })} onDelete={() => onItemDelete('certifications', i)} />
                ) : (
                  <div>
                    <strong style={{ fontSize: '0.95em', display: 'block' }}>{c.name}</strong>
                    <div style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)' }}>{c.issuer}{c.date ? ` • ${c.date}` : ''}</div>
                  </div>
                );
                return (
                  <div key={c.id || i}>
                    {!printMode && i > 0 && <InsertSpacerButton onClick={() => onAddSpacer('certifications', i)} />}
                    <ItemWrapper sectionId="certifications" itemId={c.id} index={i}>{itemContent}</ItemWrapper>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );
      case 'experience':
        if (!validExp.length) return null;
        return (
          <Wrapper {...getWrapProps('experience')}>
            <SectionHeading icon={<Icons.Briefcase />}>{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {validExp.map((exp, i) => {
                const itemContent = exp.isSpacer ? (
                  printMode ? <div style={{ height: `${exp.height}px` }} /> : <NestedSpacer height={exp.height} onChangeHeight={(h) => onItemUpdate('experience', i, { ...exp, height: h })} onDelete={() => onItemDelete('experience', i)} />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ fontSize: '0.9em', color: primaryColor, fontWeight: '600', textAlign: 'right', paddingTop: '2px' }}>
                      {formatDate(exp.startMonth, exp.startYear)}
                      <br/>
                      <span style={{ color: 'var(--resume-text-secondary)' }}>
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1em', fontWeight: '700', margin: '0 0 4px 0', color: textColor }}>
                        {exp.title}
                        <span style={{ color: primaryColor, margin: '0 6px' }}>@</span>
                        {exp.link ? <a href={formatUrl(exp.link)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>{exp.company}</a> : exp.company}
                      </h3>
                      <div style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: `2px solid var(--resume-border-color, #eee)` }}>
                        {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} className="resume-bullet" style={{ marginBottom: '4px' }}><span style={{ color: primaryColor, marginRight: '6px' }}>•</span>{parseMarkdown(b)}</div>)}
                      </div>
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
            <SectionHeading icon={<Icons.GraduationCap />}>{displayHeading('education', 'Education', 'EDUCATION')}</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {validEdu.map((edu, i) => {
                const itemContent = edu.isSpacer ? (
                  printMode ? <div style={{ height: `${edu.height}px` }} /> : <NestedSpacer height={edu.height} onChangeHeight={(h) => onItemUpdate('education', i, { ...edu, height: h })} onDelete={() => onItemDelete('education', i)} />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05em', fontWeight: '700', margin: '0 0 2px 0', color: textColor }}>{edu.institution}</h3>
                      <div style={{ fontSize: '0.95em', color: primaryColor, fontWeight: '500' }}>{[edu.degree, edu.field].filter(Boolean).join(', ')}</div>
                    </div>
                    <div style={{ fontSize: '0.9em', color: 'var(--resume-text-secondary)', textAlign: 'right' }}>
                      {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                    </div>
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
            <SectionHeading icon={<Icons.Folder />}>{displayHeading('projects', 'Projects', 'PROJECTS')}</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {validProj.map((pr, i) => {
                const itemContent = pr.isSpacer ? (
                  printMode ? <div style={{ height: `${pr.height}px` }} /> : <NestedSpacer height={pr.height} onChangeHeight={(h) => onItemUpdate('projects', i, { ...pr, height: h })} onDelete={() => onItemDelete('projects', i)} />
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.05em', fontWeight: '700', margin: 0, color: textColor }}>{pr.name}</h3>
                      {pr.link && <a href={formatUrl(pr.link)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85em', color: primaryColor, textDecoration: 'none', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: `${primaryColor}15` }} onClick={(e) => e.stopPropagation()}>Link ↗</a>}
                    </div>
                    {pr.description && <div style={{ fontSize: '0.95em', color: 'var(--resume-text-secondary)', marginBottom: '8px' }}>{pr.description}</div>}
                    <div style={{ paddingLeft: '12px', borderLeft: `2px solid var(--resume-border-color, #eee)` }}>
                      {pr.highlights.filter(Boolean).map((h, hi) => <div key={hi} className="resume-bullet" style={{ marginBottom: '4px' }}><span style={{ color: primaryColor, marginRight: '6px' }}>•</span>{parseMarkdown(h)}</div>)}
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
          
          const inSidebar = isSidebar(sectionId);
          
          return (
            <Wrapper {...getWrapProps(sectionId)} style={inSidebar ? { backgroundColor: 'var(--resume-surface, #f8f9fa)', padding: '16px', borderRadius: '12px', border: `1px solid var(--resume-border-color, #eaeaea)` } : {}}>
              {inSidebar ? (
                 <div style={{ fontWeight: '700', color: textColor, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.9em', letterSpacing: '0.5px' }}>{customSec.label || 'Custom'}</div>
              ) : (
                 <SectionHeading icon={<Icons.Lightbulb />}>{customSec.label || 'Custom'}</SectionHeading>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? <div style={{ height: `${item.height}px` }} /> : <NestedSpacer height={item.height} onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })} onDelete={() => onItemDelete(sectionId, i)} />
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.title && <h3 style={{ fontSize: '1.05em', fontWeight: '700', margin: 0 }}>{item.title}</h3>}
                        {item.date && <span style={{ fontSize: '0.85em', color: 'var(--resume-text-secondary)' }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <div style={{ fontSize: '0.95em', color: primaryColor, fontWeight: '600', marginTop: '2px' }}>{item.subtitle}</div>}
                      {item.description && <div style={{ marginTop: '6px' }}>{parseMarkdown(item.description)}</div>}
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
"""

new_content = setup_part + setup_additions + post_setup_part + new_layout
with open('src/components/CreativeTemplate.jsx', 'w') as f:
    f.write(new_content)
