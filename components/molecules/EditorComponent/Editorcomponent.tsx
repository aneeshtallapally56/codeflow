'use client';
import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import EditorButton from '@/components/atoms/EditorButton';
import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';

export default function Editorcomponent() {
  // Use useRef to persist timer across renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Access Zustand state
  const { editorSocket } = useEditorSocketStore();
  const { activeFileTab } = useActiveFileTabStore();
  
  // Handle changes in the Monaco editor with debounced socket emission
  function handleChange(value: string | undefined) {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer for debounced save
    timerRef.current = setTimeout(() => {
      const editorContent = value;
      console.log("Sending writeFile event");
      
      editorSocket?.emit("writeFile", {
        data: editorContent,
        pathToFileOrFolder: activeFileTab?.path,
      });
    }, 2000);
  }
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Get language based on file extension
  const getLanguage = (extension: string) => {
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
    };
    return languageMap[extension] || 'plaintext';
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <EditorButton />
        <EditorButton />
      </div>
      
      <Editor
        height="70vh"
        width="100%"
        theme="vs-dark"
        language={activeFileTab?.extension ? getLanguage(activeFileTab.extension) : 'javascript'}
        value={activeFileTab?.value || "// No file selected"}
        onChange={handleChange}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab, // Make readonly if no file is active
        }}
      />
    </>
  );
}