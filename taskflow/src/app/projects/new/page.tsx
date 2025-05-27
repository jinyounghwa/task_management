"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { MainLayout } from "@/components/layout/main-layout";
import { useProjectStore } from "@/store/use-project-store";
import { ProjectStatus, UserRole } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjectStore();
  const [teamMembers, setTeamMembers] = useState<{ email: string; role: UserRole }[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<UserRole>(UserRole.EDITOR);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data: any) => {
    // 새 프로젝트 객체 생성
    const newProject = {
      id: `project-${Date.now()}`, // 임시 ID 생성
      name: data.name,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status as ProjectStatus,
      users: teamMembers.map(member => ({
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: member.email.split('@')[0], // 임시 이름 생성
        email: member.email,
        image: null,
        role: member.role as UserRole
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 프로젝트 추가
    addProject(newProject);
    
    // 성공 메시지 표시
    toast.success("프로젝트가 생성되었습니다.");
    
    // 프로젝트 목록 페이지로 이동
    router.push('/projects');
  };
  
  const addTeamMember = () => {
    if (!newMemberEmail) return;
    
    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error("유효한 이메일 주소를 입력하세요.");
      return;
    }
    
    // 중복 이메일 확인
    if (teamMembers.some(member => member.email === newMemberEmail)) {
      toast.error("이미 추가된 이메일입니다.");
      return;
    }
    
    setTeamMembers([...teamMembers, { email: newMemberEmail, role: newMemberRole }]);
    setNewMemberEmail("");
  };
  
  const removeTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(member => member.email !== email));
  };
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/projects" className="text-gray-500 hover:text-gray-700">
            프로젝트
          </Link>
          <span className="text-gray-500">/</span>
          <h1 className="text-2xl font-bold">새 프로젝트</h1>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* 프로젝트 기본 정보 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="프로젝트 이름을 입력하세요"
                  {...register("name", { required: "프로젝트 이름은 필수입니다." })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="프로젝트에 대한 설명을 입력하세요"
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    {...register("startDate", { required: "시작일은 필수입니다." })}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.startDate.message as string}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    {...register("endDate", { 
                      required: "종료일은 필수입니다.",
                      validate: (value, formValues) => {
                        return !formValues.startDate || new Date(value) >= new Date(formValues.startDate) || "종료일은 시작일 이후여야 합니다.";
                      }
                    })}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.endDate.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register("status")}
                >
                  <option value="PLANNING">계획 중</option>
                  <option value="IN_PROGRESS">진행 중</option>
                  <option value="COMPLETED">완료됨</option>
                </select>
              </div>
            </div>

            {/* 팀 구성 */}
            <div>
              <h2 className="text-lg font-medium mb-4">팀 구성</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="팀원 이메일 주소"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.ADMIN}>관리자</option>
                    <option value={UserRole.EDITOR}>편집자</option>
                    <option value={UserRole.VIEWER}>뷰어</option>
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    onClick={addTeamMember}
                  >
                    추가
                  </button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이메일
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          역할
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            추가된 팀원이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        teamMembers.map((member, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.role === "ADMIN" ? "관리자" : 
                               member.role === "EDITOR" ? "편집자" : "뷰어"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => removeTeamMember(member.email)}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <Link
                href="/projects"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                프로젝트 생성
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
