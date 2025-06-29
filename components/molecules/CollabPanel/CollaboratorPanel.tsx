"use client";

import { useRoomMembersStore } from "@/lib/store/roomMembersStore";


export const CollaboratorPanel = () => {
  const liveUsers = useRoomMembersStore((s) => s.liveUsers);

  return (
    <div className="flex gap-2 items-center p-2">
      {liveUsers.map((user) =>
  user.userId? (
    <div key={user.userId} className="badge">
      {user.username}
    </div>
  ) : null
)}
    </div>
  );
};