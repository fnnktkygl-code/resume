# 🌍 Règles d'Internationalisation & Localisation (I18N_AND_LOCALIZATION.md)

---

## 1. Langues Officielles Supportées
- 🇫🇷 **Français (`fr`)** : Langue par défaut et d'excellence pour le marché francophone.
- 🇬🇧 **Anglais (`en`)** : Standard international pour les postes tech, finance et recherche.
- 🇪🇸 **Espagnol (`es`)** : Couverture complète des marchés hispanophones.

---

## 2. Règles d'Implémentation I18N
1. **Zéro chaîne hardcodée dans l'UI** : Tout texte affiché à l'utilisateur doit passer par le dictionnaire `src/utils/translations.js` ou le hook `useTranslation()`.
2. **Synchronisation Tripartite** : Toute nouvelle clé ajoutée dans `translations.js` doit impérativement comporter sa traduction validée en `en`, `fr` et `es`.
3. **Localisation des Formats de Dates & Données** :
   - Français : `MM/AAAA` ou `Mois AAAA` (ex: "Septembre 2024 - Présent").
   - Anglais : `MM/YYYY` ou `Month YYYY` (ex: "September 2024 - Present").
   - Espagnol : `MM/AAAA` ou `Mes AAAA` (ex: "Septiembre 2024 - Presente").
