const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = 'C:\\Users\\DarkSky\\.gemini\\antigravity\\brain\\71ab82d4-9f57-41cc-af03-a68a093f4a51\\hafal_quran_icon_1773070292068.png';
const BASE = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const sizes = {
    'mipmap-ldpi': 36,
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

async function run() {
    for (const [folder, size] of Object.entries(sizes)) {
        const outDir = path.join(BASE, folder);
        fs.mkdirSync(outDir, { recursive: true });
        for (const fname of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png', 'ic_launcher_background.png']) {
            const outPath = path.join(outDir, fname);
            await sharp(SRC)
                .resize(size, size, { fit: 'contain', background: { r: 6, g: 8, b: 16, alpha: 1 } })
                .png()
                .toFile(outPath);
        }
        console.log(`  ${folder}: ${size}x${size} OK`);
    }
    console.log('\nAll icons generated successfully!');
}

run().catch(e => { console.error(e); process.exit(1); });
