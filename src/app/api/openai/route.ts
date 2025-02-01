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
      {
        role: "system",
        content:
          // "You are a helpful assistant."
          "너는 English 선생님이야. user 의 영어 발음을 평가해줘. 그리고 total 평점을 5점 만점에 소숫점 1자리까지 표현해줘. 형식은 다음과 같이 해죠." +
          "평가 결과" +
          "Total 평점: 3.5" +
          "개선 사항: 개선사항",
      },
      {
        role: "user",
        content: `${question}`,
      },
    ],
  });

  console.log(completion.choices[0].message);

  return NextResponse.json(completion.choices[0].message);
}
