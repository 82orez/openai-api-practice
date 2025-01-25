import { AiOutlineSetting } from "react-icons/ai";
import { BsPencilSquare } from "react-icons/bs";
import Link from "next/link";
import IconButton from "@/components/IconButton";

export default function Footer() {
  return (
    <footer className="flex justify-between border-t bg-gray-400 p-4 font-medium">
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="pr-1 text-sm lg:pr-2 lg:text-base">ABOUT ME</div>
        <div className="text-xs text-gray-500 lg:text-sm">풀스택 엔지니어 TG Lee</div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="pr-1 text-sm lg:pr-2 lg:text-base">ADMIN</div>
        <IconButton Icon={AiOutlineSetting} component={Link} label="adminLink" href="/" className="text-gray-500 hover:text-gray-600" />
        <IconButton Icon={BsPencilSquare} component={Link} label="writeLink" href="/write" className="text-gray-500 hover:text-gray-600" />
      </div>
    </footer>
  );
}
