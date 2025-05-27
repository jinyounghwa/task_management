"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode, JSX } from "react";

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps): JSX.Element {
  // 타입 단언을 사용하여 NextAuthSessionProvider를 JSX 요소로 사용할 수 있게 합니다
  const Provider = NextAuthSessionProvider as any;
  
  return (
    <Provider>
      {children}
    </Provider>
  );
}
