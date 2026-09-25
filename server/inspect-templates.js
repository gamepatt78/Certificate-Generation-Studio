import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname, '..');

async function inspect() {
  console.log('Inspecting templates...');
  
  // Inspect PDF
  const pdfPath = path.join(projectRootDir, 'Aaryan Koirala  intern id 27011.pdf');
  if (fs.existsSync(pdfPath)) {
    const bytes = fs.readFileSync(pdfPath);
    const doc = await PDFDocument.load(bytes);
    console.log(`PDF: ${pdfPath}`);
    console.log(`- Pages: ${doc.getPageCount()}`);
    console.log(`- Creator: ${doc.getCreator()}`);
    console.log(`- Title: ${doc.getTitle()}`);
    console.log(`- Subject: ${doc.getSubject()}`);
    
    // Check first page size
    const page = doc.getPages()[0];
    console.log(`- First page dimensions: width=${page.getWidth()}, height=${page.getHeight()}`);
  } else {
    console.log(`PDF not found: ${pdfPath}`);
  }

  // Inspect PNG
  const pngPath = path.join(projectRootDir, 'EMP-25002.png');
  if (fs.existsSync(pngPath)) {
    const stats = fs.statSync(pngPath);
    console.log(`PNG: ${pngPath}`);
    console.log(`- Size: ${stats.size} bytes`);
  } else {
    console.log(`PNG not found: ${pngPath}`);
  }
}

inspect();
