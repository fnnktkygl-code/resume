import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateInterviewPrepWithProxy, evaluateMockAnswerWithProxy } from '../../services/geminiService';

export default function InterviewPrepModal({
  isOpen,
  onClose,
  application,
  resumeData
}) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('star'); // 'star' | 'tech' | 'bridge' | 'reverse' | 'mock'
  const [isLoading, setIsLoading] = useState(false);
  const [prepPack, setPrepPack] = useState(null);

  // Mock Simulator State
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [userMockAnswer, setUserMockAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [mockFeedback, setMockFeedback] = useState(null);

  useEffect(() => {
    if (isOpen && application) {
      loadPrepPack();
    }
  }, [isOpen, application]);

  const loadPrepPack = async () => {
    setIsLoading(true);
    setMockFeedback(null);
    try {
      const res = await generateInterviewPrepWithProxy({
        resumeData,
        jobDescription: application.jobDescription || application.snippet || application.jobTitle,
        companyName: application.company || 'Entreprise Cible',
        jobTitle: application.jobTitle || 'Poste Cible',
        language
      });
      setPrepPack(res);
      if (res?.behavioralQuestions?.[0]?.question) {
        setSelectedQuestion(res.behavioralQuestions[0].question);
      }
    } catch (err) {
      console.error('Interview prep generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateMock = async () => {
    if (!userMockAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateMockAnswerWithProxy({
        practiceQuestion: selectedQuestion,
        userAnswer: userMockAnswer,
        companyName: application.company,
        jobTitle: application.jobTitle,
        language
      });
      setMockFeedback(res);
    } catch (err) {
      console.error('Mock evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎤</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {t("Préparation d'Entretien IA (Méthode STAR)")}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                🏢 {application.company} • 🎯 {application.jobTitle}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Strategic Summary */}
        {prepPack?.summary && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(99, 102, 241, 0.06)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '12.5px',
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <span>💡</span>
            <span>{prepPack.summary}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--color-border)', padding: '8px 16px', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('star')}
            className={`career-tracker-pill-btn ${activeTab === 'star' ? 'active' : ''}`}
          >
            🎯 {t("Questions Comportementales (STAR)")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`career-tracker-pill-btn ${activeTab === 'tech' ? 'active' : ''}`}
          >
            💻 {t("Questions Techniques & Métier")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bridge')}
            className={`career-tracker-pill-btn ${activeTab === 'bridge' ? 'active' : ''}`}
          >
            🌉 {t("Réponses Passerelles (Compétences manquantes)")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reverse')}
            className={`career-tracker-pill-btn ${activeTab === 'reverse' ? 'active' : ''}`}
          >
            ❓ {t("Questions à poser au recruteur")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mock')}
            className={`career-tracker-pill-btn ${activeTab === 'mock' ? 'active' : ''}`}
            style={{ fontWeight: 700 }}
          >
            🎙️ {t("Simulateur d'Entretien en Direct")}
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fi fi-rr-spinner cl-spin" style={{ fontSize: '32px', color: 'var(--color-accent)' }}></i>
              <p style={{ marginTop: '12px', fontWeight: 600, fontSize: '14px' }}>
                {t("Génération du pack d'entretien STAR...")}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {t("Cartographie de vos accomplissements et réponses passerelles en cours.")}
              </p>
            </div>
          ) : (
            <>
              {/* STAR Tab */}
              {activeTab === 'star' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {prepPack?.behavioralQuestions?.map((q, idx) => (
                    <div key={q.id || idx} style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                          ❓ {q.question}
                        </h4>
                        {q.mappedCvExperience && (
                          <span style={{
                            fontSize: '11px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--color-accent)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            📌 {q.mappedCvExperience}
                          </span>
                        )}
                      </div>

                      {q.starAnswer && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '8px',
                          background: 'var(--color-bg)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          fontSize: '12px'
                        }}>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>S ({t("Situation")}) : </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{q.starAnswer.situation}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#3b82f6' }}>T ({t("Tâche")}) : </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{q.starAnswer.task}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#10b981' }}>A ({t("Action")}) : </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{q.starAnswer.action}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>R ({t("Résultat")}) : </span>
                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{q.starAnswer.result}</span>
                          </div>
                        </div>
                      )}

                      {q.proTip && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                          💡 <b>{t("Conseil Pro")} :</b> {q.proTip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Tab */}
              {activeTab === 'tech' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {prepPack?.technicalQuestions?.map((q, idx) => (
                    <div key={q.id || idx} style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
                        💻 {q.question}
                      </h4>

                      {q.keyConceptsToMention && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            {t("Concepts clés à mentionner")} :
                          </span>
                          {q.keyConceptsToMention.map((c, i) => (
                            <span key={i} style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              fontWeight: 500
                            }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {q.suggestedResponseOutline && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '10px', borderRadius: '6px' }}>
                          <b>📐 {t("Plan de réponse suggéré")} :</b> {q.suggestedResponseOutline}
                        </div>
                      )}

                      {q.trapToAvoid && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.06)', padding: '8px 10px', borderRadius: '6px' }}>
                          ⚠️ <b>{t("Piège à éviter")} :</b> {q.trapToAvoid}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bridge Answers Tab */}
              {activeTab === 'bridge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '12.5px',
                    color: '#059669'
                  }}>
                    🛡️ <b>Règle de Vérité Radicale :</b> Ne mentez jamais en entretien sur un outil non maîtrisé. Ces réponses passerelles valorisent votre franchise, votre socle technique connexe et votre vélocité d'apprentissage.
                  </div>

                  {prepPack?.bridgeAnswers?.map((b, idx) => (
                    <div key={b.id || idx} style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--color-danger)',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}>
                          ❌ {t("Compétence manquante")} : {b.missingSkill}
                        </span>
                        <span>➡️</span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}>
                          ✓ {t("Compétence passerelle maîtrisée")} : {b.adjacentSkill}
                        </span>
                      </div>

                      <div style={{
                        padding: '12px',
                        background: 'var(--color-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        lineHeight: '1.5',
                        color: 'var(--color-text)'
                      }}>
                        💬 {b.scriptedBridgeAnswer}
                      </div>

                      {b.rampUpPlan && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                          🚀 <b>{t("Plan de montée en compétence")} :</b> {b.rampUpPlan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reverse Questions Tab */}
              {activeTab === 'reverse' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {prepPack?.reverseQuestionsToAsk?.map((r, idx) => (
                    <div key={r.id || idx} style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text)' }}>
                        ❓ « {r.question} »
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-accent)' }}>
                        🎯 <b>{t("Objectif de la question")} :</b> {r.objective}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Mock Simulator Tab */}
              {activeTab === 'mock' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      🎙️ {language === 'fr' ? 'Choisissez la question à pratiquer :' : 'Select practice question:'}
                    </label>
                    <select
                      value={selectedQuestion}
                      onChange={(e) => setSelectedQuestion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        fontSize: '13px'
                      }}
                    >
                      {prepPack?.behavioralQuestions?.map((q, i) => (
                        <option key={`b-${i}`} value={q.question}>🎯 {q.question}</option>
                      ))}
                      {prepPack?.technicalQuestions?.map((q, i) => (
                        <option key={`t-${i}`} value={q.question}>💻 {q.question}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      ✍️ {t("Votre réponse orale ou écrite :")}
                    </label>
                    <textarea
                      rows={5}
                      placeholder={language === 'fr' 
                        ? 'Tapez votre réponse comme si vous parliez au recruteur en structurant Situation, Tâche, Action et Résultat chiffré...' 
                        : 'Type your answer as if speaking to the hiring manager, structuring Situation, Task, Action, and Metric Result...'}
                      value={userMockAnswer}
                      onChange={(e) => setUserMockAnswer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        fontSize: '13px',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleEvaluateMock}
                    disabled={isEvaluating || !userMockAnswer.trim()}
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isEvaluating ? (
                      <>
                        <i className="fi fi-rr-spinner cl-spin"></i>
                        <span>{t("Évaluation en cours...")}</span>
                      </>
                    ) : (
                      <>
                        <span>🎯</span>
                        <span>{t("Évaluer ma réponse")}</span>
                      </>
                    )}
                  </button>

                  {/* Mock Evaluation Feedback */}
                  {mockFeedback && (
                    <div style={{
                      marginTop: '10px',
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>📊 {t("Score de clarté & impact")}</span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: mockFeedback.score >= 80 ? '#10b981' : mockFeedback.score >= 60 ? '#f59e0b' : '#ef4444',
                          background: 'var(--color-bg)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          border: '1px solid var(--color-border)'
                        }}>
                          {mockFeedback.score} / 100
                        </span>
                      </div>

                      {mockFeedback.strengths && mockFeedback.strengths.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>
                            ✓ {t("Points forts")} :
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {mockFeedback.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mockFeedback.improvements && mockFeedback.improvements.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>
                            ⚡ {t("Pistes d'amélioration")} :
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {mockFeedback.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mockFeedback.improvedSampleAnswer && (
                        <div style={{
                          padding: '12px',
                          background: 'rgba(99, 102, 241, 0.06)',
                          borderRadius: '8px',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          fontSize: '12.5px',
                          lineHeight: '1.5'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: '4px' }}>
                            ✨ {t("Exemple de réponse optimisée")} :
                          </div>
                          <div style={{ color: 'var(--color-text)' }}>
                            {mockFeedback.improvedSampleAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
