import { ArrowRight, CircleCheck as CheckCircle2, RefreshCw, Target, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandingProps {
  onStart: () => void;
}

const benefits = [
  { icon: Target, text: 'Sabe o que estudar hoje, sem perder tempo planejando' },
  { icon: RefreshCw, text: 'Revisoes distribuidas automaticamente pelo sistema' },
  { icon: Zap, text: 'Replanejar a semana em um clique, sem culpa' },
  { icon: TrendingUp, text: 'Acompanha sua constancia, nao so horas estudadas' },
  { icon: CheckCircle2, text: 'Retomada inteligente quando voce atrasa o plano' },
];

export function Landing({ onStart }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">T</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">Trilha</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onStart} className="text-muted-foreground">
          Entrar
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-3xl mx-auto w-full">
        <div className="w-full text-center space-y-8">
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            Copiloto de execucao para concursos e vestibulares
          </Badge>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight text-balance">
              Volte para
              <span className="text-primary"> a trilha.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed text-balance">
              Voce ja tem o material. Ja sabe o que precisa estudar.
              O que falta e saber <strong className="text-foreground">o que fazer hoje</strong> e como
              retomar quando atrasar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={onStart} className="gap-2 text-base h-12 px-8">
              Comecar agora
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onStart} className="text-base h-12 px-8">
              Ver como funciona
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {[
              { value: 'Hoje', label: 'O que estudar' },
              { value: 'Automatico', label: 'Plano semanal' },
              { value: '1 clique', label: 'Para replanejar' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-20 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground font-medium">Como a Trilha funciona</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
                <div className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="size-4 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-20 bg-primary rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary-foreground">
            Nao e mais um planner.
          </h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto leading-relaxed">
            Planners te pedem para planejar. A Trilha te diz o que fazer agora,
            redistribui o que atrasou e mantém sua semana sob controle.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={onStart}
            className="mt-2 gap-2 font-semibold"
          >
            Configurar minha trilha
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Trilha &mdash; Constancia e clareza para quem estuda sério.
        </p>
      </footer>
    </div>
  );
}
