import { memo } from 'react';
import { parseMarkdown, formatUrl } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

const Icons = {
  Phone: () => <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  Email: () => <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  LinkedIn: () => <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  Location: () => <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Briefcase: () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="12" y1="6" x2="12" y2="6"/></svg>,
  Chart: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  ExternalLink: () => <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle'}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Lightbulb: () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  PlusCircle: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Smile: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  
  Code: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Heart: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  GraduationCap: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
  Award: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Book: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z"/></svg>,
  User: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Star: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  GlobeSmall: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  BriefcaseSmall: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  BuildingSmall: () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="12" y1="6" x2="12" y2="6"/></svg>,
};

function renderExperienceIcon(iconName) {
  switch (iconName) {
    case 'briefcase': return <Icons.BriefcaseSmall />;
    case 'building': return <Icons.BuildingSmall />;
    case 'code': return <Icons.Code />;
    case 'heart': return <Icons.Heart />;
    case 'graduation': return <Icons.GraduationCap />;
    case 'award': return <Icons.Award />;
    case 'globe': return <Icons.GlobeSmall />;
    case 'book': return <Icons.Book />;
    case 'user': return <Icons.User />;
    case 'star': return <Icons.Star />;
    case 'none': return null;
    case 'chart':
    default:
      return <Icons.Chart />;
  }
}

