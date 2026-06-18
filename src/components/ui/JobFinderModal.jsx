import { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import Modal from './Modal';

export default function JobFinderModal({ isOpen, onClose, data }) {
  const { t } = useTranslation();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Prefill from resume data
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
  }, [isOpen, data]);

  // Helper to build the Google search query
  const buildQuery = () => {
    if (!jobTitle.trim()) return '';

    const job = jobTitle.includes(' ') ? `"${jobTitle.trim()}"` : jobTitle.trim();
    const loc = location.trim() ? (location.includes(' ') ? `"${location.trim()}"` : location.trim()) : '';
    
    let queryParts = [job];
    if (loc) {
      queryParts.push(loc);
    }

    if (keywords.trim()) {
      const kwList = keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean)
        .map(k => (k.includes(' ') ? `"${k}"` : k));
      if (kwList.length > 0) {
        queryParts.push(...kwList);
      }
    }

    let query = queryParts.join(' ');

    if (remoteOnly) {
      query += ` AND ("remote" OR "télétravail" OR "teletrabajo")`;
    }

    // Direct job postings filter: ATS platforms + direct job boards
    query += ` AND (site:lever.co OR site:greenhouse.io OR site:workable.com OR site:linkedin.com/jobs/view OR site:welcometothejungle.com)`;

    return query;
  };

  const handleSearch = () => {
    const query = buildQuery();
    if (!query) return;
    
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🔍 ${t('Google Smart Job Finder')}`}
      actions={
        <>
          <button className="btn-secondary" onClick={onClose}>{t('Close')}</button>
          <button 
            className="btn-primary" 
            onClick={handleSearch} 
            disabled={!jobTitle.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fi fi-rr-search"></i> {t('Search on Google')}
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
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
          />
          <span>{t('Remote / Télétravail only')}</span>
        </label>
      </div>
    </Modal>
  );
}
