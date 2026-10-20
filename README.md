# Shiller PE

Le ratio Shiller PE (CAPE) du S&P 500 : valeur du jour, 150 ans d'histoire, comparaison par pays, simulateur et limites.

Site : https://micka2000.github.io/shiller-pe-simulator/

## Structure

| Chemin | Rôle |
|---|---|
| `docs/` | Le site, servi par GitHub Pages (branche `main`, dossier `/docs`). Statique, sans build. |
| `docs/tokens/`, `docs/assets/fonts/` | Design system Mickaël Brousse, même copie que le portfolio |
| `docs/data/market.json` | CAPE mensuel depuis 1871, CAPE et prix du jour. Généré, ne pas éditer. |
| `scripts/update_data.py` | Écrit `market.json` depuis multpl.com et Yahoo Finance (bibliothèque standard seulement) |
| `tests/` | Tests du script, sans réseau |
| `app.py` | Version Flask locale : sert `docs/` et historise le prix dans SQLite |
| `PLAN.md` | Gap analysis avec la présentation et suivi des lots |

## Données

- **Chaque soir de bourse**, `.github/workflows/update-data.yml` lance les tests, met à jour `market.json`, le commite s'il a changé et relance le build Pages. Si multpl change sa page, le script échoue au lieu d'écrire de mauvaises données : l'échec apparaît dans l'onglet Actions.
- **Chaque mois**, `.github/workflows/country-reminder.yml` ouvre une issue pour recopier le CAPE par pays depuis [Siblis Research](https://siblisresearch.com/data/cape-ratios-by-country/). Ce relevé reste manuel : leurs conditions interdisent la collecte automatique, mais autorisent la citation avec crédit et lien.

## Commandes

```bash
python -m unittest discover tests     # tests
python scripts/update_data.py         # rafraîchir les données en local
python -m http.server -d docs 8000    # voir le site
pip install -r requirements.txt && python app.py   # version Flask
```

## Cache

Les liens vers `css/style.css` et `js/script.js` portent `?v=N`. Incrémenter ce numéro dans `docs/index.html` à chaque modification, pour qu'un visiteur ne reçoive jamais une nouvelle page avec un ancien script.
