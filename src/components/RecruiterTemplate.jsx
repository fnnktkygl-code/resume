import { memo } from 'react';
import { parseMarkdown } from '../utils/formatText';

function RecruiterTemplate({ data, layout = {}, language = 'en' }) {
  const p = data.personal;
  const hasContact = p.name || p.email || p.phone;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const validProj = data.projects.filter(pr => pr.name);
  const validCert = data.certifications.filter(c => c.name);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;

  const h = data.headings || {};
  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

  const {
    fontSize = 10,
    lineHeight = 1.35,
    paddingX = 0.6,
    paddingY = 0.6,
    sectionSpacing = 8,
    itemSpacing = 8,
  } = layout;

  const formatDate = (m, y) => {
    if (!m && !y) return '';
    if (m && y) return `${m} ${y}`;
    return y || m || '';
  };

  // Helper to render tags/pills from comma-separated strings or custom fields
  const renderTags = (tagsString) => {
    if (!tagsString) return null;
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) return null;
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
        {tags.map((tag, idx) => (
          <span
            key={idx}
            style={{
              fontSize: '0.75em',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '1px 6px',
              display: 'inline-block',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key="summary" style={{ marginBottom: `${sectionSpacing}px` }}>
            <div
              className="resume-section-header"
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '2px',
                marginBottom: '6px'
              }}
            >
              <span>💼</span> {language === 'fr' ? 'RÉSUMÉ PROFESSIONNEL' : 'EXECUTIVE SUMMARY'}
            </div>
            <div style={{ fontWeight: '500', fontSize: '1em', color: '#111', fontStyle: 'italic', textAlign: 'justify' }}>
              {parseMarkdown(data.summary)}
            </div>
          </div>
        );

      case 'experience':
        if (!validExp.length) return null;
        return (
          <div key="experience" style={{ marginBottom: `${sectionSpacing}px` }}>
            <div
              className="resume-section-header"
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '2px',
                marginBottom: '8px'
              }}
            >
              <span>💼</span> {h.experience || (language === 'fr' ? 'EXPÉRIENCE' : 'WORK EXPERIENCE')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validExp.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111' }}>
                      📊 {exp.title}
                    </span>
                    <span style={{ fontSize: '0.85em', color: '#555', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {formatDate(exp.startMonth, exp.startYear)}
                      {(exp.startMonth || exp.startYear) && ' — '}
                      {exp.current ? (h.present || 'Present') : formatDate(exp.endMonth, exp.endYear)}
                    </span>
                  </div>
                  <div style={{ color: '#0F3A8C', fontWeight: 'bold', fontSize: '0.95em', margin: '2px 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔗 {exp.company}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: '#333' }}>
                        <span style={{ color: '#0F3A8C', fontWeight: 'bold' }}>&gt;</span>
                        <div style={{ flex: 1 }}>{parseMarkdown(b)}</div>
                      </div>
                    ))}
                  </div>
                  {/* Render technologies used in this experience */}
                  {exp.technologies && renderTags(exp.technologies)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!validEdu.length) return null;
        return (
          <div key="education" style={{ marginBottom: `${sectionSpacing}px` }}>
            <div
              className="resume-section-header"
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '2px',
                marginBottom: '8px'
              }}
            >
              <span>🏛️</span> {h.education || (language === 'fr' ? 'ÉDUCATION' : 'EDUCATION')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validEdu.map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', pageBreakInside: 'avoid' }}>
                  <div style={{ width: '80px', flexShrink: 0, fontSize: '0.9em', color: '#555', textAlign: 'right', fontWeight: 'bold' }}>
                    <div>{edu.endYear || edu.startYear}</div>
                    <div style={{ fontSize: '0.8em', color: '#888', fontWeight: 'normal' }}>{edu.location || 'Paris'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#0F3A8C', textTransform: 'uppercase' }}>
                      {[edu.degree, edu.field].filter(Boolean).join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9em', color: '#333', marginTop: '2px' }}>
                      <span style={{ color: '#0F3A8C', fontWeight: 'bold' }}>&gt;</span> {edu.institution}
                    </div>
                    {edu.technologies && renderTags(edu.technologies)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!hasSkills) return null;
        // Grouped layout for skills
        const skillsList = [];
        if (data.skills.technical) {
          skillsList.push({ label: language === 'fr' ? 'PROGRAMMING' : 'PROGRAMMING', value: data.skills.technical });
        }
        if (data.skills.soft) {
          skillsList.push({ label: language === 'fr' ? 'COMPÉTENCES' : 'SOFT SKILLS', value: data.skills.soft });
        }
        return (
          <div key="skills" style={{ marginBottom: `${sectionSpacing}px` }}>
            <div
              className="resume-section-header"
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '2px',
                marginBottom: '8px'
              }}
            >
              <span>💡</span> {h.skills || (language === 'fr' ? 'COMPÉTENCES & OUTILS' : 'SKILLS & TOOLS')}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {skillsList.map((skill, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ width: '150px', padding: '6px 0', verticalAlign: 'top', fontSize: '0.85em', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {skill.label}
                    </td>
                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: '#111', fontWeight: 500 }}>
                      {skill.value.split(',').map((item, i, arr) => {
                        const trimmed = item.trim();
                        return (
                          <span key={i}>
                            <strong>{trimmed}</strong>
                            {i < arr.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'projects':
        if (!validProj.length) return null;
        return (
          <div key="projects" style={{ marginBottom: `${sectionSpacing}px` }}>
            <div
              className="resume-section-header"
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '2px',
                marginBottom: '8px'
              }}
            >
              <span>📂</span> {h.projects || (language === 'fr' ? 'PROJETS' : 'PROJECTS')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {validProj.map((pr, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111' }}>
                      🚀 {pr.name}
                    </span>
                    {pr.link && <span style={{ fontSize: '0.85em', color: '#555' }}>{pr.link}</span>}
                  </div>
                  {pr.description && <div style={{ fontSize: '0.9em', color: '#444', margin: '2px 0' }}>{parseMarkdown(pr.description)}</div>}
                  {pr.techStack && renderTags(pr.techStack)}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    {pr.highlights.filter(Boolean).map((hl, hli) => (
                      <div key={hli} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9em', color: '#555' }}>
                        <span style={{ color: '#0F3A8C', fontWeight: 'bold' }}>&gt;</span>
                        <div style={{ flex: 1 }}>{parseMarkdown(hl)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Custom multi-column section for bottom columns
  // We'll render: Langues, Atouts (if exists), Loisirs (if exists) side-by-side
  const renderBottomColumns = () => {
    // Collect the 3 sections to display at the bottom:
    // Column 1: Langues
    // Column 2: Atouts (usually in customSections)
    // Column 3: Loisirs (usually in customSections or data.skills.languages if custom)
    const columns = [];

    // Column 1: Langues
    if (data.skills.languages) {
      columns.push({
        title: language === 'fr' ? 'LANGUES' : 'LANGUAGES',
        icon: '🌍',
        items: data.skills.languages.split(',').map(l => l.trim()).filter(Boolean)
      });
    }

    // Column 2: Atouts / Strengths
    const atoutsSection = data.customSections?.find(s => s.label.toLowerCase().includes('atout') || s.label.toLowerCase().includes('strength'));
    if (atoutsSection && atoutsSection.items.length) {
      columns.push({
        title: atoutsSection.label.toUpperCase(),
        icon: '➕',
        items: atoutsSection.items.map(item => [item.title, item.subtitle, item.description].filter(Boolean).join(' : '))
      });
    } else {
      // Fallback or default items if none configured
      columns.push({
        title: language === 'fr' ? 'ATOUTS' : 'STRENGTHS',
        icon: '➕',
        items: language === 'fr' 
          ? ["Volonté d'apprendre", "Curiosité", "Adaptabilité"]
          : ["Willingness to learn", "Curiosity", "Adaptability"]
      });
    }

    // Column 3: Loisirs / Hobbies
    const loisirsSection = data.customSections?.find(s => s.label.toLowerCase().includes('loisir') || s.label.toLowerCase().includes('hobbi') || s.label.toLowerCase().includes('interest'));
    if (loisirsSection && loisirsSection.items.length) {
      columns.push({
        title: loisirsSection.label.toUpperCase(),
        icon: '😊',
        items: loisirsSection.items.map(item => [item.title, item.subtitle, item.description].filter(Boolean).join(' : '))
      });
    } else {
      columns.push({
        title: language === 'fr' ? 'LOISIRS' : 'INTERESTS',
        icon: '😊',
        items: language === 'fr'
          ? ["Lecture", "Voyages et Nature", "Sport"]
          : ["Reading", "Travel & Nature", "Sports"]
      });
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: `${sectionSpacing}px`, pageBreakInside: 'avoid' }}>
        {columns.map((col, idx) => (
          <div key={idx}>
            <div
              style={{
                color: '#0F3A8C',
                borderBottom: '2px solid #0F3A8C',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingBottom: '2px',
                marginBottom: '6px'
              }}
            >
              <span>{col.icon}</span> {col.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {col.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '0.9em', color: '#222' }}>
                  <span style={{ color: '#0F3A8C', fontWeight: 'bold' }}>&gt;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const resumePageStyles = {
    padding: `${paddingY}in ${paddingX}in`,
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111',
    backgroundColor: '#fff',
    minHeight: '100%',
  };

  return (
    <div className="recruiter-resume" style={resumePageStyles}>
      {/* Header Info */}
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        <div style={{ color: '#0F3A8C', fontSize: '2.2em', fontWeight: 800, lineHeight: 1.1 }}>
          {p.name || 'Richard NEGEM'}
        </div>
        <div style={{ fontSize: '1.25em', fontWeight: 'bold', color: '#111', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {p.tagline || 'Performance Engineer'}
        </div>
        
        {hasContact && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            fontSize: '0.85em', 
            color: '#333', 
            marginTop: '6px',
            borderBottom: '1px solid #ddd',
            paddingBottom: '6px'
          }}>
            {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📱 {p.phone}</span>}
            {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉️ {p.email}</span>}
            {p.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔗 {p.linkedin}</span>}
            {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>📍 {p.location}</span>}
          </div>
        )}
      </div>

      {/* Main Sections */}
      {sectionOrder
        .filter(s => s !== 'skills') // Skills is custom rendered or placed specifically
        .map(sectionId => renderSection(sectionId))}

      {/* Render Skills and Tools */}
      {renderSection('skills')}

      {/* Render bottom 3 columns */}
      {renderBottomColumns()}
    </div>
  );
}

export default memo(RecruiterTemplate);
