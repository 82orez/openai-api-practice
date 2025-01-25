import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className={"flex flex-col gap-5"}>
      <div>openai-api-practice Home</div>

      <Link href={"/tts"}>Go to TTS! - 영어 Text 를 원어민 음성 파일로 만들기</Link>
      <Link href={"/recorder"}>Go to Recorder! - 녹음한 파일을 다운 및 업로드하기</Link>
      <Link href={"/the-original-chatbot"}>Go to the original Chatbot!</Link>
      <Link href={"/record-text"}>Go to Record To Text Page!</Link>
      <Link href={"/chatbot"}>Go to Chatbot!</Link>
      <Link href={"/whisper"}>Go to Whisper! - 오디오 파일에서 text 추출하기</Link>
    </div>
  );
}
