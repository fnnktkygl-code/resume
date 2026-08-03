import { Field, TextInput } from '../ui/FormFields';
import TagInput from '../ui/TagInput';
import SectionHeader from '../ui/SectionHeader';
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
      <SectionHeader
        title={headings?.skills}
        onTitleChange={(v) => updateHeading('skills', v)}
        titlePlaceholder={t('SKILLS & TOOLS')}
        styleControls={{
          label: t('Skills Style'),
          dropdowns: [
            {
              value: layout?.skillStyle || 'pill',
              onChange: (v) => updateLayout('skillStyle', v),
              options: [
                { value: 'outline', label: t('Square Contour') },
                { value: 'pill-outline', label: t('Rounded Contour') },
                { value: 'square', label: t('Squares') },
                { value: 'pill', label: t('Rounded Circles') },
                { value: 'text', label: t('Simple Text') }
              ]
            },
            {
              value: layout?.coloredSkillsMode || (layout?.coloredSkills === true ? 'all' : 'highlighted'),
              onChange: (v) => {
                updateLayout('coloredSkillsMode', v);
                updateLayout('coloredSkills', v === 'all');
              },
              options: [
                { value: 'neutral', label: t('Neutral Skills') },
                { value: 'highlighted', label: t('AI Highlighted') },
                { value: 'all', label: t('Color All Skills') }
              ]
            }
          ]
        }}
      />
      <div className="card-subtitle">
        {t('Separate skills with commas. These should also appear naturally in your experience bullets for semantic AI matching.')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
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
          <TagInput
            value={data.technical}
            onChange={(v) => update('technical', v)}
            placeholder="Python, TypeScript, React, Node.js, PostgreSQL, AWS, Docker..."
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
          <TagInput value={data.soft} onChange={(v) => update('soft', v)} placeholder="Team Leadership, Cross-functional Collaboration, Agile..." />
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
          <TagInput value={data.languages || ''} onChange={(v) => update('languages', v)} placeholder="English, French, Spanish..." />
        </Field>
      </div>
      <div className="tip">
        💡 <strong>{t('Keyword Strategy')}:</strong> {t('Mirror the exact phrasing from target job descriptions. Modern AI parsers understand synonyms, but legacy ATS still relies on exact matches.')}
      </div>
    </div>
  );
}

