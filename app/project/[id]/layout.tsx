// layout.tsx
"use client";
import { useState } from "react";
import { ProjectSidebar } from "@/components/molecules/ProjectSidebar";
import { Menu } from "lucide-react";

export default function layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <ProjectSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content - always full width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sidebar toggle button - only show when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-gray-800 transition-colors text-gray-400"
            style={{backgroundColor: '#1E1E1E'}}
          >
            <Menu size={20} />
          </button>
        )}

        {/* Page content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
