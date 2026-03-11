import { Field, TextInput, TextArea } from '../ui/FormFields';
import { useTranslation } from '../../utils/TranslationContext';

export default function SkillsStep({ data, onChange }) {
  const { t } = useTranslation();
  const update = (field, val) => onChange({ ...data, [field]: val });
  return (
    <div className="card">
      <div className="card-title">{t('Skills')}</div>
      <div className="card-subtitle">
        {t('Separate skills with commas. These should also appear naturally in your experience bullets for semantic AI matching.')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label={t('Technical Skills')} full>
          <TextArea
            value={data.technical}
            onChange={(v) => update('technical', v)}
            placeholder="Python, TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, REST APIs, GraphQL"
            rows={3}
          />
        </Field>
        <Field label={t('Soft Skills')} full>
          <TextInput value={data.soft} onChange={(v) => update('soft', v)} placeholder="Team Leadership, Cross-functional Collaboration, Agile Project Management" />
        </Field>
        <Field label={t('Languages')} full>
          <TextInput value={data.languages} onChange={(v) => update('languages', v)} placeholder="English (Native), French (Professional)" />
        </Field>
      </div>
      <div className="tip">
        💡 <strong>{t('Keyword Strategy')}:</strong> {t('Mirror the exact phrasing from target job descriptions. Modern AI parsers understand synonyms, but legacy ATS still relies on exact matches.')}
      </div>
    </div>
  );
}
