import { useState } from 'react';
import { Field, TextInput, TextArea } from '../ui/FormFields';
import { useTranslation } from '../../utils/TranslationContext';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

function PersonIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c0-3.6 3.36-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 8.5C4 7.67 4.67 7 5.5 7H7.5L8.5 5H15.5L16.5 7H18.5C19.33 7 20 7.67 20 8.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CloseIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function PersonalStep({ data, headings, onChange, onHeadingsChange, onAISectionFill, layout, onLayoutChange }) {
  const { t } = useTranslation();
  const [uploadError, setUploadError] = useState('');
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const update = (field, val) => onChange({ ...data, [field]: val });
  const updateHeading = (field, val) => onHeadingsChange && onHeadingsChange({ ...headings, [field]: val });
  const updateLayout = (field, val) => onLayoutChange && onLayoutChange({ ...layout, [field]: val });

  const processPhotoFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setUploadError(t('Please choose an image file (PNG, JPG...).'));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setUploadError(t('Photo is too large. Please upload an image under 2MB.'));
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({ ...data, photo: event.target.result, showPhoto: true });
    };
    reader.onerror = () => setUploadError(t('Could not read this file. Please try another one.'));
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    processPhotoFile(e.target.files[0]);
    e.target.value = ''; // allows re-selecting the same file later
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processPhotoFile(e.dataTransfer?.files?.[0]);
  };

  const handleRemovePhoto = () => {
    setUploadError('');
    onChange({ ...data, photo: null, showPhoto: false });
  };

  const isSplit = layout?.splitLinks === undefined ? true : layout.splitLinks;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div>
        <div className="card-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👤</span> {t('Personal Information')}
        </div>
        <div className="card-subtitle" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {t('Your contact details — placed in the main body (never in headers/footers) so ATS parsers capture them correctly.')}
        </div>
      </div>

      {/* Card Group 1: Profile Photo */}
      <div style={{
        background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📸</span> {t('Photo de profil')}
        </div>

        {/* Avatar + Action Row */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', minWidth: 0 }}>
          {/* Single hidden input, shared by the avatar and the button below via htmlFor */}
          <input
            id="photo-upload-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />

          {/* Avatar: clickable, drag & drop, hover/focus overlay, no more mis-centered icon */}
          <label
            htmlFor="photo-upload-input"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            onFocus={() => setIsAvatarHovered(true)}
            onBlur={() => setIsAvatarHovered(false)}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handlePhotoDrop}
            aria-label={data.photo ? t('Change profile photo') : t('Add profile photo')}
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              backgroundColor: data.photo ? 'var(--color-surface)' : 'var(--color-accent-light, rgba(99,102,241,0.08))',
              border: data.photo
                ? '2px solid var(--color-border)'
                : `2px dashed ${isDragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
              outlineOffset: '2px'
            }}
          >
            {data.photo ? (
              <img src={data.photo} alt={t('Profile preview')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <span style={{ display: 'flex', color: 'var(--color-text-secondary)', opacity: 0.55 }}>
                <PersonIcon size={26} />
              </span>
            )}

            {(isAvatarHovered || isDragOver) && (
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                color: '#ffffff',
                pointerEvents: 'none'
              }}>
                <CameraIcon size={16} />
                <span style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.2px' }}>
                  {isDragOver ? t('Drop it') : (data.photo ? t('Change') : t('Add'))}
                </span>
              </div>
            )}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                htmlFor="photo-upload-input"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', margin: 0, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CameraIcon size={14} />
                {data.photo ? t('Change Photo') : t('Upload Photo')}
              </label>
              {data.photo && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRemovePhoto}
                  style={{ padding: '8px 14px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', borderRadius: '8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <CloseIcon size={11} />
                  {t('Remove')}
                </button>
              )}
            </div>

            {uploadError && (
              <div role="alert" style={{ fontSize: '11.5px', color: 'var(--color-danger)', fontWeight: 600 }}>
                ⚠ {uploadError}
              </div>
            )}

            {data.photo ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', color: 'var(--color-text)', userSelect: 'none', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={!!data.showPhoto}
                  onChange={(e) => onChange({ ...data, showPhoto: e.target.checked })}
                  style={{ width: '14px', height: '14px', margin: 0 }}
                />
                {t('Show profile photo on resume')}
              </label>
            ) : (
              !uploadError && (
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                  {t('PNG or JPG, up to 2MB — or drop it on the circle')}
                </span>
              )
            )}
          </div>
        </div>

        {/* Warning Banner */}
        <div style={{
          fontSize: '11.5px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.45',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px'
        }}>
          <span style={{ flexShrink: 0 }}>ℹ️</span>
          <span>{t('photo_warning_text')}</span>
        </div>
      </div>

      {/* Card Group 2: Identity & Title */}
      <div style={{
        background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🏷️</span> {t('Full Name')} & {t('Professional Title / Tagline')}
        </div>
        <div className="field-grid" style={{ gridTemplateColumns: '1fr', minWidth: 0, width: '100%' }}>
          <Field label={t('Full Name')}>
            <TextInput value={data.name} onChange={(v) => update('name', v)} placeholder="Jane Doe" />
          </Field>
          <div style={{ minWidth: 0, width: '100%' }}>
            <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>{t('Professional Title / Tagline')}</label>
            <TextArea
              value={data.tagline}
              onChange={(v) => update('tagline', v)}
              placeholder={t('Senior Software Engineer')}
              rows={2}
              onAIAssist={onAISectionFill ? () => onAISectionFill('tagline') : undefined}
            />
          </div>
        </div>
      </div>

      {/* Card Group 3: Contact Channels */}
      <div style={{
        background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📬</span> {t('Coordonnées de Contact')}
        </div>
        <div className="field-grid" style={{ minWidth: 0, width: '100%' }}>
          <Field label={t('Email')}>
            <TextInput value={data.email} onChange={(v) => update('email', v)} placeholder="jane@example.com" type="email" />
          </Field>
          <Field label={t('Phone')}>
            <TextInput value={data.phone} onChange={(v) => update('phone', v)} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label={t('Location')} full>
            <TextInput value={data.location} onChange={(v) => update('location', v)} placeholder="San Francisco, CA" />
          </Field>
        </div>
      </div>

      {/* Card Group 4: Online Profiles & Layout */}
      <div style={{
        background: 'var(--color-surface-alt, rgba(0,0,0,0.02))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔗</span> {t('Liens & Disposition')}
        </div>

        {/* Segmented Pill Toggle for Contact Layout */}
        <div>
          <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>{t('Contact Layout')}</label>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--color-border)', width: '100%', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => updateLayout('splitLinks', false)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isSplit === false ? '700' : '500',
                border: 'none',
                background: isSplit === false ? 'var(--color-accent)' : 'transparent',
                color: isSplit === false ? '#ffffff' : 'var(--color-text-secondary)',
                boxShadow: isSplit === false ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('Single line')}
            </button>
            <button
              type="button"
              onClick={() => updateLayout('splitLinks', true)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isSplit === true ? '700' : '500',
                border: 'none',
                background: isSplit === true ? 'var(--color-accent)' : 'transparent',
                color: isSplit === true ? '#ffffff' : 'var(--color-text-secondary)',
                boxShadow: isSplit === true ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('Separate line for links')}
            </button>
          </div>
        </div>

        <div className="field-grid" style={{ minWidth: 0, width: '100%' }}>
          <Field label={t('LinkedIn URL')}>
            <TextInput value={data.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/janedoe" />
          </Field>
          <Field label={t('GitHub URL')}>
            <TextInput value={data.github} onChange={(v) => update('github', v)} placeholder="github.com/janedoe" />
          </Field>
          <Field label={t('Personal Website')} full>
            <TextInput value={data.website} onChange={(v) => update('website', v)} placeholder="janedoe.dev" />
          </Field>
        </div>
      </div>

      <div className="tip" style={{ borderRadius: '10px', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', color: 'var(--color-text)' }}>
        💡 <strong>{t('ATS Tip')}:</strong> {t('Never place contact info in document headers or footers — most parsers skip those areas entirely.')}
      </div>
    </div>
  );
}