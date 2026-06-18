import React from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export default function VisualDiff({ original, modified }) {
  const { t } = useTranslation();
  const diffItems = [];

  // Summary Diff
  if (original.summary !== modified.summary) {
    diffItems.push({
      section: t('Professional Summary'),
      type: 'text',
      original: original.summary,
      modified: modified.summary
    });
  }

  // Skills Diff
  if (original.skills?.technical !== modified.skills?.technical) {
    diffItems.push({
      section: t('Technical Skills'),
      type: 'text',
      original: original.skills?.technical,
      modified: modified.skills?.technical
    });
  }

  // Experience Diff
  original.experience?.forEach((exp, idx) => {
    const modExp = modified.experience?.[idx];
    if (!modExp) return;

    // Check bullets
    const bulletDiffs = [];
    exp.bullets?.forEach((bullet, bIdx) => {
      const modBullet = modExp.bullets?.[bIdx];
      if (bullet !== modBullet && modBullet) {
        bulletDiffs.push({
          original: bullet,
          modified: modBullet
        });
      }
    });

    if (bulletDiffs.length > 0) {
      diffItems.push({
        section: `${t('Experience')} : ${exp.company || ''} - ${exp.title || ''}`,
        type: 'bullets',
        changes: bulletDiffs
      });
    }
  });

  // Projects Diff
  original.projects?.forEach((proj, idx) => {
    const modProj = modified.projects?.[idx];
    if (!modProj) return;

    if (proj.description !== modProj.description && modProj.description) {
      diffItems.push({
        section: `${t('Project: {name}').replace('{name}', proj.name || '')} (${t('Description')})`,
        type: 'text',
        original: proj.description,
        modified: modProj.description
      });
    }

    const bulletDiffs = [];
    proj.highlights?.forEach((bullet, bIdx) => {
      const modBullet = modProj.highlights?.[bIdx];
      if (bullet !== modBullet && modBullet) {
        bulletDiffs.push({
          original: bullet,
          modified: modBullet
        });
      }
    });

    if (bulletDiffs.length > 0) {
      diffItems.push({
        section: t('Project: {name}').replace('{name}', proj.name || ''),
        type: 'bullets',
        changes: bulletDiffs
      });
    }
  });

  if (diffItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
        {t('No major changes detected.')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
      {diffItems.map((item, idx) => (
        <div key={idx} style={{ 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '12px',
          backgroundColor: 'var(--color-surface)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            {item.section}
          </h4>

          {item.type === 'text' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: 'var(--color-danger-light)', 
                borderLeft: '3px solid var(--color-danger)', 
                borderRadius: '4px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'line-through'
              }}>
                {item.original || `(${t('Empty')})`}
              </div>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: 'var(--color-success-light)', 
                borderLeft: '3px solid var(--color-success)', 
                borderRadius: '4px',
                fontSize: '13px',
                color: 'var(--color-text)'
              }}>
                {item.modified}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {item.changes.map((change, cIdx) => (
                <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ 
                    padding: '6px 10px', 
                    backgroundColor: 'var(--color-danger-light)', 
                    borderLeft: '3px solid var(--color-danger)', 
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'line-through'
                  }}>
                    {change.original}
                  </div>
                  <div style={{ 
                    padding: '6px 10px', 
                    backgroundColor: 'var(--color-success-light)', 
                    borderLeft: '3px solid var(--color-success)', 
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    color: 'var(--color-text)'
                  }}>
                    {change.modified}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
