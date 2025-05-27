import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Project, ProjectStatus, ProjectWithRelations, TaskStatus, User, UserRole } from '@/types';
import { useTaskStore } from './use-task-store';

// 프로젝트 스토어 상태 인터페이스 정의
interface ProjectState {
  projects: ProjectWithRelations[];
  selectedProject: ProjectWithRelations | null;
  isProjectModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setProjects: (projects: ProjectWithRelations[]) => void;
  addProject: (project: ProjectWithRelations) => void;
  updateProject: (projectId: string, data: Partial<ProjectWithRelations>) => void;
  deleteProject: (projectId: string) => void;
  selectProject: (project: ProjectWithRelations | null) => void;
  setProjectModalOpen: (isOpen: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 프로젝트 관리
  changeProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
  addUserToProject: (projectId: string, user: User) => void;
  removeUserFromProject: (projectId: string, userId: string) => void;
  
  // 프로젝트 진행률 관리
  calculateProjectProgress: (projectId: string) => number;
}

// Zustand 스토어 생성 - localStorage에 저장되도록 persist 미들웨어 사용
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      // 초기 상태
      projects: [],
      selectedProject: null,
      isProjectModalOpen: false,
      isLoading: false,
      error: null,
      
      // 기본 액션
      setProjects: (projects: ProjectWithRelations[]) => set({ projects }),
      
      addProject: (project: ProjectWithRelations) => set((state: ProjectState) => ({ 
        projects: [...state.projects, project] 
      })),
      
      updateProject: (projectId: string, data: Partial<ProjectWithRelations>) => set((state: ProjectState) => {
        // 프로젝트 목록 업데이트
        const updatedProjects = state.projects.map((project) => 
          project.id === projectId ? { ...project, ...data } : project
        );
        
        // 현재 선택된 프로젝트가 업데이트 대상이면 함께 업데이트
        const updatedSelectedProject = state.selectedProject && state.selectedProject.id === projectId
          ? { ...state.selectedProject, ...data }
          : state.selectedProject;
        
        console.log('프로젝트 업데이트:', { projectId, data, updatedSelectedProject });
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject
        };
      }),
      
      deleteProject: (projectId: string) => set((state: ProjectState) => {
        console.log('프로젝트 삭제:', projectId);
        
        // 프로젝트 목록에서 삭제
        const filteredProjects = state.projects.filter((project) => project.id !== projectId);
        
        // 현재 선택된 프로젝트가 삭제 대상이면 선택 해제
        const updatedSelectedProject = state.selectedProject && state.selectedProject.id === projectId
          ? null
          : state.selectedProject;
        
        return {
          projects: filteredProjects,
          selectedProject: updatedSelectedProject
        };
      }),
      
      selectProject: (project: ProjectWithRelations | null) => set({ selectedProject: project }),
      
      setProjectModalOpen: (isOpen: boolean) => set({ isProjectModalOpen: isOpen }),
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
      
      setError: (error: string | null) => set({ error }),
      
      // 프로젝트 관리 기능
      changeProjectStatus: (projectId: string, newStatus: ProjectStatus) => set((state: ProjectState) => {
        // 프로젝트 목록에서 상태 변경
        const updatedProjects = state.projects.map((project) => 
          project.id === projectId 
            ? { ...project, status: newStatus } 
            : project
        );
        
        // 현재 선택된 프로젝트가 상태 변경 대상이면 함께 업데이트
        const updatedSelectedProject = state.selectedProject && state.selectedProject.id === projectId
          ? { ...state.selectedProject, status: newStatus }
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject
        };
      }),
      
      addUserToProject: (projectId: string, user: User) => set((state: ProjectState) => ({
        projects: state.projects.map((project) => 
          project.id === projectId 
            ? { 
                ...project, 
                users: [...(project.users || []), {
                  ...user,
                  role: user.role || UserRole.VIEWER // 기본 역할 설정
                }] 
              } 
            : project
        )
      })),
      
      removeUserFromProject: (projectId: string, userId: string) => set((state: ProjectState) => ({
        projects: state.projects.map((project) => 
          project.id === projectId 
            ? { 
                ...project, 
                users: (project.users || []).filter(u => u.id !== userId) 
              } 
            : project
        )
      })),
      
      // 프로젝트 진행률 계산 함수
      calculateProjectProgress: (projectId: string) => {
        // 현재 스토어 상태 가져오기
        const state = useTaskStore.getState();
        const tasks = state.tasks.filter((task) => task.projectId === projectId);
        
        // 프로젝트에 할당된 태스크가 없는 경우
        if (tasks.length === 0) return 0;
        
        // 완료된 태스크 수 계산
        const completedTasks = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
        
        // 진행률 계산
        const progress = Math.round((completedTasks / tasks.length) * 100);
        
        return progress;
      },
    }),
    {
      name: 'project-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소로 localStorage 사용
    }
  )
);
