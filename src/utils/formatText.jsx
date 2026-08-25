import React from 'react';

export function formatSkills(skillsString) {
  if (!skillsString) return skillsString;
  return skillsString.replace(/\*\*([^*]+)\*\*/g, (match, p1) => {
    return p1.split(',').map(s => `**${s.trim()}**`).join(', ');
  });
}

export function parseMarkdown(text) {
  if (!text) return text;
  if (typeof text !== 'string') return text;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function formatUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^tel:/i.test(trimmed)) return trimmed;
  if (trimmed.includes('@') && !trimmed.includes('/') && !trimmed.includes('http')) {
    return `mailto:${trimmed}`;
  }
  return `https://${trimmed}`;
}

/**
 * Parse a complex skills string into clean individual tags.
 * Handles formats like: "Programmation : Python (Pandas, NumPy), Node.js; Data Engineering : ETL, SQL"
 * Returns: ["Python (Pandas, NumPy)", "Node.js", "ETL", "SQL"]
 */
export function parseSkillsToTags(skillsString) {
  if (!skillsString) return [];
  
  // Step 1: split by semicolons first (category groups)
  const groups = skillsString.split(';');
  const tags = [];
  
  for (const group of groups) {
    let cleaned = group.trim();
    if (!cleaned) continue;
    
    // Step 2: strip category prefix "Category : " (anything before first colon followed by space)
    cleaned = cleaned.replace(/^[^:,;]{1,40}\s*:\s*/, '');
    
    // Step 3: split remaining by commas
    const items = cleaned.split(',');
    for (const item of items) {
      // Strip ** bold markers and trim
      const tag = item.replace(/\*\*/g, '').trim();
      if (tag) tags.push(tag);
    }
  }
  
  return tags;
}

// --- Casing normalization for bullet points ---

const ACRONYMS = new Set([
  'KPI', 'KPIs', 'SQL', 'SCADA', 'GMAO', 'API', 'REST', 'AWS', 'GCP', 'HTML', 'CSS',
  'ETL', 'ERP', 'CRM', 'SaaS', 'PaaS', 'IoT', 'AI', 'ML', 'NLP', 'JSON', 'XML',
  'CSV', 'PDF', 'UI', 'UX', 'CI', 'CD', 'HTTP', 'HTTPS', 'URL', 'SDK', 'ORM',
  'JIRA', 'SAP', 'VBA', 'DAX', 'SEO', 'SEM', 'CMS', 'DNS', 'SSH', 'FTP',
  'MBA', 'PhD', 'MSc', 'BSc', 'BTS', 'DUT', 'BAC', 'SLA', 'ROI', 'B2B', 'B2C',
]);

const TOOL_CASING = {
  'node.js': 'Node.js', 'react.js': 'React.js', 'vue.js': 'Vue.js',
  'next.js': 'Next.js', 'express.js': 'Express.js', 'power bi': 'Power BI',
  'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 'mysql': 'MySQL',
  'nosql': 'NoSQL', 'graphql': 'GraphQL', 'javascript': 'JavaScript',
  'typescript': 'TypeScript', 'github': 'GitHub', 'gitlab': 'GitLab',
  'docker': 'Docker', 'kubernetes': 'Kubernetes', 'elasticsearch': 'Elasticsearch',
  'snowflake': 'Snowflake', 'databricks': 'Databricks', 'airflow': 'Airflow',
  'tableau': 'Tableau', 'amplitude': 'Amplitude', 'excel': 'Excel',
  'python': 'Python', 'hadoop': 'Hadoop', 'spark': 'Spark', 'kafka': 'Kafka',
  'redis': 'Redis', 'firebase': 'Firebase', 'supabase': 'Supabase',
  'figma': 'Figma', 'photoshop': 'Photoshop', 'azure': 'Azure',
  'data lake': 'Data Lake', 'data federation': 'Data Federation',
};

/**
 * Detect if a string is predominantly ALL CAPS (>70% uppercase, >8 letters).
 */
function isAllCaps(text) {
  if (typeof text !== 'string') return false;
  // Strip bold markers for detection
  const clean = text.replace(/\*\*/g, '');
  const letters = clean.replace(/[^a-zA-ZÀ-öØ-ý]/g, '');
  if (letters.length < 8) return false;
  // Count only uppercase: A-Z and uppercase accented (À-Ö, Ø-Þ)
  const upperCount = (clean.match(/[A-ZÀ-ÖØ-Þ]/g) || []).length;
  return (upperCount / letters.length) > 0.7;
}

/**
 * Convert ALL CAPS text to sentence case, preserving acronyms and tool names.
 * Returns text unchanged if not ALL CAPS.
 */
export function normalizeSentenceCase(text) {
  if (typeof text !== 'string' || !isAllCaps(text)) return text;

  // Preserve bold markers: extract them, normalize, re-inject
  const boldPositions = [];
  let cleanText = text;
  // Simple approach: normalize the whole text, bold markers included
  
  // Step 1: lowercase everything
  let result = text.toLowerCase();

  // Step 2: capitalize first letter of each sentence
  result = result.replace(/(^|[.!?]\s+)([a-zà-ö])/g, (m, sep, c) => sep + c.toUpperCase());
  result = result.replace(/^([a-zà-ö])/, m => m.toUpperCase());

  // Step 3: restore acronyms (whole words)
  for (const acronym of ACRONYMS) {
    const escaped = acronym.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, acronym);
  }

  // Step 4: restore tool names with proper casing
  for (const [lower, proper] of Object.entries(TOOL_CASING)) {
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, proper);
  }

  // Step 5: T-SQL special case
  result = result.replace(/\bt-SQL\b/gi, 'T-SQL');
  
  // Step 6: restore bold markers ** (they may have been lowered)
  result = result.replace(/\*\*/g, '**');

  return result;
}

/**
 * Render a bullet point: normalize casing then parse markdown.
 * Use this for experience bullets, project highlights, etc.
 */
export function renderBullet(text) {
  return parseMarkdown(normalizeSentenceCase(text));
}

export function markdownToHtml(md) {
  if (!md || typeof md !== 'string') return '';
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') return '';
  let text = html
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  return text;
}
