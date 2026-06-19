import { memo } from 'react';
import { parseMarkdown, formatUrl } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

const Icons = {
  Briefcase: () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  GraduationCap: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
  Folder: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Lightbulb: () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
};

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

  const renderSkills = (skillsString, inlineStyles) => {
    if (!skillsString) return null;
    const style = layout.skillStyle || 'pill';
    if (style === 'text') {
      const skillsArray = skillsString.split(',').map(s => s.trim()).filter(Boolean);
      return (
        <span style={{ fontSize: '0.95em', lineHeight: '1.5' }}>
          {skillsArray.map((skill, si) => (
            <span key={si}>
              {si > 0 && ' • '}
              {parseMarkdown(skill)}
            </span>
          ))}
        </span>
      );
    }
    const className = style === 'square' ? 'skill-square' : 'skill-pill';
    return skillsString.split(',').map((skill, si) => skill.trim() ? <span key={si} className={className} style={inlineStyles}>{parseMarkdown(skill.trim())}</span> : null);
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
    if (m && y) return `${t(m)} ${y}`;
    return y || t(m) || '';
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
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sidebarOrder.map((sectionId, idx) => {
            const rendered = renderSection(sectionId);
            if (!rendered) return null;
            return (
              <div key={sectionId}>
                {!printMode && onAddSectionSpacer && InsertSpacerButton && (
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
                {!printMode && onAddSectionSpacer && InsertSpacerButton && (
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
