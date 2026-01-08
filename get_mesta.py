import requests
import json

def get_czech_cities():
    """Stiahne len mestá (city + town) z Overpass API"""
    
    # Alternatívny mirror - overpass.kumi.systems
    mirrors = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass-api.de/api/interpreter"
    ]
    
    query = """
    [out:json][timeout:120];
    area["ISO3166-1"="CZ"]->.cz;
    (
      node["place"="city"](area.cz);
      node["place"="town"](area.cz);
    );
    out;
    """
    
    for mirror in mirrors:
        print(f"Skúšam: {mirror}")
        try:
            response = requests.post(
                mirror,
                data={'data': query},
                timeout=120,
                headers={'User-Agent': 'TaxiVisionStudio/1.0'}
            )
            if response.status_code == 200 and response.text.strip():
                data = response.json()
                if data.get('elements'):
                    print(f"  ✓ Úspech!")
                    return data
        except Exception as e:
            print(f"  ✗ {e}")
    
    return None

def main():
    data = get_czech_cities()
    
    if not data:
        print("Všetky mirrory zlyhali")
        return
    
    cities = []
    towns = []
    
    for el in data.get('elements', []):
        tags = el.get('tags', {})
        name = tags.get('name')
        place_type = tags.get('place')
        
        if name:
            item = {
                "name": name,
                "lat": el.get('lat'),
                "lon": el.get('lon'),
                "type": place_type,
                "population": tags.get('population', ''),
                "osm_id": el.get('id')
            }
            
            if place_type == 'city':
                cities.append(item)
            else:
                towns.append(item)
    
    cities.sort(key=lambda x: x['name'])
    towns.sort(key=lambda x: x['name'])
    
    all_mesta = cities + towns
    all_mesta.sort(key=lambda x: x['name'])
    
    with open('mesta_cz_gps.json', 'w', encoding='utf-8') as f:
        json.dump(all_mesta, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Uložených {len(all_mesta)} miest do mesta_cz_gps.json")
    print(f"  - city (veľké mestá): {len(cities)}")
    print(f"  - town (menšie mestá): {len(towns)}")
    
    print(f"\nVeľké mestá (city):")
    for c in cities[:15]:
        pop = f" ({c['population']} obyv.)" if c['population'] else ""
        print(f"  - {c['name']}{pop}")

if __name__ == "__main__":
    main()
