"use client";

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

        // 서버에 오디오 업로드 및 텍스트 변환 요청
        const uploadResponse = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        });

        const result = await uploadResponse.json();
        if (result.url) {
          setUploadedURL(result.url);

          // Supabase에 업로드된 파일에서 Whisper API로 텍스트 추출
          const transcriptResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: JSON.stringify({ fileUrl: result.url }),
            headers: { "Content-Type": "application/json" },
          });

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
      <p>녹음한 파일을 다운 및 업로드하고 텍스트 변환</p>
      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`rounded px-4 py-2 ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}
        disabled={isProcessing}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isProcessing && <p className="mt-4 text-gray-600">Processing...</p>}

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL} className="mx-auto" />
          <a href={audioURL} download="recording.mp3" className="mt-2 block text-blue-500 underline">
            Download Recording(내 컴퓨터/휴대폰에 저장하기)
          </a>
        </div>
      )}

      {uploadedURL && (
        <div className="mt-4 text-center">
          <p className="text-green-600">File saved successfully!</p>
          <a href={uploadedURL} download className="text-blue-500 underline">
            Download from Server
          </a>
        </div>
      )}

      {transcription && (
        <div className="mt-4 w-full max-w-lg rounded border bg-gray-100 p-4">
          <h3 className="text-lg font-bold">Transcription:</h3>
          <p className="text-gray-800">{transcription}</p>
        </div>
      )}

      <Link href={"/"} className="mt-10 text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
};

export default AudioRecorder;
