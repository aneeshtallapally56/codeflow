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
  const userId = useUserStore((s) => s.userId); // ✅ reactive state

  const initialized = useRef(false);

  useEffect(() => {
    if (!editorSocket || initialized.current) return;

    initialized.current = true;

    // Common listeners that don't need userId
    editorSocket.on("readFileSuccess", (data) => {
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
    });

    editorSocket.on("writeFileSuccess", (data) => {
      editorSocket.emit("readFile", {
        pathToFileOrFolder: data.path,
      });
    });

    editorSocket.on("deleteFileSuccess", setTreeStructure);
    editorSocket.on("deleteFolderSuccess", setTreeStructure);

    editorSocket.on("fileDeleted", ({ path }) => {
      console.log("🗑️ fileDeleted broadcast:", path);
      setTreeStructure();
    });

    editorSocket.on("folderDeleted", ({ path }) => {
      console.log("📁 folderDeleted broadcast:", path);
      setTreeStructure();
    });

    editorSocket.on("fileCreated", ({ path }) => {
      console.log("🆕 fileCreated broadcast:", path);
      setTreeStructure();
    });

    editorSocket.on("folderCreated", ({ path }) => {
      console.log("📁 folderCreated broadcast:", path);
      setTreeStructure();
    });

    editorSocket.on("fileLocked", ({ pathToFile, lockedBy }) => {
      console.log("🔒 fileLocked broadcast:", pathToFile, "by", lockedBy);
  useFileLockStore.getState().addLock({ path: pathToFile, lockedBy });
});

editorSocket.on("fileUnlocked", ({ pathToFile }) => {
  useFileLockStore.getState().removeLock(pathToFile);
});

    editorSocket.onAny((event, ...args) => {
      console.log("📡 Received socket event:", event, args);
    });

    // 🧼 Cleanup on unmount
    return () => {
      editorSocket.off("readFileSuccess");
      editorSocket.off("writeFileSuccess");
      editorSocket.off("deleteFileSuccess");
      editorSocket.off("deleteFolderSuccess");
      editorSocket.off("fileDeleted");
      editorSocket.off("folderDeleted");
      editorSocket.off("fileCreated");
      editorSocket.off("folderCreated");
      editorSocket.offAny();
    };
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure]);

  // ✅ Separate effect: register user-dependent listeners once userId is ready
  useEffect(() => {
    if (!editorSocket || !userId) return;

    const handleUserJoined = (user: any) => {
      const isCurrentUser = user.userId === userId;
      useRoomMembersStore.getState().addLiveUser(user);

      if (isCurrentUser) {
        toast.success("You joined the collaboration");
      } else {
        toast(`${user.username} joined the collaboration`);
      }
    };

    const handleUserLeft = ({ userId: leftUserId, socketId }: any) => {
      useRoomMembersStore.getState().removeLiveUser(socketId);
      if (leftUserId !== userId) {
        toast(`${leftUserId} left the collaboration`);
      }
    };

    editorSocket.on("userJoined", handleUserJoined);
    editorSocket.on("userLeft", handleUserLeft);

    return () => {
      editorSocket.off("userJoined", handleUserJoined);
      editorSocket.off("userLeft", handleUserLeft);
    };
  }, [editorSocket, userId]);
};