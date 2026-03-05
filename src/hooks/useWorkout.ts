import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { db } from '../lib/db';
import type { Exercise, Workout, WorkoutSet } from '../lib/types';

interface ActiveSet {
  exerciseId: string;
  exerciseName: string;
  exerciseNotes?: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export function useWorkout(planId: string) {
  const [workoutId] = useState(() => nanoid());
  const [sets, setSets] = useState<ActiveSet[]>([]);
  const [started, setStarted] = useState(false);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number>(0);

  const initializeSets = useCallback(async (routineIds: string[]) => {
    setSelectedRoutineIds(routineIds);
    const exercises: Exercise[] = [];
    for (const rid of routineIds) {
      const routineExercises = await db.exercises.where('routineId').equals(rid).sortBy('order');
      exercises.push(...routineExercises);
    }

    const initialSets: ActiveSet[] = [];
    for (const ex of exercises) {
      for (let s = 1; s <= ex.sets; s++) {
        initialSets.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          exerciseNotes: ex.notes,
          setNumber: s,
          reps: parseInt(ex.reps) || 0,
          weight: ex.unit === 'bodyweight' ? 0 : (ex.weight || 0),
          completed: false,
        });
      }
    }
    setSets(initialSets);
    setStartedAt(Date.now());
    setStarted(true);
  }, []);

  const updateSet = useCallback((exerciseId: string, setNumber: number, updates: Partial<ActiveSet>) => {
    setSets((prev) =>
      prev.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, ...updates }
          : s
      )
    );
  }, []);

  const toggleSet = useCallback((exerciseId: string, setNumber: number) => {
    setSets((prev) =>
      prev.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, completed: !s.completed }
          : s
      )
    );
  }, []);

  const completeWorkout = useCallback(async (notes?: string) => {
    const today = new Date().toISOString().split('T')[0];

    const workout: Workout = {
      id: workoutId,
      planId,
      date: today,
      routineIds: selectedRoutineIds,
      startedAt,
      completedAt: Date.now(),
      notes,
    };

    const workoutSets: WorkoutSet[] = sets
      .filter((s) => s.completed)
      .map((s) => ({
        id: nanoid(),
        workoutId,
        exerciseId: s.exerciseId,
        exerciseName: s.exerciseName,
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight || undefined,
        completed: true,
      }));

    await db.workouts.add(workout);
    if (workoutSets.length > 0) {
      await db.workoutSets.bulkAdd(workoutSets);
    }

    return workout.id;
  }, [workoutId, planId, selectedRoutineIds, sets, startedAt]);

  // Group sets by exercise for display
  const exerciseGroups = sets.reduce<Record<string, { exerciseName: string; exerciseNotes?: string; sets: ActiveSet[] }>>(
    (acc, set) => {
      if (!acc[set.exerciseId]) {
        acc[set.exerciseId] = { exerciseName: set.exerciseName, exerciseNotes: set.exerciseNotes, sets: [] };
      }
      acc[set.exerciseId].sets.push(set);
      return acc;
    },
    {}
  );

  const cancelWorkout = useCallback(() => {
    setSets([]);
    setSelectedRoutineIds([]);
    setStartedAt(0);
    setStarted(false);
  }, []);

  const completedCount = sets.filter((s) => s.completed).length;
  const totalCount = sets.length;

  return {
    started,
    sets,
    exerciseGroups,
    completedCount,
    totalCount,
    initializeSets,
    updateSet,
    toggleSet,
    completeWorkout,
    cancelWorkout,
  };
}
