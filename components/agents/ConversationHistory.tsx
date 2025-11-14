'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AgentAvatar } from './AgentAvatar';
import { formatDistanceToNow } from 'date-fns';

export interface ConversationItem {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount?: number;
}

interface ConversationHistoryProps {
  conversations: ConversationItem[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'fixed lg:relative inset-y-0 left-0 z-40',
              'w-80 lg:w-96',
              'flex flex-col'
            )}
          >
            <GlassmorphicPanel className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Conversations</h2>
                  <button
                    onClick={onToggle}
                    className="lg:hidden p-1 rounded text-white/70 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* New Conversation Button */}
                <Button
                  variant="gradient"
                  className="w-full mb-4"
                  onClick={onNewConversation}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Conversation
                </Button>

                {/* Search */}
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  inputSize="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <motion.button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation.id)}
                        className={cn(
                          'w-full p-3 rounded-lg text-left',
                          'backdrop-blur-md border transition-all',
                          'hover:bg-white/10',
                          currentConversationId === conversation.id
                            ? 'bg-white/15 border-white/30'
                            : 'bg-white/5 border-white/10'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <AgentAvatar agentId={conversation.agentId} size="sm" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {conversation.title}
                              </h3>
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-white/60 mb-1">
                              {conversation.agentName}
                            </p>
                            
                            <p className="text-xs text-white/70 truncate">
                              {conversation.lastMessage}
                            </p>
                            
                            <p className="text-xs text-white/50 mt-1">
                              {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </GlassmorphicPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};
