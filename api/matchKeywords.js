import { callGeminiApi } from './_geminiFallback.js';

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

    const { data, jobDescription, language = 'en' } = req.body;

    if (!data || !jobDescription) {
      return res.status(400).json({ error: 'Resume data and job description are required' });
    }

    // Extract text from CV to compare — ALL sections
    let resumeText = '';
    if (data.personal?.tagline) resumeText += `Title: ${data.personal.tagline}\n`;
    if (data.summary) resumeText += `Summary: ${data.summary}\n`;
    data.experience?.forEach(exp => {
      if (exp.isSpacer) return;
      resumeText += `Title: ${exp.title} at ${exp.company}\n`;
      exp.bullets?.forEach(b => { resumeText += `- ${b}\n`; });
    });
    data.education?.forEach(edu => {
      if (edu.isSpacer) return;
      resumeText += `Education: ${edu.degree || ''} ${edu.fieldOfStudy || ''} at ${edu.institution || ''}\n`;
    });
    data.projects?.forEach(proj => {
      if (proj.isSpacer) return;
      resumeText += `Project: ${proj.name || ''}\n`;
      if (proj.description) resumeText += `${proj.description}\n`;
      proj.highlights?.forEach(h => { resumeText += `- ${h}\n`; });
    });
    data.certifications?.forEach(cert => {
      if (cert.isSpacer) return;
      resumeText += `Certification: ${cert.name || ''} - ${cert.issuer || ''}\n`;
    });
    if (data.skills?.technical) resumeText += `Technical Skills: ${data.skills.technical}\n`;
    if (data.skills?.soft) resumeText += `Soft Skills: ${data.skills.soft}\n`;
    if (data.skills?.languages) resumeText += `Languages: ${data.skills.languages}\n`;
    data.customSections?.forEach(sec => {
      resumeText += `${sec.label || 'Custom'}: `;
      sec.items?.forEach(item => {
        if (item.isSpacer) return;
        resumeText += `${item.title || ''} ${item.subtitle || ''} ${item.description || ''}, `;
      });
      resumeText += '\n';
    });

    const langInstruction = language === 'fr' ? 'Réponds en Français.' : 
                            language === 'es' ? 'Responde en Español.' : 
                            'Respond in English.';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `
You are an advanced, domain-agnostic ATS (Applicant Tracking System) Analyzer and Technical Recruiter.
Your objective is to analyze a Job Description against a Candidate's Resume to evaluate technical and domain fit.

CRITICAL KEYWORD EXTRACTION & MATCHING RULES:
1. FOCUS EXCLUSIVELY ON HARD SKILLS, TECHNICAL TOOLS, METHODOLOGIES & SPECIFIC QUALIFICATIONS:
   - Specific software, programming languages, platforms, & tools (e.g., Python, Power BI, SQL, SCADA, GMAO, Jira, Excel, Salesforce, AutoCAD, Figma, AWS, SAP, etc.)
   - Domain-specific expertise, frameworks, & techniques (e.g., Machine Learning, Maintenance prédictive, Data Analytics, Performance énergétique, Stockage d'énergie, Génie industriel, Audit financier, Design System, etc.)
   - Specific degrees, certifications, or mandatory qualifications (e.g., Bac +5, Master, PMP, CFA, Anglais professionnel, etc.)

2. STRICTLY IGNORE AND EXCLUDE GENERAL BOILERPLATE & MARKETING NOISE:
   - DO NOT extract company values, mission statements, culture/marketing fluff, or intro text (e.g., "avenir durable", "construisons", "transition", "esprit d'équipe", "entreprise dynamique", "cadre agréable", "passionné", "opportunité", "rejoindre", "présents dans N pays").
   - DO NOT extract generic action verbs or common nouns (e.g., "développer", "contribuer", "assurer", "missions", "poste", "candidat", "activités").

3. FAIR MATCHING & DEDUPLICATION:
   - Check ALL sections of the Resume (Summary, Title, Experience bullets, Skills, Education, Projects, Custom Sections).
   - If a technical skill or tool appears ANYWHERE in the Resume (even if phrased slightly differently, e.g. "Excel" vs "Excel avancé", "Power BI" vs "PowerBI", "Master" vs "Bac +5"), classify it as FOUND.
   - "missingKeywords" must ONLY include crucial technical/domain skills or tools present in the Job Description that are ACTUALLY MISSING from the Resume.

4. ACCURATE SCORING & ACTIONABLE RECOMMENDATION:
   - Calculate "matchScore" (0-100) based strictly on the ratio of required technical skills/qualifications matched.
   - Provide a concise, 1-2 sentence recommendation in the requested language focusing on the most critical missing technical skills to add.

5. STABILITY & PERFECT MATCH RECOGNITION:
   - If the candidate's resume ALREADY contains all key technical tools, certifications, and hard skills mentioned in the Job Description, set "missingKeywords": [] (empty array) and "matchScore": 98-100.
   - Do NOT invent missing keywords if the candidate's profile is already fully qualified and aligned.

Output a strictly valid JSON object with the following schema:
{
  "matchScore": <number between 0 and 100>,
  "missingKeywords": <array of strings, empty array [] if resume is already well-aligned>,
  "foundKeywords": <array of strings, matched technical/hard skills or tools>,
  "recommendation": <string, short actionable advice in the target language>
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

    const jsonText = await callGeminiApi({
      apiKey,
      prompt,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(jsonText);
    res.status(200).json(result);
  } catch (error) {
    console.error('API Error (Match Keywords):', error);
    res.status(500).json({ error: error.message || 'Failed to match keywords' });
  }
}
