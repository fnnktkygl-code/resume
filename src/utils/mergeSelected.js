/**
 * Shared merge function for AI features (Bold, Tailor, Translate).
 * Merges selected changes from modified data into original data.
 * Covers ALL resume sections: personal, summary, skills, experience,
 * education, projects, certifications, and customSections.
 */
export function mergeSelected(original, modified, selectedIds) {
  const merged = structuredClone(original);

  // Tagline
  if (selectedIds.has('tagline') && modified.personal?.tagline !== original.personal?.tagline) {
    merged.personal = merged.personal || {};
    merged.personal.tagline = modified.personal.tagline;
  }

  // Summary
  if (selectedIds.has('summary') && modified.summary !== original.summary) {
    merged.summary = modified.summary;
  }

  // Skills
  if (selectedIds.has('skills.technical') && modified.skills?.technical !== original.skills?.technical) {
    merged.skills = merged.skills || {};
    merged.skills.technical = modified.skills.technical;
  }
  if (selectedIds.has('skills.soft') && modified.skills?.soft !== original.skills?.soft) {
    merged.skills = merged.skills || {};
    merged.skills.soft = modified.skills.soft;
  }
  if (selectedIds.has('skills.languages') && modified.skills?.languages !== original.skills?.languages) {
    merged.skills = merged.skills || {};
    merged.skills.languages = modified.skills.languages;
  }

  // Experience
  original.experience?.forEach((exp, idx) => {
    if (exp.isSpacer) return;
    const modExp = modified.experience?.find(e => e.id === exp.id) || modified.experience?.[idx];
    if (!modExp || !merged.experience?.[idx]) return;

    const expId = exp.id || idx;
    if (selectedIds.has(`exp.${expId}.title`) && modExp.title !== exp.title) {
      merged.experience[idx].title = modExp.title;
    }
    if (selectedIds.has(`exp.${expId}.tech`) && modExp.technologies !== exp.technologies) {
      merged.experience[idx].technologies = modExp.technologies;
    }
    exp.bullets?.forEach((bullet, bIdx) => {
      if (selectedIds.has(`exp.${expId}.bullet.${bIdx}`) && modExp.bullets?.[bIdx] && modExp.bullets[bIdx] !== bullet) {
        merged.experience[idx].bullets[bIdx] = modExp.bullets[bIdx];
      }
    });
  });

  // Education
  original.education?.forEach((edu, idx) => {
    if (edu.isSpacer) return;
    const modEdu = modified.education?.find(e => e.id === edu.id) || modified.education?.[idx];
    if (!modEdu || !merged.education?.[idx]) return;

    const eduId = edu.id || idx;
    if (selectedIds.has(`edu.${eduId}.degree`) && modEdu.degree !== edu.degree) {
      merged.education[idx].degree = modEdu.degree;
    }
    if (selectedIds.has(`edu.${eduId}.field`) && modEdu.fieldOfStudy !== edu.fieldOfStudy) {
      merged.education[idx].fieldOfStudy = modEdu.fieldOfStudy;
    }
  });

  // Projects
  original.projects?.forEach((proj, idx) => {
    if (proj.isSpacer) return;
    const modProj = modified.projects?.find(p => p.id === proj.id) || modified.projects?.[idx];
    if (!modProj || !merged.projects?.[idx]) return;

    const projId = proj.id || idx;
    if (selectedIds.has(`proj.${projId}.desc`) && modProj.description !== proj.description) {
      merged.projects[idx].description = modProj.description;
    }
    if (selectedIds.has(`proj.${projId}.tech`) && modProj.techStack !== proj.techStack) {
      merged.projects[idx].techStack = modProj.techStack;
    }
    proj.highlights?.forEach((h, bIdx) => {
      if (selectedIds.has(`proj.${projId}.highlight.${bIdx}`) && modProj.highlights?.[bIdx] && modProj.highlights[bIdx] !== h) {
        merged.projects[idx].highlights[bIdx] = modProj.highlights[bIdx];
      }
    });
  });

  // Certifications
  original.certifications?.forEach((cert, idx) => {
    if (cert.isSpacer) return;
    const modCert = modified.certifications?.find(c => c.id === cert.id) || modified.certifications?.[idx];
    if (!modCert || !merged.certifications?.[idx]) return;

    const certId = cert.id || idx;
    if (selectedIds.has(`cert.${certId}.name`) && modCert.name !== cert.name) {
      merged.certifications[idx].name = modCert.name;
    }
  });

  // Custom Sections (langues, atouts, loisirs, user-created)
  original.customSections?.forEach((sec, sIdx) => {
    const modSec = modified.customSections?.find(s => s.id === sec.id);
    if (!modSec || !merged.customSections?.[sIdx]) return;

    sec.items?.forEach((item, iIdx) => {
      if (item.isSpacer) return;
      const modItem = modSec.items?.find(i => i.id === item.id) || modSec.items?.[iIdx];
      if (!modItem || !merged.customSections[sIdx].items?.[iIdx]) return;

      const itemId = item.id || iIdx;
      if (selectedIds.has(`custom.${sec.id}.${itemId}.title`) && modItem.title !== item.title) {
        merged.customSections[sIdx].items[iIdx].title = modItem.title;
      }
      if (selectedIds.has(`custom.${sec.id}.${itemId}.subtitle`) && modItem.subtitle !== item.subtitle) {
        merged.customSections[sIdx].items[iIdx].subtitle = modItem.subtitle;
      }
      if (selectedIds.has(`custom.${sec.id}.${itemId}.desc`) && modItem.description !== item.description) {
        merged.customSections[sIdx].items[iIdx].description = modItem.description;
      }
    });
  });

  if (modified.headings) merged.headings = modified.headings;

  return merged;
}
