import Editorcomponent from '@/components/molecules/EditorComponent/Editorcomponent'
import React from 'react'
import { TopBar } from "@/components/organisms/TopBar";

import TreeStructure from '@/components/organisms/TreeStructure/TreeStructure';
import { SidebarTrigger } from '@/components/ui/sidebar';
// import {FileTreeDemo} from '@/components/molecules/TestTree/TestTree';
export default function page({ params }: { params: { id: string } }) {
  return (
    <div className='w-full h-screen bg-[#121212] flex justify-between md:px-16 px-4 py-6'>
        <div className='h-full w-full'>
     <TopBar />
     <Editorcomponent />
      
        </div>
    </div>
  )
}
