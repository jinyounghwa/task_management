"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskWithRelations } from '@/types';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/use-task-store';
import { GanttTask } from '@/components/gantt/gantt-task';
import { GanttHeader } from '@/components/gantt/gantt-header';
import { GanttSidebar } from '@/components/gantt/gantt-sidebar';

interface GanttChartProps {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  projectId,
  startDate: propStartDate,
  endDate: propEndDate,
}) => {
  const { tasks, isLoading, selectTask, setTaskModalOpen } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // 프로젝트에 속한 태스크만 필터링
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  
  // 타임라인 클릭 핸들러 (새 테스크 추가)
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current || (e.target as HTMLElement).classList.contains('timeline-grid')) {
      // 클릭한 위치에서 날짜 계산
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const offsetX = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
      const clickedDayIndex = Math.floor(offsetX / dayWidth);
      
      if (clickedDayIndex >= 0 && clickedDayIndex < dateRange.length) {
        const clickedDate = new Date(dateRange[clickedDayIndex]);
        const endDate = new Date(clickedDate);
        endDate.setDate(endDate.getDate() + 2); // 기본 3일 기간
        
        // 새 테스크를 추가하기 위해 모달 열기
        selectTask(null); // null을 전달하면 모달이 새 테스크 모드로 열림
        setTaskModalOpen(true);
      }
    }
  };
  
  // 시작일과 종료일 계산 (props로 받지 않았을 경우 태스크 기반으로 계산)
  const calculateDateRange = () => {
    if (propStartDate && propEndDate) {
      return { startDate: propStartDate, endDate: propEndDate };
    }
    
    if (projectTasks.length === 0) {
      const today = new Date();
      return {
        startDate: startOfWeek(today, { locale: ko }),
        endDate: endOfWeek(addDays(today, 30), { locale: ko }),
      };
    }
    
    const taskStartDates = projectTasks.map(task => new Date(task.startDate));
    const taskEndDates = projectTasks.map(task => new Date(task.endDate));
    
    const earliestDate = new Date(Math.min(...taskStartDates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...taskEndDates.map(d => d.getTime())));
    
    return {
      startDate: startOfWeek(earliestDate, { locale: ko }),
      endDate: endOfWeek(latestDate, { locale: ko }),
    };
  };
  
  const { startDate, endDate } = calculateDateRange();
  const totalDays = differenceInDays(endDate, startDate) + 1;
  
  // 날짜 배열 생성
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  // 줌 레벨 상태
  const [zoomLevel, setZoomLevel] = useState(100); // 백분율 (100% = 기본 크기)
  const dayWidth = (zoomLevel / 100) * 50; // 기본 너비 50px
  
  // 스크롤 위치 상태
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };
  
  // 휠 이벤트로 줌 인/아웃
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newZoomLevel = Math.min(200, Math.max(50, zoomLevel - e.deltaY / 10));
      setZoomLevel(newZoomLevel);
    }
  };
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel as unknown as EventListener);
      };
    }
  }, [zoomLevel]);
  
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      <div className="flex">
        {/* 좌측 사이드바 (고정) */}
        <div className="w-64 flex-shrink-0 border-r bg-muted/30">
          <div className="h-12 border-b flex items-center px-4 font-medium">
            테스크
          </div>
          <GanttSidebar tasks={projectTasks} />
        </div>
        
        {/* 우측 타임라인 (스크롤 가능) */}
        <div 
          ref={containerRef}
          className="flex-grow overflow-x-auto"
          onScroll={handleScroll}
        >
          {/* 헤더 (날짜) */}
          <GanttHeader 
            dateRange={dateRange} 
            dayWidth={dayWidth} 
            scrollPosition={scrollPosition}
          />
          
          {/* 타임라인 그리드 및 테스크 바 */}
          <div 
            ref={timelineRef}
            className="relative"
            style={{ 
              width: `${totalDays * dayWidth}px`,
              minHeight: `${Math.max(projectTasks.length * 40 + 20, 200)}px`
            }}
            onClick={handleTimelineClick}
          >
            {/* 세로 그리드 라인 */}
            {dateRange.map((date, index) => (
              <div
                key={date.toISOString()}
                className={cn(
                  "absolute top-0 bottom-0 border-r border-border/30 timeline-grid",
                  format(date, 'EEEE', { locale: ko }) === '일요일' && "bg-red-50/10",
                  format(date, 'EEEE', { locale: ko }) === '토요일' && "bg-blue-50/10"
                )}
                style={{
                  left: `${index * dayWidth}px`,
                  width: `${dayWidth}px`,
                  height: '100%'
                }}
              />
            ))}
            
            {/* 테스크 바 */}
            {projectTasks.map((task, index) => (
              <GanttTask
                key={task.id}
                task={task}
                index={index}
                startDate={startDate}
                dayWidth={dayWidth}
              />
            ))}
            
            {/* 오늘 날짜 표시 */}
            {(() => {
              const today = new Date();
              const diffDays = differenceInDays(today, startDate);
              
              if (diffDays >= 0 && diffDays <= totalDays) {
                return (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                    style={{
                      left: `${diffDays * dayWidth}px`,
                      height: '100%'
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
      
      {/* 줄 컨트롤 및 안내 */}
      <div className="flex items-center justify-between p-2 border-t">
        <div className="text-xs text-muted-foreground">
          타임라인을 클릭하여 새 테스크를 추가하거나, 테스크를 드래그하여 이동하고 가장자리를 끌어 기간을 조정하세요.
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            className="p-1 rounded-md hover:bg-muted"
            disabled={zoomLevel <= 50}
          >
            -
          </button>
          <span className="mx-2 text-sm">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            className="p-1 rounded-md hover:bg-muted"
            disabled={zoomLevel >= 200}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
