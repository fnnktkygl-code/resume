/**
 * Shared merge function for AI features (Bold, Tailor, Translate).
 * Merges selected changes from modified data into original data.
 * Covers ALL resume sections: personal, summary, skills, experience,
 * education, projects, certifications, customSections, and headings.
 */
export function mergeSelected(original, rawModified, selectedIds) {
  if (!original) return rawModified || {};
  const modified = rawModified?.translatedResume || rawModified || {};
  const merged = structuredClone(original);
  const ids = selectedIds instanceof Set ? selectedIds : new Set(Array.isArray(selectedIds) ? selectedIds : []);

  // 1. Personal Info
  if (ids.has('tagline') && modified.personal?.tagline !== undefined && modified.personal.tagline !== original.personal?.tagline) {
    merged.personal = merged.personal || {};
    merged.personal.tagline = modified.personal.tagline;
  }
  if (ids.has('location') && modified.personal?.location !== undefined && modified.personal.location !== original.personal?.location) {
    merged.personal = merged.personal || {};
    merged.personal.location = modified.personal.location;
  }

  // 2. Summary
  if (ids.has('summary') && modified.summary !== undefined && modified.summary !== original.summary) {
    merged.summary = modified.summary;
  }

  // 3. Skills
  if (ids.has('skills.technical') && modified.skills?.technical !== undefined && modified.skills.technical !== original.skills?.technical) {
    merged.skills = merged.skills || {};
    merged.skills.technical = modified.skills.technical;
  }
  if (ids.has('skills.soft') && modified.skills?.soft !== undefined && modified.skills.soft !== original.skills?.soft) {
    merged.skills = merged.skills || {};
    merged.skills.soft = modified.skills.soft;
  }
  if (ids.has('skills.languages') && modified.skills?.languages !== undefined && modified.skills.languages !== original.skills?.languages) {
    merged.skills = merged.skills || {};
    merged.skills.languages = modified.skills.languages;
  }
  if (modified.skills?.highlightedSkills && JSON.stringify(modified.skills.highlightedSkills) !== JSON.stringify(original.skills?.highlightedSkills)) {
    if (ids.has('skills.highlightedSkills') || ids.size === 0) {
      merged.skills = merged.skills || {};
      merged.skills.highlightedSkills = modified.skills.highlightedSkills;
    }
  }

  // 4. Experience
  original.experience?.forEach((exp, idx) => {
    if (exp.isSpacer) return;
    const modExp = modified.experience?.find(e => e.id === exp.id) || modified.experience?.[idx];
    if (!modExp || !merged.experience?.[idx]) return;

    const expId = exp.id || idx;
    if (ids.has(`exp.${expId}.title`) && modExp.title !== undefined && modExp.title !== exp.title) {
      merged.experience[idx].title = modExp.title;
    }
    if (ids.has(`exp.${expId}.location`) && modExp.location !== undefined && modExp.location !== exp.location) {
      merged.experience[idx].location = modExp.location;
    }
    if (ids.has(`exp.${expId}.date`) && modExp.date !== undefined && modExp.date !== exp.date) {
      merged.experience[idx].date = modExp.date;
    }
    if (ids.has(`exp.${expId}.tech`) && modExp.technologies !== undefined && modExp.technologies !== exp.technologies) {
      merged.experience[idx].technologies = modExp.technologies;
    }
    if (ids.has(`exp.${expId}.desc`) && modExp.description !== undefined && modExp.description !== exp.description) {
      merged.experience[idx].description = modExp.description;
    }
    exp.bullets?.forEach((bullet, bIdx) => {
      if (ids.has(`exp.${expId}.bullet.${bIdx}`) && modExp.bullets?.[bIdx] !== undefined && modExp.bullets[bIdx] !== bullet) {
        merged.experience[idx].bullets[bIdx] = modExp.bullets[bIdx];
      }
    });
  });

  // 5. Education
  original.education?.forEach((edu, idx) => {
    if (edu.isSpacer) return;
    const modEdu = modified.education?.find(e => e.id === edu.id) || modified.education?.[idx];
    if (!modEdu || !merged.education?.[idx]) return;

    const eduId = edu.id || idx;
    if (ids.has(`edu.${eduId}.degree`) && modEdu.degree !== undefined && modEdu.degree !== edu.degree) {
      merged.education[idx].degree = modEdu.degree;
    }
    if (ids.has(`edu.${eduId}.field`) && modEdu.fieldOfStudy !== undefined && modEdu.fieldOfStudy !== edu.fieldOfStudy) {
      merged.education[idx].fieldOfStudy = modEdu.fieldOfStudy;
    }
    if (ids.has(`edu.${eduId}.location`) && modEdu.location !== undefined && modEdu.location !== edu.location) {
      merged.education[idx].location = modEdu.location;
    }
  });

  // 6. Projects
  original.projects?.forEach((proj, idx) => {
    if (proj.isSpacer) return;
    const modProj = modified.projects?.find(p => p.id === proj.id) || modified.projects?.[idx];
    if (!modProj || !merged.projects?.[idx]) return;

    const projId = proj.id || idx;
    if (ids.has(`proj.${projId}.role`) && modProj.role !== undefined && modProj.role !== proj.role) {
      merged.projects[idx].role = modProj.role;
    }
    if (ids.has(`proj.${projId}.desc`) && modProj.description !== undefined && modProj.description !== proj.description) {
      merged.projects[idx].description = modProj.description;
    }
    if (ids.has(`proj.${projId}.tech`) && modProj.techStack !== undefined && modProj.techStack !== proj.techStack) {
      merged.projects[idx].techStack = modProj.techStack;
    }
    proj.highlights?.forEach((h, bIdx) => {
      if (ids.has(`proj.${projId}.highlight.${bIdx}`) && modProj.highlights?.[bIdx] !== undefined && modProj.highlights[bIdx] !== h) {
        merged.projects[idx].highlights[bIdx] = modProj.highlights[bIdx];
      }
    });
  });

  // 7. Certifications
  original.certifications?.forEach((cert, idx) => {
    if (cert.isSpacer) return;
    const modCert = modified.certifications?.find(c => c.id === cert.id) || modified.certifications?.[idx];
    if (!modCert || !merged.certifications?.[idx]) return;

    const certId = cert.id || idx;
    if (ids.has(`cert.${certId}.name`) && modCert.name !== undefined && modCert.name !== cert.name) {
      merged.certifications[idx].name = modCert.name;
    }
  });

  // 8. Custom Sections (langues, atouts, loisirs, custom)
  original.customSections?.forEach((sec, sIdx) => {
    const modSec = modified.customSections?.find(s => s.id === sec.id) || modified.customSections?.[sIdx];
    if (!modSec || !merged.customSections?.[sIdx]) return;

    if (ids.has(`custom.${sec.id}.title`) && (modSec.title || modSec.label)) {
      merged.customSections[sIdx].title = modSec.title || modSec.label;
      merged.customSections[sIdx].label = modSec.label || modSec.title;
    }

    sec.items?.forEach((item, iIdx) => {
      if (item.isSpacer) return;
      const modItem = modSec.items?.find(i => i.id === item.id) || modSec.items?.[iIdx];
      if (!modItem || !merged.customSections[sIdx].items?.[iIdx]) return;

      const itemId = item.id || iIdx;
      if (ids.has(`custom.${sec.id}.${itemId}.title`) && modItem.title !== undefined && modItem.title !== item.title) {
        merged.customSections[sIdx].items[iIdx].title = modItem.title;
      }
      if (ids.has(`custom.${sec.id}.${itemId}.subtitle`) && modItem.subtitle !== undefined && modItem.subtitle !== item.subtitle) {
        merged.customSections[sIdx].items[iIdx].subtitle = modItem.subtitle;
      }
      if (ids.has(`custom.${sec.id}.${itemId}.desc`) && modItem.description !== undefined && modItem.description !== item.description) {
        merged.customSections[sIdx].items[iIdx].description = modItem.description;
      }
    });
  });

  // 9. Headings
  if (modified.headings) {
    merged.headings = { ...merged.headings, ...modified.headings };
  }

  return merged;
}
