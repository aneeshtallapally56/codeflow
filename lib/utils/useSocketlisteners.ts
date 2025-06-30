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
    const handleReadFileSuccess = (data: {
      path: string;
      value: string;
      extension: string;
    }) => {
      console.log("✅ readFileSuccess:", data);
      const fileTab = {
        path: data.path,
        name: path.basename(data.path),
        content: data.value,
        extension: data.extension,
      };
      openFile(fileTab);
      setActiveFileTab({
        path: data.path,
        value: data.value,
        extension: data.extension,
      });
    };

    const handleWriteFileSuccess = (data: { path: string }) => {
      console.log("✅ File written successfully:", data);
      editorSocket.emit("readFile", {
        pathToFileOrFolder: data.path,
      });
    };

    // File system events (real-time updates)
    const handleFileCreated = (data: { path: string }) => {
      console.log("🆕 fileCreated broadcast:", data.path);
      setTreeStructure();
    };

    const handleFileDeleted = (data: { path: string }) => {
      console.log("🗑️ fileDeleted broadcast:", data.path);
      setTreeStructure();
      // Remove any locks for the deleted file
      removeLock(data.path);
    };

    const handleFolderCreated = (data: { path: string }) => {
      console.log("📁 folderCreated broadcast:", data.path);
      setTreeStructure();
    };

    const handleFolderDeleted = (data: { path: string }) => {
      console.log("📁 folderDeleted broadcast:", data.path);
      setTreeStructure();
      // Remove locks for files in the deleted folder would need more complex logic
      // You might want to implement a method to remove locks by path prefix
    };

    const handleDeleteFileSuccess = () => {
      setTreeStructure();
    };

    const handleDeleteFolderSuccess = () => {
      setTreeStructure();
    };

    // File locking events
    const handleFileLocked = (data: { 
      pathToFile: string; 
      lockedBy: string;
      userId?: string;
      username?: string;
    }) => {
      console.log("🔒 fileLocked broadcast:", data.pathToFile, "by", data.lockedBy);
      addLock({ 
        path: data.pathToFile, 
        lockedBy: data.lockedBy 
      });
    };

    const handleFileUnlocked = (data: { pathToFile: string }) => {
      console.log("🔓 fileUnlocked broadcast:", data.pathToFile);
      removeLock(data.pathToFile);
    };

    // Error handling
    const handleError = (data: { data: string }) => {
      console.error("❌ Socket error:", data);
      toast.error(`Error: ${data.data}`);
    };

    // Debug listener for all events
    const handleAnyEvent = (event: string, ...args: any[]) => {
      console.log("📡 Received socket event:", event, args);
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
    editorSocket.on("fileLocked", handleFileLocked);
    editorSocket.on("fileUnlocked", handleFileUnlocked);
    editorSocket.on("error", handleError);
    editorSocket.onAny(handleAnyEvent);

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
      editorSocket.offAny(handleAnyEvent);
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure, addLock, removeLock]);

  // ✅ User presence listeners (requires userId)
  useEffect(() => {
    if (!editorSocket || !userId) return;

    const handleUserJoined = (user: {
      userId: string;
      username: string;
      socketId: string;
    }) => {
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

    const handleInitialUsers = (users: Array<{ 
      userId: string; 
      username: string;
      socketId: string;
    }>) => {
      console.log("👥 Initial users in project:", users);
      // Set initial user presence
      users.forEach(user => {
        useRoomMembersStore.getState().addLiveUser(user);
      });
    };

    const handleFileLockedByOther = (data: { 
      userId: string; 
      username: string;
      filePath?: string;
    }) => {
      console.log("🔒 File already locked by other user:", data);
      toast.warning(`File is already being edited by ${data.username}`);
    };

    // Register user-dependent listeners
    editorSocket.on("userJoined", handleUserJoined);
    editorSocket.on("userLeft", handleUserLeft);
    editorSocket.on("initialUsers", handleInitialUsers);
    editorSocket.on("fileLockedByOther", handleFileLockedByOther);

    return () => {
      editorSocket.off("userJoined", handleUserJoined);
      editorSocket.off("userLeft", handleUserLeft);
      editorSocket.off("initialUsers", handleInitialUsers);
      editorSocket.off("fileLockedByOther", handleFileLockedByOther);
    };
  }, [editorSocket, userId]);
};