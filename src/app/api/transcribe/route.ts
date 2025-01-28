import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 오디오 파일의 위치 정보를 받아 옮.
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // 해당 녹음 파일을 다운로드하여 로컬에서 처리
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const audioBuffer = Buffer.from(response.data);

    // 임시 파일 폴더에 저장
    const tempFilePath = path.join("/tmp", `recording-${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // Whisper API 에 파일을 보내고 text 추출을 요청함.
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath), // 파일 스트림 전송
      model: "whisper-1",
      // language: "en",
    });

    // 임시로 저장했던 파일 삭제
    fs.unlinkSync(tempFilePath);

    // whisper api 가 추출한 text 를 클라이언트로 반환함.
    return NextResponse.json({ text: transcriptionResponse.text });
  } catch (error) {
    console.error("Transcription Error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
