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
              <Field label={t('Title / Name')}>
                <TextInput 
                  value={item.title} 
                  onChange={(v) => updateItem(ii, 'title', v)} 
                  placeholder={t('E.g., Employee of the Year')} 
                />
              </Field>
              <Field label={t('Subtitle / Issuer')}>
                <TextInput 
                  value={item.subtitle} 
                  onChange={(v) => updateItem(ii, 'subtitle', v)} 
                  placeholder={t('E.g., Acme Corp')} 
                />
              </Field>
              <Field label={t('Date / Year')}>
                <TextInput 
                  value={item.date} 
                  onChange={(v) => updateItem(ii, 'date', v)} 
                  placeholder={t('E.g., 2023 or Nov 2023')} 
                />
              </Field>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <Field label={t('Description / Details (Optional)')}>
                <TextArea 
                  value={item.description} 
                  onChange={(v) => updateItem(ii, 'description', v)} 
                  placeholder={t('Provide any additional context or details here...')} 
                  rows={3} 
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-add" onClick={addItem}>+ {t('Add another item')}</button>
    </div>
  );
}
