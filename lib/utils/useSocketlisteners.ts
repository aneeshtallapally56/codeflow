"use client";
import { useEffect, useRef } from "react";
import path from "path";
import { toast } from "sonner";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorTabStore } from "../store/editorTabStores";
import { useRoomMembersStore } from "../store/roomMembersStore";
  


export const useSocketListeners = () => {
  const { editorSocket } = useEditorSocketStore();
  const { setActiveFileTab } = useActiveFileTabStore();
  const { setTreeStructure } = useTreeStructureStore();
  const { openFile } = useEditorTabStore();
  const initialized = useRef(false); 

  useEffect(() => {
    if (!editorSocket || initialized.current) return;
    initialized.current = true;

    editorSocket.on("readFileSuccess", (data) => {
      console.log("✅ readFileSuccess:", data);
      const fileTab = {
        path: data.path,
        name: path.basename(data.path),
        content: data.value,
        extension: data.extension,
      };
      console.log("📂 Opening file tab:", fileTab);
      openFile(fileTab);

      setActiveFileTab({
        path: data.path,
        value: data.value,
        extension: data.extension,
      });
    });

    editorSocket.on("writeFileSuccess", (data) => {
      console.log("✅ writeFileSuccess:", data);
      editorSocket.emit("readFile", {
        pathToFileOrFolder: data.path,
      });
    });

    editorSocket.on("deleteFileSuccess", () => {
      console.log("✅ deleteFileSuccess");
      setTreeStructure();
    });

    editorSocket.on("deleteFolderSuccess", () => {
      console.log("✅ deleteFolderSuccess");
      setTreeStructure();
    });

    // Broadcasts from other tabs
    editorSocket.on("fileDeleted", ({ path }) => {
      console.log("🗑️ fileDeleted broadcast for:", path);
      setTreeStructure();
    });

    editorSocket.on("folderDeleted", ({ path }) => {
      console.log("🗂️ folderDeleted broadcast for:", path);
      setTreeStructure();
    });

    editorSocket.onAny((event, ...args) => {
      console.log("📡 Received socket event:", event, args);
    });
    editorSocket.on("fileCreated", ({ path }) => {
      console.log("🆕 fileCreated broadcast for:", path);
      setTreeStructure(); // refresh tree
    });
    editorSocket.on("folderCreated", ({ path }) => {
      console.log("📁 folderCreated broadcast for:", path);
      setTreeStructure(); // refresh tree
    });
    editorSocket.on("userJoined", ({ userId, socketId }) => {
      console.log("👤 User joined the project:", { userId, socketId });
      useRoomMembersStore.getState().addLiveUser({ userId, socketId });
      // 🔔 Optional: Show a toast or update a collaborator list
      toast.success(`${userId} joined the project`);
    });
    editorSocket.on("userLeft", ({ userId, socketId }) => {
      console.log("👤 User left the project:", { userId, socketId });
      useRoomMembersStore.getState().removeLiveUser(socketId);
      // 🔔 Optional: Show a toast or update a collaborator list
      toast(`${userId} left the project`);
    });
   
  }, [editorSocket, openFile, setActiveFileTab, setTreeStructure]);
};
