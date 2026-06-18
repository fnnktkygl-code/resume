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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
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
  const targetLang = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';
  
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
5. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input resume JSON.
6. STRICT PAGE BUDGET & OVERFLOW PREVENTION: The tailored content must fit cleanly on either exactly 1 page or exactly 2 pages. Avoid creating length that overflows by just a few lines onto a new page (e.g. 1.1 pages or 2.1 pages).
   - If the input resume is short, keep bullet points short and limit them to 2-3 per experience to guarantee it fits on exactly 1 page.
   - If the input resume is longer, keep bullet points short and limit them to 3-4 per experience to guarantee it fits on exactly 2 pages, and never overflows to page 3.
   - Every bullet point must be concise, direct, and under 2 lines.`;

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
    
    // Preserve Original Headings
    if (resumeData.headings) {
        tailoredResume.headings = resumeData.headings;
    }
    return tailoredResume;
  } catch (error) {
    console.error('Direct AI Tailoring Error:', error);
    throw error;
  }
};

export const analyzeResumeWithProxy = async (resumeData, language) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        language
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'QUOTA_EXCEEDED') {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return data.tips;
  } catch (error) {
    console.error('AI Analyze Proxy Error:', error);
    throw error;
  }
};

export const translateWithProxy = async (resumeData, language) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, language }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'QUOTA_EXCEEDED') throw new Error('API quota exceeded. Please try again later.');
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }
    
    return data;
  } catch (error) {
    console.error('AI Translate Proxy Error:', error);
    throw error;
  }
};

export const enhanceWithProxy = async (textData, contextType) => {
  try {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textData, contextType }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'QUOTA_EXCEEDED') throw new Error('API quota exceeded. Please try again later.');
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }
    
    return data.enhancedText;
  } catch (error) {
    console.error('AI Enhance Proxy Error:', error);
    throw error;
  }
};

/**
 * Parses raw text or Base64 PDF from a file into the internal Resume JSON format
 * via the secure Vercel Serverless Function proxy.
 */
export const importResumeWithProxy = async ({ text, base64Data, mimeType }) => {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, base64Data, mimeType }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error("L'API locale n'est pas disponible. Pour tester l'IA en local, vous devez utiliser 'npx vercel dev' au lieu de 'npm run dev', ou tester directement sur votre version déployée.");
    }

    if (!response.ok) {
      if (response.status === 429 || (data && data.error === 'QUOTA_EXCEEDED')) {
        const err = new Error('QUOTA_EXCEEDED');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      throw new Error((data && (data.message || data.error)) || 'Failed to parse resume.');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return data.parsedResume;
  } catch (error) {
    console.error("Proxy Import Error:", error);
    throw error;
  }
};

/**
 * Translates a single text string using the secure Vercel Serverless Function proxy.
 */
export const translateTextWithProxy = async (text, language) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        const err = new Error('QUOTA_EXCEEDED');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      throw new Error(data.message || data.error || 'Failed to translate text.');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return data.translatedText;
  } catch (error) {
    console.error("Proxy Text Translation Error:", error);
    throw error;
  }
};

/**
 * Applies AI Smart Bolding to the entire resume via the secure Vercel Serverless Function proxy.
 */
export const boldifyResumeWithProxy = async (resumeData) => {
  try {
    const response = await fetch('/api/boldify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeData }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        const err = new Error('QUOTA_EXCEEDED');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      throw new Error(data.message || data.error || 'Failed to boldify resume.');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return data;
  } catch (error) {
    console.error("Proxy Boldify Error:", error);
    throw error;
  }
};

/**
 * Direct API call to Gemini (Bring Your Own Key) to apply AI Smart Bolding to the entire resume.
 */
export const boldifyResumeWithDirectApi = async (apiKey, resumeData) => {
  const cloneData = { ...resumeData };
  delete cloneData.headings;

  const systemInstruction = `Act as an expert technical recruiter and ATS optimization specialist. 
Your task is to apply AI Smart Bolding to the text values inside the provided JSON resume.

CRITICAL RULES:
1. ONLY add markdown bold (**bold text**) around the most important keywords, strong action verbs, and quantifiable metrics.
2. DO NOT change, rewrite, or translate any words. The spelling, grammar, phrasing, and punctuation of the original text must remain 100% identical. Only inject ** characters around existing words.
3. BE EXTREMELY MINIMALIST. Only bold 1-3 key terms per sentence or bullet point. Do not bold long phrases. Avoid bolding too many things.
4. DO NOT modify the JSON keys (e.g. keep "company", "title", "bullets", "summary", etc. exactly as they are).
5. Maintain all bullet point structures and JSON layout exactly identical.
6. The output MUST be a valid JSON object matching the EXACT SAME SCHEMA as the input.`;

  const promptText = `
### ORIGINAL RESUME (JSON)
${JSON.stringify(cloneData)}

Output the fully optimized resume with minimalist bolding as a valid JSON object.
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
      temperature: 0.1,
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to call Gemini API');
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini');
    }
    
    const jsonText = candidate.content.parts[0].text;
    const boldedResume = JSON.parse(jsonText);
    
    if (resumeData.headings) {
        boldedResume.headings = resumeData.headings;
    }
    return boldedResume;
  } catch (error) {
    console.error('Direct AI Boldify Error:', error);
    throw error;
  }
};
export async function matchKeywordsWithProxy(data, jobDescription, language) {
  try {
    const res = await fetch('/api/matchKeywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, jobDescription, language })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to match keywords');
    }
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Match Keywords Error:', error);
    throw error;
  }
}

export async function generateCoverLetterWithProxy(data, jobDescription, language) {
  try {
    const res = await fetch('/api/generateCoverLetter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, jobDescription, language })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate cover letter');
    }
    const result = await res.json();
    return result.coverLetter;
  } catch (error) {
    console.error('Cover Letter Error:', error);
    throw error;
  }
}
