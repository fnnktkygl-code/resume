import { useTranslation } from '../utils/TranslationContext';

const COLOR_PALETTES = [
  { name: 'Navy Blue', value: '#0F3A8C' },
  { name: 'Emerald Green', value: '#1B6B3A' },
  { name: 'Deep Burgundy', value: '#800020' },
  { name: 'Slate Gray', value: '#475569' },
  { name: 'Minimalist Charcoal', value: '#111827' }
];

export default function LayoutControls({ layout, onChange, onClose }) {
  const { t, language } = useTranslation();

  const handleUpdate = (field, value) => {
    onChange({ ...layout, [field]: value });
  };

  const resetLayout = () => {
    onChange({
      isCompact: false,
      fontSize: 10.5,
      paddingX: 0.75,
      paddingY: 0.75,
      lineHeight: 1.45,
      sectionSpacing: 8,
      itemSpacing: 12,
      accentColor: '#1B6B3A',
      fontFamily: 'Inter',
      splitLinks: true
    });
  };

  const fitToSinglePage = () => {
    onChange({
      ...layout,
      isCompact: true,
      fontSize: 9.75,
      lineHeight: 1.3,
      paddingX: 0.5,
      paddingY: 0.5,
      sectionSpacing: 5,
      itemSpacing: 6
    });
  };

  return (
    <div className="layout-controls-panel" style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
      {/* Header with Title, Fit-1-Page & Close button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text)' }}>
          <span>⚙️</span> {t('Layout Settings')}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button 
            type="button"
            className="btn-primary" 
            onClick={fitToSinglePage} 
            data-tooltip={t('Automatically calibrate margins, font size and spacing to fit exactly onto 1 page')}
            data-tooltip-pos="top"
            style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
          >
            ⚡ {t('Fit to 1 Page')}
          </button>
          <button 
            type="button"
            className="btn-secondary" 
            onClick={resetLayout} 
            data-tooltip={t('Reset layout settings to default')}
            data-tooltip-pos="top"
            style={{ padding: '4px 8px', fontSize: '11px' }}
          >
            {t('Reset Layout')}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                marginLeft: '2px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Accent Color & Font Family */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>{t('Accent Color')}</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.value}
                type="button"
                onClick={() => handleUpdate('accentColor', palette.value)}
                data-tooltip={t(palette.name)}
                data-tooltip-pos="top"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: palette.value,
                  border: layout.accentColor === palette.value ? '2px solid var(--color-border-focus)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transform: layout.accentColor === palette.value ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease, border 0.15s ease'
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--color-text-secondary)' }} htmlFor="font-select">{t('Font Family')}</label>
          <select
            id="font-select"
            value={layout.fontFamily || 'Inter'}
            onChange={(e) => handleUpdate('fontFamily', e.target.value)}
            data-tooltip={t('Choose resume font family')}
            data-tooltip-pos="top"
            style={{
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '12px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="Inter">{t('Classic Sans (Inter)')}</option>
            <option value="Roboto, sans-serif">{t('Clean Sans (Roboto)')}</option>
            <option value="Open Sans, sans-serif">{t('Friendly Sans (Open Sans)')}</option>
            <option value="Lato, sans-serif">{t('Warm Sans (Lato)')}</option>
            <option value="Outfit, sans-serif">{t('Modern Geometric (Outfit)')}</option>
            <option value="Fraunces, Georgia, serif">{t('Elegant Serif (Fraunces)')}</option>
            <option value="Lora, serif">{t('Readable Serif (Lora)')}</option>
            <option value="Merriweather, serif">{t('Sturdy Serif (Merriweather)')}</option>
            <option value="JetBrains Mono, monospace">{t('Modern Mono (JetBrains)')}</option>
          </select>
        </div>
      </div>
      
      {/* 2-Column Live Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
        {/* Margins: Side & Top/Bottom */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust left and right side margins')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Side Padding')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.paddingX} in</strong>
          </div>
          <input type="range" min="0.2" max="1.5" step="0.05" value={layout.paddingX} onChange={(e) => handleUpdate('paddingX', Number(e.target.value))} />
        </div>

        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust top and bottom page margins')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Top/Bottom Padding')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.paddingY} in</strong>
          </div>
          <input type="range" min="0.2" max="1.5" step="0.05" value={layout.paddingY} onChange={(e) => handleUpdate('paddingY', Number(e.target.value))} />
        </div>

        {/* Font Size & Line Height */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust main font size')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Font Size')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.fontSize} pt</strong>
          </div>
          <input type="range" min="8" max="13" step="0.25" value={layout.fontSize} onChange={(e) => handleUpdate('fontSize', Number(e.target.value))} />
        </div>

        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust paragraph line spacing')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Line Height')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.lineHeight}</strong>
          </div>
          <input type="range" min="1.1" max="1.8" step="0.05" value={layout.lineHeight} onChange={(e) => handleUpdate('lineHeight', Number(e.target.value))} />
        </div>

        {/* Spacings: Sections & Items */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust spacing between sections')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Section Spacing')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.sectionSpacing} px</strong>
          </div>
          <input type="range" min="0" max="24" step="1" value={layout.sectionSpacing} onChange={(e) => handleUpdate('sectionSpacing', Number(e.target.value))} />
        </div>

        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          data-tooltip={t('Adjust spacing between items')}
          data-tooltip-pos="top"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{t('Item Spacing')}</span>
            <strong style={{ color: 'var(--color-accent)' }}>{layout.itemSpacing} px</strong>
          </div>
          <input type="range" min="0" max="20" step="1" value={layout.itemSpacing} onChange={(e) => handleUpdate('itemSpacing', Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
