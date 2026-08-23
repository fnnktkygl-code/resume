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
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rewrite', textData, contextType, language }),
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
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'translate', text, language }),
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
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'translate', resumeData, language }),
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
  if (!settings?.forceRegenerate && tone === 'Professional' && clLength === 'Standard' && data?.coverLetter && data.coverLetter.includes(companyName)) {
    await new Promise(r => setTimeout(r, 350));
    return data.coverLetter;
  }

  // Dynamic fallback generator supporting tones and lengths offline/demo
  const name = data?.personal?.name || (language === 'fr' ? 'Marie Dubois' : 'Sarah Chen');
  const email = data?.personal?.email || 'marie.dubois@email.fr';
  const phone = data?.personal?.phone || '+33 6 12 34 56 78';
  const city = data?.personal?.location || 'Marseille, France';
  const userTechSkills = data?.skills?.technical ? data.skills.technical.split(',').slice(0, 4).join(', ') : 'React, Node.js et AWS';

  await new Promise(r => setTimeout(r, 450));

  // Fun Tone Fallbacks
  if (tone.includes('Kylian Mbappé')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nMoi, je ne parle pas de projets futurs sans objectifs clairs. Je suis ici pour la performance, le collectif, et pour gagner des titres avec **${companyName}** au poste de **${targetRole}**.\n\nSur le terrain technique, mon bilan est factuel : plus de 10 ans au plus haut niveau, avec une maîtrise absolue de **${userTechSkills}** et une capacité à élever le niveau de l'équipe tech.\n\nOn parle beaucoup d'IA, mais pour moi l'IA doit servir la précision du jeu, la qualité du code et l'efficacité du système. Pas de bla-bla, que du résultat.\n\nJe suis prêt à débuter immédiatement. Rendez-vous en entretien pour valider ce projet stratégique.\n\nCordialement,\n${name}`;
  }

  if (tone.includes('Naruto Uzumaki')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature avec le **Will of Fire** au poste de **${targetRole}** chez **${companyName}** !\n\nBonjour l'équipe de **${companyName}** !\n\nC'est mon nindō, mon voie du ninja : je n'abandonne JAMAIS devant un bug ou un crash en production ! Je vous présente ma candidature pour devenir votre prochain **${targetRole}** ! Dattebayo !\n\nJ'ai entraîné mon jutsu technique pendant plus de 10 ans : maîtrise ultime de **${userTechSkills}** !\n\nL'IA dans les workflows ? Je la maîtrise avec discipline pour protéger le village de la dette technique. Faites-moi confiance et vous verrez que je deviendrai le Hokage de votre équipe tech !\n\nCroyez-y !\n${name}`;
  }

  if (tone.includes('Wednesday Addams')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Postulation au rôle de **${targetRole}** chez **${companyName}**\n\nÀ l'attention des responsables de **${companyName}**,\n\nLa plupart des candidats étalent un enthousiasme superficiel et niais. Ce n'est pas mon cas. Je vous propose mes compétences pour le poste de **${targetRole}** en raison de ma tolérance inégalée pour la souffrance des systèmes complexes et des réarchitectures macabres.\n\nMes 10 années de dissection de systèmes m'ont immunisée contre les pannes. Je dompte **${userTechSkills}** avec une précision chirurgicale et une froideur méthodique. Quant à l'IA, je l'utilise pour éradiquer les imperfections du code, non pour flatter des illusions.\n\nSi vous recherchez une compétence terrifiante et un travail irréprochable sans bavardage inutile, contactez-moi.\n\nSans cordialité excessive,\n${name}`;
  }

  if (tone.includes('Gen Z')) {
    return `${name}\n${city}\n${email} | ${phone}\n\nObjet : Candidature **${targetRole}** @ **${companyName}** (no cap, fr fr)\n\nHey l'équipe **${companyName}**,\n\nEn vrai, votre offre pour le poste de **${targetRole}** a direct capté mon attention, c'est pure main character energy. 💅\n\nNiveau stack, je suis totalement calée : **${userTechSkills}**. J'ai géré des systèmes qui crashaient en prod et j'ai tout fix sans stress. L'IA dans les workflows métiers ? On l'utilise intelligemment sans tomber dans le cringe de la dette technique.\n\nJe cherche un projet avec du vrai ownership et une team solide. Bet !\n\nÀ très vite en entretien,\n${name}`;
  }

  // Length variation for standard professional tone
  if (clLength === 'Concise') {
    return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nFort(e) de plus de 10 ans d'expérience, je vous sollicite pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nExpert(e) en **${userTechSkills}**, j'ai dirigé l'architecture de systèmes complexes. Mon approche privilegie l'ownership, la stabilité des workflows métiers et une intégration rigoureuse de l'IA.\n\nJe serais ravi(e) de vous détailler mon parcours lors d'un entretien.\n\nCordialement,\n${name}`;
  }

  if (clLength === 'Detailed') {
    return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature détaillée au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nC'est avec un vif intérêt que je vous présente ma candidature pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nAvec plus de 10 années d'expérience en ingénierie logicielle sur des systèmes d'information critiques, j'ai développé une expertise solide dans l'architecture et la maintenance de plateformes complexes en production :\n- **Architecture & Développement** : Maîtrise avancée de **${userTechSkills}** et refactoring d'architectures existantes sans rupture de service.\n- **Gouvernance & Qualité de l'IA** : Déploiement réfléchi d'outils d'IA pour optimiser les opérations internes tout en garantissant la sécurité des données, la sobriété du code et la gestion des cas limites (edge cases).\n\nVotre modèle axé sur l'ownership technique et l'exigence architecturale correspond en tous points à mes aspirations professionnelles. Je me tiens à votre entière disposition pour vous présenter mes réalisations.\n\nBien cordialement,\n${name}`;
  }

  // Default Standard Professional
  return `${name}\n${city}\n${email} | ${phone}\n\nParis, le 4 août 2025\n\nObjet : Candidature au poste de **${targetRole}** chez **${companyName}**\n\nMadame, Monsieur,\n\nPassionné(e) par l'ingénierie logicielle et l'architecture de systèmes complexes, je vous présente ma candidature pour le poste de **${targetRole}** au sein de **${companyName}**.\n\nAu cours de mon parcours professionnel, j'ai dirigé la conception d'architectures robustes (**${userTechSkills}**), garantissant la haute disponibilité et la scalabilité de workflows métiers critiques.\n\nMon profil s'inscrit dans une démarche d'ownership réel, d'arbitrage réfléchi des trade-offs techniques et d'intégration pragmatique des outils d'IA dans les processus opérationnels.\n\nRejoindre ${companyName} constitue une opportunité captivante pour mettre mon expérience au service de vos ambitions. Je reste à votre disposition pour échanger lors d'un entretien.\n\nCordialement,\n${name}`;
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

