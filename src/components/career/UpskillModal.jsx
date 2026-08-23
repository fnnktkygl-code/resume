import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { generateUpskillPlanWithProxy } from '../../services/geminiService';

export default function UpskillModal({
  isOpen,
  onClose,
  application,
  resumeData
}) {
  const { t, language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [upskillPlan, setUpskillPlan] = useState(null);

  useEffect(() => {
    if (isOpen && application) {
      loadPlan();
    }
  }, [isOpen, application]);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      const res = await generateUpskillPlanWithProxy({
        resumeData,
        jobDescription: application.jobDescription || application.snippet || application.jobTitle,
        companyName: application.company || 'Entreprise Cible',
        jobTitle: application.jobTitle || 'Poste Cible',
        language
      });
      setUpskillPlan(res);
    } catch (err) {
      console.error('Upskill plan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {t("Matrice de Compétences & Plan d'Apprentissage")}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                🏢 {application.company} • 🎯 {application.jobTitle}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fi fi-rr-spinner cl-spin" style={{ fontSize: '32px', color: 'var(--color-accent)' }}></i>
              <p style={{ marginTop: '12px', fontWeight: 600, fontSize: '14px' }}>
                {t("Analyse des écarts de compétences...")}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {t("Génération des mini-projets pratiques et de la roadmap d'apprentissage.")}
              </p>
            </div>
          ) : upskillPlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score & Summary Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '10px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{
                  minWidth: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--color-accent)'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)' }}>
                    {upskillPlan.readinessScore || 85}%
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    MATCH
                  </span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text)' }}>
                  {upskillPlan.summary}
                </div>
              </div>

              {/* Skill Gaps List */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>
                  🎯 {t("Compétences clés à acquérir")} ({upskillPlan.skillGaps?.length || 0})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upskillPlan.skillGaps?.map((gap, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {gap.skill}
                          </span>
                          {gap.category && (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                              {gap.category}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: gap.priority === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: gap.priority === 'critical' ? 'var(--color-danger)' : '#d97706'
                          }}>
                            {gap.priority === 'critical' ? `🔥 ${t("Priorité Critique")}` : `⚡ ${t("Priorité Modérée")}`}
                          </span>
                          {gap.estimatedHours && (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                              ⏱️ {gap.estimatedHours}
                            </span>
                          )}
                        </div>
                      </div>

                      {gap.practicalMiniProject && (
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(99, 102, 241, 0.05)',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                          fontSize: '12px',
                          color: 'var(--color-text)'
                        }}>
                          💡 <b>{t("Mini-projet pratique pour votre CV")} :</b> {gap.practicalMiniProject}
                        </div>
                      )}

                      {gap.curatedResources && gap.curatedResources.length > 0 && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          <b>📚 {t("Ressources recommandées")} :</b>
                          {gap.curatedResources.map((res, idx) => (
                            <span key={idx} style={{ background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                              🔗 {res}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Week Learning Roadmap */}
              {upskillPlan.twoWeekRoadmap && upskillPlan.twoWeekRoadmap.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>
                    📅 {t("Roadmap d'apprentissage sur 2 semaines")}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {upskillPlan.twoWeekRoadmap.map((week, idx) => (
                      <div key={idx} style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
                          🗓️ {week.phase}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>
                          <b>{t("Focus")} :</b> {week.focus}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          <b>🎯 {t("Livrable")} :</b> {week.deliverable}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
