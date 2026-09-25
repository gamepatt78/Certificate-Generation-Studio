import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname, '..');

function inspectText() {
  const pdfPath = path.join(projectRootDir, 'Aaryan Koirala  intern id 27011.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.log('PDF not found.');
    return;
  }
  
  const content = fs.readFileSync(pdfPath, 'utf8');
  
  // Search for keywords
  const keywords = [
    'offer', 'appointment', 'joining', 'compensation', 'stipend', 'responsibilities', 
    'certificate', 'completed', 'completion', 'performance', 'grade', 'successful', 
    'Aaryan', 'Koirala', 'Raunak', 'Ray', 'Ston', 'Technology'
  ];
  
  console.log('Keyword search results in raw PDF bytes:');
  keywords.forEach(kw => {
    const regex = new RegExp(kw, 'gi');
    const matches = content.match(regex);
    console.log(`- "${kw}": ${matches ? matches.length : 0} matches`);
  });

  // Let's print out readable text sequences from streams if we can find any
  console.log('\nExtracted text-like snippets:');
  const streamRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  let count = 0;
  while ((match = streamRegex.exec(content)) !== null && count < 30) {
    console.log(`Snippet: ${match[1]}`);
    count++;
  }
}

inspectText();
