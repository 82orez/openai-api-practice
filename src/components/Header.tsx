"use client";

import Link from "next/link";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import useSidebarStateStore from "@/stores/sidebarStore";
import { BsRobot } from "react-icons/bs";

export default function Header() {
  const { isOpen, toggle } = useSidebarStateStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-cyan-100 px-4 lg:px-10">
      <button className={"text-2xl lg:hidden"} onClick={toggle} data-cy="sidebarToggle">
        {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <Link href="/">
        <h1 className="text-3xl font-semibold text-slate-600 lg:text-4xl">BLOG</h1>
      </Link>
      <Link href={"/search"} className={"text-2xl lg:text-3xl"} data-cy="chatbotLink">
        <BsRobot />
      </Link>
    </header>
  );
}
