"use client";

import { useChat } from "ai/react";
import Link from "next/link";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({ api: "/api/chat" });

  // 상태 관리
  const [processedText, setProcessedText] = useState("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  // 메시지 응답 완료 후 TTS 요청 보내기
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // assistant의 마지막 메시지 처리
      if (lastMessage.role === "assistant" && lastMessage.content !== processedText) {
        setProcessedText(lastMessage.content);
        sendTextToServer(lastMessage.content);
      }
    }
  }, [messages, isLoading]);

  // TTS 요청을 보내고 오디오 재생 경로 설정
  const sendTextToServer = async (text: string) => {
    try {
      await axios.post("/api/tts", { text });
      console.log("TTS request sent successfully");

      // 캐시 방지를 위해 타임스탬프 추가
      const timestamp = new Date().getTime();
      setAudioSrc(`/tts/tts.mp3?timestamp=${timestamp}`);
    } catch (error) {
      console.error("Error sending TTS request", error);
    }
  };

  // 오디오 자동 재생
  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play().catch((error) => console.error("Audio play failed:", error));
    }
  }, [audioSrc]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between">
      <Link href={"/"} className={"fixed right-5 top-5 rounded-md bg-pink-300 p-4"}>
        To the Home!
      </Link>

      <div className="h-full w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="flex h-full flex-col justify-between">
          <div className="overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="mb-4 whitespace-pre-wrap">
                {m.role === "user" ? (
                  <div className={"w-fit max-w-[80%] rounded-md bg-amber-100 p-2"}>{m.content}</div>
                ) : (
                  <div className={"ml-auto w-fit max-w-[80%] rounded-md bg-blue-100 p-2"}>{m.content}</div>
                )}
              </div>
            ))}
          </div>

          {/* 마지막 응답 텍스트 출력 */}
          {processedText && (
            <div className="mt-2 rounded-lg bg-green-200 p-2 text-center">
              <strong>Last Response:</strong> {processedText}
            </div>
          )}

          {/* 오디오 컨트롤 (수동 재생 가능) */}
          {audioSrc && (
            <audio controls className="mt-4 w-full">
              <source src={audioSrc} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}

          <form className="mt-4 flex w-full" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-l-lg border border-gray-300 p-2 focus:border-blue-300 focus:outline-none focus:ring"
              placeholder="제주도 오늘의 날씨는 어때?"
              onChange={handleInputChange}
              disabled={isLoading}
              value={input}
            />

            {isLoading ? (
              <button className="min-w-fit rounded-r-lg bg-red-500 px-2 text-sm text-white" type="button">
                <AiOutlineLoading3Quarters className={"animate-spin text-xl"} />
              </button>
            ) : (
              <button className="min-w-fit cursor-pointer rounded-r-lg bg-blue-500 px-2 text-sm text-white" type="submit" disabled={!input.trim()}>
                <IoMdSend className={"text-2xl"} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
