import { Field, TextInput, Select } from '../ui/FormFields';
import { YEARS, createEmptyEducation } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function EducationStep({ data, onChange }) {
  const { t } = useTranslation();
  const updateEdu = (index, field, val) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };
  const addEdu = () => onChange([...data, createEmptyEducation()]);
  const removeEdu = (idx) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.map((edu, ei) => (
        <div key={edu.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title">{t('Education')} {data.length > 1 ? `#${ei + 1}` : ''}</div>
            {data.length > 1 && (
              <button className="btn-danger" onClick={() => removeEdu(ei)}>{t('Remove')}</button>
            )}
          </div>
          <div className="field-grid">
            <Field label={t('Institution')} full>
              <TextInput value={edu.institution} onChange={(v) => updateEdu(ei, 'institution', v)} placeholder="Massachusetts Institute of Technology" />
            </Field>
            <Field label={t('Degree')}>
              <TextInput value={edu.degree} onChange={(v) => updateEdu(ei, 'degree', v)} placeholder="Bachelor of Science" />
            </Field>
            <Field label={t('Field of Study')}>
              <TextInput value={edu.field} onChange={(v) => updateEdu(ei, 'field', v)} placeholder="Computer Science" />
            </Field>
            <Field label={t('Start Year')}>
              <Select value={edu.startYear} onChange={(v) => updateEdu(ei, 'startYear', v)} options={YEARS} placeholder={t('Year')} />
            </Field>
            <Field label={t('End Year')}>
              <Select value={edu.endYear} onChange={(v) => updateEdu(ei, 'endYear', v)} options={YEARS} placeholder={t('Year')} />
            </Field>
          </div>
        </div>
      ))}
      <button className="btn-add" onClick={addEdu}>+ {t('Add education')}</button>
    </div>
  );
}
