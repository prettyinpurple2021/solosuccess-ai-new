'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';

interface Clause {
  id: string;
  title: string;
  description: string;
  content: string;
  required: boolean;
  jurisdictions?: string[];
  businessTypes?: string[];
}

interface ClauseSelectorProps {
  clauses: Clause[];
  selectedClauses: string[];
  onChange: (selectedIds: string[]) => void;
  jurisdiction?: string;
  businessType?: string;
}

export function ClauseSelector({
  clauses,
  selectedClauses,
  onChange,
  jurisdiction,
  businessType
}: ClauseSelectorProps) {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  // Filter clauses based on jurisdiction and business type
  const filteredClauses = clauses.filter(clause => {
    if (clause.jurisdictions && clause.jurisdictions.length > 0) {
      if (jurisdiction && !clause.jurisdictions.includes(jurisdiction)) {
        return false;
      }
    }
    if (clause.businessTypes && clause.businessTypes.length > 0) {
      if (businessType && !clause.businessTypes.includes(businessType)) {
        return false;
      }
    }
    return true;
  });

  const toggleClause = (clauseId: string, required: boolean) => {
    if (required) return; // Can't toggle required clauses

    if (selectedClauses.includes(clauseId)) {
      onChange(selectedClauses.filter(id => id !== clauseId));
    } else {
      onChange([...selectedClauses, clauseId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Info className="w-4 h-4" />
        <span>Select optional clauses to include in your document</span>
      </div>

      <div className="space-y-3">
        {filteredClauses.map((clause, index) => {
          const isSelected = selectedClauses.includes(clause.id) || clause.required;
          const isExpanded = expandedClause === clause.id;

          return (
            <motion.div
              key={clause.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`backdrop-blur-xl border rounded-xl p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
              onClick={() => !clause.required && toggleClause(clause.id, clause.required)}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-500'
                  } ${clause.required ? 'opacity-50' : ''}`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{clause.title}</h4>
                    {clause.required && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{clause.description}</p>

                  {/* Expandable Content Preview */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-lg bg-black/20 border border-white/10"
                    >
                      <p className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {clause.content}
                      </p>
                    </motion.div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedClause(isExpanded ? null : clause.id);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                  >
                    {isExpanded ? 'Hide' : 'Show'} clause content
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
