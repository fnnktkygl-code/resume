import { Field, TextInput } from '../ui/FormFields';
import { createEmptyCertification } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function CertificationsStep({ data, onChange, onAISectionFill, headings, onHeadingsChange }) {
  const { t } = useTranslation();
  const visibleItems = data.filter(e => !e.isSpacer);

  const updateCert = (realIdx, field, val) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], [field]: val };
    onChange(updated);
  };
  const addCert = () => onChange([...data, createEmptyCertification()]);
  const removeCert = (realIdx) => {
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('Section title')}:</span>
        <TextInput
          value={headings?.certifications || ''}
          onChange={v => onHeadingsChange?.({ ...headings, certifications: v })}
          placeholder={t('Certifications')}
          style={{ padding: '4px 8px', fontSize: '12px', width: '160px' }}
        />
      </div>
      {visibleItems.map((cert, ci) => {
        const realIdx = data.findIndex(item => item.id === cert.id);
        return (
          <div key={cert.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-title">{t('Certification')} {visibleItems.length > 1 ? `#${ci + 1}` : ''}</div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {visibleItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="control-btn"
                      onClick={() => moveItem(realIdx, -1)}
                      disabled={ci === 0}
                      style={{ padding: '6px', opacity: ci === 0 ? 0.3 : 1, cursor: ci === 0 ? 'default' : 'pointer' }}
                      title={t('Move Up')}
                    >
                      <i className="fi fi-rr-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="control-btn"
                      onClick={() => moveItem(realIdx, 1)}
                      disabled={ci === visibleItems.length - 1}
                      style={{ padding: '6px', opacity: ci === visibleItems.length - 1 ? 0.3 : 1, cursor: ci === visibleItems.length - 1 ? 'default' : 'pointer' }}
                      title={t('Move Down')}
                    >
                      <i className="fi fi-rr-arrow-down"></i>
                    </button>
                  </>
                )}
                {visibleItems.length > 1 && (
                  <button className="btn-danger" onClick={() => removeCert(realIdx)} style={{ marginLeft: '6px' }}>{t('Remove')}</button>
                )}
              </div>
            </div>
            <div className="field-grid">
              <Field label={t('Certification Name')} full>
                <TextInput value={cert.name} onChange={(v) => updateCert(realIdx, 'name', v)} placeholder="AWS Solutions Architect – Professional" />
              </Field>
            <Field label={t('Issuing Organization')}>
              <TextInput value={cert.issuer} onChange={(v) => updateCert(realIdx, 'issuer', v)} placeholder="Amazon Web Services" />
            </Field>
            <Field label={t('Date')}>
              <TextInput value={cert.date} onChange={(v) => updateCert(realIdx, 'date', v)} placeholder="Mar 2024" />
            </Field>
            <Field label={t('Credential URL')} full>
              <TextInput value={cert.credentialUrl} onChange={(v) => updateCert(realIdx, 'credentialUrl', v)} placeholder="https://verify.example.com/ABC123" />
            </Field>
          </div>
        </div>
      );
    })}
      <button className="btn-add" onClick={addCert}>+ {t('Add certification')}</button>
      {onAISectionFill && (
        <button
          type="button"
          onClick={() => onAISectionFill('certifications')}
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
          ✨ {t('AI Suggest Certifications')}
        </button>
      )}
      <div className="tip">
        💡 <strong>{t('Tip')}:</strong> {t('Industry certifications (AWS, Google, PMP) significantly boost ATS scores. Include the credential ID or verification URL when available.')}
      </div>
    </div>
  );
}
