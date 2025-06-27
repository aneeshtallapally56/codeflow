'use client'
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import TreeStructure from "../organisms/TreeStructure/TreeStructure";
import { X } from "lucide-react";

interface ProjectSidebarProps {
  onClose: () => void;
}

export function ProjectSidebar({ onClose }: ProjectSidebarProps) {
  const { treeStructure } = useTreeStructureStore();
  
  return (
    <div className="w-80 h-full flex flex-col relative" style={{backgroundColor: '#1E1E1E'}}>
      {/* Close button - positioned at top right */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 p-1 hover:bg-gray-800 rounded transition-colors text-gray-400"
      >
        <X size={16} />
      </button>

      {/* Sidebar content */}
      <div className="flex-1 overflow-auto">
        <TreeStructure />
      </div>
    </div>
  );
}