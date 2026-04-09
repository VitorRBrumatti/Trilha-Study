import { CircleCheck as CheckCircle2, Circle, BookOpen, RotateCcw, CircleAlert as AlertCircle, TrendingUp, Clock, Calendar, ChartBar as BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { WeeklyPlan, Goal, CheckInRecord } from '@/types';
import { formatShortDate, getDaysUntilExam } from '@/lib/planner';

interface DashboardProps {
  plan: WeeklyPlan;
  goal: Goal;
  checkIns: CheckInRecord[];
  onGoToDay: () => void;
  onReplan: () => void;
  onReport: () => void;
}

function DayCard({
  day,
  isToday,
  isPast,
  onGoToDay,
  checkIn,
}: {
  day: WeeklyPlan['days'][0];
  isToday: boolean;
  isPast: boolean;
  onGoToDay: () => void;
  checkIn: CheckInRecord | undefined;
}) {
  const totalBlocks = day.studyBlocks.length + day.reviewBlocks.length;
  const hasContent = totalBlocks > 0;
  const hasPending = day.pendingBlocks.length > 0;

  return (
    <button
      onClick={isToday ? onGoToDay : undefined}
      disabled={!isToday && !isPast}
      className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all ${
        isToday
          ? 'border-primary bg-primary/5 hover:bg-primary/8 cursor-pointer ring-1 ring-primary/20'
          : isPast
            ? 'border-border bg-card opacity-75'
            : 'border-dashed border-border bg-muted/30 opacity-50 cursor-default'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`text-xs font-semibold capitalize ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
          {formatShortDate(day.date)}
        </span>
        {isPast && checkIn ? (
          <CheckCircle2 className="size-3.5 text-primary" />
        ) : isPast ? (
          <Circle className="size-3.5 text-muted-foreground" />
        ) : isToday ? (
          <div className="size-2 rounded-full bg-primary animate-pulse" />
        ) : null}
      </div>

      {hasContent && (
        <div className="flex flex-col gap-1 w-full">
          {day.studyBlocks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3 text-primary shrink-0" />
              <span className="text-xs text-foreground">{day.studyBlocks.length} blocos</span>
            </div>
          )}
          {day.reviewBlocks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <RotateCcw className="size-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{day.reviewBlocks.length} revisoes</span>
            </div>
          )}
          {hasPending && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="size-3 text-destructive shrink-0" />
              <span className="text-xs text-destructive">{day.pendingBlocks.length} pendentes</span>
            </div>
          )}
        </div>
      )}

      {isPast && checkIn && (
        <Progress value={Math.round(day.completionRate * 100)} className="h-1 w-full" />
      )}

      {!hasContent && !isPast && (
        <span className="text-xs text-muted-foreground">Descanso</span>
      )}
    </button>
  );
}

export function Dashboard({ plan, goal, checkIns, onGoToDay, onReplan, onReport }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const daysUntilExam = getDaysUntilExam(goal.examDate);
  const totalHours = plan.totalPlannedHours;

  const checkInsByDate = Object.fromEntries(checkIns.map(c => [c.date, c]));

  const weekCompletedDays = plan.days.filter(d => {
    const isPast = d.date < today;
    return isPast && checkInsByDate[d.date]?.completed;
  }).length;

  const weekPastDays = plan.days.filter(d => d.date <= today).length;
  const consistency = weekPastDays > 0 ? Math.round((weekCompletedDays / weekPastDays) * 100) : 0;

  const totalPlannedMinutes = plan.days.reduce((acc, d) => {
    return acc + [...d.studyBlocks, ...d.reviewBlocks].reduce((s, b) => s + b.durationMinutes, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-6 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-primary-foreground/20 rounded flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">T</span>
                </div>
                <span className="text-primary-foreground/80 text-sm font-medium">Trilha</span>
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">{goal.examName}</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                {daysUntilExam > 0 ? `${daysUntilExam} dias restantes` : 'Prova chegou!'}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={onReport}
              className="gap-1.5 text-xs"
            >
              <BarChart3 className="size-3.5" />
              Relatorio
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Constancia', value: `${consistency}%`, icon: TrendingUp },
              { label: 'Horas/semana', value: `${totalHours}h`, icon: Clock },
              { label: 'Dias restantes', value: `${daysUntilExam}d`, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-primary-foreground/10 rounded-lg p-3 text-center">
                <Icon className="size-4 text-primary-foreground/60 mx-auto mb-1" />
                <div className="text-lg font-bold text-primary-foreground">{value}</div>
                <div className="text-xs text-primary-foreground/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {plan.isReplanNeeded && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-warning-foreground">Replanejar semana</p>
            <p className="text-xs text-warning-foreground/80 mt-0.5 mb-3">
              Voce perdeu alguns dias. Vamos redistribuir o que ficou para tras?
            </p>
            <Button size="sm" onClick={onReplan} variant="outline" className="border-warning/30 text-warning-foreground">
              Replanejar agora
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Esta semana</h2>
            <Button variant="ghost" size="sm" onClick={onGoToDay} className="text-primary text-sm gap-1">
              Hoje
              <div className="size-1.5 rounded-full bg-primary" />
            </Button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {plan.days.map(day => {
              const isToday = day.date === today;
              const isPast = day.date < today;
              return (
                <DayCard
                  key={day.date}
                  day={day}
                  isToday={isToday}
                  isPast={isPast}
                  onGoToDay={onGoToDay}
                  checkIn={checkInsByDate[day.date]}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Materias desta semana</h2>
          <div className="space-y-2">
            {goal.subjects.map(subject => {
              const subjectBlocks = plan.days.flatMap(d => d.studyBlocks.filter(b => b.subjectId === subject.id));
              const subjectMinutes = subjectBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
              const totalMinutes = totalPlannedMinutes;
              const pct = totalMinutes > 0 ? Math.round((subjectMinutes / totalMinutes) * 100) : 0;
              return (
                <div key={subject.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: subject.color }} />
                  <span className="text-sm text-foreground flex-1">{subject.name}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(subjectMinutes / 60 * 10) / 10}h</span>
                  <div className="w-24">
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button variant="outline" onClick={onReplan} className="gap-2">
            <RotateCcw className="size-4" />
            Replanejar
          </Button>
          <Button className="flex-1 gap-2" onClick={onGoToDay}>
            <BookOpen className="size-4" />
            Ver o dia de hoje
          </Button>
        </div>
      </div>
    </div>
  );
}
