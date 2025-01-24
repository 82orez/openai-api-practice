"use client";

import { useRecordingStore } from "@/stores/recordingStore";
import { useState } from "react";
import Link from "next/link";

const AudioRecorder = () => {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      console.log("Audio URL:", audioURL);
    }
  };

  const handleSaveRecording = async () => {
    if (!audioURL) return;

    try {
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      const formData = new FormData();
      formData.append("audio", new File([audioBlob], "recording.mp3"));

      const uploadResponse = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.url) {
        setUploadedURL(result.url);
        alert(`File saved at: ${result.url}`);
      } else {
        alert("Failed to record file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while saving the recording.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
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

      {audioURL && (
        <button onClick={handleSaveRecording} className="mt-4 rounded bg-green-500 px-4 py-2 text-white">
          Save Recording to Server(서버에 저장하기)
        </button>
      )}

      {uploadedURL && (
        <div className="mt-4 text-center">
          <p className="text-green-600">File saved successfully!</p>
          <a href={uploadedURL} download className="text-blue-500 underline">
            Download from Server
          </a>
        </div>
      )}

      <Link href={"/"} className="mt-10 text-blue-500 hover:underline">
        To Home!
      </Link>
    </div>
  );
};

export default AudioRecorder;
