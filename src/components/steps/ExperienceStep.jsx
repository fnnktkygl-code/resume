import { useState } from 'react';
import { Field, TextInput, TextArea, Select } from '../ui/FormFields';
import TagInput from '../ui/TagInput';
import SectionHeader from '../ui/SectionHeader';
import { MONTHS, YEARS, createEmptyExperience } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function ExperienceStep({ data, onChange, onAIAssist, onAIBold, onAIRewrite, onTranslateSection, isTranslating, headings, onHeadingsChange, layout, onLayoutChange }) {
  const { t } = useTranslation();
  const [collapsedMap, setCollapsedMap] = useState({});
  const toggleCollapse = (id) => setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));

  const updateLayout = (field, val) => onLayoutChange && onLayoutChange({ ...layout, [field]: val });
  const visibleItems = data.filter(e => !e.isSpacer);

  const updateExp = (realIdx, field, val) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], [field]: val };
    onChange(updated);
  };
  const updateBullet = (realIdx, bulletIdx, val) => {
    const updated = [...data];
    const bullets = [...updated[realIdx].bullets];
    bullets[bulletIdx] = val;
    updated[realIdx] = { ...updated[realIdx], bullets };
    onChange(updated);
  };
  const addBullet = (realIdx) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], bullets: [...updated[realIdx].bullets, ''] };
    onChange(updated);
  };
  const removeBullet = (realIdx, bulletIdx) => {
    const updated = [...data];
    const bullets = updated[realIdx].bullets.filter((_, i) => i !== bulletIdx);
    updated[realIdx] = { ...updated[realIdx], bullets: bullets.length ? bullets : [''] };
    onChange(updated);
  };
  const addExp = () => {
    const newExp = createEmptyExperience();
    onChange([...data, newExp]);
    setCollapsedMap(prev => ({ ...prev, [newExp.id]: false }));
  };
  const removeExp = (realIdx) => {
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

  const hasMissingMetric = (bullet) => bullet.length > 20 && !/\d/.test(bullet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader
        title={headings?.experience}
        onTitleChange={(v) => onHeadingsChange?.({ ...headings, experience: v })}
        titlePlaceholder={t('Work Experience')}
        onTranslate={onTranslateSection}
        isTranslating={isTranslating}
        styleControls={{
          label: t('Tags & Technologies Style'),
          dropdowns: [
            {
              value: layout?.tagStyle || 'outline',
              onChange: (v) => updateLayout('tagStyle', v),
              options: [
                { value: 'outline', label: t('Square Contour') },
                { value: 'pill-outline', label: t('Rounded Contour') },
                { value: 'square', label: t('Squares') },
                { value: 'pill', label: t('Rounded Circles') },
                { value: 'text', label: t('Simple Text') }
              ]
            },
            {
              value: layout?.coloredTags || 'highlighted',
              onChange: (v) => updateLayout('coloredTags', v),
              options: [
                { value: 'neutral', label: t('Neutral Tags') },
                { value: 'highlighted', label: t('AI Highlighted') },
                { value: 'all', label: t('Color All Tags') }
              ]
            }
          ]
        }}
      />
      {visibleItems.map((exp, vi) => {
        const realIdx = data.findIndex(item => item.id === exp.id);
        const isCollapsed = !!collapsedMap[exp.id];
        return (
          <div key={exp.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0' : '16px' }}>
              <button 
                type="button"
                onClick={() => toggleCollapse(exp.id)}
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
                  {exp.title || exp.company ? `${exp.title || t('Untitled Role')}${exp.company ? ` · ${exp.company}` : ''}` : `${t('Experience')} #${vi + 1}`}
                </div>
                {isCollapsed && exp.startDate && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto', marginRight: '12px' }}>
                    {exp.startDate} - {exp.current ? t('Present') : exp.endDate || ''}
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
                      disabled={vi === 0}
                      style={{ padding: '6px', opacity: vi === 0 ? 0.3 : 1, cursor: vi === 0 ? 'default' : 'pointer' }}
                      title={t('Move Up')}
                    >
                      <i className="fi fi-rr-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="control-btn"
                      onClick={() => moveItem(realIdx, 1)}
                      disabled={vi === visibleItems.length - 1}
                      style={{ padding: '6px', opacity: vi === visibleItems.length - 1 ? 0.3 : 1, cursor: vi === visibleItems.length - 1 ? 'default' : 'pointer' }}
                      title={t('Move Down')}
                    >
                      <i className="fi fi-rr-arrow-down"></i>
                    </button>
                  </>
                )}
                {visibleItems.length > 1 && (
                  <button className="btn-danger" onClick={() => removeExp(realIdx)} style={{ marginLeft: '6px' }}>{t('Remove')}</button>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <>
            <div className="field-grid">
              <Field label={t('Company')}>
                <TextInput value={exp.company} onChange={(v) => updateExp(realIdx, 'company', v)} placeholder="Acme Corp" />
              </Field>
              <Field label={t('Company Website / Link')}>
                <TextInput value={exp.link || ''} onChange={(v) => updateExp(realIdx, 'link', v)} placeholder="https://acme.com" />
              </Field>
              <Field label={t('Job Title')}>
                <TextInput value={exp.title} onChange={(v) => updateExp(realIdx, 'title', v)} placeholder="Senior Software Engineer" />
              </Field>
              <Field label={t('Job Icon')}>
                <Select
                  value={exp.icon || 'chart'}
                  onChange={(v) => updateExp(realIdx, 'icon', v)}
                  options={[
                    { value: 'chart', label: t('Chart (Default)') },
                    { value: 'briefcase', label: t('Briefcase') },
                    { value: 'building', label: t('Building') },
                    { value: 'code', label: t('Code / Tech') },
                    { value: 'heart', label: t('Heart / Health') },
                    { value: 'graduation', label: t('Graduation / Education') },
                    { value: 'award', label: t('Award / Achievement') },
                    { value: 'globe', label: t('Web / Globe') },
                    { value: 'book', label: t('Book / Writing') },
                    { value: 'user', label: t('Leadership / Management') },
                    { value: 'star', label: t('Star') },
                    { value: 'none', label: t('No Icon') }
                  ]}
                />
              </Field>
              <Field label={t('Start Month')}>
                <Select value={exp.startMonth} onChange={(v) => updateExp(realIdx, 'startMonth', v)} options={MONTHS.map(m => ({ value: m, label: t(m) }))} placeholder={t('Month')} />
              </Field>
              <Field label={t('Start Year')}>
                <Select value={exp.startYear} onChange={(v) => updateExp(realIdx, 'startYear', v)} options={YEARS} placeholder={t('Year')} />
              </Field>
              {!exp.current && (
                <>
                  <Field label={t('End Month')}>
                    <Select value={exp.endMonth} onChange={(v) => updateExp(realIdx, 'endMonth', v)} options={MONTHS.map(m => ({ value: m, label: t(m) }))} placeholder={t('Month')} />
                  </Field>
                  <Field label={t('End Year')}>
                    <Select value={exp.endYear} onChange={(v) => updateExp(realIdx, 'endYear', v)} options={YEARS} placeholder={t('Year')} />
                  </Field>
                </>
              )}
              <Field full>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExp(realIdx, 'current', e.target.checked)}
                  />
                  {t('I currently work here')}
                </label>
              </Field>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div className="field-label">{t('Achievements & Responsibilities')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exp.bullets.map((bullet, bi) => (
                  <div key={bi}>
                    <div className="bullet-row">
                      <span className="bullet-dot">•</span>
                      <div className="bullet-input-wrapper">
                        <TextArea
                          value={bullet}
                          onChange={(v) => updateBullet(realIdx, bi, v)}
                          onAIAssist={() => onAIAssist?.(bullet, realIdx, bi)}
                          onAIBold={() => onAIBold?.(bullet, realIdx, bi)}
                          onAIRewrite={() => (onAIRewrite || onAIAssist)?.(bullet, realIdx, bi)}
                          placeholder="Led migration of monolithic API to microservices, reducing deploy times by 70% and improving uptime to 99.95%"
                          rows={2}
                        />
                      </div>
                      {exp.bullets.length > 1 && (
                        <button className="btn-danger bullet-remove" onClick={() => removeBullet(realIdx, bi)}>✕</button>
                      )}
                    </div>
                    {hasMissingMetric(bullet) && (
                      <div className="metric-hint">
                        💡 {t('Consider adding a number or metric — resumes with quantifiable results get 40% more interviews.')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-add" style={{ marginTop: '10px' }} onClick={() => addBullet(realIdx)}>+ {t('Add bullet point')}</button>
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border, #eee)', paddingTop: '12px' }}>
              <Field label={t('Technologies & Tools (comma separated)')} full>
                <TagInput value={exp.technologies || ''} onChange={(v) => updateExp(realIdx, 'technologies', v)} placeholder="React, Node.js, SQL, AWS..." />
              </Field>

              {layout && onLayoutChange && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--color-surface-alt, #fafafa)', borderRadius: '6px', border: '1px solid var(--color-border, #eee)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary, #666)', marginBottom: '8px' }}>
                    🎨 {t('Tags & Technologies Style')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Select
                      value={layout?.tagStyle || 'outline'}
                      onChange={(val) => updateLayout('tagStyle', val)}
                      options={[
                        { value: 'outline', label: t('Square Contour') },
                        { value: 'pill-outline', label: t('Rounded Contour') },
                        { value: 'square', label: t('Squares') },
                        { value: 'pill', label: t('Rounded Circles') },
                        { value: 'text', label: t('Simple Text') }
                      ]}
                      size="sm"
                    />
                    <Select
                      value={layout?.coloredTags || 'highlighted'}
                      onChange={(val) => updateLayout('coloredTags', val)}
                      options={[
                        { value: 'neutral', label: t('Neutral Tags') },
                        { value: 'highlighted', label: t('AI Highlighted') },
                        { value: 'all', label: t('Color All Tags') }
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        );
      })}
      <button className="btn-add" onClick={addExp}>+ {t('Add another position')}</button>
      <div className="tip">
        💡 <strong>{t('STAR Method')}:</strong> {t('Frame each bullet as Action → Context → Measurable Result. ATS semantic AI extracts evidence of impact, not just duties.')}
      </div>
    </div>
  );
}
