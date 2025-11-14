import { prisma } from '@/lib/prisma';

export interface CreateDocumentParams {
  userId: string;
  templateId: string;
  title: string;
  customizations: Record<string, any>;
  jurisdiction?: string;
  businessType?: string;
}

export interface UpdateDocumentParams {
  content?: string;
  customizations?: Record<string, any>;
  status?: string;
}

export class DocumentGenerationService {
  /**
   * Get all document templates
   */
  static async getTemplates(filters?: {
    category?: string;
    documentType?: string;
    jurisdiction?: string;
    businessType?: string;
  }) {
    const where: any = { isActive: true };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.documentType) {
      where.documentType = filters.documentType;
    }

    if (filters?.jurisdiction) {
      where.jurisdictions = {
        has: filters.jurisdiction
      };
    }

    if (filters?.businessType) {
      where.OR = [
        { businessTypes: { has: filters.businessType } },
        { businessTypes: { has: 'all' } }
      ];
    }

    return prisma.documentTemplate.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get a single template by ID
   */
  static async getTemplateById(templateId: string) {
    return prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });
  }

  /**
   * Create a custom template
   */
  static async createCustomTemplate(
    userId: string,
    data: {
      name: string;
      description?: string;
      category: string;
      documentType: string;
      content: string;
      fields: any;
      jurisdictions?: string[];
      businessTypes?: string[];
    }
  ) {
    return prisma.documentTemplate.create({
      data: {
        ...data,
        isCustom: true,
        createdBy: userId,
        isActive: true
      }
    });
  }

  /**
   * Generate a document from a template
   */
  static async generateDocument(params: CreateDocumentParams) {
    const template = await this.getTemplateById(params.templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Replace template variables with customizations
    let content = template.content;
    Object.entries(params.customizations).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value || ''));
    });

    // Create the document
    const document = await prisma.generatedDocument.create({
      data: {
        userId: params.userId,
        templateId: params.templateId,
        title: params.title,
        content,
        customizations: params.customizations,
        jurisdiction: params.jurisdiction,
        businessType: params.businessType,
        status: 'draft',
        version: 1
      },
      include: {
        template: true
      }
    });

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content,
        createdBy: params.userId,
        changes: 'Initial version'
      }
    });

    return document;
  }

  /**
   * Get user's documents
   */
  static async getUserDocuments(
    userId: string,
    filters?: {
      status?: string;
      templateId?: string;
    }
  ) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.templateId) {
      where.templateId = filters.templateId;
    }

    return prisma.generatedDocument.findMany({
      where,
      include: {
        template: {
          select: {
            name: true,
            category: true,
            documentType: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Get a single document
   */
  static async getDocument(documentId: string, userId: string) {
    return prisma.generatedDocument.findFirst({
      where: {
        id: documentId,
        userId
      },
      include: {
        template: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 10
        },
        comments: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  /**
   * Update a document
   */
  static async updateDocument(
    documentId: string,
    userId: string,
    params: UpdateDocumentParams
  ) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const updates: any = {};

    if (params.content !== undefined) {
      updates.content = params.content;
      updates.version = document.version + 1;

      // Create new version
      await prisma.documentVersion.create({
        data: {
          documentId,
          version: document.version + 1,
          content: params.content,
          createdBy: userId,
          changes: 'Manual edit'
        }
      });
    }

    if (params.customizations !== undefined) {
      updates.customizations = params.customizations;
    }

    if (params.status !== undefined) {
      updates.status = params.status;
    }

    return prisma.generatedDocument.update({
      where: { id: documentId },
      data: updates,
      include: {
        template: true
      }
    });
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string, userId: string) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return prisma.generatedDocument.delete({
      where: { id: documentId }
    });
  }

  /**
   * Accept disclaimer for a document
   */
  static async acceptDisclaimer(documentId: string, userId: string) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return prisma.generatedDocument.update({
      where: { id: documentId },
      data: {
        disclaimerAccepted: true,
        disclaimerAcceptedAt: new Date()
      }
    });
  }

  /**
   * Add a comment to a document
   */
  static async addComment(
    documentId: string,
    userId: string,
    content: string,
    position?: any
  ) {
    return prisma.documentComment.create({
      data: {
        documentId,
        userId,
        content,
        position
      }
    });
  }

  /**
   * Resolve a comment
   */
  static async resolveComment(commentId: string, userId: string) {
    return prisma.documentComment.update({
      where: { id: commentId },
      data: { resolved: true }
    });
  }

  /**
   * Get document versions
   */
  static async getDocumentVersions(documentId: string, userId: string) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' }
    });
  }

  /**
   * Compare two document versions
   */
  static async compareVersions(
    documentId: string,
    userId: string,
    version1: number,
    version2: number
  ) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId,
        version: {
          in: [version1, version2]
        }
      },
      orderBy: { version: 'asc' }
    });

    if (versions.length !== 2) {
      throw new Error('Versions not found');
    }

    return {
      version1: versions[0],
      version2: versions[1]
    };
  }

  /**
   * Generate share token for a document
   */
  static async generateShareToken(
    documentId: string,
    userId: string,
    expiresInDays: number = 7
  ) {
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, userId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const shareToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.generatedDocument.update({
      where: { id: documentId },
      data: {
        shareToken,
        shareExpiresAt: expiresAt
      }
    });
  }

  /**
   * Get document by share token
   */
  static async getDocumentByShareToken(shareToken: string) {
    const document = await prisma.generatedDocument.findUnique({
      where: { shareToken },
      include: {
        template: true
      }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.shareExpiresAt && document.shareExpiresAt < new Date()) {
      throw new Error('Share link has expired');
    }

    return document;
  }
}
