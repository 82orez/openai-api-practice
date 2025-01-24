import Image from "next/image";
import Link from "next/link";
import RecordToTextPage from "@/app/record-text/page";

export default function Home() {
  return (
    <div className={"flex flex-col gap-5"}>
      <div>openai-api-practice Home</div>

      <Link href={"/tts"}>Go to TTS!</Link>
      <Link href={"/whisper"}>Go to Whisper!</Link>
      <Link href={"/chatbot"}>Go to Chatbot!</Link>
      <Link href={"/recorder"}>Go to Recorder!</Link>
      <Link href={"/record-text"}>Go to Record To Text Page!</Link>
    </div>
  );
}
