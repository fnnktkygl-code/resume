import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { CustomSelect } from './FormFields';

/**
 * Minimalist Japandi / Apple SectionHeader component.
 * Provides a clean inline section title, discreet rename & styling drawer,
 * and contextual AI translation without cluttering the screen.
 */
export default function SectionHeader({
  title,
  onTitleChange,
  titlePlaceholder,
  styleControls,
  onTranslate,
  isTranslating = false,
  onDelete
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  const hasAdvancedOptions = !!styleControls || !!onTranslate || !!onTitleChange || !!onDelete;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 0 12px 0',
      borderBottom: '1px solid var(--color-border)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        {onTitleChange ? (
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={titlePlaceholder}
            aria-label={t('Section Title')}
            style={{
              fontSize: '18px',
              fontWeight: '700',
              fontFamily: 'inherit',
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid transparent',
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              outline: 'none',
              width: '100%',
              maxWidth: '360px',
              transition: 'border-color 0.15s ease, background-color 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.backgroundColor = 'var(--color-surface)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.backgroundColor = 'transparent';
            }}
          />
        ) : (
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.2px'
          }}>
            {title || titlePlaceholder}
          </h2>
        )}
      </div>

      {hasAdvancedOptions && (
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className="control-btn"
            onClick={() => setShowOptions(!showOptions)}
            data-tooltip={t('Section settings & translation')}
            data-tooltip-pos="left"
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '6px',
              backgroundColor: showOptions ? 'var(--color-surface-alt)' : 'transparent',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)'
            }}
          >
            <span>⚙️</span>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>{t('Options')}</span>
          </button>

          {showOptions && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 100,
              minWidth: '240px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {onTranslate && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(false);
                    onTranslate();
                  }}
                  disabled={isTranslating}
                  className="btn-demo"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '8px 10px',
                    fontSize: '12px',
                    gap: '8px',
                    backgroundColor: 'var(--color-accent-light)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '6px'
                  }}
                >
                  <span>🌐</span>
                  <span>{isTranslating ? t('Translating...') : t('Traduire cette section')}</span>
                </button>
              )}

              {styleControls && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                    {styleControls.label}
                  </label>
                  {styleControls.dropdowns.map((drop, i) => (
                    <CustomSelect
                      key={i}
                      value={drop.value}
                      onChange={(newVal) => drop.onChange(newVal)}
                      options={drop.options}
                      size="sm"
                    />
                  ))}
                </div>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(false);
                    onDelete();
                  }}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '8px 10px',
                    fontSize: '12px',
                    gap: '8px',
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>{t('Delete Section')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
