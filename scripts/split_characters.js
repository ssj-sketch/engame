/**
 * Split 캐릭터.png into 3 individual character PNGs
 * Remove checker pattern background and make it truly transparent
 * Resize for game use (128x128)
 */
const sharp = require('sharp');
const path = require('path');

const INPUT = path.join('C:', 'Users', 'angel', 'OneDrive', '바탕 화면', '파닉스', '캐릭터.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'characters');

const CHARACTERS = [
  { name: 'knight', left: 0,    label: '기사' },
  { name: 'archer', left: 938,  label: '궁수' },
  { name: 'viking', left: 1876, label: '바이킹' },
];

// Checker pattern colors (typical Photoshop/AI transparency indicator)
function isCheckerBackground(r, g, b) {
  const isWhitish = r > 230 && g > 230 && b > 230;
  const isLightGray = r > 185 && r < 215 && g > 185 && g < 215 && b > 185 && b < 215;
  return isWhitish || isLightGray;
}

async function split() {
  const meta = await sharp(INPUT).metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  const charWidth = Math.floor(meta.width / 3);
  const charHeight = meta.height;
  console.log(`Each char region: ${charWidth}x${charHeight}`);

  for (const char of CHARACTERS) {
    // Extract character region as raw RGBA
    const { data, info } = await sharp(INPUT)
      .extract({
        left: char.left,
        top: 0,
        width: charWidth,
        height: charHeight,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log(`  Processing ${char.name}: ${info.width}x${info.height}`);

    // Remove checker background
    const newData = Buffer.from(data);
    let removedCount = 0;
    for (let i = 0; i < newData.length; i += 4) {
      if (isCheckerBackground(newData[i], newData[i + 1], newData[i + 2])) {
        newData[i + 3] = 0;
        removedCount++;
      }
    }
    console.log(`    Removed ${removedCount} checker pixels`);

    // Reconstruct, trim, resize
    const outputPath = path.join(OUTPUT_DIR, `${char.name}.png`);
    await sharp(newData, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim()
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ palette: false })
      .toFile(outputPath);

    console.log(`  ✅ ${char.label} -> ${char.name}.png`);
  }

  console.log('\nDone!');
}

split().catch(err => console.error(err));
