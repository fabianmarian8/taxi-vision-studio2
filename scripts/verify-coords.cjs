const obce = require("../slovenske-obce-main/obce.json");
const cities = require("../src/data/cities.json");

function createSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Build map - first wins (same as precompute script)
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
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

// Records to verify
const toVerify = [
  { m: "visnove", c: "stara-tura" },
  { m: "zavada", c: "chynorany" },
  { m: "petrovce", c: "lucenec" },
  { m: "zavada", c: "banovce-nad-bebravou" },
];

console.log("=== SÚRADNICE POUŽITÉ V SYSTÉME ===\n");

toVerify.forEach(({ m, c }) => {
  const mCoords = municipalityMap.get(m);
  const cCoords = cityMap.get(c);

  console.log(m + " (" + (mCoords ? mCoords.district : "?") + "):");
  console.log("  Lat/Lon: " + (mCoords ? mCoords.lat.toFixed(5) + ", " + mCoords.lon.toFixed(5) : "N/A"));
  console.log("  -> " + c + ": " + (cCoords ? cCoords.lat.toFixed(5) + ", " + cCoords.lon.toFixed(5) : "N/A"));
  console.log("");
});
