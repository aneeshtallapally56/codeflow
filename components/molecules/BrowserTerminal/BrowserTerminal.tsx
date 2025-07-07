'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { AttachAddon } from '@xterm/addon-attach';
import '@xterm/xterm/css/xterm.css';

import { useTreeStructureStore } from '@/lib/store/treeStructureStore';
import { useTerminalSocketStore } from '@/lib/store/terminalSocketStore';

export const BrowserTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);

  const projectId = useTreeStructureStore((state) => state.projectId);
  const { terminalSocket, isConnected } = useTerminalSocketStore();

  useEffect(() => {
    const term = new Terminal({
      fontSize: 14,
      cursorBlink: true,
      theme: {
        background: '#1E1E1E',
        foreground: '#CCCCCC',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    terminal.current = term;

    if (terminalRef.current) {
      term.open(terminalRef.current);

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch (e) {
          console.error('❌ FitAddon error:', e);
        }
      });
    }

    // Attach WebSocket if it's ready
    if (terminalSocket && isConnected && terminalSocket.readyState === WebSocket.OPEN) {
      console.log('✅ Attaching terminal to WebSocket');
      terminalSocket.binaryType = 'arraybuffer';

      const attachAddon = new AttachAddon(terminalSocket);
      term.loadAddon(attachAddon);

      term.writeln('');
  term.writeln('💡 To preview your app, run:');
  term.writeln('   npm run dev -- --host 0.0.0.0');
  term.writeln('');

    } else {
      console.warn('⚠️ Terminal socket not ready for attach');
    }

    return () => {
      term.dispose();
    };
  }, [projectId, terminalSocket, isConnected]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-[500px] bg-[#1E1E1E] rounded-lg overflow-hidden"
    />
  );
};