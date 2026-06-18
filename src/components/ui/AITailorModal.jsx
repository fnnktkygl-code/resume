import { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';
import { tailorResumeWithProxy, tailorResumeWithDirectApi } from '../../services/geminiService';

export default function AITailorModal({ isOpen, onClose, data, onTailorSuccess, language }) {
  const { t } = useTranslation();
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key_tailor');
    if (savedKey) {
      setApiKey(savedKey);
      // If they already have a key saved, we might as well just use it to save our own server costs,
      // but to stick to the requirement "use my key by default until quota", we don't automatically skip to direct API.
    }
  }, []);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError(t('Please paste a job description.'));
      return;
    }
    
    // Only require API key if our server quota is exceeded
    if (isQuotaExceeded && !apiKey.trim()) {
      setError(t('API key is required.'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let tailoredData;
      
      if (!isQuotaExceeded) {
        try {
          // Try Vercel backend proxy first (uses your master key)
          tailoredData = await tailorResumeWithProxy(data, jobDescription, language);
        } catch (err) {
          if (err.code === 'QUOTA_EXCEEDED') {
            setIsQuotaExceeded(true);
            setError(t('Our free daily quota has been reached. Please enter your own Gemini API key below to continue.'));
            setIsLoading(false);
            return; // Stop execution, let user enter key
          }
          throw err; // Re-throw if it's another error
        }
      } else {
        // Fallback to direct API with user's key
        localStorage.setItem('gemini_api_key_tailor', apiKey.trim());
        tailoredData = await tailorResumeWithDirectApi(
          apiKey.trim(),
          data,
          jobDescription,
          language
        );
      }
      
      onTailorSuccess(tailoredData);
      onClose();
      setJobDescription('');
    } catch (err) {
      setError(err.message || t('Failed to generate resume. Please check your API key and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title={`✨ ${t('Tailor to Job Description')}`}
      ariaLabelledby="ai-tailor-modal-title"
      actions={
        <>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {t('Cancel')}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleTailor}
            disabled={isLoading}
          >
            {isLoading ? t('Generating...') : t('Generate Tailored CV')}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t('Paste the job description below. We will use Google Gemini to rewrite your experiences and highlight the most relevant skills.')}
        </p>

        <div>
          <label htmlFor="jd-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            {t('Job Description')}
          </label>
          <textarea
            id="jd-input"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
            placeholder={t('Paste the full job description here...')}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {isQuotaExceeded && (
          <div className="animate-fade-in">
            <label htmlFor="api-key-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
              {t('Gemini API Key')} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>({t('Get one here')})</a>
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              placeholder={t('AIzaSy...')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
            />
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {t('Your key is stored securely in your browser and is never sent to our servers.')}
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-light, rgba(239, 68, 68, 0.1))', borderLeft: '4px solid var(--color-danger)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
