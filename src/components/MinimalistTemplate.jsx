import { memo } from 'react';
import { parseMarkdown, formatUrl, formatSkills, renderBullet, parseSkillsToTags } from '../utils/formatText';
import { getTranslation } from '../utils/translations';
import { hasContactInfo, displayHeading as _displayHeading, formatResumeDate } from '../utils/resumeHelpers';

function MinimalistTemplate({ 
  data, 
  layout = {}, 
  language = 'en', 
  onSectionClick, 
  SectionWrapper,
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

  const highlightedSkills = data?.skills?.highlightedSkills || [];
  const hasPerSkillHighlights = highlightedSkills.length > 0;

  const handleSkillClick = (skillText) => {
    if (printMode || !onSkillHighlightToggle) return;
    const key = (skillText || '').toLowerCase().trim();
    const current = data?.skills?.highlightedSkills || [];
    const updated = current.includes(key)
      ? current.filter(s => s !== key)
      : [...current, key];
    onSkillHighlightToggle(updated);
  };

  const renderMinimalistSkills = (skillsString) => {
    const tags = parseSkillsToTags(skillsString);
    return (
      <span>
        {tags.map((skill, si) => {
          const key = (skill || '').toLowerCase().trim();
          const isAccent = hasPerSkillHighlights
            ? highlightedSkills.includes(key)
            : layout.coloredSkills !== false;
          return (
            <span key={si}
              onClick={() => handleSkillClick(skill)}
              style={{
                color: isAccent ? primaryColor : textColor,
                fontWeight: isAccent ? 700 : 'normal',
                cursor: printMode ? 'default' : 'pointer',
                transition: 'color 0.2s ease, font-weight 0.2s ease'
              }}
              title={!printMode ? (isAccent ? 'Cliquer pour retirer la mise en valeur' : 'Cliquer pour mettre en valeur') : undefined}
            >
              {si > 0 && ', '}
              {skill}
            </span>
          );
        })}
      </span>
    );
  };

  const getWrapProps = (id, style) => {
    if (SectionWrapper) {
      return { sectionId: id, style: style };
    }
    return {
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
  const formatDate = (m, y) => formatResumeDate(m, y, language);
  const primaryColor = 'var(--resume-accent-color, ' + (layout.accentColor || '#1E3A8A') + ')';
  const textColor = 'var(--resume-text-color, #222)';
  const hasContact = hasContactInfo(p);

  const renderSection = (sectionId) => {
    const sectionTitleStyle = {
      fontSize: `${fontSize + 1.5}pt`,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: primaryColor,
      borderBottom: `1.5px solid ${primaryColor}`,
      paddingBottom: '2px',
      marginBottom: '6px'
    };

    const sectionWrapperStyle = {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: `${sectionSpacing}px`,
      cursor: onSectionClick ? 'pointer' : 'default',
      padding: onSectionClick ? '4px' : '0',
      margin: onSectionClick ? `-4px -4px ${sectionSpacing - 4}px -4px` : `0 0 ${sectionSpacing}px 0`,
      borderRadius: '4px',
      pageBreakInside: 'avoid'
    };

    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <Wrapper {...getWrapProps('summary', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div style={{ color: textColor, textAlign: 'justify', fontSize: `${fontSize}pt` }}>{parseMarkdown(data.summary)}</div>
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
                  printMode ? <div style={{ height: `${exp.height}px` }} /> : (
                    <NestedSpacer height={exp.height} onChangeHeight={(h) => onItemUpdate('experience', i, { ...exp, height: h })} onDelete={() => onItemDelete('experience', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: `${fontSize}pt`, color: textColor }}>{parseMarkdown(exp.title)}</strong>
                      <span style={{ fontSize: `${fontSize - 0.5}pt`, color: 'var(--resume-text-secondary, #555)', whiteSpace: 'nowrap' }}>
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' – '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize - 0.5}pt`, marginBottom: '4px' }}>
                      <strong style={{ color: primaryColor, fontStyle: 'italic' }}>{exp.company}</strong>
                      {exp.location && <span style={{ fontStyle: 'italic', color: 'var(--resume-text-secondary, #555)' }}> — {exp.location}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} className="resume-bullet" style={{ display: 'flex', fontSize: `${fontSize}pt`, color: textColor }}>
                          <span style={{ marginRight: '6px' }}>•</span>
                          <div>{renderBullet(b)}</div>
                        </div>
                      ))}
                    </div>
                    {exp.technologies && (
                      <div style={{ fontSize: `${fontSize - 1.5}pt`, color: 'var(--resume-text-secondary, #555)', fontStyle: 'italic', marginTop: '2px' }}>
                        {parseMarkdown(exp.technologies)}
                      </div>
                    )}
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
          <Wrapper {...getWrapProps('education', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('education', 'Education', 'EDUCATION')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => {
                const itemContent = edu.isSpacer ? (
                  printMode ? <div style={{ height: `${edu.height}px` }} /> : (
                    <NestedSpacer height={edu.height} onChangeHeight={(h) => onItemUpdate('education', i, { ...edu, height: h })} onDelete={() => onItemDelete('education', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: `${fontSize}pt`, color: textColor }}>{edu.degree}</strong>
                      <span style={{ fontSize: `${fontSize - 0.5}pt`, color: 'var(--resume-text-secondary, #555)', whiteSpace: 'nowrap' }}>
                        {edu.startYear}{edu.startYear && edu.endYear && ' – '}{edu.endYear}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize - 0.5}pt`, marginBottom: '4px' }}>
                      <strong style={{ color: primaryColor, fontStyle: 'italic' }}>{edu.institution}</strong>
                      {edu.location && <span style={{ fontStyle: 'italic', color: 'var(--resume-text-secondary, #555)' }}> — {edu.location}</span>}
                    </div>
                    {edu.field && (
                      <div style={{ fontSize: `${fontSize - 1}pt`, color: 'var(--resume-text-secondary, #555)', fontStyle: 'italic', marginTop: '2px' }}>
                        {edu.field}
                      </div>
                    )}
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

      case 'skills':
        if (!hasSkills) return null;
        return (
          <Wrapper {...getWrapProps('skills', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: `${fontSize}pt`, color: textColor }}>
              {data.skills.technical && (
                <div style={{ marginBottom: '6px', lineHeight: '1.4' }}>
                  <strong style={{ color: textColor }}>{displayHeading('technical', 'Technical Skills', 'Technical Skills')} : </strong>
                  {renderMinimalistSkills(data.skills.technical)}
                </div>
              )}
              {data.skills.soft && (
                <div style={{ marginBottom: '6px', lineHeight: '1.4', paddingTop: '6px', borderTop: `1px solid ${textColor}1A` }}>
                  <strong style={{ color: textColor }}>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')} : </strong>
                  {renderMinimalistSkills(data.skills.soft)}
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div style={{ marginBottom: '6px', lineHeight: '1.4', paddingTop: '6px', borderTop: `1px solid ${textColor}1A` }}>
                  <strong style={{ color: textColor }}>{displayHeading('languages', 'Languages', 'Languages')} : </strong>
                  {renderMinimalistSkills(data.skills.languages)}
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
                  printMode ? <div style={{ height: `${pr.height}px` }} /> : (
                    <NestedSpacer height={pr.height} onChangeHeight={(h) => onItemUpdate('projects', i, { ...pr, height: h })} onDelete={() => onItemDelete('projects', i)} />
                  )
                ) : (
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: `${fontSize}pt`, color: textColor }}>{pr.name}</strong>
                      {pr.link && <span style={{ fontSize: `${fontSize - 0.5}pt`, color: 'var(--resume-text-secondary, #666)' }}>{pr.link}</span>}
                    </div>
                    {pr.description && <div style={{ fontSize: `${fontSize}pt`, color: textColor, margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {pr.highlights.filter(Boolean).map((h, hi) => (
                        <div key={hi} className="resume-bullet" style={{ display: 'flex', fontSize: `${fontSize}pt`, color: textColor, marginTop: '2px' }}>
                          <span style={{ marginRight: '6px' }}>•</span>
                          <div>{renderBullet(h)}</div>
                        </div>
                      ))}
                    </div>
                    {pr.techStack && <div style={{ fontSize: `${fontSize - 1.5}pt`, color: 'var(--resume-text-secondary, #666)', fontStyle: 'italic', marginTop: '4px' }}>Tech: {pr.techStack}</div>}
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

      case 'certifications':
        if (!validCert.length) return null;
        return (
          <Wrapper {...getWrapProps('certifications', sectionWrapperStyle)}>
            <div style={sectionTitleStyle}>{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {validCert.map((c, i) => {
                const itemContent = c.isSpacer ? (
                  printMode ? <div style={{ height: `${c.height}px` }} /> : (
                    <NestedSpacer height={c.height} onChangeHeight={(h) => onItemUpdate('certifications', i, { ...c, height: h })} onDelete={() => onItemDelete('certifications', i)} />
                  )
                ) : (
                  <div style={{ fontSize: `${fontSize}pt`, color: textColor, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong style={{ color: primaryColor }}>{c.name}</strong> — {c.issuer}{c.date ? ` (${c.date})` : ''}
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
          if (!customSec || !customSec.items.length) return null;
          const validItems = customSec.items.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems.length) return null;

          // Detect simple-list sections — compact rendering
          const label = (customSec.label || '').toLowerCase();
          const isSimpleList = /langue|language|idioma|atout|strength|qualit|asset|compétenc|competenc|loisir|hobbi|interest|détente|intere/.test(label);

          if (isSimpleList) {
            return (
              <Wrapper {...getWrapProps(sectionId, sectionWrapperStyle)}>
                <div style={sectionTitleStyle}>{customSec.label || 'Custom'}</div>
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
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', fontSize: `${fontSize}pt` }}>
                            <span style={{ fontWeight: 'bold' }}>•</span>
                            <span>
                              {item.title && <strong style={{ color: textColor }}>{item.title}</strong>}
                              {item.title && item.subtitle && ' — '}
                              {item.subtitle && <em style={{ color: primaryColor }}>{item.subtitle}</em>}
                            </span>
                          </div>
                          {item.description && <div style={{ marginLeft: '12px', marginTop: '2px', whiteSpace: 'pre-line' }}>{parseMarkdown(item.description)}</div>}
                        </ItemWrapper>
                      </div>
                    );
                  })}
                </div>
              </Wrapper>
            );
          }

          return (
            <Wrapper {...getWrapProps(sectionId, sectionWrapperStyle)}>
              <div style={sectionTitleStyle}>{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? <div style={{ height: `${item.height}px` }} /> : (
                      <NestedSpacer height={item.height} onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })} onDelete={() => onItemDelete(sectionId, i)} />
                    )
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid', fontSize: `${fontSize}pt` }}>
                      {(item.title || item.date) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ color: textColor }}>{item.title}</strong>
                          {item.date && <span style={{ fontSize: `${fontSize - 0.5}pt`, color: 'var(--resume-text-secondary, #555)' }}>{item.date}</span>}
                        </div>
                      )}
                      {item.subtitle && <div style={{ color: primaryColor, fontWeight: 'bold' }}>{item.subtitle}</div>}
                      {item.description && <div style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>{parseMarkdown(item.description)}</div>}
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

  const resumeStyles = {
    fontFamily: layout.fontFamily || "'Open Sans', 'Inter', sans-serif",
    color: textColor,
    lineHeight: lineHeight,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    textAlign: 'left'
  };

  return (
    <div className="minimalist-resume" style={resumeStyles}>
      {/* Header Section */}
      <div 
        className={onSectionClick && !printMode ? 'preview-interactive-section' : ''}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderBottom: `1.5px solid var(--resume-border-color, #ccc)`,
          paddingBottom: '12px',
          marginBottom: '16px',
          cursor: onSectionClick && !printMode ? 'pointer' : 'default',
          padding: onSectionClick && !printMode ? '4px 4px 12px 4px' : '0 0 12px 0',
          margin: onSectionClick && !printMode ? '-4px -4px 16px -4px' : '0 0 16px 0',
          borderRadius: '4px'
        }}
        onClick={onSectionClick && !printMode ? () => onSectionClick('personal') : undefined}
      >
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {p.name && (
              <div style={{ fontSize: '20pt', fontWeight: '800', color: primaryColor, letterSpacing: '-0.2px' }}>
                {p.name}
              </div>
            )}
            {p.tagline && (
              <div style={{ fontSize: '12pt', color: textColor, marginTop: '2px' }}>
                {parseMarkdown(p.tagline)}
              </div>
            )}
            {hasContact && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                fontSize: `${fontSize - 1}pt`, 
                color: 'var(--resume-text-secondary, #555)', 
                marginTop: '8px'
              }}>
                {p.phone && <span><a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a></span>}
                {p.email && <span>{p.phone ? '• \u00a0' : ''}<a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a></span>}
                {p.location && <span>{(p.phone || p.email) ? '• \u00a0' : ''}{p.location}</span>}
                {p.linkedin && <span>{(p.phone || p.email || p.location) ? '• \u00a0' : ''}<a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a></span>}
                {p.github && <span>{(p.phone || p.email || p.location || p.linkedin) ? '• \u00a0' : ''}<a href={formatUrl(p.github)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.github}</a></span>}
                {p.website && <span>{(p.phone || p.email || p.location || p.linkedin || p.github) ? '• \u00a0' : ''}<a href={formatUrl(p.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.website}</a></span>}
              </div>
            )}
          </div>
          {p.showPhoto && p.photo && (
            <div className="resume-photo-container" style={{ flexShrink: 0, marginLeft: '20px' }}>
              <img src={p.photo} alt={p.name || "Profile"} style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover', border: `1px solid var(--resume-border-color, #ccc)` }} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sectionOrder.map((sectionId) => {
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
