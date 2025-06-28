'use client';

import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Collaborator {
  userId: string;
  socketId?: string;
  name: string;
  avatar?: string | null;
}

export default function CollaboratorPanel() {
  const { projectId } = useParams();
  const { liveUsers } = useEditorSocketStore();
  const [allCollaborators, setAllCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchAllCollaborators = async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await axios.get(`${BASE_URL}/api/v1/projects/${projectId}/collaborators`, {
        withCredentials: true,
      });
      setAllCollaborators(res.data.collaborators);
    };

    fetchAllCollaborators();
  }, [projectId]);

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-2">🟢 Live Collaborators ({liveUsers.length})</h2>
      <div className="flex gap-3 mb-6 flex-wrap">
   {liveUsers.map((user)=><span key={user.name}>{user.name}</span>)}
    </div>

      {/* <h2 className="text-xl font-bold mb-2">👥 Total Collaborators ({allCollaborators.length})</h2>
      <div className="flex gap-3 flex-wrap">
        {allCollaborators.map((user) =>
  user && user.name ? (
    <div key={user.userId} className="flex items-center gap-2 opacity-80">
      <Avatar className="w-[24px] h-[24px]">
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{user.name}</span>
    </div>
  ) : null
)}
      </div> */}
      </div>
  );
}