import { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';
import { generateJobQueryWithProxy, generateJobQueryWithDirectApi } from '../../services/geminiService';

export default function JobFinderModal({ isOpen, onClose, data }) {
  const { t } = useTranslation();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // Prefill from resume data and saved key
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key_jobfinder');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (isOpen && data) {
      if (data.personal?.tagline) {
        setJobTitle(data.personal.tagline);
      }
      if (data.personal?.location) {
        // Strip zip code or country if any, e.g. "Paris, France" -> "Paris"
        const loc = data.personal.location.split(',')[0].trim();
        setLocation(loc);
      }
      if (data.skills?.technical) {
        // Parse skills, take the first 3 to prefill keywords
        const skillsArray = data.skills.technical
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 3);
        setKeywords(skillsArray.join(', '));
      }
    }
    if (!isOpen) {
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, data]);

  const handleSearch = async () => {
    if (isQuotaExceeded && !apiKey.trim()) {
      setError(t('API key is required.'));
      return;
    }

    if (!jobTitle.trim()) {
      setError('Job Title is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let query;
      const params = { jobTitle, location, keywords, remoteOnly };
      
      if (!isQuotaExceeded) {
        try {
          query = await generateJobQueryWithProxy(params);
        } catch (err) {
          if (err.code === 'QUOTA_EXCEEDED') {
            setIsQuotaExceeded(true);
            setError(t('Our free daily quota has been reached. Please enter your own Gemini API key below to continue.'));
            setIsLoading(false);
            return;
          }
          throw err;
        }
      } else {
        localStorage.setItem('gemini_api_key_jobfinder', apiKey.trim());
        query = await generateJobQueryWithDirectApi(apiKey.trim(), params);
      }

      if (query) {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(googleUrl, '_blank', 'noopener,noreferrer');
        onClose();
      }
    } catch (err) {
      setError(err.message || t('Failed to generate search query. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title={`🔍 ${t('Google Smart Job Finder')}`}
      actions={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={isLoading}>{t('Close')}</button>
          <button 
            className="btn-primary" 
            onClick={handleSearch} 
            disabled={!jobTitle.trim() || isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite', color: '#fff' }} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
                </svg>
                <span>{t('Generating...')}</span>
              </>
            ) : (
              <>
                <i className="fi fi-rr-search"></i> {t('Search on Google')}
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
          {t('Google advanced search operators (Dorks) let you target recruiters directly. Fill in the job details, select a strategy, and launch a highly selective search on Google.')}
        </p>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              {t('Job Title')} *
            </label>
            <input 
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Data Analyst"
              disabled={isLoading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              {t('City / Location')}
            </label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Montpellier"
              disabled={isLoading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Keywords */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            {t('Required Keywords')}
          </label>
          <input 
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('e.g. SQL, Power BI, Python')}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Remote Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', userSelect: 'none' }}>
          <input 
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            disabled={isLoading}
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
          />
          <span>{t('Remote / Télétravail only')}</span>
        </label>

        {isQuotaExceeded && (
          <div className="animate-fade-in" style={{ marginTop: '10px' }}>
            <label htmlFor="api-key-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
              {t('Gemini API Key')} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>({t('Get one here')})</a>
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {t('Your key is stored securely in your browser and is never sent to our servers.')}
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-light, rgba(239, 68, 68, 0.1))', borderLeft: '4px solid var(--color-danger, #ef4444)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}
