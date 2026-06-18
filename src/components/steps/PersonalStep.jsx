import { useState } from 'react';
import { Field, TextInput } from '../ui/FormFields';
import { useTranslation } from '../../utils/TranslationContext';

export default function PersonalStep({ data, headings, onChange, onHeadingsChange }) {
  const { t } = useTranslation();
  const update = (field, val) => onChange({ ...data, [field]: val });
  const updateHeading = (field, val) => onHeadingsChange({ ...headings, [field]: val });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('Photo is too large. Please upload an image under 2MB.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...data,
          photo: event.target.result,
          showPhoto: true
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onChange({
      ...data,
      photo: null,
      showPhoto: false
    });
  };

  return (
    <div className="card">
      <div className="card-title">{t('Personal Information')}</div>
      <div className="card-subtitle">
        {t('Your contact details — placed in the main body (never in headers/footers) so ATS parsers capture them correctly.')}
      </div>

      {/* Profile Photo Upload Section */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', marginTop: '15px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {data.photo ? (
            <img src={data.photo} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '24px', opacity: '0.5' }}>👤</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="btn-primary" style={{ padding: '6px 12px', fontSize: '12.5px', cursor: 'pointer', borderRadius: '6px', display: 'inline-block', margin: 0 }}>
              {t('Upload Photo')}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
            {data.photo && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleRemovePhoto} 
                style={{ padding: '6px 12px', fontSize: '12.5px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', borderRadius: '6px' }}
              >
                {t('Remove')}
              </button>
            )}
          </div>
          {data.photo && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', color: 'var(--color-text)', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={!!data.showPhoto} 
                onChange={(e) => onChange({ ...data, showPhoto: e.target.checked })} 
                style={{ width: '14px', height: '14px', margin: 0 }}
              />
              {t('Show profile photo on resume')}
            </label>
          )}
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4', marginTop: '2px', maxWidth: '320px' }}>
            ℹ️ {t('photo_warning_text')}
          </div>
        </div>
      </div>

      <div className="field-grid">
        <Field label={t('Full Name')} full>
          <TextInput value={data.name} onChange={(v) => update('name', v)} placeholder="Jane Doe" />
        </Field>
        <Field label={t('Professional Title / Tagline')} full>
          <TextInput value={data.tagline} onChange={(v) => update('tagline', v)} placeholder={t('Senior Software Engineer')} />
        </Field>
        <Field label={t('Email')}>
          <TextInput value={data.email} onChange={(v) => update('email', v)} placeholder="jane@example.com" type="email" />
        </Field>
        <Field label={t('Phone')}>
          <TextInput value={data.phone} onChange={(v) => update('phone', v)} placeholder="+1 (555) 000-0000" />
        </Field>
        <Field label={t('Location')} full>
          <TextInput value={data.location} onChange={(v) => update('location', v)} placeholder="San Francisco, CA" />
        </Field>
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
      <div className="tip">
        💡 <strong>{t('ATS Tip')}:</strong> {t('Never place contact info in document headers or footers — most parsers skip those areas entirely.')}
      </div>

      <div className="section-divider" style={{ marginTop: '24px' }}>{t('Section Headings Customization')}</div>
      <div className="card-subtitle">
        {t('Customize how section headings appear on your resume. Useful for tailoring headers to a specific industry.')}
      </div>
      <div className="field-grid" style={{ marginTop: '16px' }}>
        <Field label={t('Summary Header')}>
          <TextInput value={headings?.summary || ''} onChange={v => updateHeading('summary', v)} />
        </Field>
        <Field label={t('Experience Header')}>
          <TextInput value={headings?.experience || ''} onChange={v => updateHeading('experience', v)} />
        </Field>
        <Field label={t('Education Header')}>
          <TextInput value={headings?.education || ''} onChange={v => updateHeading('education', v)} />
        </Field>
        <Field label={t('Skills Header')}>
          <TextInput value={headings?.skills || ''} onChange={v => updateHeading('skills', v)} />
        </Field>
        <Field label={t('Projects Header')}>
          <TextInput value={headings?.projects || ''} onChange={v => updateHeading('projects', v)} />
        </Field>
        <Field label={t('Certifications Header')}>
          <TextInput value={headings?.certifications || ''} onChange={v => updateHeading('certifications', v)} />
        </Field>
      </div>
    </div>
  );
}
