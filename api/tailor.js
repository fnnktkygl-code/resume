import { normalizeResumeCasing } from './_normalizeCasing.js';

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeData, jobDescription, language } = req.body;

  if (!resumeData || !jobDescription) {
    return res.status(400).json({ error: 'Missing resumeData or jobDescription' });
  }

  const apiKey = process.env.GEMINI_API_KEY_MASTER;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY_MASTER is not defined' });
  }

  const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';
  
  const cloneData = { ...resumeData };
  delete cloneData.headings;

  const systemInstruction = `Act as an expert technical recruiter and ATS optimization specialist. 
Your task is to tailor the provided JSON resume to match the provided Job Description.
Target Language for the content: ${targetLang}.

CRITICAL RULE — NO UNNECESSARY REWRITES (PRESERVE ALIGNED SECTIONS):
- Compare each section of the candidate's resume against the job description.
- IF a tagline, summary, skill list, or bullet point is ALREADY well-aligned with the target job requirements, DO NOT REWRITE IT. Keep the original text 100% IDENTICAL to the original.
- ONLY propose modifications for sections that genuinely lack key hard skills, relevant domain terminology, or impact metrics required by the job offer.
- Do NOT make cosmetic or arbitrary changes to already well-written sentences.

Rules:
1. Emphasize hard skills and experiences that align with the job description, BUT ONLY if the candidate actually possesses them.
2. Update the "tagline" or "summary" ONLY if they lack core alignment with the job description. If already aligned, keep them identical.
3. CRITICAL - PRESERVE THE CANDIDATE'S UNIQUE DNA: When rewriting a bullet point, you MUST preserve ALL specific technical details, domain terminology, named configurations, and concrete examples from the original text. NEVER replace specific details with generic phrases.
   BAD EXAMPLE (FORBIDDEN): Original "Développement et optimisation d'outils de monitoring pour suivre Wind Sector Management, Noise Regulation, Bat Protection" → Rewritten "Développement de tableaux de bord et indicateurs de performance pour le suivi des actifs énergétiques" ← THIS IS FORBIDDEN because it removes the specific configurations (Wind Sector Management, Noise Regulation, Bat Protection) that make the candidate unique.
   GOOD EXAMPLE: Original "Développement et optimisation d'outils de monitoring pour suivre Wind Sector Management, Noise Regulation, Bat Protection" → Rewritten "Développement et optimisation d'outils de monitoring pour le suivi en continu des configurations éoliennes (Wind Sector Management, Noise Regulation, Bat Protection), améliorant la conformité réglementaire" ← THIS preserves all specific details while adding ATS value.
4. CRITICAL - ANTI-HALLUCINATION: You MUST NEVER invent or hallucinate tools, software, certifications, skills, or experiences the candidate did not explicitly mention having.
5. CRITICAL - ANTI-GENERALIZATION: NEVER replace specific named technologies, configurations, processes, or domain terms with vague/generic equivalents. If a bullet says "SCADA" keep "SCADA", if it says "Wind Sector Management" keep "Wind Sector Management", if it says "Atlas Data Federation" keep "Atlas Data Federation". The specificity IS the value.
6. CRITICAL - NORMALIZE CASING: ALL bullet points, summaries, and taglines across the ENTIRE resume MUST use consistent normal sentence case (e.g. "Développement de tableaux de bord et indicateurs de performance"). If any bullet point in the input is written in ALL UPPERCASE (e.g. "GESTION DE LA QUALITÉ DES DONNÉES"), you MUST convert it to normal sentence case (e.g. "Gestion de la qualité des données"). Proper nouns, acronyms (KPI, SQL, SCADA, GMAO), and tool names should keep their standard capitalization. The goal is a uniform, professional appearance across all sections.
7. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.`;

  const promptText = `

  const systemInstruction = `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.
Your task is to tailor a candidate's JSON resume to match a specific job description, ensuring it passes ATS screeners while maintaining 100% truthfulness to the candidate's actual experience.

Target Output Language: ${targetLang}
You MUST output the entire tailored resume in ${targetLang}, regardless of the input language. Translate all titles, subtitles, bullet points, summaries, and descriptions to ${targetLang}.

RULES:
1. Return ONLY a valid JSON object with the EXACT same top-level structure as the input resumeData.
2. Maintain truthfulness: Do NOT invent new jobs, degrees, or fake metrics. Adapt existing bullet points to emphasize relevant skills from the job description.
3. Optimize keywords: Naturally integrate key terminology and skills from the job description into the summary, bullet points, and skills sections.
4. Capitalization: Use Standard Sentence Case for job titles, sub-titles, company names, and bullet points. Never output ALL CAPS text.
5. Preserved Fields: Preserve personal contact details (name, email, phone, location, links) as-is.`;

  try {
    const { checkAndIncrementQuota } = await import('./firebase.js');
    await checkAndIncrementQuota();

    const jsonText = await callGeminiApi({
      apiKey,
      prompt: `Resume Data:\n${JSON.stringify(resumeData)}\n\nTarget Job Description:\n${jobDescription}`,
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    let tailoredResume = JSON.parse(jsonText);
    tailoredResume = normalizeResumeCasing(tailoredResume);
    
    if (resumeData.headings) {
      tailoredResume.headings = resumeData.headings;
    }
    
    return res.status(200).json({ tailoredResume });
  } catch (error) {
    console.error("Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
