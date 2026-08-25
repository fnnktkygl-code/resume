import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { markdownToHtml, htmlToMarkdown } from '../../utils/formatText';

export function Field({ label, children, full }) {
  return (
    <div className={full ? 'field-full' : undefined} style={{ minWidth: 0, maxWidth: '100%' }}>
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  );
}

function WysiwygEditor({
  value,
  onChange,
  placeholder,
  multiline = true,
  rows = 3,
  onAIAssist,
  onAIBold,
  onAIRewrite,
  onAITranslate,
  style,
  className,
  showBoldButton = true
}) {
  const { t } = useTranslation();
  const editorRef = useRef(null);
  const lastMarkdownRef = useRef(value || '');

  // Synchronize when value changes externally (e.g. from AI, reset, undo)
  useEffect(() => {
    if (editorRef.current) {
      const currentMd = htmlToMarkdown(editorRef.current.innerHTML);
      if (value !== currentMd && value !== lastMarkdownRef.current) {
        editorRef.current.innerHTML = markdownToHtml(value || '');
        lastMarkdownRef.current = value || '';
      }
    }
  }, [value]);

  // Initial load
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = markdownToHtml(value || '');
      lastMarkdownRef.current = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const md = htmlToMarkdown(editorRef.current.innerHTML);
      lastMarkdownRef.current = md;
      onChange(md);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false, null);
      handleInput();
    }
  };

  const applyBold = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('bold', false, null);
      handleInput();
    }
  };

  const hasToolbar = showBoldButton || onAIBold || onAIRewrite || onAIAssist || onAITranslate;

  return (
    <div className="textarea-wrapper" style={{ position: 'relative', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`input wysiwyg-editor ${className || ''}`.trim()}
        style={{
          minHeight: multiline ? `${Math.max(rows * 24, 60)}px` : '42px',
          padding: hasToolbar ? '8px 12px 34px 12px' : '8px 12px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowX: 'hidden',
          overflowY: multiline ? 'auto' : 'hidden',
          lineHeight: '1.5',
          fontSize: '13px',
          color: 'var(--color-text)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'text',
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          ...style
        }}
      />
      {hasToolbar && (
        <div className="textarea-toolbar" style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          padding: '2px 5px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 5
        }}>
          {showBoldButton && (
            <button 
              type="button"
              onMouseDown={applyBold}
              className="format-btn"
              data-tooltip={t("Bold (Cmd+B)")}
              data-tooltip-pos="top"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px'
              }}
            >
              B
            </button>
          )}
          {onAIBold && (
            <button 
              type="button"
              onClick={onAIBold}
              className="format-btn ai-btn"
              data-tooltip={t("AI Smart Bolding for this section")}
              data-tooltip-pos="top"
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
              data-tooltip={t("AI Suggestions / Reformulation")}
              data-tooltip-pos="top"
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
              ✨ {t("Suggestion IA")}
            </button>
          )}
          {onAITranslate && (
            <button 
              type="button"
              onClick={onAITranslate}
              className="format-btn ai-btn"
              data-tooltip={t("AI Translate")}
              data-tooltip-pos="top"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: 'none',
                color: '#10B981',
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
              🌐 {t("Traduire")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', style, className, showBoldButton, richText, onAIAssist, onAITranslate }) {
  if (showBoldButton || richText || onAIAssist || onAITranslate) {
    return (
      <WysiwygEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={true}
        rows={2}
        onAIAssist={onAIAssist}
        onAITranslate={onAITranslate}
        style={style}
        className={className}
        showBoldButton={showBoldButton !== false}
      />
    );
  }

  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input ${className || ''}`.trim()}
      style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', ...style }}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, onAIAssist, onAIBold, onAIRewrite, onAITranslate, style, className }) {
  return (
    <WysiwygEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      multiline={true}
      rows={rows}
      onAIAssist={onAIAssist}
      onAIBold={onAIBold}
      onAIRewrite={onAIRewrite}
      onAITranslate={onAITranslate}
      style={style}
      className={className}
      showBoldButton={true}
    />
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`select-input${!value ? ' placeholder' : ''}`}
      style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
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
