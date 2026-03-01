export interface Plan {
  id: string;
  name: string;
  goal?: string;
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

export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  sets: number;
  reps: string; // string for ranges: "8-10", "AMRAP", "12"
  weight?: number;
  unit: 'lbs' | 'kg' | 'bodyweight';
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
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  planId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}
