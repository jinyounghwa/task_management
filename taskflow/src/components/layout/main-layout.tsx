"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const navItems = [
    { href: '/', label: '대시보드' },
    { href: '/projects', label: '프로젝트' },
    { href: '/tasks', label: '테스크' },
    { href: '/settings', label: '설정' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="border-b bg-background">
        <div className="container mx-auto h-16" style={{ position: 'relative' }}>
          {/* 사용자 정보와 로그아웃 버튼을 인라인 스타일로 지정 */}
          {status === "authenticated" ? (
            <div style={{ 
              position: 'absolute', 
              right: '-400px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{session.user?.name || '사용자'}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden' }}>{session.user?.email}</span>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ 
                  padding: '0.375rem 0.75rem', 
                  fontSize: '0.875rem', 
                  backgroundColor: '#f3f4f6', 
                  color: '#374151', 
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div style={{ 
              position: 'absolute', 
              right: '8px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px'
            }}>
              <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', textDecoration: 'none' }}>
                로그인
              </Link>
              <Link href="/register" style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '0.375rem',
                textDecoration: 'none'
              }}>
                회원가입
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex">
        {/* 사이드바 */}
        <aside className="w-64 border-r bg-muted/30 hidden md:block">
          {/* 로고 추가 */}
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center justify-center">
              <span className="font-bold text-xl text-primary">TaskFlow</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        
        {/* 콘텐츠 영역 */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
