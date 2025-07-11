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
import { Textarea } from "@/components/ui/textarea"

import { Button } from "@/components/ui/button";
import { useAi } from "@/hooks/api/mutations/useAi";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";


interface InputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
   
}

export function GenerateModal({ open, onOpenChange  }: InputModalProps) {
 const [prompt, setPrompt] = useState('');
  const isValid = prompt.trim().length >= 20;
  const { generateAiResponse, isPending } = useAi();
  const activeFileTab = useActiveFileTabStore((s) => s.activeFileTab);
const handleSubmit = async () => {
  if (!isValid || isPending) return;

  try {
    const code = activeFileTab?.value ?? ""; 
    await generateAiResponse({ prompt, code });
    setPrompt("");
    onOpenChange(false); 
  } catch (error) {
    console.error("AI generation failed", error);
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
            Enter Prompt
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 font-medium capitalize">
            Enter your prompt to generate code
            <br />
            <span className="text-xs  text-zinc-600 ">(min 20 letters)</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          
            
            <Textarea
             
            placeholder="Type your prompt here."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-transparent border  border-zinc-800 focus:border-none focus:outline-none  text-base text-white placeholder:text-muted-foreground"
            />
        
        </div>

        <DialogFooter className="sm:justify-end pt-2 flex flex-col-reverse sm:flex-row sm:space-x-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-zinc-300 shadow-lg shadow-purple-950 font-semibold hover:bg-purple-700 transition-all ease-in duration-300 disabled:grayscale"
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}