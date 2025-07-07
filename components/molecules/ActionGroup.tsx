
import { Button } from "../ui/button";
import { useUserStore } from "@/lib/store/userStore";

export const ActionGroup = () => {
function handlePreview() {
  const port = useUserStore.getState().port; 
  const url = `http://localhost:${port}`;
  window.open(url, '_blank');
}

  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Button variant="outline">
        <span className="text-white font-bold">+</span>
        Generate
      </Button>
      <Button variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-950">
        <span className="text-blue-500 font-bold">+</span>
        Fix
      </Button>
      <div className="flex items-center">
        <Button onClick={handlePreview} className="rounded-l-lg rounded-r-none font-bold bg-gradient-to-b from-blue-500 to-blue-600 text-white">
         Preview
        </Button>
        <Button className="rounded-l-none px-2 border-blue-500 text-blue-500 hover:bg-blue-950">
             <span className="text-white font-bold">+</span>
        </Button>
      </div>
    </div>
  );
};