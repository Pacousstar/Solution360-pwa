// Script pour redimensionner le logo Solution360°
const fs = require('fs');
const path = require('path');

// Vérifier si sharp est disponible
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp n\'est pas installé. Installation...');
  console.log('Exécutez: npm install --save-dev sharp');
  process.exit(1);
}

const logoPath = path.join(__dirname, '..', 'logo.png');
const publicDir = path.join(__dirname, '..', 'public');

// Tailles à créer
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-icon.png', size: 180 },
];

async function resizeLogo() {
  if (!fs.existsSync(logoPath)) {
    console.error(`❌ Logo non trouvé: ${logoPath}`);
    process.exit(1);
  }

  console.log('🖼️  Redimensionnement du logo...');

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ ${name} (${size}x${size}px) créé`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${name}:`, error.message);
    }
  }

  console.log('✨ Toutes les icônes ont été créées !');
}

resizeLogo().catch(console.error);

