"use client";

import axios from "axios";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useState } from "react";

export default function TTSPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={"flex flex-col justify-center gap-5"}>
      <div>TTSPage - 텍스트를 오디오 파일로</div>

      <div>
        {isLoading ? (
          <AiOutlineLoading3Quarters className={"animate-spin text-xl"} />
        ) : (
          <button
            onClick={async () => {
              setIsLoading(true);

              const res = await axios("/api/tts", {});
              const result = await res.data;
              if (result.success) {
                window.location.href = result.fileUrl;
              } else {
                alert("Failed to generate audio.");
              }

              setIsLoading(false);
              return;
            }}>
            Start making Mp3 file!
          </button>
        )}
      </div>

      <Link href={"/"}>To Home!</Link>
    </div>
  );
}
