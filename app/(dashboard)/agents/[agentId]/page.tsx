'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { AgentAvatar } from '@/components/agents/AgentAvatar';
import { MessageList } from '@/components/agents/MessageList';
import { ChatInput } from '@/components/agents/ChatInput';
import { ConnectionStatus } from '@/components/agents/ConnectionStatus';
import { ConversationHistory, ConversationItem } from '@/components/agents/ConversationHistory';
import { getAgentById } from '@/lib/constants/agents';
import { useConversationSocket } from '@/lib/hooks/useSocket';
import type { Message } from '@/components/agents/MessageBubble';

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const agent = getAgentById(agentId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { socket, isConnected } = useConversationSocket(conversationId);

  // Redirect if agent not found
  useEffect(() => {
    if (!agent) {
      router.push('/agents');
    }
  }, [agent, router]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [agentId]);

  // Listen for socket messages
  useEffect(() => {
    if (!socket) return;

    socket.on('message', (data) => {
      if (data.conversationId === conversationId) {
        const newMessage: Message = {
          id: data.message.id,
          role: data.message.role,
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
          agentId: data.message.agentId
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
      }
    });

    socket.on('typing', (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('message');
      socket.off('typing');
    };
  }, [socket, conversationId]);

  const loadConversations = async () => {
    try {
      // Mock user ID - in production, get from auth context
      const userId = 'mock-user-id';
      const response = await fetch(`/api/conversations?userId=${userId}&agentId=${agentId}`);
      const data = await response.json();
      
      if (data.success) {
        const formattedConversations: ConversationItem[] = data.conversations.map((conv: any) => ({
          id: conv.id,
          agentId: conv.agentId,
          agentName: agent?.name || conv.agentId,
          title: conv.title,
          lastMessage: getLastMessagePreview(conv.messages),
          lastMessageAt: new Date(conv.lastMessageAt)
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const getLastMessagePreview = (messages: any[]): string => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? '...' : '');
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Mock user ID - in production, get from auth context
      const userId = 'mock-user-id';
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          agentId,
          content,
          userId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update conversation ID if new
        if (!conversationId) {
          setConversationId(data.conversationId);
        }

        // Update message status
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, id: data.message.id, status: 'sent' } : msg
        ));

        // Show typing indicator
        setIsTyping(true);

        // Simulate agent response (in production, this comes via WebSocket)
        setTimeout(() => {
          const agentMessage: Message = {
            id: data.agentMessage.id,
            role: 'agent',
            content: data.agentMessage.content,
            timestamp: new Date(data.agentMessage.timestamp),
            agentId: data.agentMessage.agentId,
            metadata: data.agentMessage.metadata
          };
          setMessages(prev => [...prev, agentMessage]);
          setIsTyping(false);
          loadConversations();
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  const handleSelectConversation = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}`);
      const data = await response.json();
      
      if (data.success) {
        setConversationId(convId);
        const formattedMessages: Message[] = (data.conversation.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          agentId: msg.agentId,
          metadata: msg.metadata
        }));
        setMessages(formattedMessages);
        setIsHistoryOpen(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setIsHistoryOpen(false);
  };

  if (!agent) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Conversation History Sidebar */}
      <ConversationHistory
        conversations={conversations}
        currentConversationId={conversationId || undefined}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <GlassmorphicCard className="m-4 mb-0 p-4" animated={false}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AgentAvatar agentId={agentId} size="lg" showStatus status="online" />
              <div>
                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                <p className="text-white/70">{agent.role}</p>
                <p className="text-sm text-white/60 italic mt-1">"{agent.personality}"</p>
              </div>
            </div>
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </GlassmorphicCard>

        {/* Messages */}
        <GlassmorphicCard className="m-4 flex-1 flex flex-col overflow-hidden" animated={false}>
          <MessageList
            messages={messages}
            isTyping={isTyping}
            agentId={agentId}
            agentName={agent.name}
          />
          <ChatInput
            onSend={handleSendMessage}
            placeholder={`Ask ${agent.name} anything...`}
            showQuickActions={true}
          />
        </GlassmorphicCard>
      </div>
    </div>
  );
}
