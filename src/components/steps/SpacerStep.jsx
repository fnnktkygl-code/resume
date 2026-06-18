import React from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export default function SpacerStep({ data, onChange }) {
  const { t } = useTranslation();

  const handleHeightChange = (e) => {
    onChange({ ...data, height: Number(e.target.value) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <div style={{ marginBottom: '12px' }}>
          <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('Spacer Height')}</span>
            <span>{data.height || 32}px</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            {t('Adjust the height of this invisible spacer to push the content below it to the next page.')}
          </p>
          <input 
            type="range" 
            min="8" 
            max="1056" 
            step="8" 
            value={data.height || 32} 
            onChange={handleHeightChange} 
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div className="tip">
        💡 <strong>{t('Pro Tip')}:</strong> {t('Use this spacer to precisely control page breaks. If a section is split awkwardly across two pages, increase this spacer\'s height before it.')}
      </div>
    </div>
  );
}
