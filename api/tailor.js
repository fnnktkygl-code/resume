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

Rules:
1. Emphasize skills and experiences that align with the job description, BUT ONLY if the candidate actually possesses them.
2. You MUST rewrite the "tagline" (Professional Title) and "summary" (Executive Summary) to closely align with the core requirements of the job description, positioning the candidate perfectly for the role.
3. Rewrite bullet points using strong action verbs to highlight aspects of the candidate's past work that are relevant to the new job requirements.
4. CRITICAL - ANTI-HALLUCINATION: You MUST NEVER invent or hallucinate tools, software, certifications, skills, or experiences the candidate did not explicitly mention having. Do NOT add a specific software or skill to their profile just because the Job Description asks for it. If they don't have it, focus on analogous skills they DO have.
4. CRITICAL - ANTI-GENERICIZATION (DOMAIN PRESERVATION): NEVER scrub, generalize, or remove domain-specific terminology (e.g., wind turbines, medical devices, specific technical constraints) from the original bullet points. The candidate's unique industry context MUST remain highly visible. Do not replace their specific achievements with generic buzzwords (like "operational performance" or "business dashboards").
5. Maintain a highly professional tone.
6. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.
7. STRICT PAGE BUDGET & OVERFLOW PREVENTION: The tailored content must fit cleanly on either exactly 1 page or exactly 2 pages. Avoid creating length that overflows by just a few lines onto a new page.
   - If the input resume is short, keep bullet points short and limit them to 2-3 per experience to guarantee it fits on exactly 1 page.
   - If the input resume is longer, keep bullet points short and limit them to 3-4 per experience to guarantee it fits on exactly 2 pages.
   - Every bullet point must be concise, direct, and under 2 lines.`;

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
