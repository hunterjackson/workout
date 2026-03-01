import Dexie, { type Table } from 'dexie';
import type { Plan, Routine, Exercise, Workout, WorkoutSet, ChatMessage } from './types';

export class WorkoutDB extends Dexie {
  plans!: Table<Plan>;
  routines!: Table<Routine>;
  exercises!: Table<Exercise>;
  workouts!: Table<Workout>;
  workoutSets!: Table<WorkoutSet>;
  chatMessages!: Table<ChatMessage>;

  constructor() {
    super('WorkoutDB');
    this.version(1).stores({
      plans: 'id, createdAt, updatedAt',
      routines: 'id, planId, order',
      exercises: 'id, routineId, order',
      workouts: 'id, planId, date',
      workoutSets: 'id, workoutId, exerciseId',
      chatMessages: 'id, planId, createdAt',
    });
  }
}

export const db = new WorkoutDB();
