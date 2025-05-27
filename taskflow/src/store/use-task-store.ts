import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Task, TaskPriority, TaskStatus, TaskWithRelations } from '@/types';

// TaskWithRelations는 @/types에서 가져옵니다

interface TaskState {
  tasks: TaskWithRelations[];
  selectedTask: TaskWithRelations | null;
  isTaskModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setTasks: (tasks: TaskWithRelations[]) => void;
  addTask: (task: TaskWithRelations) => void;
  updateTask: (taskId: string, data: Partial<TaskWithRelations>) => void;
  deleteTask: (taskId: string) => void;
  selectTask: (task: TaskWithRelations | null) => void;
  setTaskModalOpen: (isOpen: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 드래그 앤 드롭 관련
  moveTask: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  resizeTask: (taskId: string, newEndDate: Date) => void;
  changeTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  changeTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  changeTaskAssignee: (taskId: string, newAssigneeId: string | null) => void;
}

// Zustand 스토어 생성 - localStorage에 저장되도록 persist 미들웨어 사용
export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
  tasks: [],
  selectedTask: null,
  isTaskModalOpen: false,
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (taskId, data) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId ? { ...task, ...data } : task
    )
  })),
  
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId)
  })),
  
  selectTask: (task) => set({ selectedTask: task }),
  
  setTaskModalOpen: (isOpen) => set({ isTaskModalOpen: isOpen }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  moveTask: (taskId, newStartDate, newEndDate) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, startDate: newStartDate, endDate: newEndDate } 
        : task
    )
  })),
  
  resizeTask: (taskId, newEndDate) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, endDate: newEndDate } 
        : task
    )
  })),
  
  changeTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, status: newStatus } 
        : task
    )
  })),
  
  changeTaskPriority: (taskId, newPriority) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, priority: newPriority } 
        : task
    )
  })),
  
  changeTaskAssignee: (taskId, newAssigneeId) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, assigneeId: newAssigneeId } 
        : task
    )
  })),
    }),
    {
      name: 'task-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소로 localStorage 사용
    }
  )
);
