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

export const analyzeResumeWithProxy = async (resumeData, language, jobDescription = '') => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        language,
        jobDescription: jobDescription || resumeData.targetJobDescription || ''
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

export const rewriteWithProxy = async (textData, contextType, language) => {
  try {
    const response = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textData, contextType, language }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'QUOTA_EXCEEDED') throw new Error('API quota exceeded. Please try again later.');
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }
    
    return data.rewrittenText;
  } catch (error) {
    console.error('AI Rewrite Proxy Error:', error);
    throw error;
  }
};


export const importResumeWithProxy = async ({ text, base64Data, mimeType, language }) => {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, base64Data, mimeType, mode: 'parse_only', language }),
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
 * Enhances a previously parsed resume JSON using AI.
 * Calls the same parse endpoint but with mode: 'parse_and_enhance'.
 */
export const enhanceResumeWithProxy = async (resumeData, language) => {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: JSON.stringify(resumeData), mode: 'parse_and_enhance', language }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 || (data && data.error === 'QUOTA_EXCEEDED')) {
        const err = new Error('QUOTA_EXCEEDED');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      throw new Error((data && (data.message || data.error)) || 'Failed to enhance resume.');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return data.parsedResume;
  } catch (error) {
    console.error("Proxy Enhance Error:", error);
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

export async function boldifyCoverLetterWithProxy(coverLetter, jobDescription) {
  try {
    const res = await fetch('/api/boldify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverLetter, jobDescription })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to boldify cover letter');
    }
    const result = await res.json();
    return result.boldedCoverLetter;
  } catch (error) {
    console.error('Boldify Cover Letter Error:', error);
    throw error;
  }
}

export async function generateBulletPointsWithProxy(experienceText, language) {
  try {
    const res = await fetch('/api/generateBulletPoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceText, language })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate bullet points');
    }
    const result = await res.json();
    return result.bulletPoints;
  } catch (error) {
    console.error('Bullet Points Error:', error);
    throw error;
  }
}

/**
 * Generates AI suggestions for a specific CV section.
 * Uses the candidate's full profile context + optional job description
 * to produce coherent, credible suggestions.
 *
 * @param {string} sectionType - Type of section to fill
 * @param {Object} resumeContext - Condensed resume context from buildResumeContext()
 * @param {string|null} targetJobDescription - Optional job description for targeting
 * @param {string} language - 'en' | 'fr' | 'es'
 * @returns {Promise<Object>} AI-generated suggestions
 */
export async function generateSectionContentWithProxy(sectionType, resumeContext, targetJobDescription, language) {
  try {
    const res = await fetch('/api/generateSectionContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionType, resumeContext, targetJobDescription, language })
    });
    if (!res.ok) {
      const err = await res.json();
      if (res.status === 429 || err.error === 'QUOTA_EXCEEDED') {
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        throw error;
      }
      throw new Error(err.message || err.error || 'Failed to generate section content');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    const result = await res.json();
    return result.suggestions;
  } catch (error) {
    console.error('Section Content Error:', error);
    throw error;
  }
}
