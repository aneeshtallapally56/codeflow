// 'use client';

// import { useEditorTabStore } from '@/lib/store/editorTabStore';
// import { X } from 'lucide-react';
// import clsx from 'clsx';

// export default function EditorTabs() {
//   const { openTabs, activePath, setActivePath, closeFile } = useEditorTabStore();

//   return (
//     <div className="w-full bg-[#1E1E1E] border-b border-neutral-700">
//       {/* Horizontal scroll container with fixed height */}
//       <div className="w-full overflow-x-auto overflow-y-hidden h-10">
//         {/* Flex container for tabs */}
//         <div className="flex h-full min-w-fit">
//           {openTabs.map((tab) => (
//             <div
//               key={tab.path}
//               onClick={() => setActivePath(tab.path)}
//               className={clsx(
//                 "flex items-center gap-2 px-3 h-full border-r border-neutral-600 cursor-pointer shrink-0 min-w-0",
//                 activePath === tab.path
//                   ? "bg-[#2D2D30] text-white border-t-2 border-t-blue-500"
//                   : "text-gray-300 hover:bg-[#2A2D2E] border-t-2 border-t-transparent"
//               )}
//             >
//               <span className="truncate max-w-[120px] text-sm">{tab.name}</span>
//               <button
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   closeFile(tab.path);
//                 }}
//                 className="hover:text-red-400 hover:bg-neutral-600 rounded p-0.5 transition-colors opacity-60 hover:opacity-100"
//                 aria-label={`Close ${tab.name}`}
//               >
//                 <X className="w-3 h-3" />
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
