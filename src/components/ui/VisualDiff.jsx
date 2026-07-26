import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { parseMarkdown } from '../../utils/formatText';

/**
 * VisualDiff component with granular checkbox selection.
 * Each change can be individually accepted or rejected.
 * 
 * Props:
 * - original: the original resume data
 * - modified: the AI-modified resume data
 * - onSelectionChange(selectedIds): callback with Set of selected change IDs
 *     If not provided, all changes are accepted (legacy mode).
 */
export default function VisualDiff({ original, modified, onSelectionChange }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(new Set());
  const [diffItems, setDiffItems] = useState([]);

  // Build the diff items list
  useEffect(() => {
    const items = [];

    // Tagline Diff
    if (original.personal?.tagline !== modified.personal?.tagline && modified.personal?.tagline) {
      items.push({
        id: 'tagline',
        section: t('Professional Title / Tagline'),
        type: 'text',
        original: original.personal?.tagline,
        modified: modified.personal?.tagline
      });
    }

    // Summary Diff
    if (original.summary !== modified.summary && modified.summary) {
      items.push({
        id: 'summary',
        section: t('Professional Summary'),
        type: 'text',
        original: original.summary,
        modified: modified.summary
      });
    }

    // Skills Diff
    if (original.skills?.technical !== modified.skills?.technical) {
      items.push({
        id: 'skills.technical',
        section: t('Technical Skills'),
        type: 'text',
        original: original.skills?.technical,
        modified: modified.skills?.technical
      });
    }
    if (original.skills?.soft !== modified.skills?.soft) {
      items.push({
        id: 'skills.soft',
        section: t('Soft Skills'),
        type: 'text',
        original: original.skills?.soft,
        modified: modified.skills?.soft
      });
    }
    if (original.skills?.languages !== modified.skills?.languages && modified.skills?.languages) {
      items.push({
        id: 'skills.languages',
        section: t('Languages'),
        type: 'text',
        original: original.skills?.languages,
        modified: modified.skills?.languages
      });
    }

    // Experience Diff
    original.experience?.forEach((exp, idx) => {
      if (exp.isSpacer) return;
      const modExp = modified.experience?.find(e => e.id === exp.id) || modified.experience?.[idx];
      if (!modExp) return;

      const expId = exp.id || idx;

      // Title change
      if (exp.title !== modExp.title && modExp.title) {
        items.push({
          id: `exp.${expId}.title`,
          section: `${t('Experience')} : ${exp.company || ''}`,
          type: 'text',
          original: exp.title,
          modified: modExp.title
        });
      }

      // Technologies / Tags change
      if (exp.technologies !== modExp.technologies && modExp.technologies) {
        items.push({
          id: `exp.${expId}.tech`,
          section: `${exp.company || ''} — ${t('Tags / Technologies')}`,
          type: 'text',
          original: exp.technologies,
          modified: modExp.technologies
        });
      }

      // Bullet diffs
      exp.bullets?.forEach((bullet, bIdx) => {
        const modBullet = modExp.bullets?.[bIdx];
        if (bullet !== modBullet && modBullet) {
          items.push({
            id: `exp.${expId}.bullet.${bIdx}`,
            section: `${exp.company || ''} — ${exp.title || ''}`,
            type: 'text',
            original: bullet,
            modified: modBullet
          });
        }
      });
    });

    // Education Diff
    original.education?.forEach((edu, idx) => {
      if (edu.isSpacer) return;
      const modEdu = modified.education?.find(e => e.id === edu.id) || modified.education?.[idx];
      if (!modEdu) return;

      const eduId = edu.id || idx;
      if (edu.degree !== modEdu.degree && modEdu.degree) {
        items.push({
          id: `edu.${eduId}.degree`,
          section: `${t('Education')} : ${edu.institution || ''}`,
          type: 'text',
          original: edu.degree,
          modified: modEdu.degree
        });
      }
      if (edu.fieldOfStudy !== modEdu.fieldOfStudy && modEdu.fieldOfStudy) {
        items.push({
          id: `edu.${eduId}.field`,
          section: `${t('Education')} : ${edu.institution || ''}`,
          type: 'text',
          original: edu.fieldOfStudy,
          modified: modEdu.fieldOfStudy
        });
      }
    });

    // Projects Diff
    original.projects?.forEach((proj, idx) => {
      if (proj.isSpacer) return;
      const modProj = modified.projects?.find(p => p.id === proj.id) || modified.projects?.[idx];
      if (!modProj) return;

      const projId = proj.id || idx;

      if (proj.description !== modProj.description && modProj.description) {
        items.push({
          id: `proj.${projId}.desc`,
          section: `${t('Project')}: ${proj.name || ''}`,
          type: 'text',
          original: proj.description,
          modified: modProj.description
        });
      }

      if (proj.techStack !== modProj.techStack && modProj.techStack) {
        items.push({
          id: `proj.${projId}.tech`,
          section: `${t('Project')}: ${proj.name || ''} — ${t('Tags / Tech Stack')}`,
          type: 'text',
          original: proj.techStack,
          modified: modProj.techStack
        });
      }

      proj.highlights?.forEach((bullet, bIdx) => {
        const modBullet = modProj.highlights?.[bIdx];
        if (bullet !== modBullet && modBullet) {
          items.push({
            id: `proj.${projId}.highlight.${bIdx}`,
            section: `${t('Project')}: ${proj.name || ''}`,
            type: 'text',
            original: bullet,
            modified: modBullet
          });
        }
      });
    });

    // Certifications Diff
    original.certifications?.forEach((cert, idx) => {
      if (cert.isSpacer) return;
      const modCert = modified.certifications?.find(c => c.id === cert.id) || modified.certifications?.[idx];
      if (!modCert) return;

      const certId = cert.id || idx;
      if (cert.name !== modCert.name && modCert.name) {
        items.push({
          id: `cert.${certId}.name`,
          section: `${t('Certification')}: ${cert.name || ''}`,
          type: 'text',
          original: cert.name,
          modified: modCert.name
        });
      }
    });

    // Custom Sections Diff (langues, atouts, loisirs, user-created sections)
    original.customSections?.forEach((sec) => {
      const modSec = modified.customSections?.find(s => s.id === sec.id);
      if (!modSec) return;

      sec.items?.forEach((item, iIdx) => {
        if (item.isSpacer) return;
        const modItem = modSec.items?.find(i => i.id === item.id) || modSec.items?.[iIdx];
        if (!modItem) return;

        const itemId = item.id || iIdx;
        if (item.title !== modItem.title && modItem.title) {
          items.push({
            id: `custom.${sec.id}.${itemId}.title`,
            section: `${sec.label || 'Custom'}: ${item.title || ''}`,
            type: 'text',
            original: item.title,
            modified: modItem.title
          });
        }
        if (item.subtitle !== modItem.subtitle && modItem.subtitle) {
          items.push({
            id: `custom.${sec.id}.${itemId}.subtitle`,
            section: `${sec.label || 'Custom'}: ${item.title || ''}`,
            type: 'text',
            original: item.subtitle,
            modified: modItem.subtitle
          });
        }
        if (item.description !== modItem.description && modItem.description) {
          items.push({
            id: `custom.${sec.id}.${itemId}.desc`,
            section: `${sec.label || 'Custom'}: ${item.title || ''}`,
            type: 'text',
            original: item.description,
            modified: modItem.description
          });
        }
      });
    });

    setDiffItems(items);
    // Default: all selected
    const allIds = new Set(items.map(i => i.id));
    setSelected(allIds);
    if (onSelectionChange) onSelectionChange(allIds);
  }, [original, modified]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleItem = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (onSelectionChange) onSelectionChange(next);
      return next;
    });
  }, [onSelectionChange]);

  const toggleAll = useCallback((selectAll) => {
    const next = selectAll ? new Set(diffItems.map(i => i.id)) : new Set();
    setSelected(next);
    if (onSelectionChange) onSelectionChange(next);
  }, [diffItems, onSelectionChange]);

  if (diffItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--color-success-light, rgba(34, 197, 94, 0.1))', borderRadius: '12px', border: '1px solid var(--color-success, #22c55e)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text)' }}>
          {t('Your resume is already perfectly tailored!')}
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          {t('All skills and experiences match the job description. No further edits are needed.')}
        </p>
      </div>
    );
  }

  const isSelectable = !!onSelectionChange;
  const allSelected = selected.size === diffItems.length;
  const noneSelected = selected.size === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Select All / Deselect All controls */}
      {isSelectable && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '6px 8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)'
        }}>
          <span>{selected.size}/{diffItems.length} {t('changes selected')}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => toggleAll(true)}
              disabled={allSelected}
              style={{
                background: 'none', border: 'none', color: 'var(--color-accent)',
                cursor: allSelected ? 'default' : 'pointer',
                opacity: allSelected ? 0.5 : 1,
                fontSize: '12px', fontWeight: '600', padding: '2px 4px'
              }}
            >
              {t('Select all')}
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              disabled={noneSelected}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-secondary)',
                cursor: noneSelected ? 'default' : 'pointer',
                opacity: noneSelected ? 0.5 : 1,
                fontSize: '12px', fontWeight: '600', padding: '2px 4px'
              }}
            >
              {t('Deselect all')}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
        {diffItems.map((item) => {
          const isChecked = selected.has(item.id);
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: isSelectable ? '10px' : '0',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                backgroundColor: isSelectable && !isChecked ? 'var(--color-surface-alt)' : 'var(--color-surface)',
                opacity: isSelectable && !isChecked ? 0.55 : 1,
                transition: 'all 0.15s ease',
                cursor: isSelectable ? 'pointer' : 'default'
              }}
              onClick={isSelectable ? () => toggleItem(item.id) : undefined}
            >
              {isSelectable && (
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '2px', accentColor: 'var(--color-accent)', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                  {item.section}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    padding: '6px 10px',
                    backgroundColor: 'var(--color-danger-light)',
                    borderLeft: '3px solid var(--color-danger)',
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'line-through',
                    wordBreak: 'break-word'
                  }}>
                    {item.original ? parseMarkdown(item.original) : `(${t('Empty')})`}
                  </div>
                  <div style={{
                    padding: '6px 10px',
                    backgroundColor: 'var(--color-success-light)',
                    borderLeft: '3px solid var(--color-success)',
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    color: 'var(--color-text)',
                    wordBreak: 'break-word'
                  }}>
                    {parseMarkdown(item.modified)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
