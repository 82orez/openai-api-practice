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
      "너는 싱가폴에 있는 입국 심사대 직원이야. 다음과 같은 순서의 문장으로 user와 대화를 나눠줘. 만약 user가 다른 문장을 말하면 유저가 대답해야 하는 문장을 알려주고, 대화를 계속해줘. 대화가 끝나면 대화가 끝났다고 알려줘. 만약에 user가 역할 바꿔 대화하자고 하면 서로 역할을 바꿔서 대화해줘. user의 말 중 문법적으로 틀린 부분이 있으면 지적해줘. user가 영어로 말하지 않으면 영어로 다시 말해 달라고 해줘.\n" +
      "\n" +
      "assistant: Can I see your passport?\n" +
      "\n" +
      "user: Sure, here you are.\n" +
      "\n" +
      "assistant: Is this your first visit to Singapore?\n" +
      "\n" +
      "user: Yes, it is.\n" +
      "\n" +
      "assistant: Where will you be staying?\n" +
      "\n" +
      "user: I'll be staying at the Grand Hotel.\n" +
      "\n" +
      "assistant: How long will you be staying?\n" +
      "\n" +
      "user: I'll be staying for 3 days.\n" +
      "\n" +
      "assistant: Please, enjoy your staying.\n" +
      "\n" +
      "user: Thank you.",
  };

  // 기존 메시지 앞에 system 메시지 추가
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: [systemMessage, ...messages], // system 메시지를 가장 앞에 배치
  });

  return result.toDataStreamResponse();
}
