'use client';

import { motion } from 'framer-motion';
import { Eye, AlertTriangle } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface BlindSpotCardProps {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedBiases: string[];
  impactAreas: string[];
}

export const BlindSpotCard: React.FC<BlindSpotCardProps> = ({
  category,
  description,
  severity,
  relatedBiases,
  impactAreas,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassmorphicCard className="p-6 h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Eye className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">{category}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor()}`}>
              {severity.toUpperCase()} RISK
            </span>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4">
          {description}
        </p>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Related Biases
            </h4>
            <div className="flex flex-wrap gap-2">
              {relatedBiases.map((bias) => (
                <span
                  key={bias}
                  className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs"
                >
                  {bias.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Impact Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {impactAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};
