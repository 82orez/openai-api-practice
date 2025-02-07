"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BiSolidMessageRounded } from "react-icons/bi";
import { SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SignInPage() {
  // * 클라이언트 컴포넌트에서 로그인 session 정보 가져오기 : useSession()
  const { status, data } = useSession();
  console.log("status: ", status);
  console.log("data: ", data);
  const router = useRouter();

  // 로그인이 되어 있을 때 이 페이지로 접근하면 루트 페이지 '/'로 되돌림.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // * 중복된 email 로 다른 소셜 로그인 인증을 시도했을 때 signIn 콜백 함수에서 반환한 에러 관련 메서지를 받아서 UI 기반 오류 메세지 출력.
  // 콜백 함수에서 반환한 에러 관련 메서지를 처리하기 위한 상태 설정.
  const [error, setError] = useState<null | string>(null);
  const [provider, setProvider] = useState<null | string>(null);

  const [email, setEmail] = useState<null | string>(null);

  useEffect(() => {
    // ? 오류 방지를 위해 아래 코드를 클라이언트 환경에서만 실행할 수 있도록 설정.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setError(params.get("error"));
      setProvider(params.get("provider"));
      setEmail(params.get("email"));
    }
  }, []);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isNaverLoading, setIsNaverLoading] = useState(false);

  const handleClickGoogle = async () => {
    setIsGoogleLoading(true);

    const isWebView = /(WebView|Android.*AppleWebKit)/i.test(navigator.userAgent);

    if (isWebView) {
      window.open(`/api/auth/signin?provider=google`, "_system");
    } else {
      await signIn("google", { callbackUrl: "/" });
    }
  };
  const handleClickKakao = async () => {
    setIsKakaoLoading(true);
    await signIn("kakao", { callbackUrl: "/" });
  };
  const handleClickNaver = async () => {
    setIsNaverLoading(true);
    await signIn("naver", { callbackUrl: "/" });
  };

  return (
    <div>
      {/*UI 기반 오류 메세지 부분*/}
      {error === "alreadyLinked" && provider && (
        <div className="animate-pulse rounded-md bg-cyan-200 p-4 text-red-800">
          회원님께서는 이미 <span className={"font-bold"}>{email}</span> 을 사용하여 <span className={"font-bold"}>{provider}</span> 계정으로
          가입하셨습니다. <span className={"font-bold"}>{provider}</span> 로그인으로 다시 시도해주세요.
        </div>
      )}
      {error === "OAuthCallback" && (
        <div className="animate-pulse rounded-md bg-red-100 p-4 text-red-800">네트워크 오류입니다. 잠시 후 다시 시도해 주세요.</div>
      )}

      {status === "loading" ? (
        <div className={"flex h-screen items-center justify-center"}>
          <div className={"animate-pulse text-4xl font-bold"}>Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            <div className="text-center text-xl font-semibold md:text-2xl">줌마영어 사관학교에 오신 것을 환영합니다.</div>
            <h1 className="text-center text-lg font-semibold">로그인 또는 회원가입</h1>
          </div>

          <div className="mx-auto mt-16 flex max-w-[320px] flex-col gap-5">
            {isGoogleLoading ? (
              <div className={"flex items-center justify-center"}>
                <AiOutlineLoading3Quarters className={"animate-spin"} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClickGoogle}
                className="flex items-center rounded-md border border-gray-700 px-5 py-3 text-center text-sm font-semibold">
                <FcGoogle className="text-xl" />
                <div className={"grow"}>Google 로그인</div>
              </button>
            )}

            {isKakaoLoading ? (
              <div className={"flex items-center justify-center"}>
                <AiOutlineLoading3Quarters className={"animate-spin"} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClickKakao}
                className="flex items-center rounded-md border border-gray-700 px-5 py-3 text-center text-sm font-semibold"
                style={{ backgroundColor: "#FEE500" }}>
                <BiSolidMessageRounded className={"text-xl"} />
                <div className={"grow"} style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                  카카오 로그인
                </div>
              </button>
            )}

            {isNaverLoading ? (
              <div className={"flex items-center justify-center"}>
                <AiOutlineLoading3Quarters className={"animate-spin"} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClickNaver}
                className="flex items-center rounded-md border border-gray-700 px-5 py-3 text-center text-sm font-semibold"
                style={{ backgroundColor: "#02C759" }}>
                <div className={"flex h-[20px] w-[20px] items-center justify-center"}>
                  <SiNaver className={"text-md text-white"} />
                </div>
                <div className={"grow text-white"}>네이버 로그인</div>
              </button>
            )}
          </div>

          <div className={"mx-auto mt-20 w-fit hover:underline"}>
            <Link href={"/"} className={""}>
              Move to Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
