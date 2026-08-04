# 📄 ResuMe — AI-Powered ATS-Ready Resume & Cover Letter Builder

<p align="center">
  <a href="https://resume-teal-omega.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-Vercel-1B6B3A?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.style=for-the-badge" alt="License MIT" />
  <img src="https://img.shields.io/badge/Languages-EN%20|%20FR%20|%20ES-6366F1?style=for-the-badge" alt="Multilingual" />
  <img src="https://img.shields.io/badge/ATS_Ready-Scientific_Audit-10B981?style=for-the-badge" alt="ATS Ready" />
</p>

<p align="center">
  <b>Language Options:</b><br/>
  <b>🇬🇧 English (Current)</b> | <a href="LISEZMOI.md">🇫🇷 Français</a> | <a href="LEAME.md">🇪🇸 Español</a>
</p>

---

> **ResuMe** is an open-source, modern, and **100% privacy-first ("Local-First")** web application designed to build, audit, and tailor ATS-optimized resumes and cover letters using scientifically proven HR benchmarks (Ladders 2018 Eye-Tracking Study, SHRM guidelines, van Toorenburg 2015 research, NACE callback metrics).

---

## ✨ Key Features

### 🎯 1. Scientific ATS & HR Audit Engine (Real-Time Nudge System)
- **7.4-Second Initial Scan Rule (Ladders 2018)**: Front-loaded visual structure designed to capture a recruiter's attention in under 8 seconds.
- **Informal Email Detection (van Toorenburg 2015)**: Automated alert if contact email addresses lack professionalism.
- **LinkedIn Profile Verification (+71% callback rate)**: Real-time check to ensure a customized LinkedIn URL is present.
- **Accomplishment Quantification (NACE +40% callbacks)**: Live analysis ensuring at least 40% of bullet points contain measurable metrics (%, $, numbers).
- **Dynamic ATS Score (0-100)** with actionable feedback and sourced daily recruitment tips.

### 🤖 2. Advanced Gemini AI Integration (Tailoring & Selective Bolding)
- **AI Job Tailoring**: Analyzes targeted job descriptions and aligns resume keywords without artificial keyword stuffing.
- **Selective Bolding (1 to 3 terms per bullet)**: Emphasizes key skills and metrics while preventing visual overload.
- **STAR-Method Bullet Generator**: Formulates impact-driven accomplishments starting with strong action verbs.

### 📝 3. WYSIWYG Cover Letter Editor & Real-Time SHRM Counter
- **SHRM Threshold Compliance (<300 words)**: Real-time word counter badge (`🟢 HR Optimal (<300)` vs `⚠️ >300 words (-83% reading rate)`).
- **Proven HR Structure (You / Me / Us)**: Framed AI generation across 3-4 impactful paragraphs.
- **Live A4 Paper Editor** with high-fidelity print preview and instant PDF export.

### 🎨 4. Ergonomic & Accessible Dual-Mode Navigation
- **Desktop Grid Wrap**: 100% of resume sections visible at a single glance without awkward horizontal scrolling.
- **Mobile Dropdown Chevron Selector**: Ultra-compact mobile selector (`1/7 — Contact Info ✓`) preserving maximum screen height for inputs.
- **Hidden Section Indicator (`👁️‍🗨️`)**: Instant visual feedback for sections hidden from the final CV without needing to click on them.
- **W3C ARIA Keyboard Accessibility (Roving Tabindex)**: Smooth keyboard navigation via arrow keys (`←`, `→`, `↑`, `↓`, `Home`, `End`).

### 📄 5. Multi-Format Export & Local Privacy
- **Multi-Format Export**: High-resolution PDF (vector/print-ready), Word (.docx), JSON (backup/restore), and Markdown.
- **Local-First Privacy**: All your data remains strictly stored inside your browser's `localStorage`. No data is sent to external database servers.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 18, Vite, Javascript (ES6+)
- **Design System**: Vanilla CSS with dynamic CSS variables (Light / Dark Mode), Google Fonts typography (Inter, Roboto, Outfit, Lora, Fraunces)
- **PDF Engine**: PDF.js & HTML Canvas renderer
- **Backend API**: Vercel Serverless Functions (`/api/*.js`)
- **AI Provider**: Google Gemini 2.5 API (via Google Gen AI SDK)
- **Scientific Audit Rules**: Defined in `src/utils/scientificAuditor.js` & `api/_scientificPromptRules.js` based on `Conseils CV Basés sur Études.md`.

---

## 🚀 Getting Started / Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fnnktkygl-code/resume.git
   cd resume
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for AI features)**:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
resume/
├── api/                        # Serverless Functions (Vercel)
│   ├── _scientificPromptRules.js # Centralized HR prompt guidelines
│   ├── generateCoverLetter.js  # Cover letter generator API
│   ├── generateBulletPoints.js # Bullet point generator API
│   ├── boldify.js              # Selective bolding API
│   └── tailor.js               # Job description matching API
├── public/                     # Static assets & demo datasets
├── src/
│   ├── components/             # React UI Components
│   │   ├── steps/              # Resume section step forms
│   │   ├── ui/                 # Modals & Overlays
│   │   ├── Header.jsx          # Top Navigation Bar & Language Switcher
│   │   └── ResumePreview.jsx   # Live A4 Resume Preview Renderer
│   ├── data/                   # Multilingual i18n & Daily Tips datasets
│   ├── services/               # Gemini AI client integration
│   ├── utils/                  # Scientific auditor, ATS scorer, exporters
│   ├── App.jsx                 # Main Application Controller
│   └── index.css               # Design System Stylesheet
├── Conseils CV Basés sur Études.md # Scientific HR Research Document
├── README.md                   # English Documentation (Default)
├── LISEZMOI.md                 # French Documentation
└── LEAME.md                    # Spanish Documentation
```

---

## 📚 Scientific References

ResuMe's audit algorithms and AI prompts are grounded in published recruitment research:
1. **Ladders Eye-Tracking Study (2018)**: 7.4-second initial resume scan benchmark.
2. **SHRM (Society for Human Resource Management)**: Cover letter length (<300 words threshold for +83% completion rate).
3. **van Toorenburg et al. (2015)**: Impact of professional email addresses on applicant evaluation.
4. **NACE (National Association of Colleges and Employers)**: Callback rates for quantified accomplishment bullets.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
