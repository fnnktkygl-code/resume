import { callGeminiApi } from './_geminiFallback.js';
import { SCIENTIFIC_HR_RULES } from './_scientificPromptRules.js';

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

    const systemInstruction = `You are an elite executive resume writer and career coach specializing in prestigious, high-impact CVs.
Your task is to take a raw job task or experience description and transform it into 3 highly valorizing, authoritative, and ATS-optimized bullet points.
Target language: ${targetLang}.

${SCIENTIFIC_HR_RULES.bulletPoints}

Core Directives for Maximum Valorization:
1. START WITH STRONG ACTION VERBS: Begin every bullet point with an impactful, prestigious active verb in past/active tense (e.g., Conçu, Piloté, Déployé, Architecturé, Structuré, Optimisé, Dirigé, Négocié / Spearheaded, Architected, Engineered, Streamlined, Orchestrated). Never use weak phrases like "Responsable de", "Aidé à", "Travail sur".
2. HARVARD XYZ IMPACT FORMULA: Structure achievements naturally as "Accomplished [X] (Action & Scope) using [Z] (Tools & Methodology), resulting in [Y] (Quantified Impact or Value)". Metrics and outcomes should flow naturally within the sentence without awkward word-order restrictions.
3. THREE DISTINCT VALORIZING PERSPECTIVES:
   - Option 1 [Technical & Operational Mastery]: Focus on execution excellence, technical stack, architecture, and best practices.
   - Option 2 [Leadership, Process & Delivery]: Focus on coordination, project management, agility, and cross-functional impact.
   - Option 3 [Business Impact & Optimization]: Focus on efficiency gains, measurable performance, time/cost savings, and value delivered.
4. MAXIMUM RELEVANCE: Preserve all authentic details, context, and domain-specific terminology provided by the candidate. Elevate their contributions to sound authoritative and executive-level.
5. CONCISE: 1 to 2 lines per bullet point.
6. OUTPUT: Return EXACTLY a JSON array of 3 strings. Example: ["bullet 1", "bullet 2", "bullet 3"]. No markdown wrapping or conversational commentary.`;

    const promptText = `Raw Experience Description:
${experienceText}

Generate 3 prestigious, high-impact STAR/Harvard bullet points:`;

    const { checkAndIncrementQuota } = await import('./_firebase.js');
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
