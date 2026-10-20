"""
Met à jour docs/data/market.json pour la version GitHub Pages du site.

- Shiller PE mensuel depuis 1871 : multpl.com
- Dernier prix du S&P 500 : API chart de Yahoo Finance

Bibliothèque standard uniquement, pour tourner tel quel dans une GitHub Action.
"""
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CAPE_URL = "https://www.multpl.com/shiller-pe/table/by-month"
PRICE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=5d&interval=1d"
OUTPUT = Path(__file__).resolve().parent.parent / "docs" / "data" / "market.json"

MONTHS = {m: i for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], start=1)}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (shiller-pe-simulator)"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def parse_cape_table(html, min_rows=1000):
    """Lit la table multpl : [(date ISO, valeur)] du plus ancien au plus récent."""
    rows = re.findall(r"<td>(\w{3}) (\d{1,2}), (\d{4})</td>\s*<td>\s*(?:&#x2002;)?\s*([\d.]+)\s*</td>", html)
    if len(rows) < min_rows:
        raise RuntimeError(f"Table multpl inattendue : {len(rows)} lignes lues")
    history = [(f"{y}-{MONTHS[m]:02d}-{int(d):02d}", float(v)) for m, d, y, v in rows]
    return sorted(history)


def parse_price(payload):
    meta = json.loads(payload)["chart"]["result"][0]["meta"]
    when = datetime.fromtimestamp(meta["regularMarketTime"], tz=timezone.utc)
    return round(meta["regularMarketPrice"], 2), when.date().isoformat()


def build_data(history, price, price_date):
    # La première ligne de multpl est la valeur du jour (non mensuelle)
    current_date, current_cape = history[-1]
    monthly = [(d, v) for d, v in history if d.endswith("-01")]
    mean = sum(v for _, v in monthly) / len(monthly)

    return {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sp500": {"price": price, "date": price_date},
        "cape": {"current": current_cape, "date": current_date, "mean": round(mean, 2)},
        # Moyenne des bénéfices ajustés sur 10 ans, déduite de CAPE = Prix / E10
        "e10": round(price / current_cape, 2),
        "history": [[d[:7], v] for d, v in monthly],
        "sources": {"cape": CAPE_URL, "price": "Yahoo Finance (^GSPC)"},
    }


def main():
    history = parse_cape_table(fetch(CAPE_URL))
    price, price_date = parse_price(fetch(PRICE_URL))
    data = build_data(history, price, price_date)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"S&P 500 {price} ({price_date}) · CAPE {data['cape']['current']} ({data['cape']['date']}) · "
          f"moyenne {data['cape']['mean']} · {len(data['history'])} mois")


if __name__ == "__main__":
    main()
