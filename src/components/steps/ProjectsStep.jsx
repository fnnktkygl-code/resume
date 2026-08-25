import { useState } from 'react';
import { Field, TextInput, TextArea } from '../ui/FormFields';
import TagInput from '../ui/TagInput';
import SectionHeader from '../ui/SectionHeader';
import { createEmptyProject } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function ProjectsStep({ data, onChange, onAIAssist, onAIBold, onAIRewrite, onTranslateSection, isTranslating, headings, onHeadingsChange }) {
  const { t } = useTranslation();
  const [collapsedMap, setCollapsedMap] = useState({});
  const toggleCollapse = (id) => setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));

  const visibleItems = data.filter(e => !e.isSpacer);

  const updateProj = (realIdx, field, val) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], [field]: val };
    onChange(updated);
  };
  const updateHighlight = (realIdx, hlIdx, val) => {
    const updated = [...data];
    const highlights = [...updated[realIdx].highlights];
    highlights[hlIdx] = val;
    updated[realIdx] = { ...updated[realIdx], highlights };
    onChange(updated);
  };
  const addHighlight = (realIdx) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], highlights: [...updated[realIdx].highlights, ''] };
    onChange(updated);
  };
  const removeHighlight = (realIdx, hlIdx) => {
    const updated = [...data];
    const highlights = updated[realIdx].highlights.filter((_, i) => i !== hlIdx);
    updated[realIdx] = { ...updated[realIdx], highlights: highlights.length ? highlights : [''] };
    onChange(updated);
  };
  const addProj = () => {
    const newProj = createEmptyProject();
    onChange([...data, newProj]);
    setCollapsedMap(prev => ({ ...prev, [newProj.id]: false }));
  };
  const removeProj = (realIdx) => {
    if (visibleItems.length <= 1) return;
    onChange(data.filter((_, i) => i !== realIdx));
  };

  const moveItem = (realIdx, direction) => {
    const itemIndices = data
      .map((item, idx) => ({ id: item.id, isSpacer: !!item.isSpacer, idx }))
      .filter(item => !item.isSpacer)
      .map(item => item.idx);
    
    const currentPos = itemIndices.indexOf(realIdx);
    if (currentPos === -1) return;
    
    const targetPos = currentPos + direction;
    if (targetPos < 0 || targetPos >= itemIndices.length) return;
    
    const targetIdx = itemIndices[targetPos];
    const updated = [...data];
    const temp = updated[realIdx];
    updated[realIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader
        title={headings?.projects}
        onTitleChange={(v) => onHeadingsChange?.({ ...headings, projects: v })}
        titlePlaceholder={t('Projects')}
        onTranslate={onTranslateSection}
        isTranslating={isTranslating}
      />
      {visibleItems.map((proj, pi) => {
        const realIdx = data.findIndex(item => item.id === proj.id);
        const isCollapsed = !!collapsedMap[proj.id];
        return (
          <div key={proj.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0' : '16px' }}>
              <button 
                type="button"
                onClick={() => toggleCollapse(proj.id)}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? t('Expand') : t('Collapse')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: 0,
                  padding: 0,
                  textAlign: 'left',
                  fontFamily: 'inherit'
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    display: 'inline-block'
                  }}
                >
                  ▾
                </span>
                <div className="card-title" style={{ fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {proj.name ? proj.name : `${t('Project')} #${pi + 1}`}
                </div>
                {isCollapsed && proj.techStack && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto', marginRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40%' }}>
                    {proj.techStack}
                  </span>
                )}
              </button>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                {visibleItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="control-btn"
                      onClick={() => moveItem(realIdx, -1)}
                      disabled={pi === 0}
                      style={{ padding: '6px', opacity: pi === 0 ? 0.3 : 1, cursor: pi === 0 ? 'default' : 'pointer' }}
                      title={t('Move Up')}
                    >
                      <i className="fi fi-rr-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="control-btn"
                      onClick={() => moveItem(realIdx, 1)}
                      disabled={pi === visibleItems.length - 1}
                      style={{ padding: '6px', opacity: pi === visibleItems.length - 1 ? 0.3 : 1, cursor: pi === visibleItems.length - 1 ? 'default' : 'pointer' }}
                      title={t('Move Down')}
                    >
                      <i className="fi fi-rr-arrow-down"></i>
                    </button>
                  </>
                )}
                {visibleItems.length > 1 && (
                  <button className="btn-danger" onClick={() => removeProj(realIdx)} style={{ marginLeft: '6px' }}>{t('Remove')}</button>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <>
                <div className="field-grid">
                  <Field label={t('Project Name')}>
                    <TextInput value={proj.name} onChange={(v) => updateProj(realIdx, 'name', v)} placeholder="Real-time Analytics Dashboard" />
                  </Field>
                  <Field label={t('Link')}>
                    <TextInput value={proj.link} onChange={(v) => updateProj(realIdx, 'link', v)} placeholder="github.com/user/project" />
                  </Field>
                  <Field label={t('Tech Stack')} full>
                    <TagInput value={proj.techStack} onChange={(v) => updateProj(realIdx, 'techStack', v)} placeholder="React, Node.js, PostgreSQL, WebSocket..." />
                  </Field>
                  <Field label={t('Description')} full>
                    <TextArea
                      value={proj.description}
                      onChange={(v) => updateProj(realIdx, 'description', v)}
                      onAIAssist={() => onAIAssist?.(proj.description, realIdx, -1)}
                      onAIBold={() => onAIBold?.(proj.description, realIdx, -1)}
                      onAIRewrite={() => (onAIRewrite || onAIAssist)?.(proj.description, realIdx, -1)}
                      placeholder="Built a real-time analytics platform processing 1M+ events/day with sub-second dashboard updates."
                      rows={2}
                    />
                  </Field>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div className="field-label">{t('Key Achievements')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {proj.highlights.map((hl, hi) => (
                      <div key={hi} className="bullet-row">
                        <span className="bullet-dot">•</span>
                        <div className="bullet-input-wrapper">
                          <TextArea
                            value={hl}
                            onChange={(v) => updateHighlight(realIdx, hi, v)}
                            onAIAssist={() => onAIAssist?.(hl, realIdx, hi)}
                            onAIBold={() => onAIBold?.(hl, realIdx, hi)}
                            onAIRewrite={() => (onAIRewrite || onAIAssist)?.(hl, realIdx, hi)}
                            placeholder="Reduced data pipeline latency by 60% through query optimization"
                            rows={2}
                          />
                        </div>
                        {proj.highlights.length > 1 && (
                          <button className="btn-danger bullet-remove" onClick={() => removeHighlight(realIdx, hi)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn-add" style={{ marginTop: '10px' }} onClick={() => addHighlight(realIdx)}>+ {t('Add highlight')}</button>
                </div>
              </>
            )}
          </div>
        );
      })}
      <button className="btn-add" onClick={addProj}>+ {t('Add another project')}</button>
      <div className="tip">
        💡 <strong>{t('Pro tip')}:</strong> {t('For junior developers or career changers, projects can be just as impactful as work experience. Include metrics and tech stack details.')}
      </div>
    </div>
  );
}
