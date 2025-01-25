"use client";

import { useRecordingStore } from "@/stores/recordingStore";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AudioRecorder = () => {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");

  const handleStopRecording = async () => {
    setIsLoading(true); // 로딩 상태 시작

    try {
      // 녹음 중지 및 오디오 데이터 얻기
      const audioBlob = await stopRecording();
      if (audioBlob) {
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
        console.log("Audio URL:", audioURL);

        // 파일 업로드
        const response = await fetch(audioURL);
        const audioBlobFetched = await response.blob();
        const formData = new FormData();
        formData.append("audio", new File([audioBlobFetched], "recording.mp3"));

        const uploadResponse = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        });

        const result = await uploadResponse.json();
        if (result.url) {
          setUploadedURL(result.url);

          // 절대 경로로 변환하여 Whisper API 요청
          const absoluteUrl = new URL(result.url, window.location.origin).href;

          const whisperResponse = await axios.post("/api/whisper", {
            audioUrl: absoluteUrl, // 절대 URL로 변환하여 전달
          });

          setText(whisperResponse.data.text || "No text extracted.");
        } else {
          alert("Failed to upload recording.");
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("An error occurred while processing the recording.");
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <p>음성 녹음 후에 정지 시 바로 텍스트 추출하기</p>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`rounded px-4 py-2 ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL} className={`${isRecording ? "pointer-events-none bg-red-500 opacity-50" : "bg-blue-500"} mx-auto`} />
          <a href={audioURL} download="recording.mp3" className="mt-2 block text-blue-500 underline">
            Download Recording(내 컴퓨터/휴대폰에 저장하기)
          </a>
        </div>
      )}

      <div className="mt-10">{isLoading ? <AiOutlineLoading3Quarters className={"animate-spin text-xl"} /> : <div>{text}</div>}</div>

      <Link href={"/"} className="text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
};

export default AudioRecorder;
