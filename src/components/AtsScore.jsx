import { computeAtsScore } from '../utils/atsScore';
import { useTranslation } from '../utils/TranslationContext';
import { memo, useState } from 'react';
import { analyzeResumeWithProxy } from '../services/geminiService';
import ATSKeywordsModal from './ui/ATSKeywordsModal';

function AtsScore({ data }) {
  const { t, language } = useTranslation();
  const { score, tips } = computeAtsScore(data);
  const [aiTips, setAiTips] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);

  const checklist = [
    { label: t('Personal Info'), completed: !!(data.personal.name || data.personal.email) },
    { label: t('Summary'), completed: !!(data.summary && data.summary.trim().length > 10) },
    { label: t('Experience'), completed: data.experience.some(e => e.company || e.title) },
    { label: t('Education'), completed: data.education.some(e => e.institution || e.degree) },
    { label: t('Skills'), completed: !!(data.skills.technical && data.skills.technical.trim()) }
  ];

  const percent = Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = 'var(--color-accent)';

  const statusText = score >= 80 ? t('Excellent — ready to apply') :
    score >= 50 ? t('Good — a few improvements left') :
    t('Needs work — follow the tips below');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const newTips = await analyzeResumeWithProxy(data, language);
      setAiTips(newTips);
    } catch (err) {
      setError(t('Error analyzing resume. Please try again.'));
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayTips = aiTips || tips;

  return (
    <div className="ats-widget">
      <div className="ats-header" style={{ alignItems: 'flex-start' }}>
        <div className="ats-ring-container" style={{ marginTop: '4px' }}>
          <svg className="ats-ring-svg" viewBox="0 0 56 56" aria-hidden="true">
            <circle className="ats-ring-bg" cx="28" cy="28" r={radius} />
            <circle
              className="ats-ring-progress"
              cx="28" cy="28" r={radius}
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="ats-score-text" style={{ color }}>{score}</div>
        </div>
        <div className="ats-info" style={{ flex: 1 }}>
          <h3>{t('ATS Readiness')}</h3>
          <p style={{ marginBottom: '8px' }}>{statusText}</p>
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            title={t('Get targeted AI recommendations')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              borderRadius: '6px',
              cursor: isAnalyzing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              opacity: isAnalyzing ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if(!isAnalyzing) {
                e.currentTarget.style.opacity = '0.85';
              }
            }}
            onMouseOut={(e) => {
              if(!isAnalyzing) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isAnalyzing ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
                </svg>
                {t('Analyzing...')}
                <style>{`
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {t('AI Analysis')}
              </>
            )}
          </button>
          
          <button 
            onClick={() => setIsKeywordsModalOpen(true)} 
            title={t('Compare resume with job description keywords')}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <i className="fi fi-rr-search-alt"></i> {t('Keyword Matcher')}
          </button>

          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '6px' }}>{error}</div>}
        </div>
      </div>
      
      <ATSKeywordsModal 
        isOpen={isKeywordsModalOpen} 
        onClose={() => setIsKeywordsModalOpen(false)} 
        data={data} 
      />
 
      {/* Completeness Checklist */}
      <div className="ats-checklist" style={{ marginTop: '14px', borderTop: '1px dashed var(--color-border)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
            {t('Profile Completion')}
          </span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-accent)' }}>
            {percent}%
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
          {checklist.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '11px', 
              color: item.completed ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: item.completed ? '600' : '400'
            }}>
              <span style={{ 
                color: item.completed ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: '12px',
                lineHeight: '1'
              }}>
                {item.completed ? '✓' : '○'}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {displayTips.length > 0 && (
        <div className="ats-tips" role="list" aria-label={t('ATS improvement tips')}>
          {displayTips.map((tip, i) => (
            <div key={i} className="ats-tip-item" role="listitem">
              {aiTips ? (
                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ) : (
                t(tip)
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(AtsScore);
