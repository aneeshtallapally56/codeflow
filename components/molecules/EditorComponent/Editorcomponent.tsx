'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';
import { useFileLockStore } from '@/lib/store/fileLockStore';
import { useUserStore } from '@/lib/store/userStore';

export default function Editorcomponent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const hasRequestedLockRef = useRef(false); 

  const [isLockingFile, setIsLockingFile] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  // Global stores
  const { editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent } = useEditorSocketStore();
  const { userId } = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { isLocked, lockedByUser, addLock, removeLock } = useFileLockStore();

  const currentFilePath = activeFileTab?.path;
  const isCurrentFileLocked = currentFilePath ? isLocked(currentFilePath) : false;
  const isLockedByCurrentUser = currentFilePath ? lockedByUser(currentFilePath, userId) : false;
  const canEdit = !isCurrentFileLocked || isLockedByCurrentUser;

  const extractProjectId = (fullPath: string) => {
    const segments = fullPath.split('/');
    const index = segments.indexOf('generated-projects');
    return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
  };

  // 🔒 Set up socket listeners
  useEffect(() => {
    if (!editorSocket) return;

    const handleFileLocked = ({ userId: lockerId, username, filePath }: any) => {
      addLock({ path: filePath, lockedBy: lockerId });
      if (filePath === currentFilePath && lockerId !== userId) {
        setLockError(`File is being edited by ${username}`);
      }
    };

    const handleFileLockedByOther = ({ userId: lockerId, username }: any) => {
      if (currentFilePath) {
        addLock({ path: currentFilePath, lockedBy: lockerId });
        setLockError(`File is being edited by ${username}`);
      }
    };

    const handleFileUnlocked = ({ filePath }: any) => {
      removeLock(filePath);
      if (filePath === currentFilePath) setLockError(null);
    };

    editorSocket.on('fileLocked', handleFileLocked);
    editorSocket.on('fileLockedByOther', handleFileLockedByOther);
    editorSocket.on('fileUnlocked', handleFileUnlocked);

    return () => {
      editorSocket.off('fileLocked', handleFileLocked);
      editorSocket.off('fileLockedByOther', handleFileLockedByOther);
      editorSocket.off('fileUnlocked', handleFileUnlocked);
    };
  }, [editorSocket, currentFilePath, addLock, removeLock, userId]);

  // 📁 Handle file switching
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;
    hasRequestedLockRef.current = false;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);

      if (oldPath) {
        const oldProjectId = extractProjectId(oldPath);
        emitLeaveFileRoom(oldProjectId, oldPath);
        if (lockedByUser(oldPath, userId)) {
          emitSocketEvent('unlockFile', { projectId: oldProjectId, filePath: oldPath });
        }
      }

      emitJoinFileRoom(projectId, newPath);
      setIsLockingFile(true);
      setLockError(null);
      emitSocketEvent('lockFile', { projectId, filePath: newPath });
      hasRequestedLockRef.current = true;
      setTimeout(() => setIsLockingFile(false), 500);

      previousPathRef.current = newPath;
    }
  }, [activeFileTab?.path]);

  const handleChange = (value: string | undefined) => {
    if (!canEdit || !editorSocket) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';
      if (filePath && projectId) {
        emitSocketEvent('writeFile', {
          data: value,
          pathToFileOrFolder: filePath,
          projectId,
        });
      }
    }, 2000);
  };

  const handleEditorFocus = () => {
    if (currentFilePath && !isLockedByCurrentUser && !isLockingFile && !hasRequestedLockRef.current) {
      const projectId = extractProjectId(currentFilePath);
      setIsLockingFile(true);
      emitSocketEvent('lockFile', { projectId, filePath: currentFilePath });
      hasRequestedLockRef.current = true;
      setTimeout(() => setIsLockingFile(false), 500);
    }
  };

  const handleUnlockFile = () => {
    if (currentFilePath && isLockedByCurrentUser) {
      const projectId = extractProjectId(currentFilePath);
      emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (currentFilePath && isLockedByCurrentUser && editorSocket) {
        const projectId = extractProjectId(currentFilePath);
        emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
      }
    };
  }, []);

  const getLanguage = (extension: string) => {
    const languageMap: Record<string, string> = {
      '.js': 'javascript', '.ts': 'typescript', '.jsx': 'javascript',
      '.tsx': 'typescript', '.py': 'python', '.html': 'html',
      '.css': 'css', '.json': 'json',
    };
    return languageMap[extension] || 'plaintext';
  };

  return (
    <div className="relative">
      {isCurrentFileLocked && (
        <div className={`absolute top-2 right-2 px-3 py-1 text-sm rounded z-10 ${
          isLockedByCurrentUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          {isLockedByCurrentUser ? '🔒 Editing' : '🔒 Locked'}
        </div>
      )}

      {lockError && (
        <div className="absolute top-12 right-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded z-10 text-sm border border-yellow-300 max-w-xs">
          {lockError}
        </div>
      )}

      {isLockedByCurrentUser && (
        <button
          onClick={handleUnlockFile}
          className="absolute top-2 right-20 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded z-10"
        >
          Release Lock
        </button>
      )}

      <Editor
        height="70vh"
        width="100%"
        theme="vs-dark"
        language={getLanguage(activeFileTab?.extension || '')}
        value={activeFileTab?.value || '// No file selected'}
        onChange={handleChange}
        onMount={(editor) => {
          editor.onDidFocusEditorText(handleEditorFocus);
        }}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab || !canEdit,
        }}
      />

      {isLockingFile && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white px-4 py-2 rounded shadow">Requesting edit access...</div>
        </div>
      )}
    </div>
  );
}