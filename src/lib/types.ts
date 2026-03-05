export interface Plan {
  id: string;
  name: string;
  goal?: string;
  model?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Routine {
  id: string;
  planId: string;
  name: string;
  schedule: number[]; // days of week: 0=Sun, 1=Mon, ..., 6=Sat
  notes?: string;
  order: number;
  createdAt: number;
}

import type { ExerciseType, TemplateMetrics, LoggedMetrics } from './exercise-types';

export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  sets: number;
  exerciseType: ExerciseType;
  metrics: TemplateMetrics;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
  order: number;
}

export interface Workout {
  id: string;
  planId: string;
  date: string; // YYYY-MM-DD
  routineIds: string[];
  startedAt: number;
  completedAt?: number;
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  setNumber: number;
  metrics: LoggedMetrics;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  planId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface ProposedToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  description: string;
}

export type ChatMode = 'planning' | 'updating';
