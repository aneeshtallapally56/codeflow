"use client";
import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";
import { useUserStore } from "@/lib/store/userStore";
import { useEditorTabStore } from "@/lib/store/editorTabStores";
import { useFileLockStore } from "@/lib/store/fileLockStore";

export default function EditorComponent() {
  const updateFileContent = useEditorTabStore((state) => state.updateFileContent);
  const { editorSocket, emitJoinFileRoom, emitLeaveFileRoom, emitSocketEvent } = useEditorSocketStore();
  const { userId } = useUserStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { lockedBy } = useFileLockStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef<string | null>(null);

  const currentFilePath = activeFileTab?.path || "";
  const projectId = extractProjectId(currentFilePath);

  // 🧠 Extract project ID from full path
  function extractProjectId(fullPath: string) {
    const segments = fullPath.split("/");
    const index = segments.indexOf("generated-projects");
    return index !== -1 && segments[index + 1] ? segments[index + 1] : "";
  }

  // 🔒 Lock status
  const isLockedByMe = lockedBy[currentFilePath] === userId;
  const isLockedByOther = lockedBy[currentFilePath] && lockedBy[currentFilePath] !== userId;
  const isUnlocked = !lockedBy[currentFilePath];

  // 🔁 Handle switching between files
  useEffect(() => {
    const newPath = currentFilePath;
    const oldPath = previousPathRef.current;

    if (editorSocket && newPath && newPath !== oldPath) {
      const newProjectId = extractProjectId(newPath);

      if (oldPath) {
        const oldProjectId = extractProjectId(oldPath);
        emitLeaveFileRoom(oldProjectId, oldPath);
      }

      emitJoinFileRoom(newProjectId, newPath);
      previousPathRef.current = newPath;
    }
  }, [currentFilePath, editorSocket]);

  // 📝 Handle user typing in editor
  function handleChange(value: string | undefined) {
    if (!editorSocket || !currentFilePath || !projectId || !activeFileTab || !value) return;
    if (value.trim() === "// No file selected") return;

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
          {/* 🟡 Lock info banner (optional) */}
          {isUnlocked && (
            <div className="bg-yellow-100 text-yellow-900 text-sm p-2 px-3">
              🔓 File is unlocked — click Edit to claim it.
            </div>
          )}
          {isLockedByOther && (
            <div className="bg-red-100 text-red-900 text-sm p-2 px-3">
              🔒 {lockedBy[currentFilePath] === userId ? "You" : "Another user"} is editing this file.
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
              readOnly: !isLockedByMe,
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