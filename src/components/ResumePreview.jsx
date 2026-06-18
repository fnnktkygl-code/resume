import { useRef, useState, useEffect, useCallback, memo } from 'react';
import ModernTemplate from './ModernTemplate';
import NjmTemplate from './NjmTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalistTemplate from './MinimalistTemplate';
import { parseMarkdown } from '../utils/formatText';
import { getTranslation } from '../utils/translations';

function ResumePreview({ data, layout = {}, language = 'en', compact = false, printMode = false, template = 'standard', onSectionReorder, onSectionRemove, onSectionClick }) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => (!h[key] || h[key] === defaultEn) ? t(tKey) : h[key];
  const p = data.personal;
  const hasContact = p.name || p.email || p.phone;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasCustomLangues = data.customSections?.some(s => 
    s.id === 'custom_langues' && s.items.some(i => i.title || i.subtitle || i.description)
  );
  const hasSkills = data.skills.technical || data.skills.soft || (data.skills.languages && !hasCustomLangues);
  const hasContent = hasContact || data.summary || validExp.length || validEdu.length || hasSkills || validProj.length || validCert.length;

  const h = data.headings || {};
  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  const { 
    fontSize = 10.5, 
    isCompact = false,
    lineHeight = isCompact ? 1.3 : 1.45,
    paddingX = isCompact ? 0.5 : 0.75,
    paddingY = isCompact ? 0.5 : 0.75,
    sectionSpacing = isCompact ? 4 : 8,
    itemSpacing = isCompact ? 8 : 12,
  } = layout;

  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [wrapperWidth, setWrapperWidth] = useState(compact ? 500 : 500);
  const [pagesCount, setPagesCount] = useState(1);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  useEffect(() => {
    if (printMode || !wrapperRef.current) return;
    let frame;
    const observer = new ResizeObserver(entries => {
      frame = requestAnimationFrame(() => {
        if (wrapperRef.current) {
          setWrapperWidth(wrapperRef.current.getBoundingClientRect().width);
        }
      });
    });
    observer.observe(wrapperRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [printMode]);

  useEffect(() => {
    if (!contentRef.current) return;
    let frame;
    const observer = new ResizeObserver(() => {
      frame = requestAnimationFrame(() => {
        if (!contentRef.current) return;
        let innerH = contentRef.current.offsetHeight;
        if (template === 'modern') {
          const sidebar = contentRef.current.querySelector('.modern-sidebar');
          const main = contentRef.current.querySelector('.modern-main');
          innerH = Math.max(sidebar?.offsetHeight || 0, main?.offsetHeight || 0);
        }
        const totalH = innerH + (paddingY * 2 * 96);
        const neededPages = Math.max(1, Math.ceil(totalH / 1056));
        setPagesCount(neededPages);
      });
    });
    observer.observe(contentRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [hasContent, paddingY, fontSize, lineHeight, paddingX, sectionSpacing, itemSpacing, template]);

  const pageWidth = 816;
  const pageHeight = 1056;
  const scale = printMode ? 1 : wrapperWidth / pageWidth;
 
  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${m} ${y}`;
    return y || m || '';
  };

  // Drag & Drop handlers
  const handleDragStart = useCallback((sectionId) => {
    setDraggedSection(sectionId);
  }, []);

  const handleDragOver = useCallback((e, sectionId) => {
    e.preventDefault();
    if (sectionId !== draggedSection) {
      setDragOverSection(sectionId);
    }
  }, [draggedSection]);

  const handleDragEnd = useCallback(() => {
    if (draggedSection && dragOverSection && draggedSection !== dragOverSection && onSectionReorder) {
      const newOrder = [...sectionOrder];
      const fromIdx = newOrder.indexOf(draggedSection);
      const toIdx = newOrder.indexOf(dragOverSection);
      if (fromIdx !== -1 && toIdx !== -1) {
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedSection);
        onSectionReorder(newOrder);
      }
    }
    setDraggedSection(null);
    setDragOverSection(null);
  }, [draggedSection, dragOverSection, sectionOrder, onSectionReorder]);

  // Section renderers
  const renderSection = (sectionId) => {
    const isDraggable = !printMode && onSectionReorder;
    const wrapProps = isDraggable ? {
      draggable: true,
      onDragStart: () => handleDragStart(sectionId),
      onDragOver: (e) => handleDragOver(e, sectionId),
      onDragEnd: handleDragEnd,
      className: `draggable-section preview-interactive-section${draggedSection === sectionId ? ' dragging' : ''}${dragOverSection === sectionId ? ' drag-over' : ''}`,
      onClick: onSectionClick && !printMode ? () => onSectionClick(sectionId) : undefined,
      style: onSectionClick && !printMode ? { cursor: 'pointer', padding: '2px', margin: '-2px', borderRadius: '4px' } : {}
    } : {
      onClick: onSectionClick && !printMode ? () => onSectionClick(sectionId) : undefined,
      className: onSectionClick && !printMode ? 'preview-interactive-section' : undefined,
      style: onSectionClick && !printMode ? { cursor: 'pointer', padding: '2px', margin: '-2px', borderRadius: '4px' } : {}
    };

    const DragHandleWithActions = () => (
      <div className="section-actions" aria-hidden="true">
        <span className="drag-handle" title={t('Drag to reorder')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </span>
        <button 
          className="section-delete" 
          onClick={(e) => {
            e.stopPropagation();
            onSectionRemove(sectionId);
          }}
          title={t('Delete')}
        >
          ✕
        </button>
      </div>
    );

    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key="summary" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div>{parseMarkdown(data.summary)}</div>
          </div>
        );
      case 'experience':
        if (!validExp.length) return null;
        return (
          <div key="experience" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('experience', 'Work Experience', 'WORK EXPERIENCE')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{exp.company}</span>
                    <span className="resume-dates">
                      {formatDate(exp.startMonth, exp.startYear)}
                      {(exp.startMonth || exp.startYear) && ' — '}
                      {exp.current ? t('PRESENT') : formatDate(exp.endMonth, exp.endYear)}
                    </span>
                  </div>
                  <div className="resume-title">{exp.title}</div>
                  <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px`, display: 'flex', flexDirection: 'column', gap: `${Math.round(itemSpacing / 2)}px` }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{parseMarkdown(b)}</div>
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
          <div key="education" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('education', 'Education', 'EDUCATION')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => (
                <div key={i}>
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
              ))}
            </div>
          </div>
        );
      case 'skills':
        if (!hasSkills) return null;
        return (
          <div key="skills" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(sectionSpacing/1.5)}px` }}>
              {data.skills.technical && (
                <div>
                  <strong>{h.technical}</strong>
                  <div className="skills-container">
                    {data.skills.technical.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill-accent">{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
              {data.skills.soft && (
                <div>
                  <strong>{h.interpersonal}</strong>
                  <div className="skills-container">
                    {data.skills.soft.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill">{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div>
                  <strong>{h.languages}</strong>
                  <div className="skills-container">
                    {data.skills.languages.split(',').map((skill, si) => skill.trim() ? <span key={si} className="skill-pill-outline">{skill.trim()}</span> : null)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'projects':
        if (!validProj.length) return null;
        return (
          <div key="projects" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('projects', 'Projects', 'PROJECTS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => (
                <div key={i}>
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
              ))}
            </div>
          </div>
        );
      case 'certifications':
        if (!validCert.length) return null;
        return (
          <div key="certifications" {...wrapProps}>
            {isDraggable && <DragHandleWithActions />}
            <div className="resume-section-header">{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(sectionSpacing/3)}px` }}>
              {validCert.map((c, i) => (
                <div key={i} className="resume-bullet">
                  <span style={{ marginRight: '6px' }}>•</span>
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
            <div key={sectionId} {...wrapProps}>
              {isDraggable && <DragHandleWithActions />}
              <div className="resume-section-header">{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => (
                  <div key={i}>
                    <div className="resume-exp-header">
                      {item.title && <span className="resume-company">{item.title}</span>}
                      {item.date && <span className="resume-dates">{item.date}</span>}
                    </div>
                    {item.subtitle && <div className="resume-title">{item.subtitle}</div>}
                    {item.description && <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px`, whiteSpace: 'pre-line' }}>
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

  const hexToRgb = (hex) => {
    if (!hex) return '27, 107, 58';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return isNaN(r) ? '27, 107, 58' : `${r}, ${g}, ${b}`;
  };

  const accentColor = layout.accentColor || '#1B6B3A';
  const fontFamily = layout.fontFamily || 'Inter';
  const accentRgb = hexToRgb(accentColor);

  const resumePageStyles = {
    width: `${pageWidth}px`,
    height: printMode ? 'auto' : `${pagesCount * pageHeight}px`,
    minHeight: printMode ? 'auto' : `${pagesCount * pageHeight}px`,
    transform: printMode ? 'none' : `scale(${scale})`,
    transformOrigin: 'top left',
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
    padding: template === 'modern' ? '0' : `${paddingY}in ${paddingX}in`,
    fontFamily: fontFamily,
    '--resume-accent-color': accentColor,
    '--resume-accent-rgb': accentRgb,
    '--resume-font-family': fontFamily,
  };

  const emptyText = t('empty_resume_message');

  return (
    <div className="resume-wrapper" ref={wrapperRef} style={{ width: '100%', position: 'relative' }}>
      <div style={{ position: 'relative', minHeight: printMode ? 'auto' : `${pagesCount * pageHeight * scale}px`, transition: 'min-height 0.2s ease-out' }}>
        <div className="resume-page" style={resumePageStyles}>
          {!hasContent ? (
            <div ref={contentRef} className="resume-empty">
              {emptyText}
            </div>
          ) : template === 'modern' ? (
            <div ref={contentRef} style={{ height: '100%' }}>
              <ModernTemplate data={data} layout={layout} language={language} onSectionClick={!printMode ? onSectionClick : undefined} />
            </div>
          ) : template === 'njm' ? (
            <div ref={contentRef}>
              <NjmTemplate data={data} layout={layout} language={language} onSectionClick={!printMode ? onSectionClick : undefined} />
            </div>
          ) : template === 'creative' ? (
            <div ref={contentRef}>
              <CreativeTemplate data={data} layout={layout} language={language} onSectionClick={!printMode ? onSectionClick : undefined} />
            </div>
          ) : template === 'minimalist' ? (
            <div ref={contentRef}>
              <MinimalistTemplate data={data} layout={layout} language={language} onSectionClick={!printMode ? onSectionClick : undefined} />
            </div>
          ) : (
            <div ref={contentRef} style={{ gap: `${sectionSpacing}px`, display: 'flex', flexDirection: 'column', minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {p.showPhoto && p.photo && (
                <div className="resume-photo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: `${Math.round(sectionSpacing / 2)}px` }} data-testid="profile-photo-container">
                  <img src={p.photo} alt={p.name || "Profile"} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--resume-accent-color)` }} />
                </div>
              )}
              {p.name && <div className="resume-name" style={{ fontSize: `${fontSize * 2}pt`, marginBottom: '1px' }}>{p.name}</div>}
              {p.tagline && <div className="resume-tagline" style={{ fontSize: `${fontSize * 1.15}pt`, marginBottom: `${Math.round(sectionSpacing/2)}px` }}>{p.tagline}</div>}
              {hasContact && (
                <div className="resume-contact" style={{ marginBottom: `${Math.round(sectionSpacing/2)}px` }}>
                  {[p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).map((item, idx, arr) => (
                    <span key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{item}</span>
                      {idx < arr.length - 1 && <span className="resume-contact-sep">•</span>}
                    </span>
                  ))}
                </div>
              )}

              {sectionOrder.map(sectionId => renderSection(sectionId))}
            </div>
          )}
        </div>

        {/* Page breaks */}
        {!printMode && pagesCount > 1 && Array.from({ length: pagesCount - 1 }).map((_, idx) => {
          const topPos = (idx + 1) * pageHeight * scale;
          return (
            <div
              key={idx}
              className="preview-page-break"
              style={{
                position: 'absolute',
                top: `${topPos}px`,
                left: 0,
                right: 0,
                height: '24px',
                marginTop: '-12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div style={{ width: '100%', borderTop: '2px dashed var(--color-text-muted)', opacity: 0.5 }} />
              <span style={{
                position: 'absolute',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                boxShadow: 'var(--shadow-md)',
                textTransform: 'uppercase',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ✂️ {t('Page')} {idx + 1} / {idx + 2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ResumePreview);
