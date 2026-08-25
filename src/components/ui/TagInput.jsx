import { useState, useRef, useCallback } from 'react';

/**
 * TagInput – chip/badge-based input for comma-separated values.
 * Allows toggling bold (**) per chip with a 'B' button or click.
 */
export default function TagInput({ value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Parse raw value into tags list preserving ** markers
  const rawTags = (value || '').split(',').map(s => s.trim()).filter(Boolean);

  const commitTag = useCallback((raw) => {
    const tag = raw.trim();
    if (!tag) return;
    const newTags = [...rawTags, tag];
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

  const handleKeyDown = useCallback((e) => {
    const val = inputValue;

    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',') && val.trim()) {
      e.preventDefault();
      commitTag(val);
      return;
    }

    if (e.key === 'Backspace' && val === '' && rawTags.length > 0) {
      e.preventDefault();
      removeTag(rawTags.length - 1);
    }
  }, [inputValue, rawTags, commitTag, removeTag]);

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

  return (
    <div
      className="tag-input-container"
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 'var(--radius-md, 6px)',
        border: '1px solid var(--color-border, #ccc)',
        backgroundColor: 'var(--color-surface, #fff)',
        minHeight: '42px',
        cursor: 'text'
      }}
    >
      {rawTags.map((rawTag, i) => {
        const isBold = rawTag.includes('**');
        const cleanText = rawTag.replace(/\*\*/g, '');
        return (
          <span
            key={`${cleanText}-${i}`}
            className="tag-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: isBold ? '700' : '400',
              border: isBold ? '1px solid var(--color-accent, #1B6B3A)' : '1px solid var(--color-border, #ddd)',
              backgroundColor: isBold ? 'rgba(var(--color-accent-rgb, 27, 107, 58), 0.12)' : 'var(--color-surface-alt)',
              color: isBold ? 'var(--color-accent)' : 'var(--color-text)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              userSelect: 'none',
              transition: 'all 0.15s ease'
            }}
          >
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
                fontSize: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                lineHeight: '1.2'
              }}
            >
              B
            </button>
            <span
              onClick={(e) => { e.stopPropagation(); toggleBoldTag(i); }}
              style={{ cursor: 'pointer' }}
              title="Cliquer pour basculer le gras"
            >
              {cleanText}
            </span>
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
                color: 'inherit'
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
        placeholder={rawTags.length === 0 ? placeholder : ''}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          flex: '1 1 120px',
          fontSize: '13px',
          color: 'var(--color-text)'
        }}
      />
    </div>
  );
}
