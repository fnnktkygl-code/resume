import { useState, useCallback, useRef, useEffect } from "react";

const FONTS = {
  heading: "'Source Serif 4', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const COLORS = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F4F0",
  border: "#E8E6E1",
  borderFocus: "#2D2A26",
  text: "#1A1917",
  textSecondary: "#6B6860",
  textMuted: "#9C9889",
  accent: "#2D5A3D",
  accentLight: "#E8F0EB",
  accentHover: "#234A31",
  danger: "#B44D3B",
  dangerLight: "#FDF0ED",
  warning: "#A67B28",
  warningLight: "#FFF8E8",
  success: "#2D5A3D",
  successLight: "#E8F0EB",
};

const STEPS = [
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "summary", label: "Summary", icon: "📝" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "preview", label: "Preview", icon: "👁" },
];

const EMPTY_EXPERIENCE = {
  id: Date.now(),
  company: "",
  title: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  current: false,
  bullets: [""],
};

const EMPTY_EDUCATION = {
  id: Date.now(),
  institution: "",
  degree: "",
  field: "",
  startYear: "",
  endYear: "",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS = Array.from({ length: 30 }, (_, i) => String(2026 - i));

const defaultData = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
  summary: "",
  experience: [{ ...EMPTY_EXPERIENCE }],
  education: [{ ...EMPTY_EDUCATION, id: Date.now() + 1 }],
  skills: { technical: "", soft: "", languages: "" },
};

// ATS scoring
function computeAtsScore(data) {
  let score = 0;
  let tips = [];
  const p = data.personal;
  if (p.name) score += 10; else tips.push("Add your full name");
  if (p.email) score += 8; else tips.push("Add an email address");
  if (p.phone) score += 7; else tips.push("Add a phone number");
  if (p.location) score += 5; else tips.push("Add your location");
  if (p.linkedin) score += 5;

  if (data.summary && data.summary.length > 40) score += 10;
  else tips.push("Write a professional summary (50+ chars)");

  const validExp = data.experience.filter(e => e.company && e.title);
  if (validExp.length > 0) score += 15; else tips.push("Add at least one work experience");
  
  let hasMetrics = false;
  let hasDates = true;
  validExp.forEach(e => {
    e.bullets.forEach(b => { if (/\d+%|\$[\d,]+|\d+ /.test(b)) hasMetrics = true; });
    if (!e.startMonth || !e.startYear) hasDates = false;
    if (!e.current && (!e.endMonth || !e.endYear)) hasDates = false;
  });
  if (hasMetrics) score += 15; else if (validExp.length > 0) tips.push("Add quantifiable metrics (%, $, numbers) to bullet points");
  if (hasDates && validExp.length > 0) score += 5; else if (validExp.length > 0) tips.push("Use Month/Year format for all dates");

  const validEdu = data.education.filter(e => e.institution && e.degree);
  if (validEdu.length > 0) score += 10; else tips.push("Add your education");

  if (data.skills.technical && data.skills.technical.split(",").length >= 3) score += 10;
  else tips.push("List at least 3 technical skills");

  return { score: Math.min(score, 100), tips: tips.slice(0, 4) };
}

