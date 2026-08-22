# 🛑 Règles de Gestion d'Erreurs & Récupération (ERROR_HANDLING_AND_RECOVERY.md)

---

## 1. Principe Fondamental

> **L'utilisateur ne doit jamais voir une erreur technique brute.**
> Chaque erreur doit être interceptée, traduite en message humain compréhensible et accompagnée d'une alternative ou d'un bouton de reprise.

---

## 2. Table de Correspondance des Erreurs

| Erreur Technique | Message Utilisateur Traduit (FR / EN / ES) |
| :--- | :--- |
| `TypeError: Failed to fetch` | « Connexion au serveur impossible. Vérifiez votre réseau. » |
| `HTTP 429 Too Many Requests` | « Quota temporairement saturé. Bascule automatique vers le modèle de réserve... » |
| `HTTP 500 Internal Server Error` | « Une erreur inattendue est survenue. Veuillez réessayer. » |
| `QuotaExceededError (Storage)` | « Espace local saturé. Exportez ou nettoyez vos anciens CV. » |
| `Invalid JSON / Format Error` | « Format de données invalide. Récupération déterministe en cours. » |

---

## 3. Règles d'Implémentation

1. **Zéro `catch` vide** : Tout bloc `catch (err)` doit soit logger de manière structurée (`console.error('[Module]', err.message)`), soit déclencher un fallback explicite.
2. **Retry avec Backoff Exponentiel** : Pour les requêtes distantes non-bloquantes (ex: flux d'offres d'emploi), appliquer 3 tentatives d'appels espacées de 1s, 2s, 4s.
3. **Persistance Locale Robuste** : Toute modification de CV est persistée dans `localStorage` avec garde-fous de désérialisation pour éviter toute perte accidentelle de données.
