'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportButtonProps {
  data: any;
  filename: string;
  formats?: ('json' | 'csv' | 'pdf')[];
}

export function ExportButton({
  data,
  filename,
  formats = ['json', 'csv'],
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const exportAsJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
  };

  const exportAsCSV = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('No data available to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    downloadBlob(blob, `${filename}.csv`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'json':
        exportAsJSON();
        break;
      case 'csv':
        exportAsCSV();
        break;
      case 'pdf':
        alert('PDF export coming soon!');
        setShowMenu(false);
        break;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        📥 Export
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              {formats.map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Export as {format.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
