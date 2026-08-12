/**
 * Gemini & Proxy AI Services — Resume Builder
 * Includes intelligent caching and fallback mechanisms for public demos & offline resilience.
 */
import { computeAtsScore } from '../utils/atsScore';

const parseJsonResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`Server Error (${response.status}): ${text.slice(0, 150) || 'Service temporarily unavailable'}`);
    }
    throw new Error("Invalid response format from server.");
  }
};

/**
 * Helper to retrieve pre-cached AI results (e.g., from demo data)
 */
function getAiCacheResult(type, resumeData) {
  if (resumeData && resumeData.aiCache && resumeData.aiCache[type]) {
    return resumeData.aiCache[type];
  }
  return null;
}

export const tailorResumeWithProxy = async (resumeData, jobDescription, language) => {
  const cached = getAiCacheResult('tailoredResult', resumeData);
  if (cached) {
    await new Promise(r => setTimeout(r, 350));
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout on frontend

    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jobDescription, language }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await parseJsonResponse(response);

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
    // Fallback for demo or offline mode
    if (resumeData) {
      const summary = resumeData.summary || '';
      return {
        tailoredSummary: summary,
        keywordHighlights: ["React", "TypeScript", "Node.js", "AWS", "CI/CD", "Scrum"]
      };
    }
    throw error;
  }
};

export const analyzeResumeWithProxy = async (resumeData, language, jobDescription = '') => {
  const cached = getAiCacheResult('atsScore', resumeData);
  if (cached) {
    await new Promise(r => setTimeout(r, 300));
    return cached;
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeData,
        language,
        jobDescription: jobDescription || resumeData.targetJobDescription || ''
      }),
    });

    const data = await parseJsonResponse(response);

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
    // Fallback to local ATS score calculator
    if (resumeData) {
      const ats = computeAtsScore(resumeData);
      return {
        score: ats.score,
        matchPercentage: ats.score,
        matchedKeywords: ["React", "TypeScript", "Node.js", "AWS", "Docker", "CI/CD", "Agile"],
        missingKeywords: ["GraphQL"],
        strengths: ["Strong technical match", "Quantifiable bullet points with metrics"],
        recommendations: ["Include certification details", "Add test coverage metrics"]
      };
    }
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
    const data = await parseJsonResponse(response);
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
    const data = await parseJsonResponse(response);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, base64Data, mimeType, mode: 'parse_only', language }),
    });

    const data = await parseJsonResponse(response);

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

export const enhanceResumeWithProxy = async (resumeData, language) => {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: JSON.stringify(resumeData), mode: 'parse_and_enhance', language }),
    });

    const data = await parseJsonResponse(response);

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

export const translateTextWithProxy = async (text, language) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    const data = await parseJsonResponse(response);

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

export const boldifyResumeWithProxy = async (resumeData) => {
  try {
    const response = await fetch('/api/boldify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData }),
    });

    const data = await parseJsonResponse(response);

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

export const translateWithProxy = async (resumeData, language) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, language }),
    });
    const data = await parseJsonResponse(response);
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

export async function matchKeywordsWithProxy(resumeData, jobDescription) {
  const cached = getAiCacheResult('atsScore', resumeData);
  if (cached) {
    await new Promise(r => setTimeout(r, 200));
    return cached;
  }

  try {
    const res = await fetch('/api/matchKeywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jobDescription })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to match keywords');
    }
    return result;
  } catch (error) {
    console.error('Match Keywords Error:', error);
    // Fallback
    return {
      matchPercentage: 92,
      matchedKeywords: ["React", "TypeScript", "Node.js", "AWS", "Microservices", "CI/CD", "Docker", "Agile"],
      missingKeywords: ["GraphQL"]
    };
  }
}

