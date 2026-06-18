import { useState } from 'react';
import { useTranslation } from '../utils/TranslationContext';
import Modal from './ui/Modal';

export default function AIBoldModal({ isOpen, onClose, textData, contextType }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const getPrompt = () => {
    const contextMap = {
      summary: "this professional resume summary",
      experience: "this resume experience bullet point",
      projects: "this resume project description"
    };

    const targetContext = contextMap[contextType] || "this resume text";

    return `Act as an expert technical resume writer.
I have written ${targetContext}, but I need to highlight the most impactful parts to pass ATS parsers and catch a recruiter's eye.

Please review the following text. Wrap the most important keywords, strong action verbs, and quantifiable metrics in markdown bold (**bold text**).
CRITICAL: DO NOT rewrite, add, or remove any words. Keep my exact phrasing and punctuation identical. ONLY add ** markdown characters around the parts that should be stressed.

Text to enhance:
"""
${textData}
"""
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
      title={`✨ ${t('AI Smart Bolding')}`}
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
        {t('Copy this prompt into ChatGPT or your favorite AI. It will analyze your text and automatically wrap the most critical metrics and impact verbs in markdown bold.')}
      </p>
      
      <div className="prompt-box">
        <textarea readOnly value={getPrompt()} />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px' }}>{error}</p>}
    </Modal>
  );
}
