# CHANGELOG — Audit ResuMe (Juillet 2026)

Ce fichier trace chaque correctif issu de l'audit produit/code.

---

## 1. Suppression des scripts Python one-shot (Audit §4.5)

**Problème :** 6 scripts Python (`fix_translations.py`, `fix_default_data.py`, `fix_soft_skills.py`, `fix_spacer_idx.py`, `refactor_creative.py`, `refactor_modern.py`) étaient des rustines ponctuelles laissées à la racine du repo, sans aucun appel dans `package.json` ou ailleurs.

**Changement :** Suppression des 6 fichiers.

**Fichiers modifiés :** Suppression de 6 fichiers racine.

**Vérification :** `grep` sur tout le repo confirme 0 référence. `vite build` passe sans erreur.

---

## 2. Alerte de débordement de page (Audit §4.4)

**Problème :** Aucun feedback visuel quand le contenu du CV dépasse d'une ou deux lignes sur une page supplémentaire quasi-vide (ex: 1,1 pages). Le recruteur jette un CV mal paginé.

**Changement :** Ajout d'un état `overflowRatio` dans `ResumePreview.jsx`. Quand le contenu utilise ≤20% de la dernière page, un bandeau orange ⚠️ s'affiche en bas de la preview avec le message : _"Content overflows by just a few lines. Try Compact mode or shorten a section."_ Traduit en FR et ES.

**Fichiers modifiés :**
- `src/components/ResumePreview.jsx` (overflow detection + warning banner)
- `src/utils/translations.js` (3 langues)

**Vérification :** `vite build` OK. Le warning n'apparaît pas en `printMode` (pas visible à l'impression).

---

## 3. DRY des templates — logique partagée extraite (Audit §4.2)

**Problème :** `hasContact`, `displayHeading`, `formatDate` étaient copiés-collés dans les 5 templates (ResumePreview, Modern, Creative, Minimalist, NJM). Toute correction devait être appliquée 5 fois. Bug direct constaté : le lien GitHub manquait dans 3 templates sur 4.

**Changement :** Création de `src/utils/resumeHelpers.js` exportant 3 fonctions : `hasContactInfo()`, `displayHeading()`, `formatResumeDate()`. Les 5 templates importent maintenant ces helpers au lieu de redéfinir la logique localement.

**Fichiers modifiés :**
- `src/utils/resumeHelpers.js` (NOUVEAU — 68 lignes)
- `src/components/ResumePreview.jsx` (import + remplacement de 3 fonctions locales)
- `src/components/ModernTemplate.jsx` (idem)
- `src/components/CreativeTemplate.jsx` (idem)
- `src/components/MinimalistTemplate.jsx` (idem)
- `src/components/NjmTemplate.jsx` (idem)

**Vérification :** `vite build` OK. 16/16 tests passent. Le bundle App.js a diminué de 275.91 → 274.95 Ko (−960 octets de code dupliqué éliminé).

---

## 4. Export DOCX — dépendance `docx` (Audit §4.3) — ANNULÉ

**Problème initial :** L'audit signalait la lib `docx` comme dépendance morte dans `package.json`.

**Constat en implémentation :** La lib `docx` EST utilisée dans `CoverLetterModal.jsx` (ligne 4 : `import { Document, Packer, Paragraph, TextRun } from 'docx'`). La dépendance n'est pas morte. Le CV exporte bien en HTML-to-DOC (pas via la lib), mais la lettre de motivation utilise correctement la lib `docx` pour générer un vrai DOCX.

**Décision :** Point annulé. La dépendance reste.

---

## 5. Réduction de App.jsx (Audit §4.1)

**Problème :** `App.jsx` était un monolithe de 2105 lignes / 101 Ko, rendant toute modification risquée.

**Changements :**
1. **Extraction de la logique de langue** (−81 lignes) : Création de `src/utils/languageSwitcher.js` avec `translateHeadings()` et `translateCustomSectionLabels()`. Remplace 100 lignes de `if/else` hardcodé par une approche data-driven avec tables `HEADING_DEFAULTS` + détection automatique des headings "stock" vs. personnalisés.
2. **Extraction du `FullscreenPreview`** (−100 lignes) : Création de `src/components/FullscreenPreview.jsx`, composant autonome avec pagination et zoom. L'inline IIFE de 115 lignes dans le JSX est remplacée par un usage propre `<FullscreenPreview ... />`.

**Résultat :** App.jsx passe de 2105 → 1925 lignes (**−180 lignes, −8.5%**). Bundle App.js : 275 Ko → 272 Ko.

