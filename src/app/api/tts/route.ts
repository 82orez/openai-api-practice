import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
// import { createClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const supabase = await createClient();

    const { text } = await req.json();

    // * TTS 생성
    const response = await openai.audio.speech.create({
      model: "tts-1",
      input: text,
      voice: "alloy",
      response_format: "mp3",
    });

    // * mp3 파일을 Supabase Storage 에 업로드
    const fileName = `tts-${Date.now()}.mp3`;
    const { data, error } = await supabase.storage.from("tts-audio").upload(fileName, Buffer.from(await response.arrayBuffer()), {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (error) {
      console.error(error.message);
    }

    // * supabase 에 업로드된 음성 파일의 공개 url 가져오기
    const { data: publicUrlData } = supabase.storage.from("tts-audio").getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      message: "Audio file created successfully!",
      fileUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate audio" }, { status: 500 });
  }
}
