import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Supabase 클라이언트 초기화
    const supabase = await createClient();
    console.log("Supabase client created successfully.");

    // Supabase 스토리지에서 파일 목록 가져오기
    const { data: files, error } = await supabase.storage.from("tts-audio").list();

    if (error) {
      console.error("Error fetching files:", error.message);
      return NextResponse.json({ error: `Error fetching files: ${error.message}` }, { status: 500 });
    }

    if (!files || files.length === 0) {
      console.log("No files to delete.");
      return NextResponse.json({ message: "No files to delete" }, { status: 200 });
    }

    const now = new Date();
    const filesToDelete: string[] = [];

    for (const file of files) {
      if (!file.created_at) continue;

      // ? 분 단위 차이 계산
      const fileDate = new Date(file.created_at);
      const diffMinutes = (now.getTime() - fileDate.getTime()) / (1000 * 60);

      // * 원하는 시간 분단위로 설정 : 예)업로드된지 60분이 넘은 파일 삭제(1시간 이전 파일 삭제)
      if (diffMinutes > 10) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage.from("tts-audio").remove(filesToDelete);

      if (deleteError) {
        console.error("Error deleting files:", deleteError.message);
        return NextResponse.json({ error: `Error deleting files: ${deleteError.message}` }, { status: 500 });
      }

      console.log(`Deleted old files: ${filesToDelete.join(", ")}`);
      return NextResponse.json({ message: "Files deleted successfully", deletedFiles: filesToDelete }, { status: 200 });
    } else {
      console.log("No old files to delete.");
      return NextResponse.json({ message: "No old files to delete" }, { status: 200 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