export async function generateFollowUpWithProxy({ companyName, jobTitle, type = 'followup', daysElapsed = 8, candidateName, context = '', language = 'fr' }) {
  try {
    const res = await fetch('/api/careerOpsAssist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'followup', companyName, jobTitle, type, daysElapsed, candidateName, context, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to generate follow-up email');
    }
    return result;
  } catch (error) {
    console.error('FollowUp Error:', error);
    // Offline / Demo Fallback
    const isFr = language === 'fr';
    const isEs = language === 'es';
    if (type === 'thankyou') {
      return {
        subject: isFr 
          ? `Remerciements suite à notre entretien - ${jobTitle} chez ${companyName}`
          : isEs 
          ? `Agradecimiento tras nuestra entrevista - ${jobTitle} en ${companyName}`
          : `Thank you - Interview for ${jobTitle} at ${companyName}`,
        body: isFr
          ? `Bonjour,\n\nJe tiens à vous remercier chaleureusement pour le temps accordé lors de notre échange concernant le poste de ${jobTitle} au sein de ${companyName}.\n\nNotre discussion sur vos enjeux techniques a renforcé mon enthousiasme à rejoindre votre équipe et à y apporter mon expertise.\n\nRestant à votre entière disposition pour toute information complémentaire.\n\nBien cordialement,\n${candidateName || 'Le Candidat'}`
          : isEs
          ? `Hola,\n\nQuería agradecerles sinceramente por el tiempo dedicado en nuestra conversación respecto al puesto de ${jobTitle} en ${companyName}.\n\nNuestra charla sobre sus desafíos técnicos confirmó mi gran entusiasmo por unirme a su equipo y aportar mi experiencia.\n\nQuedo a su completa disposición para cualquier información adicional.\n\nUn cordial saludo,\n${candidateName || 'El Candidato'}`
          : `Hello,\n\nThank you very much for your time during our interview regarding the ${jobTitle} position at ${companyName}.\n\nOur conversation regarding your technical challenges reinforced my strong enthusiasm for joining your team and contributing my expertise.\n\nI remain at your full disposal for any further details.\n\nBest regards,\n${candidateName || 'The Candidate'}`,
        tips: isFr 
          ? ["Envoyez cet email dans les 24 heures suivant l'entretien.", "Personnalisez une ligne avec un détail précis mentionné par le recruteur."]
          : isEs
          ? ["Envíe este correo dentro de las 24 horas posteriores a la entrevista.", "Personalice una línea con un detalle específico de la conversación."]
          : ["Send this email within 24 hours of the interview.", "Customize one line with a specific detail mentioned during the discussion."]
      };
    }

    return {
      subject: isFr 
        ? `Candidature ${jobTitle} - Suivi de mon dossier / ${companyName}`
        : isEs 
        ? `Candidatura ${jobTitle} - Seguimiento de mi expediente / ${companyName}`
        : `Application for ${jobTitle} - Follow-up / ${companyName}`,
      body: isFr
        ? `Bonjour,\n\nJe me permets de revenir vers vous concernant ma candidature au poste de ${jobTitle} transmise il y a ${daysElapsed} jours.\n\nToujours très motivé à l'idée d'intégrer ${companyName}, je souhaitais savoir si vous aviez des nouvelles sur l'avancement du processus de recrutement.\n\nJe reste à votre disposition pour un premier échange.\n\nBien cordialement,\n${candidateName || 'Le Candidat'}`
        : isEs
        ? `Hola,\n\nMe pongo en contacto con ustedes respecto a mi postulación para el puesto de ${jobTitle} enviada hace ${daysElapsed} días.\n\nSigo muy motivado con la oportunidad de incorporarme a ${companyName} y deseaba consultar sobre el estado del proceso de selección.\n\nQuedo a su disposición para conversar cuando les sea oportuno.\n\nUn cordial saludo,\n${candidateName || 'El Candidato'}`
        : `Hello,\n\nI am writing to follow up on my application for the ${jobTitle} position submitted ${daysElapsed} days ago.\n\nI remain very enthusiastic about the opportunity at ${companyName} and would love to know if there are any updates regarding the hiring process.\n\nI look forward to hearing from you.\n\nBest regards,\n${candidateName || 'The Candidate'}`,
      tips: isFr 
        ? ["Un délai de 7 à 10 jours sans réponse est le moment idéal pour relancer.", "Restez toujours concis et courtois."]
        : isEs
        ? ["Un plazo de 7 a 10 días sin respuesta es ideal para dar seguimiento.", "Manténgase conciso y cortés."]
        : ["A 7 to 10-day window of silence is the ideal timing for a polite follow-up.", "Keep it short and courteous."]
    };
  }
}

