import { computeAtsScore } from '../utils/atsScore';
import { useTranslation } from '../utils/TranslationContext';
import { memo } from 'react';

function AtsScore({ data }) {
  const { t } = useTranslation();
  const { score, tips } = computeAtsScore(data);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';

  const statusText = score >= 80 ? t('Excellent — ready to apply') :
    score >= 50 ? t('Good — a few improvements left') :
    t('Needs work — follow the tips below');

  return (
    <div className="ats-widget">
      <div className="ats-header">
        <div className="ats-ring-container">
          <svg className="ats-ring-svg" viewBox="0 0 56 56" aria-hidden="true">
            <circle className="ats-ring-bg" cx="28" cy="28" r={radius} />
            <circle
              className="ats-ring-progress"
              cx="28" cy="28" r={radius}
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="ats-score-text" style={{ color }}>{score}</div>
        </div>
        <div className="ats-info">
          <h3>{t('ATS Readiness')}</h3>
          <p>{statusText}</p>
        </div>
      </div>
      {tips.length > 0 && (
        <div className="ats-tips" role="list" aria-label={t('ATS improvement tips')}>
          {tips.map((tip, i) => (
            <div key={i} className="ats-tip-item" role="listitem">{t(tip)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(AtsScore);
