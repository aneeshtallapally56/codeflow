import { Button } from "../ui/button";
import { UserInfo } from "@/components/molecules/UserInfo";
import { ActionGroup } from "@/components/molecules/ActionGroup";
import { TerminalDrawer } from "./DrawerForTerm/TerminalDrawer";

export const TopBar = () => {
  return (
    <div className="w-full flex justify-between items-center pt-4 flex-wrap">
      <div className="flex gap-4 flex-wrap justify-between w-full items-center lg:pb-12 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <span className="text-white font-bold">+</span>
            Leave
          </Button>
          <UserInfo />
        </div>
        <TerminalDrawer   />
        <ActionGroup />
      </div>
    </div>
  );
};