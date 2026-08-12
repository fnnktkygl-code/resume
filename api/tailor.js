import { normalizeResumeCasing } from './_normalizeCasing.js';
import { callGeminiApi } from './_geminiFallback.js';
import { SCIENTIFIC_HR_RULES } from './_scientificPromptRules.js';

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

  try {
    const { resumeData, jobDescription, language } = req.body || {};

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

${SCIENTIFIC_HR_RULES.atsParsing}
${SCIENTIFIC_HR_RULES.bulletPoints}

CRITICAL RULE — NO UNNECESSARY REWRITES (PRESERVE ALIGNED SECTIONS):
- Compare each section of the candidate's resume against the job description.
- IF a tagline, summary, skill list, or bullet point is ALREADY well-aligned with the target job requirements, DO NOT REWRITE IT. Keep the original text 100% IDENTICAL to the original.
- ONLY propose modifications for sections that genuinely lack key hard skills, relevant domain terminology, or impact metrics required by the job offer.
- Do NOT make cosmetic or arbitrary changes to already well-written sentences.

Rules:
1. Emphasize hard skills and experiences that align with the job description, BUT ONLY if the candidate actually possesses them.
2. Update the "tagline" or "summary" ONLY if they lack core alignment with the job description. If already aligned, keep them identical.
3. CRITICAL - PRESERVE THE CANDIDATE'S UNIQUE DNA: When rewriting a bullet point, you MUST preserve ALL specific technical details, domain terminology, named configurations, and concrete examples from the original text. NEVER replace specific details with generic phrases.
4. CRITICAL - FRONT-LOAD METRICS: When rewriting bullet points, place key numbers/metrics in the first 3 words.
5. CRITICAL - ANTI-HALLUCINATION: You MUST NEVER invent or hallucinate tools, software, certifications, skills, or experiences the candidate did not explicitly mention having.
6. CRITICAL - ANTI-GENERALIZATION: NEVER replace specific named technologies, configurations, processes, or domain terms with vague/generic equivalents.
7. CRITICAL - NORMALIZE CASING: ALL bullet points, summaries, and taglines across the ENTIRE resume MUST use consistent normal sentence case.
8. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.`;

    const { checkAndIncrementQuota } = await import('./firebase.js');
    await checkAndIncrementQuota();

    const jsonText = await callGeminiApi({
      apiKey,
      prompt: `Resume Data:\n${JSON.stringify(cloneData)}\n\nTarget Job Description:\n${jobDescription}`,
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    let cleanedText = jsonText;
    if (jsonText.startsWith('```')) {
      cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    let tailoredResume = JSON.parse(cleanedText);
    tailoredResume = normalizeResumeCasing(tailoredResume);
    
    if (resumeData.headings) {
      tailoredResume.headings = resumeData.headings;
    }
    
    return res.status(200).json({ tailoredResume });
  } catch (error) {
    console.error("Tailor Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
