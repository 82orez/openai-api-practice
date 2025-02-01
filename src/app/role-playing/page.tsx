"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaMicrophone } from "react-icons/fa6";
import { useRecordingStore } from "@/stores/recordingStore";

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit, setInput } = useChat({ api: "/api/role-playing" });
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  // 마지막 메시지 추출
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastText = lastMessage?.role === "assistant" ? lastMessage.content : "";

  // transcription 값이 변경되면 input 창에 반영
  useEffect(() => {
    if (transcription) {
      setInput(transcription);
    }
  }, [transcription, setInput]);

  // * handleSubmit 함수가 input 의 상태값이 변경될 때 자동으로 실행됩니다.
  // 녹음을 멈춘 후 텍스트가 input 에 반영되면, 이 변경사항으로 인해 자동으로 handleSubmit 함수가 실행됩니다.
  // handleSubmit 함수는 form 제출 시(onSubmit) 실행되는 함수이므로, new Event("submit")을 전달하여 호출합니다.
  useEffect(() => {
    if (input.trim() && !isLoading) {
      handleSubmit(new Event("submit")); // 가상의 이벤트 객체를 전달
    }
  }, [input, isLoading]);

  // 메시지 준비 상태 확인 후 TTS 호출
  useEffect(() => {
    if (lastText && !isLoading) {
      generateAudio(lastText);
    }
  }, [lastText, isLoading]);

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
      // !
      setTranscription("");
    }
  };

  // 오디오가 변경될 때마다 자동 재생 (중복 재생 방지)
  useEffect(() => {
    if (audioURL) {
      // 기존 오디오 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // 새 오디오 생성 및 재생
      const newAudio = new Audio(audioURL);
      audioRef.current = newAudio;

      newAudio.oncanplaythrough = () => {
        newAudio.play().catch((err) => console.error("Audio play failed:", err));
      };

      newAudio.onended = () => {
        console.log("Audio playback finished");
        audioRef.current = null; // 오디오 종료 후 참조 제거
      };

      newAudio.onerror = () => {
        console.error("Error playing audio");
        audioRef.current = null; // 에러 발생 시 참조 제거
      };
    }

    // 컴포넌트 언마운트 시 기존 오디오 정리
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioURL]);

  // 녹음 처리
  const handleStopRecording = async () => {
    setIsProcessingRecording(true);

    const audioBlob = await stopRecording();
    if (audioBlob) {
      try {
        const formData = new FormData();
        formData.append("audio", new File([audioBlob], "recording.mp3"));

        // 서버에 오디오 업로드 요청
        const uploadResponse = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        });

        // 서버로부터 업로드 된 오디오 파일의 공개 위치 정보를 받아옴.
        const result = await uploadResponse.json();
        if (result.url) {
          // Whisper API 에게 파일의 위치를 보내고 텍스트 추출 요청.
          const transcriptResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: JSON.stringify({ fileUrl: result.url }),
            headers: { "Content-Type": "application/json" },
          });

          // 받아온 text 정보를 transcription 상태값으로 업데이트.
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
        console.error("Error processing recording:", error);
        alert("An error occurred while processing the recording.");
      } finally {
        setIsProcessingRecording(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <div className="fixed right-8 top-20 rounded-md bg-fuchsia-600 p-4 text-white">입국 심사대에서</div>

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

          {isProcessingAudio && <p className="mt-4 animate-pulse text-blue-500">Audio is being generated...</p>}

          {audioURL && (
            <div className="mt-4">
              <audio controls>
                <source src={audioURL} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* flex 를 hidden 으로 변경하여 스크린에 form 이 나타나지 않게 함. */}
          <form className="mt-4 hidden w-full" onSubmit={handleSubmit}>
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

          {isProcessingRecording && <p className="mx-auto mt-4 text-gray-600">Processing...</p>}

          {/*{transcription && (*/}
          {/*  <div className="mt-4 w-full max-w-lg rounded border bg-gray-100 p-4">*/}
          {/*    <p className="text-center text-xl text-gray-800">{transcription}</p>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/* 녹음 버튼 */}
          <button
            onClick={isRecording ? handleStopRecording : startRecording}
            className={`rounded px-4 py-3 ${isRecording ? "animate-pulse bg-red-500" : "bg-blue-500"} text-white`}
            disabled={isProcessingRecording}>
            {isRecording ? "대화 전송하기" : "대화 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
