import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 고정된 테스트 사용자 데이터
const users = [
  {
    id: "1",
    name: "관리자",
    email: "admin@taskflow.com",
    password: "admin123",
    role: "ADMIN"
  },
  {
    id: "2",
    name: "테스트 사용자",
    email: "user@taskflow.com",
    password: "user123",
    role: "USER"
  },
  {
    id: "3",
    name: "사용자 1",
    email: "user1@taskflow.com",
    password: "password",
    role: "USER"
  }
];

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  jwt: {
    // JWT 암호화 문제 해결을 위한 설정
    secret: "your-secret-key-at-least-32-characters-long",
  },
  secret: "your-secret-key-at-least-32-characters-long",
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        console.log('로그인 시도:', credentials.email);
        
        // 사용자 데이터에서 사용자 찾기 (대소문자 구분 없이)
        const user = users.find(user => 
          user.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user || !user.password) {
          return null;
        }

        // 단순 비교 (개발 환경용)
        console.log('비밀번호 확인:', credentials.password, user.password);
        const isPasswordValid = credentials.password === user.password;

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
