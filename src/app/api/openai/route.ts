import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// * POST 요청으로 처리하는 부분
// * 클라이언트 요청의 body 에 질문 내용을 받아와서 openai api 로 전달.
export async function POST(request: Request) {
  const { question } = await request.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: `${question}`,
      },
    ],
  });

  console.log(completion.choices[0].message);

  return NextResponse.json(completion.choices[0].message);
}
