import { useRef, useState, useEffect, useCallback, memo } from 'react';
import ModernTemplate from './ModernTemplate';

function ResumePreview({ data, layout = {}, language = 'en', compact = false, printMode = false, template = 'standard', onSectionReorder }) {
  const p = data.personal;
  const hasContact = p.name || p.email || p.phone;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;
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
        const innerH = contentRef.current.offsetHeight;
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
  }, [hasContent, paddingY]);

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
      className: `draggable-section${draggedSection === sectionId ? ' dragging' : ''}${dragOverSection === sectionId ? ' drag-over' : ''}`,
    } : {};

    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key="summary" {...wrapProps}>
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.summary}</div>
            <div>{data.summary}</div>
          </div>
        );
      case 'experience':
        if (!validExp.length) return null;
        return (
          <div key="experience" {...wrapProps}>
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.experience}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{exp.company}</span>
                    <span className="resume-dates">
                      {formatDate(exp.startMonth, exp.startYear)}
                      {(exp.startMonth || exp.startYear) && ' — '}
                      {exp.current ? h.present : formatDate(exp.endMonth, exp.endYear)}
                    </span>
                  </div>
                  <div className="resume-title">{exp.title}</div>
                  <div style={{ marginTop: `${Math.round(sectionSpacing/2)}px` }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{b}</div>
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
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.education}</div>
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
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.skills}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(sectionSpacing/3)}px` }}>
              {data.skills.technical && <div><strong>{h.technical}</strong> {data.skills.technical}</div>}
              {data.skills.soft && <div><strong>{h.interpersonal}</strong> {data.skills.soft}</div>}
              {data.skills.languages && <div><strong>{h.languages}</strong> {data.skills.languages}</div>}
            </div>
          </div>
        );
      case 'projects':
        if (!validProj.length) return null;
        return (
          <div key="projects" {...wrapProps}>
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.projects}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => (
                <div key={i}>
                  <div className="resume-exp-header">
                    <span className="resume-company">{pr.name}</span>
                    {pr.link && <span className="resume-dates">{pr.link}</span>}
                  </div>
                  {pr.description && <div style={{ marginBottom: '2px' }}>{pr.description}</div>}
                  {pr.techStack && <div className="resume-tech-stack"><em>Tech: {pr.techStack}</em></div>}
                  {pr.highlights.filter(Boolean).map((h, hi) => (
                    <div key={hi} className="resume-bullet"><span style={{ marginRight: '6px' }}>•</span>{h}</div>
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
            {isDraggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
            <div className="resume-section-header">{h.certifications}</div>
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
        return null;
    }
  };

  const resumePageStyles = {
    width: `${pageWidth}px`,
    height: printMode ? 'auto' : `${pagesCount * pageHeight}px`,
    minHeight: printMode ? 'auto' : `${pagesCount * pageHeight}px`,
    transform: printMode ? 'none' : `scale(${scale})`,
    transformOrigin: 'top left',
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
    padding: template === 'modern' ? '0' : `${paddingY}in ${paddingX}in`,
    backgroundImage: (!printMode && pagesCount > 1 && template === 'standard') 
      ? `repeating-linear-gradient(to bottom, transparent, transparent 1054px, rgba(128,128,128,0.4) 1054px, rgba(128,128,128,0.4) 1056px)` 
      : 'none',
  };

  const emptyText = language === 'fr' 
    ? 'Commencez à remplir vos informations pour voir votre CV apparaître ici' 
    : 'Start filling in your details to see your resume appear here';

  return (
    <div className="resume-wrapper" ref={wrapperRef} style={{ width: '100%', overflow: printMode ? 'visible' : 'hidden' }}>
      <div style={{ height: printMode ? 'auto' : `${pagesCount * pageHeight * scale}px`, overflow: printMode ? 'visible' : 'hidden', transition: 'height 0.2s ease-out' }}>
        <div className="resume-page" style={resumePageStyles}>
          {template === 'modern' ? (
            <ModernTemplate data={data} layout={layout} language={language} />
          ) : (
            <div ref={contentRef} style={{ gap: `${sectionSpacing}px`, display: 'flex', flexDirection: 'column', paddingLeft: onSectionReorder ? '28px' : '0' }}>
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

              {!hasContent && (
                <div className="resume-empty">
                  {emptyText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ResumePreview);
