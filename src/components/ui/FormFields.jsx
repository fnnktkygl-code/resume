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
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('bold', false, null);
      }
      handleInput();
    }
  };

  const applyBold = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('bold', false, null);
      }
      handleInput();
    }
  };

  const [selectionRange, setSelectionRange] = useState(null);
  const [bubblePosition, setBubblePosition] = useState(null);

  // Detect selection inside the editor
  const handleSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current || !editorRef.current.contains(sel.anchorNode)) {
      setSelectionRange(null);
      setBubblePosition(null);
      return;
    }

    const text = sel.toString().trim();
    if (text.length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      setSelectionRange({
        text,
        range: range.cloneRange()
      });

      setBubblePosition({
        top: Math.max(0, rect.top - editorRect.top - 42),
        left: Math.max(10, Math.min(editorRect.width - 240, rect.left - editorRect.left + (rect.width / 2) - 100))
      });
    } else {
      setSelectionRange(null);
      setBubblePosition(null);
    }
  };

  const applyItalic = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('italic', false, null);
      handleInput();
      handleSelect();
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
      action: () => { 
        setShowAIMenu(false); 
        setBubblePosition(null);
        (onAIRewrite || onAIAssist)(); 
      }
    });
  }
  if (onAIBold) {
    aiActions.push({
      label: t("Mettre en valeur les chiffres & métriques"),
      icon: "💡",
      action: () => { 
        setShowAIMenu(false); 
        setBubblePosition(null);
        onAIBold(); 
      }
    });
  }
  if (onAITranslate) {
    aiActions.push({
      label: t("Traduire ce champ"),
      icon: "🌐",
      action: () => { 
        setShowAIMenu(false); 
        setBubblePosition(null);
        onAITranslate(); 
      }
    });
  }

  const hasToolbar = showBoldButton || aiActions.length > 0;

  return (
    <div 
      className="textarea-wrapper" 
      style={{ position: 'relative', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
      onMouseUp={handleSelect}
      onKeyUp={handleSelect}
    >
      {/* Floating Selection Toolbar (Pure Notion & Japandi Washi Style) */}
      {bubblePosition && (
        <div 
          className="floating-selection-bubble"
          style={{
            position: 'absolute',
            top: `${bubblePosition.top}px`,
            left: `${bubblePosition.left}px`,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: '8px',
            padding: '3px 4px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
            animation: 'fadeInScale 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--color-border, rgba(0, 0, 0, 0.1))'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={applyBold}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text, #1A1918)',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              borderRadius: '6px',
              transition: 'background-color 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt, #F4F3EF)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={t("Bold (Cmd+B)")}
          >
            B
          </button>
          <button
            type="button"
            onClick={applyItalic}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text, #1A1918)',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontStyle: 'italic',
              fontWeight: '600',
              fontFamily: 'serif',
              borderRadius: '6px',
              transition: 'background-color 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt, #F4F3EF)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={t("Italic (Cmd+I)")}
          >
            i
          </button>
          
          {(onAIRewrite || onAIAssist) && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />
              <button
                type="button"
                onClick={() => {
                  setBubblePosition(null);
                  (onAIRewrite || onAIAssist)();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent, #2D5A43)',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  borderRadius: '6px',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-light, rgba(45, 90, 67, 0.1))'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title={t("Améliorer avec l'IA (Formule Harvard XYZ)")}
              >
                ✨
              </button>
            </>
          )}

          {onAITranslate && (
            <>
              {!onAIRewrite && !onAIAssist && <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />}
              <button
                type="button"
                onClick={() => {
                  setBubblePosition(null);
                  onAITranslate();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary, #737373)',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  borderRadius: '6px',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt, #F4F3EF)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title={t("Traduire la sélection")}
              >
                🌐
              </button>
            </>
          )}
        </div>
      )}

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
          padding: '10px 14px',
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
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', style, className }) {
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
