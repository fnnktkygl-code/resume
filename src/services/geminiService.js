/**
 * Attempts to tailor the resume using the secure Vercel Serverless Function proxy.
 * This uses the platform's default API key.
 * Throws a specific 'QUOTA_EXCEEDED' error if the platform key has run out of quota.
 */
export const tailorResumeWithProxy = async (resumeData, jobDescription, language) => {
  try {
    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeData, jobDescription, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        const err = new Error('QUOTA_EXCEEDED');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      throw new Error(data.message || data.error || 'Failed to connect to secure server.');
    }

    return data.tailoredResume;
  } catch (error) {
    console.error("Proxy Function Error:", error);
    throw error;
  }
};

/**
 * Direct API call to Gemini (Bring Your Own Key).
 * Used as a fallback when the platform quota is exhausted.
 */
export const tailorResumeWithDirectApi = async (apiKey, resumeData, jobDescription, language) => {
  const targetLang = language === 'fr' ? 'French' : 'English';
  
  const cloneData = { ...resumeData };
  delete cloneData.headings;

  const systemInstruction = `Act as an expert technical recruiter and ATS optimization specialist. 
Your task is to tailor the provided JSON resume to match the provided Job Description.
Target Language for the content: ${targetLang}.

Rules:
1. Emphasize skills and experiences that align with the job description.
2. Rewrite bullet points using strong action verbs relevant to the job requirements.
3. Do NOT invent new facts, degrees, or jobs that are not in the original resume.
4. Maintain a highly professional tone.
5. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.`;

  const promptText = `
### JOB DESCRIPTION
${jobDescription}

### ORIGINAL RESUME (JSON)
${JSON.stringify(cloneData)}

Output the fully optimized and tailored resume as a valid JSON object.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: "application/json",
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to call Gemini API');
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini');
    }
    
    const jsonText = candidate.content.parts[0].text;
    const tailoredResume = JSON.parse(jsonText);
    
    if (resumeData.headings) {
        tailoredResume.headings = resumeData.headings;
    }
    
    return tailoredResume;
  } catch (error) {
    console.error("Gemini Direct API Error:", error);
    throw error;
  }
};
