"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Task, TaskPriority, TaskStatus, TaskWithRelations } from '@/types';
import { format } from 'date-fns';

import { useTaskStore } from '@/store/use-task-store';
import { cn } from '@/lib/utils';

interface TaskFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
}

interface TaskModalProps {
  projectId?: string;
  task?: TaskWithRelations | null;
  onTaskAdded?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ projectId, task, onTaskAdded }) => {
  const { selectedTask, isTaskModalOpen, setTaskModalOpen, updateTask, deleteTask, addTask, selectTask } = useTaskStore();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setDate(new Date().getDate() + 3)), 'yyyy-MM-dd'),
      progress: 0,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assigneeId: '',
    }
  });
  
  // 선택한 테스크가 변경되면 폼 값 업데이트
  useEffect(() => {
    // 외부에서 전달받은 task가 있으면 해당 task 사용
    const taskToUse = task || selectedTask;
    
    if (taskToUse) {
      // 외부에서 전달받은 task가 있으면 selectTask로 설정
      if (task && !selectedTask) {
        selectTask(task);
      }
      
      setValue('title', taskToUse.title);
      setValue('description', taskToUse.description || '');
      setValue('startDate', format(new Date(taskToUse.startDate), 'yyyy-MM-dd'));
      setValue('endDate', format(new Date(taskToUse.endDate), 'yyyy-MM-dd'));
      setValue('progress', taskToUse.progress);
      setValue('priority', taskToUse.priority);
      setValue('status', taskToUse.status);
      setValue('assigneeId', taskToUse.assigneeId || '');
    } else {
      reset(); // 새 테스크 모드일 때 폼 초기화
    }
  }, [selectedTask, task, selectTask, setValue, reset]);
  
  const onSubmit = (data: TaskFormData) => {
    try {
      if (selectedTask) {
        // 기존 테스크 업데이트
        const updatedTask = {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          updatedAt: new Date()
        };
        
        updateTask(selectedTask.id, updatedTask);
        console.log('테스크 업데이트 성공:', selectedTask.id);
        
        // 현재 선택된 테스크도 업데이트
        selectTask({
          ...selectedTask,
          ...updatedTask
        } as TaskWithRelations);
        
        // 성공 피드백 표시
        const feedbackElement = document.createElement('div');
        feedbackElement.textContent = '테스크가 업데이트되었습니다';
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.top = '20px';
        feedbackElement.style.left = '50%';
        feedbackElement.style.transform = 'translateX(-50%)';
        feedbackElement.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
        feedbackElement.style.color = 'white';
        feedbackElement.style.padding = '8px 12px';
        feedbackElement.style.borderRadius = '4px';
        feedbackElement.style.zIndex = '9999';
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(() => {
          document.body.removeChild(feedbackElement);
        }, 2000);
        
        setTaskModalOpen(false);
      } else if (projectId) {
        // 새 테스크 추가
        const newTask = {
          id: `task-${Date.now()}`,
          title: data.title,
          description: data.description || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          progress: data.progress,
          priority: data.priority,
          status: data.status,
          projectId: projectId,
          assigneeId: data.assigneeId || null,
          parentTaskId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        addTask(newTask);
        console.log('새 테스크 추가 성공:', newTask.id);
        setTaskModalOpen(false);
        reset(); // 폼 초기화
        
        // 콜백 호출
        if (onTaskAdded) {
          onTaskAdded();
        }
      }
    } catch (error) {
      console.error('테스크 저장 오류:', error);
      
      // 오류 피드백 표시
      const errorElement = document.createElement('div');
      errorElement.textContent = '테스크 저장 중 오류가 발생했습니다';
      errorElement.style.position = 'fixed';
      errorElement.style.top = '20px';
      errorElement.style.left = '50%';
      errorElement.style.transform = 'translateX(-50%)';
      errorElement.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
      errorElement.style.color = 'white';
      errorElement.style.padding = '8px 12px';
      errorElement.style.borderRadius = '4px';
      errorElement.style.zIndex = '9999';
      
      document.body.appendChild(errorElement);
      
      setTimeout(() => {
        document.body.removeChild(errorElement);
      }, 3000);
    }
  };
  
  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setTaskModalOpen(false);
    }
  };
  
  if (!isTaskModalOpen) {
    return null;
  }
  
  // 새 테스크 생성 모드인지 확인
  const isNewTask = !selectedTask;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{isNewTask ? '새 테스크 추가' : '테스크 상세'}</h2>
            <button
              onClick={() => setTaskModalOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  제목
                </label>
                <input
                  {...register('title', { required: '제목은 필수입니다' })}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md",
                    errors.title ? "border-red-500" : "border-input"
                  )}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
              
              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  설명
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              
              {/* 날짜 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    {...register('startDate', { required: '시작일은 필수입니다' })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md",
                      errors.startDate ? "border-red-500" : "border-input"
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    {...register('endDate', { required: '종료일은 필수입니다' })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md",
                      errors.endDate ? "border-red-500" : "border-input"
                    )}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
              
              {/* 진행률 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  진행률: <span id="progress-value">{isNewTask ? '0%' : `${selectedTask?.progress || 0}%`}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  {...register('progress', { valueAsNumber: true })}
                  className="w-full"
                  onChange={(e) => {
                    const progressValue = document.getElementById('progress-value');
                    if (progressValue) {
                      progressValue.textContent = `${e.target.value}%`;
                    }
                  }}
                />
              </div>
              
              {/* 우선순위 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  우선순위
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="LOW">낮음</option>
                  <option value="MEDIUM">중간</option>
                  <option value="HIGH">높음</option>
                  <option value="URGENT">긴급</option>
                </select>
              </div>
              
              {/* 상태 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  상태
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="TODO">할 일</option>
                  <option value="IN_PROGRESS">진행 중</option>
                  <option value="COMPLETED">완료</option>
                </select>
              </div>
              
              {/* 버튼 */}
              <div className="flex justify-between pt-4">
                {!isNewTask && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    삭제
                  </button>
                )}
                {isNewTask && <div></div>} {/* 새 테스크일 때 좌측 공간 유지 */}
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(false)}
                    className="px-4 py-2 border border-input rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    {isNewTask ? '추가' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