function NjmTemplate({ 
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
  const p = data.personal;
  const hasContact = p.name || p.email || p.phone;
  const validExp = data.experience.filter(e => e.company || e.title || e.isSpacer);
  const validEdu = data.education.filter(e => e.institution || e.degree || e.isSpacer);
  const validProj = data.projects.filter(pr => pr.name || pr.isSpacer);
  const validCert = data.certifications.filter(c => c.name || c.isSpacer);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;

  const h = data.headings || {};

  const displayHeading = (key, defaultEn, tKey) => {
    if (!h[key]) return t(tKey);
    const val = h[key].trim();
    if (!val) return t(tKey);
    const vLower = val.toLowerCase();
    if (vLower === defaultEn.toLowerCase() || vLower === key.toLowerCase() || vLower === 'technical:' || vLower === 'interpersonal:' || vLower === 'languages:') return t(tKey);
    return val;
  };

  const renderSkills = (skillsString, defaultClass = 'skill-pill') => {
    if (!skillsString) return null;
    const style = layout.skillStyle || 'pill';
    if (style === 'text') {
      return <span style={{ lineHeight: '1.5' }}>{skillsString.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}</span>;
    }
    const className = style === 'square' ? defaultClass.replace('pill', 'square') : defaultClass;
    return (
      <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skillsString.split(',').map((skill, si) => skill.trim() ? <span key={si} className={className}>{skill.trim()}</span> : null)}
      </div>
    );
  };

  const getWrapProps = (id) => {
    if (SectionWrapper) {
      return { key: id, sectionId: id };
    }
    return {
      key: id,
      className: onSectionClick ? "preview-interactive-section" : "",
      onClick: onSectionClick ? () => onSectionClick(id) : undefined
    };
  };

  const Wrapper = SectionWrapper || 'div';
  const {
    fontSize = 10,
    sectionSpacing = 12,
    itemSpacing = 8,
    lineHeight = 1.3
  } = layout;

  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  const getBottomColumnSections = () => {
    const matchedIds = new Set();
    
    const langSec = data.customSections?.find(s => 
      s.label?.toLowerCase().includes('langue') || 
      s.label?.toLowerCase().includes('language') || 
      s.label?.toLowerCase().includes('idioma')
    );
    if (langSec) matchedIds.add(langSec.id);

    const atoutsSec = data.customSections?.find(s => 
      s.label?.toLowerCase().includes('atout') || 
      s.label?.toLowerCase().includes('strength') || 
      s.label?.toLowerCase().includes('compétenc') || 
      s.label?.toLowerCase().includes('competenc') || 
      s.label?.toLowerCase().includes('qualit') || 
      s.label?.toLowerCase().includes('asset')
    );
    if (atoutsSec) matchedIds.add(atoutsSec.id);

    const loisirsSec = data.customSections?.find(s => 
      s.label?.toLowerCase().includes('loisir') || 
      s.label?.toLowerCase().includes('hobbi') || 
      s.label?.toLowerCase().includes('interest') || 
      s.label?.toLowerCase().includes('détente') || 
      s.label?.toLowerCase().includes('intere')
    );
    if (loisirsSec) matchedIds.add(loisirsSec.id);

    return { matchedIds, langSec, atoutsSec, loisirsSec };
  };

  const { matchedIds, langSec, atoutsSec, loisirsSec } = getBottomColumnSections();

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${t(m)} ${y}`;
    return y || t(m) || '';
  };

  const primaryColor = layout.accentColor || '#0F3A8C';
  const textColor = 'var(--resume-text-color, #111)';
  const grayColor = 'var(--resume-text-secondary, #444)';

  const sectionHeaderStyle = {
    color: primaryColor,
    borderBottom: `1.5px solid ${primaryColor}`,
    textTransform: 'uppercase',
    fontVariant: 'small-caps',
    fontWeight: 'bold',
    fontSize: '1.2em',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '2px',
    marginBottom: '6px',
    letterSpacing: '0.5px'
  };

  const wrapperStyle = (sectionId) => ({
    marginBottom: `${sectionSpacing}px`,
    cursor: onSectionClick ? 'pointer' : 'default',
    padding: onSectionClick ? '4px' : '0',
    margin: onSectionClick ? '-4px' : `0 0 ${sectionSpacing}px 0`,
    borderRadius: '4px'
  });

  const handleSectionClick = (id) => {
    if (onSectionClick) onSectionClick(id);
  };

  const renderTags = (tagString) => {
    if (!tagString) return null;
    const tags = tagString.split(',').map(s => s.trim()).filter(Boolean);
    if (!tags.length) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
        {tags.map((tag, idx) => (
          <span key={idx} style={{
            fontSize: '0.75em',
            border: '1px solid var(--resume-border-color, #ccc)',
            borderRadius: '4px',
            padding: '1px 6px',
            color: 'var(--resume-text-color, #333)',
            textTransform: 'uppercase',
            backgroundColor: 'var(--color-surface-alt, #fafafa)'
          }}>
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <Wrapper {...getWrapProps('summary')}>
            <div style={sectionHeaderStyle}>
              {displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}
            </div>
            <div style={{ fontWeight: '500', fontSize: '0.95em', color: textColor, textAlign: 'justify' }}>
              {parseMarkdown(data.summary)}
            </div>
          </Wrapper>
        );

      case 'experience':
        if (!validExp.length) return null;
        return (
          <Wrapper {...getWrapProps('experience')}>
            <div style={sectionHeaderStyle}>
              <Icons.Briefcase /> {displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}
            </div>
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
                      <span style={{ fontSize: '1.05em', fontWeight: 'bold', color: textColor, display: 'flex', alignItems: 'center' }}>
                        {renderExperienceIcon(exp.icon)} {exp.title}
                      </span>
                      <span style={{ fontSize: '0.85em', color: grayColor, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {formatDate(exp.startMonth, exp.startYear)}
                        {(exp.startMonth || exp.startYear) && ' — '}
                        {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                      </span>
                    </div>
                    <div style={{ margin: '2px 0 4px', display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.95em' }}>
                      {exp.link ? (
                        <a 
                          href={formatUrl(exp.link)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: primaryColor, fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {exp.company} <Icons.ExternalLink />
                        </a>
                      ) : (
                        <span style={{ color: primaryColor, fontWeight: 'bold' }}>
                          {exp.company}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9em', color: textColor }}>
                          <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.2em', lineHeight: '0.8' }}>›</span>
                          <div style={{ flex: 1 }}>{parseMarkdown(b)}</div>
                        </div>
                      ))}
                    </div>
                    {exp.technologies && renderTags(exp.technologies)}
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
          <Wrapper {...getWrapProps('education')}>
            <div style={sectionHeaderStyle}>
              <Icons.Building /> {displayHeading('education', 'Education', 'EDUCATION')}
            </div>
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
                  <div style={{ display: 'flex', gap: '16px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ width: '50px', flexShrink: 0, textAlign: 'right', fontSize: '0.85em', color: grayColor, textTransform: 'uppercase', paddingTop: '2px' }}>
                      {edu.startYear && <div style={{ marginBottom: '2px' }}>{edu.startYear}</div>}
                      {edu.endYear && <div>{edu.current ? t('PRESENT') : edu.endYear}</div>}
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '1.05em', fontWeight: 'bold', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {[edu.degree, edu.field].filter(Boolean).join(' EN ')}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.95em', color: grayColor, marginTop: '2px' }}>
                        <span style={{ color: grayColor, fontWeight: 'bold', fontSize: '1.2em', lineHeight: '0.8' }}>›</span>
                        {edu.institution}
                      </div>
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
        const skillsList = [];
        if (data.skills.technical) {
          skillsList.push({ label: displayHeading('technical', 'Technical Skills', 'Technical Skills'), value: data.skills.technical });
        }
        if (data.skills.soft) {
          skillsList.push({ label: displayHeading('interpersonal', 'Soft Skills', 'Soft Skills'), value: data.skills.soft });
        }
        return (
          <Wrapper {...getWrapProps('skills')}>
            <div style={sectionHeaderStyle}>
              <Icons.Lightbulb /> {displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {skillsList.map((skill, i) => (
                  <tr key={i}>
                    <td style={{ 
                      width: '140px', 
                      verticalAlign: 'top', 
                      padding: '2px 12px 2px 0', 
                      textAlign: 'right', 
                      fontSize: '0.8em',
                      color: grayColor,
                      textTransform: 'uppercase',
                      fontVariant: 'small-caps',
                      borderRight: '1px solid #ddd'
                    }}>
                      {skill.label}
                    </td>
                    <td style={{ 
                      verticalAlign: 'top', 
                      padding: '2px 0 2px 12px', 
                      fontSize: '0.9em',
                      fontWeight: '500',
                      color: textColor
                    }}>
                      {renderSkills(skill.value, 'skill-pill')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Wrapper>
        );

      case 'projects':
        if (!validProj.length) return null;
        return (
          <Wrapper {...getWrapProps('projects')}>
            <div style={sectionHeaderStyle}>
              <Icons.Award /> {displayHeading('projects', 'Projects', 'PROJECTS')}
            </div>
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
                      <span style={{ fontSize: '1.05em', fontWeight: 'bold', color: textColor }}>
                        {pr.name}
                      </span>
                      {pr.link && <span style={{ fontSize: '0.85em', color: primaryColor }}>{pr.link}</span>}
                    </div>
                    {pr.description && <div style={{ fontSize: '0.9em', color: grayColor, margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                    {pr.techStack && renderTags(pr.techStack)}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      {pr.highlights.filter(Boolean).map((hl, hli) => (
                        <div key={hli} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9em', color: textColor }}>
                          <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.2em', lineHeight: '0.8' }}>›</span>
                          <div style={{ flex: 1 }}>{parseMarkdown(hl)}</div>
                        </div>
                      ))}
                    </div>
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

      default:
        if (sectionId.startsWith('custom_')) {
          const sec = data.customSections?.find(s => s.id === sectionId);
          if (!sec || matchedIds.has(sec.id)) return null;
          
          const validItems = sec.items.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems.length) return null;

          return (
            <Wrapper {...getWrapProps(sec.id)}>
              <div style={sectionHeaderStyle}>
                <Icons.PlusCircle /> {sec.label || t('Custom Section')}
              </div>
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
                        {item.title && (
                          <span style={{ fontSize: '1.05em', fontWeight: 'bold', color: textColor }}>
                            {item.title}
                          </span>
                        )}
                        {item.date && (
                          <span style={{ fontSize: '0.85em', color: grayColor, textTransform: 'uppercase' }}>
                            {item.date}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{ color: primaryColor, fontWeight: 'bold', fontSize: '0.95em', margin: '2px 0 4px' }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.description && (
                        <div style={{ fontSize: '0.9em', color: grayColor, marginTop: '4px', whiteSpace: 'pre-line' }}>
                          {parseMarkdown(item.description)}
                        </div>
                      )}
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
        }
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
        return null;
    }
  };

  const renderBottomColumns = () => {
    const columns = [];

    // Column 1: Languages
    let langItems = [];
    let langTitle = displayHeading('languages', 'Languages', 'Languages');
    let langSectionId = 'skills';
    
    if (langSec) {
      langTitle = langSec.label;
      langItems = langSec.items.map(item => [item.title, item.subtitle, item.description].filter(Boolean).join(' : ')).filter(Boolean);
      langSectionId = langSec.id;
    } else if (data.skills.languages) {
      langItems = data.skills.languages.split(',').map(l => l.trim()).filter(Boolean);
    }
    
    const isLangEmpty = langItems.length === 0;
    if (!isLangEmpty || onSectionClick) {
      columns.push({
        title: langTitle,
        icon: <Icons.Globe />,
        items: isLangEmpty ? [t('Add languages')] : langItems,
        sectionId: langSectionId,
        isPlaceholder: isLangEmpty
      });
    }

    // Column 2: Atouts / Strengths
    let atoutsItems = [];
    let atoutsTitle = atoutsSec ? atoutsSec.label : (language === 'fr' ? 'Atouts' : language === 'es' ? 'Fortalezas' : 'Strengths');
    let atoutsSectionId = atoutsSec ? atoutsSec.id : 'custom_atouts';
    if (atoutsSec) {
      atoutsItems = atoutsSec.items.map(item => [item.title, item.subtitle, item.description].filter(Boolean).join(' : ')).filter(Boolean);
    }
    const isAtoutsEmpty = atoutsItems.length === 0;
    if (!isAtoutsEmpty || onSectionClick) {
      columns.push({
        title: atoutsTitle,
        icon: <Icons.PlusCircle />,
        items: isAtoutsEmpty ? [t('Add strengths')] : atoutsItems,
        sectionId: atoutsSectionId,
        isPlaceholder: isAtoutsEmpty
      });
    }

    // Column 3: Loisirs / Hobbies
    let loisirsItems = [];
    let loisirsTitle = loisirsSec ? loisirsSec.label : (language === 'fr' ? 'Loisirs' : language === 'es' ? 'Aficiones' : 'Hobbies');
    let loisirsSectionId = loisirsSec ? loisirsSec.id : 'custom_loisirs';
    if (loisirsSec) {
      loisirsItems = loisirsSec.items.map(item => [item.title, item.subtitle, item.description].filter(Boolean).join(' : ')).filter(Boolean);
    }
    const isLoisirsEmpty = loisirsItems.length === 0;
    if (!isLoisirsEmpty || onSectionClick) {
      columns.push({
        title: loisirsTitle,
        icon: <Icons.Smile />,
        items: isLoisirsEmpty ? [t('Add hobbies')] : loisirsItems,
        sectionId: loisirsSectionId,
        isPlaceholder: isLoisirsEmpty
      });
    }

    if (!columns.length) return null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: '16px', marginTop: `${sectionSpacing}px`, pageBreakInside: 'avoid' }}>
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className={onSectionClick ? "preview-interactive-section" : ""} 
            onClick={onSectionClick ? () => onSectionClick(col.sectionId) : undefined}
            style={{ cursor: onSectionClick ? 'pointer' : 'default', padding: onSectionClick ? '4px' : '0', margin: onSectionClick ? '-4px' : '0', borderRadius: '4px' }}
          >
            <div
              style={{
                color: primaryColor,
                borderBottom: `1.5px solid ${primaryColor}`,
                textTransform: 'uppercase',
                fontVariant: 'small-caps',
                fontWeight: 'bold',
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                paddingBottom: '2px',
                marginBottom: '6px'
              }}
            >
              {col.icon} {col.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {col.items.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  alignItems: 'flex-start', 
                  fontSize: '0.9em', 
                  color: col.isPlaceholder ? 'var(--resume-text-secondary, #666)' : textColor,
                  fontStyle: col.isPlaceholder ? 'italic' : 'normal',
                  opacity: col.isPlaceholder ? 0.7 : 1
                }}>
                  <span style={{ color: col.isPlaceholder ? 'var(--resume-border-color, #ccc)' : textColor, fontWeight: 'bold', fontSize: '1.2em', lineHeight: '0.8' }}>›</span>
                  <span>{parseMarkdown(item)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const resumePageStyles = {
    fontFamily: layout.fontFamily || "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: textColor,
    backgroundColor: 'transparent', // Let ResumePreview handle background
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div className="njm-resume" style={resumePageStyles}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: `${sectionSpacing}px` }}>
        <div style={{ flex: 1 }}>
          {p.name && (
            <div style={{ color: primaryColor, fontSize: '2em', fontWeight: 600, letterSpacing: '-0.5px' }}>
              {p.name}
            </div>
          )}
          {p.tagline && (
            <div style={{ fontSize: '1.1em', fontWeight: '500', color: textColor, marginTop: '2px' }}>
              {p.tagline}
            </div>
          )}
          
          {hasContact && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              fontSize: '0.85em', 
              color: textColor, 
              marginTop: '8px',
              borderBottom: '1px solid var(--resume-border-color, #eee)',
              paddingBottom: '8px'
            }}>
              {p.phone && <a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500', textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}><Icons.Phone /> {p.phone}</a>}
              {p.email && <a href={`mailto:${p.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500', textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}><Icons.Email /> {p.email}</a>}
              {p.linkedin && <a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500', textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}><Icons.LinkedIn /> {p.linkedin}</a>}
              {p.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', fontWeight: '500' }}><Icons.Location /> {p.location}</span>}
            </div>
          )}
        </div>
        {p.showPhoto && p.photo && (
          <div className="resume-photo-container" style={{ flexShrink: 0 }} data-testid="profile-photo-container">
            <img src={p.photo} alt={p.name || "Profile"} style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${primaryColor}` }} />
          </div>
        )}
      </div>

      {/* Main Sections */}
      <div style={{ flex: 1 }}>
        {sectionOrder
          .filter(s => s !== 'skills')
          .map((sectionId, sectionIdx) => {
            const rendered = renderSection(sectionId);
            if (!rendered) return null;
            return (
              <div key={sectionId}>
                {!printMode && onAddSectionSpacer && InsertSpacerButton && sectionIdx > 0 && (
                  <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionOrder.indexOf(sectionId))} />
                )}
                {rendered}
              </div>
            );
          })}

        {/* Render Skills */}
        {renderSection('skills')}

        {/* Render bottom 3 columns */}
        {renderBottomColumns()}
      </div>
    </div>
  );
}

export default memo(NjmTemplate);
