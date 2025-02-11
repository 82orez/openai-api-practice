import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 2, // 2 hours
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  pages: { signIn: "/users/sign-in" },
  callbacks: {
    jwt: async ({ user, token }) => {
      console.log("user: ", user);
      console.log("token: ", token);

      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
    session: async ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        ...token,
      },
    }),

    // * 소셜 로그인 시에 provider 로부터 { account, profile } 정보를 받아 온다.
    // * 현재 로그인 시도 중인 소셜 로그인의 provider 정보는 account?.provider 에 담겨 있다.
    // * 소셜 로그인 별로 가입한 이메일의 정보는 profile 에 확인할 수 있는데, 자세한 장소는 provider 마다 다르다.
    // ? kakao : profile?.["kakao_account"]?.email
    // ? naver : profile?.["response"]?.email
    // ? google : profile?.email
    signIn: async ({ account, profile }) => {
      console.log("account: ", account);
      console.log("profile: ", profile);

      // * provider 마다 다른 가입 email 정보를 하나로 통일해 주는 과정을 거친다.
      let forCheckEmail = "";

      if (account?.provider === "kakao") {
        forCheckEmail = profile?.["kakao_account"]?.email; // 실제 카카오 프로필의 이메일 경로를 확인해야 함
      } else if (account?.provider === "naver") {
        forCheckEmail = profile?.["response"]?.email; // 실제 네이버 프로필의 이메일 경로를 확인해야 함
      } else {
        forCheckEmail = profile?.email || "";
      }

      // * 사용자가 회원 가입 또는 로그인을 시도하면 데이터베이스에 동일 이메일을 가진 사용자가 존재하는지 확인하고, 없으면 해당 email 과 소셜 제공자로 회원 가입 및 로그인을 진행한다.
      // * 하지만 동일한 email(forCheckEmail)을 소셜 로그인을 진행한 사용자가 이미 존재하면 그 정보를 DB 로부터 가져오는데, 이때 해당 사용자의 relation 된 accounts 정보도 함께 가져온다.
      if (account?.provider && forCheckEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: forCheckEmail },
          include: { accounts: true },
        });

        // * 위에서 가져온 정보를 토대로 기존 provider 정보와 현재 로그인 진행 중인 소셜 provider 가 일치할 경우 true 를 반환하고 로그인을 정상적으로 진행한다.
        if (existingUser) {
          console.log("existingUser: ", existingUser);
          const isProviderLinked = existingUser.accounts.some((acc) => acc.provider === account.provider);

          // * 하지만 기존 provider 정보와 현재 로그인 진행 중인 소셜 provider 가 불일치할 경우에는 error 메세지와 관련된 경로를 반환한다.
          if (!isProviderLinked) {
            // * 반환 경로에 주의: 반드시 로그인 페이지 경로로 수정해야 함.
            return `/users/sign-in?error=alreadyLinked&provider=${existingUser.accounts[0].provider}&email=${existingUser.email}`;
          }
        }
      }
      return true; // 로그인 허용
    },
  },
};
