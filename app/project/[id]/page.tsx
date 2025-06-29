"use client";

import React, { useEffect , useRef} from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectById } from "@/hooks/api/queries/useProjectById";
import { toast } from "sonner";

import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent";
import { TopBar } from "@/components/organisms/TopBar";
import { CollaboratorPanel } from "@/components/molecules/CollabPanel/CollaboratorPanel";
import EditorTabs from "@/components/atoms/EditorTabs";

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { connectEditorSocket } from "@/lib/socket/editorSocketClient";
import { useSocketListeners } from "@/lib/utils/useSocketlisteners";
import { useRoomMembersStore } from "@/lib/store/roomMembersStore";

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
  const { setEditorSocket, editorSocket } = useEditorSocketStore();
  const { setProjectId, joinProjectRoom, setTreeStructure } = useTreeStructureStore();


  const { project, isLoading, isError, error } = useProjectById(projectId as string);

const handleForbidden = React.useCallback(
  (message: string) => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      toast.error(message);
      router.push("/projects");
    }
  },
  [router]
);

  // 🛡️ Redirect if unauthorized
  useEffect(() => {
   

    if (isError && (error as ErrorWithResponse)?.response?.status === 403) {
      handleForbidden("You're not a collaborator. Join the project to access it.");
    }
  }, [isError, error, router, handleForbidden]);

  // ✅ Attach socket listeners
  useSocketListeners();

  // 🔌 Connect socket
  useEffect(() => {
    if (!projectId) return;

    const socket = connectEditorSocket(projectId);

    socket.on("initialUsers", (users) => {
      useRoomMembersStore.getState().setLiveUsers(users);
    });

    socket.on("connect", () => {
      setEditorSocket(socket);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, setEditorSocket]);

  // 🔁 Join room + fetch tree when socket connects
  useEffect(() => {
    if (!projectId || !editorSocket?.connected|| isLoading ||
    isError ||
    !project) return;

    setProjectId(projectId);
    joinProjectRoom(projectId);
   
  setTreeStructure().catch((error: ErrorWithResponse) => {
    if (error?.response?.status === 403) {
     handleForbidden("You're not a collaborator. Join the project to access it.");
    }
  });
  }, [editorSocket, projectId, joinProjectRoom, setProjectId, setTreeStructure, router, handleForbidden, isError, isLoading, project]);

  if (!projectId) {
    return <div className="text-red-500 p-4">Invalid or missing project ID</div>;
  }

  if (isLoading) {
    return <div className="text-white p-4">Loading project...</div>;
  }
  if (isError && (error as ErrorWithResponse)?.response?.status === 403) {
  return null; // 
}
  return (
    <div className="w-full h-full bg-[#121212] flex flex-col md:px-16 px-4 py-6 min-w-0">
      <div className="h-full w-full flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <EditorTabs />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Editorcomponent />
        </div>
        <div className="mt-4">
          <CollaboratorPanel />
        </div>
      </div>
    </div>
  );
}