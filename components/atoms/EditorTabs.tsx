'use client';

import { X } from 'lucide-react';
import clsx from 'clsx';
import { useEditorTabStore } from '@/lib/store/editorTabStores';

export default function EditorTabs() {
  const { openTabs, activePath, setActivePath, closeFile } = useEditorTabStore();

  return (
    <div className="w-full bg-[#1E1E1E] border-b border-neutral-700 flex-shrink-0">
      {/* Scrollable container */}
      <div className="flex overflow-x-auto overflow-y-hidden h-10 min-w-0 no-scrollbar">
        {openTabs.map((tab) => (
          <div
            key={tab.path}
            onClick={() => setActivePath(tab.path)}
            className={clsx(
              "flex items-center justify-between gap-2 px-4 h-full cursor-pointer flex-shrink-0 border-r border-neutral-600 whitespace-nowrap",
              activePath === tab.path
                ? "bg-[#2D2D30] text-white border-t-2 border-t-blue-500"
                : "text-gray-300 hover:bg-[#2A2D2E] border-t-2 border-t-transparent"
            )}
            style={{ maxWidth: "200px", minWidth: "120px" }}
          >
            <span className="truncate text-sm flex-1 min-w-0">{tab.name}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeFile(tab.path);
              }}
              className="hover:text-red-400 hover:bg-neutral-600 rounded p-0.5 transition-colors opacity-60 hover:opacity-100 flex-shrink-0 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}