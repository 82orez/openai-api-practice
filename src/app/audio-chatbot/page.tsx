"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaMicrophone } from "react-icons/fa6";
import { useRecordingStore } from "@/stores/recordingStore";

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({ api: "/api/chat" });
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

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

  // 오디오가 변경될 때마다 자동 재생 -> echoing 방지를 위해 다음과 같이 수정.
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

  const handleStopRecording = async () => {
    setIsProcessing(true);

    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      console.log("Audio URL:", audioURL);

      try {
        const response = await fetch(audioURL);
        const audioBlob = await response.blob();
        const formData = new FormData();
        formData.append("audio", new File([audioBlob], "recording.mp3"));

        // 서버에 오디오 업로드 요청
        const uploadResponse = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        });

        // 서버에 업로드 된 후, 해당 녹음 파일의 위치 정보가 담긴 공개 url 을 반환 받아 옮.
        const result = await uploadResponse.json();
        if (result.url) {
          // Supabase 에 업로드된 파일에서 Whisper API 로 보내서 텍스트 추출을 요청.
          const transcriptResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: JSON.stringify({ fileUrl: result.url }),
            headers: { "Content-Type": "application/json" },
          });

          // 받아온 text 를 처리.
          const transcriptResult = await transcriptResponse.json();

          if (transcriptResult.text) {
            setTranscription(transcriptResult.text);
          } else {
            alert("Failed to transcribe audio.");
          }
        } else {
          alert("Failed to save file.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert("An error occurred while processing the recording.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <div className="fixed right-8 top-20 rounded-md bg-amber-300 p-4">Audio Chatbot!</div>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`fixed right-8 top-48 rounded px-4 py-2 ${isRecording ? "animate-pulse bg-red-500" : "bg-blue-500"} text-white`}
        disabled={isProcessing}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isProcessing && <p className="mt-4 text-gray-600">Processing...</p>}

      {transcription && (
        <div className="mt-4 w-full max-w-lg rounded border bg-gray-100 p-4">
          {/*<h3 className="">Transcription:</h3>*/}
          <p className="text-center text-xl text-gray-800">{transcription}</p>
        </div>
      )}

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
                <FaMicrophone className={"text-2xl"} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
