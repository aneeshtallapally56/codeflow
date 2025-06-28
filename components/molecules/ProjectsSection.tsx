"use client";
import React, { useEffect, useState } from "react";

import { Button } from "../ui/button";

import { ProjectCard } from "../organisms/ProjectCard/ProjectCard";
import axios from "axios";
import { InputModal } from "./InputModal/InputModal";
import { useDeleteProject } from "@/hooks/api/mutations/useDeleteProject";
import { useCreateProject } from "@/hooks/api/mutations/useCreateProject";
import { useProjects } from "@/hooks/api/queries/useProjects";
interface Project {
  _id: string;
  title: string;
  user: {
    _id: string;
    username: string;
  };
  collaborators: {
    _id: string;
    username: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsSection() {
 const { deleteProjectMutation } = useDeleteProject();
 const {createProjectMutation } = useCreateProject();
 const {isLoading,isError,projects} = useProjects();

 const [inputModalOpen, setInputModalOpen] = useState(false);

 if (isLoading) return <p className="text-white">Loading projects...</p>;
 if (isError) return <p className="text-red-500">Error fetching projects.</p>;

  const handleInputModal = () => {
    setInputModalOpen((prev) => !prev);
  };
  const handleDeleteProject = async (projectId:string) => {
    try {
      await deleteProjectMutation(projectId); // pass the project ID

    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

const handleCreateProject = async (name: string) => {
        try {
            await createProjectMutation({ title: name }); // pass the project
        } catch (error) {
            console.error('Error creating project:', error);
        }
   }

 
 

  return (
    <main className="w-full h-screen overflow-y-auto bg-[#050505] min-h-screen">
      {inputModalOpen && <InputModal
  open={inputModalOpen}
  onCreate={handleCreateProject}
  onClose={() => setInputModalOpen(false)}
/>}
      <div className="w-full px-4 md:px-12 py-10">
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl text-zinc-300 font-bold tracking-tight">
            My Projects
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
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
          {projects.map((project:Project) => (
            <ProjectCard
              onDelete={handleDeleteProject}
              key={project._id}
              title={project.title}
              createdAt={project.createdAt}
              projectId={project._id}
              collaborators={project.collaborators}
              user={project.user}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
