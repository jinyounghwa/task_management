"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TaskWithRelations } from '@/types';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { differenceInDays } from 'date-fns';

import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/use-task-store';

interface GanttTaskProps {
  task: TaskWithRelations;
  index: number;
  startDate: Date;
  dayWidth: number;
}

export const GanttTask: React.FC<GanttTaskProps> = ({
  task,
  index,
  startDate,
  dayWidth,
}) => {
  const { updateTask, selectTask, setTaskModalOpen } = useTaskStore();
  const dragControls = useDragControls();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // 테스크 시작일과 종료일
  const taskStartDate = new Date(task.startDate);
  const taskEndDate = new Date(task.endDate);
  
  // 시작 위치 계산 (시작일로부터의 일수 * 일 너비)
  const startPosition = differenceInDays(taskStartDate, startDate) * dayWidth;
  
  // 테스크 바 너비 계산 (기간 * 일 너비)
  const duration = differenceInDays(taskEndDate, taskStartDate) + 1;
  const width = duration * dayWidth;
  
  // 우선순위에 따른 색상
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-blue-500';
      case 'MEDIUM':
        return 'bg-green-500';
      case 'HIGH':
        return 'bg-amber-500';
      case 'URGENT':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // 상태에 따른 스타일
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'opacity-70';
      case 'IN_PROGRESS':
        return 'opacity-100';
      case 'COMPLETED':
        return 'opacity-90 bg-opacity-70';
      default:
        return '';
    }
  };
  
  // 드래그 시작 핸들러
  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
    // 사용자에게 드래그 시작을 알림
    document.body.style.cursor = 'grabbing';
  };
  
  // 드래그 종료 핸들러
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
    
    // 이동된 일수 계산
    const daysMoved = Math.round(info.offset.x / dayWidth);
    
    if (daysMoved !== 0) {
      // 새 시작일과 종료일 계산
      const newStartDate = new Date(taskStartDate);
      newStartDate.setDate(taskStartDate.getDate() + daysMoved);
      
      const newEndDate = new Date(taskEndDate);
      newEndDate.setDate(taskEndDate.getDate() + daysMoved);
      
      // 테스크 업데이트
      if (task.id) {
        updateTask(task.id, {
          startDate: newStartDate,
          endDate: newEndDate,
        });
        
        // 사용자에게 이동 피드백 제공
        const feedbackElement = document.createElement('div');
        feedbackElement.textContent = `테스크 이동됨: ${daysMoved > 0 ? '+' : ''}${daysMoved}일`;
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.top = '20px';
        feedbackElement.style.left = '50%';
        feedbackElement.style.transform = 'translateX(-50%)';
        feedbackElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        feedbackElement.style.color = 'white';
        feedbackElement.style.padding = '8px 12px';
        feedbackElement.style.borderRadius = '4px';
        feedbackElement.style.zIndex = '9999';
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(() => {
          document.body.removeChild(feedbackElement);
        }, 2000);
      }
    }
  };
  
  // 리사이징 핸들러
  const handleResize = (e: React.PointerEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    setIsResizing(true);
    document.body.style.cursor = direction === 'left' ? 'w-resize' : 'e-resize';
    
    const startX = e.clientX;
    const originalStartDate = new Date(taskStartDate);
    const originalEndDate = new Date(taskEndDate);
    let feedbackElement: HTMLDivElement | null = null;
    
    // 피드백 요소 생성
    feedbackElement = document.createElement('div');
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.top = '20px';
    feedbackElement.style.left = '50%';
    feedbackElement.style.transform = 'translateX(-50%)';
    feedbackElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    feedbackElement.style.color = 'white';
    feedbackElement.style.padding = '8px 12px';
    feedbackElement.style.borderRadius = '4px';
    feedbackElement.style.zIndex = '9999';
    document.body.appendChild(feedbackElement);
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const daysDelta = Math.round(deltaX / dayWidth);
      
      if (feedbackElement) {
        feedbackElement.textContent = direction === 'left' ? 
          `시작일 조정: ${daysDelta > 0 ? '+' : ''}${daysDelta}일` : 
          `종료일 조정: ${daysDelta > 0 ? '+' : ''}${daysDelta}일`;
      }
      
      if (daysDelta !== 0) {
        if (direction === 'left') {
          // 왼쪽 리사이징 (시작일 변경)
          const newStartDate = new Date(originalStartDate);
          newStartDate.setDate(originalStartDate.getDate() + daysDelta);
          
          // 시작일이 종료일보다 이후가 되지 않도록
          if (newStartDate < taskEndDate) {
            updateTask(task.id, { startDate: newStartDate });
          }
        } else {
          // 오른쪽 리사이징 (종료일 변경)
          const newEndDate = new Date(originalEndDate);
          newEndDate.setDate(originalEndDate.getDate() + daysDelta);
          
          // 종료일이 시작일보다 이전이 되지 않도록
          if (newEndDate > taskStartDate) {
            updateTask(task.id, { endDate: newEndDate });
          }
        }
      }
    };
    
    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (feedbackElement) {
        document.body.removeChild(feedbackElement);
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  // 테스크 클릭 핸들러
  const handleTaskClick = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) {
      selectTask(task);
      setTaskModalOpen(true);
    }
  };
  
  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        top: `${index * 40 + 1}px`,
        left: `${startPosition}px`,
        width: `${width}px`,
        height: '38px',
        zIndex: isDragging || isResizing ? 20 : 10,
      }}
      drag="x"
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleTaskClick}
    >
      {/* 테스크 바 */}
      <div
        className={cn(
          "h-full rounded-md px-2 flex items-center justify-between text-white text-sm shadow-sm",
          getPriorityColor(task.priority),
          getStatusStyle(task.status),
          "border border-white/20",
          isDragging && "ring-2 ring-white ring-opacity-50",
          isResizing && "ring-2 ring-yellow-300 ring-opacity-70"
        )}
      >
        {/* 테스크 제목 */}
        <div className="truncate flex-1 mr-2">
          {task.title}
        </div>
        
        {/* 진행률 */}
        <div className="text-xs font-medium bg-white/20 px-1.5 py-0.5 rounded-full">
          {task.progress}%
        </div>
      </div>
      
      {/* 왼쪽 리사이징 핸들 */}
      <div
        className="absolute left-0 top-0 w-3 h-full cursor-ew-resize"
        onPointerDown={(e) => handleResize(e, 'left')}
      />
      
      {/* 오른쪽 리사이징 핸들 */}
      <div
        className="absolute right-0 top-0 w-3 h-full cursor-ew-resize"
        onPointerDown={(e) => handleResize(e, 'right')}
      />
    </motion.div>
  );
};
