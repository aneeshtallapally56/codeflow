'use client';
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FileText, Folder as FolderIcon, FolderOpen } from 'lucide-react';
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
// onDoubleClick={()=>handleDoubleClick(fileFolderData)}
export const TreeNode = ({ fileFolderData }: { fileFolderData: any }) => {
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const {editorSocket} = useEditorSocketStore();

    function toggleVisibility(nodeId: string) {
        setVisibility({
            ...visibility,
            [nodeId]: !visibility[nodeId]
        });
    }
    function handleDoubleClick(fileFolderData: any) {
        console.log("🔍 editorSocket in TreeNode", editorSocket);

    if (editorSocket?.connected) {
      console.log("📤 Emitting readFile for:", fileFolderData.path);
      editorSocket.emit('readFile', { pathToFileOrFolder: fileFolderData.path });
    } else {
      console.warn("⚠️ Socket not connected or not a file");
    }
    }

    const isExpanded = visibility[fileFolderData.name];

    return (
        fileFolderData && (
            <div className="select-none">
                {fileFolderData.children ? (
                    <>
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
                        {isExpanded && fileFolderData.children && (
                            <div className="ml-3 border-l border-gray-600/40 pl-2">
                                {fileFolderData.children.map((child: any) => (
                                    <TreeNode key={child.name} fileFolderData={child} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors duration-150 cursor-pointer group">
                        <span className="flex items-center justify-center w-4 h-4 mr-1.5">
                            {/* Empty space for alignment with folder arrows */}
                        </span>
                        <span className="flex items-center justify-center w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-300">
                            <FileText className="w-4 h-4" />
                        </span>
                        <span onClick={() => { handleDoubleClick(fileFolderData)
        
  }}  className="truncate">{fileFolderData.name}</span>
                    </div>
                )}
            </div>
        )
    );
}