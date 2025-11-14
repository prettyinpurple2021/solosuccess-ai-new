'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { AssessmentProgress } from './AssessmentProgress';
import { AssessmentQuestion } from './AssessmentQuestion';
import { SHADOW_SELF_QUESTIONS } from '@/lib/data/shadow-self-questions';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface AssessmentFormProps {
  assessmentId?: string;
  onComplete: (responses: Record<string, string>) => void;
  initialResponses?: Record<string, string>;
  initialStep?: number;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessmentId,
  onComplete,
  initialResponses = {},
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [responses, setResponses] = useState<Record<string, string>>(initialResponses);
  const [shuffledQuestions] = useState(() => {
    // Randomize question order but keep it consistent for this session
    const questions = [...SHADOW_SELF_QUESTIONS];
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
  });

  const currentQuestion = shuffledQuestions[currentStep];
  const totalSteps = shuffledQuestions.length;
  const isLastQuestion = currentStep === totalSteps - 1;
  const canGoNext = responses[currentQuestion?.id];
  const canGoBack = currentStep > 0;

  const handleSelect = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion && canGoNext) {
      onComplete(responses);
    } else if (canGoNext) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Auto-save progress (in real implementation, this would call an API)
  useEffect(() => {
    if (assessmentId && Object.keys(responses).length > 0) {
      // Debounced auto-save would go here
      console.log('Auto-saving progress...', { assessmentId, currentStep, responses });
    }
  }, [responses, currentStep, assessmentId]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <GlassmorphicCard className="p-8">
        <AssessmentProgress currentStep={currentStep + 1} totalSteps={totalSteps} />
      </GlassmorphicCard>

      <GlassmorphicCard className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          <AssessmentQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            selectedValue={responses[currentQuestion.id] || null}
            onSelect={handleSelect}
          />
        </AnimatePresence>
      </GlassmorphicCard>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={!canGoBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex-1" />

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLastQuestion ? (
            <>
              Complete Assessment
              <Sparkles className="w-4 h-4" />
            </>
          ) : (
            <>
              Next Question
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Encouraging message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-400"
      >
        <p>
          Answer honestly for the most accurate insights. There are no right or wrong answers.
        </p>
      </motion.div>
    </div>
  );
};
