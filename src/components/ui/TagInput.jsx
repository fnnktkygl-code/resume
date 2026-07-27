import { useState, useRef, useCallback } from 'react';

/**
 * TagInput – a chip/badge-based input for comma-separated values.
 * Each item is rendered as a tag with an × button.
 * Typing + Enter/comma/Tab adds a new tag.
 * Backspace on empty input removes the last tag.
 * 
 * Props:
 *   value: string (comma-separated)
 *   onChange: (newValue: string) => void
 *   placeholder: string
 *   separator: string (default ',') — can also use ';' for groups
 */

// Strip markdown bold markers from display
const stripBold = (s) => s.replace(/\*\*/g, '');

export default function TagInput({ value, onChange, placeholder, separator = ',' }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const tags = value
    ? value.split(separator).map(s => stripBold(s).trim()).filter(Boolean)
    : [];

  const commitTag = useCallback((raw) => {
    const tag = stripBold(raw).trim();
    if (!tag) return;
    const newTags = [...tags, tag];
    onChange(newTags.join(`${separator} `));
    setInputValue('');
  }, [tags, onChange, separator]);

  const removeTag = useCallback((index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(`${separator} `));
  }, [tags, onChange, separator]);

  const handleKeyDown = useCallback((e) => {
    const val = inputValue;

    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === separator) && val.trim()) {
      e.preventDefault();
      commitTag(val);
      return;
    }

    if (e.key === 'Backspace' && val === '' && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  }, [inputValue, tags, commitTag, removeTag, separator]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const items = pasted.split(separator).map(s => stripBold(s).trim()).filter(Boolean);
    if (items.length > 0) {
      const newTags = [...tags, ...items];
      onChange(newTags.join(`${separator} `));
      setInputValue('');
    }
  }, [tags, onChange, separator]);

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      commitTag(inputValue);
    }
  }, [inputValue, commitTag]);

  return (
    <div
      className="tag-input-container"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={`${tag}-${i}`} className="tag-chip">
          <span className="tag-chip-text">{tag}</span>
          <button
            type="button"
            className="tag-chip-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="tag-input-field"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  );
}
