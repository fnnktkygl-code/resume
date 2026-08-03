import { callGeminiApi } from './_geminiFallback.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY_MASTER;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
  }

  try {
    const { experienceText, language } = req.body;

    if (!experienceText) {
      return res.status(400).json({ error: 'Missing experience text.' });
    }

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const systemInstruction = `You are an expert career coach and ATS resume optimizer.
Your task is to take a raw job experience description and generate 3 highly impactful, ATS-optimized bullet points using the STAR method (Situation, Task, Action, Result).
Target language: ${targetLang}.

Rules:
1. Each bullet point must be concise (max 2 lines).
2. Start each bullet point with a strong action verb.
3. Quantify results where possible or frame the impact clearly.
4. Output EXACTLY a JSON array of 3 strings. Example: ["bullet 1", "bullet 2", "bullet 3"]
5. Do NOT output markdown, backticks, or any conversational text. Just the raw JSON array.`;

    const promptText = `Experience Description:
${experienceText}

Generate 3 optimized STAR bullet points:`;

    const { checkAndIncrementQuota } = await import('./firebase.js');
    await checkAndIncrementQuota();

    const generatedText = await callGeminiApi({
      apiKey,
      prompt: promptText,
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const bulletPoints = JSON.parse(generatedText);
    return res.status(200).json({ bulletPoints });

  } catch (error) {
    console.error('API /generateBulletPoints Error:', error);
    return res.status(500).json({ error: 'An error occurred while generating bullet points.' });
  }
}
