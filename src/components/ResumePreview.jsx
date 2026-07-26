import { useRef, useState, useEffect, useCallback, memo } from 'react';
import ModernTemplate from './ModernTemplate';
import NjmTemplate from './NjmTemplate';
import MinimalistTemplate from './MinimalistTemplate';
import { parseMarkdown, formatUrl, formatSkills } from '../utils/formatText';
import { getTranslation } from '../utils/translations';
import { hasContactInfo, displayHeading as _displayHeading, formatResumeDate } from '../utils/resumeHelpers';

function ResumePreview({ 
  data, 
  layout = {}, 
  language = 'en', 
  compact = false, 
  printMode = false, 
  template = 'standard', 
  onSectionReorder, 
  onSectionRemove, 
  onSectionClick, 
  onPagesCountChange,
  // New props:
  onItemReorder,
  onItemDelete,
  onItemUpdate,
  onAddSpacer,
  onAddSectionSpacer
}) {
  const t = (key) => getTranslation(language, key);
  const displayHeading = (key, defaultEn, tKey) => _displayHeading(h, key, defaultEn, tKey, language);

  const renderSkills = (skillsString, defaultClass) => {
    if (!skillsString) return null;
    const style = layout.skillStyle || 'pill';
    if (style === 'text') {
      const skillsArray = formatSkills(skillsString).split(',').map(s => s.trim()).filter(Boolean);
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
    const className = style === 'square' ? defaultClass.replace('pill', 'square') : defaultClass;
    return formatSkills(skillsString).split(',').map((skill, si) => skill.trim() ? <span key={si} className={className}>{parseMarkdown(skill.trim())}</span> : null);
  };
  // Detect simple-list custom sections (langues, atouts, loisirs) that should render compactly
  const isCompactCustomSection = (sec) => {
    const label = (sec.label || '').toLowerCase();
    return /langue|language|idioma|atout|strength|qualit|asset|compétenc|competenc|loisir|hobbi|interest|détente|intere/.test(label);
  };

  const p = data.personal;
  const hasContact = hasContactInfo(p);
  const validExp = data.experience.filter(e => e.company || e.title || e.isSpacer);
  const validEdu = data.education.filter(e => e.institution || e.degree || e.isSpacer);
  const validProj = data.projects.filter(pr => pr.name || pr.isSpacer);
  const validCert = data.certifications.filter(c => c.name || c.isSpacer);
  const hasCustomLangues = data.customSections?.some(s => 
    s.id === 'custom_langues' && s.items.some(i => i.title || i.subtitle || i.description || i.isSpacer)
  );
  
  const hasSkills = data.skills.technical || data.skills.soft || (data.skills.languages && !hasCustomLangues);
  const hasContent = hasContact || data.summary || 
    data.experience.some(e => e.company || e.title) || 
    data.education.some(e => e.institution || e.degree) || 
    hasSkills || 
    data.projects.some(pr => pr.name) || 
    data.certifications.some(c => c.name);

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
  const [overflowRatio, setOverflowRatio] = useState(0);
  // Item drag & drop state (removed to prevent re-renders during drag)

  useEffect(() => {
    if (onPagesCountChange) {
      onPagesCountChange(pagesCount);
    }
  }, [pagesCount, onPagesCountChange]);

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
        // Calculate how much of the last page is used (0-1)
        const lastPageUsage = (totalH % 1056) / 1056;
        // If content spills onto a new page but uses ≤20% of it, flag as overflow
        setOverflowRatio(neededPages > 1 && lastPageUsage > 0 && lastPageUsage <= 0.2 ? lastPageUsage : 0);
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
 
  const formatDate = (m, y) => formatResumeDate(m, y, language);

  // Drag & Drop handlers for Sections
  const handleDragStart = useCallback((e, sectionId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'section', sectionId }));
    setTimeout(() => {
      e.target.closest('.draggable-section')?.classList.add('dragging');
    }, 0);
    e.stopPropagation();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const section = e.target.closest('.draggable-section');
    if (section) {
      const rect = section.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      if (relativeY < rect.height / 2) {
        section.classList.add('drag-over-top');
        section.classList.remove('drag-over-bottom');
      } else {
        section.classList.add('drag-over-bottom');
        section.classList.remove('drag-over-top');
      }
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    const section = e.target.closest('.draggable-section');
    if (section) {
      section.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    }
  }, []);

  const handleDrop = useCallback((e, sectionId) => {
    e.preventDefault();
    const section = e.target.closest('.draggable-section');
    let isTop = false;
    if (section) {
      isTop = section.classList.contains('drag-over-top');
      section.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    }
    
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.type === 'section' && data.sectionId && onSectionReorder) {
        const fromIdx = sectionOrder.indexOf(data.sectionId);
        const index = sectionOrder.indexOf(sectionId);
        if (fromIdx !== -1 && index !== -1) {
          let toIdx = index;
          if (fromIdx < index && isTop) {
            toIdx = index - 1;
          } else if (fromIdx > index && !isTop) {
            toIdx = index + 1;
          }
          if (fromIdx !== toIdx) {
            const newOrder = [...sectionOrder];
            const [moved] = newOrder.splice(fromIdx, 1);
            newOrder.splice(toIdx, 0, moved);
            onSectionReorder(newOrder);
          }
        }
      }
    } catch(err) {}
  }, [sectionOrder, onSectionReorder]);

  const handleDragEnd = useCallback((e) => {
    e.target.closest('.draggable-section')?.classList.remove('dragging');
    document.querySelectorAll('.draggable-section').forEach(el => 
      el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom')
    );
  }, []);

  // Item drag & drop handlers
  const handleItemDragStart = useCallback((e, sectionId, itemId, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sectionId}:${itemId}:${index}`);
    setTimeout(() => {
      e.target.closest('.draggable-item')?.classList.add('dragging');
    }, 0);
    e.stopPropagation();
  }, []);

  const handleItemDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const item = e.target.closest('.draggable-item');
    if (item) {
      const rect = item.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      if (relativeY < rect.height / 2) {
        item.classList.add('drag-over-top');
        item.classList.remove('drag-over-bottom');
      } else {
        item.classList.add('drag-over-bottom');
        item.classList.remove('drag-over-top');
      }
    }
  }, []);

  const handleItemDragLeave = useCallback((e) => {
    e.stopPropagation();
    const item = e.target.closest('.draggable-item');
    if (item) {
      item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    }
  }, []);

  const handleItemDrop = useCallback((e, sectionId, index) => {
    e.preventDefault();
    e.stopPropagation();
    const item = e.target.closest('.draggable-item');
    let isTop = false;
    if (item) {
      isTop = item.classList.contains('drag-over-top');
      item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    }
    
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [fromSectionId, , fromIndexStr] = data.split(':');
    const fromIndex = parseInt(fromIndexStr, 10);
    
    if (fromSectionId === sectionId && onItemReorder) {
      let toIndex = index;
      if (fromIndex < index && isTop) {
        toIndex = index - 1;
      } else if (fromIndex > index && !isTop) {
        toIndex = index + 1;
      }
      
      if (fromIndex !== toIndex) {
        onItemReorder(sectionId, fromIndex, toIndex);
      }
    }
  }, [onItemReorder]);

  const handleItemDragEnd = useCallback((e) => {
    e.stopPropagation();
    e.target.closest('.draggable-item')?.classList.remove('dragging');
    document.querySelectorAll('.draggable-item').forEach(el => 
      el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom')
    );
  }, []);

  const ItemWrapper = ({ sectionId, itemId, index, className, style, children }) => {
    const isDraggable = !printMode && onItemReorder;

    const dragClass = isDraggable ? 'draggable-item preview-interactive-item' : '';
      
    const combinedClassName = `${dragClass} ${className || ''}`.trim();
    const combinedStyle = { position: 'relative', ...(style || {}) };
    
    const wrapperRef = useRef(null);

    const wrapProps = isDraggable ? {
      ref: wrapperRef,
      onDragOver: handleItemDragOver,
      onDragLeave: handleItemDragLeave,
      onDrop: (e) => handleItemDrop(e, sectionId, index),
      className: combinedClassName,
      style: combinedStyle
    } : {
      className: combinedClassName,
      style: combinedStyle
    };

    return (
      <div {...wrapProps}>
        {isDraggable && (
          <div className="item-actions" aria-hidden="true">
            <span 
              className="item-drag-handle" 
              title={t('Drag to reorder item')}
              draggable={true}
              onDragStart={(e) => {
                 if (wrapperRef.current) {
                    try { e.dataTransfer.setDragImage(wrapperRef.current, 0, 0); } catch(err) {}
                 }
                 handleItemDragStart(e, sectionId, itemId, index);
              }}
              onDragEnd={handleItemDragEnd}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
                <circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/>
                <circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/>
              </svg>
            </span>
            <button 
              className="item-delete" 
              onClick={(e) => {
                e.stopPropagation();
                if (onItemDelete) onItemDelete(sectionId, index);
              }}
              title={t('Delete Item')}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  };

  const NestedSpacer = ({ height, onChangeHeight, onDelete }) => {
    const [localHeight, setLocalHeight] = useState(height);
    
    useEffect(() => {
      setLocalHeight(height);
    }, [height]);

    const handleChange = (e) => {
      const val = Number(e.target.value);
      setLocalHeight(val);
    };

    const handleMouseUp = () => {
      onChangeHeight(localHeight);
    };

    return (
      <div 
        className="nested-spacer-interactive" 
        style={{ 
          height: `${localHeight}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nested-spacer-bg" />
        <div className="nested-spacer-controls">
          <span className="nested-spacer-label">↕ {t('Space') || 'Space'}: {localHeight}px</span>
          <input 
            type="range" 
            min="4" 
            max="120" 
            step="4" 
            value={localHeight} 
            onChange={handleChange}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className="nested-spacer-slider"
          />
          <button className="nested-spacer-delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} title={t('Delete space')}>✕</button>
        </div>
      </div>
    );
  };

  const InsertSpacerButton = ({ onClick }) => {
    return (
      <div className="insert-spacer-container" onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <div className="insert-spacer-line" />
        <button className="insert-spacer-btn" title={t('Add spacing here')} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div className="insert-spacer-line" />
      </div>
    );
  };

  const SectionWrapper = ({ sectionId, className, style, children }) => {
    const isDraggable = !printMode && onSectionReorder;
    
    const dragClass = isDraggable 
      ? 'draggable-section preview-interactive-section'
      : (onSectionClick && !printMode ? 'preview-interactive-section' : '');
      
    const combinedClassName = `${dragClass} ${className || ''}`.trim();
    
    const interactiveStyle = onSectionClick && !printMode ? { cursor: 'pointer', padding: '2px', margin: '-2px', borderRadius: '4px' } : {};
    const combinedStyle = { ...interactiveStyle, ...(style || {}) };

    const wrapperRef = useRef(null);

    const wrapProps = isDraggable ? {
      ref: wrapperRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: (e) => handleDrop(e, sectionId),
      className: combinedClassName,
      onClick: onSectionClick && !printMode ? () => onSectionClick(sectionId) : undefined,
      style: combinedStyle
    } : {
      className: combinedClassName,
      onClick: onSectionClick && !printMode ? () => onSectionClick(sectionId) : undefined,
      style: combinedStyle
    };

    return (
      <div {...wrapProps}>
        {isDraggable && (
          <div className="section-actions" aria-hidden="true">
            <span 
              className="drag-handle" 
              title={t('Drag to reorder')}
              draggable={true}
              onDragStart={(e) => {
                 if (wrapperRef.current) {
                    try { e.dataTransfer.setDragImage(wrapperRef.current, 0, 0); } catch(err) {}
                 }
                 handleDragStart(e, sectionId);
              }}
              onDragEnd={handleDragEnd}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
                <circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/>
                <circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/>
              </svg>
            </span>
            <button 
              className="section-delete" 
              onClick={(e) => {
                e.stopPropagation();
                if (onSectionRemove) onSectionRemove(sectionId);
              }}
              title={t('Delete')}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  };

  // Section renderers
  const renderSection = (sectionId) => {

    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <SectionWrapper key="summary" sectionId="summary">
            <div className="resume-section-header">{displayHeading('summary', 'Summary', 'EXECUTIVE SUMMARY')}</div>
            <div>{parseMarkdown(data.summary)}</div>
          </SectionWrapper>
        );
      case 'experience':
        if (!validExp.length) return null;
        return (
          <SectionWrapper key="experience" sectionId="experience">
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
                    <div style={{ marginTop: `${Math.round(itemSpacing/2)}px`, display: 'flex', flexDirection: 'column', gap: `${Math.round(itemSpacing / 2)}px` }}>
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
          </SectionWrapper>
        );
      case 'education':
        if (!validEdu.length) return null;
        return (
          <SectionWrapper key="education" sectionId="education">
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
          </SectionWrapper>
        );
      case 'skills':
        if (!hasSkills) return null;
        return (
          <SectionWrapper key="skills" sectionId="skills">
            <div className="resume-section-header">{displayHeading('skills', 'Skills', 'SKILLS & TOOLS')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {data.skills.technical && (
                <div>
                  <strong>{displayHeading('technical', 'Technical Skills', 'Technical Skills')}</strong>
                  <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.technical, layout.coloredSkills !== false ? 'skill-pill-accent' : 'skill-pill')}
                  </div>
                </div>
              )}
              {data.skills.soft && (
                <div>
                  <strong>{displayHeading('interpersonal', 'Soft Skills', 'Soft Skills')}</strong>
                  <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.soft, 'skill-pill')}
                  </div>
                </div>
              )}
              {data.skills.languages && !hasCustomLangues && (
                <div>
                  <strong>{displayHeading('languages', 'Languages', 'Languages')}</strong>
                  <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {renderSkills(data.skills.languages, 'skill-pill-outline')}
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      case 'projects':
        if (!validProj.length) return null;
        return (
          <SectionWrapper key="projects" sectionId="projects">
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
          </SectionWrapper>
        );
      case 'certifications':
        if (!validCert.length) return null;
        return (
          <SectionWrapper key="certifications" sectionId="certifications">
            <div className="resume-section-header">{displayHeading('certifications', 'Certifications', 'CERTIFICATIONS_RESUME')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(itemSpacing / 2)}px` }}>
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
                  <div className="resume-bullet">
                    <span style={{ marginRight: '6px' }}>•</span>
                    <strong>{c.name}</strong> — {c.issuer}{c.date ? ` (${c.date})` : ''}
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
          </SectionWrapper>
        );
      default:
        if (sectionId.startsWith('spacer_')) {
          const spacerSec = data.customSections?.find(s => s.id === sectionId);
          if (!spacerSec) return null;
          return <SectionWrapper key={sectionId} sectionId={sectionId} style={{ height: `${spacerSec.height}px` }} />;
        }
        if (sectionId.startsWith('custom_')) {
          const customSec = data.customSections?.find(s => s.id === sectionId);
          if (!customSec || !customSec.items.length) return null;
          const validItems = customSec.items.filter(i => i.title || i.subtitle || i.description || i.isSpacer);
          if (!validItems.length) return null;

          // Detect simple-list sections (langues, atouts, loisirs) — render compact
          const isSimpleList = isCompactCustomSection(customSec);

          if (isSimpleList) {
            return (
              <SectionWrapper key={sectionId} sectionId={sectionId}>
                <div className="resume-section-header">{customSec.label || 'Custom'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(itemSpacing / 3)}px` }}>
                  {validItems.map((item, i) => {
                    if (item.isSpacer) {
                      return printMode ? (
                        <div key={item.id || i} style={{ height: `${item.height}px` }} />
                      ) : (
                        <NestedSpacer 
                          key={item.id || i}
                          height={item.height} 
                          onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })}
                          onDelete={() => onItemDelete(sectionId, i)}
                        />
                      );
                    }
                    const label = [item.title, item.subtitle].filter(Boolean).join(' — ');
                    return (
                      <div key={item.id || i}>
                        <ItemWrapper sectionId={sectionId} itemId={item.id} index={i}>
                          <div className="resume-bullet" style={{ display: 'flex', alignItems: 'baseline' }}>
                            <span style={{ marginRight: '6px' }}>•</span>
                            <span>
                              {item.title && <strong>{item.title}</strong>}
                              {item.title && item.subtitle && ' — '}
                              {item.subtitle && <em>{item.subtitle}</em>}
                            </span>
                          </div>
                          {item.description && <div style={{ marginLeft: '14px', marginTop: '2px', whiteSpace: 'pre-line' }}>{parseMarkdown(item.description)}</div>}
                        </ItemWrapper>
                      </div>
                    );
                  })}
                </div>
              </SectionWrapper>
            );
          }

          return (
            <SectionWrapper key={sectionId} sectionId={sectionId}>
              <div className="resume-section-header">{customSec.label || 'Custom'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                {validItems.map((item, i) => {
                  const itemContent = item.isSpacer ? (
                    printMode ? (
                      <div style={{ height: `${item.height}px` }} />
                    ) : (
                      <NestedSpacer 
                        height={item.height} 
                        onChangeHeight={(h) => onItemUpdate(sectionId, i, { ...item, height: h })}
                        onDelete={() => onItemDelete(sectionId, i)}
                      />
                    )
                  ) : (
                    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div className="resume-exp-header">
                        {item.title && <span className="resume-company">{item.title}</span>}
                        {item.date && <span className="resume-dates">{item.date}</span>}
                      </div>
                      {item.subtitle && <div className="resume-title">{item.subtitle}</div>}
                      {item.description && <div style={{ marginTop: `${Math.round(itemSpacing/2)}px`, whiteSpace: 'pre-line' }}>
                        {parseMarkdown(item.description)}
                      </div>}
                    </div>
                  );

                  return (
                    <div key={item.id || i}>
                      {!printMode && i > 0 && (
                        <InsertSpacerButton onClick={() => onAddSpacer(sectionId, i)} />
                      )}
                      <ItemWrapper sectionId={sectionId} itemId={item.id} index={i}>
                        {itemContent}
                      </ItemWrapper>
                    </div>
                  );
                })}
              </div>
            </SectionWrapper>
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
      <div style={{ position: 'relative', minHeight: printMode ? 'auto' : `${pagesCount * pageHeight * scale + (pagesCount - 1) * 24 * scale}px`, transition: 'min-height 0.2s ease-out' }}>
        <div className="resume-page" style={resumePageStyles}>
          {!hasContent ? (
            <div ref={contentRef} className="resume-empty">
              {emptyText}
            </div>
          ) : template === 'modern' ? (
            <div ref={contentRef} style={{ height: '100%' }}>
              <ModernTemplate 
                data={data} 
                layout={layout} 
                language={language} 
                onSectionClick={!printMode ? onSectionClick : undefined} 
                SectionWrapper={SectionWrapper}
                ItemWrapper={ItemWrapper}
                NestedSpacer={NestedSpacer}
                InsertSpacerButton={InsertSpacerButton}
                onItemReorder={onItemReorder}
                onItemDelete={onItemDelete}
                onItemUpdate={onItemUpdate}
                onAddSpacer={onAddSpacer}
                onAddSectionSpacer={onAddSectionSpacer}
                printMode={printMode}
              />
            </div>
          ) : template === 'njm' ? (
            <div ref={contentRef}>
              <NjmTemplate 
                data={data} 
                layout={layout} 
                language={language} 
                onSectionClick={!printMode ? onSectionClick : undefined} 
                SectionWrapper={SectionWrapper}
                ItemWrapper={ItemWrapper}
                NestedSpacer={NestedSpacer}
                InsertSpacerButton={InsertSpacerButton}
                onItemReorder={onItemReorder}
                onItemDelete={onItemDelete}
                onItemUpdate={onItemUpdate}
                onAddSpacer={onAddSpacer}
                onAddSectionSpacer={onAddSectionSpacer}
                printMode={printMode}
              />
            </div>
          ) : template === 'minimalist' ? (
            <div ref={contentRef}>
              <MinimalistTemplate 
                data={data} 
                layout={layout} 
                language={language} 
                onSectionClick={!printMode ? onSectionClick : undefined} 
                SectionWrapper={SectionWrapper}
                ItemWrapper={ItemWrapper}
                NestedSpacer={NestedSpacer}
                InsertSpacerButton={InsertSpacerButton}
                onItemReorder={onItemReorder}
                onItemDelete={onItemDelete}
                onItemUpdate={onItemUpdate}
                onAddSpacer={onAddSpacer}
                onAddSectionSpacer={onAddSectionSpacer}
                printMode={printMode}
              />
            </div>
          ) : (
            <div ref={contentRef} style={{ gap: `${sectionSpacing}px`, display: 'flex', flexDirection: 'column', minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <div
                className={onSectionClick && !printMode ? 'preview-interactive-section' : ''}
                style={onSectionClick && !printMode ? { cursor: 'pointer', padding: '4px', margin: '-4px', borderRadius: '4px' } : {}}
                onClick={onSectionClick && !printMode ? () => onSectionClick('personal') : undefined}
                title={onSectionClick && !printMode ? t('Click to edit personal info') : undefined}
              >
                {p.showPhoto && p.photo && (
                  <div className="resume-photo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: `${Math.round(itemSpacing / 2)}px` }} data-testid="profile-photo-container">
                    <img src={p.photo} alt={p.name || "Profile"} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--resume-accent-color)` }} />
                  </div>
                )}
                {p.name && <div className="resume-name" style={{ fontSize: `${fontSize * 2}pt`, marginBottom: '1px' }}>{p.name}</div>}
                {p.tagline && <div className="resume-tagline" style={{ fontSize: `${fontSize * 1.15}pt`, marginBottom: `${Math.round(itemSpacing/2)}px` }}>{p.tagline}</div>}
                {hasContact && (
                  layout.splitLinks !== false ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: `${Math.round(itemSpacing/2)}px` }}>
                      {(p.email || p.phone || p.location) && (
                        <div className="resume-contact" style={{ margin: 0 }}>
                          {p.email && <span style={{ display: 'flex', alignItems: 'center' }}><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a>{(p.phone || p.location) && <span className="resume-contact-sep">•</span>}</span>}
                          {p.phone && <span style={{ display: 'flex', alignItems: 'center' }}><a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a>{p.location && <span className="resume-contact-sep">•</span>}</span>}
                          {p.location && <span style={{ display: 'flex', alignItems: 'center' }}><span>{p.location}</span></span>}
                        </div>
                      )}
                      {(p.linkedin || p.github || p.website) && (
                        <div className="resume-contact" style={{ margin: 0 }}>
                          {p.linkedin && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a>{(p.github || p.website) && <span className="resume-contact-sep">•</span>}</span>}
                          {p.github && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.github)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.github}</a>{p.website && <span className="resume-contact-sep">•</span>}</span>}
                          {p.website && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.website}</a></span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="resume-contact" style={{ marginBottom: `${Math.round(itemSpacing/2)}px` }}>
                      {p.email && <span style={{ display: 'flex', alignItems: 'center' }}><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.email}</a><span className="resume-contact-sep">•</span></span>}
                      {p.phone && <span style={{ display: 'flex', alignItems: 'center' }}><a href={`tel:${p.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.phone}</a><span className="resume-contact-sep">•</span></span>}
                      {p.location && <span style={{ display: 'flex', alignItems: 'center' }}><span>{p.location}</span>{(p.linkedin || p.github || p.website) && <span className="resume-contact-sep">•</span>}</span>}
                      {p.linkedin && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.linkedin}</a>{(p.github || p.website) && <span className="resume-contact-sep">•</span>}</span>}
                      {p.github && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.github)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.github}</a>{p.website && <span className="resume-contact-sep">•</span>}</span>}
                      {p.website && <span style={{ display: 'flex', alignItems: 'center' }}><a href={formatUrl(p.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{p.website}</a></span>}
                    </div>
                  )
                )}
              </div>

              {sectionOrder.map((sectionId, sectionIdx) => {
                const rendered = renderSection(sectionId);
                if (!rendered) return null;
                return (
                  <div key={sectionId}>
                    {!printMode && onAddSectionSpacer && (
                      <InsertSpacerButton onClick={() => onAddSectionSpacer(sectionIdx - 1)} />
                    )}
                    {rendered}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overflow warning — content barely spills onto next page */}
        {!printMode && overflowRatio > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: `${8 * scale}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              color: '#fff',
              borderRadius: '8px',
              padding: `${6 * scale}px ${12 * scale}px`,
              fontSize: `${Math.max(10, 11 * scale)}px`,
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: `${4 * scale}px`,
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
              maxWidth: '90%',
            }}
          >
            ⚠️ {t('Content overflows by just a few lines. Try Compact mode or shorten a section.')}
          </div>
        )}

        {/* Page break gutters */}
        {!printMode && pagesCount > 1 && Array.from({ length: pagesCount - 1 }).map((_, idx) => {
          const topPos = (idx + 1) * pageHeight * scale;
          const gutterHeight = 32 * scale;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: `${topPos - gutterHeight / 2}px`,
                left: `-${24 * scale}px`,
                right: `-${24 * scale}px`,
                height: `${gutterHeight}px`,
                backgroundColor: 'var(--color-bg)',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                boxShadow: '0 -4px 8px -4px rgba(0,0,0,0.1), 0 4px 8px -4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <span style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '2px 10px',
                fontSize: '10px',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                boxShadow: 'var(--shadow-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
