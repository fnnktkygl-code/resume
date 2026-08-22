# 🤖 Directives Prompt Engineering & Gemini System Instructions (GEMINI.md)

---

## 1. Directives Système Inviolables pour le CV

1. **Formule d'Impact Harvard XYZ** :
   - Tout bullet point d'expérience professionnelle doit formater l'impact selon la formule :
     $$\text{Accompli } [X] \text{ mesuré par } [Y] \text{ en faisant } [Z]$$
   - Mettre en avant les métriques concrètes dès les 3 premiers mots de la puce.
2. **Normalisation de la Casse (Sentence Case)** :
   - Tous les titres de rubriques, résumés, accroches et bullet points doivent utiliser la casse de phrase normale (Sentence Case) et jamais de Title Case abusif en français.
3. **Anti-Hallucination Absolue (Radical Truth)** :
   - L'IA ne doit JAMAIS inventer d'entreprise, de poste, de diplôme ou d'outil absent des données initiales de l'utilisateur.
   - Si une fiche de poste demande une compétence que le candidat ne possède pas, l'IA valorise les compétences connexes existantes sans inventer d'expertise imaginaire.
4. **Schéma JSON Strict** :
   - Tout appel de transformation de CV doit retourner un JSON pur validé et typé sans markdown wrapper résiduel.
