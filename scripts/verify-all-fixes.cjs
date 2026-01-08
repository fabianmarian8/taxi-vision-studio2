const obce = require("../slovenske-obce-main/obce.json");
const cities = require("../src/data/cities.json");

function createSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Build map - first wins
const municipalityMap = new Map();
obce.forEach(m => {
  const slug = createSlug(m.name);
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district });
  }
});

const cityMap = new Map();
cities.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude });
  }
});

// All records that were "fixed"
const toVerify = [
  { m: "visnove", c: "stara-tura", ors: 10.9 },
  { m: "zavada", c: "chynorany", ors: 23 },
  { m: "petrovce", c: "lucenec", ors: 37.5 },
  { m: "zavada", c: "banovce-nad-bebravou", ors: 29.6 },
  { m: "milpos", c: "bardejov", ors: 37.2 },
  { m: "bystricka", c: "martin", ors: 5.5 },
  { m: "stupne", c: "puchov", ors: 16.8 },
  { m: "vojka-nad-dunajom", c: "dunajska-streda", ors: 32.8 },
  { m: "ptruksa", c: "biel", ors: 27.2 },
  { m: "nevolne", c: "handlova", ors: 33.2 },
  { m: "ptruksa", c: "cierna-nad-tisou", ors: 30 },
  { m: "bansky-studenec", c: "krupina", ors: 20.2 },
  { m: "boliarov", c: "kosice", ors: 34.8 },
];

async function getOSRM(fromLat, fromLon, toLat, toLon) {
  try {
    const url = "https://router.project-osrm.org/route/v1/driving/" + fromLon + "," + fromLat + ";" + toLon + "," + toLat + "?overview=false";
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return {
        distance: Math.round(data.routes[0].distance / 100) / 10,
        duration: Math.round(data.routes[0].duration / 60)
      };
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.log("=== OVERENIE VŠETKÝCH OPRÁV ===");
  console.log("Používam SPRÁVNE súradnice zo systému\n");

  for (const item of toVerify) {
    const mCoords = municipalityMap.get(item.m);
    const cCoords = cityMap.get(item.c);

    if (!mCoords || !cCoords) {
      console.log(item.m + " -> " + item.c + ": CHÝBAJÚ SÚRADNICE");
      continue;
    }

    const osrm = await getOSRM(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);

    if (osrm) {
      const diff = Math.abs(osrm.distance - item.ors);
      const diffPct = (diff / item.ors * 100).toFixed(0);
      const status = diff < 5 ? "✓ OK" : diff < 10 ? "~ MINOR" : "✗ PROBLEM";

      console.log(item.m + " (" + mCoords.district + ") -> " + item.c + ":");
      console.log("  ORS: " + item.ors + " km, OSRM: " + osrm.distance + " km (" + diffPct + "%) " + status);
    }

    await new Promise(r => setTimeout(r, 150));
  }
}

main();
