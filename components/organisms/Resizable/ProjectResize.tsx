import Editorcomponent from "@/components/molecules/EditorComponent/Editorcomponent"
import { TestTree } from "@/components/molecules/TestTree/TestTree"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
 
export default function ProjectResize() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel></ResizablePanel>
    </ResizablePanelGroup>
  )
}