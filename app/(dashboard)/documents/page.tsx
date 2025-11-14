'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { DocumentTemplate } from '@/lib/hooks/useDocumentGeneration';
import { TemplateLibrary } from '@/components/documents/TemplateLibrary';
import { DocumentCustomizationForm } from '@/components/documents/DocumentCustomizationForm';
import { Button } from '@/components/ui/Button';

export default function DocumentsPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [view, setView] = useState<'library' | 'customize'>('library');

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setView('customize');
  };

  const handleBack = () => {
    setView('library');
    setSelectedTemplate(null);
  };

  const handleSuccess = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {view === 'library' ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Document Generation
                  </h1>
                  <p className="text-gray-400">
                    Create professional legal and business documents with AI assistance
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/documents/my-documents')}
                  variant="secondary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Documents
                </Button>
              </div>

              {/* Info Banner */}
              <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Professional Document Templates
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Choose from our library of professionally crafted templates for NDAs, contracts, 
                      proposals, and more. Customize them to your specific needs and generate 
                      ready-to-use documents in minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Library */}
            <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
          </>
        ) : (
          selectedTemplate && (
            <DocumentCustomizationForm
              template={selectedTemplate}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )
        )}
      </div>
    </div>
  );
}
