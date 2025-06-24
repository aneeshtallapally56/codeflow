'use client'
import React from 'react'
import { Button } from '../ui/button'
import { BadgePlus, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import CreateProjectTest from '../atoms/CreateProjectTest'
export default function ProjectsSection() {
    const [open, setOpen] = React.useState(false);
  return (
    <main className='w-full overflow-auto bg-[#050505] h-screen'>
       {/* Page Content */}
      <div className="w-full h-full px-4 md:px-12 py-10">
        {/* Header */}
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl text-zinc-300 font-bold tracking-tight">
            My Projects
          </h1>
    <CreateProjectTest />
          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border border-purple-600 bg-transparent shadow-sm text-purple-600 font-semibold hover:bg-gradient-to-br from-purple-500 to-purple-600 hover:text-zinc-300 transition-all ease-out duration-100"
            >
              Join
            </Button>

            <Button
              className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold opacity-90 hover:opacity-100 transition-all ease-in duration-300"
                onClick={() => setOpen(true)}
            >
              New Project
              <Plus className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 flex gap-10 xl:justify-start justify-center w-full flex-wrap">
          <h1 className="lowercase text-zinc-500 font-medium">
            Currently, you do not have any projects.
          </h1>
        </div>
         {/* Modal */}
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
    </main>
  )
}
