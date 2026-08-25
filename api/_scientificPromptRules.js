/**
 * Scientific HR Rules & Prompt Guidelines
 * Derived from empirical cognitive psychology, eye-tracking studies, and HR benchmarks.
 * Source reference: Conseils CV Basés sur Études.md
 */

export const SCIENTIFIC_HR_RULES = {
  // Resume Bullet Points rules
  bulletPoints: `
SCIENTIFIC EXECUTIVE BULLET POINT RULES (Harvard XYZ & NACE Standards):
1. STRONG ACTIVE VERBS (cv_5): Start EVERY bullet point with a high-impact, prestigious active verb in past/active tense (Piloté, Conçu, Développé, Optimisé, Architecturé, Négocié, Structuré / Spearheaded, Architected, Engineered, Streamlined, Orchestrated). Avoid passive phrasing ("Responsable de", "Aidé à", "Travail sur").
2. HARVARD XYZ IMPACT FORMULA (cv_12 & cv_9): Structure achievements as "Accomplished [X] (Action & Scope) using [Z] (Tools & Methodology), resulting in [Y] (Quantified Impact or Value)". Frame numbers, percentages, and metrics naturally within the sentence.
3. CONCISE & VALORIZING (cv_4): Limit each bullet point to 1-2 lines maximum. Focus on candidate's core expertise, leadership, and operational mastery.
  `,

  // Cover Letter rules
  coverLetter: `
SCIENTIFIC COVER LETTER RULES (SHRM & Forbes & Resume Genius 2026):
1. CONCISE WORD COUNT (<300 WORDS): The total cover letter MUST be under 300 words, formatted into 3 to 4 distinct paragraphs (SHRM study: 83% full reading rate for <300 words vs 12% for multi-page letters).
2. TRIPARTITE STRUCTURE (VOUS / MOI / NOUS) (cl_8):
   - Paragraph 1 [VOUS - The Hook]: Start with a punchy, natural, and direct hook. CRITICAL: DO NOT summarize the company's mission back to them (e.g., never write "As a world leader in X, your vision is..."). They already know what they do. Instead, immediately identify their specific technical/business need based on the Job Description, and state exactly how your core expertise solves it in a human, conversational tone.
   - Paragraph 2-3 [MOI - The Proof]: Demonstrate 1-2 concrete accomplishments with quantified metrics that directly solve the employer's operational needs (Glassdoor: 3x recruiter interest).
   - Paragraph 4 [NOUS - The Synergy & CTA]: Propose a proactive call-to-action for an interview exchange (Inc. Magazine: +35% interview calls). Keep the sign-off modern and not overly formal.
3. PRIVACY & LOCATION: Mention only City and State/Region. Never include full street addresses (DARES & CNRS anti-discrimination).
4. HUMAN TONE: Avoid robotic corporate jargon, overly complex sentences, and cliché transitional phrases. Write as if a smart, confident professional is sending an email directly to the hiring manager.
  `,

  // Boldify rules
  boldify: `
SCIENTIFIC BOLDING RULES (Nielsen Norman Group Eye-Tracking):
1. SELECTIVE FOCUS (cr_3 & cv_7): Bold ONLY 1 to 3 strategic terms per bullet or paragraph (+65% scan speed).
2. WHAT TO BOLD: High-impact action verbs, key numeric metrics (e.g. **+40%**, **€50K**), and core named technologies/skills matching job requirements.
3. MINIMALISM: Do NOT bold full sentences. Bold individual keywords (1-3 words max per bold span).
  `,

  // ATS Optimization rules
  atsParsing: `
ATS PARSING & KEYWORD RULES (Jobscan Fortune 500 Benchmark 98.4%):
1. EXACT KEYWORD MATCHING: Match the exact phrasing of target hard skills and domain terms from the job offer.
2. ANTI-HALLUCINATION: Never invent experiences, certifications, or tools not explicitly declared by the candidate.
3. NO GRAPHIC INTERFERENCE: Keep layout mono-column compatible for 100% parsing accuracy.
  `,

  // Interview Prep & STAR Simulator rules (inspired by ai-job-search / Harvard OCS)
  interviewPrep: `
SCIENTIFIC INTERVIEW PREPARATION RULES (STAR Method & Harvard OCS Guidelines):
1. RIGOROUS STAR MAPPING: Every behavioral answer must follow the STAR format:
   - Situation: Context in 1 concise sentence.
   - Task: The exact challenge or goal.
   - Action: 2-3 specific actions taken by the candidate (verbs in first person).
   - Result: Concrete quantifiable outcome (metrics, percentages, saved time).
2. RADICAL TRUTH & BRIDGE ANSWERS: Never fabricate experience for missing skills. If a job requirement is absent from the candidate's CV, provide a "Bridge Answer":
   - Acknowledge the gap honestly.
   - Connect to a closely adjacent technology/concept the candidate has mastered.
   - Highlight concrete evidence of rapid learning capability.
3. TAILORED REVERSE-QUESTIONS: Formulate 3 insightful questions for the candidate to ask the interviewer that demonstrate deep understanding of the company's technical/business challenges.
  `,

  // Follow-up & Thank You note rules
  followup: `
SCIENTIFIC FOLLOW-UP & THANK-YOU RULES (Recruiter Response Rate Benchmarks):
1. TIMING & TONE:
   - Silence follow-up (J+7 to J+10): Polite, confident, re-stating enthusiasm and 1 core value proposition. Max 100-150 words.
   - Post-interview thank-you (Within 24h): Reference 1 specific discussion topic or technical challenge discussed during the interview. Max 120 words.
2. ZERO PRESSURE: Position the candidate as an eager, highly qualified peer rather than a desperate applicant.
3. EXPLICIT CTA: Clear, frictionless closing question.
  `,

  // Upskill & Gap analysis rules
  upskill: `
SCIENTIFIC UPSKILLING & GAP ANALYSIS RULES:
1. IDENTIFY REAL SKILL GAPS: Compare candidate's tech stack against job description requirements.
2. CONCRETE LEARNING ROADMAP: For each missing competency, provide:
   - Category (Hard Tech, Framework, Tool, Methodology).
   - Estimated hours to reach working proficiency.
   - 1-2 Recommended official/free resources (docs, GitHub repos, tutorials).
   - 1 Actionable mini-project idea to prove competency on resume/GitHub.
  `
};

