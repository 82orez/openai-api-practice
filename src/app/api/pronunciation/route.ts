import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("Received messages:", messages);

  // 시스템 메시지 추가
  const systemMessage = {
    role: "system",
    content:
      "너는 English 선생님이야. user 의 영어 발음을 평가해줘. 그리고 total 평점을 5점 만점에 소숫점 1자리까지 표현해줘. 형식은 다음과 같이 해죠." +
      "평가 결과" +
      "Total 평점: 3.5" +
      "개선 사항: 개선사항",
  };

  // 기존 메시지 앞에 system 메시지 추가
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: [systemMessage, ...messages], // system 메시지를 가장 앞에 배치
  });

  return result.toDataStreamResponse();
}
