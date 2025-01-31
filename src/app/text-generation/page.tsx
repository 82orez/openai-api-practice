"use client";

import axios from "axios";
import { useState } from "react";

export default function SearchPage() {
  // * 질문을 위한 상태 관리
  const [question, setQuestion] = useState("");
  // * 답변을 처리하기 위한 상태 관리
  const [content, setContent] = useState("");

  const [isOpenAiLoading, setIsOpenAiLoading] = useState(false);

  return (
    <div className={""}>
      {/* openai api 로부터 응답을 받기까지 상당 시간이 걸리므로 Loading 과정 추가 */}
      {isOpenAiLoading ? (
        <div className={"animate-pulse text-8xl"}>답변 생성 중...</div>
      ) : (
        <>
          <input
            type="text"
            className={"w-full rounded-md border-4 border-amber-500 p-2"}
            placeholder={"질문을 입력해 주세요."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className={"rounded-md border-2 bg-amber-100 p-2"}
            onClick={async () => {
              if (!question) {
                alert("Please input Question!");
                return;
              }

              try {
                // 클릭하면 Loading 시작
                setIsOpenAiLoading(true);

                // * 질문 내용을 body 에 담아 서버에 post 요청.
                // * 반환 받은 내용을 result 에 할당.
                const res = await axios.post("/api/openai", {
                  question: question,
                });
                const result = await res.data;

                // Loading 종료
                setIsOpenAiLoading(false);
                // 질문 입력창을 공란으로
                setQuestion("");

                // * openai 의 답변 내용은 result(객체)의 content 에 담겨 있음.
                setContent(result.content);
                return result;
              } catch (e) {
                console.error("Error Loading page:", e);
              }
            }}>
            Post Request
          </button>

          <div className={"mt-8"}>{content}</div>
        </>
      )}
    </div>
  );
}
