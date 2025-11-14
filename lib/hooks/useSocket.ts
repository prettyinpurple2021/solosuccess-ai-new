'use client';

import { useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket/client';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket/server';

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Connect the socket
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    // Set up connection listeners
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Set initial connection state
    setIsConnected(socketInstance.connected);

    // Cleanup
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { socket, isConnected };
}

export function useConversationSocket(conversationId: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    // Join the conversation room
    socket.emit('join_conversation', conversationId);

    // Cleanup: leave the conversation room
    return () => {
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId, isConnected]);

  return { socket, isConnected };
}
