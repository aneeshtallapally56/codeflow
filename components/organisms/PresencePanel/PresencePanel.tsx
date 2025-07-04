"use client";

import { PlusCircleIcon } from "lucide-react";

import { useProjectRoomMembersStore } from "@/lib/store/projectRoomMemberStore";
import { useUserStore } from "@/lib/store/userStore";
import { useFileLockStore } from "@/lib/store/fileLockStore";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import Image from "next/image";
import { useMemo } from "react";
import { useFileRoomUsers } from "@/lib/utils/useFileRoomUsers";

export default function CollaboratorPanel() {
  const lockedBy = useFileLockStore((state) => state.lockedBy);
  const activeFileTab = useActiveFileTabStore((state) => state.activeFileTab);
  const currentFilePath = activeFileTab?.path || "";

  const emitSocketEvent = useEditorSocketStore((state) => state.emitSocketEvent);

  const fileRoomUsers = useFileRoomUsers(currentFilePath);
  const projectRoomUsers = useProjectRoomMembersStore((state) => state.projectRoomUsers);
  const currentUserId = useUserStore((state) => state.userId);

  const extractProjectId = (fullPath: string) => {
    const segments = fullPath.split("/");
    const index = segments.indexOf("generated-projects");
    return index !== -1 && segments[index + 1] ? segments[index + 1] : "";
  };

  const projectId = useMemo(() => extractProjectId(currentFilePath), [currentFilePath]);

  // Get who has the lock on the current file
  const currentFileLock = lockedBy[currentFilePath];
  const isFileLockedByMe = currentFileLock === currentUserId;
  const isFileLockedByOther = currentFileLock && currentFileLock !== currentUserId;

  return (
    <div className="fixed bottom-8 right-4 w-[300px] md:w-80 h-[80vh] bg-[#202020] border border-zinc-700 rounded shadow-lg  p-4 text-zinc-100">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-2">
        <h2 className="text-lg font-semibold">People</h2>
        <button
          type="button"
          className="flex items-center gap-1 text-zinc-400 text-sm px-3 py-1 border border-zinc-700 rounded-md hover:bg-zinc-800 transition"
        >
          Add <PlusCircleIcon className="w-5 h-5" />
        </button>
      </div>

      {/* File Members */}
      <div className="text-sm text-zinc-300 capitalize mt-3">file members</div>
      <div className="flex flex-col gap-1 pt-3 h-40 md:h-44 overflow-y-auto">
        {fileRoomUsers.map((user) => {
          const isMe = user.userId === currentUserId;
          const isThisUserLockingTheFile = currentFileLock === user.userId;

          return (
            <UserCard
              key={user.userId}
              userId={user.userId}
              name={isMe ? `${user.username} (You)` : user.username}
              imageUrl={`https://i.pravatar.cc/${user.userId}`}
              showTransfer={isFileLockedByMe && !isMe}
              showRequest={isMe && isFileLockedByOther}
              onTransferClick={() => {
                emitSocketEvent("transferLock", {
                  filePath: currentFilePath,
                  projectId,
                  toUserId: user.userId,
                });
              }}
              onRequestClick={() => {
                emitSocketEvent("requestLock", {
                  filePath: currentFilePath,
                  projectId,
                  fromUserId: currentUserId,
                });
              }}
            />
          );
        })}
      </div>

      {/* Project Members */}
      <div className="text-sm text-zinc-300 capitalize mt-3">project members</div>
      <div className="flex flex-col gap-1 pt-3 h-24 md:h-44 overflow-y-auto">
        {projectRoomUsers.map((user) => (
          <UserCard
            key={user.userId}
            userId={user.userId}
            name={user.userId === currentUserId ? `${user.username} (You)` : user.username}
            imageUrl={`https://i.pravatar.cc/${user.userId}`}
          />
        ))}
      </div>
    </div>
  );
}

type UserCardProps = {
  name: string;
  imageUrl: string;
  inactive?: boolean;
  userId: string;
  showTransfer?: boolean;
  showRequest?: boolean;
  onTransferClick?: () => void;
  onRequestClick?: () => void;
};

export function UserCard({
  name,
  imageUrl,
  inactive = false,
  showTransfer = false,
  showRequest = false,
  onTransferClick,
  onRequestClick,
}: UserCardProps) {
  return (
    <div
      className={`w-full p-2 border rounded flex items-center justify-between gap-3 ${
        inactive ? "border-zinc-700 grayscale opacity-50" : "border-zinc-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={imageUrl}
            alt={`Profile of ${name}`}
            fill
            className="rounded-full border border-zinc-700 object-cover"
            sizes="40px"
          />
        </div>
        <span className={`text-sm capitalize ${inactive ? "text-zinc-400" : "text-zinc-300"}`}>
          {name}
        </span>
      </div>

      {showTransfer && (
        <button
          onClick={onTransferClick}
          className="text-xs px-2 py-1 bg-green-600 rounded hover:bg-green-700"
        >
          Transfer
        </button>
      )}
      {showRequest && (
        <button
          onClick={onRequestClick}
          className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
        >
          Request
        </button>
      )}
    </div>
  );
}