import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";

export function CollaboratorButton() {
  return (
    <div className="fixed bottom-4 left-4 w-full flex justify-end">
      <Button variant="ghost" size="icon" className="bg-zinc-800 hover:bg-zinc-700">
        <UsersIcon className="text-zinc-300 w-6 h-6" />
        <span className="sr-only">Show collaborators</span>
      </Button>
    </div>
  );
}