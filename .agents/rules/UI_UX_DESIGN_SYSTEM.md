# 🎨 Charte Graphique, Design System & Ergonomie (UI_UX_DESIGN_SYSTEM.md)

---

## 1. Palette Sémantique & Contrastes WCAG AAA
- **Couleur Primaire / Accent** : Vert Émeraude (`#1B6B3A`) ou Sarcelle Sombre (`#0D9488`) avec contraste calculé $\ge 4.5:1$ (texte normal) et $\ge 7:1$ (texte grand).
- **Fond Sombre & Ardoise** : `#0B1120`, `#1E293B`, `#334155`.
- **Fond Clair & Papier** : `#FFFFFF`, `#F8FAFC`, `#F1F5F9`.
- **Succès & Score Élevé ($\ge 85\%$)** : Vert Émeraude (`#10B981` / `#059669`).
- **Avertissement & Score Modéré ($60-84\%$)** : Ambre Doré (`#F59E0B` / `#D97706`).
- **Danger & Score Faible ($< 60\%$)** : Rouge Rubis (`#EF4444` / `#DC2626`).

---

## 2. États Interactifs & Accessibilité Clavier
- Tout élément interactif (`button`, `input`, `select`, `a`) doit explicitement supporter :
  - `:hover` : Transition douce d'élévation ou de luminosité.
  - `:active` : Micro-compression tactile (`scale(0.98)`).
  - `:focus-visible` : Anneau de focus à fort contraste (`2px solid var(--color-accent)`).
  - `:disabled` : `cursor: not-allowed` et opacité réduite à 50%.

---

## 3. Confirmation des Actions Destructrices
- Toute suppression de CV, purge d'historique ou réinitialisation totale impose une modale de confirmation explicite avec boutons clairs « Confirmer » et « Annuler ».
