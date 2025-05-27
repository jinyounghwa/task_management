"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "react-hot-toast";

import { MainLayout } from "@/components/layout/main-layout";
import { ProjectEditModal } from "@/components/project/project-edit-modal";
import { ProjectDeleteModal } from "@/components/project/project-delete-modal";
import { useProjectStore } from "@/store/use-project-store";
import { ProjectStatus, ProjectWithRelations } from "@/types";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, selectProject, calculateProjectProgress } = useProjectStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  
  // 프로젝트 목록
  const displayProjects = projects;

  // 날짜 포맷팅 함수
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return date;
    }
    return format(date, 'yyyy-MM-dd', { locale: ko });
  };
  
  const getStatusBadge = (status: string | ProjectStatus) => {
    switch (status) {
      case "PLANNING":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">계획 중</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">진행 중</span>;
      case "COMPLETED":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">완료됨</span>;
      default:
        return null;
    }
  };

  // 프로젝트 진행률 계산
  const calculateProgress = (project: ProjectWithRelations) => {
    // 스토어의 진행률 계산 함수 사용
    const storeProgress = calculateProjectProgress(project.id);
    
    // 로컬 계산 (백업 방법)
    // 프로젝트에 태스크가 있는 경우
    if (project.tasks && project.tasks.length > 0) {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => 
        task.status === 'COMPLETED'
      ).length;
      
      return Math.round((completedTasks / totalTasks) * 100);
    }
    
    // 태스크 개수 정보가 있는 경우
    if (project.taskCount !== undefined && project.completedTaskCount !== undefined) {
      const taskCount = project.taskCount || 0;
      const completedTaskCount = project.completedTaskCount || 0;
      if (taskCount === 0) return storeProgress; // 태스크가 없으면 스토어 값 사용
      return Math.round((completedTaskCount / taskCount) * 100);
    }
    
    // 정보가 없는 경우 스토어 값 반환
    return storeProgress;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">프로젝트</h1>
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            새 프로젝트
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/projects/${project.id}`} className="font-semibold text-lg hover:text-primary">
                    {project.name}
                  </Link>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">{formatDate(project.startDate)} ~ {formatDate(project.endDate)}</span>
                  <span className="text-xs text-gray-500">
                    {'tasks' in project && project.tasks ? project.tasks.length : (project.taskCount || 0)}개 테스크
                  </span>
                </div>
                
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100 space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedProject(project as ProjectWithRelations);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedProject(project as ProjectWithRelations);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                  <Link
                    href={`/projects/${project.id}`}
                    className="p-2 text-gray-500 hover:text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/projects/new"
            className="block border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"
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
              className="mb-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            <span>새 프로젝트 생성</span>
          </Link>
        </div>
      </div>
      
      {/* 프로젝트 편집 모달 */}
      {isEditModalOpen && selectedProject && (
        <ProjectEditModal
          project={selectedProject}
          onCloseAction="/projects"
          onSaveAction="/projects"
          onModalClose={() => setIsEditModalOpen(false)}
        />
      )}
      
      {/* 프로젝트 삭제 모달 */}
      {isDeleteModalOpen && selectedProject && (
        <ProjectDeleteModal
          project={selectedProject}
          onCloseAction="/projects"
          onModalClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </MainLayout>
  );
}
