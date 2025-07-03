import { useActiveFileTabStore } from "@/lib/store/activeFileTabStore";

import { useUserStore } from "@/lib/store/userStore";

export const EditInfo = () => {

       const { activeFileTab } = useActiveFileTabStore();
        const { userId } = useUserStore();
       const currentFilePath = activeFileTab?.path;

    return(
        <div className="fixed z-[99999] top-2 md:top-6 left-1/2 -translate-x-1/2 px-8 py-2 md:py-3 min-w-[200px] hidden lg:flex items-center justify-center gap-4 rounded md:rounded-full min-h-5 bg-gradient-to-b from-[#282828] via-[#242424] to-[#282828] border border-zinc-700 text-sm text-zinc-500">
      <div className="loader" />
      <div className="">
      
        </div>
    </div>
    );
};

