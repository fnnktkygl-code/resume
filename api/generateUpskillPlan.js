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
    const { resumeData, jobDescription, companyName, jobTitle, language = 'fr' } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY_MASTER is not defined' });
    }

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const { checkAndIncrementQuota } = await import('./_firebase.js');
    await checkAndIncrementQuota();

    const systemInstruction = `You are an engineering career mentor and senior talent development advisor.
Your mission is to perform a gap analysis between the candidate's CV and the job description, and create an actionable Upskill & Learning Roadmap.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.upskill}

Requirements:
1. Identify all core hard technical skills, tools, frameworks, and methodologies required by the job that are missing or weak in the candidate's CV.
2. Group them by priority: Critical (Must-have for interviews), Moderate (Bonus / Nice-to-have), Low (Long-term growth).
3. For each gap, provide:
   - "skill": Name of skill
   - "category": e.g. Backend, Frontend, Cloud/DevOps, Architecture, Testing, Data
   - "estimatedHours": realistic hours (e.g. "8-12h")
   - "curatedResources": array of 1-2 free official resources or tutorials (e.g. "Official React Docs", "FastAPI Tutorial")
   - "practicalMiniProject": 1 concrete mini-project idea that takes <1 weekend to build and showcase on GitHub or CV.
4. Provide a 2-week fast-track study plan.
5. Return a JSON object with:
{
  "readinessScore": number from 0 to 100,
  "summary": "Brief executive summary of the gap analysis",
  "skillGaps": [
    {
      "skill": "...",
      "priority": "critical" | "moderate" | "low",
      "category": "...",
      "estimatedHours": "...",
      "curatedResources": ["..."],
      "practicalMiniProject": "..."
    }
  ],
  "twoWeekRoadmap": [
    { "phase": "Week 1", "focus": "...", "deliverable": "..." },
    { "phase": "Week 2", "focus": "...", "deliverable": "..." }
  ]
}`;

    const jsonText = await callGeminiApi({
      apiKey,
      prompt: `Candidate Resume JSON:\n${JSON.stringify(resumeData || {})}\n\nTarget Job Description:\n${jobDescription || ''}\n\nCompany: ${companyName || ''}\nRole: ${jobTitle || ''}`,
      systemInstruction,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });

    let cleanedText = jsonText;
    if (jsonText.startsWith('```')) {
      cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    const result = JSON.parse(cleanedText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("GenerateUpskillPlan Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
