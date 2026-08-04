import { callGeminiApi } from './_geminiFallback.js';

export default async function handler(req, res) {
  const { checkAndIncrementQuota } = await import('./firebase.js');

  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { resumeData, language, jobDescription } = req.body;

  if (!resumeData) {
    res.status(400).json({ error: 'resumeData is required' });
    return;
  }

  try {
    await checkAndIncrementQuota();
    
    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';
    const systemPrompt = `You are a senior career coach and ATS optimization specialist who adapts advice to each individual's specific profession and industry.

STEP 1 — PROFILE & JOB IDENTIFICATION:
Silently analyze the candidate's background and target job description (if provided).

STEP 2 — GENERATE 3 DISTINCT, TAILORED RECOMMENDATIONS:
Generate exactly 3 DIFFERENT recommendations covering distinct areas of the resume:

    const systemPrompt = `You are a world-class ATS Resume Auditor and Career Coach.
Analyze the provided JSON resume against best ATS practices ${jobDescription ? `and against this Target Job Description:\n"""${jobDescription}"""` : ''}.

Target Output Language: ${targetLang}
You MUST write all title, description, and suggestedText values in ${targetLang}.

Provide 3 to 5 highly actionable, concrete recommendations.
For each recommendation, output a JSON object with:
- title: Short actionable title (e.g. "Add Quantified Metrics to Senior Role")
- description: Clear explanation of why this improves the resume
- suggestedText: Concrete text snippet ready to be added/replaced
- targetSection: One of ["experience", "summary", "skills", "projects"]
- targetIndex: Index of the item in the array if targeting a specific experience/project, else 0
- action: "APPLY_SUGGESTION"

Return ONLY a JSON array of recommendation objects.`;

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts: [{ text: systemPrompt }, { text: `Resume Data:\n${JSON.stringify(resumeData)}` }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const tips = JSON.parse(generatedText);
    res.status(200).json({ tips });

  } catch (error) {
    console.error('AI Analyze Proxy Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
}
