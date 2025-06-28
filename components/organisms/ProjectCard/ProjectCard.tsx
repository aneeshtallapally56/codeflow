import { Code, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";


interface ProjectCardProps {
  title: string;
  createdAt: string;
  projectId: string;
  collaborators: {
    _id: string;
    username: string;
  }[];
  user: {
    _id: string;
    username: string;
  };
}

export const ProjectCard = ({
  title,
  createdAt,
  user,
  collaborators,
    projectId,
  

}: ProjectCardProps) => {
 const formattedDate = new Date(createdAt).toDateString();
 console.log(title, createdAt, user, collaborators);
  return (
    <div className="bg-gradient-to-b from-[#101010] to-[#121212] border border-zinc-800 p-4 rounded-lg text-zinc-300 w-[300px] md:w-[360px]">
      <Trash2 className="h-5 w-5 text-red-400 cursor-pointer" />

      {/* Header */}
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button className="font-bold">
          <Code className="h-6 w-6" />
        </button>
      </div>

      {/* Members */}
      <span className="text-zinc-400 mb-2 pt-2 inline-block">members:</span>
      <div className="flex -space-x-2">
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
          {collaborators.map((collabId, index) => (
                <>
              <Avatar key={index} className="w-[40px] h-[40px]  ">
                 <AvatarFallback className="bg-[#050505] text-white text-sm  ">{collabId.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                 
            </Avatar>
            
                </>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-2">
        {/* Created Info */}
        <div className="flex flex-col text-sm text-zinc-400">
          <div>
            <span className="text-zinc-400">Created at </span>
            <span className="px-2">{formattedDate}</span>
          </div>
          <div className="flex items-center py-1">
            <span className="text-zinc-500 pr-1">By </span>
            <Avatar className="w-[25px] h-[25px]">
              <AvatarFallback className="bg-[#050505] text-white text-xs ">{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Open Button */}
        <Link href={`/project/${projectId}`}>
        <button className="inline-flex items-center gap-2 text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-950 opacity-70 hover:opacity-100 bg-transparent shadow-sm h-10 px-4 py-2 rounded-md">
          Open
        </button>
        </Link>
      </div>
    </div>
  )

};