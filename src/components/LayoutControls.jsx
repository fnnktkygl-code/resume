import { useTranslation } from '../utils/TranslationContext';

const COLOR_PALETTES = [
  { name: 'Navy Blue', value: '#0F3A8C' },
  { name: 'Emerald Green', value: '#1B6B3A' },
  { name: 'Deep Burgundy', value: '#800020' },
  { name: 'Slate Gray', value: '#475569' },
  { name: 'Minimalist Charcoal', value: '#111827' }
];

export default function LayoutControls({ layout, onChange }) {
  const { t } = useTranslation();

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
      sectionSpacing: 10,
      itemSpacing: 8,
      accentColor: '#1B6B3A',
      fontFamily: 'Inter'
    });
  };

  return (
    <div className="layout-controls-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '13px' }}>⚙️ {t('Layout Settings')}</div>
        <button className="btn-secondary" onClick={resetLayout} style={{ padding: '4px 8px', fontSize: '11px' }}>{t('Reset Layout')}</button>
      </div>

      {/* Accent Color, Font Family & Skill Style Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t('Accent Color')}</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.value}
                type="button"
                onClick={() => handleUpdate('accentColor', palette.value)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: palette.value,
                  border: layout.accentColor === palette.value ? '2px solid var(--color-border-focus)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transform: layout.accentColor === palette.value ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease, border 0.15s ease',
                  boxShadow: layout.accentColor === palette.value ? 'var(--shadow-sm)' : 'none'
                }}
                title={t(palette.name)}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text-secondary)' }} htmlFor="font-select">{t('Font Family')}</label>
          <select
            id="font-select"
            value={layout.fontFamily || 'Inter'}
            onChange={(e) => handleUpdate('fontFamily', e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer'
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text-secondary)' }} htmlFor="skill-style-select">{t('Skill Style')}</label>
          <select
            id="skill-style-select"
            value={layout.skillStyle || 'pill'}
            onChange={(e) => handleUpdate('skillStyle', e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="pill">{t('Rounded Circles')}</option>
            <option value="square">{t('Squares')}</option>
            <option value="text">{t('Simple Text')}</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Font Size')}: {layout.fontSize}pt</label>
          <input type="range" min="8" max="14" step="0.5" value={layout.fontSize} onChange={(e) => handleUpdate('fontSize', Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Top/Bottom Padding')}: {layout.paddingY}in</label>
          <input type="range" min="0" max="2" step="0.1" value={layout.paddingY} onChange={(e) => handleUpdate('paddingY', Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Side Padding')}: {layout.paddingX}in</label>
          <input type="range" min="0" max="2" step="0.1" value={layout.paddingX} onChange={(e) => handleUpdate('paddingX', Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Line Height')}: {layout.lineHeight}</label>
          <input type="range" min="1" max="2" step="0.05" value={layout.lineHeight} onChange={(e) => handleUpdate('lineHeight', Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Section Spacing')}: {layout.sectionSpacing}px</label>
          <input type="range" min="0" max="32" step="2" value={layout.sectionSpacing} onChange={(e) => handleUpdate('sectionSpacing', Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>{t('Item Spacing')}: {layout.itemSpacing}px</label>
          <input type="range" min="0" max="24" step="2" value={layout.itemSpacing} onChange={(e) => handleUpdate('itemSpacing', Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
