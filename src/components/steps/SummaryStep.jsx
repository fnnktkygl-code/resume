import { TextArea } from '../ui/FormFields';
import SectionHeader from '../ui/SectionHeader';
import { useTranslation } from '../../utils/TranslationContext';

export default function SummaryStep({ data, onChange, onAIAssist, onAIBold, onAIRewrite, headings, onHeadingsChange }) {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <SectionHeader
          title={headings?.summary}
          onTitleChange={(v) => onHeadingsChange?.({ ...headings, summary: v })}
          titlePlaceholder={t('Summary')}
        />
        <div className="card-subtitle" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {t('2–4 sentences positioning you for the role. Include your years of experience, core expertise, and a standout metric.')}
        </div>
      </div>

      <div style={{
        background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📝</span> {t('Profil & Résumé Professionnel')}
        </div>
        <TextArea
          value={data}
          onChange={onChange}
          onAIAssist={() => onAIAssist?.(data)}
          onAIBold={() => onAIBold?.(data)}
          onAIRewrite={() => (onAIRewrite || onAIAssist)?.(data)}
          placeholder="Results-driven software engineer with 6+ years of experience building scalable web applications. Led a team of 8 engineers to ship a real-time analytics platform serving 2M+ daily users, reducing page load times by 45%. Passionate about clean architecture and developer experience."
          rows={5}
        />
        <div className="char-counter" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span className="char-count">{data.length} {t('characters')}</span>
          <span className={`char-status ${data.length > 50 && data.length < 400 ? 'good' : 'warn'}`}>
            {data.length < 50 ? t('Too short') : data.length > 400 ? t('Consider trimming') : t('Good length ✓')}
          </span>
        </div>
      </div>

      <div className="tip" style={{ borderRadius: '10px', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', color: 'var(--color-text)' }}>
        💡 <strong>{t('AI Screening Tip')}:</strong> {t('Semantic parsers look for evidence of impact. Weave skills into achievements rather than listing them generically.')}
      </div>
    </div>
  );
}
