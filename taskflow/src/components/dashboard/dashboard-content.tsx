"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isBefore, addDays } from "date-fns";
import { ko } from "date-fns/locale";

import { useProjectStore } from "@/store/use-project-store";
import { useTaskStore } from "@/store/use-task-store";
import { ProjectStatus, TaskStatus } from "@/types";

// 상태 변경 로그 타입
interface ActivityLog {
  id: string;
  action: string;
  task: string;
  user: string | null;
  timestamp: string;
}

interface DashboardContentProps {
  userName?: string | null;
}

export function DashboardContent({ userName = "사용자" }: DashboardContentProps) {
  const { projects, isLoading: isProjectsLoading } = useProjectStore();
  const { tasks, isLoading: isTasksLoading } = useTaskStore();
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 상태 변경 로그 가져오기 (실제로는 API에서 가져올 것)
  useEffect(() => {
    // 새로운 테스크와 프로젝트를 기반으로 활동 로그 생성
    const generateActivityLogs = () => {
      const logs: ActivityLog[] = [];
      
      // 최근에 생성된 프로젝트와 테스크를 기반으로 활동 로그 생성
      const recentProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2);
        
      const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      // 프로젝트 기반 활동 로그
      recentProjects.forEach((project, index) => {
        // createdAt이 Date 객체인지 문자열인지 확인하여 적절히 처리
        const timestamp = project.createdAt instanceof Date
          ? project.createdAt.toISOString()
          : typeof project.createdAt === 'string'
            ? project.createdAt
            : new Date().toISOString(); // 기본값으로 현재 시간 사용
            
        logs.push({
          id: `project-${project.id}`,
          action: "새 프로젝트 생성",
          task: project.name,
          user: userName,
          timestamp: timestamp
        });
      });
      
      // 테스크 기반 활동 로그
      recentTasks.forEach((task) => {
        const action = task.status === TaskStatus.COMPLETED 
          ? "테스크 완료" 
          : task.status === TaskStatus.IN_PROGRESS 
            ? "테스크 진행 중" 
            : "새 테스크 생성";
        
        // updatedAt이 Date 객체인지 문자열인지 확인하여 적절히 처리
        const timestamp = task.updatedAt instanceof Date
          ? task.updatedAt.toISOString()
          : typeof task.updatedAt === 'string'
            ? task.updatedAt
            : new Date().toISOString(); // 기본값으로 현재 시간 사용
            
        logs.push({
          id: `task-${task.id}`,
          action,
          task: task.title,
          user: userName,
          timestamp: timestamp
        });
      });
      
      // 시간순 정렬
      return logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };
    
    if (!isProjectsLoading && !isTasksLoading) {
      setActivityLogs(generateActivityLogs());
      setIsLoading(false);
    }
  }, [projects, tasks, isProjectsLoading, isTasksLoading, userName]);
  
  // 프로젝트 통계 계산
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
    completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
    planning: projects.filter(p => p.status === ProjectStatus.PLANNING).length
  };
  
  // 테스크 통계 계산
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length
  };
  
  // 다가오는 마감일 계산 (7일 이내)
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const upcomingDeadlines = tasks
    .filter(task => {
      const endDate = new Date(task.endDate);
      return isBefore(endDate, nextWeek) && !isBefore(endDate, today) && task.status !== TaskStatus.COMPLETED;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 프로젝트 통계 */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold">프로젝트 현황</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">전체 프로젝트</p>
                <p className="text-2xl font-bold">{projectStats.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">진행 중</p>
                <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">계획 중</p>
                <p className="text-2xl font-bold text-amber-600">{projectStats.planning}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">완료됨</p>
                <p className="text-2xl font-bold text-blue-600">{projectStats.completed}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 테스크 통계 */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold">테스크 현황</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">전체 테스크</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">할 일</p>
                <p className="text-2xl font-bold text-amber-600">{taskStats.todo}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">진행 중</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.inProgress}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">완료됨</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.completed}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 다가오는 마감일 & 활동 로그 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 다가오는 마감일 */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold">다가오는 마감일 (7일 이내)</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : upcomingDeadlines.length > 0 ? (
              <ul className="space-y-3">
                {upcomingDeadlines.map((task) => (
                  <li key={task.id} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2" />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="mr-2">마감일: {format(new Date(task.endDate), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${
                          task.status === TaskStatus.IN_PROGRESS ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status === TaskStatus.IN_PROGRESS ? '진행 중' : '할 일'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>다가오는 마감일이 없습니다</p>
                <Link href="/projects" className="mt-2 text-primary hover:underline">
                  프로젝트 보기
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* 최근 활동 */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold">최근 활동</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : activityLogs.length > 0 ? (
              <ul className="space-y-3">
                {activityLogs.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2" />
                    <div>
                      <p className="font-medium">
                        {activity.user}님이 "{activity.task}" 테스크를 {activity.action}했습니다.
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>최근 활동이 없습니다</p>
                <Link href="/projects/new" className="mt-2 text-primary hover:underline">
                  새 프로젝트 시작하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 프로젝트 바로가기 */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="font-semibold mb-4">프로젝트 바로가기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* 새 프로젝트 생성 버튼 */}
          <Link 
            href="/projects/new" 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"
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
          
          {/* 최근 프로젝트 표시 */}
          {projects.slice(0, 2).map(project => (
            <Link 
              key={project.id}
              href={`/projects/${project.id}`} 
              className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  project.status === ProjectStatus.IN_PROGRESS ? 'bg-green-100 text-green-800' :
                  project.status === ProjectStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {project.status === ProjectStatus.IN_PROGRESS ? '진행 중' :
                   project.status === ProjectStatus.COMPLETED ? '완료됨' : '계획 중'}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(project.updatedAt), 'yyyy-MM-dd', { locale: ko })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
