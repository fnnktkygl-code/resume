---
name: api-resilience-cascade
description: Gestion des cascades de modèles IA, rate-limiting HTTP 429 et résilience serverless.
---

# API Resilience Cascade

## Directives
- Cascade ordonnée : Gemini 3.5 Flash-Lite / 3.7 Flash / Gemma 4 / Fallback Déterministe Local.
- Cooldown automatique de 5 minutes sur tout modèle recevant un code HTTP 429.
- Zéro crash pour l'utilisateur en cas de panne externe.
