import { useState } from 'react';
import type { AppState, Goal, CheckInRecord, EnergyLevel, View, WeeklyPlan } from '@/types';
import { loadState, saveState, addCheckIn, getConsecutiveMissedDays, getTodayKey } from '@/lib/store';
import { generateWeeklyPlan, getTodayPlan } from '@/lib/planner';
import { Landing } from '@/pages/Landing';
import { Onboarding } from '@/pages/Onboarding';
import { Daily } from '@/pages/Daily';
import { Dashboard } from '@/pages/Dashboard';
import { Replan } from '@/pages/Replan';
import { Report } from '@/pages/Report';
import { ModeToggle } from '@/components/mode-toggle';

const DEMO_GOAL: Goal = {
  examName: 'ENEM 2026',
  examDate: '2026-11-08',
  subjects: [
    { id: '1', name: 'Matematica', priority: 'high', color: 'oklch(0.42 0.13 152)' },
    { id: '2', name: 'Portugues', priority: 'high', color: 'oklch(0.58 0.12 200)' },
    { id: '3', name: 'Historia', priority: 'medium', color: 'oklch(0.72 0.15 80)' },
    { id: '4', name: 'Ciencias da Natureza', priority: 'medium', color: 'oklch(0.65 0.18 30)' },
    { id: '5', name: 'Ingles', priority: 'low', color: 'oklch(0.55 0.12 250)' },
  ],
  weeklyHours: 20,
  dailyAvailableHours: 3.5,
  createdAt: new Date().toISOString(),
};

export function App() {
  const [state, setState] = useState<AppState>(() => loadState());

  const view = state.currentView;

  function navigate(v: View) {
    setState(prev => {
      const next = { ...prev, currentView: v };
      saveState({ currentView: v });
      return next;
    });
  }

  function handleStartOnboarding() {
    if (state.hasCompletedOnboarding && state.goal && state.weeklyPlan) {
      navigate('dashboard');
    } else {
      navigate('onboarding');
    }
  }

  function handleOnboardingComplete(goal: Goal) {
    const plan = generateWeeklyPlan(goal);
    const nextState: Partial<AppState> = {
      goal,
      weeklyPlan: plan,
      hasCompletedOnboarding: true,
      currentView: 'daily',
    };
    setState(prev => ({ ...prev, ...nextState }));
    saveState(nextState);
  }

  function handleDemoStart() {
    const plan = generateWeeklyPlan(DEMO_GOAL);
    const nextState: Partial<AppState> = {
      goal: DEMO_GOAL,
      weeklyPlan: plan,
      hasCompletedOnboarding: true,
      currentView: 'daily',
    };
    setState(prev => ({ ...prev, ...nextState }));
    saveState(nextState);
  }

  function handleCheckIn(completed: boolean, energy: EnergyLevel, completedBlocks: string[]) {
    const record: CheckInRecord = {
      date: getTodayKey(),
      completed,
      energy,
      completedBlocks,
    };
    addCheckIn(record);
    setState(prev => {
      const checkIns = [...prev.checkIns.filter(c => c.date !== record.date), record];
      const missed = getConsecutiveMissedDays(checkIns);
      const plan = prev.weeklyPlan
        ? { ...prev.weeklyPlan, consecutiveMissedDays: missed, isReplanNeeded: missed >= 2 }
        : prev.weeklyPlan;
      saveState({ checkIns, weeklyPlan: plan ?? undefined });
      return { ...prev, checkIns, weeklyPlan: plan };
    });
    navigate('dashboard');
  }

  function handleReplanConfirm(droppedSubjectIds: string[]) {
    if (!state.goal || !state.weeklyPlan) return;

    const filteredGoal = droppedSubjectIds.length > 0
      ? { ...state.goal, subjects: state.goal.subjects.filter(s => !droppedSubjectIds.includes(s.id)) }
      : state.goal;

    const newPlan = generateWeeklyPlan(filteredGoal, true);
    const updatedPlan: WeeklyPlan = { ...newPlan, consecutiveMissedDays: 0, isReplanNeeded: false };

    setState(prev => {
      saveState({ weeklyPlan: updatedPlan });
      return { ...prev, weeklyPlan: updatedPlan, currentView: 'daily' };
    });
  }

  const consecutiveMissed = state.checkIns ? getConsecutiveMissedDays(state.checkIns) : 0;
  const todayPlan = state.weeklyPlan ? getTodayPlan(state.weeklyPlan) : null;

  if (view === 'landing') {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <ModeToggle />
        </div>
        <Landing onStart={handleStartOnboarding} />
        <button
          onClick={handleDemoStart}
          className="fixed bottom-6 right-6 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Ver demo com dados de exemplo
        </button>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onBack={() => navigate('landing')}
      />
    );
  }

  if (!state.goal || !state.weeklyPlan) {
    return null;
  }

  if (view === 'daily') {
    if (!todayPlan) {
      return (
        <Dashboard
          plan={state.weeklyPlan}
          goal={state.goal}
          checkIns={state.checkIns}
          onGoToDay={() => navigate('daily')}
          onReplan={() => navigate('replan')}
          onReport={() => navigate('report')}
        />
      );
    }
    return (
      <Daily
        plan={todayPlan}
        goal={state.goal}
        consecutiveMissedDays={consecutiveMissed}
        onCheckIn={handleCheckIn}
        onReplan={() => navigate('replan')}
        onNavigate={(v) => navigate(v)}
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        plan={state.weeklyPlan}
        goal={state.goal}
        checkIns={state.checkIns}
        onGoToDay={() => navigate('daily')}
        onReplan={() => navigate('replan')}
        onReport={() => navigate('report')}
      />
    );
  }

  if (view === 'replan') {
    return (
      <Replan
        plan={state.weeklyPlan}
        goal={state.goal}
        consecutiveMissedDays={consecutiveMissed}
        onConfirm={handleReplanConfirm}
        onBack={() => navigate(state.hasCompletedOnboarding ? 'daily' : 'dashboard')}
      />
    );
  }

  if (view === 'report') {
    return (
      <Report
        plan={state.weeklyPlan}
        goal={state.goal}
        checkIns={state.checkIns}
        onBack={() => navigate('dashboard')}
      />
    );
  }

  return null;
}

export default App;
