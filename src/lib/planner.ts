import type { Goal, WeeklyPlan, DayPlan, StudyBlock, Subject, LearningLevel } from '@/types';

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  default: [
    'Fundamentos e conceitos básicos',
    'Teoria e principais teoremas',
    'Exercícios práticos (nível fácil)',
    'Exercícios práticos (nível médio)',
    'Casos especiais e exceções',
    'Revisão de conceitos',
    'Exercícios avançados',
    'Simulado e questões de prova',
  ],
};

function getTopics(subjectName: string): string[] {
  const key = Object.keys(TOPICS_BY_SUBJECT).find(k =>
    subjectName.toLowerCase().includes(k)
  );
  return TOPICS_BY_SUBJECT[key ?? 'default'];
}

const DEFAULT_TOPICS_BY_LEVEL: Record<LearningLevel, string[]> = {
  fundamental_1: [
    'Leitura guiada dos conceitos principais',
    'Exemplos simples resolvidos',
    'Exercicios de fixacao',
    'Revisao com resumo curto',
    'Atividade pratica',
    'Questoes de interpretacao',
  ],
  fundamental_2: [
    'Fundamentos do assunto',
    'Conceitos essenciais',
    'Exercicios de aplicacao',
    'Problemas contextualizados',
    'Revisao dos pontos de erro',
    'Questoes de prova escolar',
  ],
  medio: [
    'Base teorica do tema',
    'Formulas e definicoes importantes',
    'Exercicios de nivel facil',
    'Exercicios de nivel medio',
    'Conexoes com outros temas',
    'Simulado curto',
  ],
  enem_vestibular: [
    'Conceitos cobrados com frequencia',
    'Teoria aplicada a questoes',
    'Exercicios de nivel facil',
    'Exercicios de nivel medio',
    'Questoes interdisciplinares',
    'Simulado e analise de erros',
  ],
  superior: [
    'Fundamentos e definicoes formais',
    'Teoria e principais modelos',
    'Exemplos resolvidos',
    'Exercicios praticos',
    'Casos especiais e excecoes',
    'Aplicacoes e problemas avancados',
  ],
};

function getSubjectTopics(subject: Subject, learningLevel: LearningLevel): string[] {
  const fallbackTopics = DEFAULT_TOPICS_BY_LEVEL[learningLevel] ?? getTopics(subject.name);
  return (subject.studyContents?.length ?? 0) > 0
    ? subject.studyContents
    : fallbackTopics;
}

function priorityMultiplier(priority: Subject['priority']): number {
  return priority === 'high' ? 1.5 : priority === 'medium' ? 1.0 : 0.6;
}

function generateBlockId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function generateWeeklyPlan(goal: Goal, replan = false): WeeklyPlan {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const weekStart = monday.toISOString().split('T')[0];

  const totalWeightedHours = goal.subjects.reduce((acc, s) => {
    return acc + priorityMultiplier(s.priority);
  }, 0);

  const activeDays = [1, 2, 3, 4, 5, 6];
  const hoursPerDay = goal.weeklyHours / activeDays.length;

  const days: DayPlan[] = activeDays.map((dayOffset, idx) => {
    const date = addDays(weekStart, dayOffset - 1);
    const isPast = new Date(date) < new Date(now.toISOString().split('T')[0]);

    const studyBlocks: StudyBlock[] = [];
    const reviewBlocks: StudyBlock[] = [];
    const pendingBlocks: StudyBlock[] = [];

    const minutesAvailable = Math.round(hoursPerDay * 60);
    let minutesUsed = 0;

    goal.subjects.forEach(subject => {
      const fraction = priorityMultiplier(subject.priority) / totalWeightedHours;
      const subjectMinutes = Math.round(fraction * minutesAvailable * 0.7);
      const topics = getSubjectTopics(subject, goal.learningLevel);
      const topicIndex = (idx * 2) % topics.length;

      if (minutesUsed + subjectMinutes <= minutesAvailable) {
        studyBlocks.push({
          id: generateBlockId(),
          subjectId: subject.id,
          subjectName: subject.name,
          topic: topics[topicIndex],
          durationMinutes: subjectMinutes,
          type: 'study',
          completed: isPast && !replan,
        });
        minutesUsed += subjectMinutes;
      }
    });

    if (idx > 0 && minutesUsed < minutesAvailable) {
      const reviewSubject = goal.subjects[idx % goal.subjects.length];
      const topics = getSubjectTopics(reviewSubject, goal.learningLevel);
      const reviewMinutes = Math.min(30, minutesAvailable - minutesUsed);

      reviewBlocks.push({
        id: generateBlockId(),
        subjectId: reviewSubject.id,
        subjectName: reviewSubject.name,
        topic: `Revisao: ${topics[(idx + 3) % topics.length]}`,
        durationMinutes: reviewMinutes,
        type: 'review',
        completed: isPast && !replan,
        reviewLevel: idx <= 1 ? 1 : idx <= 3 ? 3 : 7,
      });
    }

    if (replan && isPast) {
      goal.subjects.slice(0, 2).forEach(subject => {
        const topics = getSubjectTopics(subject, goal.learningLevel);
        pendingBlocks.push({
          id: generateBlockId(),
          subjectId: subject.id,
          subjectName: subject.name,
          topic: `Conteudo em atraso: ${topics[0]}`,
          durationMinutes: 45,
          type: 'study',
          completed: false,
        });
      });
    }

    return {
      date,
      studyBlocks,
      reviewBlocks,
      pendingBlocks,
      checkedIn: isPast && !replan,
      completionRate: isPast && !replan ? Math.random() * 0.4 + 0.6 : 0,
    };
  });

  const totalPlannedMinutes = days.reduce((acc, d) => {
    return acc + d.studyBlocks.reduce((s, b) => s + b.durationMinutes, 0) + d.reviewBlocks.reduce((s, b) => s + b.durationMinutes, 0);
  }, 0);

  return {
    weekStart,
    days,
    totalPlannedHours: Math.round(totalPlannedMinutes / 60 * 10) / 10,
    totalCompletedHours: 0,
    consecutiveMissedDays: 0,
    isReplanNeeded: false,
  };
}

export function getTodayPlan(plan: WeeklyPlan): DayPlan | null {
  const todayStr = new Date().toISOString().split('T')[0];
  return plan.days.find(d => d.date === todayStr) ?? plan.days[plan.days.findIndex(d => !d.checkedIn)] ?? null;
}

export function getDaysUntilExam(examDate: string): number {
  const exam = new Date(examDate);
  const today = new Date();
  const diff = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
}

export function getWeekCompletionRate(plan: WeeklyPlan): number {
  const allBlocks = plan.days.flatMap(d => [...d.studyBlocks, ...d.reviewBlocks]);
  if (allBlocks.length === 0) return 0;
  const completed = allBlocks.filter(b => b.completed).length;
  return Math.round((completed / allBlocks.length) * 100);
}
