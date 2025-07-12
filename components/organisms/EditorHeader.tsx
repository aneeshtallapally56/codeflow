// components/EditorHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {

  Wand2,
  Wrench,
  ChevronRight,
  LogOut,
  LoaderCircle,

  DownloadCloudIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useProjectById } from "@/hooks/api/queries/useProjectById";
import { useParams } from "next/navigation";

import { useState } from "react";
import { TerminalDrawer } from "./DrawerForTerm/TerminalDrawer";
import { useUserStore } from "@/lib/store/userStore";
import { GenerateModal } from "../molecules/Modals/GenerateModal/GenerateModal";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";
import {  useFixCode } from "@/hooks/api/mutations/useAi";


export default function EditorHeader() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id; // Assuming you get the project ID from the URL params
  const { project } = useProjectById(projectId);
  const activeFileTab = useActiveFileTabStore((s) => s.activeFileTab);
  const isValid = activeFileTab && activeFileTab.value.trim().length > 0;
  const [isGenerateOpen , setIsGenerateOpen] = useState(false);
 const router = useRouter();
 const [isLeaving , setIsLeaving] = useState(false);

 const {fixCode , isPending } = useFixCode();


 const handleLeave = ()=>{
try {
  setIsLeaving(true);
  router.push("/projects");
} catch (error) {
  console.log("Error leaving project:", error);
}
finally{
  setIsLeaving(false);

}
  
 }
 function handlePreview() {
  const port = useUserStore.getState().port; 
  const url = `http://localhost:${port}`;
  window.open(url, '_blank');
}
function handleGenerateOpen(){
setIsGenerateOpen((prev) => !prev);
}
function handleDownload(){
   const url = project?.downloadUrl;
  window.open(url, '_blank');
}
const handleFixCode = async()=>{
try {
  const code = activeFileTab?.value ?? "";
  await fixCode(code );
} catch (error) {
  console.error("Error fixing code:", error);
}
}
  return (
    <div className="w-full flex justify-between items-center pt-4 flex-wrap">
       <GenerateModal
              open={isGenerateOpen} onOpenChange={setIsGenerateOpen}
              />
      <div className="flex gap-4 flex-wrap justify-between w-full items-center lg:pb-12 pb-4">
        {/* Left Section: Leave Button + Project Info */}
        <div className="flex items-center gap-4">
         <button
  onClick={handleLeave}
  className="text-zinc-500 hover:text-zinc-400 text-base transition-all ease-out duration-300 flex items-center gap-2 rounded-full border border-zinc-500 hover:border-zinc-400 w-fit px-4 py-2"
  disabled={isLeaving}
>
  {isLeaving ? (
    <>
      <LoaderCircle className="w-4 h-4 animate-spin" />
      <span>Leaving...</span>
    </>
  ) : (
    <>
      <LogOut className="w-4 h-4" />
      <span>Leave</span>
    </>
  )}
</button>

          <div className="flex items-center gap-4 font-bold">
            <h1 className="text-zinc-400 text-2xl tracking-tight font-semibold">
              {project.title}
            </h1>
            <button className="text-zinc-400 px-4 py-2 rounded border border-zinc-800 capitalize cursor-not-allowed">
              {project.type}
            </button>
             <Tooltip delayDuration={100} >
              <TooltipTrigger asChild>
               <button onClick={handleDownload} className=" text-zinc-400 px-4 py-2  rounded-full border border-zinc-800  hover:text-zinc-400 text-base transition-all ease-out duration-300  hover:border-zinc-400  ">
              <DownloadCloudIcon className="w-4 h-4 " />
            </button>
            </TooltipTrigger>
              <TooltipContent side="right">
    <p className="text-zinc-500">Download Project</p>
  </TooltipContent>
            </Tooltip>
          </div>
        </div>
    
        {/* Right Section: Generate, Fix, Run */}
        <div className="flex gap-4 flex-wrap">
          <TerminalDrawer   />
          <Button
            variant="outline"
            onClick={handleGenerateOpen}
            disabled={!isValid}
            className="border-purple-600 bg-transparent hover:bg-gradient-to-br from-purple-500 to-purple-600 text-purple-600 font-semibold hover:text-zinc-300"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </Button>

          <Button
            variant="outline"
            disabled={!isValid}
            onClick = {handleFixCode}
            className="border-blue-500 bg-transparent hover:bg-blue-950 text-blue-500 hover:text-blue-500"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Fix
          </Button>

          <div className="flex">
            <Button  onClick={handlePreview}  className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold opacity-90 hover:opacity-100 rounded-l-lg rounded-r-none hover:text-inherit">
              Preview
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-950 opacity-70 hover:opacity-100 rounded-l-none px-2  hover:text-blue-500"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
