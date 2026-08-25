import { useState } from 'react';
import { Field, TextInput, Select } from '../ui/FormFields';
import SectionHeader from '../ui/SectionHeader';
import { YEARS, createEmptyEducation } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function EducationStep({ data, onChange, headings, onHeadingsChange, onTranslateSection, isTranslating }) {
  const { t } = useTranslation();
  const [collapsedMap, setCollapsedMap] = useState({});
  const toggleCollapse = (id) => setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));

  const visibleItems = data.filter(e => !e.isSpacer);

  const updateEdu = (realIdx, field, val) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], [field]: val };
    onChange(updated);
  };
  const addEdu = () => {
    const newEdu = createEmptyEducation();
    onChange([...data, newEdu]);
    setCollapsedMap(prev => ({ ...prev, [newEdu.id]: false }));
  };
  const removeEdu = (realIdx) => {
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
        title={headings?.education}
        onTitleChange={(v) => onHeadingsChange?.({ ...headings, education: v })}
        titlePlaceholder={t('Education')}
        onTranslate={onTranslateSection}
        isTranslating={isTranslating}
      />
      {visibleItems.map((edu, vi) => {
        const realIdx = data.findIndex(item => item.id === edu.id);
        const isCollapsed = !!collapsedMap[edu.id];
        return (
          <div key={edu.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0' : '16px' }}>
              <button 
                type="button"
                onClick={() => toggleCollapse(edu.id)}
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
                  {edu.degree || edu.institution ? `${edu.degree || t('Degree')}${edu.institution ? ` · ${edu.institution}` : ''}` : `${t('Education')} #${vi + 1}`}
                </div>
                {isCollapsed && (edu.startYear || edu.endYear) && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto', marginRight: '12px' }}>
                    {edu.startYear || ''}{edu.endYear ? ` - ${edu.endYear}` : ''}
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
                  <button className="btn-danger" onClick={() => removeEdu(realIdx)} style={{ marginLeft: '6px' }}>{t('Remove')}</button>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <div className="field-grid">
                <Field label={t('Institution')} full>
                  <TextInput value={edu.institution} onChange={(v) => updateEdu(realIdx, 'institution', v)} placeholder="Massachusetts Institute of Technology" />
                </Field>
                <Field label={t('Degree')}>
                  <TextInput value={edu.degree} onChange={(v) => updateEdu(realIdx, 'degree', v)} placeholder="Bachelor of Science" />
                </Field>
                <Field label={t('Field of Study')}>
                  <TextInput value={edu.field} onChange={(v) => updateEdu(realIdx, 'field', v)} placeholder="Computer Science" />
                </Field>
                <Field label={t('Start Year')}>
                  <Select value={edu.startYear} onChange={(v) => updateEdu(realIdx, 'startYear', v)} options={YEARS} placeholder={t('Year')} />
                </Field>
                <Field label={t('End Year')}>
                  <Select value={edu.endYear} onChange={(v) => updateEdu(realIdx, 'endYear', v)} options={YEARS} placeholder={t('Year')} />
                </Field>
                <Field label={t('Location')}>
                  <TextInput value={edu.location || ''} onChange={(v) => updateEdu(realIdx, 'location', v)} placeholder="Paris, France" />
                </Field>
                <Field label={t('Technologies & Topics (comma separated)')} full>
                  <TextInput value={edu.technologies || ''} onChange={(v) => updateEdu(realIdx, 'technologies', v)} placeholder="Machine Learning, Big Data, Statistics" />
                </Field>
              </div>
            )}
          </div>
        );
      })}
      <button className="btn-add" onClick={addEdu}>+ {t('Add education')}</button>
    </div>
  );
}
