"use client";

// * 크게 2가지 api 가 필요
// 녹음한 내용을 서버에 저장하는 api
// 서버에 저장된 음성 파일에서 text 를 추출하는 api - whisper

import { useRecordingStore } from "@/stores/recordingStore";
import { useState } from "react";
import Link from "next/link";

const AudioRecorder = () => {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
          setUploadedURL(result.url);

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
    <div className="flex flex-col items-center p-4">
      <p className={"mb-8"}>녹음한 파일에서 텍스트 추출하기</p>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`rounded px-4 py-2 ${isRecording ? "animate-pulse bg-red-500" : "bg-blue-500"} text-white`}
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

      <Link href={"/"} className="mt-10 text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
};

export default AudioRecorder;
