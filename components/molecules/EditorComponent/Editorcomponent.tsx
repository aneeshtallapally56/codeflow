'use client';
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import EditorButton from '@/components/atoms/EditorButton';
import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';

export default function Editorcomponent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);

  const { editorSocket, joinFileRoom, leaveFileRoom } = useEditorSocketStore();
  const { activeFileTab } = useActiveFileTabStore();

  // Assuming projectId can be extracted from file path (e.g., `/generated-projects/<projectId>/src/file.js`)
  const extractProjectId = (fullPath: string) => {
    const segments = fullPath.split('/');
    const index = segments.indexOf('generated-projects');
    return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
  };

  // Join/Leave file room based on file change
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);
      
      if (oldPath) {
        leaveFileRoom(projectId, oldPath);
      }
      joinFileRoom(projectId, newPath);
      previousPathRef.current = newPath;
    }
  }, [activeFileTab?.path, editorSocket, joinFileRoom, leaveFileRoom]);

  // Debounced file writing
  function handleChange(value: string | undefined) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const editorContent = value;
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';

      if (filePath && projectId) {
        editorSocket?.emit('writeFile', {
          data: editorContent,
          pathToFileOrFolder: filePath,
          projectId,
        });
      }
    }, 2000);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
          readOnly: !activeFileTab,
        }}
      />
    </>
  );
}