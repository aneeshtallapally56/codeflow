import { PlusCircleIcon } from "lucide-react";
import { useFileRoomMembersStore } from "@/lib/store/fileRoomMemberStore";
import { useProjectRoomMembersStore } from "@/lib/store/projectRoomMemberStore";
export default function CollaboratorPanel() {
  const fileRoomUsers = useFileRoomMembersStore((state) => state.fileRoomUsers);
  const projectRoomUsers = useProjectRoomMembersStore((state) => state.projectRoomUsers);

  return (
    <div className="fixed bottom-8 right-4 w-[300px] md:w-80 h-[80vh] bg-[#202020] border border-zinc-700 rounded shadow-lg z-[99] p-4 text-zinc-100">
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

      {/* Current Collaborators */}
      <div className="text-sm text-zinc-300 capitalize mt-3">file members</div>
      <div className="flex flex-col gap-1 pt-3 h-40 md:h-44 overflow-y-auto">
        {fileRoomUsers.map((user) => (
          <UserCard
            key={user.userId}
            name={user.userId === currentUserId? `${user.username}  (You)` : user.username}
            imageUrl={`https://i.pravatar.cc/${user.userId}`}
          />
          
        ))}
      </div>

      {/* Other Members */}
      <div className="text-sm text-zinc-300 capitalize mt-3">project members</div>
      <div className="flex flex-col gap-1 pt-3 h-24 md:h-44 overflow-y-auto">
        {projectRoomUsers.map((user) => (
          <UserCard
            key={user.userId}
             name={user.userId === currentUserId? `${user.username}  (You)` : user.username}
           imageUrl={`https://i.pravatar.cc/${user.userId}`}
          
          />
        ))}
      </div>
    </div>
  );
}

 import Image from "next/image";
import { useUserStore } from "@/lib/store/userStore";

type UserCardProps = {
  name: string;
  imageUrl: string;
  inactive?: boolean;
};

export function UserCard({ name, imageUrl, inactive = false }: UserCardProps) {
  return (
    <div
      className={`w-full p-2 border rounded flex items-center gap-3 ${
        inactive ? "border-zinc-700 grayscale opacity-50" : "border-zinc-600"
      }`}
      aria-label={`Team member: ${name}`}
    >
      {/* Image container for fill */}
      <div className="relative w-10 h-10 shrink-0">
        <Image
          src={imageUrl}
          alt={`Profile of ${name}`}
          fill
          className="rounded-full border border-zinc-700 object-cover"
          sizes="40px"
        />
      </div>

      {/* Name */}
      <span className={`text-sm capitalize ${inactive ? "text-zinc-400" : "text-zinc-300"}`}>
        {name}
      </span>
    </div>
  );
}