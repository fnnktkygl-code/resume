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

  const { text, base64Data, mimeType } = req.body;

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

    const systemPrompt = `You are an expert HR Assistant and CV Enhancer.
Your job is to read the raw text or the provided document of a user's resume and extract all information into a very specific strict JSON format. 
IMPORTANT: You are not just a parser, you are an ENHANCER.

CRITICAL ENHANCEMENT RULES:
1. ENHANCE DESCRIPTIONS: If a job's bullet points are too brief, vague, or weak, you MUST rewrite and expand them professionally based on the job title. Use strong action verbs. Keep it realistic, credible, and maintain a natural human tone (do not sound like a robotic AI).
2. INFER SKILLS (TAGS): If the user does not explicitly list their skills, you MUST deduce them from their job descriptions and add them to the appropriate skills category (e.g., if they worked in retail, add "Customer Service", "Inventory Management", "Sales").
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
  "personal": { "name": "", "tagline": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "github": "" },
  "summary": "A brief summary of the profile. Enhance this professionally if it's too short.",
  "experience": [
    {
      "company": "",
      "title": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": ["Professionally enhanced bullet 1", "Professionally enhanced bullet 2"],
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

Parse and strategically enhance the provided resume, returning ONLY the JSON object.`;

    let parts = [{ text: systemPrompt }];
    if (base64Data && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    } else if (text) {
      parts.push({ text: `Resume text:\n\n${text}` });
    }

    const { checkAndIncrementQuota } = await import('./firebase.js');
    await checkAndIncrementQuota();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      
      if (response.status === 429) {
         return res.status(429).json({ error: 'QUOTA_EXCEEDED' });
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No response generated by Gemini");
    }

    try {
      // Parse the JSON to ensure it's valid before sending it back
      const jsonResponse = JSON.parse(generatedText);
      res.status(200).json({ parsedResume: jsonResponse });
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", generatedText);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }

  } catch (error) {
    console.error('Parse function error:', error);
    if (error.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'QUOTA_EXCEEDED' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
