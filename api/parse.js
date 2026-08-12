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
    const apiKey = process.env.GEMINI_API_KEY_MASTER || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");
    }

    if (enhanceMode === 'payslip') {
      const payslipPrompt = `Tu es un expert comptable spécialisé dans la paie française. Analyse ce bulletin et renvoie STRICTEMENT un JSON valide :
{
  "period": "YYYY-MM", (ex: "2026-07" ou "2026-03")
  "grossSalary": double, (Total salaire brut)
  "netSocial": double, (Montant Net Social)
  "netPayable": double, (STRICTEMENT le Salaire Net VERSÉ sur le compte bancaire APRÈS IMPÔT SUR LE REVENU / Prélèvement à la source. NE PRENDS PAS le Net avant impôt !)
  "hasExplicitBonus": boolean, (true uniquement si une ligne de PRIME DE VACANCES, 13EME MOIS, BONUS ou PRIME EXCEPTIONNELLE est présente)
  "bonusDescription": String, (Intitulé exact de la prime si présente, sinon null)
  "bonusAmount": double (Montant net en euros de la prime ou du bonus exceptionnel si présent, sinon 0.0)
}`;

      const parts = [{ text: payslipPrompt }];
      if (text) parts.push({ text: `Texte extrait du document PDF :\n${text}` });
      if (base64Data && mimeType) {
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }

      const aiResultText = await callGeminiApi({
        apiKey,
        prompt: payslipPrompt,
        contents: [{ parts }],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      });

      if (aiResultText) {
        const jsonMap = JSON.parse(aiResultText);
        res.status(200).json(jsonMap);
        return;
      }
    }

    let systemPrompt;

    if (enhanceMode === 'parse_only') {
      systemPrompt = `You are an expert CV Parser.
Your job is to read the raw text or provided document of a user's resume and extract ALL information into a strict JSON format.
IMPORTANT: You are ONLY a parser. Extract the data EXACTLY as written. Do NOT rewrite, enhance, improve, or modify any text.

CRITICAL RULES:
1. EXTRACT FAITHFULLY: Copy all text exactly as it appears. Do NOT improve bullet points, rewrite descriptions, or add action verbs.
2. LANGUAGE: Ensure all the extracted text translates exactly to ${language ? targetLangStr : 'the detected language of the resume'} if it is not already. Add a "detectedLanguage" field with the ISO code ("fr", "en", "es").
3. SKILLS: Extract skills exactly as written in a single string per category. Do NOT infer or add skills that are not explicitly listed. Preserve existing categories with semicolons if present (e.g. "Programming: Python, Java; Data: SQL").
4. TAGLINE: Only extract a tagline if it is explicitly written in the resume. Otherwise leave it as "".
5. BULLET POINTS: Remove leading bullet characters ('>', '-', '•') but keep the text identical.
6. MISSING INFO: If information is missing, use "" or [].
7. JSON ONLY: Return ONLY valid JSON.
8. DATES: Extract startYear, endYear, startMonth, endMonth separately. Use 3-letter abbreviations for months (Jan, Feb, Mar). Set 'current': true for ongoing positions.

Required JSON Structure:
{
  "detectedLanguage": "fr",
  "personal": {
    "name": "",
    "tagline": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": [""],
      "technologies": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "institution": "",
      "location": "",
      "startYear": "",
      "endYear": "",
      "current": false,
      "bullets": [""],
      "technologies": ""
    }
  ],
  "skills": {
    "technical": "",
    "soft": "",
    "languages": ""
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "techStack": "",
      "link": "",
      "highlights": [""]
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
}`;
    }

    const parts = [{ text: systemPrompt }];
    if (text) parts.push({ text: `Resume Text:\n${text}` });
    if (base64Data && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    const resultText = await callGeminiApi({
      apiKey,
      prompt: systemPrompt,
      contents: [{ parts }],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    });

    if (resultText) {
      const parsed = JSON.parse(resultText);
      res.status(200).json({ parsedResume: parsed });
    } else {
      res.status(500).json({ error: 'Failed to parse resume via AI' });
    }
  } catch (err) {
    console.error('API parse error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
