"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useProjectStore } from "@/store/use-project-store";
import { ProjectStatus, ProjectWithRelations } from "@/types";
import { format } from "date-fns";

interface ProjectEditModalProps {
  project: ProjectWithRelations;
  onCloseAction: string;
  onSaveAction: string;
  onModalClose?: () => void; // 모달을 닫기 위한 콜백 함수 (선택적)
}

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

export function ProjectEditModal({ project, onCloseAction, onSaveAction, onModalClose }: ProjectEditModalProps) {
  const router = useRouter();
  const { updateProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 폼 초기화
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      name: project.name,
      description: project.description || "", // null을 빈 문자열로 변환
      status: project.status,
      startDate: format(new Date(project.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(project.endDate), "yyyy-MM-dd"),
    },
  });

  const handleClose = () => {
    // 모달 닫기 콜백이 있으면 호출
    if (onModalClose) {
      onModalClose();
    }
    
    startTransition(() => {
      router.refresh();
      
      // 액션 문자열에 따라 라우팅 처리
      if (onCloseAction === 'back') {
        router.back();
      } else if (onCloseAction.startsWith('/')) {
        router.push(onCloseAction);
      }
    });
  };

  const handleSave = () => {
    startTransition(() => {
      router.refresh();
      
      // 액션 문자열에 따라 라우팅 처리
      if (onSaveAction === 'back') {
        router.back();
      } else if (onSaveAction.startsWith('/')) {
        router.push(onSaveAction);
      }
    });
  };

  const onSubmit = async (data: any) => {
    const formData = data as ProjectFormData;
    try {
      setIsLoading(true);
      
      // 프로젝트 업데이트
      updateProject(project.id, {
        ...project,
        name: formData.name,
        description: formData.description || "",
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: new Date()
      });
      
      console.log("프로젝트 업데이트:", {
        id: project.id,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });
      
      // 성공 메시지 표시
      toast.success('프로젝트가 업데이트되었습니다.');
      
      // 성공 후 저장 액션 실행
      handleSave();
    } catch (error) {
      console.error("프로젝트 업데이트 오류:", error);
      toast.error('프로젝트 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">프로젝트 편집</h2>
            <button 
              onClick={() => {
                if (onModalClose) {
                  onModalClose();
                }
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트명
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "프로젝트명은 필수입니다" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value={ProjectStatus.PLANNING}>계획 중</option>
                <option value={ProjectStatus.IN_PROGRESS}>진행 중</option>
                <option value={ProjectStatus.COMPLETED}>완료됨</option>
                <option value={ProjectStatus.ON_HOLD}>보류 중</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: "시작일은 필수입니다" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: "종료일은 필수입니다" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onModalClose) {
                    onModalClose();
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
