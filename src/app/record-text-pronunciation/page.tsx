"use client";

// * 크게 3가지 api 가 필요
// 녹음한 내 목소리를 서버에 저장하는 api: /api/recordings
// 서버에 저장된 내 목소리 음성 파일에서 text 를 추출하는 api: /api/transcribe - whisper
// 추출된 text 를 원어민 음성 오디오 파일로 생성하는 api: /api/tts-chatbot - TTS

import { useRecordingStore } from "@/stores/recordingStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import clsx from "clsx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AudioRecorder = () => {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioURLTTS, setAudioURLTTS] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTTSProcessing, setIsTTSProcessing] = useState(false);
  // * 질문을 위한 상태 관리
  const [question, setQuestion] = useState("");
  // * 답변을 처리하기 위한 상태 관리
  const [content, setContent] = useState("");

  const [isOpenAiLoading, setIsOpenAiLoading] = useState(false);

  // Send POST request to /api/tts-chatbot when transcription changes
  useEffect(() => {
    if (transcription) {
      const sendToChatbot = async () => {
        try {
          setIsTTSProcessing(true);

          const response = await fetch("/api/tts-chatbot", {
            method: "POST",
            body: JSON.stringify({ text: transcription }),
            headers: { "Content-Type": "application/json" },
          });

          const resultTTS = await response.json();
          if (resultTTS.audioUrl) {
            setAudioURLTTS(resultTTS.audioUrl);
          } else {
            console.error("Failed to generate audio");
          }
        } catch (error) {
          console.error("Error sending transcription to chatbot:", error);
        } finally {
          setIsTTSProcessing(false);
        }
      };

      sendToChatbot();
    }
  }, [transcription]);

  // transcription 이 생성되면 question 의 상태값에 즉시 반영.
  useEffect(() => {
    if (transcription) {
      setQuestion(transcription);
    }
  }, [transcription]);

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
          // Supabase 에 업로드된 오디오 파일을 Whisper API 로 보내서 텍스트 추출을 요청.
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
      <p className={"mb-8 text-xl"}>내 목소리를 녹음하고 원어민 선생님 발음과 비교해 보세요.</p>

      <button
        onClick={() => {
          if (!isRecording) {
            setContent(""); // 녹음 시작 시 content 상태 초기화
            startRecording();
          } else {
            handleStopRecording();
          }
        }}
        className={`rounded px-4 py-2 ${isRecording ? "animate-pulse bg-red-500" : "bg-blue-500"} text-white`}
        disabled={isProcessing}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isProcessing && <p className="mt-4 text-gray-600">Processing...</p>}

      {transcription && (
        <div className={clsx("mt-4 w-full max-w-lg rounded border bg-gray-100 p-4", { hidden: isProcessing || isRecording })}>
          <p className="text-center text-xl text-gray-800">{transcription}</p>
        </div>
      )}

      <div className={isRecording ? "hidden" : ""}>
        {audioURL && (
          <div className="mt-4">
            <div>내 영어 발음 듣기</div>
            <audio controls src={audioURL} className="mx-auto" />
          </div>
        )}

        {!audioURLTTS && isProcessing && <AiOutlineLoading3Quarters className={"mx-auto my-4 animate-spin text-xl text-blue-500"} />}
        {!audioURLTTS && isTTSProcessing && <AiOutlineLoading3Quarters className={"mx-auto my-4 animate-spin text-xl text-red-400"} />}

        {audioURLTTS && (
          <div>
            {isProcessing ? (
              <AiOutlineLoading3Quarters className={"mx-auto my-4 animate-spin text-xl text-amber-700"} />
            ) : (
              <div className="mt-4">
                <div>원어민 발음과 비교해 보기</div>
                <audio controls src={audioURLTTS} className="mx-auto" />
              </div>
            )}
          </div>
        )}
      </div>

      <Link href={"/"} className="mt-10 text-blue-500 hover:underline">
        To Home!
      </Link>

      <div className={""}>
        {/* openai api 로부터 응답을 받기까지 상당 시간이 걸리므로 Loading 과정 추가 */}
        {isOpenAiLoading ? (
          <AiOutlineLoading3Quarters className={"mx-auto my-4 animate-spin text-xl text-blue-500"} />
        ) : (
          <>
            <input
              type="text"
              className={"hidden w-full rounded-md border-4 border-amber-500 p-2"}
              placeholder={"질문을 입력해 주세요."}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {audioURLTTS && !content && !isRecording && !isProcessing && !isTTSProcessing && (
              <button
                className={"rounded-md border-2 bg-amber-100 p-2"}
                onClick={async () => {
                  if (!question) {
                    alert("Please input Question!");
                    return;
                  }

                  try {
                    // 클릭하면 Loading 시작
                    setIsOpenAiLoading(true);

                    // * 질문 내용을 body 에 담아 서버에 post 요청.
                    // * 반환 받은 내용을 result 에 할당.
                    const res = await axios.post("/api/openai", {
                      question: question,
                    });
                    const result = await res.data;

                    // Loading 종료
                    setIsOpenAiLoading(false);

                    // * openai 의 답변 내용은 result(객체)의 content 에 담겨 있음.
                    setContent(result.content);
                    return result;
                  } catch (e) {
                    console.error("Error Loading page:", e);
                  }
                }}>
                AI 에게 문법 및 발음 체크하기
              </button>
            )}

            <div className={"mt-8"}>{content}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
