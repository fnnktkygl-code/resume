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
    const { action = 'followup', companyName, jobTitle, type = 'followup', daysElapsed = 8, candidateName, context = '', practiceQuestion, userAnswer, resumeData, jobDescription, language = 'fr' } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY_MASTER is not defined' });
    }

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const { checkAndIncrementQuota } = await import('./_firebase.js');
    await checkAndIncrementQuota();

    // 1. FOLLOW-UP & THANK-YOU EMAIL GENERATOR
    if (action === 'followup') {
      const systemInstruction = `You are a career coach and professional communications expert.
Draft a concise, high-impact job search email for the candidate.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.followup}

Email Type to generate: ${type === 'thankyou' ? 'Post-interview Thank You note (within 24h of interview)' : 'Application Follow-Up (checking status after days of silence)'}.

Rules:
1. Candidate Name: ${candidateName || 'The Candidate'}
2. Target Company: ${companyName || 'The Company'}
3. Target Role: ${jobTitle || 'The Role'}
4. Days since application/interview: ${daysElapsed}
5. Tone: Polite, confident, highly professional, zero arrogance, zero desperation.
6. Max length: Under 140 words.
7. Return a JSON object with:
   - "subject": A clear, clickable email subject line
   - "body": The email body with greeting, paragraph(s), and clean sign-off
   - "tips": 2 short bullet tips for the candidate before hitting send.`;

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
      return res.status(200).json(JSON.parse(cleanedText));
    }

    // 2. MOCK INTERVIEW LIVE ANSWER EVALUATION
    if (action === 'evaluateMockAnswer') {
      const systemInstruction = `You are a tough, fair hiring manager and senior technical interviewer.
Evaluate the candidate's answer to the practice interview question.
Target Language for your critique: ${targetLang}.

Evaluate based on:
1. STAR method clarity (did they specify Situation, Task, Action, Measurable Result?).
2. Concreteness and avoidance of vague generalizations.
3. Relevance to the role (${jobTitle || 'Target Role'}) at ${companyName || 'the company'}.

Return a JSON object with:
- "score": number from 0 to 100
- "strengths": array of 2-3 specific things done well
- "improvements": array of 2-3 concrete actionable recommendations
- "improvedSampleAnswer": a rewritten high-impact STAR answer the candidate could deliver`;

      const jsonText = await callGeminiApi({
        apiKey,
        prompt: `Interview Question: "${practiceQuestion}"\nCandidate's Response: "${userAnswer}"\n\nTarget Job: ${jobTitle} at ${companyName}`,
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
      return res.status(200).json(JSON.parse(cleanedText));
    }

    // 3. INTERVIEW PREP PACK (STAR Questions & Bridge Answers)
    if (action === 'interviewPrep') {
      const systemInstruction = `You are an elite interview coach and executive recruiter (inspired by Harvard OCS & top tech talent bars).
Your mission is to generate a comprehensive, tailored Interview Preparation Pack for the candidate based on their exact CV and the target job description.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.interviewPrep}

Strict Requirements:
1. NEVER invent past experiences that do not exist in the candidate's CV data.
2. For behavioral questions, map each answer directly to real projects/accomplishments found in the candidate's CV data.
3. For missing skills, write radical truth "Bridge Answers" (acknowledge honestly, connect to adjacent known tech, prove fast ramp-up).
4. Output MUST be a valid JSON object matching the requested STAR structure.`;

      const jsonText = await callGeminiApi({
        apiKey,
        prompt: `Candidate Resume JSON:\n${JSON.stringify(resumeData || {})}\n\nJob Description:\n${jobDescription || ''}\n\nTarget Company: ${companyName || ''}\nTarget Role: ${jobTitle || ''}`,
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
      return res.status(200).json(JSON.parse(cleanedText));
    }

    // 4. UPSKILL & GAP ROADMAP
    if (action === 'upskill') {
      const systemInstruction = `You are an engineering career mentor and senior talent development advisor.
Your mission is to perform a gap analysis between the candidate's CV and the job description, and create an actionable Upskill & Learning Roadmap.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.upskill}

Requirements:
1. Identify all core hard technical skills, tools, frameworks, and methodologies required by the job that are missing or weak in the candidate's CV.
2. Group them by priority: Critical, Moderate, Low.
3. Provide realistic estimated hours, curated resources, and a practical mini-project idea.
4. Provide a 2-week fast-track study plan.
5. Return a valid JSON object.`;

      const jsonText = await callGeminiApi({
        apiKey,
        prompt: `Candidate Resume JSON:\n${JSON.stringify(resumeData || {})}\n\nTarget Job Description:\n${jobDescription || ''}\n\nCompany: ${companyName || ''}\nRole: ${jobTitle || ''}`,
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
      return res.status(200).json(JSON.parse(cleanedText));
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error) {
    console.error("CareerOpsAssist Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
