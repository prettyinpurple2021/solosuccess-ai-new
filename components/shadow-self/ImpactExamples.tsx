'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface ImpactExample {
  biasType: string;
  severity: string;
  examples: string[];
}

interface ImpactExamplesProps {
  impactExamples: ImpactExample[];
}

export const ImpactExamples: React.FC<ImpactExamplesProps> = ({ impactExamples }) => {
  return (
    <div className="space-y-6">
      {impactExamples.map((impact, index) => (
        <motion.div
          key={impact.biasType}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassmorphicCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white capitalize">
                {impact.biasType.replace(/_/g, ' ')} - Real-World Impact
              </h3>
            </div>

            <div className="space-y-3">
              {impact.examples.map((example, exIndex) => (
                <motion.div
                  key={exIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + exIndex * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">
                    {example}
                  </p>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      ))}
    </div>
  );
};