// Styles
const styles = {
  app: {
    fontFamily: FONTS.body,
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: COLORS.text,
    color: "#fff",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: FONTS.heading,
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  badge: {
    background: COLORS.accent,
    color: "#fff",
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "20px",
    marginLeft: "10px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  main: {
    flex: 1,
    display: "flex",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    padding: "24px",
    gap: "24px",
  },
  formPanel: {
    flex: "1 1 480px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  previewPanel: {
    flex: "0 0 440px",
    position: "sticky",
    top: "80px",
    alignSelf: "flex-start",
    maxHeight: "calc(100vh - 100px)",
    overflow: "auto",
  },
  stepper: {
    display: "flex",
    gap: "4px",
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "6px",
    flexWrap: "wrap",
  },
  stepBtn: (active) => ({
    flex: "1 1 auto",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    fontFamily: FONTS.body,
    background: active ? COLORS.text : "transparent",
    color: active ? "#fff" : COLORS.textSecondary,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    whiteSpace: "nowrap",
  }),
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "24px",
  },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "4px",
    letterSpacing: "-0.3px",
  },
  cardSub: {
    fontSize: "14px",
    color: COLORS.textSecondary,
    marginBottom: "20px",
    lineHeight: 1.5,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldFull: { gridColumn: "1 / -1" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: COLORS.textSecondary,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: FONTS.body,
    color: COLORS.text,
    background: COLORS.bg,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: FONTS.body,
    color: COLORS.text,
    background: COLORS.bg,
    outline: "none",
    resize: "vertical",
    minHeight: "80px",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  select: {
    padding: "10px 14px",
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: FONTS.body,
    color: COLORS.text,
    background: COLORS.bg,
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
  btnPrimary: {
    padding: "12px 24px",
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: FONTS.body,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSecondary: {
    padding: "10px 18px",
    background: "transparent",
    color: COLORS.text,
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: FONTS.body,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "6px 12px",
    background: COLORS.dangerLight,
    color: COLORS.danger,
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: FONTS.body,
    cursor: "pointer",
  },
  btnAdd: {
    padding: "10px 16px",
    background: COLORS.accentLight,
    color: COLORS.accent,
    border: `1.5px dashed ${COLORS.accent}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: FONTS.body,
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  tip: {
    background: COLORS.warningLight,
    border: `1px solid #E8DFC0`,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: COLORS.warning,
    lineHeight: 1.5,
    marginTop: "6px",
  },
  scoreRing: (score) => ({
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    border: `3px solid ${score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.danger}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "15px",
    fontFamily: FONTS.mono,
    color: score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.danger,
    flexShrink: 0,
  }),
};

// Input component with focus effect
function Field({ label, children, full }) {
  return (
    <div style={full ? styles.fieldFull : undefined}>
      {label && <label style={styles.label}>{label}</label>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...styles.input, borderColor: focused ? COLORS.borderFocus : COLORS.border }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...styles.textarea, borderColor: focused ? COLORS.borderFocus : COLORS.border }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...styles.select, borderColor: focused ? COLORS.borderFocus : COLORS.border, color: value ? COLORS.text : COLORS.textMuted }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ATS Score Widget
function AtsScoreWidget({ data }) {
  const { score, tips } = computeAtsScore(data);
  return (
    <div style={{ ...styles.card, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={styles.scoreRing(score)}>{score}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px" }}>ATS Readiness</div>
          <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
            {score >= 80 ? "Excellent — ready to apply" : score >= 50 ? "Good — a few improvements left" : "Needs work — follow the tips below"}
          </div>
        </div>
      </div>
      {tips.length > 0 && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {tips.map((t, i) => (
            <div key={i} style={{ fontSize: "12px", color: COLORS.textSecondary, padding: "6px 10px", background: COLORS.surfaceAlt, borderRadius: "6px" }}>
              → {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// STEP COMPONENTS

function PersonalStep({ data, onChange }) {
  const update = (field, val) => onChange({ ...data, [field]: val });
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Personal Information</div>
      <div style={styles.cardSub}>Your contact details — placed in the main body (never in headers/footers) so ATS parsers capture them correctly.</div>
      <div style={styles.fieldGrid}>
        <Field label="Full Name" full>
          <TextInput value={data.name} onChange={(v) => update("name", v)} placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <TextInput value={data.email} onChange={(v) => update("email", v)} placeholder="jane@example.com" type="email" />
        </Field>
        <Field label="Phone">
          <TextInput value={data.phone} onChange={(v) => update("phone", v)} placeholder="+1 (555) 000-0000" />
        </Field>
        <Field label="Location" full>
          <TextInput value={data.location} onChange={(v) => update("location", v)} placeholder="San Francisco, CA" />
        </Field>
        <Field label="LinkedIn URL">
          <TextInput value={data.linkedin} onChange={(v) => update("linkedin", v)} placeholder="linkedin.com/in/janedoe" />
        </Field>
        <Field label="Website / Portfolio">
          <TextInput value={data.website} onChange={(v) => update("website", v)} placeholder="janedoe.dev" />
        </Field>
      </div>
      <div style={styles.tip}>
        💡 <strong>ATS Tip:</strong> Never place contact info in document headers or footers — most parsers skip those areas entirely.
      </div>
    </div>
  );
}

function SummaryStep({ data, onChange }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Professional Summary</div>
      <div style={styles.cardSub}>2–4 sentences positioning you for the role. Include your years of experience, core expertise, and a standout metric.</div>
      <TextArea
        value={data}
        onChange={onChange}
        placeholder="Results-driven software engineer with 6+ years of experience building scalable web applications. Led a team of 8 engineers to ship a real-time analytics platform serving 2M+ daily users, reducing page load times by 45%. Passionate about clean architecture and developer experience."
        rows={5}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <span style={{ fontSize: "12px", color: COLORS.textMuted }}>{data.length} characters</span>
        <span style={{ fontSize: "12px", color: data.length > 50 && data.length < 400 ? COLORS.success : COLORS.textMuted }}>
          {data.length < 50 ? "Too short" : data.length > 400 ? "Consider trimming" : "Good length ✓"}
        </span>
      </div>
      <div style={styles.tip}>
        💡 <strong>AI Screening Tip:</strong> Semantic parsers look for evidence of impact. Weave skills into achievements rather than listing them generically.
      </div>
    </div>
  );
}

function ExperienceStep({ data, onChange }) {
  const updateExp = (index, field, val) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };
  const updateBullet = (expIdx, bulletIdx, val) => {
    const updated = [...data];
    const bullets = [...updated[expIdx].bullets];
    bullets[bulletIdx] = val;
    updated[expIdx] = { ...updated[expIdx], bullets };
    onChange(updated);
  };
  const addBullet = (expIdx) => {
    const updated = [...data];
    updated[expIdx] = { ...updated[expIdx], bullets: [...updated[expIdx].bullets, ""] };
    onChange(updated);
  };
  const removeBullet = (expIdx, bulletIdx) => {
    const updated = [...data];
    const bullets = updated[expIdx].bullets.filter((_, i) => i !== bulletIdx);
    updated[expIdx] = { ...updated[expIdx], bullets: bullets.length ? bullets : [""] };
    onChange(updated);
  };
  const addExp = () => onChange([...data, { ...EMPTY_EXPERIENCE, id: Date.now(), bullets: [""] }]);
  const removeExp = (idx) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  const hasMissingMetric = (bullet) => bullet.length > 20 && !/\d/.test(bullet);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {data.map((exp, ei) => (
        <div key={exp.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={styles.cardTitle}>Experience {data.length > 1 ? `#${ei + 1}` : ""}</div>
            {data.length > 1 && (
              <button style={styles.btnDanger} onClick={() => removeExp(ei)}>Remove</button>
            )}
          </div>
          <div style={styles.fieldGrid}>
            <Field label="Company">
              <TextInput value={exp.company} onChange={(v) => updateExp(ei, "company", v)} placeholder="Acme Corp" />
            </Field>
            <Field label="Job Title">
              <TextInput value={exp.title} onChange={(v) => updateExp(ei, "title", v)} placeholder="Senior Software Engineer" />
            </Field>
            <Field label="Start Month">
              <Select value={exp.startMonth} onChange={(v) => updateExp(ei, "startMonth", v)} options={MONTHS} placeholder="Month" />
            </Field>
            <Field label="Start Year">
              <Select value={exp.startYear} onChange={(v) => updateExp(ei, "startYear", v)} options={YEARS} placeholder="Year" />
            </Field>
            {!exp.current && (
              <>
                <Field label="End Month">
                  <Select value={exp.endMonth} onChange={(v) => updateExp(ei, "endMonth", v)} options={MONTHS} placeholder="Month" />
                </Field>
                <Field label="End Year">
                  <Select value={exp.endYear} onChange={(v) => updateExp(ei, "endYear", v)} options={YEARS} placeholder="Year" />
                </Field>
              </>
            )}
            <Field full>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExp(ei, "current", e.target.checked)}
                  style={{ accentColor: COLORS.accent }}
                />
                I currently work here
              </label>
            </Field>
          </div>
          <div style={{ marginTop: "16px" }}>
            <div style={styles.label}>Achievements & Responsibilities</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {exp.bullets.map((bullet, bi) => (
                <div key={bi}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: COLORS.textMuted, fontSize: "13px", paddingTop: "10px", flexShrink: 0, fontFamily: FONTS.mono }}>•</span>
                    <div style={{ flex: 1 }}>
                      <TextArea
                        value={bullet}
                        onChange={(v) => updateBullet(ei, bi, v)}
                        placeholder="Led migration of monolithic API to microservices, reducing deploy times by 70% and improving uptime to 99.95%"
                        rows={2}
                      />
                    </div>
                    {exp.bullets.length > 1 && (
                      <button onClick={() => removeBullet(ei, bi)} style={{ ...styles.btnDanger, marginTop: "8px", flexShrink: 0 }}>✕</button>
                    )}
                  </div>
                  {hasMissingMetric(bullet) && (
                    <div style={{ fontSize: "11px", color: COLORS.warning, marginTop: "4px", marginLeft: "20px" }}>
                      💡 Consider adding a number or metric — resumes with quantifiable results get 40% more interviews.
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button style={{ ...styles.btnAdd, marginTop: "10px" }} onClick={() => addBullet(ei)}>+ Add bullet point</button>
          </div>
        </div>
      ))}
      <button style={styles.btnAdd} onClick={addExp}>+ Add another position</button>
      <div style={styles.tip}>
        💡 <strong>STAR Method:</strong> Frame each bullet as Action → Context → Measurable Result. ATS semantic AI extracts evidence of impact, not just duties.
      </div>
    </div>
  );
}

function EducationStep({ data, onChange }) {
  const updateEdu = (index, field, val) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };
  const addEdu = () => onChange([...data, { ...EMPTY_EDUCATION, id: Date.now() }]);
  const removeEdu = (idx) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {data.map((edu, ei) => (
        <div key={edu.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={styles.cardTitle}>Education {data.length > 1 ? `#${ei + 1}` : ""}</div>
            {data.length > 1 && (
              <button style={styles.btnDanger} onClick={() => removeEdu(ei)}>Remove</button>
            )}
          </div>
          <div style={styles.fieldGrid}>
            <Field label="Institution" full>
              <TextInput value={edu.institution} onChange={(v) => updateEdu(ei, "institution", v)} placeholder="Massachusetts Institute of Technology" />
            </Field>
            <Field label="Degree">
              <TextInput value={edu.degree} onChange={(v) => updateEdu(ei, "degree", v)} placeholder="Bachelor of Science" />
            </Field>
            <Field label="Field of Study">
              <TextInput value={edu.field} onChange={(v) => updateEdu(ei, "field", v)} placeholder="Computer Science" />
            </Field>
            <Field label="Start Year">
              <Select value={edu.startYear} onChange={(v) => updateEdu(ei, "startYear", v)} options={YEARS} placeholder="Year" />
            </Field>
            <Field label="End Year">
              <Select value={edu.endYear} onChange={(v) => updateEdu(ei, "endYear", v)} options={YEARS} placeholder="Year" />
            </Field>
          </div>
        </div>
      ))}
      <button style={styles.btnAdd} onClick={addEdu}>+ Add education</button>
    </div>
  );
}

function SkillsStep({ data, onChange }) {
  const update = (field, val) => onChange({ ...data, [field]: val });
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Skills</div>
      <div style={styles.cardSub}>Separate skills with commas. These should also appear naturally in your experience bullets for semantic AI matching.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Field label="Technical Skills" full>
          <TextArea
            value={data.technical}
            onChange={(v) => update("technical", v)}
            placeholder="Python, TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, REST APIs, GraphQL"
            rows={3}
          />
        </Field>
        <Field label="Soft Skills" full>
          <TextInput value={data.soft} onChange={(v) => update("soft", v)} placeholder="Team Leadership, Cross-functional Collaboration, Agile Project Management" />
        </Field>
        <Field label="Languages" full>
          <TextInput value={data.languages} onChange={(v) => update("languages", v)} placeholder="English (Native), French (Professional)" />
        </Field>
      </div>
      <div style={styles.tip}>
        💡 <strong>Keyword Strategy:</strong> Mirror the exact phrasing from target job descriptions. Modern AI parsers understand synonyms, but legacy ATS still relies on exact matches.
      </div>
    </div>
  );
}

// Resume Preview (ATS-optimized single-column layout)
function ResumePreview({ data, compact = false }) {
  const p = data.personal;
  const hasContact = p.name || p.email || p.phone;
  const validExp = data.experience.filter(e => e.company || e.title);
  const validEdu = data.education.filter(e => e.institution || e.degree);
  const hasSkills = data.skills.technical || data.skills.soft || data.skills.languages;

  const scale = compact ? 0.52 : 0.72;

  const rs = {
    page: {
      background: "#fff",
      width: `${8.5 / scale}in`,
      minHeight: `${11 / scale}in`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      padding: "0.75in",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "10.5pt",
      color: "#222",
      lineHeight: 1.45,
      boxSizing: "border-box",
      boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    },
    name: {
      fontSize: "22pt",
      fontWeight: 700,
      textAlign: "center",
      marginBottom: "4px",
      letterSpacing: "0.5px",
    },
    contact: {
      textAlign: "center",
      fontSize: "9.5pt",
      color: "#444",
      marginBottom: "14px",
      wordBreak: "break-word",
    },
    sectionHeader: {
      fontSize: "11pt",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      borderBottom: "1.5px solid #222",
      paddingBottom: "3px",
      marginTop: "14px",
      marginBottom: "8px",
    },
    expHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      flexWrap: "wrap",
      marginBottom: "2px",
    },
    company: { fontWeight: 700, fontSize: "10.5pt" },
    title: { fontStyle: "italic", fontSize: "10.5pt" },
    dates: { fontSize: "9.5pt", color: "#555", whiteSpace: "nowrap" },
    bullet: { marginBottom: "3px", paddingLeft: "16px", textIndent: "-12px" },
    bulletDot: { marginRight: "6px" },
  };

  const formatDate = (m, y) => {
    if (!m && !y) return "";
    if (m && y) return `${m} ${y}`;
    return y || m || "";
  };

  const wrapperWidth = compact ? 280 : 400;

  return (
    <div style={{ width: `${wrapperWidth}px`, overflow: "hidden", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
      <div style={rs.page}>
        {p.name && <div style={rs.name}>{p.name}</div>}
        {hasContact && (
          <div style={rs.contact}>
            {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join("  •  ")}
          </div>
        )}

        {data.summary && (
          <>
            <div style={rs.sectionHeader}>Summary</div>
            <div>{data.summary}</div>
          </>
        )}

        {validExp.length > 0 && (
          <>
            <div style={rs.sectionHeader}>Work Experience</div>
            {validExp.map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={rs.expHeader}>
                  <span style={rs.company}>{exp.company}</span>
                  <span style={rs.dates}>
                    {formatDate(exp.startMonth, exp.startYear)}
                    {(exp.startMonth || exp.startYear) && " — "}
                    {exp.current ? "Present" : formatDate(exp.endMonth, exp.endYear)}
                  </span>
                </div>
                <div style={rs.title}>{exp.title}</div>
                <div style={{ marginTop: "4px" }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={rs.bullet}><span style={rs.bulletDot}>•</span>{b}</div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {validEdu.length > 0 && (
          <>
            <div style={rs.sectionHeader}>Education</div>
            {validEdu.map((edu, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={rs.expHeader}>
                  <span style={rs.company}>{edu.institution}</span>
                  <span style={rs.dates}>
                    {edu.startYear}{edu.startYear && edu.endYear && " — "}{edu.endYear}
                  </span>
                </div>
                <div style={rs.title}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </div>
              </div>
            ))}
          </>
        )}

        {hasSkills && (
          <>
            <div style={rs.sectionHeader}>Skills</div>
            <div>
              {data.skills.technical && <div style={{ marginBottom: "3px" }}><strong>Technical:</strong> {data.skills.technical}</div>}
              {data.skills.soft && <div style={{ marginBottom: "3px" }}><strong>Interpersonal:</strong> {data.skills.soft}</div>}
              {data.skills.languages && <div><strong>Languages:</strong> {data.skills.languages}</div>}
            </div>
          </>
        )}

        {!(hasContact || data.summary || validExp.length || validEdu.length || hasSkills) && (
          <div style={{ textAlign: "center", color: "#aaa", paddingTop: "120px", fontSize: "13pt" }}>
            Start filling in your details to see your resume appear here
          </div>
        )}
      </div>
    </div>
  );
}

// Preview step with export
function PreviewStep({ data }) {
  const handleExport = () => {
    const p = data.personal;
    const validExp = data.experience.filter(e => e.company || e.title);
    const validEdu = data.education.filter(e => e.institution || e.degree);
    const formatDate = (m, y) => [m, y].filter(Boolean).join(" ");

    let md = "";
    if (p.name) md += `# ${p.name}\n`;
    const contactLine = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(" | ");
    if (contactLine) md += `${contactLine}\n\n`;
    if (data.summary) md += `## Summary\n${data.summary}\n\n`;
    if (validExp.length > 0) {
      md += `## Work Experience\n`;
      validExp.forEach(exp => {
        const dateStr = `${formatDate(exp.startMonth, exp.startYear)} — ${exp.current ? "Present" : formatDate(exp.endMonth, exp.endYear)}`;
        md += `### ${exp.company}\n**${exp.title}** | ${dateStr}\n`;
        exp.bullets.filter(Boolean).forEach(b => { md += `- ${b}\n`; });
        md += "\n";
      });
    }
    if (validEdu.length > 0) {
      md += `## Education\n`;
      validEdu.forEach(edu => {
        md += `**${edu.institution}** | ${[edu.degree, edu.field].filter(Boolean).join(", ")} | ${edu.startYear}–${edu.endYear}\n`;
      });
      md += "\n";
    }
    if (data.skills.technical || data.skills.soft || data.skills.languages) {
      md += `## Skills\n`;
      if (data.skills.technical) md += `**Technical:** ${data.skills.technical}\n`;
      if (data.skills.soft) md += `**Interpersonal:** ${data.skills.soft}\n`;
      if (data.skills.languages) md += `**Languages:** ${data.skills.languages}\n`;
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(p.name || "resume").replace(/\s+/g, "_")}_resume.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const handleJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.personal.name || "resume").replace(/\s+/g, "_")}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Your Resume is Ready</div>
        <div style={styles.cardSub}>
          Single-column, standardized headers, text-based bullets — optimized for ATS parsing, AI screening, and human readability.
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button style={styles.btnPrimary} onClick={handlePrint}>🖨️ Print / Save as PDF</button>
          <button style={styles.btnSecondary} onClick={handleExport}>📄 Download Markdown</button>
          <button style={styles.btnSecondary} onClick={handleJson}>💾 Export JSON Data</button>
        </div>
        <div style={{ ...styles.tip, marginTop: "14px" }}>
          💡 <strong>Best format for ATS:</strong> Use "Print → Save as PDF" for a text-based PDF with perfect parsing. The JSON export lets you reimport your data later.
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ResumePreview data={data} />
      </div>
    </div>
  );
}

// Main App
export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(defaultData);

  const currentId = STEPS[step].id;
  const isPreview = currentId === "preview";

  const printStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
    @media print {
      body * { visibility: hidden !important; }
      #resume-print, #resume-print * { visibility: visible !important; }
      #resume-print {
        position: absolute !important;
        left: 0 !important; top: 0 !important;
        width: 8.5in !important;
        transform: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0.65in !important;
      }
    }
  `;

  return (
    <div style={styles.app}>
      <style>{printStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={styles.logo}>ResumeForge</span>
          <span style={styles.badge}>ATS Ready</span>
        </div>
        <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
          All data stays in your browser — nothing is sent to any server.
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Left: Form */}
        <div style={styles.formPanel}>
          {/* Stepper */}
          <div style={styles.stepper}>
            {STEPS.map((s, i) => (
              <button key={s.id} style={styles.stepBtn(i === step)} onClick={() => setStep(i)}>
                <span>{s.icon}</span>
                <span style={{ fontSize: "12px" }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* ATS Score */}
          <AtsScoreWidget data={data} />

          {/* Step Content */}
          {currentId === "personal" && (
            <PersonalStep data={data.personal} onChange={(v) => setData({ ...data, personal: v })} />
          )}
          {currentId === "summary" && (
            <SummaryStep data={data.summary} onChange={(v) => setData({ ...data, summary: v })} />
          )}
          {currentId === "experience" && (
            <ExperienceStep data={data.experience} onChange={(v) => setData({ ...data, experience: v })} />
          )}
          {currentId === "education" && (
            <EducationStep data={data.education} onChange={(v) => setData({ ...data, education: v })} />
          )}
          {currentId === "skills" && (
            <SkillsStep data={data.skills} onChange={(v) => setData({ ...data, skills: v })} />
          )}
          {currentId === "preview" && <PreviewStep data={data} />}

          {/* Navigation */}
          <div style={styles.nav}>
            {step > 0 ? (
              <button style={styles.btnSecondary} onClick={() => setStep(step - 1)}>← Back</button>
            ) : <div />}
            {step < STEPS.length - 1 && (
              <button style={styles.btnPrimary} onClick={() => setStep(step + 1)}>
                Continue →
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview (hidden on preview step & small screens) */}
        {!isPreview && (
          <div style={styles.previewPanel}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
              Live Preview
            </div>
            <ResumePreview data={data} compact />
          </div>
        )}
      </div>

      {/* Print-only resume */}
      <div id="resume-print" style={{ position: "fixed", left: "-9999px", top: 0, fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "10.5pt", color: "#222", lineHeight: 1.45, width: "8.5in", padding: "0.65in" }}>
        {data.personal.name && <div style={{ fontSize: "22pt", fontWeight: 700, textAlign: "center", marginBottom: "4px" }}>{data.personal.name}</div>}
        <div style={{ textAlign: "center", fontSize: "9.5pt", color: "#444", marginBottom: "14px" }}>
          {[data.personal.email, data.personal.phone, data.personal.location, data.personal.linkedin, data.personal.website].filter(Boolean).join("  •  ")}
        </div>
        {data.summary && (
          <>
            <div style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", borderBottom: "1.5px solid #222", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>Summary</div>
            <div>{data.summary}</div>
          </>
        )}
        {data.experience.filter(e => e.company || e.title).length > 0 && (
          <>
            <div style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", borderBottom: "1.5px solid #222", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>Work Experience</div>
            {data.experience.filter(e => e.company || e.title).map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700 }}>{exp.company}</span>
                  <span style={{ fontSize: "9.5pt", color: "#555" }}>
                    {[exp.startMonth, exp.startYear].filter(Boolean).join(" ")} — {exp.current ? "Present" : [exp.endMonth, exp.endYear].filter(Boolean).join(" ")}
                  </span>
                </div>
                <div style={{ fontStyle: "italic" }}>{exp.title}</div>
                {exp.bullets.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ paddingLeft: "16px", textIndent: "-12px", marginBottom: "2px" }}>• {b}</div>
                ))}
              </div>
            ))}
          </>
        )}
        {data.education.filter(e => e.institution || e.degree).length > 0 && (
          <>
            <div style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", borderBottom: "1.5px solid #222", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>Education</div>
            {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700 }}>{edu.institution}</span>
                  <span style={{ fontSize: "9.5pt", color: "#555" }}>{edu.startYear}{edu.startYear && edu.endYear && " — "}{edu.endYear}</span>
                </div>
                <div style={{ fontStyle: "italic" }}>{[edu.degree, edu.field].filter(Boolean).join(", ")}</div>
              </div>
            ))}
          </>
        )}
        {(data.skills.technical || data.skills.soft || data.skills.languages) && (
          <>
            <div style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", borderBottom: "1.5px solid #222", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>Skills</div>
            {data.skills.technical && <div style={{ marginBottom: "3px" }}><strong>Technical:</strong> {data.skills.technical}</div>}
            {data.skills.soft && <div style={{ marginBottom: "3px" }}><strong>Interpersonal:</strong> {data.skills.soft}</div>}
            {data.skills.languages && <div><strong>Languages:</strong> {data.skills.languages}</div>}
          </>
        )}
      </div>
    </div>
  );
}
