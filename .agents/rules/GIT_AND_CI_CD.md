# 🔄 Règles Git, Intégration Continue & Déploiement (GIT_AND_CI_CD.md)

---

## 1. Conventions de Commits Conventional Commits
- `feat:` : Nouvelle fonctionnalité utilisateur (ex: support CareerOps, nouveau template).
- `fix:` : Correction de bug, régression ou affichage.
- `refactor:` : Refactorisation sans altération de comportement fonctionnel.
- `perf:` : Optimisation mesurable du temps de rendu ou du bundle.
- `test:` : Ajout ou mise à jour de suites de tests ou de harnais.
- `docs:` : Mise à jour de la documentation d'architecture ou des règles.

---

## 2. Garde-Fous de Qualité Pré-Push & CI

Avant tout commit ou déploiement sur Vercel :
1. **Tests unitaires & intégration** : `npm test` doit réussir à **100%** (zéro échec toléré).
2. **Linting** : `npm run lint` doit passer sans warning bloquant.
3. **Harnais de résilience & audit** : Exécution des scripts `harnesses/*.mjs`.
