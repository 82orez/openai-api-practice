"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({ api: "/api/chat" });
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 마지막 메시지 추출
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastText = lastMessage?.role === "assistant" ? lastMessage.content : "";

  // 메시지 준비 상태 확인 후 TTS 호출
  useEffect(() => {
    if (lastText && !isLoading) {
      setPendingMessage(lastText);
    }
  }, [lastText, isLoading]);

  // pendingMessage 상태를 모니터링하여 TTS 요청
  useEffect(() => {
    if (pendingMessage) {
      const timer = setTimeout(() => {
        generateAudio(pendingMessage);
        setPendingMessage(null);
      }, 500); // 0.5초 지연 후 실행

      return () => clearTimeout(timer);
    }
  }, [pendingMessage]);

  // TTS 오디오 생성 및 Supabase 업로드 처리
  const generateAudio = async (text: string) => {
    setIsProcessingAudio(true);
    setAudioURL(null); // 이전 오디오를 초기화

    try {
      const response = await fetch("/api/tts-chatbot", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (result.audioUrl) {
        setAudioURL(result.audioUrl);
      } else {
        console.error("Failed to generate audio");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // 오디오가 변경될 때마다 자동 재생
  useEffect(() => {
    if (audioURL) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      const newAudioElement = new Audio(audioURL);
      newAudioElement.oncanplaythrough = () => {
        newAudioElement.play().catch((err) => console.error("Audio play failed:", err));
      };
      setAudioElement(newAudioElement);
    }
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioURL]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <div className="fixed right-8 top-20 rounded-md bg-pink-300 p-4">Upgraded Chatbot!</div>

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

          {lastText && (
            <div className="mt-2 rounded-lg bg-green-200 p-2 text-center">
              <strong>Last Response:</strong> {lastText}
            </div>
          )}

          {isProcessingAudio && <p className="mt-2 text-gray-500">Generating audio...</p>}

          {audioURL && (
            <div className="mt-4">
              <audio
                ref={(el) => {
                  audioRef.current = el;
                  if (el) setAudioElement(el);
                }}
                controls>
                <source src={audioURL} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
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
