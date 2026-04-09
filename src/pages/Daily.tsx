import { useState } from 'react';
import { BookOpen, RotateCcw, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Circle, Clock, Battery, BatteryLow, BatteryMedium, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { DayPlan, StudyBlock, EnergyLevel, Goal } from '@/types';
import { formatDate } from '@/lib/planner';

interface DailyProps {
  plan: DayPlan;
  goal: Goal;
  consecutiveMissedDays: number;
  onCheckIn: (completed: boolean, energy: EnergyLevel, completedBlocks: string[]) => void;
  onReplan: () => void;
  onNavigate: (view: 'dashboard' | 'report') => void;
}

function BlockItem({
  block,
  checked,
  onToggle,
}: {
  block: StudyBlock;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
        checked
          ? 'bg-secondary border-primary/30 opacity-60'
          : 'bg-card border-border hover:border-primary/40 hover:bg-accent/30'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {checked ? (
          <CheckCircle2 className="size-5 text-primary" />
        ) : (
          <Circle className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {block.subjectName}
          </span>
          {block.reviewLevel && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {block.reviewLevel === 1 ? 'Revisao D+1' : block.reviewLevel === 3 ? 'Revisao D+3' : 'Revisao D+7'}
            </Badge>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${checked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          {block.topic}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Clock className="size-3" />
        <span>{block.durationMinutes}min</span>
      </div>
    </button>
  );
}

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; icon: typeof Battery; desc: string }[] = [
  { value: 'low', label: 'Cansado', icon: BatteryLow, desc: 'Menos energia hoje' },
  { value: 'medium', label: 'Normal', icon: BatteryMedium, desc: 'Energia moderada' },
  { value: 'high', label: 'Motivado', icon: Battery, desc: 'Pronto para estudar' },
];

export function Daily({ plan, goal, consecutiveMissedDays, onCheckIn, onReplan, onNavigate }: DailyProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [energy, setEnergy] = useState<EnergyLevel>('medium');

  const allBlocks = [...plan.studyBlocks, ...plan.reviewBlocks, ...plan.pendingBlocks];
  const total = allBlocks.length;
  const completed = completedIds.size;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalMinutes = allBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const completedMinutes = allBlocks
    .filter(b => completedIds.has(b.id))
    .reduce((acc, b) => acc + b.durationMinutes, 0);

  function toggle(id: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFinishDay() {
    onCheckIn(completed > 0, energy, Array.from(completedIds));
    setShowCheckIn(false);
  }

  const daysUntilExam = Math.max(0, Math.ceil(
    (new Date(goal.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground capitalize">
              {formatDate(plan.date)}
            </div>
            <div className="font-semibold text-foreground text-sm">{goal.examName}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Restam</div>
              <div className="text-sm font-bold text-primary">{daysUntilExam} dias</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('dashboard')}>
              Semana
            </Button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
            <span>{completed} de {total} blocos feitos</span>
            <span>{Math.round(completedMinutes / 60 * 10) / 10}h de {Math.round(totalMinutes / 60 * 10) / 10}h</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {consecutiveMissedDays >= 2 && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
            <Zap className="size-5 text-warning-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning-foreground">
                {consecutiveMissedDays} dias sem check-in
              </p>
              <p className="text-xs text-warning-foreground/80 mt-0.5">
                Que tal replanejar a semana? E simples e sem culpa.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onReplan} className="shrink-0 border-warning/30 text-warning-foreground hover:bg-warning/10">
              Replanejar
            </Button>
          </div>
        )}

        {plan.studyBlocks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                <BookOpen className="size-3.5 text-primary-foreground" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Estudar agora</h2>
              <Badge variant="secondary" className="text-xs ml-auto">
                {plan.studyBlocks.filter(b => completedIds.has(b.id)).length}/{plan.studyBlocks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {plan.studyBlocks.map(block => (
                <BlockItem
                  key={block.id}
                  block={block}
                  checked={completedIds.has(block.id)}
                  onToggle={() => toggle(block.id)}
                />
              ))}
            </div>
          </section>
        )}

        {plan.reviewBlocks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                <RotateCcw className="size-3.5 text-secondary-foreground" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Revisar hoje</h2>
              <Badge variant="outline" className="text-xs ml-auto">
                {plan.reviewBlocks.filter(b => completedIds.has(b.id)).length}/{plan.reviewBlocks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {plan.reviewBlocks.map(block => (
                <BlockItem
                  key={block.id}
                  block={block}
                  checked={completedIds.has(block.id)}
                  onToggle={() => toggle(block.id)}
                />
              ))}
            </div>
          </section>
        )}

        {plan.pendingBlocks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertCircle className="size-3.5 text-destructive" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Pendencias em atraso</h2>
              <Badge variant="destructive" className="text-xs ml-auto">
                {plan.pendingBlocks.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              Esses blocos ficaram para tras. Faca o que conseguir, sem pressao.
            </p>
            <div className="space-y-2">
              {plan.pendingBlocks.map(block => (
                <BlockItem
                  key={block.id}
                  block={block}
                  checked={completedIds.has(block.id)}
                  onToggle={() => toggle(block.id)}
                />
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle2 className="size-12 mx-auto mb-4 text-primary opacity-50" />
            <p className="font-medium">Nenhum bloco para hoje.</p>
            <p className="text-sm mt-1">Seu plano esta em dia!</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button variant="outline" onClick={onReplan} className="gap-2">
            <RotateCcw className="size-4" />
            Replanejar
          </Button>
          <Button className="flex-1 gap-2" onClick={() => setShowCheckIn(true)}>
            <CheckCircle2 className="size-4" />
            Encerrar o dia
          </Button>
        </div>
      </div>

      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Como foi seu dia?</DialogTitle>
            <DialogDescription>
              {completed} de {total} blocos concluidos. Qual foi sua energia hoje?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 py-2">
            {ENERGY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setEnergy(opt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all ${
                    energy === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-accent/30'
                  }`}
                >
                  <Icon className={`size-5 ${energy === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${energy === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCheckIn(false)}>Cancelar</Button>
            <Button onClick={handleFinishDay}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
