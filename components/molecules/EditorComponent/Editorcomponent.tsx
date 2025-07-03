'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';
import { useFileLockStore } from '@/lib/store/fileLockStore';
import { useUserStore } from '@/lib/store/userStore';
import { useEditorTabStore } from '@/lib/store/editorTabStores';

// Loading message component
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
      <span className="text-gray-700">{message}</span>
    </div>
  </div>
);

export default function EditorComponent() {
  const updateFileContent = useEditorTabStore((state) => state.updateFileContent);
  // References for timers and tracking
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);


  // Simple state variables
  const [isRequestingLock, setIsRequestingLock] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  // Get data from stores
  const { editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent } = useEditorSocketStore();
  const { userId } = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { isLocked, lockedByUser, addLock, removeLock } = useFileLockStore();

  // Get current file info
  const currentFilePath = activeFileTab?.path;
  const isCurrentFileLocked = currentFilePath ? isLocked(currentFilePath) : false;
  const isLockedByCurrentUser = currentFilePath ? lockedByUser(currentFilePath, userId) : false;
  const canEdit = !isCurrentFileLocked || isLockedByCurrentUser;

  // Helper function to get project ID from file path
  function extractProjectId(fullPath: string) {
    const segments = fullPath.split('/');
    const index = segments.indexOf('generated-projects');
    return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
  }

  // Function to request file lock
  function requestFileLock(filePath: string) {
    if (!editorSocket || !filePath || isRequestingLock) return;

    const projectId = extractProjectId(filePath);
    console.log('🔄 Requesting lock for:', filePath);

    setIsRequestingLock(true);
    setLockError(null);

    emitSocketEvent('lockFile', { projectId, filePath });

    // Stop loading after 2 seconds
    setTimeout(() => {
      setIsRequestingLock(false);
    }, 2000);
  }

  // Listen for socket events about file locking
  useEffect(() => {
    if (!editorSocket) return;

    // When lock is granted
    function handleFileLockGranted({ userId: lockerId, username, filePath }: any) {
      console.log('🔒 File lock granted:', { lockerId, username, filePath });
      addLock({ path: filePath, lockedBy: lockerId, lockedByUsername: username });
      
      if (filePath === currentFilePath) {
        setIsRequestingLock(false);
        setLockError(null);
      }
    }

    // When lock is denied
    function handleFileLockDenied({ username }: any) {
      console.log('🚫 File lock denied by:', username);
      setIsRequestingLock(false);
    }

    // When lock is released
    function handleFileLockReleased({ filePath }: any) {
      console.log('🔓 File lock released:', filePath);
      removeLock(filePath);
      if (filePath === currentFilePath) {
        setLockError(null);
      }
    }

    // When file is locked by someone else
    function handleFileLockedByOther({ userId: lockerId, username }: any) {
      console.log('🔒 File locked by other user:', username);
      setIsRequestingLock(false);
      setLockError(`File is being edited by ${username}`);
      
      if (currentFilePath) {
        addLock({ path: currentFilePath, lockedBy: lockerId, lockedByUsername: username });
      }
    }

    // Add event listeners
    editorSocket.on('fileLockGranted', handleFileLockGranted);
    editorSocket.on('fileLockDenied', handleFileLockDenied);
    editorSocket.on('fileLockReleased', handleFileLockReleased);
    editorSocket.on('fileLockedByOther', handleFileLockedByOther);

    // Remove event listeners when component unmounts
    return () => {
      editorSocket.off('fileLockGranted', handleFileLockGranted);
      editorSocket.off('fileLockDenied', handleFileLockDenied);
      editorSocket.off('fileLockReleased', handleFileLockReleased);
      editorSocket.off('fileLockedByOther', handleFileLockedByOther);
    };
  }, [editorSocket, currentFilePath, addLock, removeLock]);

  // Handle switching between files
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);

      // Leave old file room and unlock if needed
      if (oldPath) {
        const oldProjectId = extractProjectId(oldPath);
        emitLeaveFileRoom(oldProjectId, oldPath);
        
        if (lockedByUser(oldPath, userId)) {
          emitSocketEvent('unlockFile', { projectId: oldProjectId, filePath: oldPath });
        }
      }

      // Join new file room and request lock
      emitJoinFileRoom(projectId, newPath);
      setLockError(null);
      requestFileLock(newPath);

      previousPathRef.current = newPath;
    }
  }, [activeFileTab?.path, editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent, lockedByUser, userId]);

  // Handle when user types in editor
 
function handleChange(value: string | undefined) {
    if (!canEdit || !editorSocket) return;

    // Update local state immediately when user types
    if (currentFilePath && value) {
      updateFileContent(currentFilePath, value);
    }

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer to save after 1 second of no typing
    timerRef.current = setTimeout(() => {
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';
      
      if (filePath && projectId) {
        emitSocketEvent('writeFile', {
          data: value,
          filePath: filePath,
          projectId,
        });
      }
    }, 1000);
  }

  // Function to manually unlock file
  function handleUnlockFile() {
    if (currentFilePath && isLockedByCurrentUser && editorSocket) {
      const projectId = extractProjectId(currentFilePath);
      emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
    }
  }

  // Clean up when component is destroyed
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (currentFilePath && isLockedByCurrentUser && editorSocket) {
        const projectId = extractProjectId(currentFilePath);
        emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
      }
    };
  }, [currentFilePath, isLockedByCurrentUser, editorSocket, emitSocketEvent]);

  // Get programming language based on file extension
  function getLanguage(extension: string) {
    const languageMap: Record<string, string> = {
      '.js': 'javascript', 
      '.ts': 'typescript', 
      '.jsx': 'javascript',
      '.tsx': 'typescript', 
      '.py': 'python', 
      '.html': 'html',
      '.css': 'css', 
      '.json': 'json', 
      '.md': 'markdown',
    };
    return languageMap[extension] || 'plaintext';
  }

  // Clear error message after 5 seconds
  useEffect(() => {
    if (lockError) {
      const timer = setTimeout(() => setLockError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lockError]);

  return (
    <div className="relative">
      {/* Show loading when requesting lock */}
      {isRequestingLock && (
        <LoadingOverlay message="Requesting edit access..." />
      )}

      {/* Show error message */}
      {lockError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-3 py-2 rounded z-10 text-sm border border-red-300">
          {lockError}
          <button 
            onClick={() => setLockError(null)}
            className="ml-2 text-red-600 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Show unlock button when file is locked by current user */}
      {isLockedByCurrentUser && (
        <button
          onClick={handleUnlockFile}
          className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded z-10"
        >
          Release Lock
        </button>
      )}

      {/* The code editor */}
      <Editor
        height="70vh"
        width="100%"
        theme="vs-dark"
        language={getLanguage(activeFileTab?.extension || '')}
        value={activeFileTab?.value || '// No file selected'}
        onChange={handleChange}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab || !canEdit,
          wordWrap: 'on',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}