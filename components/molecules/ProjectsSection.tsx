"use client";
import React, { useEffect, useState } from "react";

import { Button } from "../ui/button";

import { ProjectCard } from "../organisms/ProjectCard/ProjectCard";
import axios from "axios";
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
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const endPoint = `${BASE_URL}/api/v1/projects`;
        const res = await axios.get(endPoint, {
          withCredentials: true,
        });
        console.log("Projects fetched:", res.data);
        setProjects(res.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = (projectId: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = `${BASE_URL}/api/v1/projects/${projectId}`;
    try {
      axios.delete(endpoint, {
        withCredentials: true,
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };
  return (
    <main className="w-full h-screen overflow-y-auto bg-[#050505] min-h-screen">
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
          {projects.map((project) => (
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
