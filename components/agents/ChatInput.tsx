'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showQuickActions?: boolean;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type your message...',
  maxLength = 2000,
  showQuickActions = true,
  quickActions = []
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle typing indicator
  const handleTyping = () => {
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      handleTyping();
    }
  };

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      if (onTyping) onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const defaultQuickActions: QuickAction[] = [
    {
      id: 'summarize',
      label: 'Summarize',
      icon: '📝',
      action: () => setMessage('Can you summarize ')
    },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: '🔍',
      action: () => setMessage('Can you analyze ')
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      icon: '💡',
      action: () => setMessage('Help me brainstorm ideas for ')
    },
    {
      id: 'plan',
      label: 'Create Plan',
      icon: '📋',
      action: () => setMessage('Create a plan for ')
    }
  ];

  const actions = quickActions.length > 0 ? quickActions : defaultQuickActions;

  return (
    <div className="border-t border-white/10 bg-black/20 backdrop-blur-md">
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-3 pb-2 border-b border-white/10"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20"
                >
                  <span className="text-sm text-white/80 truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-white/60 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <AnimatePresence>
        {showActions && showQuickActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-3 pb-2 border-b border-white/10"
          >
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="text-xs"
                >
                  <span className="mr-1">{action.icon}</span>
                  {action.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Action Buttons */}
          <div className="flex gap-1">
            {/* File Attachment */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'text-white/60 hover:text-white hover:bg-white/10',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              title="Attach file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Quick Actions Toggle */}
            {showQuickActions && (
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={disabled}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-white/60 hover:text-white hover:bg-white/10',
                  showActions && 'bg-white/10 text-white',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                title="Quick actions"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              rows={1}
              className={cn(
                'w-full px-4 py-2 rounded-lg resize-none',
                'backdrop-blur-md bg-white/10 border border-white/20',
                'text-white placeholder:text-white/50',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                'transition-all duration-200',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />
            
            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
              <div className={cn(
                'absolute bottom-2 right-2 text-xs',
                message.length >= maxLength ? 'text-red-400' : 'text-white/50'
              )}>
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            variant="gradient"
            className="px-4 py-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-white/50">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};
