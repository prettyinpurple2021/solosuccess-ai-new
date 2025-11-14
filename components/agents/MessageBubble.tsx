'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { AgentAvatar } from './AgentAvatar';
import { format } from 'date-fns';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true
}) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isUser && message.agentId && (
        <AgentAvatar agentId={message.agentId} size="sm" />
      )}
      {showAvatar && isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
          U
        </div>
      )}

      {/* Message Content */}
      <div className={cn('flex-1 max-w-[70%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
              : 'backdrop-blur-md bg-white/10 border border-white/20 text-white'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Metadata for agent messages */}
          {!isUser && message.metadata && (
            <div className="mt-3 pt-3 border-t border-white/10">
              {message.metadata.confidence && (
                <div className="text-xs text-white/60 mb-2">
                  Confidence: {Math.round(message.metadata.confidence * 100)}%
                </div>
              )}
              {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Suggestions:</div>
                  {message.metadata.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="text-xs text-white/80 bg-white/5 rounded px-2 py-1"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div className={cn('flex items-center gap-2 mt-1 px-2', isUser && 'flex-row-reverse')}>
          <span className="text-xs text-white/50">
            {format(message.timestamp, 'h:mm a')}
          </span>
          {isUser && message.status && (
            <span className="text-xs">
              {message.status === 'sending' && (
                <span className="text-white/50">Sending...</span>
              )}
              {message.status === 'sent' && (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {message.status === 'error' && (
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
