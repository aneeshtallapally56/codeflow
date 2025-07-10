// import { BrowserTerminal } from "@/components/molecules/BrowserTerminal/BrowserTerminal"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Terminal } from "lucide-react";
import dynamic from 'next/dynamic';

const BrowserTerminal = dynamic(() => import('../../molecules/BrowserTerminal/BrowserTerminal').then(mod => mod.BrowserTerminal), {
  ssr: false,
});

export const TerminalDrawer = ()=>{
    return (
        <Drawer>
            <Tooltip delayDuration={100} >
            <TooltipTrigger asChild>
            <DrawerTrigger asChild>
                <Button variant="outline" className="text-zinc-500 hover:text-zinc-400 text-base transition-all ease-out duration-300 hover:bg-inherit  border-zinc-500 hover:border-zinc-400 "  ><Terminal /></Button>
            </DrawerTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">
    <p className="text-zinc-500">Terminal</p>
  </TooltipContent>
            </Tooltip>
            <DrawerContent className="max-h-[75vh] mt-24">
                <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
                    <DrawerHeader className="text-center pb-4 flex-shrink-0">
                        <DrawerTitle>Terminal</DrawerTitle>
                        <DrawerDescription>
                            Browser-based terminal interface
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="px-6 flex-1 min-h-0">
                        <BrowserTerminal  />
                    </div>
                    
                    <DrawerFooter className="pt-4 flex-shrink-0">
                        <div className="flex justify-center">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-32">Close</Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}