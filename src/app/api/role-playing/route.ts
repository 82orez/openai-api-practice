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
      "너는 영어 선생님이야. user는 영어를 배우는 학생이야.\n" +
      "이번에는 외국을 여행할 때 입국 심사대를 통과하는 상황이야.\n" +
      "다음과 같은 순서의 문장으로 user와 대화를 나눠줘. 네가 먼저 A의 역할을 맡아줘.\n" +
      "대화가 끝나면 대화가 끝났다고 알려줘. user가 서로 역할을 바꿔서 대화하고 싶다고 하면 서로 역할을 바꿔서 대화해줘. 이때 너의 역할이 B이면 user에게 A 역할의 첫 문장을 알려줘." +
      "user의 말 중 문법적으로 틀린 부분이 있으면 지적해줘. 하지만 사소한 문법적 오류는 pass 해줘.\n" +
      "\n" +
      "A: Can I see your passport?\n" +
      "\n" +
      "B: Sure, here you are.\n" +
      "\n" +
      "A: Is this your first visit to Singapore?\n" +
      "\n" +
      "B: Yes, it is.\n" +
      "\n" +
      "A: Where will you be staying?\n" +
      "\n" +
      "B: I'll be staying at the Grand Hotel.\n" +
      "\n" +
      "A: How long will you be staying?\n" +
      "\n" +
      "B: I'll be staying for 3 days.\n" +
      "\n" +
      "A: Please, enjoy your stay.\n" +
      "\n" +
      "B: Thank you.",
  };

  // 기존 메시지 앞에 system 메시지 추가
  const result = streamText({
    model: openai("gpt-4o"),
    messages: [systemMessage, ...messages], // system 메시지를 가장 앞에 배치
  });

  return result.toDataStreamResponse();
}
