# 📄 ResuMe — Générateur de CV & Lettre de Motivation Scientifique & Compatible ATS

<p align="center">
  <a href="https://resume-teal-omega.vercel.app">
    <img src="https://img.shields.io/badge/Démo_en_Direct-Vercel-1B6B3A?style=for-the-badge&logo=vercel&logoColor=white" alt="Démo en Direct" />
  </a>
  <img src="https://img.shields.io/badge/Licence-MIT-blue.style=for-the-badge" alt="Licence MIT" />
  <img src="https://img.shields.io/badge/Langues-FR%20|%20EN%20|%20ES-6366F1?style=for-the-badge" alt="Multilingue" />
  <img src="https://img.shields.io/badge/Compatible_ATS-Audit_Scientifique-10B981?style=for-the-badge" alt="Compatible ATS" />
</p>

<p align="center">
  <b>Langues disponibles :</b><br/>
  <a href="README.md">🇬🇧 English</a> | <b>🇫🇷 Français (Actuel)</b> | <a href="LEAME.md">🇪🇸 Español</a>
</p>

---

> **ResuMe** est une application web Open Source, moderne et **100% respectueuse de la vie privée ("Local-First")** conçue pour créer, auditer et adapter des CV et lettres de motivation ultra-performants, calibrés selon les études scientifiques de recrutement (Eye-tracking Ladders 2018, benchmarks SHRM, études van Toorenburg 2015, métriques NACE).

---

## ✨ Fonctionnalités Clés

### 🎯 1. Moteur d'Audit ATS & RH Scientifique (Nudge Engine en Temps Réel)
- **Règle des 7,4 secondes (Ladders 2018)** : Structuration visuelle optimisée pour capturer l'attention du recruteur dès le premier coup d'œil.
- **Détection des emails informels (van Toorenburg 2015)** : Alerte automatique si l'adresse email manque de professionnalisme.
- **Vérification du profil LinkedIn (+71% de rappels)** : Contrôle en temps réel de la présence d'une URL LinkedIn personnalisée.
- **Quantification des réalisations (NACE +40% d'entretiens)** : Analyse dynamique garantissant qu'au moins 40% des puces contiennent des métriques chiffrées (%, $, chiffres).
- **Score ATS dynamique (0-100)** avec conseils RH quotidiens sourcés.

### 🤖 2. IA Avancée Gemini (Tailoring & Mise en Gras Sélective)
- **AI Job Tailoring** : Analyse l'offre d'emploi ciblée et adapte les mots-clés du CV sans sur-optimisation artificielle.
- **Mise en gras sélective (1 à 3 termes par puce)** : Met en valeur les compétences clés sans créer de saturation visuelle.
- **Générateur de puces d'impact STAR** : Formule des réalisations percutantes commençant par des verbes d'action puissants.

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
- **Moteur PDF** : PDF.js & rendu HTML Canvas
- **API Serverless Backend** : Vercel Serverless Functions (`/api/*.js`)
- **Fournisseur IA** : Google Gemini 2.5 API (via SDK Google Gen AI)
- **Règles d'Audit Scientifiques** : Définies dans `src/utils/scientificAuditor.js` et `api/_scientificPromptRules.js` basées sur `Conseils CV Basés sur Études.md`.

---

## 🚀 Installation & Démarrage Local

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

## 📂 Structure du Projet

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
├── Conseils CV Basés sur Études.md # Document de recherche RH scientifique
├── README.md                   # Documentation Anglaise (Par défaut)
├── LISEZMOI.md                 # Documentation Française
└── LEAME.md                    # Documentation Espagnole
```

---

## 📚 Références Scientifiques

Les algorithmes d'audit et les invites IA de ResuMe s'appuient sur des recherches publiées :
1. **Étude Eye-Tracking Ladders (2018)** : Temps moyen d'évaluation initiale fixé à 7,4 secondes.
2. **SHRM (Society for Human Resource Management)** : Longueur idéale des lettres de motivation (<300 mots pour +83% de lecture).
3. **van Toorenburg et al. (2015)** : Impact de l'adresse email professionnelle sur l'évaluation des candidatures.
4. **NACE (National Association of Colleges and Employers)** : Taux de rappel des puces contenant des réalisations chiffrées.

---

## 📄 Licence

Ce projet est distribué sous la licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.
