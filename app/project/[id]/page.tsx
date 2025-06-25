// app/editor/[id]/page.tsx or similar
"use client";
import React, { useEffect } from "react";
import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent";
import { TopBar } from "@/components/organisms/TopBar";
// import TreeStructure from '@/components/organisms/TreeStructure/TreeStructure';
// import { SidebarTrigger } from '@/components/ui/sidebar';
import { io } from "socket.io-client";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useParams } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  const rawProjectId = useParams().id;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;
  const { setEditorSocket } = useEditorSocketStore();

useEffect(() => {
  const editorSocketConnection = io(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/editor`, {
    query: {
      projectId: projectId,
    },
  });

  editorSocketConnection.on("connect", () => {
    console.log("✅ Socket connected:", editorSocketConnection.id);
  });

  editorSocketConnection.on("connect_error", (err) => {
    console.error("❌ Socket connection failed:", err.message);
  });

  setEditorSocket(editorSocketConnection);

  return () => {
    editorSocketConnection.disconnect();
  };
}, [projectId, setEditorSocket]);
  return (
    <div className="w-full h-screen bg-[#121212] flex justify-between md:px-16 px-4 py-6">
      <div className="h-full w-full">
        <TopBar />
        <Editorcomponent />
      </div>
    </div>
  );
}
