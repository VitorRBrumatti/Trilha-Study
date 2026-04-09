import { TrendingUp, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { WeeklyPlan, Goal, CheckInRecord } from '@/types';
import { formatShortDate, getDaysUntilExam } from '@/lib/planner';

interface ReportProps {
  plan: WeeklyPlan;
  goal: Goal;
  checkIns: CheckInRecord[];
  onBack: () => void;
}

const chartConfig = {
  planned: { label: 'Planejado', color: 'var(--chart-2)' },
  completed: { label: 'Realizado', color: 'var(--chart-1)' },
};

export function Report({ plan, goal, checkIns, onBack }: ReportProps) {
  const today = new Date().toISOString().split('T')[0];
  const daysUntilExam = getDaysUntilExam(goal.examDate);

  const checkInsByDate = Object.fromEntries(checkIns.map(c => [c.date, c]));

  const pastDays = plan.days.filter(d => d.date <= today);
  const completedDays = pastDays.filter(d => checkInsByDate[d.date]?.completed);
  const consistency = pastDays.length > 0
    ? Math.round((completedDays.length / pastDays.length) * 100)
    : 0;

  const totalPlannedMinutes = plan.days.reduce((acc, d) =>
    acc + [...d.studyBlocks, ...d.reviewBlocks].reduce((s, b) => s + b.durationMinutes, 0), 0);

  const totalCompletedMinutes = pastDays.reduce((acc, d) => {
    const completedBlocks = checkInsByDate[d.date]?.completedBlocks ?? [];
    const dayBlocks = [...d.studyBlocks, ...d.reviewBlocks];
    return acc + dayBlocks.filter(b => completedBlocks.includes(b.id)).reduce((s, b) => s + b.durationMinutes, 0);
  }, 0);

  const totalPending = plan.days.reduce((acc, d) => acc + d.pendingBlocks.length, 0);

  const chartData = plan.days.map(d => {
    const planned = [...d.studyBlocks, ...d.reviewBlocks].reduce((s, b) => s + b.durationMinutes, 0);
    const completedBlocks = checkInsByDate[d.date]?.completedBlocks ?? [];
    const dayBlocks = [...d.studyBlocks, ...d.reviewBlocks];
    const done = dayBlocks.filter(b => completedBlocks.includes(b.id)).reduce((s, b) => s + b.durationMinutes, 0);
    return {
      day: formatShortDate(d.date).split(',')[0],
      planned: Math.round(planned / 60 * 10) / 10,
      completed: Math.round(done / 60 * 10) / 10,
    };
  });

  const subjectCoverage = goal.subjects.map(subject => {
    const subjectBlocks = plan.days.flatMap(d => d.studyBlocks.filter(b => b.subjectId === subject.id));
    const completedSubjectBlocks = subjectBlocks.filter(b => {
      const dayStr = plan.days.find(d => d.studyBlocks.includes(b))?.date;
      if (!dayStr) return false;
      return checkInsByDate[dayStr]?.completedBlocks.includes(b.id);
    });
    const planned = subjectBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
    const done = completedSubjectBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
    return {
      subject,
      plannedMinutes: planned,
      completedMinutes: done,
      pct: planned > 0 ? Math.round((done / planned) * 100) : 0,
    };
  });

  const consistencyLabel =
    consistency >= 80 ? 'Excelente' :
    consistency >= 60 ? 'Boa' :
    consistency >= 40 ? 'Regular' : 'Precisa melhorar';

  const consistencyVariant =
    consistency >= 80 ? 'default' :
    consistency >= 60 ? 'secondary' : 'destructive';

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground">Relatorio da semana</h1>
            <p className="text-xs text-muted-foreground">{goal.examName} &bull; {daysUntilExam} dias restantes</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Constancia</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{consistency}%</div>
              <Badge variant={consistencyVariant} className="mt-1 text-xs">{consistencyLabel}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Horas feitas</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(totalCompletedMinutes / 60 * 10) / 10}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {Math.round(totalPlannedMinutes / 60 * 10) / 10}h planejadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Dias completos</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{completedDays.length}</div>
              <p className="text-xs text-muted-foreground mt-1">de {pastDays.length} dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-destructive" />
                <span className="text-xs font-medium text-muted-foreground">Em atraso</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalPending}</div>
              <p className="text-xs text-muted-foreground mt-1">blocos pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">Horas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="planned" fill="var(--color-planned)" radius={[3, 3, 0, 0]} opacity={0.4} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">Cobertura por materia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectCoverage.map(({ subject, plannedMinutes, completedMinutes, pct }) => (
              <div key={subject.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: subject.color }} />
                    <span className="text-sm font-medium text-foreground">{subject.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(completedMinutes / 60 * 10) / 10}h / {Math.round(plannedMinutes / 60 * 10) / 10}h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="flex-1 h-1.5" />
                  <span className="text-xs font-semibold text-foreground w-10 text-right">{pct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 text-center space-y-2">
            <Calendar className="size-8 mx-auto text-primary opacity-60" />
            <p className="text-sm font-semibold text-foreground">
              {daysUntilExam > 30
                ? 'Voce esta no caminho certo. Mantenha a constancia.'
                : daysUntilExam > 14
                  ? 'Reta final! Priorize revisoes agora.'
                  : 'Semana decisiva! Foco nas materias principais.'}
            </p>
            <p className="text-xs text-muted-foreground">
              Faltam {daysUntilExam} dias para {goal.examName}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
