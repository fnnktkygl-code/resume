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

export function WysiwygEditor({
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

  const [showAIMenu, setShowAIMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAIMenu(false);
      }
    };
    if (showAIMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAIMenu]);

  const aiActions = [];
  if (onAIRewrite || onAIAssist) {
    aiActions.push({
      label: t("Suggestion / Formulation Harvard XYZ"),
      icon: "✨",
      action: () => { setShowAIMenu(false); (onAIRewrite || onAIAssist)(); }
    });
  }
  if (onAIBold) {
    aiActions.push({
      label: t("Mettre en valeur les chiffres & métriques"),
      icon: "💡",
      action: () => { setShowAIMenu(false); onAIBold(); }
    });
  }
  if (onAITranslate) {
    aiActions.push({
      label: t("Traduire ce champ"),
      icon: "🌐",
      action: () => { setShowAIMenu(false); onAITranslate(); }
    });
  }

  const hasToolbar = showBoldButton || aiActions.length > 0;

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
          gap: '4px',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          padding: '2px 4px',
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

          {aiActions.length === 1 && (
            <button
              type="button"
              onClick={aiActions[0].action}
              className="format-btn ai-btn"
              data-tooltip={aiActions[0].label}
              data-tooltip-pos="top"
              style={{
                background: 'var(--color-accent-light, rgba(27, 107, 58, 0.08))',
                border: 'none',
                color: 'var(--color-accent, #1B6B3A)',
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
              {aiActions[0].icon} {aiActions[0].label.split(' ')[0]}
            </button>
          )}

          {aiActions.length > 1 && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowAIMenu(prev => !prev)}
                className="format-btn ai-btn"
                data-tooltip={t("Actions IA pour ce champ")}
                data-tooltip-pos="top"
                style={{
                  background: showAIMenu ? 'var(--color-accent)' : 'var(--color-accent-light, rgba(27, 107, 58, 0.08))',
                  border: 'none',
                  color: showAIMenu ? '#ffffff' : 'var(--color-accent, #1B6B3A)',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                ✨ {t("IA")} <span style={{ fontSize: '9px', opacity: 0.7 }}>▾</span>
              </button>

              {showAIMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  right: 0,
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '4px',
                  minWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 100
                }}>
                  {aiActions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={item.action}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'var(--color-text, #1e293b)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.12s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover, rgba(0,0,0,0.04))'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
