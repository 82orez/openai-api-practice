import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // 파일 저장 경로 지정 (./public/recordings 폴더에 저장)
    const filePath = path.join(process.cwd(), "public", "recordings", audioFile.name);

    // 폴더가 없으면 생성
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // 파일 저장
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: `/recordings/${audioFile.name}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "File record failed" }, { status: 500 });
  }
}
