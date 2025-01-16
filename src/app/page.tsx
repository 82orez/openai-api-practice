import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className={"flex flex-col gap-5"}>
      <div>openai-api-practice Home</div>

      <Link href={"/tts"}>Go to TTS!</Link>

      <Link href={"/whisper"}>Go to Whisper!</Link>
    </div>
  );
}
