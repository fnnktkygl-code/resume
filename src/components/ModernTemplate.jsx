import { memo } from 'react';
import { parseMarkdown, formatUrl, formatSkills, renderBullet, parseSkillsToTags } from '../utils/formatText';

import { getTranslation } from '../utils/translations';
import { hasContactInfo, displayHeading as _displayHeading, formatResumeDate } from '../utils/resumeHelpers';

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
  onAddSectionSpacer,
  onUpdateSectionSpacer,
  onDeleteSectionSpacer,
  printMode = false,
  onSkillHighlightToggle
}) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => _displayHeading(h, key, defaultEn, tKey, language);

  const highlightedSkills = data?.skills?.highlightedSkills || [];
  const hasPerSkillHighlights = highlightedSkills.length > 0;

  const getSkillClass = (skillText, defaultClass) => {
    const key = (skillText || '').toLowerCase().trim();
    if (hasPerSkillHighlights) {
      return highlightedSkills.includes(key) ? defaultClass.replace('skill-pill', 'skill-pill-accent').replace('skill-square', 'skill-square-accent') : defaultClass.replace('-accent', '');
    }
    return defaultClass;
  };

  const handleSkillClick = (skillText) => {
    if (printMode || !onSkillHighlightToggle) return;
    const key = (skillText || '').toLowerCase().trim();
    const current = data?.skills?.highlightedSkills || [];
    const updated = current.includes(key)
      ? current.filter(s => s !== key)
      : [...current, key];
    onSkillHighlightToggle(updated);
  };

  const renderSkills = (skillsString, defaultClass) => {
    if (!skillsString) return null;
    const style = layout.skillStyle || 'pill';
    const skillTags = parseSkillsToTags(skillsString);
    if (style === 'text') {
      return (
        <span style={{ fontSize: '0.95em', lineHeight: '1.5' }}>
          {skillTags.map((skill, si) => {
            const cls = getSkillClass(skill, defaultClass);
            const isAccent = cls.includes('-accent');
            return (
              <span key={si}
                onClick={() => handleSkillClick(skill)}
                style={{ 
                  cursor: printMode ? 'default' : 'pointer',
                  color: isAccent ? 'var(--resume-accent-color, #1B6B3A)' : undefined,
                  fontWeight: isAccent ? 600 : undefined,
                  transition: 'color 0.2s ease, font-weight 0.2s ease'
                }}
                data-tooltip={!printMode ? (isAccent ? t('Click to remove highlight') : t('Click to highlight skill')) : undefined}
              >
                {si > 0 && ' • '}
                {parseMarkdown(skill)}
              </span>
            );
          })}
        </span>
      );
    }
    const baseClass = style === 'square' ? defaultClass.replace('pill', 'square') : defaultClass;
    return skillTags.map((skill, si) => {
      const cls = getSkillClass(skill, baseClass);
      return (
        <span key={si} className={`${cls} skill-toggleable`}
          onClick={() => handleSkillClick(skill)}
          style={{ cursor: printMode ? 'default' : 'pointer', transition: 'all 0.2s ease' }}
          data-tooltip={!printMode ? (cls.includes('-accent') ? t('Click to remove highlight') : t('Click to highlight skill')) : undefined}
        >
          {parseMarkdown(skill)}
        </span>
      );
    });
  };

  const p = data?.personal || {};
  const validExp = (data?.experience || []).filter(e => e?.company || e?.title || e?.isSpacer);
  const validEdu = (data?.education || []).filter(e => e?.institution || e?.degree || e?.isSpacer);
  const validProj = (data?.projects || []).filter(pr => pr?.name || pr?.isSpacer);
  const validCert = (data?.certifications || []).filter(c => c?.name || c?.isSpacer);
  const hasCustomLangues = (data?.customSections || []).some(s => 
    s?.id === 'custom_langues' && (s?.items || []).some(i => i?.title || i?.subtitle || i?.description || i?.isSpacer)
  );
  const hasSkills = data?.skills?.technical || data?.skills?.soft || (data?.skills?.languages && !hasCustomLangues);
  const h = data?.headings || {};

  const getWrapProps = (id) => {
    if (SectionWrapper) {
      return { sectionId: id };
    }
    return {
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

  const formatDate = (m, y) => formatResumeDate(m, y, language);

  const hasContact = hasContactInfo(p);

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'contact':
        if (!hasContact) return null;
        return (
          <div key="contact">
            <div className="modern-sidebar-section-title">{t('Contact')}</div>
            {p.email && <div className="modern-sidebar-item"><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a></div>}
            {p.phone && <div className="modern-sidebar-item"><a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a></div>}
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
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.3px', opacity: 0.7 }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.technical, layout.coloredSkills !== false ? 'skill-pill-accent' : 'skill-pill')}
                </div>
              </div>
            )}
            {data.skills.soft && (
              <div className="modern-sidebar-item" style={{ paddingTop: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.3px', opacity: 0.7 }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.soft, layout.coloredSkills !== false ? 'skill-pill-accent' : 'skill-pill')}
                </div>
              </div>
            )}
            {data.skills.languages && !hasCustomLangues && (
              <div className="modern-sidebar-item" style={{ paddingTop: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.3px', opacity: 0.7 }}>{displayHeading('languages', 'Languages', 'Languages')}</strong>
                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {renderSkills(data.skills.languages, layout.coloredSkills !== false ? 'skill-pill-accent' : 'skill-pill-outline')}
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
                    <div className="resume-title">{parseMarkdown(exp.title)}</div>
                    <div style={{ marginTop: `${Math.round(itemSpacing/2)}px` }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{renderBullet(b)}</div>)}
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
                    <div className="resume-title">{parseMarkdown([edu.degree, edu.field].filter(Boolean).join(', '))}</div>
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
                      {pr.highlights.filter(Boolean).map((h, hi) => <div key={hi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{renderBullet(h)}</div>)}
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

          // Detect simple-list sections — compact rendering
          const label = (customSec.label || '').toLowerCase();
          const isSimpleList = /langue|language|idioma|atout|strength|qualit|asset|compétenc|competenc|loisir|hobbi|interest|détente|intere/.test(label);

          if (isSimpleList) {
            const isInSidebar = isSidebar(sectionId);
            return (
              <Wrapper {...getWrapProps(sectionId)}>
                <div className={isInSidebar ? "modern-sidebar-section-title" : "resume-section-header"}>{customSec.label || 'Custom'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {validItems.map((item, i) => {
                    if (item.isSpacer) {
                      return printMode ? (
                        <div key={item.id || i} style={{ height: `${item.height}px` }} />
                      ) : (
                        <NestedSpacer key={item.id || i} height={item.height} onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })} onDelete={() => onItemDelete(sectionId, i)} />
                      );
                    }
                    return (
                      <div key={item.id || i}>
                        <ItemWrapper sectionId={sectionId} itemId={item.id} index={i}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.85em' }}>•</span>
                            <span>
                              {item.title && <strong>{typeof item.title === 'string' ? item.title.replace(/\*\*/g, '').replace(/<[^>]+>/g, '') : item.title}</strong>}
                              {item.title && item.subtitle && ' — '}
                              {item.subtitle && <em style={{ fontWeight: 'normal' }}>{typeof item.subtitle === 'string' ? item.subtitle.replace(/\*\*/g, '').replace(/<[^>]+>/g, '') : item.subtitle}</em>}
                            </span>
                          </div>
                          {item.description && <div style={{ marginLeft: '12px', marginTop: '2px', whiteSpace: 'pre-line', fontSize: '0.9em' }}>{parseMarkdown(item.description)}</div>}
                        </ItemWrapper>
                      </div>
                    );
                  })}
                </div>
              </Wrapper>
            );
          }

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
      <div className="modern-sidebar" style={{ gap: `${sectionSpacing}px` }}>
        <div
          className={onSectionClick && !printMode ? 'preview-interactive-section' : ''}
          style={onSectionClick && !printMode ? { cursor: 'pointer', padding: '4px', margin: '-4px', borderRadius: '4px' } : {}}
          onClick={onSectionClick && !printMode ? () => onSectionClick('personal') : undefined}
        >
          {p.showPhoto && p.photo && (
            <div className="resume-photo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }} data-testid="profile-photo-container">
              <img src={p.photo} alt={p.name || "Profile"} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--resume-accent-color, #1B6B3A)` }} />
            </div>
          )}
          {p.name && <div className="resume-name">{p.name}</div>}
          {p.tagline && <div className="resume-tagline">{parseMarkdown(p.tagline)}</div>}
        </div>

        {sidebarOrder.map((sectionId, idx) => {
          const rendered = renderSection(sectionId);
          if (!rendered) return null;
          return (
            <div key={sectionId}>
              {!printMode && onAddSectionSpacer && InsertSpacerButton && (
                <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId) - 1, 'sidebar')} />
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
              {!printMode && onAddSectionSpacer && InsertSpacerButton && (
                <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId) - 1, 'main')} />
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
