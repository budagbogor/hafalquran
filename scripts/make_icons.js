#!/usr/bin/env node
/**
 * Script untuk generate Android icon dari logo lingkaran
 * Menggunakan sharp (sudah terinstall di project)
 * 
 * Jalankan: node scripts/make_icons.cjs
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== KONFIGURASI =====
const INPUT_IMAGE = String.raw`C:\Users\DarkSky\.gemini\antigravity\brain\d5b2d7eb-fc6e-4697-98fc-cddfab192f64\media__1773675227066.jpg`;

const OUTPUT_BASE = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Ukuran standard Android mipmap
const SIZES = {
    'mipmap-ldpi': 36,
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

/** Buat SVG mask lingkaran */
function circleMask(size) {
    const r = size / 2;
    return Buffer.from(
        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`
    );
}

async function main() {
    console.log('🕌 Hafalan Al-Quran — Android Icon Generator\n');
    console.log(`Input: ${INPUT_IMAGE}`);

    if (!fs.existsSync(INPUT_IMAGE)) {
        console.error(`❌ File tidak ditemukan: ${INPUT_IMAGE}`);
        process.exit(1);
    }

    const meta = await sharp(INPUT_IMAGE).metadata();
    console.log(`Ukuran asli: ${meta.width}×${meta.height}px\n`);

    // Center crop based on the smaller dimension
    const diameter = Math.min(meta.width, meta.height);
    const offsetX = Math.round((meta.width - diameter) / 2);
    const offsetY = Math.round((meta.height - diameter) / 2);

    let success = 0;

    for (const [folder, size] of Object.entries(SIZES)) {
        const outDir = path.join(OUTPUT_BASE, folder);

        if (!fs.existsSync(outDir)) {
            console.warn(`⚠ Folder tidak ada: ${outDir}`);
            continue;
        }

        try {
            // Extract square dari lingkaran, resize ke target
            const squareBuffer = await sharp(INPUT_IMAGE)
                .extract({ left: offsetX, top: offsetY, width: diameter, height: diameter })
                .resize(size, size)
                .png()
                .toBuffer();

            // ic_launcher_round.png: lingkaran + transparan luar
            const roundPath = path.join(outDir, 'ic_launcher_round.png');
            await sharp(squareBuffer)
                .composite([{ input: circleMask(size), blend: 'dest-in' }])
                .png()
                .toFile(roundPath);

            // ic_launcher.png: persegi dengan background putih
            const launcherPath = path.join(outDir, 'ic_launcher.png');
            await sharp({ create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } } })
                .png()
                .composite([{ input: squareBuffer }])
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .toFile(launcherPath);

            // ic_launcher_foreground.png: icon dengan padding adaptive (72% content)
            const contentSize = Math.round(size * 0.72);
            const offset = Math.round((size - contentSize) / 2);
            const fgPath = path.join(outDir, 'ic_launcher_foreground.png');

            const smallCircle = await sharp(squareBuffer)
                .resize(contentSize, contentSize)
                .composite([{ input: circleMask(contentSize), blend: 'dest-in' }])
                .png()
                .toBuffer();

            await sharp({
                create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
            })
                .composite([{ input: smallCircle, left: offset, top: offset }])
                .png()
                .toFile(fgPath);

            console.log(`✓ ${folder.padEnd(18)} ${size}px`);
            success++;
        } catch (err) {
            console.error(`❌ ${folder}: ${err.message}`);
        }
    }

    console.log(`\n✅ Selesai: ${success}/${Object.keys(SIZES).length} folder`);
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
