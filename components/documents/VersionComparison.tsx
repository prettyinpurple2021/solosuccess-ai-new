'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Clock, ChevronDown } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  changes: string | null;
  createdBy: string;
  createdAt: Date;
}

interface VersionComparisonProps {
  versions: DocumentVersion[];
  currentVersion: number;
}

export function VersionComparison({ versions, currentVersion }: VersionComparisonProps) {
  const [selectedVersion1, setSelectedVersion1] = useState(currentVersion.toString());
  const [selectedVersion2, setSelectedVersion2] = useState(
    versions.length > 1 ? (currentVersion - 1).toString() : currentVersion.toString()
  );
  const [showComparison, setShowComparison] = useState(false);

  const version1 = versions.find(v => v.version === parseInt(selectedVersion1));
  const version2 = versions.find(v => v.version === parseInt(selectedVersion2));

  // Simple diff highlighting (in production, use a proper diff library)
  const highlightDifferences = (text1: string, text2: string) => {
    // This is a simplified version - in production use a library like diff-match-patch
    return {
      text1Highlighted: text1,
      text2Highlighted: text2
    };
  };

  const { text1Highlighted, text2Highlighted } = version1 && version2
    ? highlightDifferences(version1.content, version2.content)
    : { text1Highlighted: '', text2Highlighted: '' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Version History</h3>
        </div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
        >
          <span className="text-sm">Compare Versions</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Version List */}
      <div className="space-y-2">
        {versions.map((version, index) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`backdrop-blur-xl border rounded-xl p-4 transition-all ${
              version.version === currentVersion
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">Version {version.version}</h4>
                    {version.version === currentVersion && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                        Current
                      </span>
                    )}
                  </div>
                  {version.changes && (
                    <p className="text-sm text-gray-400 mb-2">{version.changes}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison View */}
      {showComparison && versions.length > 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6"
        >
          {/* Version Selectors */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Version 1
              </label>
              <Select
                value={selectedVersion1}
                onChange={(e) => setSelectedVersion1(e.target.value)}
              >
                {versions.map(v => (
                  <option key={v.id} value={v.version}>
                    Version {v.version} - {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Version 2
              </label>
              <Select
                value={selectedVersion2}
                onChange={(e) => setSelectedVersion2(e.target.value)}
              >
                {versions.map(v => (
                  <option key={v.id} value={v.version}>
                    Version {v.version} - {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          {version1 && version2 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                  Version {version1.version}
                </h4>
                <div
                  className="p-4 rounded-xl bg-black/20 border border-white/10 max-h-[400px] overflow-y-auto text-sm text-white"
                  dangerouslySetInnerHTML={{ __html: text1Highlighted }}
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                  Version {version2.version}
                </h4>
                <div
                  className="p-4 rounded-xl bg-black/20 border border-white/10 max-h-[400px] overflow-y-auto text-sm text-white"
                  dangerouslySetInnerHTML={{ __html: text2Highlighted }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
