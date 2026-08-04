/**
 * Scientific HR Rules & Prompt Guidelines
 * Derived from empirical cognitive psychology, eye-tracking studies, and HR benchmarks.
 * Source reference: Conseils CV Basés sur Études.md
 */

export const SCIENTIFIC_HR_RULES = {
  // Resume Bullet Points rules
  bulletPoints: `
SCIENTIFIC BULLET POINT RULES (Ladders 7.4s Eye-Tracking & NACE Standards):
1. FRONT-LOADING METRICS (cv_12 & cv_9): Place key numbers, percentages, or quantified achievements within the FIRST 3 WORDS of each bullet point (e.g., "Increased sales by 40% through...", "Automated 25% of manual testing by...", "Managed €50K budget for..."). Placing numbers at the start captures foveal vision during F-pattern scanning.
2. ACTION VERBS (cv_5): Start EVERY bullet point with a high-impact active verb in past or active tense (Spearheaded, Architected, Engineered, Reduced, Streamlined, Negotiated). Avoid passive phrases like "Responsible for" or "Helped with".
3. CONCISE IMPACT (cv_4): Limit each bullet point to 1-2 lines maximum. Focus on Situation/Task -> Action -> Measurable Result (STAR method).
  `,

  // Cover Letter rules
  coverLetter: `
SCIENTIFIC COVER LETTER RULES (SHRM & Forbes & Resume Genius 2026):
1. CONCISE WORD COUNT (<300 WORDS): The total cover letter MUST be under 300 words, formatted into 3 to 4 distinct paragraphs (SHRM study: 83% full reading rate for <300 words vs 12% for multi-page letters).
2. TRIPARTITE STRUCTURE (VOUS / MOI / NOUS) (cl_8):
   - Paragraph 1 [VOUS - The Hook]: Open directly by addressing the company's core mission, challenge, or recent development. NO generic clichés like "I am writing to apply...". Captures 80% of recruiter attention in the 1st sentence (Forbes).
   - Paragraph 2-3 [MOI - The Proof]: Demonstrate 1-2 concrete accomplishments with quantified metrics that directly solve the employer's operational needs (Glassdoor: 3x recruiter interest).
   - Paragraph 4 [NOUS - The Synergy & CTA]: Propose a proactive call-to-action for an interview exchange (Inc. Magazine: +35% interview calls).
3. PRIVACY & LOCATION: Mention only City and State/Region. Never include full street addresses (DARES & CNRS anti-discrimination).
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
  `
};
