# 🎼 Règles d'Orchestration Multi-Agents & Gouvernance Cognitive

Ce document formalise les principes d'orchestration pour flottes d'agents IA, inspirés par le cadre d'ingénierie moderne (*Le Musicien vs Les Fantassins*, *Anti-Oversinking*, *Anti-Psychophanie*, *Disjoncteurs Budgétaires*).

---

## 1. Rôles Hiérarchiques : Chef d'Orchestre vs Fantassins

### A. Le Modèle Frontière (Frontier Orchestrator / Le Musicien)
- **Mission** : Analyse de l'intention utilisateur, rédaction de la partition (plan d'action décomposé), coordination des sous-agents spécialisés, synthèse finale et arbitrage.
- **Budget de Réflexion (Reasoning Budget)** : Élevé (High/Deep). C'est ici que doit se concentrer l'effort cognitif, l'anticipation des cas limites et la prise de décision stratégique.

### B. Les Exécuteurs Spécialisés (Specialized Subagents / Les Fantassins)
- **Mission** : Exécution rapide, atomique et rigoureusement délimitée :
  1. *Job Extractor* : Extraction brute des métadonnées d'une offre (entreprise, rôle, compétences requises).
  2. *Geodesic Calculator* : Calcul de distance orthodromique (Haversine) entre le candidat et l'offre d'emploi.
  3. *ATS Matcher* : Calcul déterministe de chevauchement de compétences et scoring de compatibilité.
  4. *CV Tailor Scribe* : Adaptation ciblée des descriptions et métriques sans hallucination.
  5. *Cover Letter Scribe* : Rédaction de lettre de motivation alignée.
- **Budget de Réflexion (Reasoning Budget)** : Contenu ou Nul (Low / None). L'exécuteur ne doit pas "sur-réfléchir" sous peine de dériver de sa consigne (*oversinking*).

---

## 2. Lutte contre l'Oversinking (Sur-Réflexion Délétère)

- **Principe de Proportionnalité** : Ne jamais allouer un budget de réflexion lourd à une tâche déterministe, de simple formatage ou d'extraction.
- **Contrôle de Schéma Strict** : Les entrées et sorties des sous-agents exécuteurs sont verrouillées par des schémas JSON stricts avec validation immédiate.

---

## 3. Protocole Anti-Psychophanie & Anti-Hallucination (Anti-Sycophancy)

- **Interdiction de Complaisance** : Un agent ne doit jamais flatter un utilisateur en prétendant qu'il possède une compétence absente de son CV ou que son profil correspond à 100% à une offre incompatible.
- **Interdiction d'Hallucination dans le CV** : L'agent ne doit JAMAIS inventer un diplôme, une entreprise précédente, une certification ou une technologie que le candidat n'a pas explicitement renseignée.
- **Formulation Factuelle** : Tout écart de compétences (Skill Gap) doit être exposé avec clarté et bienveillance, sans fausse promesse.

---

## 4. Disjoncteurs de Facturation & Garde-Fous (Circuit Breakers)

- **Plafond de Tokens par Session** : Chaque requête d'orchestration est soumise à un quota maximal de tokens d'entrée et de sortie.
- **Limite d'Itérations Autonomes** : Un sous-agent ou une boucle d'agents ne peut dépasser $N$ itérations (par défaut 3) sans validation explicite de l'utilisateur.
- **Disjoncteur Thermique (Trip Circuit)** : En cas de code HTTP 429 ou de dérive de consommation, le disjoncteur bascule immédiatement sur le fallback déterministe local sans surcharger les APIs distantes.
