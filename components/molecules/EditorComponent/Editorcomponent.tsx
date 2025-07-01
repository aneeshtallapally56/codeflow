'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

import { useEditorSocketStore } from '@/lib/store/editorSocketStore';
import { useActiveFileTabStore } from '@/lib/store/activeFileTabStore';
import { useFileLockStore } from '@/lib/store/fileLockStore';
import { useUserStore } from '@/lib/store/userStore';

interface LockRequestState {
  requestId: string | null;
  isRequesting: boolean;
  error: string | null;
}

export default function EditorComponent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const hasRequestedLockRef = useRef(false);
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lockState, setLockState] = useState<LockRequestState>({
    requestId: null,
    isRequesting: false,
    error: null
  });

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

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
  }, []);

  // Enhanced lock request with proper error handling
  const requestFileLock = useCallback((filePath: string) => {
    if (!editorSocket || !filePath) {
      console.log('❌ Cannot request lock: missing socket or filePath');
      return;
    }

    // Don't make multiple requests for the same file
    if (lockState.isRequesting && lockState.requestId) {
      console.log('⏳ Lock request already in progress, skipping');
      return;
    }

    const requestId = `${Date.now()}-${Math.random()}`;
    const projectId = extractProjectId(filePath);

    console.log('🔄 Requesting lock for:', filePath, 'RequestID:', requestId, 'ProjectID:', projectId);

    setLockState({
      requestId,
      isRequesting: true,
      error: null
    });

    try {
      emitSocketEvent('lockFile', { projectId, filePath, requestId });
      hasRequestedLockRef.current = true;
      console.log('📤 Lock request sent to server');
    } catch (error) {
      console.error('❌ Failed to send lock request:', error);
      setLockState({
        requestId: null,
        isRequesting: false,
        error: 'Failed to send lock request'
      });
      return;
    }

    // Fallback timeout for lock request
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }
    
    lockTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Lock request timed out for:', requestId);
      setLockState(prev => {
        if (prev.requestId === requestId && prev.isRequesting) {
          console.log('⏰ Clearing timed out request');
          return {
            requestId: null,
            isRequesting: false,
            error: 'Lock request timed out. You can still view the file.'
          };
        }
        return prev;
      });
    }, 3000);

  }, [editorSocket, emitSocketEvent, lockState.isRequesting, lockState.requestId]);

  // Cancel lock request
  const cancelLockRequest = useCallback(() => {
    console.log('Cancelling lock request');
    clearAllTimers();
    setLockState({
      requestId: null,
      isRequesting: false,
      error: null
    });
  }, [clearAllTimers]);


 
  // 🔒 File lock specific socket listeners (only for UI state management)
  useEffect(() => {
    if (!editorSocket) return;

    const handleFileLockGranted = ({ userId: lockerId, username, filePath, requestId }: any) => {
      console.log('🔒 File lock granted:', { lockerId, username, filePath, requestId, currentRequestId: lockState.requestId });
       addLock({ path: filePath, lockedBy: lockerId });
      // Handle successful lock response for our request
      if (requestId) {
        setLockState(currentState => {
          console.log('🔒 Checking request IDs:', { requestId, currentRequestId: currentState.requestId });
          if (currentState.requestId === requestId) {
            console.log('✅ Lock acquired successfully for our request');
            clearAllTimers();
            return {
              requestId: null,
              isRequesting: false,
              error: null
            };
          }
          return currentState;
        });
      }
      
      // Also handle case where requestId might not be provided but it's our file
      if (filePath === currentFilePath && lockerId === userId) {
        setLockState(prev => {
          if (prev.isRequesting) {
            console.log('✅ Lock acquired for current user (no requestId match)');
            clearAllTimers();
            return {
              requestId: null,
              isRequesting: false,
              error: null
            };
          }
          return prev;
        });
      }
      
      // Handle lock by another user
      if (filePath === currentFilePath && lockerId !== userId) {
        setLockState(prev => ({
          ...prev,
          isRequesting: false,
          error: `File is being edited by ${username}`
        }));
      }
    };

    const handleFileLockDenied = ({ userId: lockerId, username, requestId }: any) => {
      console.log('🚫 File lock denied:', { lockerId, username, requestId });
      
      setLockState(currentState => {
        if (requestId && currentState.requestId === requestId) {
          console.log('❌ Our lock request was denied');
          clearAllTimers();
          return {
            requestId: null,
            isRequesting: false,
            error: `File is being edited by ${username}`
          };
        }
        return {
          ...currentState,
          isRequesting: false,
          error: `File is being edited by ${username}`
        };
      });
    };

    const handleFileLockReleased = ({ filePath }: any) => {
      console.log('🔓 File lock released:', filePath);
       removeLock(filePath);
      if (filePath === currentFilePath) {
        setLockState(prev => ({
          ...prev,
          error: null
        }));
      }
    };

    const handleLockError = ({ error, requestId }: any) => {
      console.log('❌ Lock error:', { error, requestId });
      
      setLockState(currentState => {
        if (requestId && currentState.requestId === requestId) {
          clearAllTimers();
          return {
            requestId: null,
            isRequesting: false,
            error: error || 'Failed to acquire file lock'
          };
        }
        return {
          ...currentState,
          isRequesting: false,
          error: error || 'Failed to acquire file lock'
        };
      });
    };

    const handleSocketDisconnect = () => {
      console.log('🔌 Socket disconnected');
      setLockState(prev => ({
        ...prev,
        isRequesting: false,
        error: 'Connection lost. You can still view the file.'
      }));
    };

    const handleSocketReconnect = () => {
      console.log('🔌 Socket reconnected');
      setLockState(prev => ({
        ...prev,
        error: prev.error?.includes('Connection lost') ? null : prev.error
      }));
    };

     const handleFileLockedByOther = ({  username, filePath }: any) => {
  if (filePath === currentFilePath) {
    setLockState(prev => ({
      ...prev,
      isRequesting: false,
      error: `File is being edited by ${username}`
    }));
  }
};

    // Register lock-specific listeners (UI state only)
    editorSocket.on('fileLockGranted', handleFileLockGranted);
    editorSocket.on('fileLockDenied', handleFileLockDenied);
    editorSocket.on('fileLockReleased', handleFileLockReleased);
    editorSocket.on('fileLockedByOther', handleFileLockedByOther);
    editorSocket.on('lockError', handleLockError);
    editorSocket.on('disconnect', handleSocketDisconnect);
    editorSocket.on('reconnect', handleSocketReconnect);


    return () => {
      editorSocket.off('fileLockGranted', handleFileLockGranted);
      editorSocket.off('fileLockDenied', handleFileLockDenied);
      editorSocket.off('fileLockReleased', handleFileLockReleased);
      editorSocket.off('fileLockedByOther', handleFileLockedByOther);
      editorSocket.off('lockError', handleLockError);
      editorSocket.off('disconnect', handleSocketDisconnect);
      editorSocket.off('reconnect', handleSocketReconnect);
    };
  }, [editorSocket, currentFilePath, userId, clearAllTimers, lockState.requestId]);

  // 📁 Enhanced file switching with proper cleanup
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (newPath !== oldPath) {
      console.log('File changed from', oldPath, 'to', newPath);
      
      // Reset request state on file change
      hasRequestedLockRef.current = false;
      
      // Clear any existing timers and requests
      clearAllTimers();
      setLockState({
        requestId: null,
        isRequesting: false,
        error: null
      });

      if (editorSocket && newPath) {
        const projectId = extractProjectId(newPath);

        // Cleanup old file
        if (oldPath) {
          const oldProjectId = extractProjectId(oldPath);
          emitLeaveFileRoom(oldProjectId, oldPath);
          
          // Unlock old file if locked by current user
          if (lockedByUser(oldPath, userId)) {
            emitSocketEvent('unlockFile', { projectId: oldProjectId, filePath: oldPath });
          }
        }

        // Setup new file
        emitJoinFileRoom(projectId, newPath);
        
        // Small delay before requesting lock to ensure room join is complete
        setTimeout(() => {
          if (activeFileTab?.path === newPath) { // Double check file hasn't changed
            requestFileLock(newPath);
          }
        }, 100);

        previousPathRef.current = newPath;
      }
    }
  }, [activeFileTab?.path, editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent, lockedByUser, userId, requestFileLock, clearAllTimers]);

  // Enhanced change handler with better error handling
  const handleChange = useCallback((value: string | undefined) => {
    if (!canEdit || !editorSocket) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounced save
    timerRef.current = setTimeout(() => {
      const filePath = activeFileTab?.path;
      const projectId = filePath ? extractProjectId(filePath) : '';
      
      if (filePath && projectId) {
        try {
          emitSocketEvent('writeFile', {
            data: value,
            filePath: filePath,
            projectId,
          });
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      }
    }, 1500);
  }, [canEdit, editorSocket, activeFileTab?.path, emitSocketEvent]);

  const handleEditorFocus = useCallback(() => {
    if (currentFilePath && 
        !isLockedByCurrentUser && 
        !lockState.isRequesting && 
        !hasRequestedLockRef.current &&
        editorSocket) {
      console.log('Editor focused, requesting lock');
      requestFileLock(currentFilePath);
    }
  }, [currentFilePath, isLockedByCurrentUser, lockState.isRequesting, requestFileLock, editorSocket]);

  const handleUnlockFile = useCallback(() => {
    if (currentFilePath && isLockedByCurrentUser && editorSocket) {
      const projectId = extractProjectId(currentFilePath);
      emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
    }
  }, [currentFilePath, isLockedByCurrentUser, editorSocket, emitSocketEvent]);

  // Enhanced cleanup effect
  useEffect(() => {
    return () => {
      clearAllTimers();
      
      if (currentFilePath && isLockedByCurrentUser && editorSocket) {
        const projectId = extractProjectId(currentFilePath);
        emitSocketEvent('unlockFile', { projectId, filePath: currentFilePath });
      }
    };
  }, [currentFilePath, isLockedByCurrentUser, editorSocket, emitSocketEvent, clearAllTimers]);

  const getLanguage = useCallback((extension: string) => {
    const languageMap: Record<string, string> = {
      '.js': 'javascript', '.ts': 'typescript', '.jsx': 'javascript',
      '.tsx': 'typescript', '.py': 'python', '.html': 'html',
      '.css': 'css', '.json': 'json', '.md': 'markdown',
      '.scss': 'scss', '.less': 'less', '.xml': 'xml',
      '.yaml': 'yaml', '.yml': 'yaml'
    };
    return languageMap[extension] || 'plaintext';
  }, []);

  // Clear error after some time
  useEffect(() => {
    if (lockState.error && !lockState.error.includes('Connection lost')) {
      const errorTimer = setTimeout(() => {
        setLockState(prev => ({ ...prev, error: null }));
      }, 5000);

      return () => clearTimeout(errorTimer);
    }
  }, [lockState.error]);

  return (
    <div>

      {/* Lock status indicator */}
      {/* {isCurrentFileLocked && (
        <div className={`absolute top-2 right-2 px-3 py-1 text-sm rounded z-10 ${
          isLockedByCurrentUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}>
          {isLockedByCurrentUser ? '🔒 Editing' : '🔒 Locked'}
          </div>
          )} */}

      {/* Lock request indicator - Non-blocking */}
      {/* {lockState.isRequesting && (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-3 py-2 rounded z-10 text-sm border border-blue-300">
        <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
        <span>Requesting edit access...</span>
        <button 
        onClick={cancelLockRequest}
        className="text-blue-600 hover:text-blue-900 font-bold ml-2"
        title="Cancel request"
        >
        ×
        </button>
        </div>
        </div>
        )} */}

      {/* Error display */}
      {/* {lockState.error && (
        <div className="absolute top-12 right-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded z-10 text-sm border border-yellow-300 max-w-xs">
        <div className="flex items-center justify-between gap-2">
        <span>{lockState.error}</span>
        <button 
        onClick={() => setLockState(prev => ({ ...prev, error: null }))}
        className="text-yellow-600 hover:text-yellow-900 font-bold"
        >
        ×
        </button>
        </div>
        </div>
        )} */}

      {/* Unlock button */}
      {/* {isLockedByCurrentUser && (
        <button
        onClick={handleUnlockFile}
        className="absolute top-2 right-20 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded z-10 transition-colors"
        title="Release file lock (Ctrl+L)"
        >
        Release Lock
        </button>
        )} */}

      {/* Monaco Editor - Always visible */}
      <Editor
        height="70vh"
        width="100%"
        theme="vs-dark"
        language={getLanguage(activeFileTab?.extension || '')}
        value={activeFileTab?.value || '// No file selected'}
        onChange={handleChange}
        onMount={(editor) => {
          editor.onDidFocusEditorText(handleEditorFocus);
          
          // Add keyboard shortcuts
          editor.addCommand(
            2048 + 42, // Ctrl+L or Cmd+L
            handleUnlockFile
          );
        }}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab || !canEdit,
          wordWrap: 'on',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
        }}
        />

      {/* Connection status */}
      {/* {!editorSocket && (
        <div className="absolute bottom-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs z-10">
        ⚠️ Disconnected
        </div>
        )} */}
        </div>
  );
}