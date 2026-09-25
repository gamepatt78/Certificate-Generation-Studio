import fs from 'fs';
import path from 'url';
import { fileURLToPath } from 'url';
import pathModule from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);
const projectRootDir = pathModule.resolve(__dirname, '..');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  // Verify PNG signature
  if (buffer.readUInt32BE(0) !== 0x89504E47 || buffer.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a valid PNG file');
  }

  // Read IHDR chunk
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  
  return { width, height };
}

try {
  const pngPath = pathModule.join(projectRootDir, 'EMP-25002.png');
  const dims = getPngDimensions(pngPath);
  console.log(`EMP-25002.png dimensions: width=${dims.width}, height=${dims.height}`);
  console.log(`Aspect ratio (width / height): ${dims.width / dims.height}`);
} catch (e) {
  console.error('Failed to read PNG dimensions:', e);
}
