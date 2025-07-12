import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  CopyCheck,
  LoaderCircle,
  SquareArrowLeft,
  Trash,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useUserStore } from "@/lib/store/userStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useState } from "react";

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
  };
  isDeletePending?: boolean;
  isLeavePending?: boolean;
  onDelete: (projectId: string) => Promise<void>;
  onLeave: (projectId: string) => Promise<void>;
}

export const ProjectCard = ({
  title,
  createdAt,
  user,
  members,
  projectId,
  onDelete,
  onLeave,

}: ProjectCardProps) => {
  const formattedDate = new Date(createdAt).toDateString();
  const fallBackAvatar =
    "https://api.dicebear.com/9.x/bottts-neutral/png?seed=Felix";
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter();
const [isOpening, setIsOpening] = useState(false);
  const isOwner = user._id === currentUser?.userId;
  const action = isOwner ? "Delete" : "Leave";
  const toastMessage = isOwner
    ? "Project deleted successfully!":
      "Left the project successfully!";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const handleAction = async () => {
    try {
      setIsPending(true);
      if (isOwner) {
        await onDelete(projectId);
      } else {
        await onLeave(projectId);
      }
      setIsDialogOpen(false); 
      toast(toastMessage, {
        icon: <Check className="text-green-500 w-5 h-5" />,
        className: "toast",
        unstyled: true,
      });
    } catch {
      toast(`Failed to ${action}`, {
       
        className: "toast",
        unstyled: true,
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectId);
      toast("Copied Project ID!", {
        icon: <CopyCheck className="text-green-500 w-5 h-5" />,
        className: "toast",
        unstyled: true,
      });
    } catch {
      toast("Failed to copy", {
        description: "Please try again",
        className: "toast",
        unstyled: true,
      });
    }
  };


const handleOpen = () => {
  setIsOpening(true);
  router.push(`/project/${projectId}`);
};
  return (
    <div className="bg-gradient-to-b from-[#101010] to-[#121212] border border-zinc-800 p-4 rounded-lg text-zinc-300 w-[300px] md:w-[360px]">
      <div className="flex justify-between items-center mb-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {isOwner ? (
              <Trash className="h-5 w-5 text-red-400 cursor-pointer" />
            ) : (
              <SquareArrowLeft className="h-5 w-5 text-blue-400 cursor-pointer" />
            )}
          </DialogTrigger>
          <DialogOverlay className="bg-black/50" />
          <DialogContent className="sm:rounded-lg border border-zinc-300/20 bg-[#09090B]">
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. You will permanently{" "}
                {action.toLowerCase()} this project.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 bg-transparent hover:bg-inherit hover:text-red-500 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isPending}
                className="bg-[#E33231] hover:bg-[#E33231] cursor-pointer disabled:grayscale"
                onClick={handleAction}
              >
                {isPending ? (
                  <div className="flex items-center gap-1">
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    {isOwner ? "Deleting..." : "Leaving..."}
                  </div>
                ) : (
                  action
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <Copy className="h-5 w-5 inline-block mr-1" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-zinc-400">
              Copy Project ID
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <span className="text-zinc-400 mb-2 pt-2 inline-block">members:</span>
      <div className="flex -space-x-2">
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
          {members.map((collabId, index) => (
            <Avatar key={index} className="w-[40px] h-[40px]">
              <AvatarImage
                src={collabId.avatarUrl || fallBackAvatar}
                alt={collabId.username}
              />
            </Avatar>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-col text-sm text-zinc-400">
          <div>
            <span className="text-zinc-400">Created at </span>
            <span className="px-2">{formattedDate}</span>
          </div>
          <div className="flex items-center py-1">
            <span className="text-zinc-500 pr-1">By </span>
            <Avatar className="w-[25px] h-[25px]">
              <AvatarImage
                src={user.avatarUrl || fallBackAvatar}
                alt={user.username}
              />
            </Avatar>
          </div>
        </div>

        <button
  onClick={handleOpen}
  disabled={isOpening}
  className="inline-flex items-center gap-2 text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-950 opacity-70 hover:opacity-100 bg-transparent shadow-sm h-10 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
>
  {isOpening ? (
    <>
      <LoaderCircle className="w-4 h-4 animate-spin" />
      Opening...
    </>
  ) : (
    "Open"
  )}
</button>
      </div>
    </div>
  );
};
