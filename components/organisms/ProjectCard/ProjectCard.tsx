import {  Copy, CopyCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";



interface ProjectCardProps {
  title: string;
  createdAt: string;
  projectId: string;
  members: {
    _id: string;
    username: string;
    avatarUrl?: string;
  }[];
  user: {
    _id: string;
    username: string;
    avatarUrl?: string;

  },
 onDelete: (projectId: string) => void;
}

export const ProjectCard = ({
  title,
  createdAt,
  user,
  members,
 projectId,
  onDelete
}: ProjectCardProps) => {
 const formattedDate = new Date(createdAt).toDateString();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectId);
      toast("Copied Project ID!", {
        icon:<CopyCheck  className="text-green-500 w-5 h-5" />,
        className:"toast",
  unstyled: true,
      });
    } catch (err) {
      toast("Failed to copy", {
        description: "Please try again",
        className:"toast",
  unstyled: true,
      });
    }
  };

  
  return (
    <div className="bg-gradient-to-b from-[#101010] to-[#121212] border border-zinc-800 p-4 rounded-lg text-zinc-300 w-[300px] md:w-[360px]">
      <div className="flex justify-between items-center mb-2">
        <Trash2 onClick={()=>{
          console.log("Delete project with ID:", projectId);
          onDelete(projectId);
        }} className="h-5 w-5 text-red-400 cursor-pointer" />
        <TooltipProvider>
         <Tooltip>
    <TooltipTrigger asChild>
        <button onClick={handleCopy} className="text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer">
            <Copy className="h-5 w-5 inline-block mr-1"  />
        
         </button>
         </TooltipTrigger>
         <TooltipContent side="top" className="text-zinc-400">Copy Project ID</TooltipContent>
          </Tooltip>
          </TooltipProvider>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-semibold">{title}</h2>
       
      </div>

      {/* Members */}
      <span className="text-zinc-400 mb-2 pt-2 inline-block">members:</span>
      <div className="flex -space-x-2">
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
          {members.map((collabId, index) => (
                <>
              <Avatar key={index} className="w-[40px] h-[40px]  ">
                        <AvatarImage src={collabId.avatarUrl} alt={collabId.username} />
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
                <AvatarImage src={user.avatarUrl} alt={user.username} />
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