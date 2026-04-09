import { useState } from 'react';
import { RotateCcw, CircleCheck as CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { WeeklyPlan, Goal } from '@/types';

interface ReplanProps {
  plan: WeeklyPlan;
  goal: Goal;
  consecutiveMissedDays: number;
  onConfirm: (dropSubjectIds: string[]) => void;
  onBack: () => void;
}

type Strategy = 'redistribute' | 'drop_some' | 'minimum';

const STRATEGIES: { value: Strategy; label: string; desc: string; badge?: string }[] = [
  {
    value: 'redistribute',
    label: 'Redistribuir tudo',
    desc: 'Encaixo os blocos atrasados nos dias restantes da semana.',
    badge: 'Recomendado',
  },
  {
    value: 'drop_some',
    label: 'Deixar algumas matérias',
    desc: 'Foco nas mais importantes. Deixo as de baixa prioridade para a semana seguinte.',
  },
  {
    value: 'minimum',
    label: 'Plano mínimo',
    desc: 'Apenas 1 bloco de estudo por dia. Retomada suave, sem pressao.',
  },
];

export function Replan({ plan, goal, consecutiveMissedDays, onConfirm, onBack }: ReplanProps) {
  const [strategy, setStrategy] = useState<Strategy>('redistribute');
  const [keepSubjects, setKeepSubjects] = useState<Set<string>>(
    new Set(goal.subjects.filter(s => s.priority !== 'low').map(s => s.id))
  );
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const remainingDays = plan.days.filter(d => d.date >= today);
  const missedDays = plan.days.filter(d => d.date < today && !d.checkedIn);

  const missedBlocks = missedDays.flatMap(d => d.studyBlocks).length;
  const remainingSlots = remainingDays.length;

  function toggleSubject(id: string) {
    setKeepSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const dropped = strategy === 'drop_some'
      ? goal.subjects.filter(s => !keepSubjects.has(s.id)).map(s => s.id)
      : [];
    setDone(true);
    setTimeout(() => onConfirm(dropped), 1500);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trilha recalculada!</h2>
          <p className="text-muted-foreground mt-2">Seu plano foi ajustado. Vamos retomar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <RotateCcw className="size-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Replanejar a semana</h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed pl-10">
            Imprevistos acontecem. Sem culpa. Vamos ajustar o plano para que voce
            possa retomar sem precisar comecar do zero.
          </p>
        </div>

        {consecutiveMissedDays > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Resumo do que ficou para tras</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{consecutiveMissedDays}</div>
                <div className="text-xs text-muted-foreground mt-0.5">dias sem check-in</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{missedBlocks}</div>
                <div className="text-xs text-muted-foreground mt-0.5">blocos em atraso</div>
              </div>
            </div>
            {remainingSlots > 0 && (
              <p className="text-xs text-muted-foreground">
                Restam <strong className="text-foreground">{remainingSlots} dias</strong> na semana para redistribuir.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Como voce quer retomar?</h2>
          {STRATEGIES.map(s => (
            <button
              key={s.value}
              onClick={() => setStrategy(s.value)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                strategy === s.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:bg-accent/30'
              }`}
            >
              <div className={`size-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                strategy === s.value ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {strategy === s.value && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  {s.badge && (
                    <Badge variant="secondary" className="text-xs">{s.badge}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {strategy === 'drop_some' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Quais materias manter esta semana?</h2>
            <p className="text-xs text-muted-foreground">
              As nao selecionadas ficam para a semana seguinte.
            </p>
            <div className="space-y-2">
              {goal.subjects.map(subject => (
                <div key={subject.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                  <Checkbox
                    id={subject.id}
                    checked={keepSubjects.has(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: subject.color }} />
                  <Label htmlFor={subject.id} className="flex-1 cursor-pointer">
                    {subject.name}
                  </Label>
                  <Badge
                    variant={subject.priority === 'high' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {subject.priority === 'high' ? 'Alta' : subject.priority === 'medium' ? 'Media' : 'Baixa'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-secondary/50 border border-secondary rounded-xl p-4 flex items-start gap-3">
          <Heart className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-secondary-foreground leading-relaxed">
            <strong>Lembre:</strong> Replanejar nao e fracasso. E inteligencia.
            Um plano ajustado e muito melhor do que abandonar o estudo por culpa.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-xl mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>Voltar</Button>
          <Button className="flex-1 gap-2" onClick={handleConfirm}>
            Recalcular meu plano
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
