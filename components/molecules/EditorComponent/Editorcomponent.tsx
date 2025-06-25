'use client'
import React from 'react';
import Editor from '@monaco-editor/react';
import EditorButton from '@/components/atoms/EditorButton';

export default function Editorcomponent() {
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
      />
    </>
  );
}