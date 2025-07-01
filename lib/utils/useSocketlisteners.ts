"use client";
import { useEffect, useRef } from "react";
import path from "path";
import { toast } from "sonner";

import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorTabStore } from "../store/editorTabStores";
import { useRoomMembersStore } from "../store/roomMembersStore";
import { useUserStore } from "../store/userStore";
import { useFileLockStore } from "../store/fileLockStore";

// Standardized event payload types
interface FileLockEvent {
  userId: string;
  username: string;
  filePath: string;
  requestId?: string;
}

interface FileOperationEvent {
  filePath: string;
  projectId?: string;
}

interface UserPresenceEvent {
  userId: string;
  username: string;
  socketId: string;
}

interface FileReadEvent {
  filePath: string;
  value: string;
  extension: string;
}

interface FileWriteEvent {
  filePath: string;
  data?: string;
}

export const useSocketListeners = () => {
  const { editorSocket } = useEditorSocketStore();
  const { setActiveFileTab } = useActiveFileTabStore();
  const { setTreeStructure } = useTreeStructureStore();
  const { openFile } = useEditorTabStore();
  const { addLock, removeLock } = useFileLockStore();
  const userId = useUserStore((s) => s.userId);

  const initialized = useRef(false);

  // ✅ File operations and common listeners
  useEffect(() => {
    if (!editorSocket || initialized.current) return;

    initialized.current = true;

    // File read/write operations
    const handleReadFileSuccess = (data: FileReadEvent) => {
      console.log("✅ readFileSuccess:", data);
      const fileTab = {
        path: data.filePath,
        name: path.basename(data.filePath),
        content: data.value,
        extension: data.extension,
      };
      openFile(fileTab);
      setActiveFileTab({
        path: data.filePath,
        value: data.value,
        extension: data.extension,
      });
    };

    const handleWriteFileSuccess = (data: FileWriteEvent) => {
      console.log("✅ File written successfully:", data);
      editorSocket.emit("readFile", {
        filePath: data.filePath,
      });
    };

    // File system events (real-time updates)
    const handleFileCreated = (data: FileOperationEvent) => {
      console.log("🆕 fileCreated broadcast:", data.filePath);
      setTreeStructure();
    };

    const handleFileDeleted = (data: FileOperationEvent) => {
      console.log("🗑️ fileDeleted broadcast:", data.filePath);
      setTreeStructure();
      // Remove any locks for the deleted file
      removeLock(data.filePath);
    };

    const handleFolderCreated = (data: FileOperationEvent) => {
      console.log("📁 folderCreated broadcast:", data.filePath);
      setTreeStructure();
    };

    const handleFolderDeleted = (data: FileOperationEvent) => {
      console.log("📁 folderDeleted broadcast:", data.filePath);
      setTreeStructure();
      // Remove locks for files in the deleted folder
      // TODO: Implement removeLocksWithPrefix method if needed
    };

    const handleDeleteFileSuccess = () => {
      setTreeStructure();
    };

    const handleDeleteFolderSuccess = () => {
      setTreeStructure();
    };

    // File locking events - Store management only (UI handled in EditorComponent)
    const handleFileLocked = (data: FileLockEvent) => {
      console.log("🔒 fileLocked store update:", data.filePath, "by", data.userId);
      
      if (data.filePath && data.userId) {
        addLock({ 
          path: data.filePath, 
          lockedBy: data.userId 
        });
      }
       if (data.userId !== userId) {
          toast(`${data.username} started editing ${path.basename(data.filePath)}`);
        }
    };

    const handleFileUnlocked = (data: FileOperationEvent) => {
      console.log("🔓 fileUnlocked store update:", data.filePath);
      removeLock(data.filePath);
    };

    // Error handling
    const handleError = (data: { data: string }) => {
      console.error("❌ Socket error:", data);
      toast.error(`Error: ${data.data}`);
    };

    // Debug listener for all events (development only)
    const handleAnyEvent = (event: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("📡 Received socket event:", event, args);
      }
    };

    // Register all common listeners
    editorSocket.on("readFileSuccess", handleReadFileSuccess);
    editorSocket.on("writeFileSuccess", handleWriteFileSuccess);
    editorSocket.on("deleteFileSuccess", handleDeleteFileSuccess);
    editorSocket.on("deleteFolderSuccess", handleDeleteFolderSuccess);
    editorSocket.on("fileDeleted", handleFileDeleted);
    editorSocket.on("folderDeleted", handleFolderDeleted);
    editorSocket.on("fileCreated", handleFileCreated);
    editorSocket.on("folderCreated", handleFolderCreated);
    
    // File locking - Store updates only (no UI logic)
    editorSocket.on("fileLocked", handleFileLocked);
    editorSocket.on("fileUnlocked", handleFileUnlocked);
    
    editorSocket.on("error", handleError);
    
    // Only add debug listener in development
    if (process.env.NODE_ENV === 'development') {
      editorSocket.onAny(handleAnyEvent);
    }

    // 🧼 Cleanup on unmount
    return () => {
      editorSocket.off("readFileSuccess", handleReadFileSuccess);
      editorSocket.off("writeFileSuccess", handleWriteFileSuccess);
      editorSocket.off("deleteFileSuccess", handleDeleteFileSuccess);
      editorSocket.off("deleteFolderSuccess", handleDeleteFolderSuccess);
      editorSocket.off("fileDeleted", handleFileDeleted);
      editorSocket.off("folderDeleted", handleFolderDeleted);
      editorSocket.off("fileCreated", handleFileCreated);
      editorSocket.off("folderCreated", handleFolderCreated);
      editorSocket.off("fileLocked", handleFileLocked);
      editorSocket.off("fileUnlocked", handleFileUnlocked);
      editorSocket.off("error", handleError);
      
      if (process.env.NODE_ENV === 'development') {
        editorSocket.offAny(handleAnyEvent);
      }
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure, addLock, removeLock, userId]);

  // ✅ User presence listeners (requires userId)
  useEffect(() => {
    if (!editorSocket || !userId) return;

    const handleUserJoined = (user: UserPresenceEvent) => {
      console.log("👥 User joined project:", user);
      const isCurrentUser = user.userId === userId;
      useRoomMembersStore.getState().addLiveUser(user);

      if (isCurrentUser) {
        toast.success("You joined the collaboration");
      } else {
        toast(`${user.username} joined the collaboration`);
      }
    };

    const handleUserLeft = (data: { 
      userId: string; 
      socketId: string;
      username?: string;
    }) => {
      console.log("👥 User left project:", data);
      useRoomMembersStore.getState().removeLiveUser(data.socketId);
      
      if (data.userId !== userId) {
        const username = data.username || data.userId;
        toast(`${username} left the collaboration`);
      }
    };

    const handleInitialUsers = (users: Array<UserPresenceEvent>) => {
      console.log("👥 Initial users in project:", users);
      // Set initial user presence
      users.forEach(user => {
        useRoomMembersStore.getState().addLiveUser(user);
      });
    };

    // Register user-dependent listeners
    editorSocket.on("userJoined", handleUserJoined);
    editorSocket.on("userLeft", handleUserLeft);
    editorSocket.on("initialUsers", handleInitialUsers);

    return () => {
      editorSocket.off("userJoined", handleUserJoined);
      editorSocket.off("userLeft", handleUserLeft);
      editorSocket.off("initialUsers", handleInitialUsers);
    };
  }, [editorSocket, userId]);
};