import { callGeminiApi } from './_geminiFallback.js';

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

  const { textData, contextType, language } = req.body;

  if (!textData) {
    res.status(400).json({ error: 'textData is required' });
    return;
  }

  try {
    await checkAndIncrementQuota();

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");

    const contextMap = {
      summary: "this professional resume summary",
      experience: "this resume experience description",
      projects: "this resume project description"
    };
    const targetContext = contextMap[contextType] || "this resume text";
    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const systemPrompt = `Act as an expert executive resume writer and career coach.
I have written ${targetContext}. Please rewrite and reformulate this text to make it much more professional, impactful, results-oriented, and ATS-optimized.
Use strong action verbs, concise phrasing, and quantifiable impact where appropriate.
Write the response in ${targetLang}.
Do NOT add any conversational introductory or concluding text. Return ONLY the rewritten text.`;

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts: [{ text: systemPrompt }, { text: `Text to reformulate:\n"""\n${textData}\n"""` }] }],
      generationConfig: {
        temperature: 0.7
      }
    });

    res.status(200).json({ rewrittenText: (generatedText || textData).trim() });
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    res.status(500).json({ error: 'Failed to rewrite text.' });
  }
}
