'use client';

import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { DocumentTemplate } from '@/lib/hooks/useDocumentGeneration';

interface TemplateCardProps {
  template: DocumentTemplate;
  onSelect: (template: DocumentTemplate) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-white/30"
      onClick={() => onSelect(template)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Icon and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            {template.category}
          </span>
        </div>

        {/* Template Name */}
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {template.isCustom && (
              <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300">
                Custom
              </span>
            )}
            <span>{template.fields.length} fields</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}
