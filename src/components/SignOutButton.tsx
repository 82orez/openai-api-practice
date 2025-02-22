"use client";

import { signOut } from "next-auth/react";
import { PiSignOut } from "react-icons/pi";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={"flex max-w-[120px] items-center justify-center gap-1 rounded-xl border-2 p-1"}>
      {isLoading ? <AiOutlineLoading3Quarters className={"animate-spin"} /> : <PiSignOut size={25} />}

      <button
        onClick={() => {
          setIsLoading(true);

          // * 로그아웃 이후 redirect 할 경로설정.
          signOut({ callbackUrl: "/" });
        }}>
        Sign Out
      </button>
    </div>
  );
}
