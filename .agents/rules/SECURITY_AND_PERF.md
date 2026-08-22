# 🔒 Règles de Sécurité, Performance & Zéro Fuite (SECURITY_AND_PERF.md)

---

## 1. Sécurité & Protection des Secrets
1. **Zéro Fuite Côté Client** : Aucune clé privée (`GEMINI_API_KEY_MASTER`, tokens d'API partenaires) ne doit transiter vers le bundle frontend. Les clés sensibles résident exclusivement dans les variables d'environnement Vercel.
2. **AuthGuard & Protection Same-Origin** : Les endpoints `/api/*` vérifient l'intégrité de la provenance des requêtes (`Sec-Fetch-Site: same-origin`, matching d'origine et de referer).
3. **Protection XSS & Injection** : Tout contenu injecté ou généré par l'IA doit être assaini avec `sanitize.js` et échappé avant rendu DOM.

---

## 2. Budget de Performance & Rendu 60fps
1. **Poids du Bundle** : Maintenir le bundle JS minifié sous 500 Ko grâce au Lazy Loading systématique des modales (`AIPromptModal`, `CoverLetterModal`, `CareerOpsHub`).
2. **Gestion de la Mémoire & Destruction des Ressources** : Tout écouteur d'événement (`addEventListener`), timer (`setTimeout`) ou worker de rendu PDF doit être détruit au démontage du composant (`useEffect` cleanup).
