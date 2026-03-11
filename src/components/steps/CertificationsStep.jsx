import { Field, TextInput } from '../ui/FormFields';
import { createEmptyCertification } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CertificationsStep({ data, onChange }) {
  const { t } = useTranslation();
  const updateCert = (index, field, val) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };
  const addCert = () => onChange([...data, createEmptyCertification()]);
  const removeCert = (idx) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.map((cert, ci) => (
        <div key={cert.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title">{t('Certification')} {data.length > 1 ? `#${ci + 1}` : ''}</div>
            {data.length > 1 && (
              <button className="btn-danger" onClick={() => removeCert(ci)}>{t('Remove')}</button>
            )}
          </div>
          <div className="field-grid">
            <Field label={t('Certification Name')} full>
              <TextInput value={cert.name} onChange={(v) => updateCert(ci, 'name', v)} placeholder="AWS Solutions Architect – Professional" />
            </Field>
            <Field label={t('Issuing Organization')}>
              <TextInput value={cert.issuer} onChange={(v) => updateCert(ci, 'issuer', v)} placeholder="Amazon Web Services" />
            </Field>
            <Field label={t('Date')}>
              <TextInput value={cert.date} onChange={(v) => updateCert(ci, 'date', v)} placeholder="Mar 2024" />
            </Field>
            <Field label={t('Credential URL')} full>
              <TextInput value={cert.credentialUrl} onChange={(v) => updateCert(ci, 'credentialUrl', v)} placeholder="https://verify.example.com/ABC123" />
            </Field>
          </div>
        </div>
      ))}
      <button className="btn-add" onClick={addCert}>+ {t('Add certification')}</button>
      <div className="tip">
        💡 <strong>{t('Tip')}:</strong> {t('Industry certifications (AWS, Google, PMP) significantly boost ATS scores. Include the credential ID or verification URL when available.')}
      </div>
    </div>
  );
}
