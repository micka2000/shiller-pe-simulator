# Plan : aligner le site sur la présentation

Référence : `Shillerpe.md` du repo `micka2000/Pr-sentation-shiller-PE`, qui décrit tout ce que le site doit couvrir.

## Gap analysis

| Section de la présentation | État sur le site (avant) | Écart |
|---|---|---|
| Qu'est-ce que le Shiller PE : nom CAPE, Robert Shiller, prix Nobel | Concept présent, sans le nom complet ni l'auteur | Partiel |
| Formule | Présente, sans la mention « bénéfices ajustés » | Partiel |
| Lissage des fluctuations | Présent (carte Concept) | OK |
| Pourquoi est-ce utile (3 points) | Absent | Manquant |
| Interprétation : valeurs élevées / faibles | Jauges présentes, mais seuils incohérents avec le simulateur (jauges 15 / 20 / 30, simulateur 15 / 25) | Bug |
| Moyenne historique ~16-17 | « Moyenne : 17 » | OK |
| Exemples historiques (1929, 2008, bulle Internet) | Absent | Manquant |
| Limites (3 points) | Absent | Manquant |
| En résumé + « à combiner avec d'autres indicateurs » | Absent | Manquant |
| Ressources (site de Shiller, multpl) | Absent | Manquant |
| Comparaison internationale (treemap 12 pays) | Absent | Manquant |
| Simulateur | Présent | OK, mais annonce un prix « récupéré automatiquement » qui ne l'est pas sur GitHub Pages |

## Plan d'implémentation

### Lot 1 : contenu (fait)
1. Compléter le Concept : CAPE, Robert Shiller, Nobel 2013, bénéfices ajustés de l'inflation.
2. Ajouter « Pourquoi c'est utile » (3 cartes).
3. Ajouter « Limites » (3 cartes) et « En résumé ».
4. Ajouter les Ressources (liens Yale et multpl).

### Lot 2 : corrections (fait)
5. Aligner les jauges sur les seuils du simulateur : < 15, 15 à 25, > 25.
6. Retirer la promesse d'un prix automatique ; le simulateur situe le résultat par rapport à la moyenne de 17.

### Lot 3 : graphiques (fait)
7. Repères historiques : colonnes 1929, 1932, 1966, 1982, 2000, 2009, 2021 avec la ligne de moyenne à 17. Valeurs approximatives tirées de multpl.com.
8. Comparaison internationale : barres horizontales groupées par région (données de la présentation). Choix délibéré de barres plutôt qu'un treemap : la surface d'un treemap fait lire une part d'un tout, alors qu'un ratio se compare sur une échelle commune.
9. Tableau de données dépliable sous chaque graphique.

### Lot 4 : données du jour (fait)
10. `scripts/update_data.py` écrit `docs/data/market.json` : CAPE mensuel depuis 1871 (multpl.com), prix du S&P 500 (Yahoo Finance), moyenne historique (17,44) et bénéfices E10 déduits.
11. `.github/workflows/update-data.yml` le lance chaque soir de bourse (22 h 30 UTC), commite si les données changent et relance le build Pages.
12. Le site affiche le CAPE du jour, pré-remplit le simulateur et trace la courbe complète. Sans données, il garde les colonnes des grands rendez-vous.

### Lot 5 : refonte (fait)
13. Design system Mickaël Brousse (tokens, Bricolage Grotesque + Roboto), copié depuis le portfolio dans `docs/tokens` et `docs/assets/fonts`.
14. Thème clair et sombre, barres pays en une seule couleur (le regroupement par région porte déjà l'identité).
15. Carte du projet mise à jour sur le portfolio (capture, résumé, tags).

### Reste à faire
- Dater et sourcer les ratios par pays : la présentation ne donne pas de date. Trouver une source publique que le script puisse lire (pas encore cherchée).
- Police `rf-dewi-bold` : présente dans le projet Claude Design, absente de la copie locale des tokens.
