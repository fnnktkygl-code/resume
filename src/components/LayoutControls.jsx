import { useTranslation } from '../utils/TranslationContext';

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
      itemSpacing: 8
    });
  };

  return (
    <div className="layout-controls-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '13px' }}>⚙️ {t('Layout Settings')}</div>
        <button className="btn-secondary" onClick={resetLayout} style={{ padding: '4px 8px', fontSize: '11px' }}>{t('Reset Layout')}</button>
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
