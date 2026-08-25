import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TagInput – chip/badge-based input for comma/semicolon-separated values.
 * Allows inline editing of each chip, toggling bold (**), and raw text mode.
 */
export default function TagInput({ value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Parse raw value into tags list splitting by commas, semicolons and newlines while preserving ** markers
  const rawTags = (value || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

  // Auto focus inline edit input when entering edit mode
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const commitTag = useCallback((raw) => {
    const tag = raw.trim();
    if (!tag) return;
    const items = tag.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const newTags = [...rawTags, ...items];
    onChange(newTags.join(', '));
    setInputValue('');
  }, [rawTags, onChange]);

  const removeTag = useCallback((index) => {
    const newTags = rawTags.filter((_, i) => i !== index);
    onChange(newTags.join(', '));
  }, [rawTags, onChange]);

  const toggleBoldTag = useCallback((index) => {
    const newTags = rawTags.map((t, i) => {
      if (i !== index) return t;
      const clean = t.replace(/\*\*/g, '').trim();
      return t.includes('**') ? clean : `**${clean}**`;
    });
    onChange(newTags.join(', '));
  }, [rawTags, onChange]);

  const startEditingTag = useCallback((index) => {
    const tag = rawTags[index] || '';
    const clean = tag.replace(/\*\*/g, '').trim();
    setEditingIndex(index);
    setEditingText(clean);
  }, [rawTags]);

  const saveEditedTag = useCallback((index) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      removeTag(index);
    } else {
      const isBold = rawTags[index]?.includes('**');
      const clean = trimmed.replace(/\*\*/g, '');
      const newTag = isBold ? `**${clean}**` : clean;
      const newTags = [...rawTags];
      newTags[index] = newTag;
      onChange(newTags.join(', '));
    }
    setEditingIndex(null);
  }, [editingText, rawTags, removeTag, onChange]);

  const handleKeyDown = useCallback((e) => {
    const val = inputValue;

    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',' || e.key === ';') && val.trim()) {
      e.preventDefault();
      commitTag(val);
      return;
    }

    if (e.key === 'Backspace' && val === '' && rawTags.length > 0) {
      e.preventDefault();
      removeTag(rawTags.length - 1);
    }
  }, [inputValue, rawTags, commitTag, removeTag]);

  const handleEditKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      saveEditedTag(index);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingIndex(null);
    }
  }, [saveEditedTag]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const items = pasted.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (items.length > 0) {
      const newTags = [...rawTags, ...items];
      onChange(newTags.join(', '));
      setInputValue('');
    }
  }, [rawTags, onChange]);

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      commitTag(inputValue);
    }
  }, [inputValue, commitTag]);

  if (isRawMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setIsRawMode(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px'
            }}
          >
            🏷️ Mode Tags
          </button>
        </div>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-border, #ccc)',
            backgroundColor: 'var(--color-surface, #fff)',
            color: 'var(--color-text)',
            fontSize: '13px',
            lineHeight: '1.5',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          {rawTags.length > 0 ? `${rawTags.length} compétence${rawTags.length > 1 ? 's' : ''} (cliquez sur une compétence pour l'éditer)` : ''}
        </span>
        <button
          type="button"
          onClick={() => setIsRawMode(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '2px 4px',
            textDecoration: 'underline'
          }}
          title="Modifier tout le texte brut"
        >
          📝 Mode texte brut
        </button>
      </div>

      <div
        className="tag-input-container"
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--color-border, #ccc)',
          backgroundColor: 'var(--color-surface, #fff)',
          minHeight: '44px',
          cursor: 'text',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {rawTags.map((rawTag, i) => {
          const isBold = rawTag.includes('**');
          const cleanText = rawTag.replace(/\*\*/g, '');
          const isEditing = editingIndex === i;

          if (isEditing) {
            return (
              <span
                key={`edit-${i}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--color-surface)',
                  border: '1.5px solid var(--color-accent)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  boxShadow: '0 0 0 2px var(--color-accent-light)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, i)}
                  onBlur={() => saveEditedTag(i)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    fontSize: '12.5px',
                    fontWeight: isBold ? '700' : '500',
                    fontFamily: 'inherit',
                    minWidth: '80px',
                    width: `${Math.max(editingText.length + 2, 8)}ch`,
                    maxWidth: '220px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => saveEditedTag(i)}
                  title="Valider la modification"
                  style={{
                    background: 'var(--color-accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  ✓
                </button>
              </span>
            );
          }

          return (
            <span
              key={`${cleanText}-${i}`}
              className="tag-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: isBold ? '700' : '450',
                border: isBold ? '1px solid var(--color-accent, #1B6B3A)' : '1px solid var(--color-border, #ddd)',
                backgroundColor: isBold ? 'rgba(var(--color-accent-rgb, 27, 107, 58), 0.12)' : 'var(--color-surface-alt, #f8f9fa)',
                color: isBold ? 'var(--color-accent)' : 'var(--color-text)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                lineHeight: '1.4',
                maxWidth: '100%',
                wordBreak: 'break-word',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Bold Toggle Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleBoldTag(i); }}
                title="Mettre en gras / Retirer le gras"
                style={{
                  background: isBold ? 'var(--color-accent)' : 'transparent',
                  color: isBold ? '#fff' : 'var(--color-text-secondary)',
                  border: isBold ? 'none' : '1px solid var(--color-border)',
                  borderRadius: '3px',
                  padding: '0 4px',
                  fontSize: '9.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  lineHeight: '1.2',
                  flexShrink: 0
                }}
              >
                B
              </button>

              {/* Editable Skill Label */}
              <span
                onClick={(e) => { e.stopPropagation(); startEditingTag(i); }}
                title="Cliquer pour modifier cette compétence"
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px dashed transparent',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
              >
                {cleanText}
              </span>

              {/* Edit Pencil Icon */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); startEditingTag(i); }}
                title="Modifier le texte"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.5,
                  padding: '0 2px',
                  fontSize: '11px',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✏️
              </button>

              {/* Delete Button */}
              <button
                type="button"
                className="tag-chip-remove"
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                aria-label={`Remove ${cleanText}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.6,
                  padding: '0 2px',
                  fontSize: '13px',
                  color: 'inherit',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          className="tag-input-field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={rawTags.length === 0 ? placeholder : '+ Ajouter...'}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: '1 1 120px',
            fontSize: '13px',
            color: 'var(--color-text)',
            minWidth: '100px'
          }}
        />
      </div>
    </div>
  );
}