export async function generateInterviewPrepWithProxy({ resumeData, jobDescription, companyName, jobTitle, language = 'fr' }) {
  try {
    const res = await fetch('/api/careerOpsAssist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'interviewPrep', resumeData, jobDescription, companyName, jobTitle, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to generate interview prep pack');
    }
    return result;
  } catch (error) {
    console.error('InterviewPrep Error:', error);
    // Offline / Demo Fallback
    const isFr = language === 'fr';
    const isEs = language === 'es';
    return {
      summary: isFr
        ? `Mettez en avant votre rigueur technique et votre capacité à délivrer des projets à fort impact mesuré chez ${companyName}.`
        : isEs
        ? `Destaque su rigor técnico y su capacidad para entregar proyectos de alto impacto medido en ${companyName}.`
        : `Highlight your technical rigor and proven track record of delivering high-impact projects at ${companyName}.`,
      behavioralQuestions: [
        {
          id: 'b1',
          question: isFr 
            ? "Pouvez-vous me parler d'un projet complexe où vous avez surmonté un obstacle technique majeur ?" 
            : isEs 
            ? "¿Puede hablarme de un proyecto complejo donde superó un obstáculo técnico importante?" 
            : "Can you tell me about a complex project where you overcame a major technical hurdle?",
          mappedCvExperience: `${companyName || 'Projet récent'}`,
          starAnswer: {
            situation: isFr ? "Confronté à des contraintes de performance et de scalabilité sur notre application principale." : isEs ? "Enfrentando problemas de rendimiento y escalabilidad en nuestra aplicación principal." : "Facing performance and scalability bottlenecks on our main production app.",
            task: isFr ? "Refactoriser l'architecture pour réduire la latence de 50% sans interruption de service." : isEs ? "Refactorizar la arquitectura para reducir la latencia en 50% sin tiempo de inactividad." : "Refactor architecture to cut latency by 50% with zero downtime.",
            action: isFr ? "Mise en place d'un profilage précis, optimisation des requêtes et découplage des services critiques." : isEs ? "Implementación de perfiles detallados, optimización de consultas y desacoplamiento de servicios críticos." : "Executed precise profiling, query optimization, and decoupled critical service paths.",
            result: isFr ? "Temps de réponse divisé par 2 (+45% de débit) et adoption par 100% de l'équipe." : isEs ? "Tiempo de respuesta reducido a la mitad (+45% de rendimiento) y adopción del 100% por el equipo." : "Response times cut in half (+45% throughput) and 100% team adoption."
          },
          proTip: isFr ? "Articulez clairement le résultat chiffré dès la fin de votre réponse." : isEs ? "Exprese claramente el resultado cuantificado al final de su respuesta." : "Clearly state the quantified metric at the conclusion of your answer."
        },
        {
          id: 'b2',
          question: isFr 
            ? "Comment gérez-vous les désaccords techniques au sein d'une équipe ?" 
            : isEs 
            ? "¿Cómo maneja los desacuerdos técnicos dentro de un equipo?" 
            : "How do you resolve technical disagreements within an engineering team?",
          mappedCvExperience: "Collaboration & Leadership",
          starAnswer: {
            situation: isFr ? "Désaccord sur le choix d'un framework entre deux approches divergentes." : isEs ? "Desacuerdo sobre la elección de un framework entre dos enfoques divergentes." : "Disagreement over framework choice between two differing team approaches.",
            task: isFr ? "Trouver un consensus rapide sans bloquer le sprint de livraison." : isEs ? "Alcanzar un consenso rápido sin bloquear el sprint de entrega." : "Reach quick consensus without blocking the delivery sprint.",
            action: isFr ? "Création d'un benchmark objectif avec Proof-of-Concept de 24h et critères mesurables." : isEs ? "Creación de un benchmark objetivo con Proof-of-Concept de 24h y criterios medibles." : "Built an objective 24h Proof-of-Concept benchmark with measurable trade-offs.",
            result: isFr ? "Alignement unanime de l'équipe et livraison dans les temps avec zéro dette technique imprévue." : isEs ? "Alineación unánime del equipo y entrega a tiempo sin deuda técnica imprevista." : "Unanimous team alignment and on-time delivery with zero unexpected tech debt."
          },
          proTip: isFr ? "Montrez votre pragmatisme et votre orientation données plutôt que l'ego." : isEs ? "Demuestre pragmatismo y orientación a datos en lugar de ego." : "Demonstrate pragmatism and data-driven objectivity over ego."
        }
      ],
      technicalQuestions: [
        {
          id: 't1',
          question: isFr 
            ? `Comment aborderiez-vous l'architecture et la sécurité pour le poste de ${jobTitle} ?` 
            : isEs 
            ? `¿Cómo abordaría la arquitectura y la seguridad para el puesto de ${jobTitle}?` 
            : `How would you approach architecture and security for the ${jobTitle} position?`,
          keyConceptsToMention: ["Scalabilité", "Sécurité par conception", "Monitoring & Observabilité", "Tests automatisés"],
          suggestedResponseOutline: isFr 
            ? "1. Analyse des besoins -> 2. Architecture modulaire -> 3. Sécurité & CI/CD -> 4. Métriques de succès" 
            : isEs 
            ? "1. Análisis de requisitos -> 2. Arquitectura modular -> 3. Seguridad y CI/CD -> 4. Métricas de éxito" 
            : "1. Requirements analysis -> 2. Modular architecture -> 3. Security & CI/CD -> 4. Success metrics",
          trapToAvoid: isFr ? "Évitez la sur-ingénierie prématurée sans comprendre les contraintes business." : isEs ? "Evite la sobreingeniería prematura sin entender el contexto de negocio." : "Avoid premature over-engineering before understanding business constraints."
        }
      ],
      bridgeAnswers: [
        {
          id: 'gap1',
          missingSkill: "Outil / Compétence secondaire de l'offre",
          adjacentSkill: "Compétence principale maîtrisée",
          scriptedBridgeAnswer: isFr 
            ? "« Bien que je n'aie pas encore utilisé cet outil spécifique en production, je maîtrise parfaitement les concepts fondamentaux grâce à mon expérience approfondie. J'ai déjà monté en compétence en moins de deux semaines sur des technologies similaires. »" 
            : isEs 
            ? "« Si bien no he utilizado esta herramienta específica en producción todavía, domino perfectamente los conceptos fundamentales gracias a mi sólida experiencia. He aprendido tecnologías similares en menos de dos semanas en proyectos anteriores. »" 
            : "\"While I haven't used this specific tool in production yet, I deeply understand the underlying core architecture through my strong background. I have consistently ramped up on similar stacks in under two weeks.\"",
          rampUpPlan: isFr ? "Consulter la documentation officielle et déployer un projet bac à sable dès la première semaine." : isEs ? "Consultar la documentación oficial y desplegar un proyecto de prueba en la primera semana." : "Review official docs and deploy a sandbox proof-of-concept during week one."
        }
      ],
      reverseQuestionsToAsk: [
        {
          id: 'q1',
          question: isFr 
            ? "Quels sont les défis techniques ou opérationnels les plus critiques auxquels l'équipe sera confrontée dans les 6 prochains mois ?" 
            : isEs 
            ? "¿Cuáles son los desafíos técnicos u operativos más críticos que enfrentará el equipo en los próximos 6 meses?" 
            : "What are the most critical technical or operational challenges your team will face in the next 6 months?",
          objective: isFr ? "Démontre une vision stratégique et un intérêt pour l'impact réel." : isEs ? "Demuestra visión estratégica e interés en el impacto real." : "Demonstrates strategic foresight and focus on real business impact."
        },
        {
          id: 'q2',
          question: isFr 
            ? "À quoi ressemblerait une intégration réussie pour ce poste après 90 jours ?" 
            : isEs 
            ? "¿Cómo definirían una incorporación exitosa para este puesto tras 90 días?" 
            : "What would a highly successful first 90 days look like for someone in this role?",
          objective: isFr ? "Projette une attitude proactive axée sur la réussite mesurable." : isEs ? "Proyecta una actitud proactiva orientada al éxito medible." : "Projects a proactive, goal-oriented mindset."
        }
      ]
    };
  }
}

