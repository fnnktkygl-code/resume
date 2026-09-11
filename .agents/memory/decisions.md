# 📜 Registre des Décisions d'Architecture & Mémoire Commune (ADR)

Ce registre consigne les arbitrages structurants du projet.
Avant toute modification d'architecture, le Chirurgien consulte ce document pour garantir la cohérence et éviter les régressions ou remises en cause de décisions antérieures.

---

## Format d'une Entrée Décisionnelle

- **Date** : AAAA-MM-JJ
- **Contexte / Problème** : Problématique rencontrée, contrainte technique ou retour utilisateur.
- **Décision Tranchée** : Choix technique acté et implémenté.
- **Raison (Le "Pourquoi")** : Bénéfices attendus, contre-exemples écartés et justifications d'arbitrage.

---

## Registre des Décisions Actées

### 2026-09-11 | Anti-Token-Burn, Zéro-Polling & Réveil Réactif Événementiel
- **Contexte / Problème** : Dérive critique constatée sur les orchestrateurs multi-agents (ex: cas Astra/Codex brûlant 7,13M tokens d'entrée en 47 vérifications à vide toutes les 30s) due à des boucles de polling actif rechargeant un contexte lourd sans modification d'état.
- **Décision Tranchée** : Interdiction absolue du polling actif (`manage_task(status)` ou timers courts répétés) pour surveiller un sous-agent ou une tâche de fond. Exploitation stricte de l'architecture événementielle native (Push Event Bus / Reactive Wakeup) : le parent yield son exécution (`stop`) et attend l'événement de terminaison poussé par le runtime. Plafond de temporisation de secours fixé à $\ge 20-25$ minutes.
- **Raison** : Élimination totale du gaspillage de contexte (~68% d'entrées économisées), préservation des fenêtres de prompt caching (TTL ~30m), et maintien de la vélocité sans saturation prématurée des quotas de session.

---

### 2026-09-10 | Modèle Chirurgical & Protocole Brooks-Zero
- **Contexte / Problème** : Risque d'inflation d'agents, de bavardage quadratique $O(N^2)$, de surcoûts et de conflits de merge suite aux retours de l'expérience des 1200 agents.
- **Décision Tranchée** : Adoption stricte du modèle d'équipe chirurgicale (Loi de Brooks-Zero). Un seul chirurgien tient le bistouri (écriture code). Sous-agents éphémères en étoile ($O(N)$), lecture seule, notes temporaires dans `.agents/scratchpad/`.
- **Raison** : Maîtrise absolue de la complexité, zéro pollution de contexte, intégrité du code source.

---

### 2026-08-25 | Architecture Privacy-First & Zero-Cloud
- **Contexte / Problème** : Questionnement sur la visibilité en direct du CV par un tiers ouvrant l'URL.
- **Décision Tranchée** : Persistance 100% locale dans le navigateur (`localStorage`) pour toutes les données candidat (nom, téléphone, expériences, projets). Zéro base de données cloud centrale non sollicitée.
- **Raison** : Protection absolue des données personnelles et de la vie privée du candidat. Le partage se fait volontairement par export PDF, Word (.docx) ou sauvegarde JSON.

---

### 2026-08-25 | Découpage Multi-Séparateurs & Édition Inline des Compétences
- **Contexte / Problème** : Les listes de compétences utilisant des points-virgules (`;`) généraient un seul badge géant de 1000px débordant hors de l'écran, et les badges n'étaient pas éditables directement.
- **Décision Tranchée** : Découpage regex multi-séparateurs `[,;\n]+` dans `TagInput.jsx`, ajout de l'édition inline au clic/double-clic ou crayon ✏️, et bouton de bascule vers le mode texte brut.
- **Raison** : Expérience utilisateur fluide, zéro débordement visuel, flexibilité de saisie et de correction immédiate.

---

### 2026-08-25 | Normalisation Universelle Multilingue des Dates
- **Contexte / Problème** : Lors de la traduction ou bascule en anglais, des mois en français (`Avr`, `Août`) restaient affichés car les dictionnaires attendaient des clés anglaises (`Apr`, `Aug`).
- **Décision Tranchée** : Mise en place d'un dictionnaire d'indexation universel insensible à la casse et aux accents dans `resumeHelpers.js` capable de normaliser n'importe quel mois (FR, ES, EN, numérique) vers la langue cible sélectionnée.
- **Raison** : Cohérence internationale sans dépendre du format de saisie initial ou d'un import de CV brut.

---

### 2026-08-25 | Flexibilité de la Formule Harvard XYZ pour les Puces
- **Contexte / Problème** : Une contrainte rigide exigeant de placer des chiffres dans les 3 premiers mots de chaque puce réduisait la qualité narrative et l'impact de certaines réalisations techniques ou de leadership.
- **Décision Tranchée** : Remplacement par la formule d'impact Harvard XYZ complète ($\text{Accompli } [X] \text{ mesuré par } [Y] \text{ en faisant } [Z]$) avec 3 angles valorisants (Technique, Leadership, Impact/Optimisation).
- **Raison** : Équilibre optimal entre métriques concrètes pour les filtres ATS et élégance stylistique pour les recruteurs humains.
