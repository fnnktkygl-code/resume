import ResumePreview from './ResumePreview';
import { useTranslation } from '../utils/TranslationContext';

/**
 * Fullscreen CV preview overlay with pagination and zoom controls.
 * Extracted from App.jsx to reduce its size (Audit §4.1).
 */
export default function FullscreenPreview({
  data,
  layout,
  language,
  template,
  editorPagesCount,
  calculatedFullscreenScale,
  fullscreenZoom,
  setFullscreenZoom,
  fullscreenPageIndex,
  setFullscreenPageIndex,
  onClose,
}) {
  const { t } = useTranslation();
  const displayScale = calculatedFullscreenScale * fullscreenZoom;

  return (
    <div className="fullscreen-preview-overlay" role="dialog" aria-modal="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="fullscreen-preview-toolbar">
        <div className="fullscreen-toolbar-title" style={{ flex: '1 1 0' }}>
          <span>⛶</span> {t('Fullscreen Preview')}
        </div>
        
        {editorPagesCount > 1 && (
          <div className="fullscreen-toolbar-pagination" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 auto' }}>
            <button 
              className="control-btn"
              onClick={() => setFullscreenPageIndex(p => Math.max(0, p - 1))}
              disabled={fullscreenPageIndex === 0}
              style={{ opacity: fullscreenPageIndex === 0 ? 0.4 : 1, cursor: fullscreenPageIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              <i className="fi fi-rr-angle-left"></i>
            </button>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600', minWidth: '80px', textAlign: 'center' }}>
              {fullscreenPageIndex + 1} / {editorPagesCount}
            </span>
            <button 
              className="control-btn"
              onClick={() => setFullscreenPageIndex(p => Math.min(editorPagesCount - 1, p + 1))}
              disabled={fullscreenPageIndex === editorPagesCount - 1}
              style={{ opacity: fullscreenPageIndex === editorPagesCount - 1 ? 0.4 : 1, cursor: fullscreenPageIndex === editorPagesCount - 1 ? 'not-allowed' : 'pointer' }}
            >
              <i className="fi fi-rr-angle-right"></i>
            </button>
          </div>
        )}

        <div className="fullscreen-toolbar-actions" style={{ flex: '1 1 0', justifyContent: 'flex-end' }}>
          <div className="control-group" style={{ gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '6px', marginRight: '16px' }}>
            <button 
              className="control-btn"
              onClick={() => setFullscreenZoom(z => Math.max(0.5, z - 0.1))}
              disabled={fullscreenZoom <= 0.5}
              style={{ border: 'none', background: 'transparent', color: '#fff' }}
              title={t('Zoom Out')}
            >
              -
            </button>
            <button 
              className="control-btn"
              onClick={() => setFullscreenZoom(1.0)}
              style={{ border: 'none', background: 'transparent', color: '#fff', minWidth: '55px', fontSize: '11px', fontWeight: '700' }}
              title={t('Reset Zoom')}
            >
              {Math.round(fullscreenZoom * 100)}%
            </button>
            <button 
              className="control-btn"
              onClick={() => setFullscreenZoom(z => Math.min(2.0, z + 0.1))}
              disabled={fullscreenZoom >= 2.0}
              style={{ border: 'none', background: 'transparent', color: '#fff' }}
              title={t('Zoom In')}
            >
              +
            </button>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setTimeout(() => window.print(), 100)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fi fi-rr-print"></i> {t('Export PDF')}
          </button>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{ minWidth: 'auto', padding: '8px 16px' }}
          >
            {t('Close')}
          </button>
        </div>
      </div>
      
      <div 
        className="fullscreen-preview-content" 
        style={{ 
          width: `${794 * displayScale}px`, 
          height: `${1122 * displayScale}px`, 
          overflow: 'hidden', 
          position: 'relative' 
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '794px',
          height: `${editorPagesCount * 1122}px`,
          transform: `scale(${displayScale})`,
          transformOrigin: 'top left'
        }}>
          <div style={{
            transform: `translateY(${-fullscreenPageIndex * 1122}px)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <ResumePreview 
              data={data} 
              layout={layout} 
              language={language} 
              template={template}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
