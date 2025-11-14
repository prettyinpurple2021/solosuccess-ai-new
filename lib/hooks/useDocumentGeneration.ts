import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  documentType: string;
  content: string;
  fields: any;
  jurisdictions: string[];
  businessTypes: string[];
  isCustom: boolean;
  previewUrl: string | null;
}

export interface GeneratedDocument {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  content: string;
  customizations: any;
  jurisdiction: string | null;
  businessType: string | null;
  status: string;
  version: number;
  disclaimerAccepted: boolean;
  disclaimerAcceptedAt: Date | null;
  pdfUrl: string | null;
  docxUrl: string | null;
  shareToken: string | null;
  shareExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  template?: {
    name: string;
    category: string;
    documentType: string;
  };
  versions?: Array<{
    id: string;
    version: number;
    content: string;
    changes: string | null;
    createdBy: string;
    createdAt: Date;
  }>;
  comments?: Array<{
    id: string;
    userId: string;
    content: string;
    position: any;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// Get all templates
export function useDocumentTemplates(filters?: {
  category?: string;
  documentType?: string;
  jurisdiction?: string;
  businessType?: string;
}) {
  return useQuery({
    queryKey: ['document-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.documentType) params.append('documentType', filters.documentType);
      if (filters?.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
      if (filters?.businessType) params.append('businessType', filters.businessType);

      const response = await fetch(`/api/documents/templates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as Promise<DocumentTemplate[]>;
    }
  });
}

// Get single template
export function useDocumentTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['document-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await fetch(`/api/documents/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json() as Promise<DocumentTemplate>;
    },
    enabled: !!templateId
  });
}

// Generate document from template
export function useGenerateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      templateId: string;
      title: string;
      customizations: Record<string, any>;
      jurisdiction?: string;
      businessType?: string;
    }) => {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate document');
      }

      return response.json() as Promise<GeneratedDocument>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
    }
  });
}

// Get user's documents
export function useUserDocuments(filters?: {
  status?: string;
  templateId?: string;
}) {
  return useQuery({
    queryKey: ['user-documents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.templateId) params.append('templateId', filters.templateId);

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json() as Promise<GeneratedDocument[]>;
    }
  });
}

// Get single document
export function useDocument(documentId: string | null) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json() as Promise<GeneratedDocument>;
    },
    enabled: !!documentId
  });
}

// Update document
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      data
    }: {
      documentId: string;
      data: {
        content?: string;
        customizations?: Record<string, any>;
        status?: string;
      };
    }) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      return response.json() as Promise<GeneratedDocument>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
    }
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
    }
  });
}

// Accept disclaimer
export function useAcceptDisclaimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/disclaimer`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept disclaimer');
      }

      return response.json();
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    }
  });
}

// Export document
export function useExportDocument() {
  return useMutation({
    mutationFn: async ({
      documentId,
      format
    }: {
      documentId: string;
      format: 'pdf' | 'docx';
    }) => {
      const response = await fetch(`/api/documents/${documentId}/export?format=${format}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export document');
      }

      return response.json() as Promise<{ url: string }>;
    }
  });
}

// Share document
export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      expiresInDays
    }: {
      documentId: string;
      expiresInDays?: number;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share document');
      }

      return response.json() as Promise<{ shareToken: string; shareUrl: string }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
    }
  });
}

// Add comment
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      content,
      position
    }: {
      documentId: string;
      content: string;
      position?: any;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, position })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
    }
  });
}
