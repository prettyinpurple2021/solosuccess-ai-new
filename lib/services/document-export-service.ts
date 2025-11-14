import { prisma } from '@/lib/prisma';

export class DocumentExportService {
  /**
   * Generate PDF from document content
   * In production, this would use a library like puppeteer or a service like DocRaptor
   */
  static async generatePDF(documentId: string, userId: string): Promise<string> {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId },
      include: { template: true }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // In production, implement actual PDF generation
    // For now, we'll simulate by returning a placeholder URL
    const pdfUrl = `/api/documents/${documentId}/download?format=pdf`;

    // Update document with PDF URL
    await prisma.generatedDocument.update({
      where: { id: documentId },
      data: { pdfUrl }
    });

    return pdfUrl;
  }

  /**
   * Generate DOCX from document content
   * In production, this would use a library like docx or mammoth
   */
  static async generateDOCX(documentId: string, userId: string): Promise<string> {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId },
      include: { template: true }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // In production, implement actual DOCX generation
    // For now, we'll simulate by returning a placeholder URL
    const docxUrl = `/api/documents/${documentId}/download?format=docx`;

    // Update document with DOCX URL
    await prisma.generatedDocument.update({
      where: { id: documentId },
      data: { docxUrl }
    });

    return docxUrl;
  }

  /**
   * Send document via email
   */
  static async sendDocumentEmail(
    documentId: string,
    userId: string,
    recipientEmail: string,
    format: 'pdf' | 'docx' = 'pdf'
  ): Promise<void> {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId },
      include: { template: true }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Generate the document in the requested format
    const fileUrl = format === 'pdf'
      ? await this.generatePDF(documentId, userId)
      : await this.generateDOCX(documentId, userId);

    // In production, implement actual email sending using SendGrid or similar
    console.log(`Sending document ${document.title} to ${recipientEmail} as ${format}`);
    console.log(`File URL: ${fileUrl}`);

    // TODO: Implement email sending with attachment
    // await emailService.send({
    //   to: recipientEmail,
    //   subject: `Document: ${document.title}`,
    //   body: `Please find attached your document: ${document.title}`,
    //   attachments: [{ filename: `${document.title}.${format}`, url: fileUrl }]
    // });
  }

  /**
   * Convert HTML content to plain text
   */
  static htmlToPlainText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Prepare document content for export
   */
  static prepareContentForExport(content: string, format: 'pdf' | 'docx' | 'txt'): string {
    if (format === 'txt') {
      return this.htmlToPlainText(content);
    }

    // For PDF and DOCX, we keep the HTML structure
    // In production, this would be processed by the respective libraries
    return content;
  }
}
