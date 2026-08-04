import { callGeminiApi } from './_geminiFallback.js';

export default async function handler(req, res) {
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

  const { text, base64Data, mimeType, mode, language } = req.body;
  const enhanceMode = mode || 'parse_only';
  const targetLangStr = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

  if (!text && !base64Data) {
    res.status(400).json({ error: 'Text or file content is required' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    let systemPrompt;

    if (enhanceMode === 'parse_only') {
      systemPrompt = `You are an expert CV Parser.
Your job is to read the raw text or provided document of a user's resume and extract ALL information into a strict JSON format.
IMPORTANT: You are ONLY a parser. Extract the data EXACTLY as written. Do NOT rewrite, enhance, improve, or modify any text.

CRITICAL RULES:
1. EXTRACT FAITHFULLY: Copy all text exactly as it appears. Do NOT improve bullet points, rewrite descriptions, or add action verbs.
2. LANGUAGE: Ensure all the extracted text translates exactly to ${language ? targetLangStr : 'the detected language of the resume'} if it is not already. Add a "detectedLanguage" field with the ISO code ("fr", "en", "es").
3. SKILLS: Extract skills exactly as written. Do NOT infer or add skills that are not explicitly listed.
4. TAGLINE: Only extract a tagline if it is explicitly written in the resume. Otherwise leave it as "".
5. BULLET POINTS: Remove leading bullet characters ('>', '-', '•') but keep the text identical.
6. MISSING INFO: If information is missing, use "" or [].
7. JSON ONLY: Return ONLY valid JSON.
8. DATES: Use 3-letter abbreviations for months (Jan, Feb, Mar). Set 'current': true for ongoing positions.

Required JSON Structure:
{
  "detectedLanguage": "fr or en or es",
  "personal": { "name": "", "tagline": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "github": "" },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": ["exact bullet text as written"],
      "technologies": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startYear": "",
      "endYear": "",
      "location": "",
      "technologies": ""
    }
  ],
  "skills": { "technical": "", "soft": "", "languages": "" },
  "projects": [
    {
      "name": "",
      "description": "",
      "techStack": "",
      "link": "",
      "highlights": ["exact highlight text"]
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "credentialUrl": ""
    }
  ]
}

Parse the provided resume FAITHFULLY without any modifications, returning ONLY the JSON object.`;
    } else {
      systemPrompt = `You are an expert HR Assistant and CV Enhancer.
Your job is to read the raw text or the provided document of a user's resume and extract all information into a very specific strict JSON format. 
IMPORTANT: You are not just a parser, you are an ENHANCER.

CRITICAL LANGUAGE RULE:
- ALL enhanced text MUST be written in ${language ? targetLangStr : 'the EXACT SAME language as the original resume'}.
- NEVER translate to a different language unless specified. Preserve the target language.
- Add a "detectedLanguage" field at the root of the JSON with the ISO code (e.g. "fr", "en", "es").

CRITICAL ENHANCEMENT RULES:
1. ENHANCE DESCRIPTIONS: If a job's bullet points are too brief, vague, or weak, you MUST rewrite and expand them professionally based on the job title. Use strong action verbs. Keep it realistic, credible, and maintain a natural human tone (do not sound like a robotic AI). ALWAYS OUTPUT IN ${language ? targetLangStr : 'THE ORIGINAL LANGUAGE'}.
2. INFER SKILLS (TAGS): If the user does not explicitly list their skills, you MUST deduce them from their job descriptions and add them to the appropriate skills category (e.g., if they worked in retail, add "Customer Service", "Inventory Management", "Sales"). Write skills in ${language ? targetLangStr : 'the original language'}.
3. SKILLS CATEGORIZATION: 
   - 'technical' is strictly for IT/Programming/Software/Tools (e.g. Python, Excel, React). 
   - If the user is in customer service, sales, retail, or management, put their skills under 'soft', NOT 'technical'.
4. ZÉRO HALLUCINATIONS FOR TITLES: DO NOT invent a 'tagline' (like "PERFORMANCE ENGINEER" or "SALES ASSOCIATE") if it is not explicitly written as a title in the original resume. Leave 'tagline' empty "" if there isn't one. Do not hallucinate job roles they didn't have.
5. BULLET POINTS CLEANUP: Remove any leading bullet characters like '>', '-', or '•' from the start of the 'bullets' text. We will render our own bullets.
6. MISSING INFO: If a piece of information is missing, use an empty string "" or empty array.
7. JSON ONLY: DO NOT include markdown formatting like \`\`\`json in your response. Respond ONLY with valid JSON.
8. DATES: For 'startMonth' and 'endMonth', use the 3-letter abbreviation (e.g., 'Jan', 'Feb', 'Mar') or empty string if not found. If an experience is currently ongoing, set 'current': true.

Required JSON Structure:
{
  "detectedLanguage": "fr or en or es",
  "personal": { "name": "", "tagline": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "github": "" },
  "summary": "A brief summary of the profile. Enhance this professionally if it's too short. IN THE REQUIRED LANGUAGE.",
  "experience": [
    {
      "company": "",
      "title": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": ["Professionally enhanced bullet 1 IN REQUIRED LANGUAGE", "Professionally enhanced bullet 2 IN REQUIRED LANGUAGE"],
      "technologies": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startYear": "",
      "endYear": "",
      "location": "",
      "technologies": ""
    }
  ],
  "skills": { "technical": "", "soft": "", "languages": "" },
  "projects": [
    {
      "name": "",
      "description": "",
      "techStack": "",
      "link": "",
      "highlights": ["highlight 1"]
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "credentialUrl": ""
    }
  ]
}

Parse and strategically enhance the provided resume, returning ONLY the JSON object IN THE REQUIRED LANGUAGE (${language ? targetLangStr : 'DETECTED LANGUAGE'}).`;
    }

    const parts = [{ text: systemPrompt }];
    if (text) {
      parts.push({ text: `Resume Content:\n${text}` });
    }
    if (base64Data && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    let cleanJsonStr = generatedText.trim();
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const jsonResponse = JSON.parse(cleanJsonStr);
    res.status(200).json({ parsedResume: jsonResponse });

  } catch (error) {
    console.error('Parse function error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
