import { callGeminiApi } from './_geminiFallback.js';
import { SCIENTIFIC_HR_RULES } from './_scientificPromptRules.js';

export default async function handler(req, res) {
  const { checkAndIncrementQuota } = await import('./firebase.js');

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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY_MASTER is missing in environment variables');
    }

    await checkAndIncrementQuota();

    const { data, jobDescription, language = 'en', useSearchGrounding = false, companyName = '', tone = 'Professional', clLength = 'Standard', targetRole = '' } = req.body;

    if (!data || !jobDescription) {
      return res.status(400).json({ error: 'Resume data and job description are required' });
    }

    let resumeText = '';
    const today = new Date();
    const formattedDate = today.toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );

    if (data.personal) {
      if (data.personal.name) resumeText += `Candidate Name: ${data.personal.name}\n`;
      if (data.personal.location) resumeText += `Address/City: ${data.personal.location}\n`;
      if (data.personal.email) resumeText += `Email: ${data.personal.email}\n`;
      if (data.personal.phone) resumeText += `Phone: ${data.personal.phone}\n`;
    }
    resumeText += `Today's Date: ${formattedDate}\n`;

    if (data.summary) resumeText += `Summary: ${data.summary}\n`;
    data.experience?.forEach(exp => {
      resumeText += `Experience: ${exp.title} at ${exp.company}\n`;
      exp.bullets?.forEach(b => { resumeText += `- ${b}\n`; });
    });
    data.education?.forEach(edu => {
      resumeText += `Education: ${edu.degree} at ${edu.institution}\n`;
    });
    if (data.skills?.technical) resumeText += `Technical Skills: ${data.skills.technical}\n`;
    if (data.skills?.soft) resumeText += `Soft Skills: ${data.skills.soft}\n`;

    const langInstruction = language === 'fr' ? 'Écris la lettre de motivation en Français.' : 
                            language === 'es' ? 'Escribe la carta de presentación en Español.' : 
                            'Write the cover letter in English.';

    let lengthInstruction = '3. STRICT WORD COUNT: Keep the cover letter concise, punchy, and UNDER 300 WORDS across 3-4 paragraphs.';
    if (clLength === 'Concise') {
      lengthInstruction = '3. STRICT WORD COUNT: Keep it extremely concise and punchy (under 150 words). Get straight to the point.';
    } else if (clLength === 'Detailed') {
      lengthInstruction = '3. STRICT WORD COUNT: Provide a detailed and comprehensive cover letter (around 350-450 words) that deeply explores the alignment between the candidate\'s experience and the company\'s needs.';
    }

    let toneInstruction = '';
    if (tone && tone !== 'Professional') {
      toneInstruction = `7. TONE AND STYLE: You must write this cover letter using the following tone/style: "${tone}". Adopt this persona completely, but still weave in the candidate's actual skills.`;
    }

    let targetRoleInstruction = '';
    if (targetRole) {
      targetRoleInstruction = `Target Role: ${targetRole}\n`;
    }

    let prompt = `
You are an expert career coach and elite professional copywriter.
I will provide you with a Job Description and the parsed text of a candidate's Resume.
Your task is to write a highly professional, tailored, and persuasive Cover Letter for the candidate applying to this job.

${SCIENTIFIC_HR_RULES.coverLetter}

Core Instructions:
1. Make sure to map the candidate's actual experience from their Resume to the requirements in the Job Description.
2. SENDER HEADER, DATE & SUBJECT: Start the letter directly with the candidate's ACTUAL personal contact information provided below. Then, include TODAY'S DATE (${formattedDate}). Then, you MUST include a formal 'Subject' or 'Objet' line stating the position applied for (e.g., "Objet : Candidature au poste de [Job Title]"). NEVER write a generic title like "Cover Letter:" or "Lettre de motivation:" at the top. NEVER use generic placeholders like '[Your Name]', '[Your Address]', '[City, State]', '[Phone Number]', '[Email Address]', or '[Date]'. Insert candidate details directly into the header block.
${lengthInstruction}
4. Output ONLY the cover letter text, properly formatted using Markdown. Do not include any meta-commentary.
5. NO PLACEHOLDERS: NEVER use placeholders like "[cite: votre CV]", "[Insert Company Name]", or any other brackets. You must weave the candidate's actual details seamlessly into the text. If you don't have specific data, rephrase the sentence naturally instead of leaving a placeholder.
6. ${langInstruction}
${toneInstruction}

Job Description:
"""
${targetRoleInstruction}${jobDescription}
"""

Resume Content & Candidate Details:
"""
${resumeText}
"""
`;

    if (useSearchGrounding) {
      prompt += `\nSEARCH GROUNDING INSTRUCTION: Use Google Search Grounding to research real-time facts about the target company (${companyName || 'specified in the job description'}), such as recent company developments, core products, mission, or culture, and subtly weave these real insights into the letter.`;
    }

    const tools = useSearchGrounding ? [{ googleSearch: {} }] : undefined;

    const generatedText = await callGeminiApi({
      apiKey,
      prompt,
      tools,
      generationConfig: {
        temperature: 0.7
      }
    });

    res.status(200).json({ coverLetter: generatedText });
  } catch (error) {
    console.error('API Error (Cover Letter):', error);
    res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
  }
}
