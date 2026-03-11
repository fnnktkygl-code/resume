import { TextArea } from '../ui/FormFields';
import { useTranslation } from '../../utils/TranslationContext';

export default function SummaryStep({ data, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="card-title">{t('Professional Summary')}</div>
      <div className="card-subtitle">
        {t('2–4 sentences positioning you for the role. Include your years of experience, core expertise, and a standout metric.')}
      </div>
      <TextArea
        value={data}
        onChange={onChange}
        placeholder="Results-driven software engineer with 6+ years of experience building scalable web applications. Led a team of 8 engineers to ship a real-time analytics platform serving 2M+ daily users, reducing page load times by 45%. Passionate about clean architecture and developer experience."
        rows={5}
      />
      <div className="char-counter">
        <span className="char-count">{data.length} {t('characters')}</span>
        <span className={`char-status ${data.length > 50 && data.length < 400 ? 'good' : 'warn'}`}>
          {data.length < 50 ? t('Too short') : data.length > 400 ? t('Consider trimming') : t('Good length ✓')}
        </span>
      </div>
      <div className="tip">
        💡 <strong>{t('AI Screening Tip')}:</strong> {t('Semantic parsers look for evidence of impact. Weave skills into achievements rather than listing them generically.')}
      </div>
    </div>
  );
}
