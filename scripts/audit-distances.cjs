const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/precomputed-distances.json');

try {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const distances = data.distances;
    
    console.log(`Spúšťam audit pre ${distances.length} záznamov vzdialeností...`);
    
    let roadLessThanAir = 0;
    let extremeDetour = 0;
    let zeroDistances = 0;
    let valid = 0;

    const samples = [];

    distances.forEach((d, index) => {
        const { municipalitySlug, citySlug, airDistance, roadDistance } = d;
        
        // Skip check if slugs are practically strictly equal (rare)
        if (municipalitySlug === citySlug) return; 

        let isIssue = false;

        if (roadDistance < airDistance) {
            roadLessThanAir++;
            isIssue = true;
            if (roadLessThanAir <= 5) {
                 console.log(`[CHYBA] Cesta < Vzduch: ${municipalitySlug} -> ${citySlug} (Vzduch: ${airDistance} km, Cesta: ${roadDistance} km)`);
            }
        } else if (roadDistance > airDistance * 3 && airDistance > 2) { 
            // Ignore very short distances (< 2km) for ratio check as map routing can be weird for short segments
            extremeDetour++;
            isIssue = true;
             if (extremeDetour <= 5) {
                 console.log(`[VAROVANIE] Veľká obchádzka (>3x): ${municipalitySlug} -> ${citySlug} (Vzduch: ${airDistance} km, Cesta: ${roadDistance} km)`);
            }
        } else if (roadDistance === 0 || airDistance === 0) {
            zeroDistances++;
            isIssue = true;
             if (zeroDistances <= 5) {
                 console.log(`[VAROVANIE] Nulová vzdialenosť: ${municipalitySlug} -> ${citySlug}`);
            }
        } else {
            valid++;
        }

        // Random sample for manual verification by user (approx 10 samples)
        // Using a slightly higher probability to ensure we get some
        if (samples.length < 10 && Math.random() < 0.002) { 
            samples.push(`${municipalitySlug} -> ${citySlug}: Cesta ${roadDistance} km (Vzduch ${airDistance} km)`);
        }
    });

    console.log('\n--- Súhrn ---');
    console.log(`Celkový počet záznamov: ${distances.length}`);
    console.log(`Validné: ${valid}`);
    console.log(`Chyba (Cesta < Vzduch): ${roadLessThanAir}`);
    console.log(`Varovanie (Obchádzka >3x): ${extremeDetour}`);
    console.log(`Varovanie (Nulové): ${zeroDistances}`);
    
    console.log('\n--- Náhodné vzorky na manuálnu kontrolu ---');
    samples.forEach(s => console.log(s));

} catch (err) {
    console.error("Chyba pri čítaní súboru:", err);
}
