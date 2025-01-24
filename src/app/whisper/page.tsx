"use client";

import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function WhisperPage() {
  const [text, setText] = useState("");

  return (
    <div className={"flex flex-col gap-5"}>
      <div>WhisperPage - 오디오 파일을 텍스트로</div>

      <div>
        <button
          onClick={async () => {
            const res = await axios("/api/whisper", {});
            const result = await res.data;
            setText(result);
            return;
          }}>
          Create a text file!
        </button>
      </div>
      <div className={clsx("border-2", { block: text.length > 0, hidden: !text })}>{text}</div>
      {/*<div>{text}</div>*/}

      <Link href={"/"} className="text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
}
