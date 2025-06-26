"use client";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FileText, Folder as FolderIcon, FolderOpen } from "lucide-react";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";

export const TreeNode = ({ fileFolderData }: { fileFolderData: any }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const { editorSocket } = useEditorSocketStore();
  const {projectId} = useTreeStructureStore();
  function toggleVisibility(nodeId: string) {
    setVisibility((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }

  function handleDoubleClick(fileFolderData: any) {
    if (editorSocket?.connected) {
      console.log("📤 Emitting readFile for:", fileFolderData.path);
      editorSocket.emit("readFile", {
        pathToFileOrFolder: fileFolderData.path,
      });
    } else {
      console.warn("⚠️ Socket not connected or not a file");
    }
  }

function handleFileDelete(filePath: string) {
  console.log("Deleting file:", filePath);
  if (editorSocket?.connected && projectId) {
    editorSocket.emit("deleteFile", {
      pathToFileOrFolder: filePath,
      projectId, 
    });
  } else {
    console.warn("Socket not connected or projectId missing");
  }
}

function handleFolderDelete(folderPath: string) {
  console.log("Deleting folder:", folderPath);
  if (editorSocket?.connected) {
   editorSocket.emit("deleteFolder", {
  pathToFileOrFolder: folderPath,
  projectId,
});
  } else {
    console.warn("Socket not connected");
  }
}

  const isExpanded = visibility[fileFolderData.name];

  return (
    fileFolderData && (
      <div className="select-none">
        {fileFolderData.children ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                className="flex items-center w-full px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors duration-150 group"
                onClick={() => toggleVisibility(fileFolderData.name)}
              >
                <span className="flex items-center justify-center w-4 h-4 mr-1.5 text-gray-400 group-hover:text-gray-300">
                  {isExpanded ? (
                    <IoIosArrowDown className="w-3 h-3" />
                  ) : (
                    <IoIosArrowForward className="w-3 h-3" />
                  )}
                </span>
                <span className="flex items-center justify-center w-4 h-4 mr-2 text-blue-400">
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4" />
                  ) : (
                    <FolderIcon className="w-4 h-4" />
                  )}
                </span>
                <span className="font-medium truncate">{fileFolderData.name}</span>
              </button>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-52 bg-[#1E1E1E] text-gray-200 border-0 shadow-md">
              <ContextMenuItem
                onClick={() => console.log("📂 Rename Folder", fileFolderData.path)}
              >
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={(e) => handleFolderDelete(fileFolderData.path)}
                variant="destructive"
              >
                Delete
              </ContextMenuItem>
               <ContextMenuItem
                onClick={() => {
    const newFilePath = `${fileFolderData.path}/newfile.js`;
    editorSocket?.emit("createFile", {
      pathToFileOrFolder: newFilePath,
      projectId,
    });
  }}
              >
              Create File
              </ContextMenuItem>
               <ContextMenuItem
                 onClick={() => {
    const newFolderPath = `${fileFolderData.path}/NewFolder`;
    editorSocket?.emit("createFolder", {
      pathToFileOrFolder: newFolderPath,
      projectId,
    });
  }}
              >
                Create Folder
              </ContextMenuItem>

            </ContextMenuContent>

            {isExpanded && fileFolderData.children && (
              <div className="ml-3 border-l border-gray-600/40 pl-2">
                {fileFolderData.children.map((child: any) => (
                  <TreeNode key={child.name} fileFolderData={child} />
                ))}
              </div>
            )}
          </ContextMenu>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors duration-150 cursor-pointer group"
                onDoubleClick={() => handleDoubleClick(fileFolderData)}
              >
                <span className="flex items-center justify-center w-4 h-4 mr-1.5" />
                <span className="flex items-center justify-center w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-300">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="truncate">{fileFolderData.name}</span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-52 bg-[#1E1E1E] text-gray-200 border-0 shadow-md">
              <ContextMenuItem
                onClick={() => console.log("📄 Rename File", fileFolderData.path)}
              >
                Rename
              </ContextMenuItem>
             <ContextMenuItem
                onClick={() => handleFileDelete(fileFolderData.path)} 
                variant="destructive"
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    )
  );
};