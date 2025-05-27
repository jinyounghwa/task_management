import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function Home() {
  // 서버 컴포넌트에서 세션 정보 가져오기
  const session = await getServerSession(authOptions);
  
  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!session) {
    redirect("/login");
  }
  
  // 로그인한 경우 대시보드 표시
  const userName = session.user?.name || "사용자";
  
  return (
    <MainLayout>
      <DashboardContent userName={userName} />
    </MainLayout>
  );
}
