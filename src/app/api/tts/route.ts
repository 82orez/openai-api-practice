import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // OpenAI API 설정
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!, // 환경 변수에서 API 키 로드
    });

    const { text } = await req.json();

    // OpenAI API 호출
    const response = await openai.audio.speech.create({
      model: "tts-1", // 사용할 TTS 모델 (필요 시 최신 모델로 변경)
      input: text,
      voice: "alloy", // 음성 종류 (alloy, echo, fable, onyx, nova, and shimmer)
      response_format: "mp3",
    });

    // 파일 저장 경로 설정
    const outputPath = path.join(process.cwd(), "public/tts", "tts.mp3");

    // 응답 스트림을 파일로 저장
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Audio file created successfully!",
      fileUrl: "/tts/tts.mp3",
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate audio" }, { status: 500 });
  }
}
