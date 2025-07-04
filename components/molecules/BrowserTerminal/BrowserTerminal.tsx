// Client Code (BrowserTerminal.tsx)
import {Terminal} from "@xterm/xterm";
import {FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";

export const BrowserTerminal = ()=>{
    const projectId = useTreeStructureStore((state) => state.projectId);
    const terminalRef = useRef<HTMLDivElement>(null);
    const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const termRef = useRef<Terminal | null>(null);
    
    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#1E1E1E',
                foreground: '#CCCCCC',
                cursor: '#FFFFFF',
                cursorAccent: '#000000',
                selection: '#3A3D41',
                black: '#000000',
                red: '#F14C4C',
                green: '#23D18B',
                yellow: '#F5F543',
                blue: '#3B8EEA',
                magenta: '#D670D6',
                cyan: '#29B8DB',
                white: '#E5E5E5',
                brightBlack: '#666666',
                brightRed: '#F14C4C',
                brightGreen: '#23D18B',
                brightYellow: '#F5F543',
                brightBlue: '#3B8EEA',
                brightMagenta: '#D670D6',
                brightCyan: '#29B8DB',
                brightWhite: '#E5E5E5'
            },
            convertEol: true,
            scrollback: 1000,
            allowTransparency: false,
        });
        
        termRef.current = term;
        
        if (terminalRef.current) {
            term.open(terminalRef.current);
        }
        
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        // Fit the terminal to container after mounting
        setTimeout(() => {
            fitAddon.fit();
        }, 100);
        
        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
        };
        
        window.addEventListener('resize', handleResize);
        
        // Setup socket connection
        socket.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/terminal`,{
            transports: ['websocket'],
            query: {
                projectId: projectId
            }
        });
        
        // Listen for output from server
        socket.current.on('shell-output', (data) => {
            console.log('Received output:', data);
            term.write(data);
        });
        
        // Handle user input
        term.onData((data) => {
            console.log('User input:', data);
            socket.current?.emit('shell-input', {
                data: data,
            });
        });
        
        // Handle connection events
        socket.current.on('connect', () => {
            console.log('Connected to terminal server');
        });
        
        socket.current.on('disconnect', () => {
            console.log('Disconnected from terminal server');
        });

        // Clean up on unmount
        return () => {
            term.dispose();
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            window.removeEventListener('resize', handleResize);
            termRef.current = null;
        };

    }, [projectId]);

    return (
        <div 
            ref={terminalRef} 
            className="w-full h-[500px] bg-[#1E1E1E] rounded-lg overflow-hidden"
            style={{
                // Hide scrollbars but keep functionality
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        />
    );
}