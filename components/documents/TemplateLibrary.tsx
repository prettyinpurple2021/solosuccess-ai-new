'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useDocumentTemplates, DocumentTemplate } from '@/lib/hooks/useDocumentGeneration';
import { TemplateCard } from './TemplateCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { documentCategories, jurisdictions, businessTypes } from '@/lib/data/document-templates';

interface TemplateLibraryProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');

  const { data: templates, isLoading } = useDocumentTemplates({
    category: selectedCategory || undefined,
    jurisdiction: selectedJurisdiction || undefined,
    businessType: selectedBusinessType || undefined
  });

  // Filter templates by search query
  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group templates by category
  const groupedTemplates = filteredTemplates?.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DocumentTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {documentCategories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>

          {/* Jurisdiction Filter */}
          <Select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
          >
            <option value="">All Jurisdictions</option>
            {jurisdictions.map(jur => (
              <option key={jur.value} value={jur.value}>
                {jur.label}
              </option>
            ))}
          </Select>

          {/* Business Type Filter */}
          <Select
            value={selectedBusinessType}
            onChange={(e) => setSelectedBusinessType(e.target.value)}
          >
            <option value="">All Business Types</option>
            {businessTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedJurisdiction || selectedBusinessType) && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Active filters:</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                {documentCategories.find(c => c.value === selectedCategory)?.label} ×
              </button>
            )}
            {selectedJurisdiction && (
              <button
                onClick={() => setSelectedJurisdiction('')}
                className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                {jurisdictions.find(j => j.value === selectedJurisdiction)?.label} ×
              </button>
            )}
            {selectedBusinessType && (
              <button
                onClick={() => setSelectedBusinessType('')}
                className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                {businessTypes.find(b => b.value === selectedBusinessType)?.label} ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-12 w-12 bg-white/10 rounded-xl mb-4" />
              <div className="h-6 bg-white/10 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded mb-4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : groupedTemplates && Object.keys(groupedTemplates).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={onSelectTemplate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
