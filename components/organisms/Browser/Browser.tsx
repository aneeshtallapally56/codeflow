import { useTreeStructureStore } from "@/lib/store/treeStructureStore"
import { useUserStore } from "@/lib/store/userStore";
import { useRef } from "react";




export const Browser = ()=>{
const {projectId} = useTreeStructureStore((state) => state);
const {port} = useUserStore((state) => state);
const browserRef = useRef<HTMLIFrameElement>(null);

if(!port){
    return <div>loading.....</div>
}

}