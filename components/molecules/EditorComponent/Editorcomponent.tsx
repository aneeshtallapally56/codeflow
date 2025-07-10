"use client";
import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";
import { useUserStore } from "@/lib/store/userStore";
import { useEditorTabStore } from "@/lib/store/editorTabStores";
import { useFileLockStore } from "@/lib/store/fileLockStore";
import { useFileRoomMembersStore } from "@/lib/store/fileRoomMemberStore";


declare global {
  interface Window {
    __lastJoinedFilePath?: string | null;
  }
}

export default function EditorComponent() {
  const updateFileContent = useEditorTabStore((state) => state.updateFileContent);
  const { editorSocket, emitSocketEvent } = useEditorSocketStore();
   const userId = useUserStore((s) => s.user?.userId);
  const { activeFileTab } = useActiveFileTabStore();
  const { lockedBy } = useFileLockStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFilePathRef = useRef<string>("");

  const currentFilePath = activeFileTab?.path || "";
  const projectId = extractProjectId(currentFilePath);

const currentLock = lockedBy[currentFilePath]; // ✅ First: safely define it
const isLockedByOther = currentLock && currentLock !== userId;

const getUsersForFile = useFileRoomMembersStore((s) => s.getUsersForFile);
const fileRoomUsers = getUsersForFile(currentFilePath);


const lockHolder = fileRoomUsers.find((u) => u.userId === currentLock);
const lockHolderName = lockHolder?.username || "Someone";

  // Update ref when active file changes
  useEffect(() => {
    currentFilePathRef.current = currentFilePath;
  }, [currentFilePath]);



  // 🧠 Extract project ID from full path
  function extractProjectId(fullPath: string) {
    const segments = fullPath.split("/");
    const index = segments.indexOf("generated-projects");
    return index !== -1 && segments[index + 1] ? segments[index + 1] : "";
  }

  // 📝 Handle user typing in editor
  function handleChange(value: string | undefined) {
    if (!editorSocket || !currentFilePath || !projectId || !activeFileTab || value == null) return;
    if (value.trim() === "// No file selected") return;

    const currentLock = useFileLockStore.getState().lockedBy[currentFilePath];

    if (!currentLock) {
      emitSocketEvent("lockFile", {
        filePath: currentFilePath,
        projectId,
      });
    }

    if (currentLock && currentLock !== userId) return;

    updateFileContent(currentFilePath, value);

    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Capture the current file path and content at the time of the change
    const filePathAtChange = currentFilePath;
    const contentAtChange = value;
    
    timerRef.current = setTimeout(() => {
      // Only emit if we're still on the same file
      if (currentFilePathRef.current === filePathAtChange) {
        emitSocketEvent("writeFile", {
          data: contentAtChange,
          filePath: filePathAtChange,
          projectId,
        });
      }
    }, 1000);
  }

  // 🧼 Cleanup timer on unmount and when switching files
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Clear timer when switching files
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [currentFilePath]);

  // 🧠 Determine Monaco language from extension
  function getLanguage(extension: string) {
    const languageMap: Record<string, string> = {
      ".js": "javascript",
      ".ts": "typescript",
      ".jsx": "javascript",
      ".tsx": "typescript",
      ".py": "python",
      ".html": "html",
      ".css": "css",
      ".json": "json",
      ".md": "markdown",
    };
    return languageMap[extension] || "plaintext";
  }

  return (
    <div className="relative">
      {activeFileTab ? (
        <>
          {isLockedByOther && (
            <div className="bg-red-100 text-red-900 text-sm p-2 px-3">
              🔒 {lockHolderName} is editing this file.
            </div>
          )}
          <Editor
            height="70vh"
            width="100%"
            theme="vs-dark"
            language={getLanguage(activeFileTab.extension || "")}
            value={activeFileTab.value}
            onChange={handleChange}
            options={{
              fontSize: 16,
              fontFamily: "Fira Code, monospace",
              minimap: { enabled: false },
              automaticLayout: true,
              readOnly: !!isLockedByOther,
              wordWrap: "on",
              smoothScrolling: true,
            }}
          />
        </>
      ) : (
        <div className="h-[70vh] w-full bg-[#1E1E1E] text-neutral-400 flex items-center justify-center">
          No file selected
        </div>
      )}
    </div>
  );
}