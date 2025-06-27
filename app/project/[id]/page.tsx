"use client";
import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent";
import { TopBar } from "@/components/organisms/TopBar";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { useParams } from "next/navigation";
import { useSocketListeners } from "@/lib/utils/useSocketlisteners";
import { InputModal } from "@/components/molecules/InputModal/InputModal";
import EditorTabs from "@/components/atoms/EditorTabs";

export default function Page() {
  const rawProjectId = useParams().id;
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  const { setEditorSocket, editorSocket } = useEditorSocketStore();
  const { setProjectId, joinProjectRoom, setTreeStructure } = useTreeStructureStore();

  // 🔌 Attach listeners globally to the socket stored in Zustand
  useSocketListeners();

  // 🔗 Establish socket connection once
  useEffect(() => {
    if (!projectId) {
      console.error("❌ No projectId in route");
      return;
    }

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/editor`, {
      query: { projectId },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setEditorSocket(socket);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err.message);
    });

    return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [projectId, setEditorSocket]);

  // 🧠 Join project room and initialize tree structure
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
    <div className="w-full h-screen bg-[#121212] flex justify-between md:px-16 px-4 py-6">
      <div className="h-full w-full">
        <TopBar />

        <Editorcomponent />

      </div>
    </div>
  );
}