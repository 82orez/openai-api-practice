"use client";

import useSidebarStateStore from "@/stores/sidebarStore";
import clsx from "clsx";
import { AiFillGithub, AiFillInstagram, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import IconButton from "@/components/IconButton";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";

export default function Sidebar() {
  const { isOpen, toggle } = useSidebarStateStore();
  const { status, data } = useSession();
  console.log("status: ", status);
  console.log("data: ", data);

  return (
    <div
      className={clsx(
        "fixed left-0 top-0 z-50 h-full min-h-screen w-64 flex-col gap-6 overflow-y-auto border-r bg-white p-10 pr-6 text-base lg:flex",
        {
          hidden: !isOpen,
          flex: isOpen,
        },
      )}>
      <button className={"absolute right-5 top-5 text-3xl lg:hidden"} onClick={toggle} data-cy={"sidebarClose"}>
        <AiOutlineClose />
      </button>
      <Link href={"/"} className="w-48 text-xl font-bold text-gray-600 hover:underline" onClick={toggle}>
        Home
      </Link>

      <Link href={"/tts"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        TTS
      </Link>

      <Link href={"/recorder"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        기본 Recorder
      </Link>

      <Link href={"/record-text"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        Recorder to Text
      </Link>

      <Link href={"/record-text-pronunciation"} className="w-48 font-bold text-red-400 hover:underline" onClick={toggle}>
        발음 훈련소
      </Link>

      <Link href={"/chatbot"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        기본 Chat-Bot
      </Link>

      <Link href={"/upgraded-chatbot"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        Upgraded Chat-Bot
      </Link>

      <Link href={"/audio-chatbot"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        Audio Chat-Bot
      </Link>

      <Link href={"/chat-plus"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
        Chat plus
      </Link>

      <Link href={"/role-playing"} className="hidden w-48 font-bold text-red-400 hover:underline lg:block" onClick={toggle}>
        상황극 챗봇(입국 심사대)
      </Link>

      <Link href={"/pronunciation"} className="hidden w-48 font-medium text-gray-600 hover:underline lg:block" onClick={toggle}>
        발음 평가 챗봇
      </Link>

      <Link href={"/users/admin"} className={clsx("w-48 font-medium text-gray-600 hover:underline", { hidden: !data })} onClick={toggle}>
        Admin
      </Link>

      {/*<Link href={"/users/sign-up"} className={clsx("w-48 font-medium text-gray-600 hover:underline")} onClick={toggle}>*/}
      {/*  회원 가입*/}
      {/*</Link>*/}

      {!data && (
        <Link href={"/users/sign-in"} className="w-48 font-medium text-gray-600 hover:underline" onClick={toggle}>
          로그인
        </Link>
      )}

      {/*<div>Hello~ {data?.user.name}</div>*/}
      {/*<img src={data?.user?.image || ""} width={50} height={50} alt={data?.user?.name || ""} className={"rounded-full"} />*/}

      {/*<Link href={"/"} onClick={toggle} className={"hover:underline"}>*/}
      {/*  카테고리*/}
      {/*</Link>*/}

      {/*<div className="mt-10 flex items-center gap-4">*/}
      {/*  <IconButton Icon={AiFillInstagram} component={Link} label="instagramLink" href="https://www.instagram.com/dhoonjang" target="_blank" />*/}
      {/*  <IconButton Icon={AiFillGithub} component={Link} label="githubLink" href="https://www.github.com/dhoonjang" target="_blank" />*/}
      {/*</div>*/}

      {data && (
        <div>
          <div>Hello~ {data?.user?.email}</div>
          {/*<img src={data?.user?.image || undefined} width={50} height={50} alt={data?.user?.name || ""} className={"rounded-full"} />*/}
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
