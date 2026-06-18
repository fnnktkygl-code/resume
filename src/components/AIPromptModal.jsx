import { useState } from 'react';
import { useTranslation } from '../utils/TranslationContext';
import Modal from './ui/Modal';

export default function AIPromptModal({ isOpen, onClose, data, language }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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
      setError(t('Could not copy automatically. Please select the text and copy manually (Ctrl+C / Cmd+C).'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`✨ ${t('AI Translation Assistant')}`}
      ariaLabelledby="ai-modal-title"
      actions={
        <>
          <button className="btn-secondary" onClick={onClose}>{t('Close')}</button>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? t('Copied!') : t('Copy Prompt')}
          </button>
        </>
      }
    >
      <p>
        {t('We prioritize your privacy by keeping your data entirely in your browser. To translate or optimize your CV, copy this specialized prompt and paste it into ChatGPT or your favorite AI.')}
      </p>
      
      <div className="prompt-box">
        <textarea readOnly value={getPrompt()} aria-label={t('AI prompt text')} />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
    </Modal>
  );
}
