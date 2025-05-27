import { NextRequest, NextResponse } from "next/server";

// 간단한 인메모리 사용자 데이터
// 서버가 다시 시작될 때마다 초기화되지 않도록 전역 변수로 선언
// @ts-ignore - 전역 변수 타입 오류 무시
if (!global.users) {
  // @ts-ignore
  global.users = [
    {
      id: "1",
      name: "테스트 사용자",
      email: "test@example.com",
      password: "password123",
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

// 전역 변수에서 사용자 데이터 가져오기
// @ts-ignore
const users = global.users;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    // 필수 필드 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "이름, 이메일, 비밀번호는 필수 항목입니다." },
        { status: 400 }
      );
    }
    
    // 이메일 유효성 검사
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "유효하지 않은 이메일 형식입니다." },
        { status: 400 }
      );
    }
    
    // 비밀번호 길이 검사
    if (password.length < 6) {
      return NextResponse.json(
        { message: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    
    // 이메일 중복 확인
    const existingUser = users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      );
    }
    
    // 사용자 생성 (개발 환경용 - 인메모리에 저장)
    const user = {
      id: String(users.length + 1),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // 일반 텍스트로 저장 (개발 환경용)
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // 사용자 추가
      users.push(user);
      // @ts-ignore - 전역 변수 업데이트
      global.users = users;
      
      // 비밀번호 제외하고 응답
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('새 사용자 등록:', userWithoutPassword);
      
      return NextResponse.json(
        { 
          message: "회원가입이 완료되었습니다.",
          user: userWithoutPassword
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('사용자 등록 오류:', error);
      return NextResponse.json(
        { message: "회원가입 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
