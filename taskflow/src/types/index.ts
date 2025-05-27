// 테스크 우선순위 열거형
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

// 테스크 상태 열거형
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

// 프로젝트 상태 열거형
export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD"
}

// 사용자 역할 열거형
export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
  USER = "USER"
}

// 테스크 인터페이스
export interface Task {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  progress: number;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assigneeId: string | null;
  parentTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 프로젝트 인터페이스
export interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 인터페이스
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
}

// 관계가 포함된 테스크 인터페이스
export interface TaskWithRelations extends Task {
  assignee?: User | null;
  subTasks?: TaskWithRelations[];
  dependencies?: TaskWithRelations[];
  project?: Project;
}

// 관계가 포함된 프로젝트 인터페이스
export interface ProjectWithRelations extends Project {
  users?: User[];
  tasks?: TaskWithRelations[];
  _count?: {
    tasks: number;
  };
  // 프로젝트 진행률 계산을 위한 속성
  taskCount?: number;
  completedTaskCount?: number;
}
