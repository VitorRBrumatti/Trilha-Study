import { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { Goal, Subject, Priority } from '@/types';

interface OnboardingProps {
  onComplete: (goal: Goal) => void;
  onBack: () => void;
}

const COLOR_DOTS = [
  'oklch(0.42 0.13 152)',
  'oklch(0.58 0.12 200)',
  'oklch(0.55 0.12 250)',
  'oklch(0.72 0.15 80)',
  'oklch(0.65 0.18 30)',
];

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning-foreground border-warning/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const QUICK_SUBJECTS = [
  'Matematica', 'Portugues', 'Historia', 'Geografia', 'Ciencias', 'Biologia',
  'Quimica', 'Fisica', 'Ingles', 'Direito', 'Economia', 'Raciocinio Logico',
];

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [dailyHours, setDailyHours] = useState(3);

  const totalSteps = 3;

  function addSubject(name: string) {
    if (!name.trim() || subjects.length >= 8) return;
    const existing = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) return;
    const newS: Subject = {
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      priority: 'medium',
      color: COLOR_DOTS[subjects.length % COLOR_DOTS.length],
    };
    setSubjects(prev => [...prev, newS]);
    setNewSubject('');
  }

  function removeSubject(id: string) {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }

  function setPriority(id: string, priority: Priority) {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, priority } : s));
  }

  function handleComplete() {
    const goal: Goal = {
      examName,
      examDate,
      subjects,
      weeklyHours,
      dailyAvailableHours: dailyHours,
      createdAt: new Date().toISOString(),
    };
    onComplete(goal);
  }

  const canProceedStep1 = examName.trim() && examDate;
  const canProceedStep2 = subjects.length >= 1;
  const canProceedStep3 = weeklyHours >= 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">T</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Trilha</span>
        </div>
        <span className="text-sm text-muted-foreground">Etapa {step} de {totalSteps}</span>
      </header>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-8">
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Qual é o seu objetivo?</h2>
              <p className="text-muted-foreground mt-1">Defina a prova e a data para criarmos seu plano.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exam-name">Nome da prova ou vestibular</Label>
                <Input
                  id="exam-name"
                  placeholder="Ex: ENEM, Concurso TRF, OAB..."
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-date">Data estimada da prova</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="h-11"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Quais matérias você vai estudar?</h2>
              <p className="text-muted-foreground mt-1">Adicione até 8 matérias e defina a prioridade de cada uma.</p>
            </div>

            <div className="space-y-2">
              <Label>Sugestoes rapidas</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUBJECTS.filter(q => !subjects.find(s => s.name === q)).slice(0, 8).map(q => (
                  <button
                    key={q}
                    onClick={() => addSubject(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Outra materia..."
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubject(newSubject)}
                className="h-10"
              />
              <Button variant="secondary" onClick={() => addSubject(newSubject)} disabled={!newSubject.trim()}>
                <Plus className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                  <div className="flex gap-1">
                    {(['high', 'medium', 'low'] as Priority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setPriority(s.id, p)}
                        className={`text-xs px-2 py-0.5 rounded border font-medium transition-colors ${
                          s.priority === p ? PRIORITY_STYLES[p] : 'border-transparent text-muted-foreground hover:border-border'
                        }`}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => removeSubject(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  Adicione ao menos uma materia para continuar
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Quanto tempo você tem?</h2>
              <p className="text-muted-foreground mt-1">Seja realista. Um plano que cabe na sua vida e melhor que um plano perfeito.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Horas disponíveis por semana</Label>
                  <span className="text-2xl font-bold text-primary">{weeklyHours}h</span>
                </div>
                <Slider
                  min={3}
                  max={60}
                  step={1}
                  value={[weeklyHours]}
                  onValueChange={([v]) => setWeeklyHours(v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3h (mínimo)</span>
                  <span>60h (maximo)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Horas por dia (media)</Label>
                  <span className="text-2xl font-bold text-primary">{dailyHours}h</span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={0.5}
                  value={[dailyHours]}
                  onValueChange={([v]) => setDailyHours(v)}
                />
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-secondary-foreground text-sm">Resumo do seu plano</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prova:</span>
                  <span className="font-medium text-foreground">{examName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Matérias:</span>
                  <span className="font-medium text-foreground">{subjects.length} matérias</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dedicacao:</span>
                  <span className="font-medium text-foreground">{weeklyHours}h/semana</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-auto pt-8">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          <div className="flex-1" />
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="gap-2"
            >
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceedStep3}
              className="gap-2"
            >
              <Check className="size-4" />
              Criar minha Trilha
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
