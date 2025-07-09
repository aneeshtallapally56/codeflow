"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteProjectDialog({
  onConfirm,
  todo
}: {
  onConfirm: () => void;
    todo?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="px-4 py-2">
          {todo} Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. You will permanently {todo} this
            project.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-950">
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-gradient-to-br from-red-500 to-red-600"
            onClick={onConfirm}
          >
            {todo}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}