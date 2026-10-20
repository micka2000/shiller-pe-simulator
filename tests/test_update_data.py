"""Tests du script de données, sans réseau : python -m unittest discover tests"""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import update_data  # noqa: E402

# Extrait de la table multpl.com, au format servi le 19 octobre 2026
MULTPL_ROWS = """
<tr class="odd">
<td>Oct 19, 2026</td>
<td>
&#x2002;
40.72
</td>
</tr>

<tr class="even">
<td>Oct 1, 2026</td>
<td>
&#x2002;
40.81
</td>
</tr>

<tr class="odd">
<td>Sep 1, 2026</td>
<td>
&#x2002;
40.42
</td>
</tr>

<tr class="even">
<td>Feb 1, 1871</td>
<td>
&#x2002;
10.92
</td>
</tr>
"""

YAHOO_PAYLOAD = json.dumps({"chart": {"result": [{"meta": {
    "regularMarketPrice": 7690.734, "regularMarketTime": 1792442654}}]}})


class ParseCapeTable(unittest.TestCase):
    def test_lit_les_lignes_du_plus_ancien_au_plus_recent(self):
        history = update_data.parse_cape_table(MULTPL_ROWS, min_rows=1)
        self.assertEqual(history, [
            ("1871-02-01", 10.92),
            ("2026-09-01", 40.42),
            ("2026-10-01", 40.81),
            ("2026-10-19", 40.72),
        ])

    def test_echoue_si_la_page_a_change(self):
        # Une table vide ou tronquée ne doit jamais écrire de données
        with self.assertRaises(RuntimeError):
            update_data.parse_cape_table("<table></table>")
        with self.assertRaises(RuntimeError):
            update_data.parse_cape_table(MULTPL_ROWS)


class ParsePrice(unittest.TestCase):
    def test_prix_arrondi_et_date_utc(self):
        self.assertEqual(update_data.parse_price(YAHOO_PAYLOAD), (7690.73, "2026-10-19"))


class BuildData(unittest.TestCase):
    def setUp(self):
        history = update_data.parse_cape_table(MULTPL_ROWS, min_rows=1)
        self.data = update_data.build_data(history, 7690.73, "2026-10-19")

    def test_valeur_du_jour_hors_historique_mensuel(self):
        self.assertEqual(self.data["cape"]["current"], 40.72)
        self.assertEqual(self.data["cape"]["date"], "2026-10-19")
        self.assertEqual([m for m, _ in self.data["history"]], ["1871-02", "2026-09", "2026-10"])

    def test_moyenne_sur_les_mois_seulement(self):
        self.assertEqual(self.data["cape"]["mean"], round((10.92 + 40.42 + 40.81) / 3, 2))

    def test_benefices_e10_deduits_du_cape(self):
        self.assertEqual(self.data["e10"], round(7690.73 / 40.72, 2))


if __name__ == "__main__":
    unittest.main()
