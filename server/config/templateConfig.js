/**
 * Configuration file for document templates layout.
 * Coordinates are defined in percentages (%) from the top-left of the page.
 * pdfGenerator.js translates these percentages to the correct PDF points coordinate system.
 * 
 * Available fields for Offer Letter:
 * - fullName, role, department, startDate, duration, documentDate, internshipType, companyName, additionalNotes, internId
 * 
 * Available fields for Certificate:
 * - fullName, role, duration, documentDate, performanceGrade, achievementDescription, companyName, internId, qrCode, ceoSignature
 */

export const templateConfig = {
  offer_letter: {
    name: 'Internship Offer Letter',
    templatePath: 'templates/offer_letter_template.pdf', // Correct portrait PDF template
    fileType: 'pdf',
    defaultWidth: 595,
    defaultHeight: 842,
    fields: {
      internId: {
        x: 82,
        y: 12,
        fontSize: 10,
        color: '#1e293b',
        fontFamily: 'Helvetica-Bold',
        alignment: 'right'
      },
      documentDate: {
        x: 87.5,
        y: 27.2,
        fontSize: 10,
        color: '#1e293b',
        fontFamily: 'Helvetica',
        alignment: 'right'
      },
      fullName: {
        x: 19.1,
        y: 29.4,
        fontSize: 12,
        color: '#0f172a',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      role: {
        x: 58.6,
        y: 41.1,
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      startDate: {
        x: 55.6,
        y: 43.0,
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      duration: {
        x: 32.0,
        y: 54.8,
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      internshipType: {
        x: 24.2,
        y: 54.8,
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      companyName: {
        x: 29.3,
        y: 43.0,
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'Helvetica',
        alignment: 'left'
      }
    }
  },
  certificate: {
    name: 'Internship Completion Certificate',
    templatePath: 'templates/certificate_template.png', // Correct landscape PNG template
    fileType: 'png',
    defaultWidth: 842,
    defaultHeight: 595,
    fields: {
      fullName: {
        x: 32.5, // Aligned with the left edge of the blue text
        y: 49.5, // Adjusted to perfectly overlap baseline
        fontSize: 28,
        color: '#4e84d4', // Matches the blue color
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      role: {
        x: 58, // Moved left to match 'Backend'
        y: 59.5, // Moved down to match baseline
        fontSize: 14,
        color: '#334155',
        fontFamily: 'Helvetica-Bold',
        alignment: 'left'
      },
      duration: {
        x: 77, // Moved left to match '90 days'
        y: 59.5, 
        fontSize: 14,
        color: '#334155',
        fontFamily: 'Helvetica',
        alignment: 'left'
      },
      documentDate: {
        x: 14.5, // Centered in the left black pane
        y: 83.5, // Moved down to overlap perfectly

        fontSize: 12,
        color: '#ffffff', // White text for black background
        fontFamily: 'Helvetica',
        alignment: 'center'
      },
      internId: {
        x: 95, // Top right corner
        y: 8,
        fontSize: 10,
        color: '#64748b',
        fontFamily: 'Helvetica',
        alignment: 'right'
      },
      // QR Code for verification
      qrCode: {
        type: 'image',
        x: 82,
        y: 78,
        width: 65,
        height: 65
      },
      // CEO Signature
      ceoSignature: {
        type: 'image',
        x: 68,
        y: 69,
        width: 100,
        height: 40
      }
    }
  }
};
