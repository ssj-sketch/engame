/**
 * Convert all indexed-color PNG monster sprites to RGBA format
 * for WebGL compatibility with Phaser 3.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MONSTERS_DIR = path.join(__dirname, '..', 'public', 'assets', 'monsters');
const TOTAL = 80;

async function convert() {
  let converted = 0;
  let errors = 0;

  for (let i = 1; i <= TOTAL; i++) {
    const key = `monster_${String(i).padStart(2, '0')}.png`;
    const filePath = path.join(MONSTERS_DIR, key);

    if (!fs.existsSync(filePath)) {
      console.warn(`  SKIP: ${key} not found`);
      continue;
    }

    try {
      const input = fs.readFileSync(filePath);
      // Convert to RGBA PNG (32-bit) and resize to 64x64 to ensure consistency
      const output = await sharp(input)
        .ensureAlpha()         // Ensure alpha channel exists
        .png({ palette: false }) // Force RGBA, not palette
        .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      fs.writeFileSync(filePath, output);
      converted++;
      if (i % 10 === 0) console.log(`  Converted ${i}/${TOTAL}...`);
    } catch (err) {
      console.error(`  ERROR: ${key}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone! Converted: ${converted}, Errors: ${errors}`);
}

convert();