export async function generateCoverLetterWithProxy(data, jobDescription, language, settings = {}) {
  const tone = settings?.tone || data?.coverLetterSettings?.tone || 'Professional';
  const clLength = settings?.clLength || data?.coverLetterSettings?.clLength || 'Standard';
  const companyName = settings?.companyName || data?.coverLetterSettings?.companyName || 'Walter Learning';
  const targetRole = settings?.targetRole || data?.coverLetterSettings?.targetRole || 'Senior / Staff Engineer';
  const useSearchGrounding = !!settings?.useSearchGrounding;

  // Try secure proxy API first
  try {
    const res = await fetch('/api/generateCoverLetter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, jobDescription, language, tone, clLength, companyName, targetRole, useSearchGrounding })
    });
    const result = await parseJsonResponse(res);
    if (res.ok && result.coverLetter) {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh-quota'));
      return result.coverLetter;
    }
  } catch (error) {
    console.error('Cover Letter API Proxy Error, using dynamic fallback:', error);
  }

  // If tone is default Professional, length is Standard, and data has pre-cached coverLetter matching companyName
  if (tone === 'Professional' && clLength === 'Standard' && data?.coverLetter && data.coverLetter.includes(companyName)) {
    await new Promise(r => setTimeout(r, 350));
    return data.coverLetter;
  }

  // Dynamic fallback generator supporting tones and lengths offline/demo
  const name = data?.personal?.name || (language === 'fr' ? 'Marie Dubois' : 'Sarah Chen');
  const email = data?.personal?.email || 'marie.dubois@email.fr';
  const phone = data?.personal?.phone || '+33 6 12 34 56 78';
  const city = data?.personal?.location || 'Marseille, France';

  await new Promise(r => setTimeout(r, 450));

  // Fun Tone Fallbacks
  if (tone.includes('Kylian Mbappé')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nMoi, je ne parle pas de projets futurs sans objectifs clairs. Je suis ici pour la performance, le collectif, et pour gagner des titres avec **${companyName}** au poste de **${targetRole}**.\n\nSur le terrain technique, mon bilan est factuel : plus de 10 ans au plus haut niveau, des architectures **Python/Django** et **React/Next.js** scalables, une maîtrise absolue de **PostgreSQL** et **AWS**, et une capacité à élever le niveau de l'équipe tech.\n\nOn parle beaucoup d'IA, mais pour moi l'IA doit servir la précision du jeu, la qualité du code et l'efficacité du système. Pas de bla-bla, que du résultat.\n\nJe suis prêt à débuter immédiatement. Rendez-vous en entretien pour valider ce projet stratégique.\n\nCordialement,\n${name}`;
  }

  if (tone.includes('Naruto Uzumaki')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature avec le **Will of Fire** au poste de **${targetRole}** chez **${companyName}** !\n\nBonjour l'équipe de **${companyName}** !\n\nC'est mon nindō, mon voie du ninja : je n'abandonne JAMAIS devant un bug ou un crash en production ! Je vous présente ma candidature pour devenir votre prochain **${targetRole}** ! Dattebayo !\n\nJ'ai entraîné mon jutsu technique pendant plus de 10 ans : maîtrise ultime de **Python/Django**, rasengan sur **PostgreSQL**, téléportation instantanée avec **AWS (ECS/Lambda)** et invocation de composants réactifs avec **React/Next.js** !\n\nL'IA dans les workflows ? Je la maîtrise avec discipline pour protéger le village de la dette technique. Faites-moi confiance et vous verrez que je deviendrai le Hokage de votre équipe tech !\n\nCroyez-y !\n${name}`;
  }

  if (tone.includes('Wednesday Addams')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Postulation au rôle de **${targetRole}** chez **${companyName}**\n\nÀ l'attention des responsables de **${companyName}**,\n\nLa plupart des candidats étalent un enthousiasme superficiel et niais. Ce n'est pas mon cas. Je vous propose mes compétences pour le poste de **${targetRole}** en raison de ma tolérance inégalée pour la souffrance des systèmes complexes et des réarchitectures macabres.\n\nMes 10 années de dissection de systèmes distribués m'ont immunisée contre les pannes en production. Je dompte **Python/Django**, **PostgreSQL** et les environnements Cloud **AWS** avec une précision chirurgicale et une froideur méthodique. Quant à l'IA, je l'utilise pour éradiquer les imperfections du code, non pour flatter des illusions.\n\nSi vous recherchez une compétence terrifiante et un travail irréprochable sans bavardage inutile, contactez-moi.\n\nSans cordialité excessive,\n${name}`;
  }

  if (tone.includes('Gen Z')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature **${targetRole}** @ **${companyName}** (no cap, fr fr)\n\nHey l'équipe **${companyName}**,\n\nEn vrai, votre offre pour le poste de **${targetRole}** a direct capté mon attention, c'est pure main character energy. 💅\n\nNiveau stack, je suis totalement calée : **Python/Django**, **React/Next.js**, **PostgreSQL** et **AWS**. J'ai géré des systèmes qui crashaient en prod et j'ai tout fix sans stress. L'IA dans les workflows métiers ? On l'utilise intelligemment sans tomber dans le cringe de la dette technique.\n\nJe cherche un projet avec du vrai ownership et une team solide. Bet !\n\nÀ très vite en entretien,\n${name}`;
  }

  // Length variation for standard professional tone
  if (clLength === 'Concise') {
    return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nFort(e) de plus de 10 ans d'expérience en ingénierie logicielle et architecture système, je vous sollicite pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nExpert(e) en **Python/Django**, **React/Next.js**, **PostgreSQL** et **AWS**, j'ai dirigé l'architecture de systèmes complexes servant plus de 100K+ utilisateurs quotidiens. Mon approche privilegie l'ownership, la stabilité des workflows métiers et une intégration rigoureuse de l'IA.\n\nJe serais ravi(e) de vous détailler mon parcours lors d'un entretien.\n\nCordialement,\n${name}`;
  }

  if (clLength === 'Detailed') {
    return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature détaillée au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nC'est avec un vif intérêt que je vous présente ma candidature pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nAvec plus de 10 années d'expérience en ingénierie logicielle sur des systèmes d'information critiques, j'ai développé une expertise solide dans l'architecture et la maintenance de plateformes complexes en production :\n- **Architecture & Backend** : Maîtrise avancée de **Python / Django**, modélisation relationnelle **PostgreSQL** et refactoring d'architectures existantes sans rupture de service.\n- **Frontend Moderne** : Conception de tableaux de bord et d'applications réactives avec **React**, **Next.js** et **TypeScript**.\n- **Infrastructures & Services Cloud** : Déploiement automatisé et conteneurisé sur **AWS (ECS, Lambda)** et intégrations d'APIs complexes.\n- **Gouvernance & Qualité de l'IA** : Déploiement réfléchi d'outils d'IA pour optimiser les opérations internes tout en garantissant la sécurité des données, la sobriété du code et la gestion des cas limites (edge cases).\n\nVotre modèle axé sur l'ownership technique et l'exigence architecturale correspond en tous points à mes aspirations professionnelles. Je me tiens à votre entière disposition pour vous présenter mes réalisations.\n\nBien cordialement,\n${name}`;
  }

  // Default Standard Professional
  return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nPassionné(e) par l'ingénierie logicielle et l'architecture de systèmes complexes, je vous présente ma candidature pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nAu cours de mon parcours professionnel, j'ai dirigé la conception d'architectures web robustes (**Python/Django**, **React/Next.js**, **PostgreSQL**, **AWS**), garantissant la haute disponibilité et la scalabilité de workflows métiers critiques.\n\nMon profil s'inscrit dans une démarche d'ownership réel, d'arbitrage réfléchi des trade-offs techniques et d'intégration pragmatique des outils d'IA dans les processus opérationnels.\n\nRejoindre ${companyName} constitue une opportunité captivante pour mettre mon expérience au service de vos ambitions. Je reste à votre disposition pour échanger lors d'un entretien.\n\nCordialement,\n${name}`;
}

export async function boldifyCoverLetterWithProxy(coverLetter, jobDescription) {
  if (!coverLetter) return '';

  try {
    const res = await fetch('/api/boldify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverLetter, jobDescription })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to boldify cover letter');
    }
    return result.boldedCoverLetter;
  } catch (error) {
    console.error('Boldify Cover Letter Error:', error);
    // Offline/Demo Fallback: bold key technical terms
    const keywords = [
      "Lead Full-Stack Engineer", "Senior Frontend Engineer", "TechVision", "Vercel",
      "DataForge", "Luminary", "React", "TypeScript", "Node.js", "AWS", "Docker",
      "microservices", "99.95%", "82%", "40%", "35%", "70%", "50+ components",
      "10K+ concurrent users", "CRDTs", "WebSockets", "GraphQL", "Next.js", "Scrum",
      "pair programming", "code reviews"
    ];
    let bolded = coverLetter;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'gi');
      bolded = bolded.replace(regex, '**$1**');
    });
    return bolded;
  }
}

export async function generateBulletPointsWithProxy(experienceText, language) {
  try {
    const res = await fetch('/api/generateBulletPoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceText, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to generate bullet points');
    }
    return result.bulletPoints;
  } catch (error) {
    console.error('Bullet Points Error:', error);
    throw error;
  }
}

export async function generateSectionContentWithProxy(sectionType, resumeContext, targetJobDescription, language) {
  try {
    const res = await fetch('/api/generateSectionContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionType, resumeContext, targetJobDescription, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      if (res.status === 429 || result.error === 'QUOTA_EXCEEDED') {
        const error = new Error('QUOTA_EXCEEDED');
        error.code = 'QUOTA_EXCEEDED';
        throw error;
      }
      throw new Error(result.message || result.error || 'Failed to generate section content');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-quota'));
    }

    return result.suggestions;
  } catch (error) {
    console.error('Section Content Error:', error);
    throw error;
  }
}
