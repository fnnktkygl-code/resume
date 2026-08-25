import { computeAtsScore } from '../utils/atsScore';
import { useTranslation } from '../utils/TranslationContext';
import { memo, useState } from 'react';
import { analyzeResumeWithProxy, matchKeywordsWithProxy } from '../services/geminiService';
import { parseMarkdown } from '../utils/formatText';
import { auditResumeData } from '../utils/scientificAuditor';

function AtsScore({ data, dispatch, onTriggerAction }) {
  const { t, language } = useTranslation();
  const { score: baseAtsScore, tips: baseTips } = computeAtsScore(data);
  const scientificNudges = auditResumeData(data, language);

  const [jobDescription, setJobDescription] = useState(data?.targetJobDescription || '');
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(data?.targetJobAnalysis || null);
  const [aiTips, setAiTips] = useState(null);
  const [error, setError] = useState(null);
  const [addedKeywords, setAddedKeywords] = useState([]);

  // Profile completeness checklist
  const checklist = [
    { label: t('Personal Info'), completed: !!(data.personal?.name || data.personal?.email) },
    { label: t('Summary'), completed: !!(data.summary && data.summary.trim().length > 10) },
    { label: t('Experience'), completed: data.experience?.some(e => e.company || e.title) },
    { label: t('Education'), completed: data.education?.some(e => e.institution || e.degree) },
    { label: t('Skills'), completed: !!(data.skills?.technical && data.skills.technical.trim()) }
  ];

  const percent = Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100);

  // Active score: match score if analyzed, otherwise base ATS readiness
  const isMatchActive = !!(matchResult && matchResult.matchScore !== undefined);
  const activeScore = isMatchActive ? matchResult.matchScore : baseAtsScore;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (activeScore / 100) * circumference;
  const scoreColor = activeScore >= 80 ? 'var(--color-accent, #2D5A43)' :
                     activeScore >= 50 ? 'var(--color-warning, #D97706)' :
                     'var(--color-danger, #DC2626)';

  const statusText = isMatchActive 
    ? (activeScore >= 80 ? t('Excellente adéquation avec le poste') : activeScore >= 50 ? t('Bon alignement — quelques ajustements recommandés') : t('Alignement partiel — intégrez les mots-clés ci-dessous'))
    : (activeScore >= 80 ? t('Excellent — prêt à postuler') : activeScore >= 50 ? t('Bon — quelques améliorations possibles') : t('À perfectionner — suivez les recommandations'));

  // Unified single action: Analyze the Job Offer against Resume
  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim()) {
      setError(t('Veuillez coller le texte d\'une offre d\'emploi avant de lancer l\'analyse.'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      if (dispatch) {
        dispatch({ type: 'UPDATE_TARGET_JOB', payload: jobDescription });
      }

      // 1. Run Keyword & ATS Match
      const analysis = await matchKeywordsWithProxy(data, jobDescription, language);
      setMatchResult(analysis);
      if (dispatch && analysis) {
        dispatch({ type: 'UPDATE_TARGET_JOB_ANALYSIS', payload: analysis });
      }

      // 2. Run actionable Harvard XYZ recommendations tailored to this job
      const recommendations = await analyzeResumeWithProxy(data, language, jobDescription);
      if (recommendations && recommendations.length > 0) {
        setAiTips(recommendations);
      }
    } catch (err) {
      console.error('ATS Match error:', err);
      setError(t('Erreur lors de l\'analyse de l\'offre. Veuillez réessayer.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add missing keywords directly to Skills in 1-click
  const handleAddKeywordToSkills = (keyword) => {
    if (!dispatch || !keyword) return;
    const currentTech = data.skills?.technical || '';
    const currentList = currentTech.split(',').map(s => s.trim()).filter(Boolean);
    if (!currentList.includes(keyword)) {
      const updated = currentList.length > 0 ? `${currentTech}, ${keyword}` : keyword;
      dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: updated } });
    }
    setAddedKeywords(prev => [...prev, keyword]);
  };

  const handleAddAllMissingKeywords = () => {
    if (!dispatch || !matchResult?.missingKeywords) return;
    const currentTech = data.skills?.technical || '';
    const currentList = currentTech.split(',').map(s => s.trim()).filter(Boolean);
    const toAdd = matchResult.missingKeywords.filter(k => !currentList.includes(k));
    if (toAdd.length > 0) {
      const updated = [...currentList, ...toAdd].join(', ');
      dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: updated } });
      setAddedKeywords(prev => [...prev, ...toAdd]);
    }
  };

  return (
    <div className="ats-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Top Score Card (Japandi Washi / Apple Clean) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
          <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="30" cy="30" r={radius}
              fill="none"
              stroke="var(--color-surface-alt, #ECEAE4)"
              strokeWidth="5"
            />
            <circle
              cx="30" cy="30" r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: '800',
            color: scoreColor,
            fontFamily: 'inherit'
          }}>
            {activeScore}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
            {isMatchActive ? t('Target Job Match') : t('ATS Readiness')}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginTop: '2px', lineHeight: '1.3' }}>
            {statusText}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {isMatchActive ? t('Basé sur les critères réels de l\'offre collée') : t('Score de structure & d\'optimisation ATS')}
          </div>
        </div>
      </div>

      {/* 2. Job Description Section (Simple, High-Contrast & Obvious Action) */}
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>📋</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)' }}>
              {t('Paste Job Description for Live Match')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isJobDescriptionExpanded ? t('Réduire') : t('Afficher')}</span>
            <i className={`fi fi-rr-angle-${isJobDescriptionExpanded ? 'up' : 'down'}`} style={{ fontSize: '10px' }}></i>
          </button>
        </div>

        {isJobDescriptionExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                const val = e.target.value;
                setJobDescription(val);
                if (dispatch) dispatch({ type: 'UPDATE_TARGET_JOB', payload: val });
              }}
              placeholder={t('Paste job description here...')}
              rows={4}
              style={{
                width: '100%',
                minHeight: '90px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '12.5px',
                lineHeight: '1.5',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />

            {error && (
              <div style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: '500' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyzeMatch}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                height: '40px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                opacity: (isAnalyzing || !jobDescription.trim()) ? 0.65 : 1,
                cursor: (isAnalyzing || !jobDescription.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {isAnalyzing ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>{t('Analyse de l\'offre en cours...')}</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>{isMatchActive ? t('Réanalyser la correspondance (IA)') : t('Analyser la correspondance avec mon CV')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. Missing Keywords (Interactive, 1-Click Injection) */}
      {matchResult?.missingKeywords && matchResult.missingKeywords.length > 0 && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-danger, #DC2626)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠️</span>
              <span>{t('Mots-clés manquants détectés')} ({matchResult.missingKeywords.length})</span>
            </div>
            <button
              type="button"
              onClick={handleAddAllMissingKeywords}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t('Tout ajouter au CV')}
            </button>
          </div>

          <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {t('Cliquez sur un mot-clé pour l\'ajouter instantanément à vos compétences techniques :')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchResult.missingKeywords.map((kw, i) => {
              const isAdded = addedKeywords.includes(kw);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddKeywordToSkills(kw)}
                  disabled={isAdded}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: isAdded ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: isAdded ? 'var(--color-accent-light, rgba(45, 90, 67, 0.1))' : 'var(--color-surface-alt)',
                    color: isAdded ? 'var(--color-accent)' : 'var(--color-text)',
                    cursor: isAdded ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{isAdded ? '✓' : '+'}</span>
                  <span>{kw}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Actionable Harvard XYZ Recommendations */}
      {aiTips && aiTips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✨ {t('Recommandations personnalisées')} ({aiTips.length})
          </div>

          {aiTips.map((tip, idx) => (
            <TipCard
              key={idx}
              tip={tip}
              data={data}
              dispatch={dispatch}
              onRemove={() => setAiTips(prev => prev.filter((_, i) => i !== idx))}
              t={t}
            />
          ))}
        </div>
      )}

      {/* 5. Base Recommendations & Checklist (When No AI Job Match Yet) */}
      {!aiTips && (
        <>
          {/* Profile Completion Checklist */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                {t('Profile Completion')}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-accent)' }}>
                {percent}%
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  color: item.completed ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: item.completed ? '600' : '400'
                }}>
                  <span style={{ color: item.completed ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    {item.completed ? '✓' : '○'}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific HR Nudge */}
          {scientificNudges.length > 0 && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface)',
              borderLeft: '4px solid var(--color-accent)',
              borderTop: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '16px' }}>{scientificNudges[0].icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {scientificNudges[0].title}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                  {scientificNudges[0].message}
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

function TipCard({ tip, data, dispatch, onRemove, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(tip.suggestedText || '');

  const handleApply = () => {
    if (!dispatch) return;
    const textToInsert = (editedText || tip.suggestedText || '').trim();
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
    } else {
      const currentSkills = data?.skills?.technical || '';
      const newSkills = currentSkills ? `${currentSkills}, ${textToInsert}` : textToInsert;
      dispatch({ type: 'UPDATE_SKILLS', payload: { ...data.skills, technical: newSkills } });
    }
    onRemove();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      backgroundColor: 'var(--color-surface)',
      padding: '14px',
      borderRadius: '10px',
      border: '1px solid var(--color-border)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '13px' }}>
        {tip.title}
      </div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>
        {tip.description}
      </div>

      {tip.suggestedText && (
        <div style={{ marginTop: '4px' }}>
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--color-accent)',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-surface-alt)',
                borderLeft: '3px solid var(--color-accent)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--color-text)',
                lineHeight: '1.4',
                cursor: 'pointer'
              }}
              title={t('Cliquer pour modifier')}
            >
              {parseMarkdown(editedText)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
        <button
          type="button"
          onClick={handleApply}
          className="btn-primary"
          style={{
            padding: '6px 12px',
            fontSize: '11.5px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>✓</span>
          <span>{t('Appliquer au CV')}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          style={{
            padding: '6px 10px',
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '11.5px',
            cursor: 'pointer'
          }}
        >
          {t('Ignorer')}
        </button>
      </div>
    </div>
  );
}

export default memo(AtsScore);

