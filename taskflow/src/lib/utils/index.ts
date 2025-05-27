import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `오늘 ${format(dateObj, "HH:mm", { locale: ko })}`;
  } else if (isYesterday(dateObj)) {
    return `어제 ${format(dateObj, "HH:mm", { locale: ko })}`;
  } else if (isThisWeek(dateObj)) {
    return format(dateObj, "EEEE HH:mm", { locale: ko });
  } else if (isThisMonth(dateObj)) {
    return format(dateObj, "M월 d일", { locale: ko });
  } else {
    return format(dateObj, "yyyy년 M월 d일", { locale: ko });
  }
}

export function formatDateRange(startDate: Date | string, endDate: Date | string) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  
  return `${format(start, "yyyy년 M월 d일", { locale: ko })} - ${format(end, "yyyy년 M월 d일", { locale: ko })}`;
}

export function calculateProgress(startDate: Date | string, endDate: Date | string, progress: number) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = now.getTime() - start.getTime();
  
  // 예상 진행률 (시간 기준)
  const expectedProgress = Math.min(100, Math.max(0, Math.round((elapsedDuration / totalDuration) * 100)));
  
  // 실제 진행률과 예상 진행률 비교
  const isAhead = progress > expectedProgress;
  const isBehind = progress < expectedProgress;
  
  return {
    expectedProgress,
    actualProgress: progress,
    isAhead,
    isBehind,
    diff: progress - expectedProgress
  };
}
