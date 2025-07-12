"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-context-menu";

interface InputModalBodyProps {
  type: "file" | "folder";
  onCreate: (name: string) => void;
  onCancel: () => void;
}

export const InputModalBody = ({
  type,
  onCreate,

}: InputModalBodyProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onCreate(trimmedName);
    setName(""); 
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-bold">{`Create ${type === "file" ? "File" : "Folder"}`}</DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
            Enter a name for the new {type === "file" ? "file" : "folder"}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
            <div className="grid gap-3">
              <Label className="font-semibold text-sm">Name</Label>
              <Input  value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={type === "file" ? "newFile.js" : "NewFolder"} />
            </div>
          </div>
     
     <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold opacity-90 hover:opacity-100 rounded-lg  hover:text-inherit" type="submit" onClick={handleSubmit}>Create</Button>
          </DialogFooter>
    </>
  );
};