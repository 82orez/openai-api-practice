"use client";

import axios from "axios";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useState } from "react";

export default function TTSPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("텍스트를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/tts", { text: text });
      const result = res.data;
      console.log(result);

      if (result.success) {
        // 새 창에서 파일 다운로드 열기
        window.open(result.fileUrl, "_blank");
      } else {
        alert("Failed to generate audio.");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("서버 요청 중 오류가 발생했습니다.");
    } finally {
      setText("");
      setIsLoading(false);
    }
  };

  return (
    <div className={"flex flex-col justify-center gap-5"}>
      <div>TTS Page - 텍스트를 오디오 파일로 만들기!</div>

      <div className={"p-4"}>
        <textarea
          className="h-32 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="텍스트를 입력하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div>
        {isLoading ? (
          <AiOutlineLoading3Quarters className={"animate-spin text-xl"} />
        ) : (
          <button onClick={handleSubmit} className="rounded-md bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600">
            Start making Mp3 file!
          </button>
        )}
      </div>

      <Link href={"/"} className="text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
}
