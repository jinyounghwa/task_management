"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "react-hot-toast";

import { MainLayout } from "@/components/layout/main-layout";
import { GanttChart } from "@/components/gantt/gantt-chart";
import { TaskModal } from "@/components/gantt/task-modal";
import { ProjectEditModal } from "@/components/project/project-edit-modal";
import { ProjectDeleteModal } from "@/components/project/project-delete-modal";
import { useProjectStore } from "@/store/use-project-store";
import { useTaskStore } from "@/store/use-task-store";
import { ProjectStatus, TaskStatus, UserRole } from "@/types";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage() {
  const router = useRouter();
  // useParams 훈크을 사용하여 id 가져오기
  const params = useParams();
  const id = params?.id as string;
  
  const { projects, selectProject, selectedProject, updateProject, calculateProjectProgress } = useProjectStore();
  const { tasks, addTask, isTaskModalOpen, setTaskModalOpen } = useTaskStore();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // 프로젝트 데이터 로드
  useEffect(() => {
    const project = projects.find(p => p.id === id);
    if (project) {
      selectProject(project);
    } else {
      // 프로젝트가 없으면 프로젝트 목록으로 이동
      router.push('/projects');
    }
  }, [id, projects, selectProject, router]);
  
  // 프로젝트가 로드되지 않았으면 로딩 표시
  if (!selectedProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  // 현재 프로젝트의 작업 목록
  const projectTasks = tasks.filter(task => task.projectId === id);
  
  // 완료된 작업 수
  const completedTaskCount = projectTasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  
  // 새 작업 추가 핸들러
  const handleAddTask = () => {
    setIsAddingTask(true);
    setTaskModalOpen(true);
  };
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd', { locale: ko });
  };

  const getStatusBadge = (status: ProjectStatus) => {
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

  const calculateProgress = () => {
    // 프로젝트 스토어의 진행률 계산 함수 사용
    const storeProgress = calculateProjectProgress(id);
    
    // 로컬 계산 (백업 방법)
    const total = projectTasks.length;
    if (total === 0) return storeProgress; // 태스크가 없으면 스토어 값 사용
    const localProgress = Math.round((completedTaskCount / total) * 100);
    
    // 진행률 로그 출력 (디버깅용)
    console.log('Project progress calculation:', {
      projectId: id,
      totalTasks: total,
      completedTasks: completedTaskCount,
      localProgress: localProgress,
      storeProgress: storeProgress
    });
    
    // 스토어 값과 로컬 값 비교하여 더 정확한 값 사용
    return storeProgress;
  };

  const progress = calculateProgress();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 프로젝트 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/projects" className="text-gray-500 hover:text-gray-700">
              프로젝트
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            {getStatusBadge(selectedProject.status)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
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
                className="mr-1"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              새 테스크
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
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
                className="mr-1"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              편집
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 flex items-center"
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
                className="mr-1"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              삭제
            </button>
            <button
              onClick={() => {
                // 가장 최근 테스크를 찾아서 편집 모드로 열기
                if (projectTasks.length > 0) {
                  // 날짜 기준으로 정렬하여 가장 최근 테스크 찾기
                  const sortedTasks = [...projectTasks].sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  );
                  const latestTask = sortedTasks[0];
                  
                  // 최근 테스크 편집 모드로 열기
                  setSelectedTask(latestTask);
                  setTaskModalOpen(true);
                } else {
                  // 테스크가 없는 경우 알림
                  toast.error("편집할 테스크가 없습니다. 먼저 테스크를 생성해주세요.");
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
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
                className="mr-1"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              최근 테스크 편집
            </button>
          </div>
        </div>
        {/* 프로젝트 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 프로젝트 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">프로젝트 개요</h2>
              <p className="text-gray-700 mb-4">{selectedProject.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">시작일</h3>
                  <p className="mt-1">{formatDate(selectedProject.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">종료일</h3>
                  <p className="mt-1">{formatDate(selectedProject.endDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">상태</h3>
                  <p className="mt-1">{selectedProject.status === ProjectStatus.IN_PROGRESS ? "진행 중" : selectedProject.status === ProjectStatus.PLANNING ? "계획 중" : "완료됨"}</p>
                </div>

              </div>
            </div>

            {/* 간트 차트 */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">간트 차트</h2>
              <div className="h-[500px]">
                <GanttChart 
                  projectId={id} 
                  startDate={selectedProject.startDate} 
                  endDate={selectedProject.endDate} 
                />
              </div>
            </div>
          </div>

          {/* 오른쪽: 팀 정보 */}
          <div>
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">팀 멤버</h2>
                <button className="text-sm text-primary hover:underline">
                  멤버 추가
                </button>
              </div>
              <ul className="space-y-4">
                {selectedProject.users && selectedProject.users.length > 0 ? (
                  selectedProject.users.map((member) => (
                    <li key={member.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{member.name ? member.name.charAt(0) : member.email.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name || member.email.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">
                          {member.role === "ADMIN" ? "관리자" : 
                           member.role === "EDITOR" ? "편집자" : "뷰어"}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-500 py-4">
                    팀원이 없습니다.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* 테스크 모달 */}
      {isTaskModalOpen && (
        <TaskModal 
          projectId={id}
          task={selectedTask}
          onTaskAdded={() => {
            if (isAddingTask) {
              toast.success("새 테스크가 추가되었습니다.");
              setIsAddingTask(false);
            } else if (selectedTask) {
              toast.success("테스크가 업데이트되었습니다.");
              setSelectedTask(null);
            }
          }}
        />
      )}
      
      {/* 프로젝트 편집 모달 */}
      {isEditModalOpen && selectedProject && (
        <ProjectEditModal
          project={selectedProject}
          onCloseAction={`/projects/${id}`}
          onSaveAction={`/projects/${id}`}
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
