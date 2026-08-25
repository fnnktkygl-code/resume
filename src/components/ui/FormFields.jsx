import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../utils/TranslationContext';
import { markdownToHtml, htmlToMarkdown } from '../../utils/formatText';
import { translateTextWithProxy } from '../../services/geminiService';

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
  className
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
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('bold', false, null);
      }
      handleInput();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('italic', false, null);
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
      handleSelect();
    }
  };

  const applyItalic = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('italic', false, null);
      }
      handleInput();
      handleSelect();
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

      const topPos = rect.top - editorRect.top - 38;
      const leftPos = rect.left - editorRect.left + (rect.width / 2) - 65;

      setBubblePosition({
        top: topPos < 0 ? -38 : topPos,
        left: Math.max(4, Math.min(Math.max(10, editorRect.width - 135), leftPos))
      });
    } else {
      setSelectionRange(null);
      setBubblePosition(null);
    }
  };

  // Auto-dismiss floating bubble on outside click or selection collapse
  useEffect(() => {
    if (!bubblePosition) return;
    const handleOutsideClick = (e) => {
      if (editorRef.current && !editorRef.current.contains(e.target) && !e.target.closest('.floating-selection-bubble')) {
        setBubblePosition(null);
        setSelectionRange(null);
      }
    };
    const handleDocSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !editorRef.current || !editorRef.current.contains(sel.anchorNode)) {
        setBubblePosition(null);
        setSelectionRange(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('selectionchange', handleDocSelection);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('selectionchange', handleDocSelection);
    };
  }, [bubblePosition]);

  const handleTranslateSelection = async () => {
    setBubblePosition(null);
    if (onAITranslate) {
      onAITranslate();
      return;
    }
    if (!selectionRange || !selectionRange.text) return;
    try {
      const targetLang = 'en';
      const translated = await translateTextWithProxy(selectionRange.text, targetLang);
      if (translated && editorRef.current) {
        editorRef.current.focus();
        if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
          document.execCommand('insertText', false, translated);
        }
        handleInput();
      }
    } catch (err) {
      console.error("Inline translate error:", err);
    }
  };

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
          
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />
          
          <button
            type="button"
            onClick={() => {
              setBubblePosition(null);
              if (onAIRewrite || onAIAssist) {
                (onAIRewrite || onAIAssist)();
              } else if (onAIBold) {
                onAIBold();
              }
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

          <button
            type="button"
            onClick={handleTranslateSelection}
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
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          if (!e.relatedTarget || !e.relatedTarget.closest('.floating-selection-bubble')) {
            setBubblePosition(null);
            setSelectionRange(null);
          }
        }}
        data-placeholder={placeholder}
        className={`input wysiwyg-editor ${className || ''}`.trim()}
        style={{
          minHeight: multiline ? `${Math.max(rows * 24, 60)}px` : '38px',
          height: multiline ? 'auto' : '38px',
          padding: multiline ? '10px 14px' : '8px 12px',
          outline: 'none',
          whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
          wordBreak: multiline ? 'break-word' : 'normal',
          overflowX: multiline ? 'hidden' : 'auto',
          overflowY: multiline ? 'auto' : 'hidden',
          lineHeight: multiline ? '1.5' : '20px',
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

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  style,
  className,
  onAIAssist,
  onAIBold,
  onAIRewrite,
  onAITranslate
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [bubblePosition, setBubblePosition] = useState(null);
  const [selectionRange, setSelectionRange] = useState(null);

  // Auto-dismiss floating bubble on outside click
  useEffect(() => {
    if (!bubblePosition) return;
    const handleOutsideClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) && !e.target.closest('.floating-selection-bubble')) {
        setBubblePosition(null);
        setSelectionRange(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [bubblePosition]);

  const handleSelect = () => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (typeof start === 'number' && typeof end === 'number' && start !== end) {
      const selectedText = input.value.substring(start, end).trim();
      if (selectedText.length > 0) {
        setSelectionRange({ start, end, text: selectedText });
        const inputRect = input.getBoundingClientRect();
        setBubblePosition({
          top: -38,
          left: Math.max(4, Math.min(Math.max(10, inputRect.width - 135), (inputRect.width / 2) - 65))
        });
      } else {
        setBubblePosition(null);
        setSelectionRange(null);
      }
    } else {
      setBubblePosition(null);
      setSelectionRange(null);
    }
  };

  const applyBold = (e) => {
    e.preventDefault();
    if (!selectionRange || !inputRef.current) return;
    const { start, end, text } = selectionRange;
    const val = value || '';
    const isBold = text.startsWith('**') && text.endsWith('**');
    const newText = isBold ? text.slice(2, -2) : `**${text}**`;
    const updated = val.substring(0, start) + newText + val.substring(end);
    onChange(updated);
    setBubblePosition(null);
  };

  const applyItalic = (e) => {
    e.preventDefault();
    if (!selectionRange || !inputRef.current) return;
    const { start, end, text } = selectionRange;
    const val = value || '';
    const isItalic = text.startsWith('*') && text.endsWith('*') && !text.startsWith('**');
    const newText = isItalic ? text.slice(1, -1) : `*${text}*`;
    const updated = val.substring(0, start) + newText + val.substring(end);
    onChange(updated);
    setBubblePosition(null);
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    setBubblePosition(null);
    if (onAITranslate) {
      onAITranslate();
      return;
    }
    if (!selectionRange || !inputRef.current) return;
    try {
      const targetLang = 'en';
      const translated = await translateTextWithProxy(selectionRange.text, targetLang);
      if (translated) {
        const val = value || '';
        const updated = val.substring(0, selectionRange.start) + translated + val.substring(selectionRange.end);
        onChange(updated);
      }
    } catch (err) {
      console.error("Translate error:", err);
    }
  };

  return (
    <div className="input-wrapper" style={{ position: 'relative', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
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
          
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />
          
          <button
            type="button"
            onClick={() => {
              setBubblePosition(null);
              if (onAIRewrite || onAIAssist) {
                (onAIRewrite || onAIAssist)();
              } else if (onAIBold) {
                onAIBold();
              }
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

          <button
            type="button"
            onClick={handleTranslate}
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
        </div>
      )}
      <input
        ref={inputRef}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onBlur={(e) => {
          if (!e.relatedTarget || !e.relatedTarget.closest('.floating-selection-bubble')) {
            setBubblePosition(null);
            setSelectionRange(null);
          }
        }}
        placeholder={placeholder}
        className={`input ${className || ''}`.trim()}
        style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', ...style }}
      />
    </div>
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
