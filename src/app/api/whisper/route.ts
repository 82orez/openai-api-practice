import OpenAI from "openai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// * 클라이언트로부터 절대 경로를 받아 옮.
const getAbsoluteUrl = (relativePath: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return new URL(relativePath, baseUrl).href;
};

export async function POST(request: Request) {
  try {
    let { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json({ error: "Audio URL is required" }, { status: 400 });
    }

    // * 상대 경로라면 절대 경로로 변환
    if (!audioUrl.startsWith("http")) {
      audioUrl = getAbsoluteUrl(audioUrl);
    }

    // * 오디오 파일 다운로드
    const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
    const filePath = path.join(process.cwd(), "public", "uploads", "recording.mp3");

    fs.writeFileSync(filePath, Buffer.from(response.data));

    // * Whisper API 에 오디오 파일 전달
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // * 처리 후 파일 삭제
    fs.unlinkSync(filePath);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "File processing failed" }, { status: 500 });
  }
}
