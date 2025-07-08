"use client";
import {  useEffect, useRef } from "react";
import path from "path";
import { toast } from "sonner";

import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorTabStore } from "../store/editorTabStores";
import{useProjectRoomMembersStore } from "../store/projectRoomMemberStore";
import { useUserStore } from "../store/userStore";
import { useFileLockStore } from "../store/fileLockStore";
import { useFileRoomMembersStore } from "../store/fileRoomMemberStore";

// Standardized event payload types
interface FileUnlock {
  filePath: string;
}
interface FileLock {
  filePath: string;
  userId: string;
}
interface FileLockRequest {
  filePath: string;
  projectId: string;
  requestedBy: string;
  requesterUserId: string;
}
interface FileOperationEvent {
  filePath: string;
  projectId?: string;
}

interface UserPresenceEvent {
  userId: string;
  username: string;
  socketId: string;
  filePath?: string; 
  avatarUrl:string;// Optional for file-specific events
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
  const {setLock} = useFileLockStore();
  const {setPort} = useUserStore();

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
const handleFileUnlocked = ({filePath}: FileUnlock) => {
   console.log("🔓 File unlocked:", filePath);
   setLock(filePath, null);
}
const handleFileLocked = ({filePath, userId}: FileLock) => {
  console.log("🔒 File locked:", filePath, "by user:", userId);
  setLock(filePath, userId);
};
const handleFileLockRequest = ({ filePath, projectId, requestedBy, requesterUserId }:FileLockRequest) => {
  console.log("🔑 Lock requested for", filePath, "by", requestedBy);
    const lockedByUser = useFileLockStore.getState().lockedBy[filePath];
  const currentUserId = useUserStore.getState().userId;

   if (lockedByUser !== currentUserId) return;

  // OPTIONAL: auto-accept (for testing)
  // editorSocket.emit("transferLock", {
  //   filePath,
  //   projectId,
  //   toUserId: requestedBy,
  // });

  // SHOW TOAST or UI modal
  toast.message("Edit request", {
    description: `User ${requestedBy} wants to edit this file.`,
    action: {
      label: "Transfer access",
      onClick: () => {
        editorSocket.emit("transferLock", {
          filePath,
          projectId,
          toUserId: requesterUserId,
        });
      },
    },
  });
}
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
    editorSocket.on("fileLocked", handleFileLocked);
    editorSocket.on("fileUnlocked", handleFileUnlocked);
    editorSocket.on("fileLockRequested", handleFileLockRequest);
    
    // File locking - Store updates only (no UI logic)
  
    
    editorSocket.on("error", handleError);
    // Only add debug listener in development
    if (process.env.NODE_ENV === 'development') {
      editorSocket.onAny(handleAnyEvent);
    }

    editorSocket.on('getPortSuccess',({port})=>{
      console.log("✅ Port received from server:", port);
      setPort(port);
    })
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
      editorSocket.off("fileUnlocked", handleFileUnlocked);
      editorSocket.off("fileLocked", handleFileLocked);
      editorSocket.off("fileLockRequested", handleFileLockRequest);
      editorSocket.off("error", handleError);
      
      if (process.env.NODE_ENV === 'development') {
        editorSocket.offAny(handleAnyEvent);
      }
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure,userId]);

  // ✅ User presence listeners (requires userId)
  useEffect(() => {
    if (!editorSocket || !userId) return;
      console.log("🧩 [Presence useEffect] Running with socket:", editorSocket, "userId:", userId);

    const handleUserJoinedProject = (user: UserPresenceEvent) => {
      console.log("👥 User joined project:", user);

      useProjectRoomMembersStore.getState(). addProjectRoomUser(user);
    };

    const handleUserLeftProject = (data: { 
      userId: string; 
      socketId: string;
      username?: string;
    }) => {
      console.log("👥 User left project:", data);
       useProjectRoomMembersStore.getState(). removeProjectRoomUser(data.socketId);

      
      
    };

    const handleInitialUsers = (users: Array<UserPresenceEvent>) => {
      console.log("👥 Initial users in project:", users);
      // Set initial user presence
      users.forEach(user => {
        useProjectRoomMembersStore.getState(). addProjectRoomUser(user);
      });
    };

    const handleUserJoinedFile = (user: UserPresenceEvent)=>{
      console.log("👥 User joined file:", user);
       const filePath = user.filePath;
       if(!filePath) {
        console.error("❌ User joined file event missing filePath:", user);
        return;
       }
       useFileRoomMembersStore.getState().addFileRoomUser(filePath, user);
    
    }

    const handleUserLeftFile =(data: { 
      userId: string; 
      socketId: string;
      username?: string;
      filePath: string;
    })=>{
      console.log("👥 User left file:", data);
      useFileRoomMembersStore.getState().removeFileRoomUser(data.filePath, data.userId);

    }
    const handleInitialFileUsers = (data: {
  filePath: string;
  users: Array<UserPresenceEvent>;
}) => {
  console.log("👥 Initial users in file:", data);
  useFileRoomMembersStore.getState().setUsersForFile(data.filePath, data.users);
    }
    // Register user-dependent listeners
    editorSocket.on("userJoinedProject", handleUserJoinedProject);
   
    editorSocket.on("userLeftProject", handleUserLeftProject);
    editorSocket.on("initialUsers", handleInitialUsers);
     editorSocket.on("userJoinedFile", handleUserJoinedFile);
      console.log("✅ Registered: userJoinedFile listener");
    editorSocket.on("userLeftFile", handleUserLeftFile);
    editorSocket.on("initialFileUsers", handleInitialFileUsers);

    return () => {
      editorSocket.off("userJoinedProject", handleUserJoinedProject);
      editorSocket.off("userLeftProject", handleUserLeftProject);
      editorSocket.off("initialUsers", handleInitialUsers);
       editorSocket.off("userJoinedFile", handleUserJoinedFile);
    editorSocket.off("userLeftFile", handleUserLeftFile);
    editorSocket.off("initialFileUsers", handleInitialFileUsers);
    };
  }, [editorSocket, userId]);
};