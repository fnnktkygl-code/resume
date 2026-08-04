import { computeAtsScore } from '../utils/atsScore';
import { useTranslation } from '../utils/TranslationContext';
import { memo, useState } from 'react';
import { analyzeResumeWithProxy } from '../services/geminiService';
import ATSKeywordsModal from './ui/ATSKeywordsModal';
import { parseMarkdown } from '../utils/formatText';
import { auditResumeData } from '../utils/scientificAuditor';

function AtsScore({ data, dispatch, onTriggerAction }) {
  const { t, language } = useTranslation();
  const { score, tips, isMatchScore } = computeAtsScore(data);
  const scientificNudges = auditResumeData(data, language);
  const [aiTips, setAiTips] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  const [currentTipPage, setCurrentTipPage] = useState(0);
  const tipsPerPage = 3;

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
  const totalTipPages = Math.ceil(displayTips.length / tipsPerPage);
  const currentTips = displayTips.slice(currentTipPage * tipsPerPage, (currentTipPage + 1) * tipsPerPage);

  const removeTip = (tipToRemove) => {
    if (aiTips) {
      const newTips = aiTips.filter(t => t !== tipToRemove);
      setAiTips(newTips.length > 0 ? newTips : null);
      if (currentTipPage >= Math.ceil(newTips.length / tipsPerPage)) {
        setCurrentTipPage(Math.max(0, Math.ceil(newTips.length / tipsPerPage) - 1));
      }
    }
  };

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
          <h3>{isMatchScore ? t('Target Job Match') : t('ATS Readiness')}</h3>
          <p style={{ marginBottom: '8px' }}>{statusText}</p>

          <button 
            onClick={() => onTriggerAction ? onTriggerAction('OPEN_KEYWORD_MATCHER') : setIsKeywordsModalOpen(true)} 
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
      
      {/* Target Job Input Toggle */}
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          <i className={`fi fi-rr-angle-${isJobDescriptionExpanded ? 'up' : 'down'}`}></i>
          {isMatchScore ? t('Edit Target Job') : t('Paste Job Description for Live Match')}
        </button>
        
        {isJobDescriptionExpanded && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              placeholder={t('Paste job description here...')}
              value={data.targetJobDescription || ''}
              onChange={(e) => dispatch && dispatch({ type: 'UPDATE_TARGET_JOB', payload: e.target.value })}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                fontSize: '0.8rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                resize: 'vertical',
                backgroundColor: 'var(--color-bg)'
              }}
            />
          </div>
        )}
      </div>
      
      <ATSKeywordsModal 
        isOpen={isKeywordsModalOpen} 
        onClose={() => setIsKeywordsModalOpen(false)} 
        data={data} 
        dispatch={dispatch}
        onApplied={() => {
          if (aiTips) {
            const keywordTip = aiTips.find(t => t.action === 'OPEN_KEYWORD_MATCHER');
            if (keywordTip) removeTip(keywordTip);
          }
        }}
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

      {/* Real-Time Scientific Nudges (RH Audit) */}
      {scientificNudges.length > 0 && (
        <div style={{ marginTop: '14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔬 {language === 'en' ? 'Scientific HR Nudges' : language === 'es' ? 'Nudges Científicos RH' : 'Nudges Scientifiques RH'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scientificNudges.map((nudge) => (
              <div key={nudge.id} style={{ fontSize: '0.75rem', lineHeight: '1.45', background: 'var(--color-surface)', padding: '8px 10px', borderRadius: '6px', borderLeft: nudge.type === 'warning' ? '3px solid #E53E3E' : '3px solid var(--color-accent)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', lineHeight: '1' }}>{nudge.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-text)', marginBottom: '2px' }}>{nudge.title}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{nudge.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayTips.length > 0 && (
        <div className="ats-tips-container" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text)' }}>
              {t('Recommendations')} ({displayTips.length})
            </span>
            {totalTipPages > 1 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => setCurrentTipPage(prev => Math.max(0, prev - 1))}
                  disabled={currentTipPage === 0}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 8px', cursor: currentTipPage === 0 ? 'not-allowed' : 'pointer', opacity: currentTipPage === 0 ? 0.5 : 1
                  }}
                >
                  <i className="fi fi-rr-angle-left" style={{ fontSize: '10px' }}></i>
                </button>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {currentTipPage + 1} / {totalTipPages}
                </span>
                <button 
                  onClick={() => setCurrentTipPage(prev => Math.min(totalTipPages - 1, prev + 1))}
                  disabled={currentTipPage === totalTipPages - 1}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 8px', cursor: currentTipPage === totalTipPages - 1 ? 'not-allowed' : 'pointer', opacity: currentTipPage === totalTipPages - 1 ? 0.5 : 1
                  }}
                >
                  <i className="fi fi-rr-angle-right" style={{ fontSize: '10px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className="ats-tips" role="list" aria-label={t('ATS improvement tips')} style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '140px' }}>
            {currentTips.map((tip, i) => {
              if (aiTips) {
                return (
                  <TipCard 
                    key={i}
                    tip={tip}
                    data={data}
                    dispatch={dispatch}
                    onRemove={() => removeTip(tip)}
                    onTriggerAction={onTriggerAction}
                    setIsKeywordsModalOpen={setIsKeywordsModalOpen}
                    t={t}
                  />
                );
              } else {
                // Standard tips are strings or structured objects
                if (typeof tip === 'object' && tip?.type === 'missing_keywords') {
                  return (
                    <div key={i} className="ats-tip-item animate-fade-in" role="listitem" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>
                        <strong>{t('Missing keywords:')}</strong> {tip.keywords.join(', ')}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsKeywordsModalOpen(true)}
                        style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--color-accent-contrast, #fff)', backgroundColor: 'var(--color-accent, #1B6B3A)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <i className="fi fi-rr-search-alt"></i> {t('Add missing keywords')}
                      </button>
                    </div>
                  );
                }
                return (
                  <div key={i} className="ats-tip-item animate-fade-in" role="listitem" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                      {typeof tip === 'string' ? t(tip) : (tip?.title || tip?.description || '')}
                    </div>
                    <button 
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--color-accent-contrast, #fff)', backgroundColor: 'var(--color-accent, #1B6B3A)', border: 'none', borderRadius: '6px', cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isAnalyzing ? 0.7 : 1 }}
                    >
                      <i className="fi fi-rr-magic-wand"></i> {isAnalyzing ? t('Generating...') : t('✨ Generate Concrete AI Example')}
                    </button>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TipCard({ tip, data, dispatch, onRemove, onTriggerAction, setIsKeywordsModalOpen, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(tip.suggestedText || '');

  const handleApply = () => {
    if (!dispatch) return;
    const textToInsert = editedText.trim();
    if (!textToInsert) return;

    if (tip.targetSection === 'summary') {
      dispatch({ type: 'UPDATE_SUMMARY', payload: textToInsert });
    } else if (tip.targetSection === 'skills') {
      const currentSkills = data?.skills?.technical || '';
      const newSkills = currentSkills ? `${currentSkills}, ${textToInsert}` : textToInsert;
      dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: newSkills } });
    } else if (tip.targetSection === 'experience' && data?.experience) {
      const idx = typeof tip.targetIndex === 'number' ? tip.targetIndex : 0;
      if (data.experience[idx]) {
        const updatedExp = [...data.experience];
        const bullets = [...(updatedExp[idx].bullets || []), textToInsert];
        updatedExp[idx] = { ...updatedExp[idx], bullets };
        dispatch({ type: 'UPDATE_EXPERIENCE', payload: updatedExp });
      }
    } else if (tip.targetSection === 'projects' && data?.projects) {
      const idx = typeof tip.targetIndex === 'number' ? tip.targetIndex : 0;
      if (data.projects[idx]) {
        const updatedProj = [...data.projects];
        const highlights = [...(updatedProj[idx].highlights || []), textToInsert];
        updatedProj[idx] = { ...updatedProj[idx], highlights };
        dispatch({ type: 'UPDATE_PROJECTS', payload: updatedProj });
      }
    } else {
      const currentSkills = data?.skills?.technical || '';
      const newSkills = currentSkills ? `${currentSkills}, ${textToInsert}` : textToInsert;
      dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: newSkills } });
    }
    onRemove();
  };

  return (
    <div className="ats-tip-item animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--color-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <div style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '13px' }}>{tip.title}</div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>{tip.description}</div>
      
      {tip.suggestedText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fi fi-rr-magic-wand"></i> {t('Suggested Text (Editable):')}
          </div>

          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px 10px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--color-accent)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                resize: 'vertical'
              }}
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--color-success-light, rgba(34, 197, 94, 0.1))',
                borderLeft: '4px solid var(--color-success, #22c55e)',
                borderRadius: '4px',
                fontSize: '12.5px',
                color: 'var(--color-text)',
                lineHeight: '1.5',
                cursor: 'pointer',
                wordBreak: 'break-word'
              }}
              title={t('Click to edit')}
            >
              {parseMarkdown(editedText)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
        {tip.suggestedText ? (
          <>
            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: '600',
                color: 'var(--color-accent-contrast, #fff)',
                backgroundColor: 'var(--color-accent, #1B6B3A)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fi fi-rr-check"></i> {t('Accept & Apply to CV')}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: '500',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <i className="fi fi-rr-edit"></i> {isEditing ? t('Preview') : t('Edit')}
            </button>
          </>
        ) : tip.action ? (
          <button 
            type="button"
            onClick={() => {
              if (tip.action === 'OPEN_KEYWORD_MATCHER') {
                setIsKeywordsModalOpen(true);
              } else if (onTriggerAction) {
                onTriggerAction(tip.action, tip.targetIndex, onRemove);
              }
            }}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '600',
              color: 'var(--color-accent-contrast)',
              backgroundColor: 'var(--color-accent)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fi fi-rr-magic-wand"></i> {t('Take Action')}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '11.5px'
          }}
        >
          {t('Skip')}
        </button>
      </div>
    </div>
  );
}

export default memo(AtsScore);
