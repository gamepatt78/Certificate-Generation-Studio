import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getSettings, updateSettings, getNextInternId, incrementInternId, addRecord } from './db.js';
import { generatePDF } from './pdfGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname, '..');

const test = async () => {
  console.log('--- STARTING programMATIC PDF TEST ---');
  try {
    // 0. Setup directories
    const dirs = [
      'database',
      'templates',
      'generated',
      'generated/offer-letters',
      'generated/certificates',
      'uploads',
      'uploads/logos',
      'uploads/signatures',
      'uploads/fonts',
      'uploads/temp',
      'assets'
    ];
    dirs.forEach((dir) => {
      const p = path.join(projectRootDir, dir);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
      }
    });

    // 1. Initialize Database
    console.log('1. Initializing DB...');
    await initDB();
    const settings = await getSettings();
    console.log(`- Database initialized. Current settings company name: "${settings.company_name}"`);

    // 2. Validate Counter
    console.log('2. Validating Intern ID counter...');
    const nextIdBefore = await getNextInternId();
    console.log(`- Next Intern ID before: ${nextIdBefore}`);
    const allocatedId = await incrementInternId();
    const nextIdAfter = await getNextInternId();
    console.log(`- Allocated ID: ${allocatedId}, Next Intern ID after: ${nextIdAfter}`);
    if (nextIdAfter !== nextIdBefore + 1) {
      throw new Error('Intern ID counter failed to increment correctly');
    }

    // 3. Test Offer Letter PDF Generation (Image background)
    console.log('3. Testing Offer Letter PDF generation (PNG background)...');
    const offerLetterData = {
      internId: allocatedId,
      fullName: 'Aaryan Koirala (Test)',
      role: 'Software Engineer Intern',
      department: 'Engineering',
      startDate: 'July 1, 2026',
      duration: '3 Months',
      documentDate: 'June 29, 2026',
      companyName: settings.company_name
    };

    const offerLetterPdf = await generatePDF(offerLetterData, 'offer_letter', false);
    const testOfferLetterPath = path.join(projectRootDir, 'generated/offer-letters', `TEST-INTERN-${allocatedId}.pdf`);
    fs.writeFileSync(testOfferLetterPath, offerLetterPdf);
    console.log(`- Offer Letter PDF generated successfully at: ${testOfferLetterPath}`);
    console.log(`- File size: ${offerLetterPdf.length} bytes`);
    if (offerLetterPdf.length === 0) {
      throw new Error('Generated Offer Letter PDF is empty');
    }

    // 4. Test Certificate PDF Generation (PDF background + QR Code)
    console.log('4. Testing Certificate PDF generation (PDF background)...');
    const certData = {
      internId: allocatedId,
      fullName: 'Aaryan Koirala (Test)',
      role: 'Software Engineer Intern',
      department: 'Engineering',
      duration: '3 Months',
      documentDate: 'June 29, 2026',
      performanceGrade: 'Outstanding',
      achievementDescription: 'for outstanding contributions to full-stack backend development and API systems.',
      companyName: settings.company_name
    };

    const certPdf = await generatePDF(certData, 'certificate', false);
    const testCertPath = path.join(projectRootDir, 'generated/certificates', `TEST-CERT-${allocatedId}.pdf`);
    fs.writeFileSync(testCertPath, certPdf);
    console.log(`- Certificate PDF generated successfully at: ${testCertPath}`);
    console.log(`- File size: ${certPdf.length} bytes`);
    if (certPdf.length === 0) {
      throw new Error('Generated Certificate PDF is empty');
    }

    // 5. Test Watermark feature
    console.log('5. Enabling watermark and generating test PDF...');
    await updateSettings({ enable_draft_watermark: 1 });
    const offerLetterPdfWithWatermark = await generatePDF(offerLetterData, 'offer_letter', false);
    const testWatermarkPath = path.join(projectRootDir, 'generated/offer-letters', `TEST-INTERN-WATERMARK-${allocatedId}.pdf`);
    fs.writeFileSync(testWatermarkPath, offerLetterPdfWithWatermark);
    console.log(`- Watermarked Offer Letter generated at: ${testWatermarkPath}`);
    
    // Reset watermark setting to original
    await updateSettings({ enable_draft_watermark: settings.enable_draft_watermark });

    console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
};

test();
