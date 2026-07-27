import { useState, useRef, useCallback } from 'react';
import { parseSkillsToTags } from '../../utils/formatText';

/**
 * TagInput – a chip/badge-based input for comma-separated values.
 * Each item is rendered as a tag with an × button.
 * Typing + Enter/comma/Tab adds a new tag.
 * Backspace on empty input removes the last tag.
 * 
 * Uses parseSkillsToTags to handle complex formats:
 *   "Category : item1, item2; Category2 : item3" → ["item1", "item2", "item3"]
 */
export default function TagInput({ value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Parse value into clean tags using shared utility
  const tags = parseSkillsToTags(value);

  const commitTag = useCallback((raw) => {
    const tag = raw.replace(/\*\*/g, '').trim();
    if (!tag) return;
    const newTags = [...tags, tag];
    onChange(newTags.join(', '));
    setInputValue('');
  }, [tags, onChange]);

  const removeTag = useCallback((index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(', '));
  }, [tags, onChange]);

  const handleKeyDown = useCallback((e) => {
    const val = inputValue;

    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',') && val.trim()) {
      e.preventDefault();
      commitTag(val);
      return;
    }

    if (e.key === 'Backspace' && val === '' && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  }, [inputValue, tags, commitTag, removeTag]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    // Use the same parser for pasted content
    const items = parseSkillsToTags(pasted);
    if (items.length > 0) {
      const newTags = [...tags, ...items];
      onChange(newTags.join(', '));
      setInputValue('');
    }
  }, [tags, onChange]);

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
