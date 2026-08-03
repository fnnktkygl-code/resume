import { Field, TextInput, TextArea } from '../ui/FormFields';
import SectionHeader from '../ui/SectionHeader';
import { createEmptyCustomItem } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CustomStep({ section, onChange, onDelete, onAISectionFill }) {
  const { t } = useTranslation();

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
    onChange({ ...section, items: [...section.items, createEmptyCustomItem()] });
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <SectionHeader
            title={section.label}
            onTitleChange={updateSectionLabel}
            titlePlaceholder={t('Custom Section Name')}
          />
        </div>
        {onDelete && (
          <button className="btn-danger" onClick={onDelete} style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '16px', whiteSpace: 'nowrap' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            {t('Delete Section')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visibleItems.map((item, ii) => {
          const realIdx = section.items.findIndex(x => x.id === item.id);
          return (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="card-title">{section.label || t('Item')} {visibleItems.length > 1 ? `#${ii + 1}` : ''}</div>
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
              
              <div className="field-grid">
                <Field label={fields.titleLabel} full={!fields.showSubtitle && !fields.showDate}>
                  <TextInput 
                    value={item.title} 
                    onChange={(v) => updateItem(realIdx, 'title', v)} 
                    placeholder={fields.titlePlaceholder} 
                    showBoldButton
                  />
                </Field>
                {fields.showSubtitle && (
                  <Field label={fields.subtitleLabel}>
                    <TextInput 
                      value={item.subtitle} 
                      onChange={(v) => updateItem(realIdx, 'subtitle', v)} 
                      placeholder={fields.subtitlePlaceholder} 
                      showBoldButton
                    />
                  </Field>
                )}
                {fields.showDate && (
                  <Field label={fields.dateLabel}>
                    <TextInput 
                      value={item.date} 
                      onChange={(v) => updateItem(realIdx, 'date', v)} 
                      placeholder={fields.datePlaceholder} 
                    />
                  </Field>
                )}
              </div>
              
              {fields.showDescription && (
                <div style={{ marginTop: '16px' }}>
                  <Field label={fields.descLabel} full>
                    <TextArea 
                      value={item.description} 
                      onChange={(v) => updateItem(realIdx, 'description', v)} 
                      placeholder={fields.descPlaceholder} 
                      rows={3} 
                    />
                  </Field>
                </div>
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
