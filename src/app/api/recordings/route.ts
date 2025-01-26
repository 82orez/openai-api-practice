import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `recording-${Date.now()}.mp3`;

    // Supabase Storage 에 파일 업로드
    const { data, error } = await supabase.storage.from("recordings").upload(fileName, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (error) {
      console.error("Upload Error:", error.message);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    // 업로드된 파일의 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from("recordings").getPublicUrl(fileName);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
