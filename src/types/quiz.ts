export interface QuizLog {
  id: number;
  wordId: number;
  monsterId: number;
  quizType: 'voice' | 'spelling';
  isCorrect: boolean;
  attempts: number;
  hintsUsed: number;
  timeSpentMs: number;
  createdAt: string;
}

export interface QuizResult {
  isCorrect: boolean;
  recognizedText?: string;
  rewards?: {
    gems: number;
    jams: number;
  };
  monsterDefeated: boolean;
}
