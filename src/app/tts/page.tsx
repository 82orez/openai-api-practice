"use client";

import axios from "axios";
import Link from "next/link";

export default function TTSPage() {
  return (
    <div className={"flex flex-col justify-center gap-5"}>
      <div>TTSPage - 텍스트를 오디오 파일로</div>

      <div>
        <button
          onClick={async () => {
            const res = await axios("/api/tts", {});
            const result = await res.data;
            if (result.success) {
              window.location.href = result.fileUrl;
            } else {
              alert("Failed to generate audio.");
            }
            return;
          }}>
          Start making Mp3 file!
        </button>
      </div>

      <Link href={"/"}>To Home!</Link>
    </div>
  );
}
