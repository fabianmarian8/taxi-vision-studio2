import requests
import json
import time

def get_czech_municipalities():
    # Overpass API query: obce v Česku (boundary=administrative, admin_level=8)
    overpass_url = "https://overpass-api.de/api/interpreter"

    # Správny query - ISO 3166-1 kód pre Česko je CZ
    overpass_query = """
    [out:json][timeout:300];
    area["ISO3166-1"="CZ"]->.cz;
    (
      relation["boundary"="administrative"]["admin_level"="8"](area.cz);
    );
    out center;
    """

    print("Sťahujem údaje z Overpass API (môže to trvať 1-2 minúty)...")
    print("Query: admin_level=8 (obce) v ČR")

    try:
        response = requests.post(
            overpass_url,
            data={'data': overpass_query},
            timeout=300,
            headers={'User-Agent': 'TaxiVisionStudio/1.0'}
        )
        response.raise_for_status()

        if not response.text.strip():
            print("Prázdna odpoveď od API")
            return

        data = response.json()
        print(f"Prijatých {len(data.get('elements', []))} elementov z API")

    except requests.exceptions.RequestException as e:
        print(f"Chyba pri pripojení k API: {e}")
        return
    except json.JSONDecodeError as e:
        print(f"Chyba pri parsovaní JSON: {e}")
        print(f"Response (prvých 1000 znakov): {response.text[:1000]}")
        return

    municipalities = []
    skipped = 0
    for element in data.get('elements', []):
        name = element.get('tags', {}).get('name')
        center = element.get('center', {})
        lat = center.get('lat')
        lon = center.get('lon')

        if name and lat and lon:
            tags = element.get('tags', {})
            municipalities.append({
                "name": name,
                "lat": lat,
                "lon": lon,
                "okres": tags.get('is_in:county', ''),
                "kraj": tags.get('is_in:state', ''),
                "osm_id": element.get('id')
            })
        else:
            skipped += 1

    print(f"Preskočených {skipped} záznamov (chýbajúce údaje)")

    # Zoradenie podľa názvu
    municipalities.sort(key=lambda x: x['name'])

    with open('obce_cz_gps.json', 'w', encoding='utf-8') as f:
        json.dump(municipalities, f, ensure_ascii=False, indent=2)

    print(f"\nHotovo! Uložených {len(municipalities)} obcí do obce_cz_gps.json")

    # Ukážka prvých 10 záznamov
    print("\nPrvých 10 záznamov:")
    for m in municipalities[:10]:
        print(f"  - {m['name']}: {m['lat']:.6f}, {m['lon']:.6f}")

if __name__ == "__main__":
    get_czech_municipalities()
