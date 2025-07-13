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

    const handleWriteFileSuccess = ({ filePath }: { filePath: string }) => {

      editorSocket.emit("readFile", { filePath });
    };

    const handleFileCreated = () => {
      setTreeStructure();
    };

    const handleFileDeleted = (data: FileOperationEvent) => {
      setTreeStructure();
      setLock(data.filePath, null);
    };

    const handleFolderCreated = () => {
      setTreeStructure();
    };

    const handleFolderDeleted = () => {
      setTreeStructure();
    };

    const handleDeleteFileSuccess = () => setTreeStructure();
    const handleDeleteFolderSuccess = () => setTreeStructure();

    const handleFileUnlocked = ({ filePath }: FileUnlock) => {

      setLock(filePath, null);
    };

    const handleFileLocked = ({ filePath, userId }: FileLock) => {

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

  const { setLock } = useFileLockStore.getState();
  for (const [filePath, userId] of Object.entries(fileLocks)) {
    setLock(filePath, userId);
  }
    }
    const handleError = () => {
      console.error("❌ Socket error");
      toast.error(`Error occurred`);
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

   

    editorSocket.on("getPortSuccess", ({ port }) => {

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
     
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure, userId, setPort, setLock]);

  // ✅ Presence system
  useEffect(() => {
    if (!editorSocket || !userId) return;

    const handleUserJoinedProject = (user: UserPresenceEvent) => {

      addProjectRoomUser(user);
    };

    const handleUserLeftProject = ({ socketId }: { socketId: string }) => {

      removeProjectRoomUser(socketId);
    };

    const handleInitialUsers = (users: UserPresenceEvent[]) => {

      users.forEach(addProjectRoomUser);
    };

    const handleUserJoinedFile = (user: UserPresenceEvent) => {
      const filePath = user.filePath;
      if (!filePath) return;

      addFileRoomUser(filePath, user);
    };

    const handleUserLeftFile = ({ filePath, userId }: { filePath: string; userId: string }) => {

      removeFileRoomUser(filePath, userId);
    };

    const handleInitialFileUsers = ({ filePath, users }: { filePath: string; users: UserPresenceEvent[] }) => {

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
  }, [editorSocket, userId, addProjectRoomUser, removeProjectRoomUser, addFileRoomUser, removeFileRoomUser, setUsersForFile]);
};