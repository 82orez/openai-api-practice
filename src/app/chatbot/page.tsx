"use client";

import { useChat } from "ai/react";
import Link from "next/link";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({ api: "/api/chat" });

  // 마지막 메시지 추출
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastText = lastMessage?.role === "assistant" ? lastMessage.content : "";

  // 상태를 추가하여 lastText 업데이트 감지
  const [processedText, setProcessedText] = useState("");

  useEffect(() => {
    if (lastText && lastText !== processedText) {
      setProcessedText(lastText);
      sendTextToServer(lastText);
    }
  }, [lastText]);

  const sendTextToServer = async (text: string) => {
    try {
      await axios.post("/api/tts", { text });
      console.log("TTS request sent successfully");
    } catch (error) {
      console.error("Error sending TTS request", error);
    }
  };

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
          {lastText && (
            <div className="mt-2 rounded-lg bg-green-200 p-2 text-center">
              <strong>Last Response:</strong> {lastText}
            </div>
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
