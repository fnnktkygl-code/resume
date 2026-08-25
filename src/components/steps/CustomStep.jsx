import { useState } from 'react';
import { Field, TextInput, TextArea } from '../ui/FormFields';
import SectionHeader from '../ui/SectionHeader';
import { createEmptyCustomItem } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CustomStep({ section, onChange, onDelete, onAISectionFill, onTranslateSection, isTranslating, onAIAssist, onAIBold, onAIRewrite }) {
  const { t } = useTranslation();
  const [collapsedMap, setCollapsedMap] = useState({});
  const toggleCollapse = (id) => setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));

  if (!section) return null;

  const updateSectionLabel = (label) => {
    onChange({ ...section, label });
  };

  const visibleItems = section.items.filter(e => !e.isSpacer);

  const updateItem = (realIdx, field, val) => {
    const updatedItems = [...section.items];
    updatedItems[realIdx] = { ...updatedItems[realIdx], [field]: val };
    onChange({ ...section, items: updatedItems });
  };

  const addItem = () => {
    const newItem = createEmptyCustomItem();
    onChange({ ...section, items: [...section.items, newItem] });
    setCollapsedMap(prev => ({ ...prev, [newItem.id]: false }));
  };

  const removeItem = (realIdx) => {
    if (visibleItems.length <= 1) return;
    const updatedItems = section.items.filter((_, i) => i !== realIdx);
    onChange({ ...section, items: updatedItems });
  };

  const moveItem = (realIdx, direction) => {
    const itemIndices = section.items
      .map((item, idx) => ({ id: item.id, isSpacer: !!item.isSpacer, idx }))
      .filter(item => !item.isSpacer)
      .map(item => item.idx);
    
    const currentPos = itemIndices.indexOf(realIdx);
    if (currentPos === -1) return;
    
    const targetPos = currentPos + direction;
    if (targetPos < 0 || targetPos >= itemIndices.length) return;
    
    const targetIdx = itemIndices[targetPos];
    const updatedItems = [...section.items];
    const temp = updatedItems[realIdx];
    updatedItems[realIdx] = updatedItems[targetIdx];
    updatedItems[targetIdx] = temp;
    onChange({ ...section, items: updatedItems });
  };

  const isLangues = section.id === 'custom_langues';
  const isAtouts = section.id === 'custom_atouts';
  const isLoisirs = section.id === 'custom_loisirs';

  const getFieldSettings = () => {
    if (isLangues) {
      return {
        titleLabel: t('Language'),
        titlePlaceholder: t('E.g., English'),
        showSubtitle: true,
        subtitleLabel: t('Level'),
        subtitlePlaceholder: t('E.g., Native, Fluent, B2'),
        showDate: false,
        showDescription: true,
        descLabel: t('Details (Optional)'),
        descPlaceholder: t('E.g., IELTS 8.5, professional usage...'),
      };
    }
    if (isAtouts) {
      return {
        titleLabel: t('Strength'),
        titlePlaceholder: t('E.g., Problem Solving'),
        showSubtitle: true,
        subtitleLabel: t('Context / Level (Optional)'),
        subtitlePlaceholder: t('E.g., Advanced, 5 years experience'),
        showDate: false,
        showDescription: true,
        descLabel: t('Details (Optional)'),
        descPlaceholder: t('Provide any additional context...'),
      };
    }
    if (isLoisirs) {
      return {
        titleLabel: t('Hobby / Interest'),
        titlePlaceholder: t('E.g., Photography, Hiking'),
        showSubtitle: false,
        showDate: false,
        showDescription: true,
        descLabel: t('Details (Optional)'),
        descPlaceholder: t('Provide any additional context...'),
      };
    }
    return {
      titleLabel: t('Title / Name'),
      titlePlaceholder: t('E.g., Employee of the Year'),
      showSubtitle: true,
      subtitleLabel: t('Subtitle / Issuer'),
      subtitlePlaceholder: t('E.g., Acme Corp'),
      showDate: true,
      dateLabel: t('Date / Year'),
      datePlaceholder: t('E.g., 2023 or Nov 2023'),
      showDescription: true,
      descLabel: t('Description / Details (Optional)'),
      descPlaceholder: t('Provide any additional context or details here...'),
    };
  };

  const fields = getFieldSettings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader
        title={section.label}
        onTitleChange={updateSectionLabel}
        titlePlaceholder={t('Custom Section Name')}
        onTranslate={onTranslateSection}
        isTranslating={isTranslating}
        onDelete={onDelete}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visibleItems.map((item, ii) => {
          const realIdx = section.items.findIndex(x => x.id === item.id);
          const isCollapsed = !!collapsedMap[item.id];
          const displayTitle = item.title || `${section.label || t('Item')} #${ii + 1}`;

          return (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0' : '16px' }}>
                <button 
                  type="button"
                  onClick={() => toggleCollapse(item.id)}
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
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-secondary)',
                    transition: 'transform 0.2s ease',
                    display: 'inline-block',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}>
                    {displayTitle}
                  </span>
                </button>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {visibleItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="control-btn"
                        onClick={() => moveItem(realIdx, -1)}
                        disabled={ii === 0}
                        style={{ padding: '6px', opacity: ii === 0 ? 0.3 : 1, cursor: ii === 0 ? 'default' : 'pointer' }}
                        title={t('Move Up')}
                      >
                        <i className="fi fi-rr-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        className="control-btn"
                        onClick={() => moveItem(realIdx, 1)}
                        disabled={ii === visibleItems.length - 1}
                        style={{ padding: '6px', opacity: ii === visibleItems.length - 1 ? 0.3 : 1, cursor: ii === visibleItems.length - 1 ? 'default' : 'pointer' }}
                        title={t('Move Down')}
                      >
                        <i className="fi fi-rr-arrow-down"></i>
                      </button>
                    </>
                  )}
                  {visibleItems.length > 1 && (
                    <button className="btn-danger" onClick={() => removeItem(realIdx)} style={{ marginLeft: '6px' }}>{t('Remove')}</button>
                  )}
                </div>
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="field-grid">
                    <Field label={fields.titleLabel} full={!(fields.showSubtitle || item.subtitle) && !(fields.showDate || item.date)}>
                      <TextInput 
                        value={item.title} 
                        onChange={(v) => updateItem(realIdx, 'title', v)} 
                        placeholder={fields.titlePlaceholder}
                        onAIAssist={() => onAIAssist?.(item.title, realIdx, 'title')}
                        onAIBold={() => onAIBold?.(item.title, realIdx, 'title')}
                        onAIRewrite={() => (onAIRewrite || onAIAssist)?.(item.title, realIdx, 'title')}
                      />
                    </Field>
                    {(fields.showSubtitle || item.subtitle) && (
                      <Field label={fields.subtitleLabel || t('Subtitle')}>
                        <TextInput 
                          value={item.subtitle} 
                          onChange={(v) => updateItem(realIdx, 'subtitle', v)} 
                          placeholder={fields.subtitlePlaceholder}
                          onAIAssist={() => onAIAssist?.(item.subtitle, realIdx, 'subtitle')}
                          onAIBold={() => onAIBold?.(item.subtitle, realIdx, 'subtitle')}
                          onAIRewrite={() => (onAIRewrite || onAIAssist)?.(item.subtitle, realIdx, 'subtitle')}
                        />
                      </Field>
                    )}
                    {(fields.showDate || item.date) && (
                      <Field label={fields.dateLabel || t('Date')}>
                        <TextInput 
                          value={item.date} 
                          onChange={(v) => updateItem(realIdx, 'date', v)} 
                          placeholder={fields.datePlaceholder} 
                        />
                      </Field>
                    )}
                  </div>
                  
                  {(fields.showDescription || item.description) && (
                    <div style={{ marginTop: '16px' }}>
                      <Field label={fields.descLabel || t('Details (Optional)')} full>
                        <TextArea 
                          value={item.description} 
                          onChange={(v) => updateItem(realIdx, 'description', v)} 
                          placeholder={fields.descPlaceholder} 
                          rows={3}
                          onAIAssist={() => onAIAssist?.(item.description, realIdx, 'description')}
                          onAIBold={() => onAIBold?.(item.description, realIdx, 'description')}
                          onAIRewrite={() => (onAIRewrite || onAIAssist)?.(item.description, realIdx, 'description')}
                        />
                      </Field>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-add" onClick={addItem}>+ {t('Add another item')}</button>
      {onAISectionFill && (
        <button
          type="button"
          onClick={() => {
            let type = 'custom_generic';
            if (isAtouts) type = 'custom_atouts';
            else if (isLoisirs) type = 'custom_loisirs';
            else if (isLangues) type = 'custom_langues';
            onAISectionFill(type, section.label);
          }}
          style={{
            background: 'var(--color-accent-light)',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            marginTop: '4px',
          }}
        >
          ✨ {t('AI Suggest Items')}
        </button>
      )}
    </div>
  );
}
