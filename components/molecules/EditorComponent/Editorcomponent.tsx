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
  const [isLockingFile, setIsLockingFile] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  const {
    editorSocket,
    emitJoinFileRoom,
    emitLeaveFileRoom,
    emitSocketEvent,// Assuming you store current user ID in the socket store
  } = useEditorSocketStore();
  const {userId} = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { 
    isLocked, 
    lockedByUser, 
    addLock, 
    removeLock 
  } = useFileLockStore();

  const extractProjectId = (fullPath: string) => {
    const segments = fullPath.split('/');
    const index = segments.indexOf('generated-projects');
    return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
  };

  // Check if current file is locked and by whom
  const currentFilePath = activeFileTab?.path;
  const isCurrentFileLocked = currentFilePath ? isLocked(currentFilePath) : false;
  const isLockedByCurrentUser = currentFilePath ? lockedByUser(currentFilePath, userId) : false;
  const canEdit = !isCurrentFileLocked || isLockedByCurrentUser;

  // Setup socket listeners for file locking events
  useEffect(() => {
    if (!editorSocket) return;

    const handleFileLocked = ({ userId, username, filePath }: any) => {
      addLock({ path: filePath, lockedBy: userId });
      if (filePath === currentFilePath && userId !== userId) {
        setLockError(`File is being edited by ${username}`);
      }
    };

    const handleFileLockedByOther = ({ userId, username }: any) => {
      if (currentFilePath) {
        addLock({ path: currentFilePath, lockedBy: userId });
        setLockError(`File is being edited by ${username}`);
      }
    };

    const handleFileUnlocked = ({ filePath }: any) => {
      removeLock(filePath);
      if (filePath === currentFilePath) {
        setLockError(null);
      }
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

  // Handle file switching and locking
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);
      
      // Leave old file room and unlock if we were editing
      if (oldPath) {
        emitLeaveFileRoom(projectId, oldPath);
        if (lockedByUser(oldPath, userId)) {
          emitSocketEvent('unlockFile', { 
            projectId: extractProjectId(oldPath), 
            filePath: oldPath 
          });
        }
      }

      // Join new file room
      emitJoinFileRoom(projectId, newPath);
      
      // Try to lock the new file
      if (newPath) {
        setIsLockingFile(true);
        setLockError(null);
        emitSocketEvent('lockFile', { 
          projectId, 
          filePath: newPath 
        });
        
        // Clear locking state after a short delay
        setTimeout(() => setIsLockingFile(false), 500);
      }

      previousPathRef.current = newPath;
    }
  }, [activeFileTab?.path, editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent, lockedByUser, userId]);

  // Handle editor content changes
  function handleChange(value: string | undefined) {
    // Don't save if file is locked by another user
    if (!canEdit) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const editorContent = value;
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';

      if (filePath && projectId && canEdit) {
        emitSocketEvent('writeFile', {
          data: editorContent,
          pathToFileOrFolder: filePath,
          projectId,
        });
      }
    }, 2000);
  }

  // Handle editor focus - try to lock file when user starts editing
  const handleEditorFocus = () => {
    if (currentFilePath && !isLockedByCurrentUser && !isLockingFile) {
      const projectId = extractProjectId(currentFilePath);
      setIsLockingFile(true);
      emitSocketEvent('lockFile', { 
        projectId, 
        filePath: currentFilePath 
      });
      setTimeout(() => setIsLockingFile(false), 500);
    }
  };

  // Handle manual unlock (optional - for releasing lock without switching files)
  const handleUnlockFile = () => {
    if (currentFilePath && isLockedByCurrentUser) {
      const projectId = extractProjectId(currentFilePath);
      emitSocketEvent('unlockFile', { 
        projectId, 
        filePath: currentFilePath 
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Unlock file if we're leaving the component
      if (currentFilePath && isLockedByCurrentUser && editorSocket) {
        const projectId = extractProjectId(currentFilePath);
        emitSocketEvent('unlockFile', { 
          projectId, 
          filePath: currentFilePath 
        });
      }
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
    <div className="relative">
      {/* Lock status indicator */}
      {isCurrentFileLocked && (
        <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded text-sm ${
          isLockedByCurrentUser 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {isLockedByCurrentUser ? '🔒 Editing' : '🔒 Locked'}
        </div>
      )}

      {/* Lock error message */}
      {lockError && (
        <div className="absolute top-12 right-2 z-10 px-3 py-2 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-sm max-w-xs">
          {lockError}
        </div>
      )}

      {/* Unlock button (optional) */}
      {isLockedByCurrentUser && (
        <button
          onClick={handleUnlockFile}
          className="absolute top-2 right-20 z-10 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          Release Lock
        </button>
      )}

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
        onMount={(editor) => {
          editor.onDidFocusEditorText(handleEditorFocus);
        }}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab || !canEdit,
          // Visual indicator for read-only state
          ...((!activeFileTab || !canEdit) && {
            theme: 'vs-dark',
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }),
        }}
      />

      {/* Loading indicator */}
      {isLockingFile && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded shadow">
            Requesting edit access...
          </div>
        </div>
      )}
    </div>
  );
}