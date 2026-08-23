import { callGeminiApi } from './_geminiFallback.js';
import { normalizeResumeCasing } from './_normalizeCasing.js';

export default async function handler(req, res) {
  const { checkAndIncrementQuota } = await import('./_firebase.js');

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { action = 'enhance', textData, text, resumeData, contextType, language } = req.body || {};

  try {
    await checkAndIncrementQuota();

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    // 1. ACTION: TRANSLATE
    if (action === 'translate' || (!textData && (text || resumeData))) {
      if (text) {
        const systemPrompt = `Translate the following text into ${targetLang}. Keep the same tone and format, and preserve markdown bolding (**text**) or other markers. Respond ONLY with the translated text. Do not include any explanations.`;
        const generatedText = await callGeminiApi({
          apiKey,
          contents: [{ parts: [{ text: systemPrompt }, { text: `Text to translate:\n"""\n${text}\n"""` }] }],
          generationConfig: { temperature: 0.2 }
        });
        return res.status(200).json({ translatedText: (generatedText || '').trim() });
      }

      if (resumeData) {
        const cloneData = { ...resumeData };
        delete cloneData.headings;
        const systemPrompt = `Act as an expert technical recruiter and professional translator. I am building a professional, ATS-friendly resume.
Please translate the values of the following JSON resume data into ${targetLang}. 
CRITICAL RULES:
1. ONLY translate the text values inside the JSON.
2. DO NOT translate the JSON keys (e.g. keep "company", "title", "bullets" exactly as they are).
3. Ensure the tone is professional, achievement-oriented, and uses strong action verbs.
4. Maintain all bullet point structures and do not invent new facts.
5. The output MUST be a valid JSON matching the exact schema.`;

        const jsonText = await callGeminiApi({
          apiKey,
          prompt: `Resume JSON to translate:\n${JSON.stringify(cloneData)}`,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        });

        let cleanedText = jsonText;
        if (jsonText.startsWith('```')) {
          cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        }
        let translatedResume = JSON.parse(cleanedText);
        translatedResume = normalizeResumeCasing(translatedResume);
        if (resumeData.headings) {
          translatedResume.headings = resumeData.headings;
        }
        return res.status(200).json({ translatedResume });
      }
    }

    // 2. ACTION: REWRITE
    if (action === 'rewrite') {
      const contextMap = {
        summary: "this professional resume summary",
        experience: "this resume experience description",
        projects: "this resume project description"
      };
      const targetContext = contextMap[contextType] || "this resume text";

      const systemPrompt = `Act as an expert executive resume writer and career coach.
I have written ${targetContext}. Please rewrite and reformulate this text to make it much more professional, impactful, results-oriented, and ATS-optimized.
Use strong action verbs, concise phrasing, and quantifiable impact where appropriate.
Write the response in ${targetLang}.
Do NOT add any conversational introductory or concluding text. Return ONLY the rewritten text.`;

      const generatedText = await callGeminiApi({
        apiKey,
        contents: [{ parts: [{ text: systemPrompt }, { text: `Text to reformulate:\n"""\n${textData}\n"""` }] }],
        generationConfig: { temperature: 0.7 }
      });

      return res.status(200).json({ rewrittenText: (generatedText || textData).trim() });
    }

    // 3. ACTION: ENHANCE (Default: Bold emphasis)
    const contextMap = {
      summary: "this professional resume summary",
      experience: "this resume experience bullet point",
      projects: "this resume project description"
    };
    const targetContext = contextMap[contextType] || "this resume text";

    const systemPrompt = `Act as an expert technical resume writer.
I have written ${targetContext}, but I need to highlight the most impactful parts to pass ATS parsers and catch a recruiter's eye.

Please review the following text. Wrap the most important keywords, strong action verbs, and quantifiable metrics in markdown bold (**bold text**).
CRITICAL: DO NOT rewrite, add, or remove any words. Keep my exact phrasing and punctuation identical. ONLY add ** markdown characters around the parts that should be stressed.

Return ONLY the enhanced text. Do not add any conversational text.`;

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts: [{ text: systemPrompt }, { text: `Text to enhance:\n"""\n${textData}\n"""` }] }],
      generationConfig: { temperature: 0.1 }
    });

    return res.status(200).json({ enhancedText: (generatedText || textData).trim() });

  } catch (error) {
    console.error('Enhance API error:', error);
    return res.status(500).json({ error: 'Failed to process enhancement request.' });
  }
}
