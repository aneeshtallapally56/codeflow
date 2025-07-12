"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectById } from "@/hooks/api/queries/useProjectById";
import { toast } from "sonner";

import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent";
import EditorHeader from "@/components/organisms/EditorHeader";

import EditorTabs from "@/components/atoms/EditorTabs";

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { useTerminalSocketStore } from "@/lib/store/terminalSocketStore";
import { connectEditorSocket } from "@/lib/socket/editorSocketClient";
import { useSocketListeners } from "@/lib/utils/useSocketlisteners";
import { useProjectRoomMembersStore } from "@/lib/store/projectRoomMemberStore";
import { useFileRoomMembersStore } from "@/lib/store/fileRoomMemberStore";
import PresencePanel from "@/components/organisms/PresencePanel/PresencePanel";
import { CollaboratorButton } from "@/components/atoms/CollabButton/CollabButton";
import { JLoader } from "@/components/atoms/JLoader/JLoader";

import { useAiLoadingStore } from "@/lib/store/aiLoadingStore";
import axiosInstance from "@/lib/config/axios-config";

export default function Page() {
  interface ErrorWithResponse {
    response?: {
      status?: number;
    };
  }

  const hasRedirected = useRef(false);
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const router = useRouter();
  const { setEditorSocket, editorSocket, emitSocketEvent } = useEditorSocketStore();
  const { setProjectId, joinProjectRoom, setTreeStructure } = useTreeStructureStore();
  const { setTerminalSocket, setIsConnected } = useTerminalSocketStore();

  // Add loading states
  const [isSocketConnecting, setIsSocketConnecting] = useState(true);
  const [isTreeStructureLoading, setIsTreeStructureLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { project, isLoading, isError, error } = useProjectById(projectId as string);

  const handleForbidden = React.useCallback(
    (message: string) => {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        setIsRedirecting(true);
        toast.error(message);
        router.push("/projects");
      }
    },
    [router]
  );
  useEffect(() => {
  axiosInstance.get("/api/v1/auth/me")
    .then((res) => {
      console.log("✅ Authenticated user:", res.data);
      setCheckingAuth(false);
    })
    .catch(() => {
      toast.error("Please log in to access this project.");
      router.push("/login");
    });
}, []);

  // 🛡️ Redirect if unauthorized
  useEffect(() => {
    if (isError && (error as ErrorWithResponse)?.response?.status === 403) {
      handleForbidden("You're not a collaborator. Join the project to access it.");
    }
  }, [isError, error, router, handleForbidden]);

  // ✅ Attach socket listeners
  useSocketListeners();

  // 🔌 Connect editor socket
  useEffect(() => {
    if (!projectId) return;

    setIsSocketConnecting(true);
    const socket = connectEditorSocket(projectId);

    socket.on("initialUsers", (users) => {
      useProjectRoomMembersStore.getState().setProjectRoomUsers(users);
    });

    socket.on("initialFileUsers", ({ filePath, users }) => {
      useFileRoomMembersStore.getState().setUsersForFile(filePath, users);
    });

    socket.on("connect", () => {
      setEditorSocket(socket);
      setIsSocketConnecting(false);
    });

    socket.on("disconnect", () => {
      setIsSocketConnecting(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, setEditorSocket]);

  // 🔌 Connect terminal WebSocket on page render
  useEffect(() => {
    if (!projectId) return;

    const ws = new WebSocket(`ws://localhost:3002/terminal/?projectId=${projectId}`);
    setTerminalSocket(ws);

    ws.onopen = () => {

      setIsConnected(true);
      emitSocketEvent('getPort', projectId);
    };

    ws.onerror = (err) => {
      console.error('❌ Terminal WebSocket error:', err);
      setIsConnected(false);
    };

    ws.onclose = () => {

      setIsConnected(false);
    };

    return () => {
      // ✅ Close only if it's connecting or open
      if (ws.readyState === 0 || ws.readyState === 1) {
        ws.close();
      }
      setTerminalSocket(null);
      setIsConnected(false);
    };
  }, [projectId, emitSocketEvent, setTerminalSocket, setIsConnected]);

  // 🔁 Join room + fetch tree when socket connects
  useEffect(() => {
    if (!projectId || !editorSocket?.connected || isLoading || isError || !project) return;

    setProjectId(projectId);
    joinProjectRoom(projectId);
    
    setIsTreeStructureLoading(true);
    setTreeStructure()
      .then(() => {
        setIsTreeStructureLoading(false);
      })
      .catch((error: ErrorWithResponse) => {
        setIsTreeStructureLoading(false);
        if (error?.response?.status === 403) {
          handleForbidden("You're not a collaborator. Join the project to access it.");
        }
      });
  }, [editorSocket, projectId, joinProjectRoom, setProjectId, setTreeStructure, router, handleForbidden, isError, isLoading, project]);

  // Check if we should show loading
  const shouldShowLoader = 
  checkingAuth ||
    !projectId || 
    isLoading || 
    isSocketConnecting || 
    isTreeStructureLoading || 
    isRedirecting ||
    (!project && !isError);

const { isFixing, isGenerating } = useAiLoadingStore();
  if (!projectId) {
    return <div className="text-red-500 p-4">Invalid or missing project ID</div>;
  }

  // Show JLoader for all loading states
  if (shouldShowLoader) {
    return <JLoader text={'Joining'}/>;
  }
  if(isFixing){
    return <JLoader text={'Fixing'}/>;
  }
  if(isGenerating){
    return <JLoader text={'Generating'}/>;
  }

  // Don't render anything if we're about to redirect due to 403
  if (isError && (error as ErrorWithResponse)?.response?.status === 403) {
    return null;
  }

  return (
    
    <div className="w-full h-full bg-[#121212] flex flex-col md:px-16 px-4 py-6 min-w-0">
      <div className="h-full">
        <EditorHeader/>
        <div className="relative">
          <section className="w-[70vw] h-[70vh]">
            <EditorTabs />
            <div className="flex-1 min-h-0 overflow-hidden mt-4">
              <Editorcomponent />
            </div>
          </section>
          <PresencePanel />
        </div>
      </div>
      <CollaboratorButton />
    </div>
  );
}