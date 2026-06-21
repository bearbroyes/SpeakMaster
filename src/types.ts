export type Phase = "GRID" | "PREPARATION" | "BUFFER" | "RECORDING" | "RESULT";

export type Theme = "violet" | "dark" | "light";

export type PracticeMode = "training" | "exam";

export type Lang = "ru" | "en";

export interface StudentProfile {
  firstName: string;
  lastName: string;
}

export type TopicStatus = "not_started" | "recorded" | "submitted";

export interface Monologue {
  id: number;
  title: string;
  theme: string;
  points: string[];
}

export interface RubricAnswers {
  coveredAllPoints: boolean;
  fluencyFillerWords: boolean;
  introOutroClear: boolean;
  underGrammarLimit: boolean;
  timeOk: boolean;
}

export interface AttemptRecord {
  id: string;
  date: string;
  durationSeconds: number;
  rubric: RubricAnswers;
  checkedPoints: Record<number, boolean>;
  transcript?: string;
  fillerCount?: number;
}

export interface TopicProgress {
  monologueId: number;
  status: TopicStatus;
  attempts: AttemptRecord[];
}
