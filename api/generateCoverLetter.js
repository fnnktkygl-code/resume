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

    let resumeText = '';
    if (data.personal) {
      resumeText += `Name: ${data.personal.name}\nEmail: ${data.personal.email}\nPhone: ${data.personal.phone}\n`;
    }
    if (data.summary) resumeText += `Summary: ${data.summary}\n`;
    data.experience?.forEach(exp => {
      resumeText += `Experience: ${exp.title} at ${exp.company}\n`;
      exp.bullets?.forEach(b => { resumeText += `- ${b}\n`; });
    });
    data.education?.forEach(edu => {
      resumeText += `Education: ${edu.degree} at ${edu.institution}\n`;
    });
    if (data.skills?.technical) resumeText += `Technical Skills: ${data.skills.technical}\n`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { temperature: 0.7 } });

    const langInstruction = language === 'fr' ? 'Écris la lettre de motivation en Français.' : 
                            language === 'es' ? 'Escribe la carta de presentación en Español.' : 
                            'Write the cover letter in English.';

    const prompt = `
You are an expert career coach and professional copywriter.
I will provide you with a Job Description and the parsed text of a candidate's Resume.
Your task is to write a highly professional, tailored, and persuasive Cover Letter for the candidate applying to this job.

Instructions:
1. Make sure to map the candidate's actual experience from their Resume to the requirements in the Job Description.
2. The letter should have a professional format (sender info, date, recipient info, salutation, body paragraphs, closing, sign-off).
3. Do not invent fake experience. If the candidate lacks a specific skill, focus on their transferable skills.
4. Output ONLY the cover letter text, properly formatted using Markdown. Do not include any meta-commentary.
5. ${langInstruction}

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

    res.status(200).json({ coverLetter: responseText });
  } catch (error) {
    console.error('API Error (Cover Letter):', error);
    res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
  }
}
