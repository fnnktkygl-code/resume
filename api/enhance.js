import { callGeminiApi } from './_geminiFallback.js';
import { normalizeResumeCasing } from './_normalizeCasing.js';

// Helper to preserve original IDs on array items after AI translation
function reconcileItemIds(origArr, translatedArr) {
  if (!Array.isArray(translatedArr) || !Array.isArray(origArr)) return translatedArr;
  return translatedArr.map((item, idx) => {
    const orig = origArr[idx];
    if (orig && typeof item === 'object' && item !== null) {
      const reconciled = { ...item, id: orig.id || item.id };
      if (Array.isArray(orig.items) && Array.isArray(item.items)) {
        reconciled.items = reconcileItemIds(orig.items, item.items);
      }
      return reconciled;
    }
    return item;
  });
}

export default async function handler(req, res) {
  const { checkAndIncrementQuota } = await import('./_firebase.js');

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

  const { action = 'enhance', textData, text, resumeData, sectionId, sectionData, contextType, language } = req.body || {};

  try {
    await checkAndIncrementQuota();

    const apiKey = process.env.GEMINI_API_KEY_MASTER;
    if (!apiKey) throw new Error("GEMINI_API_KEY_MASTER is missing in environment variables");

    const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

    // 1. ACTION: TRANSLATE SECTION
    if (action === 'translate_section' && sectionData !== undefined) {
      const sectionPrompt = `Act as an expert multilingual resume translator and technical recruiter.
Translate the following resume section into ${targetLang}.
CRITICAL RULES:
1. ONLY translate text values. Keep JSON keys intact.
2. Translate all job titles, degrees, fields of study, descriptions, bullet points, soft skills, language proficiencies (e.g. "Courant" -> "Fluent", "Langue maternelle" -> "Native"), and custom section titles/items.
3. Keep company names, institution proper names, and specific technology terms (e.g. React, Python, Docker) intact.
4. Preserve markdown bold markers (**text**) and bullet point structures.
5. Return ONLY valid JSON matching the exact schema of the input section data.`;

      const jsonText = await callGeminiApi({
        apiKey,
        prompt: `Section (${sectionId || 'section'}):\n${JSON.stringify(sectionData)}`,
        systemInstruction: sectionPrompt,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });

      let cleanedText = jsonText;
      if (jsonText.startsWith('```')) {
        cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      let translatedSection = JSON.parse(cleanedText);
      if (Array.isArray(sectionData) && Array.isArray(translatedSection)) {
        translatedSection = reconcileItemIds(sectionData, translatedSection);
      }
      return res.status(200).json({ translatedSection });
    }

    // 2. ACTION: TRANSLATE (Full Resume or Single Text)
    if (action === 'translate' || (!textData && (text || resumeData))) {
      if (text) {
        const systemPrompt = `Translate the following text into ${targetLang}. Keep the same tone and format, and preserve markdown bolding (**text**) or other markers. Respond ONLY with the translated text. Do not include any explanations.`;
        const generatedText = await callGeminiApi({
          apiKey,
          contents: [{ parts: [{ text: systemPrompt }, { text: `Text to translate:\n"""\n${text}\n"""` }] }],
          generationConfig: { temperature: 0.2 }
        });
        return res.status(200).json({ translatedText: (generatedText || '').trim() });
      }

      if (resumeData) {
        const cloneData = { ...resumeData };
        const systemPrompt = `Act as an elite executive resume translator and ATS optimization specialist.
You must translate ALL text values in this JSON resume into ${targetLang}.

MANDATORY RULES FOR COMPLETE AND ACCURATE TRANSLATION:
1. TRANSLATE ALL SECTIONS & FIELDS:
   - "personal": Translate "tagline" (job title), "location" (e.g. "Paris, France / Télétravail" -> "Paris, France / Remote"), and any "customFields" (labels and values). Do NOT change candidate name, email, phone, or URLs.
   - "summary": Translate the entire professional summary, preserving strong action verbs, metrics, and markdown bold markers (**bold**).
   - "experience": For each position, translate "title", "location", "startMonth" / "endMonth" (convert to standard target language 3-letter month: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec), relative dates (e.g. "Présent", "En cours" -> "Present", "Ongoing"), "bullets" (every single bullet point), "technologies" categories, and "description". Keep company names intact.
   - "education": Translate "degree", "fieldOfStudy" / "field", "location", dates ("startMonth", "endMonth", years), and any "bullets" or honors (e.g. "Mention Très Bien" -> "With Highest Honors"). Keep school proper names intact.
   - "skills":
     * "technical": Translate category labels (e.g. "Langages de programmation:" -> "Programming languages:", "Gestion de projet:" -> "Project management:") while preserving tech keywords.
     * "soft": Translate ALL soft skills (e.g. "Rigueur, Travail d'équipe, Curiosité" -> "Rigor, Teamwork, Curiosity").
     * "languages": Translate language names and levels (e.g. "Français (Langue maternelle), Anglais (Courant C1)" -> "French (Native), English (Fluent C1)").
   - "projects": Translate "role", "description", dates, and every single item in "highlights".
   - "certifications": Translate descriptive certification titles, dates, and issuers.
   - "customSections": Translate section "title" (or "label", e.g. "Langues", "Atouts", "Centres d'intérêt", "Bénévolat" -> "Languages", "Strengths", "Hobbies", "Volunteering") AND translate every item's "title", "subtitle", and "description".
   - "headings": Translate section heading titles to match standard ${targetLang} terminology (e.g. "Profil" -> "Summary", "Expériences Professionnelles" -> "Work Experience", "Formation" -> "Education", "Compétences" -> "Skills").
2. ABSOLUTELY DO NOT TRANSLATE JSON KEYS: Keys must remain strictly "personal", "summary", "experience", "education", "skills", "projects", "certifications", "customSections", "headings", "bullets", "title", "degree", etc.
3. PRESERVE MARKDOWN BOLDING: Keep all **bold words** appropriately placed in the translated text.
4. PRESERVE METRICS: Retain all numbers, percentages, and metrics ($X, Y, Z$).
5. DO NOT OMIT ANY SECTION: Output MUST contain every section and item present in the input JSON.`;

        const jsonText = await callGeminiApi({
          apiKey,
          prompt: `Resume JSON to translate into ${targetLang}:\n${JSON.stringify(cloneData)}`,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        });

        let cleanedText = jsonText;
        if (jsonText.startsWith('```')) {
          cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        }
        let translatedResume = JSON.parse(cleanedText);
        translatedResume = normalizeResumeCasing(translatedResume);

        // Reconcile IDs across all arrays so diff and merge match 100%
        if (cloneData.experience) translatedResume.experience = reconcileItemIds(cloneData.experience, translatedResume.experience);
        if (cloneData.education) translatedResume.education = reconcileItemIds(cloneData.education, translatedResume.education);
        if (cloneData.projects) translatedResume.projects = reconcileItemIds(cloneData.projects, translatedResume.projects);
        if (cloneData.certifications) translatedResume.certifications = reconcileItemIds(cloneData.certifications, translatedResume.certifications);
        if (cloneData.customSections) translatedResume.customSections = reconcileItemIds(cloneData.customSections, translatedResume.customSections);

        return res.status(200).json({ translatedResume });
      }
    }

    // 3. ACTION: REWRITE
    if (action === 'rewrite') {
      const contextMap = {
        summary: "this professional resume summary",
        experience: "this resume experience description",
        projects: "this resume project description"
      };
      const targetContext = contextMap[contextType] || "this resume text";

      const systemPrompt = `Act as an expert executive resume writer and career coach.
I have written ${targetContext}. Please rewrite and reformulate this text to make it much more professional, impactful, results-oriented, and ATS-optimized.
Use strong action verbs, concise phrasing, and quantifiable impact where appropriate.
Write the response in ${targetLang}.
Do NOT add any conversational introductory or concluding text. Return ONLY the rewritten text.`;

      const generatedText = await callGeminiApi({
        apiKey,
        contents: [{ parts: [{ text: systemPrompt }, { text: `Text to reformulate:\n"""\n${textData}\n"""` }] }],
        generationConfig: { temperature: 0.7 }
      });

      return res.status(200).json({ rewrittenText: (generatedText || textData).trim() });
    }

    // 4. ACTION: ENHANCE (Default: Bold emphasis)
    const contextMap = {
      summary: "this professional resume summary",
      experience: "this resume experience bullet point",
      projects: "this resume project description"
    };
    const targetContext = contextMap[contextType] || "this resume text";

    const systemPrompt = `Act as an expert technical resume writer.
I have written ${targetContext}, but I need to highlight the most impactful parts to pass ATS parsers and catch a recruiter's eye.

Please review the following text. Wrap the most important keywords, strong action verbs, and quantifiable metrics in markdown bold (**bold text**).
CRITICAL: DO NOT rewrite, add, or remove any words. Keep my exact phrasing and punctuation identical. ONLY add ** markdown characters around the parts that should be stressed.

Return ONLY the enhanced text. Do not add any conversational text.`;

    const generatedText = await callGeminiApi({
      apiKey,
      contents: [{ parts: [{ text: systemPrompt }, { text: `Text to enhance:\n"""\n${textData}\n"""` }] }],
      generationConfig: { temperature: 0.1 }
    });

    return res.status(200).json({ enhancedText: (generatedText || textData).trim() });

  } catch (error) {
    console.error('Enhance API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process enhancement request.' });
  }
}
