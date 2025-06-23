import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgePlus } from "lucide-react"

import React from 'react'
type ModalProps = {
  open: boolean
  setOpen: (value: boolean) => void
}
export default function Modal({ open, setOpen }: ModalProps) {
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-[#101010] to-[#151515] border border-zinc-800">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription className="text-left mt-4 text-sm capitalize text-zinc-500 font-medium">
              Start coding with your friends by creating a new project and start debugging with AI.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 pt-2">
            <div className="grid grid-cols-4 items-center md:gap-4 gap-16">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Title
              </label>
              <input
                id="name"
                placeholder="at least 3 characters"
                className="col-span-3 h-9 md:w-[260px] w-[160px] rounded-md border border-zinc-600 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-4 items-center md:gap-4 gap-16">
              <label htmlFor="language" className="text-sm font-medium leading-none">
                Language
              </label>
              <select
                id="language"
                className="col-span-3 h-9 md:w-[260px] w-[160px] rounded-md border border-zinc-600 bg-transparent px-3 py-1 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select Language</option>
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
                <option value="ts">TypeScript</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="submit"
              disabled
              className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold opacity-90 hover:opacity-100 transition-all ease-in duration-300"
            >
              <span className="flex gap-2 items-center">
                Create Project
                <BadgePlus />
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
