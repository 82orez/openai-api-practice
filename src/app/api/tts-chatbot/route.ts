import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // OpenAI TTS를 사용하여 오디오 생성
    const response = await openai.audio.speech.create({
      model: "tts-1",
      input: text,
      voice: "alloy",
      response_format: "mp3",
    });

    // Supabase 클라이언트 초기화
    const supabase = await createClient();

    // 오디오 파일을 Supabase 스토리지에 업로드
    const fileName = `tts-${Date.now()}.mp3`;
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const { data, error } = await supabase.storage.from("tts-audio").upload(fileName, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    // Supabase 에서 파일의 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from("tts-audio").getPublicUrl(fileName);

    return NextResponse.json({ audioUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
