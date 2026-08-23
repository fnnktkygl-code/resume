import { callGeminiApi } from './_geminiFallback.js';
import { SCIENTIFIC_HR_RULES } from './_scientificPromptRules.js';

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

  try {
    const { companyName, jobTitle, type = 'followup', daysElapsed = 8, candidateName, context = '', language = 'fr' } = req.body || {};

    if (!companyName || !jobTitle) {
      return res.status(400).json({ error: 'Missing companyName or jobTitle' });
    }

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY_MASTER is not defined' });
    }

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const systemInstruction = `You are a career coach and professional communications expert.
Draft a concise, high-impact job search email for the candidate.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.followup}

Email Type to generate: ${type === 'thankyou' ? 'Post-interview Thank You note (within 24h of interview)' : 'Application Follow-Up (checking status after days of silence)'}.

Rules:
1. Candidate Name: ${candidateName || 'The Candidate'}
2. Target Company: ${companyName}
3. Target Role: ${jobTitle}
4. Days since application/interview: ${daysElapsed}
5. Tone: Polite, confident, highly professional, zero arrogance, zero desperation.
6. Max length: Under 140 words.
7. Return a JSON object with:
   - "subject": A clear, clickable email subject line (e.g. "Candidature [Poste] - [Nom] / Relance suite à mon dossier")
   - "body": The email body with greeting, paragraph(s), and clean sign-off.
   - "tips": 2 short bullet tips for the candidate before hitting send.`;

    const { checkAndIncrementQuota } = await import('./_firebase.js');
    await checkAndIncrementQuota();

    const jsonText = await callGeminiApi({
      apiKey,
      prompt: `Generate the ${type} email. Context: ${context || 'Standard job application'}`,
      systemInstruction,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });

    let cleanedText = jsonText;
    if (jsonText.startsWith('```')) {
      cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    const result = JSON.parse(cleanedText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("GenerateFollowUp Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
