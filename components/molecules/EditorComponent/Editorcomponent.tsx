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
  const { editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent } = useEditorSocketStore();
  const { userId } = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { lockedBy } = useFileLockStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const currentFilePath = activeFileTab?.path || "";
  const projectId = extractProjectId(currentFilePath);

  // 🧠 Extract project ID from full path
  function extractProjectId(fullPath: string) {
    const segments = fullPath.split("/");
    const index = segments.indexOf("generated-projects");
    return index !== -1 && segments[index + 1] ? segments[index + 1] : "";
  }

  // 🔒 Lock status
  const currentLock = lockedBy[currentFilePath];
  const isLockedByMe = currentLock === userId;
  const isLockedByOther = currentLock && currentLock !== userId;
  const isUnlocked = !currentLock;

  // 🔁 Handle switching between files
    useEffect(() => {
    if (!editorSocket || !currentFilePath || !projectId) return;

    const prevPath = window.__lastJoinedFilePath;

    // Leave previous file room if needed
    if (prevPath && prevPath !== currentFilePath) {
      const prevProjectId = extractProjectId(prevPath);
      emitLeaveFileRoom(prevProjectId, prevPath);
    }

    // Always rejoin the room and clear previous file members
    useFileRoomMembersStore.getState().clearFileRoomUsers();
    emitJoinFileRoom(projectId, currentFilePath);
    window.__lastJoinedFilePath = currentFilePath;

    return () => {
      emitLeaveFileRoom(projectId, currentFilePath);
      window.__lastJoinedFilePath = null;
    };
  }, [currentFilePath, editorSocket]);

  // 📝 Handle user typing in editor
  function handleChange(value: string | undefined) {
    if (!editorSocket || !currentFilePath || !projectId || !activeFileTab || !value) return;
    if (value.trim() === "// No file selected") return;

    const currentLock = lockedBy[currentFilePath];
    
    // If unlocked, try to lock it
    if (!currentLock) {
      emitSocketEvent("lockFile", {
        filePath: currentFilePath,
        projectId,
        userId,
      });
      // Continue with the edit - the lock should be granted immediately
    }
    
    // Only allow edits if I own the lock or file is unlocked
    if (currentLock && currentLock !== userId) {
      return; // Someone else has the lock
    }

    updateFileContent(currentFilePath, value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      emitSocketEvent("writeFile", {
        data: value,
        filePath: currentFilePath,
        projectId,
      });
    }, 1000);
  }

  // 🧼 Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (currentFilePath && editorSocket) {
        emitSocketEvent("unlockFile", { projectId, filePath: currentFilePath });
      }
    };
  }, [currentFilePath, editorSocket]);

  // 🧠 Determine language by file extension
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
              🔒 Another user is editing this file.
            </div>
          )}

          {/* 🧠 Editor */}
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