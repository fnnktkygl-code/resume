import { Field, TextInput, TextArea } from '../ui/FormFields';
import { createEmptyProject } from '../../utils/constants';
import { useTranslation } from '../../utils/TranslationContext';

export default function ProjectsStep({ data, onChange, onAIAssist }) {
  const { t } = useTranslation();
  const visibleItems = data.filter(e => !e.isSpacer);

  const updateProj = (realIdx, field, val) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], [field]: val };
    onChange(updated);
  };
  const updateHighlight = (realIdx, hlIdx, val) => {
    const updated = [...data];
    const highlights = [...updated[realIdx].highlights];
    highlights[hlIdx] = val;
    updated[realIdx] = { ...updated[realIdx], highlights };
    onChange(updated);
  };
  const addHighlight = (realIdx) => {
    const updated = [...data];
    updated[realIdx] = { ...updated[realIdx], highlights: [...updated[realIdx].highlights, ''] };
    onChange(updated);
  };
  const removeHighlight = (realIdx, hlIdx) => {
    const updated = [...data];
    const highlights = updated[realIdx].highlights.filter((_, i) => i !== hlIdx);
    updated[realIdx] = { ...updated[realIdx], highlights: highlights.length ? highlights : [''] };
    onChange(updated);
  };
  const addProj = () => onChange([...data, createEmptyProject()]);
  const removeProj = (realIdx) => {
    if (visibleItems.length <= 1) return;
    onChange(data.filter((_, i) => i !== realIdx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {visibleItems.map((proj, pi) => {
        const realIdx = data.findIndex(item => item.id === proj.id);
        return (
          <div key={proj.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-title">{t('Project')} {visibleItems.length > 1 ? `#${pi + 1}` : ''}</div>
              {visibleItems.length > 1 && (
                <button className="btn-danger" onClick={() => removeProj(realIdx)}>{t('Remove')}</button>
              )}
            </div>
            <div className="field-grid">
              <Field label={t('Project Name')}>
                <TextInput value={proj.name} onChange={(v) => updateProj(realIdx, 'name', v)} placeholder="Real-time Analytics Dashboard" />
              </Field>
              <Field label={t('Link')}>
                <TextInput value={proj.link} onChange={(v) => updateProj(realIdx, 'link', v)} placeholder="github.com/user/project" />
              </Field>
              <Field label={t('Tech Stack')} full>
                <TextInput value={proj.techStack} onChange={(v) => updateProj(realIdx, 'techStack', v)} placeholder="React, Node.js, PostgreSQL, WebSocket" />
              </Field>
              <Field label={t('Description')} full>
                <TextArea
                  value={proj.description}
                  onChange={(v) => updateProj(realIdx, 'description', v)}
                  onAIAssist={() => onAIAssist?.(proj.description, realIdx, -1)}
                  placeholder="Built a real-time analytics platform processing 1M+ events/day with sub-second dashboard updates."
                  rows={2}
                />
              </Field>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div className="field-label">{t('Key Achievements')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proj.highlights.map((hl, hi) => (
                  <div key={hi} className="bullet-row">
                    <span className="bullet-dot">•</span>
                    <div className="bullet-input-wrapper">
                      <TextArea
                        value={hl}
                        onChange={(v) => updateHighlight(realIdx, hi, v)}
                        onAIAssist={() => onAIAssist?.(hl, realIdx, hi)}
                        placeholder="Reduced data pipeline latency by 60% through query optimization"
                        rows={2}
                      />
                    </div>
                    {proj.highlights.length > 1 && (
                      <button className="btn-danger bullet-remove" onClick={() => removeHighlight(realIdx, hi)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-add" style={{ marginTop: '10px' }} onClick={() => addHighlight(realIdx)}>+ {t('Add highlight')}</button>
            </div>
          </div>
        );
      })}
      <button className="btn-add" onClick={addProj}>+ {t('Add another project')}</button>
      <div className="tip">
        💡 <strong>{t('Pro tip')}:</strong> {t('For junior developers or career changers, projects can be just as impactful as work experience. Include metrics and tech stack details.')}
      </div>
    </div>
  );
}
