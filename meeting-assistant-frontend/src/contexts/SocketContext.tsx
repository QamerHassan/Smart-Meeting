'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
  url?: string; // optional override
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, url }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use environment variable or fallback
    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    // Initialize Socket.IO client
    const socketInstance: Socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // Event handlers
    const handleConnect = () => {
      console.log(`✅ Connected to Socket.IO at ${socketUrl}`);
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log(`⚠️ Socket disconnected: ${reason}`);
      setIsConnected(false);
    };

    const handleConnectError = (err: any) => {
      console.error('❌ Socket connection error:', err);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.disconnect();
    };
  }, [url]);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
};

export default SocketContext;
