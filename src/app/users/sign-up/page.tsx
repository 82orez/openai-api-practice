"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import axios from "axios";
// import { useState } from "react";
// import useAuthStore from "@/store/authStore"; // Zustand store for auth
// import { supabase } from "@/lib/supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  const [token, setToken] = useState("");
  const [alertToken, setAlertToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertPasswordMessage, setAlertPasswordMessage] = useState<string | null>(null);
  const [alertConfirmPasswordMessage, setAlertConfirmPasswordMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (timer && timer > 0) {
      const intervalId = setInterval(() => setTimer((prev) => prev! - 1), 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0) {
      setAlertMessage("인증 코드가 만료 되었어요.");
      setTimer(null);
    }
  }, [timer]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const valid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
    setAlertPasswordMessage(valid ? null : "영문, 숫자 포함 8자리 이상으로 작성해 주세요.");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setAlertConfirmPasswordMessage("비밀번호가 일치하지 않습니다.");
    } else {
      setAlertConfirmPasswordMessage("비밀번호가 일치합니다.");
    }
  };

  const requestEmailAuth = async () => {
    if (!isValidEmail) {
      setAlertMessage("정확한 이메일을 입력해 주세요.");
      return;
    }

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/email`, { email });
      if (data.provider) {
        setAlertMessage(`이미 가입한 ${data.provider} 계정이 있어요!`);
      } else {
        setAlertMessage("메일로 인증 코드를 발송했어요.");
        setTimer(180);
      }
    } catch (error) {
      console.error(error);
      setAlertMessage("인증 요청 중 오류가 발생했습니다.");
    }
  };

  const verifyToken = async () => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/verify`, { email, token });
      if (data.result === "User verified") {
        setAlertToken("인증에 성공했습니다.");
        setTimer(null);
      } else {
        setAlertToken("인증에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignup = async () => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/signup`, { email, password });
      if (data.result === "Signup success") {
        alert("회원 가입이 완료 되었습니다.");
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      alert("회원 가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">회원 가입</h1>
        <h3 className="mb-6 text-gray-600">이메일과 비밀번호를 입력해 주세요.</h3>

        <div className="mb-4">
          <label className="mb-2 block text-left">이메일</label>
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleEmailChange}
            disabled={alertMessage === "메일로 인증 코드를 발송했어요."}
          />
          {alertMessage && <p className="mt-1 text-sm text-red-500">{alertMessage}</p>}
        </div>

        <button
          className="w-full rounded-md bg-green-500 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          onClick={requestEmailAuth}
          disabled={alertMessage === "메일로 인증 코드를 발송했어요."}>
          {timer ? `${Math.floor(timer / 60)}:${timer % 60}` : "인증 요청"}
        </button>

        <div className="mt-6">
          <label className="mb-2 block text-left">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀 번호를 입력해 주세요."
              className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handlePasswordChange}
              disabled={alertToken !== "인증에 성공했습니다."}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
          </div>
          {alertPasswordMessage && <p className="mt-1 text-sm text-red-500">{alertPasswordMessage}</p>}
        </div>

        <button
          className="mt-6 w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSignup}
          disabled={alertConfirmPasswordMessage !== "비밀번호가 일치합니다."}>
          회원 가입
        </button>

        <Link href="/login" className="mt-4 block text-center text-blue-500 hover:underline">
          다른 계정으로 로그인
        </Link>
      </div>
    </div>
  );
};

export default Signup;
