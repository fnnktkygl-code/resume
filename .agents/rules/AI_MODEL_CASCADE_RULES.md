# 🤖 Règles de Gestion des Modèles IA & Cascades Serverless (AI_MODEL_CASCADE_RULES.md)

---

## 1. Principes de Cascade FinOps & Dual-Tier Google AI Studio
Resume & CareerOps fonctionne avec un système de cascade à haute tolérance de pannes :

### Matrice des Modèles Actifs (ZÉRO MODÈLE EXPIRÉ, ZÉRO ALIAS INUTILE) :
- **Tier 1 : Modèles Lite Haute Capacité (15 RPM / 500 RPD)** :
  - `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash-lite`
  - Utilisés pour les tâches rapides, la classification de compétences, la normalisation de texte et les extractions d'offres.
- **Tier 2 : Modèles Standard Flash (5 RPM / 20 RPD)** :
  - `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-2.5-flash`
  - Utilisés pour le raisonnement approfondi, l'adaptation ciblée de CV complexe et la rédaction de lettres de motivation percutantes.
- **Tier 3 : Modèles Open-Weights & Réserve Inépuisable (30 RPM / 14 400 RPD)** :
  - `gemma-4-31b-it`, `gemma-4-26b-a4b-it`, `gemma-2-27b-it`
  - Prise de relais automatique lors des pics de charge sans interruption de service.
- **Tier 4 : Fallback Déterministe Local Hors-Ligne** :
  - En cas de coupure réseau ou de saturation totale des clés API, le système applique un algorithme de matching et d'injection de mots-clés local garanti à 100%.

---

## 2. Gestionnaire de Cooldown & Anti-Throttling (HTTP 429)

- Lorsqu'un modèle déclenche un code HTTP 429 (Too Many Requests), il est immédiatement consigné dans le registre de cooldown en mémoire (`modelCooldownMap`) pour une durée de **5 minutes**.
- Les requêtes suivantes sautent instantanément ce modèle sans subir le délai d'attente réseau pour basculer sur le modèle actif suivant dans la hiérarchie.

---

## 3. Streaming SSE & Gestion des Timeouts Serverless

- Les requêtes d'adaptation et de rédaction utilisent des flux légers et des signaux d'annulation (`AbortController`) avec un timeout par modèle borné à **20 secondes**.
- Zéro attente bloquante infinie : l'utilisateur reçoit un retour d'étape immédiat sur l'interface.
