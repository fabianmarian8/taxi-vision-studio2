import requests
import json
import csv
from io import StringIO

def download_from_github():
    """Stiahne zoznam českých obcí z GitHubu (vyskocilm/czech-cities)"""

    # Skúsime viacero zdrojov
    sources = [
        {
            "name": "czech-cities GitHub",
            "url": "https://raw.githubusercontent.com/vyskocilm/czech-cities/master/data/obce.csv",
            "parser": "csv"
        },
        {
            "name": "Overpass mirror (kumi.systems)",
            "url": "https://overpass.kumi.systems/api/interpreter",
            "parser": "overpass"
        }
    ]

    # Skúsime GitHub CSV
    print("Skúšam GitHub repository (vyskocilm/czech-cities)...")
    try:
        response = requests.get(sources[0]["url"], timeout=30)
        response.raise_for_status()

        # Parse CSV
        municipalities = []
        reader = csv.DictReader(StringIO(response.text))

        for row in reader:
            # Štruktúra CSV: kod,nazev,nazev_ascii,okres_kod,okres_nazev,kraj_kod,kraj_nazev,psc,lat,lng
            if row.get('lat') and row.get('lng') and row.get('nazev'):
                municipalities.append({
                    "name": row['nazev'],
                    "lat": float(row['lat']),
                    "lon": float(row['lng']),
                    "okres": row.get('okres_nazev', ''),
                    "kraj": row.get('kraj_nazev', ''),
                    "kod": row.get('kod', ''),
                    "psc": row.get('psc', '')
                })

        if municipalities:
            municipalities.sort(key=lambda x: x['name'])
            save_results(municipalities)
            return

    except Exception as e:
        print(f"  Chyba: {e}")

    # Skúsime alternatívny Overpass mirror
    print("\nSkúšam alternatívny Overpass mirror...")
    try:
        query = """
        [out:json][timeout:180];
        area["ISO3166-1"="CZ"]->.cz;
        (
          node["place"~"city|town|village"](area.cz);
        );
        out;
        """

        response = requests.post(
            sources[1]["url"],
            data={'data': query},
            timeout=180,
            headers={'User-Agent': 'TaxiVisionStudio/1.0'}
        )
        response.raise_for_status()
        data = response.json()

        municipalities = []
        for el in data.get('elements', []):
            name = el.get('tags', {}).get('name')
            lat = el.get('lat')
            lon = el.get('lon')
            if name and lat and lon:
                municipalities.append({
                    "name": name,
                    "lat": lat,
                    "lon": lon,
                    "type": el.get('tags', {}).get('place', ''),
                    "osm_id": el.get('id')
                })

        if municipalities:
            municipalities.sort(key=lambda x: x['name'])
            save_results(municipalities)
            return

    except Exception as e:
        print(f"  Chyba: {e}")

    print("\nVšetky zdroje zlyhali. Skús neskôr alebo použi manuálny download.")

def save_results(municipalities):
    with open('obce_cz_gps.json', 'w', encoding='utf-8') as f:
        json.dump(municipalities, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Uložených {len(municipalities)} obcí do obce_cz_gps.json")

    print("\nPrvých 10 záznamov:")
    for m in municipalities[:10]:
        print(f"  - {m['name']}: {m['lat']:.6f}, {m['lon']:.6f}")

    # Štatistiky
    print(f"\nPosledných 5 záznamov:")
    for m in municipalities[-5:]:
        print(f"  - {m['name']}: {m['lat']:.6f}, {m['lon']:.6f}")

if __name__ == "__main__":
    download_from_github()
