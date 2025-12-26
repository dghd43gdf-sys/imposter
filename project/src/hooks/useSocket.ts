import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to server
    const serverUrl = import.meta.env.PROD 
      ? window.location.origin 
      : 'http://localhost:3001';
    
    socketRef.current = io(serverUrl);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};