import OpenAI from "openai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// * GET 요청으로 처리하는 부분.
export async function GET(request: Request) {
  const speechFile = path.resolve("./speech.mp3");

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "Today is a wonderful day to build something people love!",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  return NextResponse.json("Success!");
}