**Fichiers modifiés :**
- `src/utils/languageSwitcher.js` (NOUVEAU — 104 lignes)
- `src/components/FullscreenPreview.jsx` (NOUVEAU — 127 lignes)
- `src/App.jsx` (imports + remplacement de 2 blocs)

**Vérification :** `vite build` OK. 16/16 tests passent.

> Note : L'objectif initial de "passer à 500 lignes" est irréaliste sans refactoring complet de l'architecture (la gestion de 25+ useState, le JSX mobile de 400 lignes, et le stepper rendering nécessiteraient une réécriture majeure). Les extractions réalisées sont les plus sûres à faire sans risque de régression.

---

## 6. Suppression du système de spacers (Audit §5.2) — REPORTÉ

**Problème :** Le système de spacers (section spacers + item spacers) ajoute 6 actions au reducer, un composant `SpacerStep`, et des conditions `isSpacer` dans chaque template et chaque step.

**Constat en implémentation :** Le spacer touche **16 fichiers** source (5 templates, 5 steps, reducer, tests, 3 modals IA, buildResumeContext). Le supprimer nécessite des modifications coordonnées dans chaque fichier avec un risque élevé de régression. Sans tests E2E automatisés (le projet n'a que 16 tests unitaires), la suppression est dangereuse.

**Décision :** Reporté dans `AUDIT_FOLLOWUP.md` pour une itération future avec couverture de tests.

---

## 7. Réduction de la duplication Proxy/Direct des appels IA (Audit §5.3)

**Problème :** `geminiService.js` contenait 2 fonctions "DirectApi" (`tailorResumeWithDirectApi`, `boldifyResumeWithDirectApi`) qui dupliquaient les prompts système des endpoints proxy (`api/tailor.js`, `api/boldify.js`) pour un mécanisme BYOK (Bring Your Own Key).

**Constat en implémentation :** Ces 2 fonctions (164 lignes) sont **exportées mais jamais importées** par aucun composant. Le mécanisme BYOK n'est pas câblé dans l'UI. Ce sont 164 lignes de code mort portant des prompts dupliqués.

**Changement :** Suppression des 2 fonctions `WithDirectApi` de `geminiService.js`. Le fichier passe de 546 → 382 lignes (−30%).

**Fichiers modifiés :**
- `src/services/geminiService.js` (suppression de 164 lignes de code mort)

**Vérification :** `vite build` OK. 16/16 tests passent. Aucun import cassé.

---

## 8. Ligne dédiée pour les liens professionnels (LinkedIn, GitHub, Site Web)

**Problème :** Par défaut, tous les contacts et liens professionnels s'affichaient sur une seule ligne. Si l'utilisateur possédait un lien long (ex: GitHub ou LinkedIn avec nom complet), cela devenait très encombré et limitait l'espace d'en-tête, rendant la lecture difficile et moins optimisée pour les ATS.

**Changement :** 
1. Ajout d'une option `splitLinks: true` par défaut dans le schéma `DEFAULT_LAYOUT`.
2. Ajout d'un contrôle dans `LayoutControls.jsx` pour permettre à l'utilisateur de choisir entre :
   - "Sur une seule ligne" (`splitLinks = false`)
   - "Ligne séparée pour les liens" (`splitLinks = true`)
3. Mise à jour de tous les templates adaptables (`ResumePreview.jsx`, `NjmTemplate.jsx`, `CreativeTemplate.jsx`, `MinimalistTemplate.jsx`) pour diviser le bloc de contact en deux lignes intelligentes (contacts directs sur la ligne 1, liens de profils professionnels sur la ligne 2) si `splitLinks` est activé, avec des points séparateurs bien formatés pour chaque groupe. (Le template `Modern` reste vertical).
4. Ajout des traductions en anglais, français et espagnol.

**Fichiers modifiés :**
- `src/App.jsx` (Default layout)
- `src/components/LayoutControls.jsx` (Reset + Dropdown UI selector)
- `src/components/ResumePreview.jsx` (Render conditional formatting)
- `src/components/NjmTemplate.jsx` (Render conditional formatting)
- `src/components/CreativeTemplate.jsx` (Render conditional formatting)
- `src/components/MinimalistTemplate.jsx` (Render conditional formatting)
- `src/utils/translations.js` (Translations EN/FR/ES)

**Vérification :** `vite build` OK, les tests passent. La mise en page bascule correctement entre les deux modes en temps réel.

---


