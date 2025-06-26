"use client";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FileText, Folder as FolderIcon, FolderOpen } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { InputModalBody } from "@/components/molecules/InputModal/InputModalBody"; // extract modal body into a separate component

export const TreeNode = ({ fileFolderData }: { fileFolderData: any }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { editorSocket } = useEditorSocketStore();
  const { projectId } = useTreeStructureStore();

  const toggleVisibility = (nodeId: string) => {
    setVisibility((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleDoubleClick = (fileFolderData: any) => {
    if (editorSocket?.connected) {
      editorSocket.emit("readFile", {
        pathToFileOrFolder: fileFolderData.path,
      });
    }
  };

  const handleDelete = (type: "file" | "folder", path: string) => {
    if (!editorSocket?.connected || !projectId) return;
    editorSocket.emit(type === "file" ? "deleteFile" : "deleteFolder", {
      pathToFileOrFolder: path,
      projectId,
    });
  };

  const handleCreate = (name: string) => {
    const newPath = `${fileFolderData.path}/${name}`;
    if (!editorSocket?.connected || !projectId) return;

    editorSocket.emit(createType === "file" ? "createFile" : "createFolder", {
      pathToFileOrFolder: newPath,
      projectId,
    });

    setIsDialogOpen(false); // close modal after submit
  };

  const isExpanded = visibility[fileFolderData.name];

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <form>
        <DialogContent className="sm:max-w-[425px] border-0">
          <InputModalBody
            type={createType}
            onCreate={handleCreate}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
        </form>
      </Dialog>

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
              <ContextMenuItem onClick={() => setIsDialogOpen(true) || setCreateType("file")}>
                 Create File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setIsDialogOpen(true) || setCreateType("folder")}>
                 Create Folder
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleDelete("folder", fileFolderData.path)}
                variant="destructive"
              >
                 Delete Folder
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
                onClick={() => handleDelete("file", fileFolderData.path)}
                variant="destructive"
              >
                Delete File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    </>
  );
};