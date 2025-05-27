"use client";

import React from 'react';
import { format, isWeekend } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface GanttHeaderProps {
  dateRange: Date[];
  dayWidth: number;
  scrollPosition: number;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  dateRange,
  dayWidth,
  scrollPosition,
}) => {
  return (
    <div 
      className="sticky top-0 z-10 border-b bg-background"
      style={{ width: `${dateRange.length * dayWidth}px` }}
    >
      {/* 월 표시 */}
      <div className="flex h-8 border-b">
        {dateRange.reduce((acc, date, index) => {
          const month = format(date, 'M월', { locale: ko });
          const prevMonth = index > 0 ? format(dateRange[index - 1], 'M월', { locale: ko }) : null;
          
          if (month !== prevMonth) {
            // 해당 월의 마지막 날짜 찾기
            let monthEndIndex = dateRange.findIndex((d, i) => 
              i > index && format(d, 'M월', { locale: ko }) !== month
            );
            
            if (monthEndIndex === -1) {
              monthEndIndex = dateRange.length;
            }
            
            const width = (monthEndIndex - index) * dayWidth;
            
            acc.push(
              <div
                key={`month-${month}-${index}`}
                className="flex items-center justify-center border-r font-medium"
                style={{ width: `${width}px` }}
              >
                {month}
              </div>
            );
          }
          
          return acc;
        }, [] as React.ReactNode[])}
      </div>
      
      {/* 일 표시 */}
      <div className="flex h-8">
        {dateRange.map((date, index) => {
          const isWeekDay = !isWeekend(date);
          const day = format(date, 'd', { locale: ko });
          const dayOfWeek = format(date, 'EEE', { locale: ko });
          
          return (
            <div
              key={`day-${date.toISOString()}`}
              className={cn(
                "flex flex-col items-center justify-center border-r text-xs",
                format(date, 'EEEE', { locale: ko }) === '일요일' && "text-red-500 bg-red-50/10",
                format(date, 'EEEE', { locale: ko }) === '토요일' && "text-blue-500 bg-blue-50/10"
              )}
              style={{ width: `${dayWidth}px` }}
            >
              <span className="font-medium">{day}</span>
              <span className="text-muted-foreground">{dayOfWeek}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
