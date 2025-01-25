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
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      console.log("Audio URL: ", audioURL);
    }
  };

  const handleSaveRecordingToServer = async () => {
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
      } else {
        alert("Failed to record file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while saving the recording.");
    }
  };

  const requestToWhisperServer = async () => {
    try {
      const res = await axios("/api/whisper", {});
      const result = await res.data;
      setText(result);
      return;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while making the text.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Link href={"/"} className="fixed right-5 top-5 rounded-md bg-pink-300 p-4">
        To the Home!
      </Link>

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
        <button
          onClick={async () => {
            setIsLoading(true);
            const audioBlob = await handleSaveRecordingToServer();
            const requestWhisperServer = await requestToWhisperServer();
            setIsLoading(false);
          }}
          className="mt-4 rounded bg-green-500 px-4 py-2 text-white">
          Save Recording to Server(서버에 저장하고 텍스트 생성하기)
        </button>
      )}

      <div className={"mt-10"}>{isLoading ? <AiOutlineLoading3Quarters className={"animate-spin text-xl"} /> : <div>{text}</div>}</div>
    </div>
  );
};

export default AudioRecorder;
