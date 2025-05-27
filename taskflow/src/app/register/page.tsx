"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  });
  
  const password = watch("password");
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.message || "회원가입에 실패했습니다.");
        return;
      }
      
      toast.success("회원가입에 성공했습니다!");
      setIsRegistered(true);
      setRegisteredEmail(data.email);
    } catch (error) {
      console.error("회원가입 오류:", error);
      toast.error("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      const result = await signIn("credentials", {
        email: registeredEmail,
        password: watch("password"),
        redirect: false,
      });
      
      if (result?.error) {
        toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      
      toast.success("로그인에 성공했습니다!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("로그인 오류:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">TaskFlow</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            {isRegistered ? "회원가입 완료" : "회원가입"}
          </h2>
          {!isRegistered && (
            <p className="mt-2 text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                로그인
              </Link>
            </p>
          )}
        </div>
        
        {isRegistered ? (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <p className="text-green-800 mb-2">
                <span className="font-semibold">{registeredEmail}</span> 계정으로 회원가입이 완료되었습니다!
              </p>
              <p className="text-sm text-green-700">
                이제 로그인하여 TaskFlow의 모든 기능을 이용할 수 있습니다.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                로그인 페이지로 이동
              </button>
              
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {isLoading ? "로그인 중..." : "바로 로그인하기"}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register("name", { 
                  required: "이름은 필수입니다",
                  minLength: {
                    value: 2,
                    message: "이름은 최소 2자 이상이어야 합니다"
                  }
                })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="이름"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", { 
                  required: "이메일은 필수입니다",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "유효한 이메일 주소를 입력하세요"
                  }
                })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password", { 
                  required: "비밀번호는 필수입니다",
                  minLength: {
                    value: 6,
                    message: "비밀번호는 최소 6자 이상이어야 합니다"
                  }
                })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="비밀번호"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword", { 
                  required: "비밀번호 확인은 필수입니다",
                  validate: value => value === password || "비밀번호가 일치하지 않습니다"
                })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="비밀번호 확인"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {isLoading ? "회원가입 중..." : "회원가입"}
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              onClick={handleSubmit(onSubmit)}
            >
              완료
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
