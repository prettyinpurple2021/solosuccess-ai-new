'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-purple-400 font-semibold">{Math.round(progress)}%</span>
      </div>

      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span>{currentStep - 1} questions completed</span>
      </div>
    </div>
  );
};
