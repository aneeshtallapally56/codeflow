"use client";
import { useEffect, useRef } from "react";
import path from "path";
import { toast } from "sonner";

import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorTabStore } from "../store/editorTabStores";
import { useProjectRoomMembersStore } from "../store/projectRoomMemberStore";
import { useUserStore } from "../store/userStore";
import { useFileLockStore } from "../store/fileLockStore";
import { useFileRoomMembersStore } from "../store/fileRoomMemberStore";

// --- Event Types ---
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
  avatarUrl: string;
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
  const { setLock } = useFileLockStore();
  const { setPort } = useUserStore();

  const userId = useUserStore((s) => s.user?.userId);

  // ✅ Zustand store methods moved to top level
  const addProjectRoomUser = useProjectRoomMembersStore((s) => s.addProjectRoomUser);
  const removeProjectRoomUser = useProjectRoomMembersStore((s) => s.removeProjectRoomUser);


  const addFileRoomUser = useFileRoomMembersStore((s) => s.addFileRoomUser);
  const removeFileRoomUser = useFileRoomMembersStore((s) => s.removeFileRoomUser);
  const setUsersForFile = useFileRoomMembersStore((s) => s.setUsersForFile);

  const initialized = useRef(false);

  // ✅ File ops + locking
  useEffect(() => {
    if (!editorSocket || initialized.current) return;
    initialized.current = true;

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
      console.log("✅ File written:", data);
      editorSocket.emit("readFile", { filePath: data.filePath });
    };

    const handleFileCreated = (data: FileOperationEvent) => {
      console.log("🆕 fileCreated:", data.filePath);
      setTreeStructure();
    };

    const handleFileDeleted = (data: FileOperationEvent) => {
      console.log("🗑️ fileDeleted:", data.filePath);
      setTreeStructure();
      setLock(data.filePath, null);
    };

    const handleFolderCreated = (data: FileOperationEvent) => {
      console.log("📁 folderCreated:", data.filePath);
      setTreeStructure();
    };

    const handleFolderDeleted = (data: FileOperationEvent) => {
      console.log("📁 folderDeleted:", data.filePath);
      setTreeStructure();
    };

    const handleDeleteFileSuccess = () => setTreeStructure();
    const handleDeleteFolderSuccess = () => setTreeStructure();

    const handleFileUnlocked = ({ filePath }: FileUnlock) => {
      console.log("🔓 File unlocked:", filePath);
      setLock(filePath, null);
    };

    const handleFileLocked = ({ filePath, userId }: FileLock) => {
      console.log("🔒 File locked:", filePath, "by", userId);
      setLock(filePath, userId);
    };

    const handleFileLockRequest = ({ filePath, projectId, requestedBy, requesterUserId }: FileLockRequest) => {
      const lockedByUser = useFileLockStore.getState().lockedBy[filePath];
      const currentUserId = useUserStore.getState().user?.userId;

      if (lockedByUser !== currentUserId) return;
      const fileName = path.basename(filePath);
      toast("Edit request", {
        style:{
backgroundColor: "rgb(36, 36, 36)",
border: "1px solid rgb(59, 59, 59)",
color: "white",
        },
        description: `${requestedBy} wants to edit ${fileName}.`,
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
    };

    const handleInitialFileLocks = ({ fileLocks }: { fileLocks: Record<string, string> })=>{
      console.log("🔒 Initial file locks:", fileLocks);
  const { setLock } = useFileLockStore.getState();
  for (const [filePath, userId] of Object.entries(fileLocks)) {
    setLock(filePath, userId);
  }
    }
    const handleError = (data: { data: string }) => {
      console.error("❌ Socket error:", data);
      toast.error(`Error: ${data.data}`);
    };

    const handleAnyEvent = (event: string, ...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📡 Socket event:", event, args);
      }
    };

    // Register all socket listeners
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
    editorSocket.on("initialFileLocks", handleInitialFileLocks);
    editorSocket.on("error", handleError);

    if (process.env.NODE_ENV === "development") {
      editorSocket.onAny(handleAnyEvent);
    }

    editorSocket.on("getPortSuccess", ({ port }) => {
      console.log("✅ Port from server:", port);
      setPort(port);
    });

    // Cleanup
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
      editorSocket.off("fileLockRequested", handleFileLockRequest);
      editorSocket.off("initialFileLocks", handleInitialFileLocks);
      editorSocket.off("error", handleError);
      if (process.env.NODE_ENV === "development") {
        editorSocket.offAny(handleAnyEvent);
      }
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure, userId, setPort]);

  // ✅ Presence system
  useEffect(() => {
    if (!editorSocket || !userId) return;

    const handleUserJoinedProject = (user: UserPresenceEvent) => {
      console.log("👥 User joined project:", user);
      addProjectRoomUser(user);
    };

    const handleUserLeftProject = ({ socketId }: { userId: string; socketId: string }) => {
      console.log("👥 User left project:", socketId);
      removeProjectRoomUser(socketId);
    };

    const handleInitialUsers = (users: UserPresenceEvent[]) => {
      console.log("👥 Initial project users:", users);
      users.forEach(addProjectRoomUser);
    };

    const handleUserJoinedFile = (user: UserPresenceEvent) => {
      const filePath = user.filePath;
      if (!filePath) return;
      console.log("👥 User joined file:", user);
      addFileRoomUser(filePath, user);
    };

    const handleUserLeftFile = ({ filePath, userId }: { filePath: string; userId: string }) => {
      console.log("👥 User left file:", filePath);
      removeFileRoomUser(filePath, userId);
    };

    const handleInitialFileUsers = ({ filePath, users }: { filePath: string; users: UserPresenceEvent[] }) => {
      console.log("👥 Initial file users:", filePath);
      setUsersForFile(filePath, users);
    };

    // Register
    editorSocket.on("userJoinedProject", handleUserJoinedProject);
    editorSocket.on("userLeftProject", handleUserLeftProject);
    editorSocket.on("initialUsers", handleInitialUsers);
    editorSocket.on("userJoinedFile", handleUserJoinedFile);
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
  }, [editorSocket, userId, addProjectRoomUser, removeProjectRoomUser, addFileRoomUser, removeFileRoomUser]);
};