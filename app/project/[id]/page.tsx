"use client";

import React, { useEffect } from "react";
import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent";
import { TopBar } from "@/components/organisms/TopBar";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { useParams } from "next/navigation";
import { useSocketListeners } from "@/lib/utils/useSocketlisteners";
import { connectEditorSocket } from "@/lib/socket/editorSocketClient";

import EditorTabs from "@/components/atoms/EditorTabs";

export default function Page() {
  const rawProjectId = useParams().id;
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  const { setEditorSocket, editorSocket } = useEditorSocketStore();
  const { setProjectId, joinProjectRoom, setTreeStructure } = useTreeStructureStore();

  // 🔌 Attach listeners globally
  useSocketListeners();

  // 🔗 Establish socket connection
  useEffect(() => {
    if (!projectId) {
      console.error("❌ No projectId in route");
      return;
    }
    const socket = connectEditorSocket(projectId);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setEditorSocket(socket);
    });

    return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [projectId, setEditorSocket]);

  // 🧠 Join project room + fetch tree
  useEffect(() => {
    if (!projectId || !editorSocket?.connected) return;

    console.log("🧠 Joining project room:", projectId);
    setProjectId(projectId);
    joinProjectRoom(projectId);
    setTreeStructure();
  }, [editorSocket, projectId, joinProjectRoom, setProjectId, setTreeStructure]);

  if (!projectId) {
    return <div className="text-red-500 p-4">Invalid or missing project ID</div>;
  }

  return (
    <div className="w-full h-full bg-[#121212] flex flex-col md:px-16 px-4 py-6 min-w-0">
      <div className="h-full w-full flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <EditorTabs />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Editorcomponent />
        </div>
      </div>
    </div>
  );
}