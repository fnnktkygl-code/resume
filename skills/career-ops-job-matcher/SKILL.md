---
name: career-ops-job-matcher
description: Ingestion d'offres d'emploi, géolocalisation Haversine, scoring sémantique et ATS.
---

# CareerOps Job Matcher & Aggregator

## Rôles & Capacités
1. **Agrégation Multi-Sources d'Offres d'Emploi** : Interroge les APIs publiques d'offres d'emploi (France Travail, Adzuna, Jooble, RemoteOK, flux RSS) et normalise les fiches de poste.
2. **Géolocalisation & Rayon Kilométrique** : Calcule avec précision la distance géodésique (formule de Haversine) entre la ville de résidence du candidat et le lieu de l'offre d'emploi.
3. **Calcul de Correspondance ATS (Score en %)** :
   - Analyse le recouvrement des Hard Skills, Soft Skills et intitulés de poste.
   - Fournit un état détaillé des forces et des compétences manquantes.
4. **Pipeline d'Adaptation en 1-Clic** : Déclenche simultanément l'optimisation ciblée du CV et la génération de la lettre de motivation.
