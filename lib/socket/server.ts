/**
 * Socket.io Server Configuration
 * 
 * This file sets up the Socket.io server for real-time messaging
 * Note: This needs to be integrated with a custom Next.js server or API route
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface ServerToClientEvents {
  message: (data: {
    conversationId: string;
    message: {
      id: string;
      role: 'user' | 'agent';
      content: string;
      timestamp: string;
      agentId?: string;
    };
  }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
  connected: () => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    agentId: string;
    content: string;
  }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  conversationId?: string;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initializeSocketServer(httpServer: HTTPServer): TypedServer {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/api/socket'
  });

  io.on('connection', (socket: TypedSocket) => {
    console.log('Client connected:', socket.id);

    // Send connected event
    socket.emit('connected');

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      socket.data.conversationId = conversationId;
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('typing', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
