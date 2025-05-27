"use client";

import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/use-task-store';

interface GanttSidebarProps {
  tasks: Task[];
}

export const GanttSidebar: React.FC<GanttSidebarProps> = ({ tasks }) => {
  const { selectTask, setTaskModalOpen } = useTaskStore();
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-green-100 text-green-800';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleTaskClick = (task: Task) => {
    selectTask(task);
    setTaskModalOpen(true);
  };
  
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={cn(
            "h-10 flex items-center px-4 border-b hover:bg-muted/50 cursor-pointer",
            index % 2 === 0 && "bg-muted/20"
          )}
          onClick={() => handleTaskClick(task)}
        >
          <div className="flex-1 truncate">
            <span className="font-medium">{task.title}</span>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              getPriorityColor(task.priority)
            )}>
              {task.priority}
            </span>
            
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              getStatusColor(task.status)
            )}>
              {task.status === 'TODO' ? '할 일' : 
               task.status === 'IN_PROGRESS' ? '진행 중' : '완료'}
            </span>
            
            <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="flex items-center justify-center h-20 text-muted-foreground">
          테스크가 없습니다
        </div>
      )}
    </div>
  );
};
