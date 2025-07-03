"use client";
import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";

import { useUserStore } from "@/lib/store/userStore";
import { useEditorTabStore } from "@/lib/store/editorTabStores";

export default function EditorComponent() {
  const updateFileContent = useEditorTabStore(
    (state) => state.updateFileContent
  );
  // References for timers and tracking
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);

  // Simple state variables

  // Get data from stores
  const { editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent } =
    useEditorSocketStore();
  const { userId } = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();

  // Get current file info
  const currentFilePath = activeFileTab?.path;

  // Helper function to get project ID from file path
  function extractProjectId(fullPath: string) {
    const segments = fullPath.split("/");
    const index = segments.indexOf("generated-projects");
    return index !== -1 && segments[index + 1] ? segments[index + 1] : "";
  }



  // Handle switching between files
  useEffect(() => {
    const newPath = activeFileTab?.path;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const projectId = extractProjectId(newPath);

      // Leave old file room and unlock if needed
      if (oldPath) {
        const oldProjectId = extractProjectId(oldPath);
        emitLeaveFileRoom(oldProjectId, oldPath);
      }

      // Join new file room and request lock
      emitJoinFileRoom(projectId, newPath);

      previousPathRef.current = newPath;
    }
  }, [
    activeFileTab?.path,
    editorSocket,
    emitJoinFileRoom,
    emitLeaveFileRoom,
    emitSocketEvent,
    userId,
  ]);

  // Handle when user types in editor

  function handleChange(value: string | undefined) {
  const filePath = activeFileTab?.path;
  const projectId = filePath ? extractProjectId(filePath) : '';

  if (!editorSocket || !filePath || !projectId || !activeFileTab || !value) return;

  // Don't sync placeholder
  if (value.trim() === '// No file selected') return;

  // Update local state
  updateFileContent(filePath, value);

  // Clear previous timer
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }

  // Set new debounce write
  timerRef.current = setTimeout(() => {
    emitSocketEvent('writeFile', {
      data: value,
      filePath,
      projectId,
    });
  }, 1000);
}

  // Clean up when component is destroyed
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (currentFilePath && editorSocket) {
        const projectId = extractProjectId(currentFilePath);
        emitSocketEvent("unlockFile", { projectId, filePath: currentFilePath });
      }
    };
  }, [currentFilePath, editorSocket, emitSocketEvent]);

  // Get programming language based on file extension
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
      {/* The code editor */}
      {activeFileTab ? (
      <Editor
        height="70vh"
        width="100%"
        theme="vs-dark"
        language={getLanguage(activeFileTab?.extension || "")}
  value={ activeFileTab?.value}
        onChange={handleChange}
        options={{
          fontSize: 16,
          fontFamily: "Fira Code, monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !activeFileTab,
          wordWrap: "on",
          smoothScrolling: true,
        }}
      />): (
  <div className="h-[70vh] w-full bg-[#1E1E1E] text-neutral-400 flex items-center justify-center">
    No file selected
  </div>
)}
    </div>
  );
}
