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
import { InputModalBody } from "@/components/molecules/Modals/InputModalBody/InputModalBody";

type TreeNodeProps = {
  fileFolderData: {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: TreeNodeProps["fileFolderData"][];
  };
};

export const TreeNode = ({ fileFolderData }: TreeNodeProps) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { emitSocketEvent } = useEditorSocketStore();
  const { projectId } = useTreeStructureStore();

  const toggleVisibility = (nodeId: string) => {
    setVisibility((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleDoubleClick = () => {
    emitSocketEvent("readFile", {
      filePath: fileFolderData.path,
    });
    
  };

  const handleDelete = () => {
    if (!projectId) return;

    const event = fileFolderData.type === "file" ? "deleteFile" : "deleteFolder";
    emitSocketEvent(event, {
      pathToFileOrFolder: fileFolderData.path,
      projectId,
    });
  };

  const handleCreate = (name: string) => {
    if (!projectId) return;

    const newPath = `${fileFolderData.path}/${name}`;
    const event = createType === "file" ? "createFile" : "createFolder";

    emitSocketEvent(event, {
      pathToFileOrFolder: newPath,
      projectId,
    });

    setIsDialogOpen(false);
  };

  const isExpanded = visibility[fileFolderData.name];

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-0">
          <InputModalBody
            type={createType}
            onCreate={handleCreate}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
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
                  {isExpanded ? <IoIosArrowDown className="w-3 h-3" /> : <IoIosArrowForward className="w-3 h-3" />}
                </span>
                <span className="flex items-center justify-center w-4 h-4 mr-2 text-blue-400">
                  {isExpanded ? <FolderOpen className="w-4 h-4" /> : <FolderIcon className="w-4 h-4" />}
                </span>
                <span className="font-medium truncate">{fileFolderData.name}</span>
              </button>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-52 bg-[#1E1E1E] text-gray-200 border-0 shadow-md">
              <ContextMenuItem onClick={() => { setCreateType("file"); setIsDialogOpen(true); }}>
                Create File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => { setCreateType("folder"); setIsDialogOpen(true); }}>
                Create Folder
              </ContextMenuItem>
              <ContextMenuItem onClick={handleDelete} variant="destructive">
                Delete Folder
              </ContextMenuItem>
            </ContextMenuContent>

            {isExpanded && (
              <div className="ml-3 border-l border-gray-600/40 pl-2">
                {fileFolderData.children.map((child) => (
                  <TreeNode key={child.path} fileFolderData={child} />
                ))}
              </div>
            )}
          </ContextMenu>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors duration-150 cursor-pointer group"
                onDoubleClick={handleDoubleClick}
              >
                <span className="flex items-center justify-center w-4 h-4 mr-1.5" />
                <span className="flex items-center justify-center w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-300">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="truncate">{fileFolderData.name}</span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-52 bg-[#1E1E1E] text-gray-200 border-0 shadow-md">
              <ContextMenuItem onClick={handleDelete} variant="destructive">
                Delete File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    </>
  );
};