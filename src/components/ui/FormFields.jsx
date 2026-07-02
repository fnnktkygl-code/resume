import { useState } from 'react';
import { useTranslation } from '../../utils/TranslationContext';

export function Field({ label, children, full }) {
  return (
    <div className={full ? 'field-full' : undefined}>
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', style, className }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input ${className || ''}`.trim()}
      style={style}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, onAIAssist, onAIBold, onAIRewrite }) {
  const { t } = useTranslation();

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      applyBold(e.target);
    }
  };

  const applyBold = (textarea) => {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return; // Nothing selected
    
    const selectedText = value.substring(start, end);
    // Toggle bold: if already wrapped in **, remove it
    const isBold = value.substring(start - 2, start) === '**' && value.substring(end, end + 2) === '**';
    
    let newValue, newCursorPos;
    if (isBold) {
      newValue = value.substring(0, start - 2) + selectedText + value.substring(end + 2);
      newCursorPos = start + selectedText.length - 2;
    } else {
      newValue = value.substring(0, start) + '**' + selectedText + '**' + value.substring(end);
      newCursorPos = start + selectedText.length + 2;
    }
    
    onChange(newValue);
    
    // Restore selection after React render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="textarea-wrapper" style={{ position: 'relative' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="textarea"
        style={{ paddingBottom: '36px' }}
      />
      <div className="textarea-toolbar" style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        backgroundColor: 'var(--color-surface)',
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button 
          type="button"
          onClick={(e) => applyBold(e.currentTarget.parentElement.previousSibling)}
          className="format-btn"
          title={t("Bold (Cmd+B)")}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '2px 6px',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '4px'
          }}
        >
          B
        </button>
        {onAIBold && (
          <button 
            type="button"
            onClick={onAIBold}
            className="format-btn ai-btn"
            title={t("AI Smart Bolding for this section")}
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <b>B</b> {t("Gras IA")}
          </button>
        )}
        {(onAIRewrite || onAIAssist) && (
          <button 
            type="button"
            onClick={onAIRewrite || onAIAssist}
            className="format-btn ai-btn"
            title={t("AI Reformulation for this section")}
            style={{
              background: 'var(--color-accent-light)',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✨ {t("Reformuler")}
          </button>
        )}
      </div>
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`select-input${!value ? ' placeholder' : ''}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const val = typeof o === 'object' && o !== null ? o.value : o;
        const lbl = typeof o === 'object' && o !== null ? o.label : o;
        return (
          <option key={val} value={val}>
            {lbl}
          </option>
        );
      })}
    </select>
  );
}
