"use client";

import useSidebarStateStore from "@/stores/sidebarStore";
import clsx from "clsx";
import { AiFillGithub, AiFillInstagram, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import IconButton from "@/components/IconButton";

export default function Sidebar() {
  const { isOpen, toggle } = useSidebarStateStore();
  return (
    <div className={clsx("fixed z-50 min-h-screen flex-col gap-6 border-r bg-white p-10 pr-6 text-base lg:flex", { hidden: !isOpen, flex: isOpen })}>
      <button className={"absolute right-5 top-5 text-3xl lg:hidden"} onClick={toggle} data-cy={"sidebarClose"}>
        <AiOutlineClose />
      </button>
      <Link href={"/"} className="w-48 text-xl font-bold text-gray-600 hover:underline" onClick={toggle}>
        Home
      </Link>

      <Link href={"/tts"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        TTS
      </Link>

      <Link href={"/recorder"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        기본 Recorder
      </Link>
      <Link href={"/record-text"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Recorder to Text
      </Link>
      <Link href={"/record-text-pronunciation"} className="w-48 font-bold text-red-400 hover:underline" onClick={toggle}>
        발음 훈련소
      </Link>

      <Link href={"/chatbot"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        기본 Chat-Bot
      </Link>

      <Link href={"/upgraded-chatbot"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Upgraded Chat-Bot
      </Link>

      <Link href={"/audio-chatbot"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Audio Chat-Bot
      </Link>

      <Link href={"/chat-plus"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Chat plus
      </Link>

      <Link href={"/role-playing"} className="w-48 font-bold text-red-400 hover:underline" onClick={toggle}>
        상황극 챗봇(입국 심사대)
      </Link>

      <Link href={"/pronunciation"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        발음 평가 챗봇
      </Link>

      <Link href={"/admin"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Admin
      </Link>

      {/*<Link href={"/"} onClick={toggle} className={"hover:underline"}>*/}
      {/*  카테고리*/}
      {/*</Link>*/}

      {/*<div className="mt-10 flex items-center gap-4">*/}
      {/*  <IconButton Icon={AiFillInstagram} component={Link} label="instagramLink" href="https://www.instagram.com/dhoonjang" target="_blank" />*/}
      {/*  <IconButton Icon={AiFillGithub} component={Link} label="githubLink" href="https://www.github.com/dhoonjang" target="_blank" />*/}
      {/*</div>*/}
    </div>
  );
}
