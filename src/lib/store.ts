import type { AppState, Goal, WeeklyPlan, CheckInRecord, View, LearningLevel } from '@/types';

const STORAGE_KEY = 'trilha_state';

const defaultState: AppState = {
  goal: null,
  weeklyPlan: null,
  checkIns: [],
  currentView: 'landing',
  hasCompletedOnboarding: false,
  subscriptionPlan: 'free',
};

const DEFAULT_LEARNING_LEVEL: LearningLevel = 'enem_vestibular';

function normalizeGoal(goal: Goal | null | undefined): Goal | null {
  if (!goal) return null;
  return {
    ...goal,
    learningLevel: goal.learningLevel ?? DEFAULT_LEARNING_LEVEL,
    subjects: goal.subjects.map(subject => ({
      ...subject,
      studyContents: subject.studyContents ?? [],
    })),
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState,
      ...parsed,
      goal: normalizeGoal(parsed.goal),
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: Partial<AppState>): void {
  try {
    const current = loadState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
  } catch {
    // silent fail
  }
}

export function setGoal(goal: Goal): void {
  saveState({ goal, hasCompletedOnboarding: true });
}

export function setWeeklyPlan(plan: WeeklyPlan): void {
  saveState({ weeklyPlan: plan });
}

export function addCheckIn(record: CheckInRecord): void {
  const state = loadState();
  const existing = state.checkIns.filter(c => c.date !== record.date);
  saveState({ checkIns: [...existing, record] });
}

export function setView(view: View): void {
  saveState({ currentView: view });
}

export function resetState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getConsecutiveMissedDays(checkIns: CheckInRecord[]): number {
  const today = new Date();
  let missed = 0;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = checkIns.find(c => c.date === dateStr);
    if (!entry || !entry.completed) {
      missed++;
    } else {
      break;
    }
  }
  return missed;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
