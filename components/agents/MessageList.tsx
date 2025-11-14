'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble, Message } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  agentId?: string;
  agentName?: string;
  autoScroll?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  agentId,
  agentName,
  autoScroll = true
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, autoScroll]);

  // Check if user is near bottom for auto-scroll behavior
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Could update autoScroll state based on user scroll position
    // For now, we keep it simple
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-2"
      onScroll={handleScroll}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-white/60">
              Send a message to begin chatting with your AI agent
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={true}
            />
          ))}
          
          <AnimatePresence>
            {isTyping && agentId && agentName && (
              <TypingIndicator agentId={agentId} agentName={agentName} />
            )}
          </AnimatePresence>
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
