'use client'
import React from 'react';
import Editor from '@monaco-editor/react';
import EditorButton from '@/components/atoms/EditorButton';
import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';

export default function Editorcomponent() {
  const {editorSocket} = useEditorSocketStore();     
  const {activeFileTab, setActiveFileTab} = useActiveFileTabStore() as {
    activeFileTab: any; // Replace 'any' with the actual type if known
    setActiveFileTab: (path: string, value: string) => void;
  };


  editorSocket?.on('readFileSuccess', (data) => {
    console.log('readFileSuccess event received',data);
    setActiveFileTab(data.path,data.value);
  });
  return (
    <>
      <EditorButton />
      <EditorButton />

      <Editor
        height="70vh"
        width="100%"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        theme="vs-dark" // <-- Apply dark theme
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      value = {activeFileTab?.value || ""}
      />
    </>
  );
}