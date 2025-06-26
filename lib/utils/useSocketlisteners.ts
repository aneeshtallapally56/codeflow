
import { useEffect } from "react";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useTreeStructureStore } from "../store/treeStructureStore";

let listenersInitialized = false;

export const useSocketListeners = () => {
  const { editorSocket } = useEditorSocketStore();
  const { setActiveFileTab } = useActiveFileTabStore();
  const { setTreeStructure } = useTreeStructureStore();

  useEffect(() => {
    if (!editorSocket || listenersInitialized) return;
    listenersInitialized = true;

    editorSocket.on("readFileSuccess", (data) => {
      console.log("✅ readFileSuccess:", data);
      setActiveFileTab(data.path, data.value, data.extension);
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
  }, [editorSocket]);
};