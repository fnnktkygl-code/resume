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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
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
        <div className="card-subtitle" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {t('Separate skills with commas. These should also appear naturally in your experience bullets for semantic AI matching.')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Technical Skills Card */}
        <div style={{
          background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💻</span> {t('Technical Skills')}
            </div>
            {onAISectionFill && <AISuggestButton sectionType="skills_technical" />}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
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
        </div>

        {/* Soft Skills Card */}
        <div style={{
          background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🤝</span> {t('Soft Skills')}
            </div>
            {onAISectionFill && <AISuggestButton sectionType="skills_soft" />}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                value={headings?.interpersonal || ''} 
                onChange={(v) => updateHeading('interpersonal', v)} 
                placeholder={t('Soft Skills Header')} 
              />
            </div>
          </div>
          <TagInput value={data.soft} onChange={(v) => update('soft', v)} placeholder="Team Leadership, Cross-functional Collaboration, Agile..." />
        </div>

        {/* Languages Card */}
        <div style={{
          background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌐</span> {t('Languages')}
            </div>
            {onAISectionFill && <AISuggestButton sectionType="skills_languages" />}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                value={headings?.languages || ''} 
                onChange={(v) => updateHeading('languages', v)} 
                placeholder={t('Languages Header')} 
              />
            </div>
          </div>
          <TagInput value={data.languages || ''} onChange={(v) => update('languages', v)} placeholder="English, French, Spanish..." />
        </div>
      </div>

      <div className="tip" style={{ borderRadius: '10px', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', color: 'var(--color-text)' }}>
        💡 <strong>{t('Keyword Strategy')}:</strong> {t('Mirror the exact phrasing from target job descriptions. Modern AI parsers understand synonyms, but legacy ATS still relies on exact matches.')}
      </div>
    </div>
  );
}
