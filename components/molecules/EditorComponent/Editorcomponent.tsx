'use client';
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';

export default function Editorcomponent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);

  const {
    editorSocket,
    emitJoinFileRoom,
    emitLeaveFileRoom,
    emitSocketEvent,
  } = useEditorSocketStore();

  const { activeFileTab } = useActiveFileTabStore();

  const extractProjectId = (fullPath: string) => {
    const segments = fullPath.split('/');
    const index = segments.indexOf('generated-projects');
    return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
  };

  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);
      if (oldPath) {
        emitLeaveFileRoom(projectId, oldPath);
      }
      emitJoinFileRoom(projectId, newPath);
      previousPathRef.current = newPath;
    }
  }, [activeFileTab?.path, editorSocket, emitJoinFileRoom, emitLeaveFileRoom]);

  function handleChange(value: string | undefined) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const editorContent = value;
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';

      if (filePath && projectId) {
        emitSocketEvent('writeFile', {
          data: editorContent,
          pathToFileOrFolder: filePath,
          projectId,
        });
      }
    }, 2000);
  }

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
    <Editor
      height="70vh"
      width="100%"
      theme="vs-dark"
      language={
        activeFileTab?.extension
          ? getLanguage(activeFileTab.extension)
          : 'javascript'
      }
      value={activeFileTab?.value || '// No file selected'}
      onChange={handleChange}
      options={{
        fontSize: 16,
        fontFamily: 'Fira Code, monospace',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: !activeFileTab,
      }}
    />
  );
}