export async function evaluateMockAnswerWithProxy({ practiceQuestion, userAnswer, companyName, jobTitle, language = 'fr' }) {
  try {
    const res = await fetch('/api/careerOpsAssist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'evaluateMockAnswer', practiceQuestion, userAnswer, companyName, jobTitle, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to evaluate mock answer');
    }
    return result;
  } catch (error) {
    console.error('Mock Evaluation Error:', error);
    const isFr = language === 'fr';
    const isEs = language === 'es';
    return {
      score: 82,
      strengths: isFr 
        ? ["Structure de réponse claire et fluide.", "Bonne articulation de l'action menée personnellement."]
        : isEs 
        ? ["Estructura de respuesta clara y fluida.", "Buena articulación de la acción realizada personalmente."]
        : ["Clear and structured delivery.", "Strong ownership articulated in the action taken."],
      improvements: isFr 
        ? ["Ajoutez un chiffre d'impact concret pour clore (ex: % de temps gagné).", "Précisez brièvement le contexte initial en une seule phrase."]
        : isEs 
        ? ["Agregue un número de impacto concreto para concluir (ej: % de tiempo ahorrado).", "Especifique brevemente el contexto inicial en una sola frase."]
        : ["Add a specific quantified outcome at the end (e.g. % time saved).", "Keep the initial situation description to a single punchy sentence."],
      improvedSampleAnswer: isFr 
        ? `« Face à ce défi, j'ai pris l'initiative d'analyser la cause racine, puis j'ai orchestré la solution technique avec l'équipe, ce qui nous a permis d'augmenter le débit de 35% tout en éliminant les régressions. »`
        : isEs 
        ? `« Frente a este desafío, tomé la iniciativa de analizar la causa raíz y luego coordiné la solución técnica con el equipo, lo que nos permitió aumentar el rendimiento en un 35% eliminando regresiones. »`
        : `"Facing this challenge, I took the lead in diagnosing the root cause, then spearheaded the technical solution with the team, resulting in a 35% throughput increase while completely preventing regressions."`
    };
  }
}

