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
    input:
      "The Road Not Taken\n" +
      "By Robert Frost\n" +
      "\n" +
      "Two roads diverged in a yellow wood,\n" +
      "And sorry I could not travel both\n" +
      "And be one traveler, long I stood\n" +
      "And looked down one as far as I could\n" +
      "To where it bent in the undergrowth;\n" +
      "\n" +
      "Then took the other, as just as fair,\n" +
      "And having perhaps the better claim,\n" +
      "Because it was grassy and wanted wear;\n" +
      "Though as for that the passing there\n" +
      "Had worn them really about the same,\n" +
      "\n" +
      "And both that morning equally lay\n" +
      "In leaves no step had trodden black.\n" +
      "Oh, I kept the first for another day!\n" +
      "Yet knowing how way leads on to way,\n" +
      "I doubted if I should ever come back.\n" +
      "\n" +
      "I shall be telling this with a sigh\n" +
      "Somewhere ages and ages hence:\n" +
      "Two roads diverged in a wood, and I—\n" +
      "I took the one less traveled by,\n" +
      "And that has made all the difference.",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  return NextResponse.json("Success!");
}
