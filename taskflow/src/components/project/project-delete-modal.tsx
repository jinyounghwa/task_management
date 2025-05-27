"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useProjectStore } from "@/store/use-project-store";
import { ProjectWithRelations } from "@/types";

interface ProjectDeleteModalProps {
  project: ProjectWithRelations;
  onCloseAction: string;
  onModalClose?: () => void; // 모달을 닫기 위한 콜백 함수 (선택적)
}

export function ProjectDeleteModal({ project, onCloseAction, onModalClose }: ProjectDeleteModalProps) {
  const router = useRouter();
  const { deleteProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");

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

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      // 프로젝트 삭제
      console.log("프로젝트 삭제 시도:", project.id);
      deleteProject(project.id);
      
      // 성공 메시지 표시
      toast.success('프로젝트가 삭제되었습니다.');
      
      // 삭제 후 약간의 지연 후 이동 (상태 업데이트 시간 확보)
      setTimeout(() => {
        // 프로젝트 목록 페이지로 이동
        router.push("/projects");
      }, 300);
    } catch (error) {
      console.error("프로젝트 삭제 오류:", error);
      toast.error('프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  // 삭제 버튼 활성화 여부
  const isDeleteEnabled = confirmText === project.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-600">프로젝트 삭제</h2>
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
          
          <div className="space-y-4">
            <p className="text-gray-700">
              이 작업은 되돌릴 수 없습니다. 이 프로젝트와 관련된 모든 테스크가 영구적으로 삭제됩니다.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                삭제를 확인하려면 아래에 <span className="font-semibold">"{project.name}"</span>을(를) 입력하세요.
              </p>
            </div>
            
            <div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder={project.name}
              />
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
                type="button"
                onClick={handleDelete}
                disabled={!isDeleteEnabled || isLoading || isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "삭제 중..." : "프로젝트 삭제"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