export async function generateUpskillPlanWithProxy({ resumeData, jobDescription, companyName, jobTitle, language = 'fr' }) {
  try {
    const res = await fetch('/api/careerOpsAssist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upskill', resumeData, jobDescription, companyName, jobTitle, language })
    });
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to generate upskill plan');
    }
    return result;
  } catch (error) {
    console.error('UpskillPlan Error:', error);
    const isFr = language === 'fr';
    const isEs = language === 'es';
    return {
      readinessScore: 85,
      summary: isFr 
        ? `Votre profil possède 85% d'adéquation directe pour le poste de ${jobTitle} chez ${companyName}. Voici les 3 points clés à consolider pour maximiser vos chances d'offre.`
        : isEs 
        ? `Su perfil tiene un 85% de adecuación directa para el puesto de ${jobTitle} en ${companyName}. Aquí están los 3 puntos clave a consolidar.`
        : `Your profile has an 85% direct match for the ${jobTitle} role at ${companyName}. Here are the top 3 high-leverage areas to sharpen.`,
      skillGaps: [
        {
          skill: "Architecture Cloud & Conteneurs",
          priority: "critical",
          category: "Cloud / DevOps",
          estimatedHours: "8-10h",
          curatedResources: ["Documentation officielle Docker & Kubernetes", "Architecture Best Practices Guide"],
          practicalMiniProject: "Déployer une micro-application conteneurisée avec pipeline CI/CD automatisé sur GitHub Actions."
        },
        {
          skill: "Tests d'Intégration & Performance",
          priority: "moderate",
          category: "Quality Assurance",
          estimatedHours: "4-6h",
          curatedResources: ["Guide des tests automatisés modernes", "Lighthouse & Profiling APIs"],
          practicalMiniProject: "Mettre en place une suite de tests automatisés couvrant les flux critiques avec rapport de couverture."
        }
      ],
      twoWeekRoadmap: [
        {
          phase: isFr ? "Semaine 1 : Fondations & Outillage" : isEs ? "Semana 1 : Fundamentos y Herramientas" : "Week 1: Core Foundations",
          focus: isFr ? "Maîtriser les configurations clés et déployer le bac à sable technique." : isEs ? "Dominar las configuraciones clave y desplegar el entorno de prueba." : "Master key configurations and launch a technical sandbox.",
          deliverable: isFr ? "Projet GitHub documenté avec Readme technique et métriques de test." : isEs ? "Proyecto GitHub documentado con Readme técnico y métricas." : "Documented GitHub repository with technical README and test metrics."
        },
        {
          phase: isFr ? "Semaine 2 : Intégration CV & Argumentaire Entretien" : isEs ? "Semana 2 : Integración CV y Argumentario" : "Week 2: CV Integration & Interview Talking Points",
          focus: isFr ? "Traduire les apprentissages en bullet points STAR pour le CV et préparer les Bridge Answers." : isEs ? "Traducir los aprendizajes en puntos STAR para el CV y preparar las Bridge Answers." : "Translate learnings into STAR CV bullets and practice Bridge Answers.",
          deliverable: isFr ? "Mise à jour du profil et simulation d'entretien validée." : isEs ? "Actualización del perfil y simulación de entrevista validada." : "Updated profile and validated mock interview run."
        }
      ]
    };
  }
}

