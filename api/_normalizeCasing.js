/**
 * Shared utility: normalize ALL CAPS text to sentence case.
 * Deterministic (no AI), preserves acronyms and proper nouns.
 * Works for any CV in any language.
 */

// Common acronyms/tools to preserve in uppercase
const ACRONYMS = new Set([
  'KPI', 'KPIs', 'SQL', 'SCADA', 'GMAO', 'API', 'REST', 'AWS', 'GCP', 'HTML', 'CSS',
  'ETL', 'ERP', 'CRM', 'SaaS', 'PaaS', 'IoT', 'AI', 'ML', 'NLP', 'JSON', 'XML',
  'CSV', 'PDF', 'UI', 'UX', 'CI', 'CD', 'HTTP', 'HTTPS', 'URL', 'SDK', 'ORM',
  'JIRA', 'AGILE', 'SCRUM', 'SAP', 'VBA', 'DAX', 'SEO', 'SEM', 'CMS', 'DNS',
  'SSH', 'FTP', 'TCP', 'IP', 'RAM', 'GPU', 'CPU', 'SSD', 'HDD', 'USB',
  'MBA', 'PhD', 'MSc', 'BSc', 'BTS', 'DUT', 'BAC',
]);

// Tool names that should keep specific casing (matched case-insensitively)
const TOOL_CASING = {
  'node.js': 'Node.js',
  'react.js': 'React.js',
  'vue.js': 'Vue.js',
  'next.js': 'Next.js',
  'express.js': 'Express.js',
  'power bi': 'Power BI',
  'power query': 'Power Query',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'nosql': 'NoSQL',
  'graphql': 'GraphQL',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'jenkins': 'Jenkins',
  'datadog': 'Datadog',
  'elasticsearch': 'Elasticsearch',
  'snowflake': 'Snowflake',
  'databricks': 'Databricks',
  'airflow': 'Airflow',
  'tableau': 'Tableau',
  'amplitude': 'Amplitude',
  'excel': 'Excel',
  'python': 'Python',
  'java': 'Java',
  'scala': 'Scala',
  'hadoop': 'Hadoop',
  'spark': 'Spark',
  'kafka': 'Kafka',
  'redis': 'Redis',
  'linux': 'Linux',
  'windows': 'Windows',
  'azure': 'Azure',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  'figma': 'Figma',
  'photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
};

/**
 * Detect if a string is predominantly ALL CAPS.
 * Returns true if > 70% of alphabetical characters are uppercase and the string has > 8 letters.
 */
function isAllCaps(text) {
  if (typeof text !== 'string') return false;
  const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (letters.length < 8) return false;
  const upperCount = (text.match(/[A-ZÀ-Ÿ]/g) || []).length;
  return (upperCount / letters.length) > 0.7;
}

/**
 * Convert an ALL CAPS string to sentence case, preserving acronyms and tool names.
 * If the string is not ALL CAPS, returns it unchanged.
 */
export function normalizeSentenceCase(text) {
  if (typeof text !== 'string' || !isAllCaps(text)) return text;

  // Step 1: Convert to lowercase
  let result = text.toLowerCase();

  // Step 2: Capitalize first letter of each sentence (after . or start of string)
  result = result.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (match, sep, char) => sep + char.toUpperCase());
  
  // Also capitalize first character if it's a letter
  result = result.replace(/^([a-zà-ÿ])/, (match) => match.toUpperCase());

  // Step 3: Restore acronyms — match whole words only
  for (const acronym of ACRONYMS) {
    const regex = new RegExp(`\\b${acronym.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, acronym);
  }

  // Step 4: Restore tool names with specific casing
  for (const [lower, proper] of Object.entries(TOOL_CASING)) {
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, proper);
  }

  // Step 5: Preserve T-SQL specifically (hyphenated acronym)
  result = result.replace(/\bt-sql\b/gi, 'T-SQL');

  return result;
}

/**
 * Recursively normalize casing across all text fields in a resume JSON.
 * Processes: summary, experience bullets/title/company, projects highlights/description, etc.
 */
export function normalizeResumeCasing(resumeData) {
  if (!resumeData) return resumeData;
  const data = JSON.parse(JSON.stringify(resumeData)); // deep clone

  // Normalize summary
  if (data.summary) data.summary = normalizeSentenceCase(data.summary);
  
  // Normalize tagline
  if (data.personal?.tagline) data.personal.tagline = normalizeSentenceCase(data.personal.tagline);

  // Normalize experience
  if (Array.isArray(data.experience)) {
    for (const exp of data.experience) {
      if (Array.isArray(exp.bullets)) {
        exp.bullets = exp.bullets.map(b => normalizeSentenceCase(b));
      }
      // Don't normalize title/company — those may legitimately be uppercase
    }
  }

  // Normalize projects
  if (Array.isArray(data.projects)) {
    for (const proj of data.projects) {
      if (proj.description) proj.description = normalizeSentenceCase(proj.description);
      if (Array.isArray(proj.highlights)) {
        proj.highlights = proj.highlights.map(h => normalizeSentenceCase(h));
      }
    }
  }

  // Normalize custom sections
  if (Array.isArray(data.customSections)) {
    for (const section of data.customSections) {
      if (Array.isArray(section.items)) {
        for (const item of section.items) {
          if (item.description) item.description = normalizeSentenceCase(item.description);
        }
      }
    }
  }

  return data;
}
