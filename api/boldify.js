import { normalizeResumeCasing } from './_normalizeCasing.js';
import { callGeminiApi } from './_geminiFallback.js';
import { SCIENTIFIC_HR_RULES } from './_scientificPromptRules.js';

// Lightweight skill parser (mirrors src/utils/formatText.jsx parseSkillsToTags)
function parseSkillsToTags(skillsString) {
  if (!skillsString) return [];
  const groups = skillsString.split(';');
  const tags = [];
  for (const group of groups) {
    let cleaned = group.trim();
    if (!cleaned) continue;
    cleaned = cleaned.replace(/^[^:,;]{1,40}\s*:\s*/, '');
    for (const item of cleaned.split(',')) {
      const tag = item.replace(/\*\*/g, '').trim();
      if (tag) tags.push(tag);
    }
  }
  return tags;
}

export default async function handler(req, res) {
  const { checkAndIncrementQuota } = await import('./firebase.js');

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

  const { resumeData, coverLetter, jobDescription: clJobDescription } = req.body;

  // --- Cover Letter Boldify Mode ---
  if (coverLetter) {
    try {
      await checkAndIncrementQuota();
      const apiKey = process.env.GEMINI_API_KEY_MASTER;
      if (!apiKey) throw new Error("GEMINI_API_KEY_MASTER is missing");

      const clPrompt = `You are a text formatter for cover letters. Your ONLY job is to add markdown bold markers (**) around the most impactful keywords and phrases.

ABSOLUTE RULES:
1. TEXT PRESERVATION IS SACRED: Do NOT change, rewrite, rephrase, translate, reorder, add, or remove ANY word. Only insert ** markers.
2. WHAT TO BOLD (be strategic, 1-3 terms per paragraph):
   - Strong action verbs (développé, piloté, managed, led, achieved...)
   - Named technologies and tools (Python, Agile, SAP, Power BI...)
   - Quantifiable results (+30%, 50 collaborateurs, €2M budget...)
   - Domain-specific terms matching the job requirements
3. BE MINIMALIST: Bold individual words or short terms only (1-3 words max per bold span).
4. PRESERVE all line breaks, spacing, and structure exactly as-is.
${clJobDescription ? `5. Prioritize bolding terms relevant to: """${clJobDescription}"""` : ''}

SELF-CHECK: Strip all ** from output. Plain text must be identical to input.
Return ONLY the formatted cover letter text.`;

      const generatedText = await callGeminiApi({
        apiKey,
        contents: [{ parts: [{ text: clPrompt }, { text: `Cover Letter:\n${coverLetter}` }] }],
        generationConfig: { temperature: 0.05 }
      });

      let cleanedText = generatedText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

      // Validate: stripped text should be close to original length
      const stripped = cleanedText.replace(/\*\*/g, '');
      if (stripped.trim().length < coverLetter.trim().length * 0.8) {
        return res.status(200).json({ boldedCoverLetter: coverLetter });
      }

      return res.status(200).json({ boldedCoverLetter: cleanedText });
    } catch (error) {
      console.error('Boldify Cover Letter error:', error);
      return res.status(500).json({ error: error.message || 'Failed to boldify cover letter' });
    }
  }

  // --- Resume Boldify Mode ---
  if (!resumeData) {
    res.status(400).json({ error: 'resumeData or coverLetter is required' });
    return;
  }

  try {
    await checkAndIncrementQuota();

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");

    const rawClone = { ...resumeData };
    delete rawClone.headings;
    // Normalize ALL CAPS to sentence case BEFORE sending to AI
    const cloneData = normalizeResumeCasing(rawClone);

    // Keep skills in the payload but strip highlightedSkills to avoid bias
    const originalSkills = cloneData.skills ? { ...cloneData.skills } : null;
    if (cloneData.skills) {
      delete cloneData.skills.highlightedSkills;
    }

    const systemPrompt = `You are a text formatter. Your ONLY job is to add markdown bold markers (**) around important keywords in a JSON resume, AND to identify which technical/soft skills are most relevant.

${SCIENTIFIC_HR_RULES.boldify}

ABSOLUTE RULES — VIOLATION OF ANY RULE IS A CRITICAL FAILURE:

1. TEXT PRESERVATION IS SACRED: You must NOT change, rewrite, rephrase, translate, reorder, add, or remove ANY word, punctuation, or character. The ONLY characters you may insert are ** (double asterisks) to create markdown bold. If the original says "Wind Sector Management, Noise Regulation, Bat Protection" then your output MUST contain "**Wind Sector Management**, **Noise Regulation**, **Bat Protection**" — the exact same words with ** around them.

2. PROCESS EVERY SECTION: You MUST apply bolding to ALL experience entries, ALL project entries, ALL education entries, ALL customSections items (such as Atouts, Loisirs, Languages — bold key terms in item.title, item.subtitle, and item.description), the summary, AND the personal.tagline (professional title/slogan). Do NOT skip any section or entry.

3. WHAT TO BOLD: Bold 1-3 key terms per bullet point / item title:
   - Strong action verbs (Développement, Conception, Analyse, Optimisation, Mise en place...)
   - Named technologies and tools (Python, Power BI, SCADA, Node.js, MongoDB, Amplitude, T-SQL...)
   - Quantifiable metrics and numbers (50MW, +15%, 8 tableaux de bord...)
   - Domain-specific named terms (Wind Sector Management, Noise Regulation, Resolution de probleme...)

4. BE MINIMALIST: Do NOT bold entire sentences or long phrases. Bold individual words or short technical terms only (1-3 words max per bold span).

5. JSON STRUCTURE: Return the EXACT same JSON structure. Do NOT modify keys. Do NOT add or remove fields.

6. SKILL HIGHLIGHTING: Analyze the resume content (experience, projects, summary) and identify which skills from the "skills.technical" and "skills.soft" fields are MOST relevant and impactful — the ones a recruiter would look for. Return these as a NEW field "highlightedSkills" which is an array of lowercase skill names (exact matches from the skills fields). Select approximately 40-60% of the most relevant skills. Do NOT modify the skills.technical or skills.soft text — only add the highlightedSkills array.

SELF-CHECK BEFORE RETURNING: For every bullet point, mentally strip all ** markers from your output. The resulting plain text MUST be character-for-character identical to the original input. If it is not, you have made an error — fix it.`;

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts: [{ text: systemPrompt }, { text: `Resume Data:\n${JSON.stringify(cloneData)}` }] }],
      generationConfig: {
        temperature: 0.05,
        responseMimeType: "application/json"
      }
    });
    
    if (!generatedText) throw new Error("No response generated by Gemini");

    const jsonResponse = JSON.parse(generatedText);
    
    // --- POST-PROCESSING VALIDATION ---
    // Strip ** markers and compare against original. If text was modified, revert to original.
    const stripBold = (str) => (typeof str === 'string' ? str.replace(/\*\*/g, '') : str);
    
    // Validate and fix a string field: if stripping bold doesn't match normalized original, revert to normalized original
    const validateField = (boldedValue, normalizedOriginalValue) => {
      if (typeof boldedValue !== 'string' || typeof normalizedOriginalValue !== 'string') return normalizedOriginalValue;
      const strippedBolded = stripBold(boldedValue).trim();
      const strippedOriginal = stripBold(normalizedOriginalValue).trim();
      if (strippedBolded !== strippedOriginal) {
        // AI modified the content — revert to normalized original (no bold, but casing fixed)
        return normalizedOriginalValue;
      }
      return boldedValue;
    };

    // Validate summary
    if (jsonResponse.summary && cloneData.summary) {
      jsonResponse.summary = validateField(jsonResponse.summary, cloneData.summary);
    }

    // Validate personal.tagline
    if (jsonResponse.personal?.tagline && cloneData.personal?.tagline) {
      jsonResponse.personal.tagline = validateField(jsonResponse.personal.tagline, cloneData.personal.tagline);
    }

    // Validate experience bullets
    if (Array.isArray(jsonResponse.experience) && Array.isArray(cloneData.experience)) {
      for (let i = 0; i < jsonResponse.experience.length && i < cloneData.experience.length; i++) {
        const boldedExp = jsonResponse.experience[i];
        const origExp = cloneData.experience[i];
        if (boldedExp.title && origExp.title) boldedExp.title = validateField(boldedExp.title, origExp.title);
        if (boldedExp.company && origExp.company) boldedExp.company = validateField(boldedExp.company, origExp.company);
        if (Array.isArray(boldedExp.bullets) && Array.isArray(origExp.bullets)) {
          for (let j = 0; j < boldedExp.bullets.length && j < origExp.bullets.length; j++) {
            boldedExp.bullets[j] = validateField(boldedExp.bullets[j], origExp.bullets[j]);
          }
        }
        if (boldedExp.technologies && origExp.technologies) boldedExp.technologies = validateField(boldedExp.technologies, origExp.technologies);
      }
    }

    // Validate projects
    if (Array.isArray(jsonResponse.projects) && Array.isArray(cloneData.projects)) {
      for (let i = 0; i < jsonResponse.projects.length && i < cloneData.projects.length; i++) {
        const boldedProj = jsonResponse.projects[i];
        const origProj = cloneData.projects[i];
        if (boldedProj.description && origProj.description) boldedProj.description = validateField(boldedProj.description, origProj.description);
        if (Array.isArray(boldedProj.highlights) && Array.isArray(origProj.highlights)) {
          for (let j = 0; j < boldedProj.highlights.length && j < origProj.highlights.length; j++) {
            boldedProj.highlights[j] = validateField(boldedProj.highlights[j], origProj.highlights[j]);
          }
        }
      }
    }

    // Validate customSections
    if (Array.isArray(jsonResponse.customSections) && Array.isArray(cloneData.customSections)) {
      for (let i = 0; i < jsonResponse.customSections.length && i < cloneData.customSections.length; i++) {
        const boldedSec = jsonResponse.customSections[i];
        const origSec = cloneData.customSections[i];
        if (Array.isArray(boldedSec.items) && Array.isArray(origSec.items)) {
          for (let j = 0; j < boldedSec.items.length && j < origSec.items.length; j++) {
            const boldedItem = boldedSec.items[j];
            const origItem = origSec.items[j];
            if (boldedItem.title && origItem.title) boldedItem.title = validateField(boldedItem.title, origItem.title);
            if (boldedItem.subtitle && origItem.subtitle) boldedItem.subtitle = validateField(boldedItem.subtitle, origItem.subtitle);
            if (boldedItem.description && origItem.description) boldedItem.description = validateField(boldedItem.description, origItem.description);
          }
        }
      }
    }

    if (resumeData.headings) {
      jsonResponse.headings = resumeData.headings;
    }

    // Restore original skills text (unbolded) but keep AI-identified highlightedSkills
    if (originalSkills) {
      // Validate highlightedSkills: only keep skills that actually exist in the original data
      const allSkillsLower = [
        ...parseSkillsToTags(originalSkills.technical || ''),
        ...parseSkillsToTags(originalSkills.soft || ''),
      ].map(s => s.toLowerCase().trim());

      const aiHighlighted = Array.isArray(jsonResponse.highlightedSkills) 
        ? jsonResponse.highlightedSkills.filter(s => typeof s === 'string' && allSkillsLower.includes(s.toLowerCase().trim()))
        : [];

      jsonResponse.skills = {
        ...originalSkills,
        highlightedSkills: aiHighlighted.map(s => s.toLowerCase().trim())
      };
    }

    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('Boldify API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
