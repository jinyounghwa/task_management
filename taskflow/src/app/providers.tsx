"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, JSX } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps): JSX.Element {
  // 타입 단언을 사용하여 SessionProvider를 JSX 요소로 사용할 수 있게 합니다
  const Provider = SessionProvider as any;
  
  return (
    <Provider>
      {children}
    </Provider>
  );
}
