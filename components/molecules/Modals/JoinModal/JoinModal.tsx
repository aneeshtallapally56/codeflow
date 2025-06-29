"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useJoinProject } from "@/hooks/api/mutations/useJoinProject";
import { toast } from "sonner";
import {  XCircle } from "lucide-react";

interface InputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinModal({ open, onOpenChange }: InputModalProps) {
  const [projectId, setProjectId] = useState("");
 const { joinProjectMutation, isPending , error } = useJoinProject();

  const handleJoin = async() => {
    if (!projectId.trim()) return;
    // perform join logic here (e.g. API call)
    try {
      await joinProjectMutation( projectId);
     toast(" ✅ Joined Project successfully!",{
      className:"toast",
      unstyled: true,
     });
       // ✅ fixed
      onOpenChange(false);
    } catch (err) {
   const error = err as { response?: { data?: { message?: string } } };
  const message =
    error?.response?.data?.message || "Failed to join project";  
      toast(` ${message}`,{
     className:"toast flex items-center justify-between gap-2",
      unstyled: true,  icon: <XCircle className="text-red-500 w-5 h-5" />,

      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed left-1/2 top-1/2 z-50 grid w-[280px] md:w-[425px] max-w-lg 
        -translate-x-1/2 -translate-y-1/2 gap-4 border border-zinc-800 
        bg-gradient-to-br from-[#101010] to-[#151515] p-6 shadow-lg 
        sm:rounded-lg duration-200"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Join Project
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 font-medium capitalize">
            To join a project, enter the join ID, which can be obtained from your friend.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-id" className="text-sm font-medium">
              Project ID
            </Label>
            <Input
              id="project-id"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter ID"
              className="col-span-3 h-9 w-[160px] md:w-[260px] rounded-md border border-zinc-600 
              bg-transparent px-3 py-1 text-base shadow-sm 
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
              disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end pt-2 flex flex-col-reverse sm:flex-row sm:space-x-2">
          <Button
            onClick={handleJoin}
            disabled={!projectId.trim() || isPending}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-zinc-100 
            shadow-lg shadow-purple-950 font-semibold hover:bg-purple-700 
            transition-all ease-in duration-300 disabled:grayscale"
          >
            {isPending?" Joining...": "Join Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}