import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../utils/TranslationContext';

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

    // Experience Diff
    original.experience?.forEach((exp, idx) => {
      const modExp = modified.experience?.[idx];
      if (!modExp) return;

      // Title change
      if (exp.title !== modExp.title && modExp.title) {
        items.push({
          id: `exp.${idx}.title`,
          section: `${t('Experience')} : ${exp.company || ''}`,
          type: 'text',
          original: exp.title,
          modified: modExp.title
        });
      }

      // Bullet diffs
      exp.bullets?.forEach((bullet, bIdx) => {
        const modBullet = modExp.bullets?.[bIdx];
        if (bullet !== modBullet && modBullet) {
          items.push({
            id: `exp.${idx}.bullet.${bIdx}`,
            section: `${exp.company || ''} — ${exp.title || ''}`,
            type: 'text',
            original: bullet,
            modified: modBullet
          });
        }
      });
    });

    // Projects Diff
    original.projects?.forEach((proj, idx) => {
      const modProj = modified.projects?.[idx];
      if (!modProj) return;

      if (proj.description !== modProj.description && modProj.description) {
        items.push({
          id: `proj.${idx}.desc`,
          section: `${t('Project')}: ${proj.name || ''}`,
          type: 'text',
          original: proj.description,
          modified: modProj.description
        });
      }

      proj.highlights?.forEach((bullet, bIdx) => {
        const modBullet = modProj.highlights?.[bIdx];
        if (bullet !== modBullet && modBullet) {
          items.push({
            id: `proj.${idx}.highlight.${bIdx}`,
            section: `${t('Project')}: ${proj.name || ''}`,
            type: 'text',
            original: bullet,
            modified: modBullet
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
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
        {t('No major changes detected.')}
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
                    {item.original || `(${t('Empty')})`}
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
                    {item.modified}
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
