# AUDIT FOLLOWUP — Problèmes/idées repérés mais non traités

Ce fichier liste les éléments repérés en cours de correction mais hors périmètre de l'audit initial.
À valider par un humain avant toute implémentation.

---

## 1. Suppression du système de spacers

**Source :** Audit §5.2, Point 6 du plan d'exécution.

**Problème :** Le spacer system (section spacers + item spacers) ajoute 6 actions au reducer, `SpacerStep`, et des conditions `isSpacer` dans 16 fichiers. Complexité disproportionnée pour un workaround de contrôle de pagination.

**Pourquoi reporté :** Le spacer touche 16 fichiers source (5 templates, 5 steps, reducer, tests, 3 modals IA, `buildResumeContext.js`). Sans tests E2E automatisés (seulement 16 tests unitaires), la suppression présente un risque élevé de régression.

**Pré-requis pour agir :** Ajouter des tests E2E (Playwright/Cypress) couvrant le flux : créer → éditer → preview → export PDF. Ensuite seulement, supprimer les spacers et vérifier que les tests passent.

---

## 2. Réimplémentation propre du BYOK (Bring Your Own Key)

**Source :** Audit §5.3, constaté lors du point 7.

**Problème :** Les fonctions `tailorResumeWithDirectApi` et `boldifyResumeWithDirectApi` ont été supprimées car jamais importées. Mais le mécanisme BYOK (permettre à l'utilisateur de fournir sa propre clé API Gemini quand le quota plateforme est épuisé) est une fonctionnalité potentiellement utile.

**Recommandation :** Si le BYOK est souhaité, le réimplémenter proprement en faisant passer la clé au backend proxy (qui appelle Gemini avec la clé utilisateur au lieu de la clé master). Cela évite d'exposer la clé côté client et élimine la duplication de prompts.

---

## 3. Réduction supplémentaire de App.jsx

**Source :** Audit §4.1, constaté lors du point 5.

**Problème :** App.jsx est passé de 2105 → 1925 lignes, mais reste un monolithe. Les blocs restants les plus extraibles sont :
- Le JSX mobile (~400 lignes de duplicate desktop UI)
- Le stepper rendering + step callbacks (~300 lignes)
- La gestion des 25+ `useState` → potentiellement migrable vers un `useReducer` unifié

**Risque :** Ces extractions nécessitent un refactoring majeur de la gestion d'état et du flux de props, avec un risque de régression élevé.

---

## 4. Sécurité API — Rate limiting et CORS

**Source :** Audit §7 (Notes complémentaires).

**Problème :**
- `api/firebase.js` est un stub : `checkAndIncrementQuota` retourne toujours `true`. Aucun rate limiting réel.
- Tous les endpoints API ont `Access-Control-Allow-Origin: '*'`.
- N'importe qui peut spammer `/api/tailor` et consommer le quota Gemini.

**Recommandation :** Implémenter un vrai rate limiting (Firebase, Upstash Redis, ou compteur Vercel KV) et restreindre CORS au domaine `resume-teal-omega.vercel.app`.

---

## 5. Polices web — 9 polices chargées pour 1 utilisée

**Source :** Audit §7 (Poids du bundle).

**Problème :** 9 Google Fonts sont importées dans `main.jsx` (Inter, Fraunces, JetBrains Mono, Roboto, Open Sans, Lato, Lora, Merriweather, Outfit). La plupart ne sont utilisées que par 1 template.

**Recommandation :** Charger les polices à la demande (uniquement quand le template qui les utilise est sélectionné), ou réduire à 2-3 polices universelles.

---

## 6. Export DOCX du CV — HTML-to-DOC vs. vrai DOCX

**Source :** Audit §4.3.

**Problème :** L'export CV en DOCX génère du HTML brut sauvé en `.doc` — ce n'est pas un vrai DOCX. Certains ATS qui attendent du DOCX pourraient mal le parser. La lib `docx` (qui est dans `package.json`) est correctement utilisée pour la lettre de motivation, mais pas pour le CV lui-même.

**Recommandation :** Soit migrer l'export CV vers la lib `docx` (comme la lettre de motivation), soit renommer le bouton en "Export Word-compatible DOC" pour être transparent.

---
