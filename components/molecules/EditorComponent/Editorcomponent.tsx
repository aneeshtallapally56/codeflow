'use client'
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import EditorButton from '@/components/atoms/EditorButton';

export default function Editorcomponent() {
  const [theme, setTheme] = useState(null);
  const [monacoInstance, setMonacoInstance] = useState(null);

  useEffect(() => {
    fetch('/Dracula.json')
      .then((res) => res.json())
      .then((themeData) => {
        setTheme(themeData);
      });
  }, []);

  // When both theme and monaco are ready, apply theme
  useEffect(() => {
    if (theme && monacoInstance) {
      monacoInstance.editor.defineTheme('dracula', theme);
      monacoInstance.editor.setTheme('dracula');
    }
  }, [theme, monacoInstance]);

  return (
    <>
    <EditorButton />
     <EditorButton />

    <Editor
      height="70vh"
      width="100%"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
        }}
        onMount={(editor, monaco) => {
            setMonacoInstance(monaco);
            // optional: set theme here if already available
            if (theme) {
                monaco.editor.defineTheme('dracula', theme);
                monaco.editor.setTheme('dracula');
            }
        }}
        />
        </>
  );
}