const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a certificate PDF for course completion
 * @param {Object} options - Certificate generation options
 * @param {string} options.studentName - Full name of the student
 * @param {string} options.courseName - Name of the completed course
 * @param {Date} options.completionDate - Date of course completion
 * @param {string} options.certificateId - Unique certificate ID
 * @param {number} options.score - Final score percentage
 * @param {string} options.instructorName - Name of the course instructor
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateCertificate = async (options) => {
  const {
    studentName,
    courseName,
    completionDate,
    certificateId,
    score,
    instructorName
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      // Buffer to store PDF
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Draw decorative border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
        .lineWidth(3)
        .stroke('#2563EB');

      doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
        .lineWidth(1)
        .stroke('#2563EB');

      // Add logo placeholder (you can replace with actual logo)
      doc.fontSize(24)
        .fillColor('#2563EB')
        .text('🎓 TechBridge', 0, 80, { align: 'center' });

      // Certificate title
      doc.fontSize(48)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text('Certificate of Completion', 0, 150, { align: 'center' });

      // Decorative line
      doc.moveTo(250, 220)
        .lineTo(pageWidth - 250, 220)
        .lineWidth(2)
        .stroke('#2563EB');

      // "This certifies that" text
      doc.fontSize(16)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('This certifies that', 0, 250, { align: 'center' });

      // Student name (highlighted)
      doc.fontSize(36)
        .fillColor('#2563EB')
        .font('Helvetica-Bold')
        .text(studentName, 0, 290, { align: 'center' });

      // "Has successfully completed" text
      doc.fontSize(16)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('has successfully completed the course', 0, 350, { align: 'center' });

      // Course name
      doc.fontSize(28)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text(courseName, 0, 385, { align: 'center', width: pageWidth });

      // Score display
      doc.fontSize(14)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(`Final Score: ${score}%`, 0, 440, { align: 'center' });

      // Completion date
      const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Completed on ${formattedDate}`, 0, 475, { align: 'center' });

      // Signature section
      const signatureY = pageHeight - 150;

      // Left signature (Instructor)
      doc.moveTo(150, signatureY)
        .lineTo(300, signatureY)
        .stroke('#6B7280');
      
      doc.fontSize(14)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text(instructorName || 'Course Instructor', 100, signatureY + 10, { 
          width: 200, 
          align: 'center' 
        });
      
      doc.fontSize(10)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('Instructor', 100, signatureY + 30, { 
          width: 200, 
          align: 'center' 
        });

      // Right signature (Platform Director)
      doc.moveTo(pageWidth - 300, signatureY)
        .lineTo(pageWidth - 150, signatureY)
        .stroke('#6B7280');
      
      doc.fontSize(14)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text('TechBridge Director', pageWidth - 350, signatureY + 10, { 
          width: 200, 
          align: 'center' 
        });
      
      doc.fontSize(10)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('Platform Director', pageWidth - 350, signatureY + 30, { 
          width: 200, 
          align: 'center' 
        });

      // Certificate ID at bottom
      doc.fontSize(8)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 60, { 
          align: 'center' 
        });

      // Add verification URL
      doc.fontSize(8)
        .fillColor('#2563EB')
        .text('Verify at: techbridge.org/verify', 0, pageHeight - 45, { 
          align: 'center',
          link: `https://techbridge.org/verify/${certificateId}`
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate certificate filename
 * @param {string} studentName - Student name
 * @param {string} courseName - Course name
 * @returns {string} Sanitized filename
 */
const generateCertificateFilename = (studentName, courseName) => {
  const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `certificate_${sanitize(studentName)}_${sanitize(courseName)}_${Date.now()}.pdf`;
};

module.exports = {
  generateCertificate,
  generateCertificateFilename
};
