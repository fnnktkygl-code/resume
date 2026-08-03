import { useTranslation } from '../../utils/TranslationContext';

/**
 * Standardized SectionHeader component for all resume builder steps.
 * Provides consistent layout, typography, section title input, and optional style dropdowns.
 */
export default function SectionHeader({
  title,
  onTitleChange,
  titlePlaceholder,
  styleControls
}) {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: 'var(--color-surface-alt, #fafafa)',
      padding: '14px 16px',
      borderRadius: '8px',
      border: '1px solid var(--color-border, #e5e7eb)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {styleControls && (
          <div style={{ flex: 1, minWidth: '260px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-secondary, #666)',
              marginBottom: '6px'
            }}>
              {styleControls.label}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {styleControls.dropdowns.map((drop, i) => (
                <select
                  key={i}
                  value={drop.value}
                  onChange={(e) => drop.onChange(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #ccc)',
                    backgroundColor: 'var(--color-surface, #fff)',
                    color: 'var(--color-text, #333)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {drop.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}

        {onTitleChange && (
          <div style={{ minWidth: '180px', flex: styleControls ? '0 0 auto' : '1' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-secondary, #666)',
              marginBottom: '6px'
            }}>
              {t('Section Title')}
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titlePlaceholder}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #ccc)',
                backgroundColor: 'var(--color-surface, #fff)',
                color: 'var(--color-text, #333)',
                fontSize: '13px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
