# 📐 Conventions de Code & Nommage (NAMING_AND_CODE_CONVENTIONS.md)

---

## 1. Structure Modulaire & Clean Architecture
- `src/components/` : Composants UI React (PascalCase, ex: `Header.jsx`, `ResumePreview.jsx`, `CareerOpsHub.jsx`).
- `src/components/ui/` : Modales et primitives réutilisables (ex: `Modal.jsx`, `VisualDiff.jsx`, `TagInput.jsx`).
- `src/components/steps/` : Étapes de saisie du formulaire de CV (ex: `PersonalStep.jsx`, `ExperienceStep.jsx`).
- `src/services/` : Adaptateurs d'API et appels asynchrones (camelCase, ex: `geminiService.js`, `careerOpsService.js`).
- `src/utils/` : Fonctions pures, mathématiques et déterministes (ex: `atsScore.js`, `careerOpsMatcher.js`, `colorUtils.js`).
- `src/reducers/` : Gestionnaires d'état immuables purs (ex: `resumeReducer.js`).
- `api/` : Endpoints serverless Vercel (camelCase, ex: `tailor.js`, `careerOpsSearch.js`).

---

## 2. Règles d'Immutabilité & Hooks
1. **Zéro Mutation Directe du State** : Toujours utiliser des clonages profonds (`structuredClone` ou spread operators) dans les reducers.
2. **Mémoïsation des Calculs Lourds** : Utiliser `useMemo` pour le calcul du score ATS et des filtres géolocalisés pour garantir 60fps constants.
