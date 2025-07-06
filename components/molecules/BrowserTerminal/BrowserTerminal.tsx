'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import {AttachAddon} from '@xterm/addon-attach';
import '@xterm/xterm/css/xterm.css';
import { useTreeStructureStore } from '@/lib/store/treeStructureStore';
import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
export const BrowserTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socket = useRef<WebSocket | null>(null);
  const projectId = useTreeStructureStore((state) => state.projectId);
const emitSocketEvent = useEditorSocketStore((state) => state.emitSocketEvent);

  useEffect(() => {
    const terminal = new Terminal({
      fontSize: 14,
      cursorBlink: true,
      theme: {
        background: '#1E1E1E',
        foreground: '#CCCCCC',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    if (terminalRef.current) {
      terminal.open(terminalRef.current);

      setTimeout(() => {
        try {
          fitAddon.fit();
        } catch (e) {
          console.error('FitAddon error:', e);
        }
      }, 0);
    }

    const ws = new WebSocket(`ws://localhost:3002/terminal/?projectId=${projectId}`);
    socket.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      emitSocketEvent('getPort', { projectId });
      const attachAddon = new AttachAddon(ws);
      terminal.loadAddon(attachAddon);
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
    };

    return () => {
      terminal.dispose();

      // ✅ Close only if it's connecting or open
      if (ws.readyState === 0 || ws.readyState === 1) {
        ws.close();
      }
    };
  }, [projectId, emitSocketEvent]);

  return <div ref={terminalRef} className="w-full h-[500px] bg-[#1E1E1E] rounded-lg" />;
};