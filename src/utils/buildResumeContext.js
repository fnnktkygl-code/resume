/**
 * Builds a condensed context object from resume data for AI prompts.
 * This avoids sending the entire resume JSON to the API while providing
 * enough context for intelligent, coherent suggestions.
 */

/**
 * Checks whether the resume has enough data for AI to generate meaningful content.
 * @param {Object} data - The full resume data object
 * @returns {{ isEmpty: boolean, reason: string|null }}
 */
export function checkResumeReadiness(data) {
  if (!data) return { isEmpty: true, reason: 'no_data' };

  const hasName = !!data.personal?.name?.trim();
  const hasTitle = !!data.personal?.tagline?.trim();
  const hasExperience = data.experience?.some(
    (e) => !e.isSpacer && (e.company?.trim() || e.title?.trim())
  );
  const hasSkills = !!(data.skills?.technical?.trim() || data.skills?.soft?.trim());
  const hasSummary = !!data.summary?.trim();
  const hasJobDesc = !!data.targetJobDescription?.trim();

  // At minimum, we need a title OR some experience OR a summary OR skills OR job description to generate useful content
  const hasMinimum = hasTitle || hasExperience || hasSummary || hasSkills || hasJobDesc;

  if (!hasMinimum) {
    return {
      isEmpty: true,
      reason: 'insufficient_data',
    };
  }

  return { isEmpty: false, reason: null };
}

/**
 * Builds a condensed resume context for AI prompts.
 * @param {Object} data - The full resume data object
 * @returns {Object} A compact context object
 */
export function buildResumeContext(data) {
  if (!data) return {};

  const context = {};

  // Personal info (minimal)
  if (data.personal) {
    context.name = data.personal.name || '';
    context.title = data.personal.tagline || '';
    context.location = data.personal.location || '';
  }

  // Summary
  if (data.summary?.trim()) {
    context.summary = data.summary.trim();
  }

  // Experience (condensed: title + company + key bullets)
  if (data.experience?.length) {
    context.experience = data.experience
      .filter((e) => !e.isSpacer && (e.company || e.title))
      .map((e) => ({
        title: e.title || '',
        company: e.company || '',
        technologies: e.technologies || '',
        bullets: (e.bullets || []).filter((b) => b.trim()).slice(0, 3),
      }));
  }

  // Education (condensed)
  if (data.education?.length) {
    context.education = data.education
      .filter((e) => !e.isSpacer && (e.institution || e.degree))
      .map((e) => ({
        degree: e.degree || '',
        field: e.field || '',
        institution: e.institution || '',
      }));
  }

  // Current skills
  if (data.skills) {
    context.currentSkills = {};
    if (data.skills.technical?.trim()) context.currentSkills.technical = data.skills.technical;
    if (data.skills.soft?.trim()) context.currentSkills.soft = data.skills.soft;
    if (data.skills.languages?.trim()) context.currentSkills.languages = data.skills.languages;
  }

  // Projects (condensed)
  if (data.projects?.length) {
    context.projects = data.projects
      .filter((p) => !p.isSpacer && p.name)
      .map((p) => ({
        name: p.name || '',
        techStack: p.techStack || '',
        description: p.description || '',
      }));
  }

  // Certifications (condensed)
  if (data.certifications?.length) {
    context.certifications = data.certifications
      .filter((c) => !c.isSpacer && c.name)
      .map((c) => c.name);
  }

  // Custom sections (condensed — just labels and item titles)
  if (data.customSections?.length) {
    context.customSections = data.customSections
      .filter((s) => !s.id?.startsWith('spacer_'))
      .map((s) => ({
        id: s.id,
        label: s.label || '',
        items: (s.items || [])
          .filter((item) => !item.isSpacer && item.title)
          .map((item) => item.title),
      }));
  }

  return context;
}
