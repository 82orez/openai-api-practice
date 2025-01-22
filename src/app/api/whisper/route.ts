import OpenAI from "openai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// * GET 요청으로 처리하는 부분.
export async function GET(request: Request) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("./public/uploads/recording.mp3"),
    model: "whisper-1",
  });

  console.log(transcription.text);

  return NextResponse.json(transcription.text);
}
