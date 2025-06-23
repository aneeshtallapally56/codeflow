
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroCTA() {
  return (
    <Link  className="font-bold tracking-tight hover:opacity-90 transition-colors relative inline-block" href="/projects">
      {/* <Button
        className="w-45 px-2 py-4  bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-[#003461] font-bold hover:opacity-80 transition-all ease-in duration-300 text-sm"
      >
        Start creating for free →
      </Button> */}
      <Button className="w-45 bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-[#003461] font-bold hover:opacity-80 transition-all ease-in duration-300  "
      >Start creating for free → </Button>
    </Link>
  );
}