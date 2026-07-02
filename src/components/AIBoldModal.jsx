import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/TranslationContext';
import Modal from './ui/Modal';
import { enhanceWithProxy, translateTextWithProxy, rewriteWithProxy } from '../services/geminiService';
import { parseMarkdown } from '../utils/formatText';

export default function AIBoldModal({ isOpen, onClose, textData, contextType, initialTab, onUpdate }) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab || 'bold'); // 'bold', 'rewrite', or 'translate'
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [targetLang, setTargetLang] = useState(language === 'fr' ? 'en' : 'fr');
  const [proposedText, setProposedText] = useState('');

  useEffect(() => {
    if (isOpen && textData) {
      const tab = initialTab || 'bold';
      setActiveTab(tab);
      if (tab === 'bold') {
        handleBold();
      } else if (tab === 'rewrite') {
        handleRewrite();
      } else {
        setProposedText('');
      }
    }
  }, [isOpen, textData, contextType, initialTab]);

  const handleBold = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await enhanceWithProxy(textData, contextType);
      setProposedText(result);
    } catch (err) {
      setError(err.message || t('An error occurred during bolding.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await rewriteWithProxy(textData, contextType, language);
      setProposedText(result);
    } catch (err) {
      setError(err.message || t('An error occurred during reformulation.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await translateTextWithProxy(textData, targetLang);
      setProposedText(result);
    } catch (err) {
      setError(err.message || t('An error occurred during translation.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (onUpdate && proposedText) {
      onUpdate(proposedText);
    }
    onClose();
  };

  const languagesOptions = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' }
  ];

  const modalTitle = activeTab === 'bold'
    ? `<b>B</b> ${t('Mise en gras IA')}`
    : activeTab === 'rewrite'
    ? `✨ ${t('Reformulation IA')}`
    : `🌎 ${t('Traduire')}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'bold' ? t('Mise en gras IA') : activeTab === 'rewrite' ? t('Reformulation IA') : t('AI Assistant')}
      actions={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={isGenerating}>{t('Cancel')}</button>
          <button className="btn-primary" onClick={handleApply} disabled={isGenerating || !proposedText}>
            {t('Apply Changes')}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          gap: '12px',
          marginBottom: '4px'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('bold');
              handleBold();
            }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'bold' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'bold' ? '#2563eb' : 'var(--color-text-secondary)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <b>B</b> {t('Mise en gras')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('rewrite');
              handleRewrite();
            }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'rewrite' ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === 'rewrite' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✨ {t('Reformuler')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('translate');
              setProposedText('');
            }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'translate' ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === 'translate' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🌎 {t('Translate')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'translate' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--color-surface-alt)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)'
          }}>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              {t('Target Language')} :
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '12.5px',
                fontWeight: '550',
                outline: 'none',
                minWidth: '120px'
              }}
            >
              {languagesOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary"
              onClick={handleTranslate}
              disabled={isGenerating}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              {t('Translate')}
            </button>
          </div>
        )}

        {isGenerating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="ai-shimmer-loading" style={{ height: '16px', width: '30%', borderRadius: '4px', backgroundColor: 'var(--color-surface-alt)' }} />
              <div className="ai-shimmer-loading" style={{ height: '60px', width: '100%', borderRadius: '6px', backgroundColor: 'var(--color-surface-alt)' }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              {activeTab === 'bold' ? t('Applying intelligent bolding...') : activeTab === 'rewrite' ? t('Reformulating text...') : t('Translating...')}
            </p>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--color-danger)', padding: '20px 0', textAlign: 'center' }}>
            <p>{error}</p>
            {activeTab === 'bold' ? (
              <button className="btn-secondary" onClick={handleBold} style={{ marginTop: '8px' }}>Re-try</button>
            ) : activeTab === 'rewrite' ? (
              <button className="btn-secondary" onClick={handleRewrite} style={{ marginTop: '8px' }}>Re-try</button>
            ) : (
              <button className="btn-secondary" onClick={handleTranslate} style={{ marginTop: '8px' }}>Re-try</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Before / After Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  {t('Original Text')}
                </label>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--color-surface-alt)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {parseMarkdown(textData)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-accent)' }}>
                  {t('Proposed Text')}
                </label>
                <textarea 
                  value={proposedText}
                  onChange={(e) => setProposedText(e.target.value)}
                  placeholder={activeTab === 'translate' ? t('Choose target language and translate...') : ''}
                  style={{ 
                    width: '100%', 
                    minHeight: '120px', 
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    outline: 'none'
                  }}
                />
              </div>

              {proposedText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-success)' }}>
                    {t('Preview')}
                  </label>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    minHeight: '40px'
                  }}>
                    {parseMarkdown(proposedText)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
