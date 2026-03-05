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

    this.version(2).stores({
      plans: 'id, createdAt, updatedAt',
      routines: 'id, planId, order',
      exercises: 'id, routineId, order',
      workouts: 'id, planId, date',
      workoutSets: 'id, workoutId, exerciseId',
      chatMessages: 'id, planId, createdAt',
    }).upgrade(tx => {
      // Migrate exercises: move reps/weight/unit into metrics + add exerciseType
      tx.table('exercises').toCollection().modify((ex: Record<string, unknown>) => {
        if (ex.exerciseType) return; // already migrated
        const isBodyweight = ex.unit === 'bodyweight';
        ex.exerciseType = isBodyweight ? 'bodyweight_reps' : 'weight_reps';
        ex.metrics = isBodyweight
          ? { reps: ex.reps || '0' }
          : { weight: ex.weight, reps: ex.reps || '0', unit: ex.unit || 'lbs' };
        delete ex.reps;
        delete ex.weight;
        delete ex.unit;
      });

      // Migrate workoutSets: move reps/weight into metrics + add exerciseType
      tx.table('workoutSets').toCollection().modify((ws: Record<string, unknown>) => {
        if (ws.exerciseType) return; // already migrated
        ws.exerciseType = 'weight_reps';
        ws.metrics = { weight: ws.weight || 0, reps: ws.reps || 0, unit: 'lbs' };
        delete ws.reps;
        delete ws.weight;
      });
    });
  }
}

export const db = new WorkoutDB();
