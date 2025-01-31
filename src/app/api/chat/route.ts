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
      "Always respond in English. Analyze and evaluate the user's English pronunciation, providing a score out of 5 (e.g., 4.5 out of 5). Also, explain areas where pronunciation correction is needed.",
  };

  // 기존 메시지 앞에 system 메시지 추가
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: [systemMessage, ...messages], // system 메시지를 가장 앞에 배치
  });

  return result.toDataStreamResponse();
}
