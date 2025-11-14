'use client';

import { motion } from 'framer-motion';
import { AssessmentQuestion as QuestionType } from '@/lib/data/shadow-self-questions';
import { cn } from '@/lib/utils';

interface AssessmentQuestionProps {
  question: QuestionType;
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  selectedValue,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
          {question.category}
        </div>
        <h3 className="text-2xl font-semibold text-white leading-relaxed">
          {question.question}
        </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedValue === option.value;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => onSelect(option.value)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full p-5 rounded-xl text-left transition-all duration-300',
                'backdrop-blur-xl border',
                'hover:shadow-lg hover:shadow-purple-500/20',
                isSelected
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/30'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 mt-0.5',
                    isSelected
                      ? 'border-purple-400 bg-purple-500'
                      : 'border-gray-500'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full rounded-full bg-white flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </motion.div>
                  )}
                </div>
                <span className="text-gray-200 leading-relaxed flex-1">
                  {option.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
