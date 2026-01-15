// Generate PWA Icons using Sharp
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source image (use RoV logo)
const sourceImage = path.join(__dirname, 'public/images/logo/RoV-Logo.png');
const outputDir = path.join(__dirname, 'public/images/icons');

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create output directory if not exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    console.log('🎨 Generating PWA icons from:', sourceImage);

    try {
        for (const size of sizes) {
            const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

            await sharp(sourceImage)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 10, g: 22, b: 40, alpha: 1 } // Deep space color
                })
                .png()
                .toFile(outputFile);

            console.log(`✅ Created: icon-${size}x${size}.png`);
        }

        console.log('\n🎉 All icons generated successfully!');
        console.log('📁 Output directory:', outputDir);

    } catch (error) {
        console.error('❌ Error generating icons:', error);
    }
}

generateIcons();
