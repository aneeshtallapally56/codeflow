import { fixCode, generateResponse } from "@/lib/api/ai";
import {  useMutation } from "@tanstack/react-query";
import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";
import { useAiLoadingStore } from "@/lib/store/aiLoadingStore";

import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";
export const useAi = () => {

  const { activeFileTab, setActiveFileTab } = useActiveFileTabStore();
  const {projectId} = useTreeStructureStore((s) => s);
   const {  emitSocketEvent } = useEditorSocketStore();
    const { setGenerating } = useAiLoadingStore();
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: generateResponse,
    onMutate: () => setGenerating(true),
    onSuccess: (newCode: string) => {
      if (activeFileTab) {
        setActiveFileTab({ ...activeFileTab, value: newCode });
          emitSocketEvent("writeFile", {
          data: newCode,
          filePath: activeFileTab.path,
          projectId,
        });
      }
      setGenerating(false);
    },
    onError: (error) => {
      console.error("Error generating AI response:", error);
      setGenerating(false);
    },
  });

  return {
    generateAiResponse: mutateAsync,
    isPending,
    isSuccess,

  };
};

export const useFixCode = () => {
    const { setFixing } = useAiLoadingStore();
  const { activeFileTab, setActiveFileTab } = useActiveFileTabStore();
 const {  emitSocketEvent } = useEditorSocketStore();
   const {projectId} = useTreeStructureStore((s) => s);
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: fixCode,
    onMutate: () => setFixing(true),
    onSuccess: (fixedCode: string) => {
      if (activeFileTab) {
        setActiveFileTab({ ...activeFileTab, value: fixedCode });
         emitSocketEvent("writeFile", {
          data: fixedCode,
          filePath: activeFileTab.path,
          projectId,
        });
      }
       setFixing(false);
    },
    onError: (error) => {
      console.error("Error fixing code:", error);
       setFixing(false);
    },
  });

  return {
    fixCode: mutateAsync,
    isPending,
    isSuccess,


  };
}