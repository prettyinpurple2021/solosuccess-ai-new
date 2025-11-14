'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, Trash2, FileText } from 'lucide-react';
import { useDocument, useUpdateDocument, useDeleteDocument } from '@/lib/hooks/useDocumentGeneration';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { DocumentComments } from '@/components/documents/DocumentComments';
import { VersionComparison } from '@/components/documents/VersionComparison';
import { Button } from '@/components/ui/Button';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const { data: document, isLoading } = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const [activeTab, setActiveTab] = useState<'editor' | 'comments' | 'versions'>('editor');
  const [content, setContent] = useState('');

  // Update local content when document loads
  useState(() => {
    if (document) {
      setContent(document.content);
    }
  });

  const handleSave = async () => {
    try {
      await updateDocument.mutateAsync({
        documentId,
        data: { content }
      });
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument.mutateAsync(documentId);
      router.push('/documents/my-documents');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    // Implementation would call the resolve comment API
    console.log('Resolve comment:', commentId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Document not found</h2>
          <p className="text-gray-400 mb-6">The document you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/documents')}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {document.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{document.template?.name}</span>
                <span>•</span>
                <span>Version {document.version}</span>
                <span>•</span>
                <span className="capitalize">{document.status}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'editor'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'comments'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Comments ({document.comments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'versions'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Versions ({document.versions?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'editor' && (
            <DocumentEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
              isSaving={updateDocument.isPending}
            />
          )}

          {activeTab === 'comments' && (
            <DocumentComments
              documentId={documentId}
              comments={document.comments || []}
              onResolve={handleResolveComment}
            />
          )}

          {activeTab === 'versions' && document.versions && (
            <VersionComparison
              versions={document.versions}
              currentVersion={document.version}
            />
          )}
        </div>
      </div>
    </div>
  );
}
