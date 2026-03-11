import { Field, TextInput, TextArea } from '../ui/FormFields';
import { createEmptyCustomItem } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CustomStep({ section, onChange }) {
  const { t } = useTranslation();

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
        <div className="card-title" style={{ marginBottom: '16px' }}>{t('Section Name')}</div>
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
