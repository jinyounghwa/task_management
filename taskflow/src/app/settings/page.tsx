"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { MainLayout } from "@/components/layout/main-layout";

interface ProfileFormData {
  name: string;
  email: string;
  role: string;
  bio: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  teamMessages: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance">("profile");
  
  // 프로필 폼
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: "홍길동",
      email: "user@example.com",
      role: "프로젝트 매니저",
      bio: "안녕하세요. 저는 프로젝트 매니저로 일하고 있습니다.",
    }
  });
  
  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    teamMessages: false,
  });
  
  // 외관 설정
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: "system",
    fontSize: "medium",
    compactMode: false,
  });
  
  // 프로필 저장
  const onProfileSubmit = (data: ProfileFormData) => {
    console.log("프로필 저장:", data);
    toast.success("프로필이 업데이트되었습니다.");
  };
  
  // 알림 설정 저장
  const saveNotificationSettings = () => {
    console.log("알림 설정 저장:", notificationSettings);
    toast.success("알림 설정이 업데이트되었습니다.");
  };
  
  // 외관 설정 저장
  const saveAppearanceSettings = () => {
    console.log("외관 설정 저장:", appearanceSettings);
    toast.success("외관 설정이 업데이트되었습니다.");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">설정</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium ${activeTab === "profile" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("profile")}
            >
              프로필
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === "notifications" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("notifications")}
            >
              알림
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === "appearance" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("appearance")}
            >
              외관
            </button>
          </div>
          
          <div className="p-6">
            {/* 프로필 설정 */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl">
                      홍
                    </div>
                    <div>
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        이미지 변경
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, GIF 또는 PNG. 최대 크기 1MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                      </label>
                      <input
                        {...registerProfile("name", { required: "이름은 필수입니다" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        {...registerProfile("email", { 
                          required: "이메일은 필수입니다",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "유효한 이메일 주소를 입력하세요"
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      {profileErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        역할
                      </label>
                      <input
                        {...registerProfile("role")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        자기소개
                      </label>
                      <textarea
                        {...registerProfile("bio")}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* 알림 설정 */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">알림 설정</h2>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">이메일 알림</h3>
                      <p className="text-sm text-gray-500">중요한 업데이트에 대한 이메일 알림을 받습니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">테스크 알림</h3>
                      <p className="text-sm text-gray-500">테스크 마감일 알림을 받습니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.taskReminders}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          taskReminders: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">프로젝트 업데이트</h3>
                      <p className="text-sm text-gray-500">프로젝트 변경사항에 대한 알림을 받습니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.projectUpdates}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          projectUpdates: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">팀 메시지</h3>
                      <p className="text-sm text-gray-500">팀원들의 메시지에 대한 알림을 받습니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.teamMessages}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          teamMessages: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={saveNotificationSettings}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
            
            {/* 외관 설정 */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">외관 설정</h2>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      테마
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`border p-4 rounded-md cursor-pointer ${
                          appearanceSettings.theme === "light" ? "border-primary bg-primary/5" : "border-gray-200"
                        }`}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "light" })}
                      >
                        <div className="h-20 bg-white border border-gray-200 rounded-md mb-2"></div>
                        <div className="text-center font-medium">라이트</div>
                      </div>
                      <div
                        className={`border p-4 rounded-md cursor-pointer ${
                          appearanceSettings.theme === "dark" ? "border-primary bg-primary/5" : "border-gray-200"
                        }`}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "dark" })}
                      >
                        <div className="h-20 bg-gray-900 border border-gray-700 rounded-md mb-2"></div>
                        <div className="text-center font-medium">다크</div>
                      </div>
                      <div
                        className={`border p-4 rounded-md cursor-pointer ${
                          appearanceSettings.theme === "system" ? "border-primary bg-primary/5" : "border-gray-200"
                        }`}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "system" })}
                      >
                        <div className="h-20 bg-gradient-to-r from-white to-gray-900 border border-gray-200 rounded-md mb-2"></div>
                        <div className="text-center font-medium">시스템</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      글꼴 크기
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={appearanceSettings.fontSize === "small"}
                          onChange={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "small" })}
                        />
                        <span className="text-sm">작게</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={appearanceSettings.fontSize === "medium"}
                          onChange={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "medium" })}
                        />
                        <span className="text-base">중간</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={appearanceSettings.fontSize === "large"}
                          onChange={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "large" })}
                        />
                        <span className="text-lg">크게</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">간결한 모드</h3>
                      <p className="text-sm text-gray-500">UI 요소를 더 조밀하게 표시합니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={appearanceSettings.compactMode}
                        onChange={(e) => setAppearanceSettings({
                          ...appearanceSettings,
                          compactMode: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={saveAppearanceSettings}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
