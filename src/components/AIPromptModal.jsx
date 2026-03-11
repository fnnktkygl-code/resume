import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/TranslationContext';

export default function AIPromptModal({ isOpen, onClose, data, language }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus trap & restore
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus the modal after render
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key !== 'Tab') return;
        const focusable = modalRef.current?.querySelectorAll(
          'button, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPrompt = () => {
    const targetLang = language === 'fr' ? 'French' : 'English';
    const cloneData = { ...data };
    delete cloneData.headings;
    
    return `Act as an expert technical recruiter and professional translator. I am building a professional, ATS-friendly resume.
Please translate the following JSON resume data into ${targetLang}. 
Ensure the tone is professional, achievement-oriented, and uses strong action verbs.
Maintain all bullet point structures and do not invent new facts.
Keep the JSON structure exactly identical so I can copy and import it back seamlessly.

Here is the JSON representation of my whole CV:
\`\`\`json
${JSON.stringify(cloneData, null, 2)}
\`\`\`
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPrompt());
      setCopied(true);
      setError('');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: select the textarea text
      setError(t('Could not copy automatically. Please select the text and copy manually (Ctrl+C / Cmd+C).'));
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="modal-content" ref={modalRef} tabIndex={-1}>
        <h2 id="ai-modal-title">✨ {t('AI Translation Assistant')}</h2>
        <p>
          {t('We prioritize your privacy by keeping your data entirely in your browser. To translate or optimize your CV, copy this specialized prompt and paste it into ChatGPT, Claude, or your favorite AI.')}
        </p>
        
        <div className="prompt-box">
          <textarea readOnly value={getPrompt()} aria-label={t('AI prompt text')} />
        </div>

        {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>{t('Close')}</button>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? t('Copied!') : t('Copy Prompt')}
          </button>
        </div>
      </div>
    </div>
  );
}
