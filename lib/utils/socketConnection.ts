// utils/socketConnection.ts (or wherever you handle socket connection)
import { io, Socket } from 'socket.io-client';
import { useEditorSocketStore } from '@/lib/store/editorSocketStore';

let socket: Socket | null = null;

export const connectToEditor = (projectId: string) => {
  // Disconnect existing socket if any
  if (socket?.connected) {
    socket.disconnect();
  }

  // Create new socket connection with projectId in query params
  socket = io('http://localhost:3001', {
    query: {
      projectId: projectId,
    },
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    timeout: 20000,
    forceNew: true, // Force a new connection
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully with ID:', socket?.id);
    console.log('🏠 Project ID:', projectId);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection failed:', error.message);
    console.error('Full error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection failed:', error);
  });

  // Set the socket in your store
  useEditorSocketStore.getState().setEditorSocket(socket);

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    useEditorSocketStore.getState().disconnect();
  }
};

export const getSocket = () => socket;