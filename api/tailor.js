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
1. Emphasize skills and experiences that align with the job description.
2. Rewrite bullet points using strong action verbs to highlight aspects of the candidate's past work that are relevant to the new job requirements.
3. CRITICAL - INTELLIGENT TAILORING: You must intelligently adapt the resume by highlighting relevant transferable skills and using similar vocabulary from the Job Description, BUT YOU MUST NEVER INVENT OR HALLUCINATE tools, software, skills, or experiences the candidate did not explicitly mention having. (For example, do NOT add a specific software to their skills if it wasn't in their original resume, even if the JD asks for it).
4. NEVER change the core context or industry of the candidate's past jobs. If they worked in the Energy sector, keep the Energy sector context. Rephrase their bullet points to emphasize relevant aspects (e.g., data analysis, project management) WITHOUT lying or fundamentally changing what they did.
5. Maintain a highly professional tone.
6. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.
7. STRICT PAGE BUDGET & OVERFLOW PREVENTION: The tailored content must fit cleanly on either exactly 1 page or exactly 2 pages. Avoid creating length that overflows by just a few lines onto a new page (e.g. 1.1 pages or 2.1 pages).
   - If the input resume is short, keep bullet points short and limit them to 2-3 per experience to guarantee it fits on exactly 1 page.
   - If the input resume is longer, keep bullet points short and limit them to 3-4 per experience to guarantee it fits on exactly 2 pages, and never overflows to page 3.
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
