import { useFileRoomMembersStore } from "@/lib/store/fileRoomMemberStore";
import { useMemo } from "react";

export const useFileRoomUsers = (filePath: string) => {
  const usersMap = useFileRoomMembersStore((state) => state.fileRoomUsersMap);
  return useMemo(() => usersMap[filePath] || [], [usersMap, filePath]);
};