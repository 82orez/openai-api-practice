"use client";

import { useRecordingStore } from "@/stores/recordingStore";
import { useState } from "react";
import Link from "next/link";

const AudioRecorder = () => {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      console.log(audioURL);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Link href={"/"} className={"fixed right-5 top-5 rounded-md bg-pink-300 p-4"}>
        To the Home!
      </Link>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`rounded px-4 py-2 ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL} className={`${isRecording ? "pointer-events-none bg-red-500 opacity-50" : "bg-blue-500"}`} />

          <a href={audioURL} download="recording.mp3" className="mt-2 block text-blue-500 underline">
            Download Recording
          </a>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
