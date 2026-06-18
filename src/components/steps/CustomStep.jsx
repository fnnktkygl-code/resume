import { Field, TextInput, TextArea } from '../ui/FormFields';
import { createEmptyCustomItem } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CustomStep({ section, onChange, onDelete }) {
  const { t } = useTranslation();

  if (!section) return null;

  const updateSectionLabel = (label) => {
    onChange({ ...section, label });
  };

  const updateItem = (index, field, val) => {
    const updatedItems = [...section.items];
    updatedItems[index] = { ...updatedItems[index], [field]: val };
    onChange({ ...section, items: updatedItems });
  };

  const addItem = () => {
    onChange({ ...section, items: [...section.items, createEmptyCustomItem()] });
  };

  const removeItem = (idx) => {
    if (section.items.length <= 1) return;
    const updatedItems = section.items.filter((_, i) => i !== idx);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('Section Name')}</span>
          {onDelete && (
            <button className="btn-danger" onClick={onDelete} style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              {t('Delete Section')}
            </button>
          )}
        </div>
        <Field label={t('Name of this section (e.g., Awards, Publications, Languages)')}>
          <TextInput 
            value={section.label} 
            onChange={updateSectionLabel} 
            placeholder={t('Custom Section Name')} 
          />
        </Field>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {section.items.map((item, ii) => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-title">{section.label || t('Item')} {section.items.length > 1 ? `#${ii + 1}` : ''}</div>
              {section.items.length > 1 && (
                <button className="btn-danger" onClick={() => removeItem(ii)}>{t('Remove')}</button>
              )}
            </div>
            
            <div className="field-grid">
              <Field label={fields.titleLabel} full={!fields.showSubtitle && !fields.showDate}>
                <TextInput 
                  value={item.title} 
                  onChange={(v) => updateItem(ii, 'title', v)} 
                  placeholder={fields.titlePlaceholder} 
                />
              </Field>
              {fields.showSubtitle && (
                <Field label={fields.subtitleLabel}>
                  <TextInput 
                    value={item.subtitle} 
                    onChange={(v) => updateItem(ii, 'subtitle', v)} 
                    placeholder={fields.subtitlePlaceholder} 
                  />
                </Field>
              )}
              {fields.showDate && (
                <Field label={fields.dateLabel}>
                  <TextInput 
                    value={item.date} 
                    onChange={(v) => updateItem(ii, 'date', v)} 
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
                    onChange={(v) => updateItem(ii, 'description', v)} 
                    placeholder={fields.descPlaceholder} 
                    rows={3} 
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="btn-add" onClick={addItem}>+ {t('Add another item')}</button>
    </div>
  );
}
