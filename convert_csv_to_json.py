import csv
import json

def convert():
    municipalities = []

    with open('souradnice_raw.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            municipalities.append({
                "name": row['Obec'],
                "kod": row['Kód obce'],
                "okres": row['Okres'],
                "kod_okresu": row['Kód okresu'],
                "kraj": row['Kraj'],
                "kod_kraje": row['Kód kraje'],
                "psc": row['PSČ'],
                "lat": float(row['Latitude']),
                "lon": float(row['Longitude'])
            })

    # Zoradiť podľa názvu
    municipalities.sort(key=lambda x: x['name'])

    with open('obce_cz_gps.json', 'w', encoding='utf-8') as f:
        json.dump(municipalities, f, ensure_ascii=False, indent=2)

    print(f"✓ Skonvertovaných {len(municipalities)} obcí")
    print(f"✓ Uložené do obce_cz_gps.json")

    # Štatistiky
    kraje = {}
    for m in municipalities:
        kraje[m['kraj']] = kraje.get(m['kraj'], 0) + 1

    print(f"\nPočet obcí podľa krajov:")
    for kraj, count in sorted(kraje.items(), key=lambda x: -x[1]):
        print(f"  {kraj}: {count}")

    print(f"\nPrvých 5:")
    for m in municipalities[:5]:
        print(f"  - {m['name']} ({m['okres']}): {m['lat']}, {m['lon']}")

if __name__ == "__main__":
    convert()
