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
    const { action = 'generatePack', resumeData, jobDescription, companyName, jobTitle, practiceQuestion, userAnswer, language = 'fr' } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY_MASTER is not defined' });
    }

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    const { checkAndIncrementQuota } = await import('./_firebase.js');
    await checkAndIncrementQuota();

    if (action === 'evaluateAnswer') {
      // Mock Interview Live Evaluation
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

    // Default action: generatePack
    const systemInstruction = `You are an elite interview coach and executive recruiter (inspired by Harvard OCS & top tech talent bars).
Your mission is to generate a comprehensive, tailored Interview Preparation Pack for the candidate based on their exact CV and the target job description.
Target Language: ${targetLang}.

${SCIENTIFIC_HR_RULES.interviewPrep}

Strict Requirements:
1. NEVER invent past experiences that do not exist in the candidate's CV data.
2. For behavioral questions, map each answer directly to real projects/accomplishments found in the candidate's CV data.
3. For missing skills, write radical truth "Bridge Answers" (acknowledge honestly, connect to adjacent known tech, prove fast ramp-up).
4. Output MUST be a valid JSON object with the following structure:
{
  "summary": "Brief 2-sentence strategy on how the candidate should position themselves for this company/role",
  "behavioralQuestions": [
    {
      "id": "b1",
      "question": "Question text...",
      "mappedCvExperience": "Specific company/role from the CV",
      "starAnswer": {
        "situation": "...",
        "task": "...",
        "action": "...",
        "result": "..."
      },
      "proTip": "Advice on delivery"
    }
  ],
  "technicalQuestions": [
    {
      "id": "t1",
      "question": "Technical / Domain question...",
      "keyConceptsToMention": ["Concept 1", "Concept 2"],
      "suggestedResponseOutline": "How to structure the answer...",
      "trapToAvoid": "Common mistake"
    }
  ],
  "bridgeAnswers": [
    {
      "id": "gap1",
      "missingSkill": "Tool or skill from job offer missing from CV",
      "adjacentSkill": "Closest technology the candidate already knows from CV",
      "scriptedBridgeAnswer": "Exact wording to answer: 'I haven't used X in production yet, however I have deep mastery of Y...'",
      "rampUpPlan": "Concrete proof of quick learning"
    }
  ],
  "reverseQuestionsToAsk": [
    {
      "id": "q1",
      "question": "Smart question to ask the interviewer...",
      "objective": "What this reveals to the interviewer"
    }
  ]
}`;

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
    const result = JSON.parse(cleanedText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("GenerateInterviewPrep Function Error:", error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' });
  }
}
