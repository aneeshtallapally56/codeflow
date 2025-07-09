"use client";
import React, { useState } from "react";

import { Button } from "../ui/button";

import { ProjectCard } from "../organisms/ProjectCard/ProjectCard";

import  {InputModal}  from "./Modals/InputModal/InputModal";
import { useDeleteProject } from "@/hooks/api/mutations/useDeleteProject";
import { useProjects } from "@/hooks/api/queries/useProjects";

import { JoinModal } from "./Modals/JoinModal/JoinModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveProject } from "@/hooks/api/mutations/useLeaveProject";

interface Project {
  _id: string;
  title: string;
  user: {
    _id: string;
    username: string;
  };
  members: {
    _id: string;
    username: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsSection() {
  const { deleteProjectMutation  } = useDeleteProject();
  const {leaveProjectMutation } = useLeaveProject();

  const { isLoading, isError, projects } = useProjects();
 
  const [inputModalOpen, setInputModalOpen] = useState(false);
 const [joinModalOpen, setJoinModalOpen] = useState(false);

  if (isError) return <p className="text-red-500">Error fetching projects.</p>;

  const SkeletonCard = () => {
    return (
      <div className="w-[300px] h-[280px] bg-zinc-900 rounded-lg border border-zinc-800 p-6">
       
        
        <div className="mb-6">
      
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full skeleton" />
  
          </div>
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-4 w-40 mb-1 skeleton" />
          <Skeleton className="h-4 w-35 skeleton" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-4 w-32 mb-1 skeleton" />
          <Skeleton className="h-4 w-20 skeleton" />
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-9 w-16 rounded skeleton" />
        </div>
      </div>
    );
  };

  const handleInputModal = () => {
    setInputModalOpen((prev) => !prev);
  };
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectMutation(projectId); 
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };
  const handleLeaveProject = async (projectId: string) => {
    try {
      await leaveProjectMutation(projectId); 
    } catch (error) {
      console.error("Failed to leave project:", error);
    }
  };

  return (
    <main className="w-full h-screen overflow-y-auto bg-[#050505] min-h-screen">

        <InputModal
        open={inputModalOpen} onOpenChange={setInputModalOpen}
        />
      <JoinModal  open={joinModalOpen} onOpenChange={setJoinModalOpen} />
      <div className="w-full px-4 md:px-12 py-10">
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl text-zinc-300 font-bold tracking-tight">
            My Projects
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setJoinModalOpen(true)} 
              className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              Join
            </Button>
            <Button
              onClick={handleInputModal}
              variant="default"
              className=" 
         text-white 
         bg-gradient-to-b from-blue-500 to-blue-600 
         opacity-90 hover:opacity-100 
         transition-all duration-300 ease-in 
         "
            >
              New Project
            </Button>
          </div>
        </div>

        <div className="mt-8 flex gap-6 flex-wrap">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
             
            </>
          ) : projects.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h2 className="text-xl text-zinc-400">
                No projects yet... your code is still sleeping! 😴
              </h2>
              <div>

              <p className="text-zinc-500 text-sm mt-2">
                Time to wake it up with that "New Project" button 
           
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Or Join an existing project with the "Join" button!
              </p>
              </div>
            </div>
          ) : (
            projects.map((project: Project) => (
              <ProjectCard
                onLeave={handleLeaveProject}
                onDelete={handleDeleteProject}
                
                key={project._id}
                title={project.title}
                createdAt={project.createdAt}
                projectId={project._id}
                members={project.members}
                user={project.user}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}