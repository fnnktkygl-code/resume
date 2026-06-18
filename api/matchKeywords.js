import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key not configured on server');
    }

    const { data, jobDescription, language = 'en' } = req.body;

    if (!data || !jobDescription) {
      return res.status(400).json({ error: 'Resume data and job description are required' });
    }

    // Extract text from CV to compare
    let resumeText = '';
    
    // Add Summary
    if (data.summary) resumeText += `Summary: ${data.summary}\n`;
    
    // Add Experience
    data.experience?.forEach(exp => {
      resumeText += `Title: ${exp.title} at ${exp.company}\n`;
      exp.bullets?.forEach(b => { resumeText += `- ${b}\n`; });
    });

    // Add Skills
    if (data.skills?.technical) resumeText += `Technical Skills: ${data.skills.technical}\n`;
    if (data.skills?.soft) resumeText += `Soft Skills: ${data.skills.soft}\n`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const langInstruction = language === 'fr' ? 'Réponds en Français.' : 
                            language === 'es' ? 'Responde en Español.' : 
                            'Respond in English.';

    const prompt = `
You are an expert ATS (Applicant Tracking System) Analyzer.
I will provide you with a Job Description and the parsed text of a candidate's Resume.

Your task is to analyze how well the Resume matches the Job Description based on keywords, skills, and qualifications.

Output a strictly valid JSON object with the following schema:
{
  "matchScore": <number between 0 and 100 representing the ATS match percentage>,
  "missingKeywords": <array of strings, listing exactly the important keywords/skills present in the Job Description but missing from the Resume>,
  "foundKeywords": <array of strings, listing the important keywords/skills that successfully matched>,
  "recommendation": <string, a short and actionable recommendation on how to improve the match score>
}

${langInstruction}

Job Description:
"""
${jobDescription}
"""

Resume Content:
"""
${resumeText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // The model should return valid JSON due to responseMimeType, but we parse it to be safe and return it
    const jsonResult = JSON.parse(responseText);

    res.status(200).json(jsonResult);
  } catch (error) {
    console.error('API Error (ATS Keywords):', error);
    res.status(500).json({ error: error.message || 'Failed to analyze keywords' });
  }
}
