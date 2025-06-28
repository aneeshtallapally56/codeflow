'use client';

import {
  Dialog,

  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface InputModalProps {
  onCreate: (name: string) => void;
  onClose: () => void;
  open: boolean;
}

export function InputModal({ onCreate, onClose, open }: InputModalProps) {
  const [fileName, setFileName] = useState("");

  function handleSubmit() {
    if (fileName.trim()) {
      onCreate(fileName.trim());
      setFileName("");
      onClose(); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Enter project name (e.g. my-app)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}