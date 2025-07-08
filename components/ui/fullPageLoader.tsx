
import { LoaderCircle } from "lucide-react";

export const FullPageSpinner = () => (
  <div className="fixed inset-0 w-full h-screen flex justify-center items-center bg-background z-50">
    <LoaderCircle className="w-8 h-8 text-muted-foreground animate-spin" />
  </div>
);