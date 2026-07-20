import { Field, TextInput, TextArea } from '../ui/FormFields';
import { useTranslation } from '../../utils/TranslationContext';

export default function SkillsStep({ data, onChange, headings, onHeadingsChange, layout, onLayoutChange, onAISectionFill }) {
  const { t } = useTranslation();
  const update = (field, val) => onChange({ ...data, [field]: val });
  const updateHeading = (field, val) => onHeadingsChange && onHeadingsChange({ ...headings, [field]: val });
  const updateLayout = (field, val) => onLayoutChange && onLayoutChange({ ...layout, [field]: val });

  const AISuggestButton = ({ sectionType }) => (
    <button
      type="button"
      onClick={() => onAISectionFill?.(sectionType)}
      className="btn-ai-suggest"
      title={t('AI Suggestions')}
      style={{
        background: 'var(--color-accent-light)',
        border: 'none',
        color: 'var(--color-accent)',
        cursor: 'pointer',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '600',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      ✨ {t('AI Suggest')}
    </button>
  );

  return (
    <div className="card">
      <div className="card-title">{t('Skills')}</div>
      <div className="card-subtitle">
        {t('Separate skills with commas. These should also appear naturally in your experience bullets for semantic AI matching.')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label={t('Skill Style')} full>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select
                value={layout?.skillStyle || 'pill'}
                onChange={(e) => updateLayout('skillStyle', e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <option value="pill">{t('Rounded Circles')}</option>
                <option value="square">{t('Squares')}</option>
                <option value="text">{t('Simple Text')}</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select
                value={layout?.coloredSkills === undefined ? true : layout.coloredSkills}
                onChange={(e) => updateLayout('coloredSkills', e.target.value === 'true')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <option value="true">{t('Color Technical Skills')}</option>
                <option value="false">{t('Neutral Technical Skills')}</option>
              </select>
            </div>
          </div>
        </Field>
        <Field label={t('Skills Header')} full>
          <TextInput 
            value={headings?.skills || ''} 
            onChange={(v) => updateHeading('skills', v)} 
            placeholder={t('SKILLS & TOOLS')} 
          />
        </Field>
        <Field label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('Technical Skills')}
            {onAISectionFill && <AISuggestButton sectionType="skills_technical" />}
          </span>
        } full>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                value={headings?.technical || ''} 
                onChange={(v) => updateHeading('technical', v)} 
                placeholder={t('Technical Skills Header')} 
              />
            </div>
          </div>
          <TextArea
            value={data.technical}
            onChange={(v) => update('technical', v)}
            placeholder="Python, TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, REST APIs, GraphQL"
            rows={3}
          />
        </Field>
        <Field label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('Soft Skills')}
            {onAISectionFill && <AISuggestButton sectionType="skills_soft" />}
          </span>
        } full>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                value={headings?.interpersonal || ''} 
                onChange={(v) => updateHeading('interpersonal', v)} 
                placeholder={t('Soft Skills Header')} 
              />
            </div>
          </div>
          <TextInput value={data.soft} onChange={(v) => update('soft', v)} placeholder="Team Leadership, Cross-functional Collaboration, Agile Project Management" />
        </Field>
        <Field label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('Languages')}
            {onAISectionFill && <AISuggestButton sectionType="skills_languages" />}
          </span>
        } full>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                value={headings?.languages || ''} 
                onChange={(v) => updateHeading('languages', v)} 
                placeholder={t('Languages Header')} 
              />
            </div>
          </div>
          <TextInput value={data.languages || ''} onChange={(v) => update('languages', v)} placeholder="English, French, Spanish" />
        </Field>
      </div>
      <div className="tip">
        💡 <strong>{t('Keyword Strategy')}:</strong> {t('Mirror the exact phrasing from target job descriptions. Modern AI parsers understand synonyms, but legacy ATS still relies on exact matches.')}
      </div>
    </div>
  );
}

