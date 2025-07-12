
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