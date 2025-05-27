"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { MainLayout } from "@/components/layout/main-layout";
import { useTaskStore } from "@/store/use-task-store";
import { useProjectStore } from "@/store/use-project-store";
import { TaskStatus, TaskPriority } from "@/types";
import { TaskModal } from "@/components/gantt/task-modal";

export default function TasksPage() {
  const { tasks, isLoading, selectTask, setTaskModalOpen } = useTaskStore();
  const { projects } = useProjectStore();
  
  const [filter, setFilter] = useState({
    status: "ALL",
    priority: "ALL",
    projectId: "ALL",
    search: "",
  });
  
  // 테스크 필터링
  const filteredTasks = tasks.filter(task => {
    // 상태 필터
    if (filter.status !== "ALL" && task.status !== filter.status) {
      return false;
    }
    
    // 우선순위 필터
    if (filter.priority !== "ALL" && task.priority !== filter.priority) {
      return false;
    }
    
    // 프로젝트 필터
    if (filter.projectId !== "ALL" && task.projectId !== filter.projectId) {
      return false;
    }
    
    // 검색어 필터
    if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 테스크 정렬 (마감일 순)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
  
  // 프로젝트 이름 가져오기
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "알 수 없는 프로젝트";
  };
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd', { locale: ko });
  };
  
  // 우선순위에 따른 색상
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-blue-100 text-blue-800";
      case TaskPriority.MEDIUM:
        return "bg-green-100 text-green-800";
      case TaskPriority.HIGH:
        return "bg-amber-100 text-amber-800";
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // 우선순위 텍스트
  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "낮음";
      case TaskPriority.MEDIUM:
        return "중간";
      case TaskPriority.HIGH:
        return "높음";
      case TaskPriority.URGENT:
        return "긴급";
      default:
        return "";
    }
  };
  
  // 상태 텍스트
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "할 일";
      case TaskStatus.IN_PROGRESS:
        return "진행 중";
      case TaskStatus.COMPLETED:
        return "완료";
      default:
        return "";
    }
  };
  
  // 상태에 따른 스타일
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };
  
  // 테스크 클릭 핸들러
  const handleTaskClick = (task: any) => {
    selectTask(task);
    setTaskModalOpen(true);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">테스크</h1>
        </div>
        
        {/* 필터 */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">모든 상태</option>
                <option value={TaskStatus.TODO}>할 일</option>
                <option value={TaskStatus.IN_PROGRESS}>진행 중</option>
                <option value={TaskStatus.COMPLETED}>완료</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우선순위
              </label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">모든 우선순위</option>
                <option value={TaskPriority.LOW}>낮음</option>
                <option value={TaskPriority.MEDIUM}>중간</option>
                <option value={TaskPriority.HIGH}>높음</option>
                <option value={TaskPriority.URGENT}>긴급</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트
              </label>
              <select
                value={filter.projectId}
                onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">모든 프로젝트</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                placeholder="테스크 이름 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* 테스크 목록 */}
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>표시할 테스크가 없습니다.</p>
              <p className="mt-2">새 프로젝트를 생성하고 테스크를 추가해보세요.</p>
              <Link
                href="/projects/new"
                className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                새 프로젝트 생성
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      테스크
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      프로젝트
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      우선순위
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마감일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      진행률
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getProjectName(task.projectId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(task.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-900">{task.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* 테스크 모달 */}
      <TaskModal />
    </MainLayout>
  );
}
