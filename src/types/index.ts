export type EnergyLevel = 'low' | 'medium' | 'high';
export type Priority = 'high' | 'medium' | 'low';
export type View = 'landing' | 'onboarding' | 'dashboard' | 'daily' | 'replan' | 'report';

export interface Subject {
  id: string;
  name: string;
  priority: Priority;
  color: string;
}

export interface Goal {
  examName: string;
  examDate: string;
  subjects: Subject[];
  weeklyHours: number;
  dailyAvailableHours: number;
  createdAt: string;
}

export interface StudyBlock {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  durationMinutes: number;
  type: 'study' | 'review';
  completed: boolean;
  reviewLevel?: number;
}

export interface DayPlan {
  date: string;
  studyBlocks: StudyBlock[];
  reviewBlocks: StudyBlock[];
  pendingBlocks: StudyBlock[];
  checkedIn: boolean;
  energy?: EnergyLevel;
  completionRate: number;
}

export interface WeeklyPlan {
  weekStart: string;
  days: DayPlan[];
  totalPlannedHours: number;
  totalCompletedHours: number;
  consecutiveMissedDays: number;
  isReplanNeeded: boolean;
}

export interface CheckInRecord {
  date: string;
  completed: boolean;
  energy: EnergyLevel;
  completedBlocks: string[];
  notes?: string;
}

export interface AppState {
  goal: Goal | null;
  weeklyPlan: WeeklyPlan | null;
  checkIns: CheckInRecord[];
  currentView: View;
  hasCompletedOnboarding: boolean;
}
