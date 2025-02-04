"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className={"max-w-[120px] rounded-xl border-2 bg-red-300 p-2"}
      onClick={() => {
        // * 로그아웃 이후 redirect 할 경로설정.
        signOut({ callbackUrl: "/" });
      }}>
      SignOut
    </button>
  );
}
