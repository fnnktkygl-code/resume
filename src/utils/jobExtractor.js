/**
 * Fast & Intelligent Job Description Details Extractor
 * Automatically extracts Company Name and Target Role from job posting text,
 * removing French gender artifacts like (e), (H/F), (F/H), duplicate headers, etc.
 */

export function cleanJobTitle(role) {
  if (!role || typeof role !== 'string') return '';

  let cleaned = role.trim();

  // 1. Remove leading articles and prepositions ("candidature au poste de", "au poste de", "le poste de", "un", "une")
  cleaned = cleaned.replace(/^(?:candidature\s+au\s+poste\s+de|au\s+poste\s+de|le\s+poste\s+de|poste\s+de|un|une|le|la|du|de|au|pour)\s+/i, '');

  // 2. Remove leading gender artifacts like "(e) ", "e ", ".e ", "- "
  cleaned = cleaned.replace(/^[\(\.\-]*\b(e|H\/F|F\/H|m\/f|m\/f\/d)\b[\)\.\-]*\s*/i, '');
  cleaned = cleaned.replace(/^\(e\)\s*/i, '');

  // 3. Remove inline parenthetical gender markers e.g. "Ingénieur(e)" -> "Ingénieur", "Consultant(e)" -> "Consultant"
  cleaned = cleaned.replace(/(\w+)\(e\)/gi, '$1');
  cleaned = cleaned.replace(/(\w+)\(se\)/gi, '$1');
  cleaned = cleaned.replace(/(\w+)\(euse\)/gi, '$1');
  cleaned = cleaned.replace(/(\w+)\.e\b/gi, '$1');

  // 4. Repeatedly remove trailing gender & contract tags: "(H/F)", "(F/H)", "H/F", "F/H", "(M/F/D)", "[H/F]", "(CDI)", "- CDI"
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(/\s*[\(\[\{]?(?:H\/F|F\/H|M\/F|M\/F\/D|H-F|F-H|CDI|CDD|Freelance|Stage|Alternance)[\)\]\}]?\s*$/i, '');
    cleaned = cleaned.replace(/\s*[-–—]\s*$/i, '');
  } while (cleaned !== prev && cleaned.length > 0);

  // 5. Trim leftover punctuation at start and end
  cleaned = cleaned.replace(/^[^a-zA-Z0-9À-ÿ]+|[^a-zA-Z0-9À-ÿ\)\%]+$/g, '').trim();

  // 6. Title Case if ALL UPPERCASE (e.g. "RESPONSABLE PERFORMANCE" -> "Responsable Performance")
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 3) {
    cleaned = cleaned.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  }

  return cleaned;
}

export function cleanCompanyName(company) {
  if (!company || typeof company !== 'string') return '';

  let cleaned = company.trim();

  // Handle duplicate repeats like "PHOTOSOL. PHOTOSOL" or "PHOTOSOL PHOTOSOL"
  const words = cleaned.split(/[\s\.]+/);
  if (words.length >= 2 && words[0].toUpperCase() === words[1].toUpperCase()) {
    cleaned = words[0];
  }

  // Remove leading/trailing quotes, dots, dashes, colons
  cleaned = cleaned.replace(/^["'\.\s\-_,:]+|["'\.\s\-_,:]+$/g, '');

  // Title Case if ALL UPPERCASE (e.g. "PHOTOSOL" -> "Photosol")
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 3) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }

  return cleaned;
}

export function extractJobDetails(text) {
  if (!text || typeof text !== 'string') {
    return { companyName: '', targetRole: '' };
  }

  let extractedCompany = '';
  let extractedRole = '';

  const cleanText = text.trim();

  // 1. Company Name Extraction Patterns
  const companyPatterns = [
    /logo\s+de\s+l'entreprise,?\s*([^\n\r,.;]{2,35})/i,
    /(?:entreprise|company|société|organization)\s*:\s*([^\n\r,.;]{2,40})/i,
    /(?:à\s+propos\s+de|about)\s+([^\n\r,.;]{2,40})/i,
    /(?:rejoindre|join)\s+([^\n\r,.;]{2,40})/i,
    /chez\s+([^\n\r,.;]{2,40})/i
  ];

  for (const pattern of companyPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      let raw = match[1].trim();
      extractedCompany = cleanCompanyName(raw);
      if (extractedCompany.length >= 2 && extractedCompany.length <= 40) {
        break;
      }
    }
  }

  // 2. Target Role Extraction Patterns
  const rolePatterns = [
    /(?:intitulé\s+du\s+poste|poste|rôle|role\s+title|job\s+title)\s*:\s*([^\n\r;]{3,65})/i,
    /(?:recherche|hiring|recrute)\s+(?:un|une|a|an)?\s*([A-Za-zÀ-ÿ0-9\s\-_/\(\)]{4,60})/i,
    /\b((?:Responsable|Ingénieur|Ingénieure|Développeur|Développeuse|Consultant|Consultante|Chef\s+de\s+projet|Directeur|Directrice|Architecte|Lead|Manager|Data\s+Scientist|Product\s+Owner|Scrum\s+Master)[^\n\r;]{3,60})/i
  ];

  for (const pattern of rolePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      let raw = match[1].trim();
      extractedRole = cleanJobTitle(raw);
      if (extractedRole.length >= 3 && extractedRole.length <= 60) {
        break;
      }
    }
  }

  return {
    companyName: extractedCompany,
    targetRole: extractedRole
  };
}
