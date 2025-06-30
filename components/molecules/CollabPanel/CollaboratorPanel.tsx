"use client";

import { useRoomMembersStore } from "@/lib/store/roomMembersStore";
import { useUserStore } from "@/lib/store/userStore";


export const CollaboratorPanel = () => {
  const liveUsers = useRoomMembersStore((s) => s.liveUsers);
  const userId = useUserStore((s) => s.userId);
  console.log("User ID in store:", userId);
  return (
    <ul>
    {liveUsers.map((user) => (
      <li key={user.socketId}>
        {user.username} {user.userId === userId ? "(you)" : ""}
      </li>
    ))}
  </ul>

  );
};