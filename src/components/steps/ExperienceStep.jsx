import { Field, TextInput, TextArea, Select } from '../ui/FormFields';
import { MONTHS, YEARS, createEmptyExperience } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function ExperienceStep({ data, onChange }) {
  const { t } = useTranslation();
  const updateExp = (index, field, val) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };
  const updateBullet = (expIdx, bulletIdx, val) => {
    const updated = [...data];
    const bullets = [...updated[expIdx].bullets];
    bullets[bulletIdx] = val;
    updated[expIdx] = { ...updated[expIdx], bullets };
    onChange(updated);
  };
  const addBullet = (expIdx) => {
    const updated = [...data];
    updated[expIdx] = { ...updated[expIdx], bullets: [...updated[expIdx].bullets, ''] };
    onChange(updated);
  };
  const removeBullet = (expIdx, bulletIdx) => {
    const updated = [...data];
    const bullets = updated[expIdx].bullets.filter((_, i) => i !== bulletIdx);
    updated[expIdx] = { ...updated[expIdx], bullets: bullets.length ? bullets : [''] };
    onChange(updated);
  };
  const addExp = () => onChange([...data, createEmptyExperience()]);
  const removeExp = (idx) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  const hasMissingMetric = (bullet) => bullet.length > 20 && !/\d/.test(bullet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.map((exp, ei) => (
        <div key={exp.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title">{t('Experience')} {data.length > 1 ? `#${ei + 1}` : ''}</div>
            {data.length > 1 && (
              <button className="btn-danger" onClick={() => removeExp(ei)}>{t('Remove')}</button>
            )}
          </div>
          <div className="field-grid">
            <Field label={t('Company')}>
              <TextInput value={exp.company} onChange={(v) => updateExp(ei, 'company', v)} placeholder="Acme Corp" />
            </Field>
            <Field label={t('Job Title')}>
              <TextInput value={exp.title} onChange={(v) => updateExp(ei, 'title', v)} placeholder="Senior Software Engineer" />
            </Field>
            <Field label={t('Start Month')}>
              <Select value={exp.startMonth} onChange={(v) => updateExp(ei, 'startMonth', v)} options={MONTHS} placeholder={t('Month')} />
            </Field>
            <Field label={t('Start Year')}>
              <Select value={exp.startYear} onChange={(v) => updateExp(ei, 'startYear', v)} options={YEARS} placeholder={t('Year')} />
            </Field>
            {!exp.current && (
              <>
                <Field label={t('End Month')}>
                  <Select value={exp.endMonth} onChange={(v) => updateExp(ei, 'endMonth', v)} options={MONTHS} placeholder={t('Month')} />
                </Field>
                <Field label={t('End Year')}>
                  <Select value={exp.endYear} onChange={(v) => updateExp(ei, 'endYear', v)} options={YEARS} placeholder={t('Year')} />
                </Field>
              </>
            )}
            <Field full>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExp(ei, 'current', e.target.checked)}
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
                        onChange={(v) => updateBullet(ei, bi, v)}
                        placeholder="Led migration of monolithic API to microservices, reducing deploy times by 70% and improving uptime to 99.95%"
                        rows={2}
                      />
                    </div>
                    {exp.bullets.length > 1 && (
                      <button className="btn-danger bullet-remove" onClick={() => removeBullet(ei, bi)}>✕</button>
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
            <button className="btn-add" style={{ marginTop: '10px' }} onClick={() => addBullet(ei)}>+ {t('Add bullet point')}</button>
          </div>
        </div>
      ))}
      <button className="btn-add" onClick={addExp}>+ {t('Add another position')}</button>
      <div className="tip">
        💡 <strong>{t('STAR Method')}:</strong> {t('Frame each bullet as Action → Context → Measurable Result. ATS semantic AI extracts evidence of impact, not just duties.')}
      </div>
    </div>
  );
}
