
import { create } from 'zustand';

interface TerminalSocketState {
  terminalSocket: WebSocket | null;
  setTerminalSocket: (socket: WebSocket | null) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export const useTerminalSocketStore = create<TerminalSocketState>((set) => ({
  terminalSocket: null,
  setTerminalSocket: (socket) => set({ terminalSocket: socket }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}));