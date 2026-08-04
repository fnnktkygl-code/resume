# 📄 ResuMe — AI-Powered ATS-Ready Resume & Cover Letter Builder

<p align="center">
  <a href="https://resume-teal-omega.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-Vercel-1B6B3A?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.style=for-the-badge" alt="License MIT" />
  <img src="https://img.shields.io/badge/Languages-FR%20|%20EN%20|%20ES-6366F1?style=for-the-badge" alt="Multilingual FR EN ES" />
  <img src="https://img.shields.io/badge/ATS_Ready-Scientific_Audit-10B981?style=for-the-badge" alt="ATS Ready" />
</p>

> **ResuMe** est un outil web Open Source, moderne et **100% respectueux de la vie privée ("Local-First")** conçu pour concevoir, auditor et adapter des CV et lettres de motivation ultra-performants, calibrés selon les études scientifically-proven de recrutement (Eye-tracking Ladders 2018, benchmarks SHRM, études van Toorenburg 2015, NACE).

---

## 🌐 Multilingual Support / Support Trilingue / Soporte Trilingüe

ResuMe est intégralement traduit et optimisé pour 3 langues :
- **🇫🇷 Français** : Interface complète, moteurs de conseils RH scientifiques, invites IA calibrées et données de démonstration.
- **🇬🇧 English**: Full UI translation, ATS audit rules, STAR-method AI prompts, and demo datasets.
- **🇪🇸 Español**: Interfaz traducida por completo, auditoría científica ATS, sugerencias IA y plantillas de prueba.

---

## ✨ Key Features / Fonctionnalités Clés

### 🎯 1. Moteur d'Audit ATS & RH Scientifique (Real-Time Scientific Nudge)
- **Règle des 7,4 secondes (Ladders 2018)** : Structuration visuelle front-loaded pour capturer l'attention du recruteur dès le premier coup d'œil.
- **Détection des emails informels (van Toorenburg 2015)** : Alerte automatique si l'adresse email manque de professionnalisme.
- **Validation LinkedIn (+71% d'entretiens)** : Vérification de la présence d'un lien LinkedIn personnalisable.
- **Quantification des impacts (NACE +40% de rappels)** : Analyse en temps réel des puces pour garantir qu'au moins 40% des réalisations contiennent des métriques chiffrées.
- **Score ATS dynamique (0-100)** avec recommandations actionnables et conseils quotidiens sourcés.

### 🤖 2. IA Avancée Gemini (Tailoring & Boldification Sélective)
- **AI Job Tailoring** : Analyse l'offre d'emploi ciblée et adapte les mots-clés du CV sans sur-optimisation artificielle.
- **Mise en gras sélective (1 à 3 termes par puce)** : Met en valeur les compétences clés sans créer de saturation visuelle.
- **Formulation de puces d'impact STAR** : Génération de puces axées sur l'action avec verbes d'action puissants en premier.

### 📝 3. Éditeur de Lettre de Motivation WYSIWYG & Compteur Réactif
- **Seuil scientifique SHRM (<300 mots)** : Compteur de mots en temps réel avec badge dynamique (`🟢 Optimal RH (<300)` vs `⚠️ >300 mots (-83% de lecture)`).
- **Structure RH Éprouvée (Vous / Moi / Nous)** : Modèles de génération cadrés en 3-4 paragraphes percutants.
- **Édition papier A4 en direct** avec prévisualisation fidèle et export PDF instantané.

### 🎨 4. Ergonomie & Navigation Responsive Dual-Mode
- **Desktop Grid Wrap** : 100% des rubriques visibles d'un seul coup d'œil sans scroll horizontal gênant.
- **Mobile Dropdown Chevron Selector** : Sélecteur déroulant ultra-compact (`1/7 — Infos de contact ✓`) préservant l'espace écran sur mobile.
- **Indicateur de rubriques masquées (`👁️‍🗨️`)** : Repérage immédiat des sections masquées du CV final sans avoir à cliquer.
- **Accessibilité Clavier ARIA (Roving Tabindex)** : Navigation fluide aux flèches du clavier (`←`, `→`, `↑`, `↓`, `Home`, `End`).

### 📄 5. Multi-Formats & Confidentialité Totale
- **Exportation multi-format** : PDF haute définition (vectoriel/print-ready), Word (.docx), JSON (sauvegarde/restauration) et Markdown.
- **Local-First** : Vos données restent exclusivement stockées dans le `localStorage` de votre navigateur. Aucun stockage sur serveur distant.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core** : React 18, Vite, Javascript (ES6+)
- **Design System** : Vanilla CSS épuré avec variables CSS dynamiques (Light / Dark Mode), typographies Google Fonts (Inter, Roboto, Outfit, Lora, Fraunces)
- **PDF Engine** : PDF.js & HTML Canvas renderer
- **Backend Serverless API** : Vercel Serverless Functions (`/api/*.js`)
- **AI Provider** : Google Gemini 2.5 API (via SDK Google Gen AI)
- **Scientific Audit Rules** : Defined in `src/utils/scientificAuditor.js` & `api/_scientificPromptRules.js` based on `Conseils CV Basés sur Études.md`.

---

## 🚀 Getting Started / Installation Locale

### Prérequis
- Node.js (v18+)
- npm ou yarn

### Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/fnnktkygl-code/resume.git
   cd resume
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement (Optionnel pour les fonctionnalités IA)** :
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   GEMINI_API_KEY=votre_cle_api_gemini
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

5. **Construire pour la production** :
   ```bash
   npm run build
   ```

---

## 📂 Project Structure / Structure du Projet

```
resume/
├── api/                        # Serverless Functions (Vercel)
│   ├── _scientificPromptRules.js # Centralized HR prompt guidelines
│   ├── generateCoverLetter.js  # Cover letter generator API
│   ├── generateBulletPoints.js # Bullet point generator API
│   ├── boldify.js              # Selective bolding API
│   └── tailor.js               # Job description matching API
├── public/                     # Assets & demo data
├── src/
│   ├── components/             # UI Components
│   │   ├── steps/              # Resume section step forms (Personal, Summary, Exp, Ed...)
│   │   ├── ui/                 # Modals (CoverLetterModal, AtsScoreModal, TailorModal...)
│   │   ├── Header.jsx          # Top Navigation Bar & Language Selector
│   │   └── ResumePreview.jsx   # Live A4 Resume Preview Renderer
│   ├── data/                   # Multilingual i18n & Daily Tips datasets
│   ├── services/               # Gemini AI client integration
│   ├── utils/                  # Scientific auditor, ATS scorer, exporters
│   ├── App.jsx                 # Main Application & State Controller
│   └── index.css               # Central Design System Stylesheet
├── Conseils CV Basés sur Études.md # Reference HR Scientific Research Document
└── README.md                   # Project Documentation
```

---

## 📚 Scientific References / Références Scientifiques

Les algorithmes d'audit et les invites IA de ResuMe s'appuient sur des recherches publiées :
1. **Ladders Eye-Tracking Study (2018)** : 7.4-second initial resume scan benchmark.
2. **SHRM (Society for Human Resource Management)** : Cover letter length (<300 words threshold for +83% completion rate).
3. **van Toorenburg et al. (2015)** : Impact of professional email addresses on applicant evaluation.
4. **NACE (National Association of Colleges and Employers)** : Callback rates for quantified accomplishment bullets.

---

## 📄 License

Ce projet est distribué sous la licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

<p align="center">
  Développé avec passion pour rendre la recherche d'emploi plus juste, transparente et efficace. 🚀
</p>
