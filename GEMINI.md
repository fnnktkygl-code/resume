# 🤖 Configuration Antigravity 2.0 — Directives Système & Équipe Chirurgicale

> Ce projet applique rigoureusement le **Protocole d'Équipe Chirurgicale (Loi de Brooks-Zero)** inspiré par le retour d'expérience des essaims autonomes.
> Consulte obligatoirement :
> - [Règles Chirurgicales & Boucle d'Élasticité](file://.agents/rules/surgical_rules.md)
> - [Registre des Décisions d'Architecture](file://.agents/memory/decisions.md)
> - [Gouvernance Multi-Agents & Disjoncteurs](file://.agents/rules/AGENT_ORCHESTRATION_AND_GOVERNANCE.md)

---

## 1. Rôles, Autorité & Monopole d'Écriture

1. **Le Lead Agent agit comme Chirurgien Unique** :
   - Une seule main tient le bistouri : **seul le Chirurgien a le droit d'écrire ou de modifier les fichiers du dépôt**.
2. **Topologie en Étoile Stricte ($O(N)$)** :
   - Les sous-agents ne communiquent jamais entre eux.
   - Les sous-agents sont éphémères, restreints au mode `read-only`, et consignent leurs conclusions uniquement dans `.agents/scratchpad/worker_{id}.md`.
3. **Boucle d'Élasticité Dynamique** :
   - Par défaut, effectif = 1 (Chirurgien seul).
   - Pas de prolifération de fichiers de rôles markdown. L'instanciation est régie par la politique de scale-up/scale-down de `.agents/rules/surgical_rules.md` (max 2 sous-agents simultanés).
4. **Zéro-Polling & Réveil Réactif Événementiel (Anti-Astra Loop)** :
   - Interdiction formelle du polling actif (vérifications répétitives `status` ou timers courts < 15 min pour sonder l'avancement d'un travailleur).
   - Exploitation native du **Réveil Réactif (Push Event Bus)** : le parent cède la main sans rappeler d'outil (`stop`) et attend l'événement système de terminaison, préservant ainsi le cache de prompt et évitant le syndrome Astra (7M tokens gaspillés pour 47 sondages à vide).

---

## 2. Directives Métier Inviolables pour le CV

1. **Formule d'Impact Harvard XYZ** :
   - Tout bullet point d'expérience professionnelle doit formater l'impact selon la formule :
     $$\text{Accompli } [X] \text{ mesuré par } [Y] \text{ en faisant } [Z]$$
   - Proposer des propositions différenciées (Technique/Exécution, Leadership/Coordination, Impact/Optimisation chiffrée).
2. **Normalisation de la Casse (Sentence Case)** :
   - Tous les titres de rubriques, résumés, accroches et bullet points doivent utiliser la casse de phrase normale (Sentence Case) et jamais de Title Case abusif en français.
3. **Anti-Hallucination Absolue (Radical Truth)** :
   - L'IA ne doit JAMAIS inventer d'entreprise, de poste, de diplôme, de compétence ou d'outil absent des données initiales du candidat.
   - Si une offre d'emploi cible requiert une compétence manquante, valoriser les compétences connexes réelles sans inventer d'expertise imaginaire.
4. **Schéma JSON Strict** :
   - Tout appel de transformation ou de génération de CV doit retourner un JSON pur validé et typé, sans markdown wrapper résiduel.

---

## 3. Registre des Décisions & Mémoire Partagée

- Avant toute modification d'architecture, vérifie obligatoirement `.agents/memory/decisions.md`.
- Toute décision structurante doit être consignée dans le registre avec son contexte et sa justification ("Pourquoi").
