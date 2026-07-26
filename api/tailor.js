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
3. Rewrite bullet points ONLY when necessary to highlight relevant hard skills or missing metrics.
4. CRITICAL - ANTI-HALLUCINATION: You MUST NEVER invent or hallucinate tools, software, certifications, skills, or experiences the candidate did not explicitly mention having.
5. CRITICAL - DOMAIN PRESERVATION: NEVER scrub or generalize domain-specific terminology (e.g. wind turbines, solar assets, specific technical constraints).
6. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.`;

  const promptText = `
### JOB DESCRIPTION
${jobDescription}

### ORIGINAL RESUME (JSON)
${JSON.stringify(cloneData)}

Output the fully optimized and tailored resume as a valid JSON object.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: "application/json",
    }
  };

  try {
    const { checkAndIncrementQuota } = await import('./firebase.js');
    await checkAndIncrementQuota();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'QUOTA_EXCEEDED', message: 'Gemini API quota exceeded' });
      }
      
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to call Gemini API from server' });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Invalid response format from Gemini' });
    }
    
    const jsonText = candidate.content.parts[0].text;
    const tailoredResume = JSON.parse(jsonText);
    
    if (resumeData.headings) {
        tailoredResume.headings = resumeData.headings;
    }
    
    return res.status(200).json({ tailoredResume });
    
  } catch (error) {
    console.error("Function Error:", error);
    if (error.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'QUOTA_EXCEEDED', message: 'Gemini API quota exceeded' });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
