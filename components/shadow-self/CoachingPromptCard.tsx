'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface CoachingPromptCardProps {
  prompt: {
    id: string;
    promptType: string;
    title: string;
    content: string;
    targetBias: string | null;
    deliveredAt: string | null;
    completedAt: string | null;
  };
  onComplete: (promptId: string, response: string) => void;
}

export const CoachingPromptCard: React.FC<CoachingPromptCardProps> = ({
  prompt,
  onComplete,
}) => {
  const [response, setResponse] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(prompt.id, response);
      setResponse('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPromptTypeColor = () => {
    switch (prompt.promptType) {
      case 'reflection':
        return 'from-purple-500 to-pink-500';
      case 'exercise':
        return 'from-blue-500 to-teal-500';
      case 'awareness':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPromptTypeIcon = () => {
    switch (prompt.promptType) {
      case 'reflection':
        return <MessageCircle className="w-5 h-5" />;
      case 'exercise':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'awareness':
        return <Clock className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const isCompleted = !!prompt.completedAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <GlassmorphicCard className={`p-6 ${isCompleted ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getPromptTypeColor()} flex items-center justify-center`}>
            {getPromptTypeIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded-full bg-white/10 capitalize">
                {prompt.promptType}
              </span>
              {prompt.targetBias && (
                <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  {prompt.targetBias.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4">
          {prompt.content}
        </p>

        {!isCompleted && (
          <div className="space-y-4">
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Share your thoughts and reflections..."
                  rows={6}
                  className="w-full"
                />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!response.trim() || isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsExpanded(false);
                      setResponse('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsExpanded(true)}
                className="w-full"
              >
                Respond to Prompt
              </Button>
            )}
          </div>
        )}
      </GlassmorphicCard>
    </motion.div>
  );
};
