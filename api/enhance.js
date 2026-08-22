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

  const { textData, contextType } = req.body;

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
      generationConfig: {
        temperature: 0.1
      }
    });

    res.status(200).json({ enhancedText: generatedText.trim() });

  } catch (error) {
    console.error('Enhance API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
