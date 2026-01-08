const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Define the duplicate slug mappings based on geographic proximity
// Each entry maps: slug -> [{ district: 'X', nearbyCities: [...] }]
const duplicateMappings = {
  'brezany': [
    { district: 'zilina', nearbyCities: ['zilina', 'martin', 'ruzomberok', 'dolny-kubin', 'bytca', 'kysucke-nove-mesto', 'rajec'] },
    { district: 'presov', nearbyCities: ['presov', 'sabinov', 'bardejov', 'vranov-nad-toplou', 'stara-lubovna', 'kosice', 'velky-saris'] }
  ],
  'cernina': [
    { district: 'svidnik', nearbyCities: ['svidnik', 'stropkov', 'bardejov', 'giraltovce', 'presov', 'vranov-nad-toplou'] },
    { district: 'humenne', nearbyCities: ['humenne', 'snina', 'medzilaborce', 'michalovce', 'strazske', 'trebisov', 'chlmec'] }
  ],
  'celovce': [
    { district: 'velky-krtis', nearbyCities: ['velky-krtis', 'lucenec', 'krupina', 'zvolen', 'banska-stiavnica', 'levice', 'modry-kamen', 'sahy'] },
    { district: 'presov', nearbyCities: ['presov', 'sabinov', 'lipany', 'kosice', 'spisska-nova-ves', 'poprad'] },
    { district: 'trebisov', nearbyCities: ['trebisov', 'secovce', 'michalovce', 'kosice', 'kral-ovsky-chlmec', 'humenne'] }
  ],
  'janovce': [
    { district: 'bardejov', nearbyCities: ['bardejov', 'svidnik', 'presov', 'giraltovce', 'stropkov', 'stara-lubovna', 'velky-saris'] },
    { district: 'galanta', nearbyCities: ['galanta', 'sered', 'sala', 'dunajska-streda', 'trnava', 'hlohovec', 'sladkovicovo', 'senec'] },
    { district: 'poprad', nearbyCities: ['poprad', 'kezmarok', 'levoca', 'spisska-nova-ves', 'svit', 'vysoke-tatry'] }
  ],
  'lazany': [
    { district: 'prievidza', nearbyCities: ['prievidza', 'bojnice', 'handlova', 'partizanske', 'nova-bana', 'banovce-nad-bebravou', 'novaky'] },
    { district: 'presov', nearbyCities: ['presov', 'sabinov', 'lipany', 'stara-lubovna', 'bardejov', 'kosice', 'velky-saris'] }
  ],
  'sklabina': [
    { district: 'velky-krtis', nearbyCities: ['velky-krtis', 'lucenec', 'krupina', 'zvolen', 'banska-stiavnica', 'levice', 'modry-kamen'] },
    { district: 'martin', nearbyCities: ['martin', 'vrutky', 'zilina', 'turcianske-teplice', 'ruzomberok', 'dolny-kubin', 'turany'] }
  ]
};

let totalUpdated = 0;
let notMatched = [];

data.distances = data.distances.map(d => {
  const baseSlug = d.municipalitySlug;

  if (duplicateMappings[baseSlug]) {
    const mappings = duplicateMappings[baseSlug];

    // Find which district this entry belongs to
    for (const mapping of mappings) {
      if (mapping.nearbyCities.includes(d.citySlug)) {
        const newSlug = `${baseSlug}-${mapping.district}`;
        d.municipalitySlug = newSlug;
        totalUpdated++;
        return d;
      }
    }

    // Entry didn't match any known nearby city
    notMatched.push({ slug: baseSlug, city: d.citySlug });
  }

  return d;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Updated ${totalUpdated} entries`);
if (notMatched.length > 0) {
  console.log('\nEntries not matched (need manual check):');
  notMatched.forEach(e => console.log(`  ${e.slug} -> ${e.city}`));
}
