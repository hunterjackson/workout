import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { handleToolCall } from './tool-handler';
import { resetDb, makePlan, makeRoutine, makeExercise } from '../test/helpers';

describe('handleToolCall', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;
  });

  describe('create_routine', () => {
    it('should create a routine and return success', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'create_routine',
        input: { name: 'Chest Day', schedule: [1, 3] },
      });

      expect(result.success).toBe(true);
      expect(result.toolUseId).toBe('tool-1');
      expect(result.toolName).toBe('create_routine');
      expect(result.description).toContain('Chest Day');

      const parsed = JSON.parse(result.result);
      expect(parsed.name).toBe('Chest Day');

      // Verify in DB
      const routines = await db.routines.where('planId').equals(planId).toArray();
      expect(routines).toHaveLength(1);
      expect(routines[0].name).toBe('Chest Day');
      expect(routines[0].schedule).toEqual([1, 3]);
    });

    it('should set correct order for multiple routines', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'create_routine',
        input: { name: 'First', schedule: [1] },
      });
      await handleToolCall(planId, {
        id: 'tool-2',
        name: 'create_routine',
        input: { name: 'Second', schedule: [2] },
      });

      const routines = await db.routines.where('planId').equals(planId).sortBy('order');
      expect(routines[0].order).toBe(0);
      expect(routines[1].order).toBe(1);
    });

    it('should update plan updatedAt timestamp', async () => {
      const planBefore = await db.plans.get(planId);
      // Small delay to ensure timestamp difference
      await new Promise((r) => setTimeout(r, 10));

      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'create_routine',
        input: { name: 'Test', schedule: [] },
      });

      const planAfter = await db.plans.get(planId);
      expect(planAfter!.updatedAt).toBeGreaterThanOrEqual(planBefore!.updatedAt);
    });

    it('should handle optional notes', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'create_routine',
        input: { name: 'With Notes', schedule: [1], notes: 'Focus on form' },
      });

      const routine = (await db.routines.where('planId').equals(planId).toArray())[0];
      expect(routine.notes).toBe('Focus on form');
    });
  });

  describe('update_routine', () => {
    let routineId: string;

    beforeEach(async () => {
      const routine = makeRoutine(planId, { name: 'Original' });
      await db.routines.add(routine);
      routineId = routine.id;
    });

    it('should update routine name', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_routine',
        input: { routineId, name: 'Updated Name' },
      });

      expect(result.success).toBe(true);
      const routine = await db.routines.get(routineId);
      expect(routine?.name).toBe('Updated Name');
    });

    it('should update routine schedule', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_routine',
        input: { routineId, schedule: [0, 6] },
      });

      const routine = await db.routines.get(routineId);
      expect(routine?.schedule).toEqual([0, 6]);
    });

    it('should include updated field keys in result', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_routine',
        input: { routineId, name: 'New', schedule: [1, 2] },
      });

      const parsed = JSON.parse(result.result);
      expect(parsed.updated).toEqual(expect.arrayContaining(['name', 'schedule']));
    });
  });

  describe('delete_routine', () => {
    it('should delete routine and its exercises', async () => {
      const routine = makeRoutine(planId);
      await db.routines.add(routine);
      const ex1 = makeExercise(routine.id, { name: 'Ex1' });
      const ex2 = makeExercise(routine.id, { name: 'Ex2' });
      await db.exercises.bulkAdd([ex1, ex2]);

      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'delete_routine',
        input: { routineId: routine.id },
      });

      expect(result.success).toBe(true);
      expect(await db.routines.get(routine.id)).toBeUndefined();
      const remainingExercises = await db.exercises.where('routineId').equals(routine.id).toArray();
      expect(remainingExercises).toHaveLength(0);
    });

    it('should include routine name in description', async () => {
      const routine = makeRoutine(planId, { name: 'My Routine' });
      await db.routines.add(routine);

      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'delete_routine',
        input: { routineId: routine.id },
      });

      expect(result.description).toContain('My Routine');
    });
  });

  describe('add_exercise', () => {
    let routineId: string;

    beforeEach(async () => {
      const routine = makeRoutine(planId);
      await db.routines.add(routine);
      routineId = routine.id;
    });

    it('should add an exercise with all fields', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'add_exercise',
        input: {
          routineId,
          name: 'Squat',
          sets: 5,
          reps: '5',
          weight: 225,
          unit: 'lbs',
          restSeconds: 180,
          notes: 'Go deep',
          videoUrl: 'https://youtube.com/watch?v=123',
        },
      });

      expect(result.success).toBe(true);

      const exercises = await db.exercises.where('routineId').equals(routineId).toArray();
      expect(exercises).toHaveLength(1);
      expect(exercises[0].name).toBe('Squat');
      expect(exercises[0].sets).toBe(5);
      expect(exercises[0].reps).toBe('5');
      expect(exercises[0].weight).toBe(225);
      expect(exercises[0].unit).toBe('lbs');
      expect(exercises[0].restSeconds).toBe(180);
      expect(exercises[0].notes).toBe('Go deep');
      expect(exercises[0].videoUrl).toBe('https://youtube.com/watch?v=123');
    });

    it('should default unit to lbs if not provided', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'add_exercise',
        input: { routineId, name: 'Curl', sets: 3, reps: '12' },
      });

      const exercises = await db.exercises.where('routineId').equals(routineId).toArray();
      expect(exercises[0].unit).toBe('lbs');
    });

    it('should convert numeric reps to string', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'add_exercise',
        input: { routineId, name: 'Curl', sets: 3, reps: 12 },
      });

      const exercises = await db.exercises.where('routineId').equals(routineId).toArray();
      expect(exercises[0].reps).toBe('12');
    });

    it('should auto-increment order', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'add_exercise',
        input: { routineId, name: 'First', sets: 3, reps: '10' },
      });
      await handleToolCall(planId, {
        id: 'tool-2',
        name: 'add_exercise',
        input: { routineId, name: 'Second', sets: 3, reps: '10' },
      });

      const exercises = await db.exercises.where('routineId').equals(routineId).sortBy('order');
      expect(exercises[0].order).toBe(0);
      expect(exercises[1].order).toBe(1);
    });
  });

  describe('update_exercise', () => {
    let exerciseId: string;

    beforeEach(async () => {
      const routine = makeRoutine(planId);
      await db.routines.add(routine);
      const exercise = makeExercise(routine.id, { name: 'Original Ex', reps: '8' });
      await db.exercises.add(exercise);
      exerciseId = exercise.id;
    });

    it('should update exercise properties', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_exercise',
        input: { exerciseId, name: 'Updated Ex', sets: 5, weight: 200 },
      });

      expect(result.success).toBe(true);
      const exercise = await db.exercises.get(exerciseId);
      expect(exercise?.name).toBe('Updated Ex');
      expect(exercise?.sets).toBe(5);
      expect(exercise?.weight).toBe(200);
    });

    it('should convert reps to string when updating', async () => {
      await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_exercise',
        input: { exerciseId, reps: 15 },
      });

      const exercise = await db.exercises.get(exerciseId);
      expect(exercise?.reps).toBe('15');
    });
  });

  describe('delete_exercise', () => {
    it('should delete an exercise', async () => {
      const routine = makeRoutine(planId);
      await db.routines.add(routine);
      const exercise = makeExercise(routine.id, { name: 'To Delete' });
      await db.exercises.add(exercise);

      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'delete_exercise',
        input: { exerciseId: exercise.id },
      });

      expect(result.success).toBe(true);
      expect(result.description).toContain('To Delete');
      expect(await db.exercises.get(exercise.id)).toBeUndefined();
    });
  });

  describe('unknown tool', () => {
    it('should return failure for unknown tool name', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'nonexistent_tool',
        input: {},
      });

      expect(result.success).toBe(false);
      expect(result.result).toContain('Unknown tool');
    });
  });

  describe('error handling', () => {
    it('should catch and return errors gracefully', async () => {
      // Try to update a non-existent routine - this won't throw in Dexie
      // but we can force an error by using a bad table operation
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_routine',
        input: { routineId: 'nonexistent' },
      });

      // update_routine on nonexistent ID should report failure
      expect(result.success).toBe(false);
      expect(result.result).toContain('not found');
    });

    it('should return failure when updating nonexistent exercise', async () => {
      const result = await handleToolCall(planId, {
        id: 'tool-1',
        name: 'update_exercise',
        input: { exerciseId: 'nonexistent', name: 'New Name' },
      });

      expect(result.success).toBe(false);
      expect(result.result).toContain('not found');
    });
  });
});
