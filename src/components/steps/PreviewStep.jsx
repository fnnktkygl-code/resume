import { useRef } from 'react';
import ResumePreview from '../ResumePreview';
import { exportMarkdown, exportJson, importJson } from '../../utils/exporters';
import { useTranslation } from '../../utils/TranslationContext';

export default function PreviewStep({ data, layout, language, template = 'standard', onImport }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handlePrint = () => window.print();

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJson(file);
      onImport(imported);
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <div className="card-title">{t('Your Resume is Ready')}</div>
        <div className="card-subtitle">
          {t('Single-column, standardized headers, text-based bullets — optimized for ATS parsing, AI screening, and human readability.')}
        </div>
        <div className="export-buttons">
          <button className="btn-primary" onClick={handlePrint}>🖨️ {t('Print / Save as PDF')}</button>
          <button className="btn-secondary" onClick={() => exportMarkdown(data)}>📄 {t('Markdown')}</button>
          <button className="btn-secondary" onClick={() => exportJson(data)}>💾 {t('Export JSON')}</button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>📂 {t('Import JSON')}</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
        <div className="tip" style={{ marginTop: '14px' }}>
          💡 <strong>{t('Best format for ATS')}:</strong> {t('Use "Print → Save as PDF" for a text-based PDF with perfect parsing. The JSON export lets you reimport your data later.')}
        </div>
      </div>
      <div className="preview-full">
        <ResumePreview data={data} layout={layout} language={language} template={template} />
      </div>
    </div>
  );
}
