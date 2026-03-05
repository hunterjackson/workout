import type { ExerciseType, TemplateMetrics, LoggedMetrics } from './exercise-types';

function parseReps(reps: string): number {
  return parseInt(reps) || 0;
}

export function templateToLoggedMetrics(
  exerciseType: ExerciseType,
  template: TemplateMetrics,
): LoggedMetrics {
  const t = template as unknown as Record<string, unknown>;

  switch (exerciseType) {
    case 'weight_reps':
      return {
        weight: (t.weight as number) || 0,
        reps: parseReps(t.reps as string),
        unit: (t.unit as 'lbs' | 'kg') || 'lbs',
      };
    case 'bodyweight_reps': {
      const m: Record<string, unknown> = { reps: parseReps(t.reps as string) };
      if (t.addedWeight != null) m.addedWeight = t.addedWeight;
      if (t.unit != null) m.unit = t.unit;
      return m as unknown as LoggedMetrics;
    }
    case 'duration':
      return { durationSeconds: (t.durationSeconds as number) || 0 };
    case 'distance_time':
      return {
        distanceMeters: (t.distanceMeters as number) || 0,
        durationSeconds: (t.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'weight_duration':
      return {
        weight: (t.weight as number) || 0,
        durationSeconds: (t.durationSeconds as number) || 0,
        unit: (t.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'weight_distance':
      return {
        weight: (t.weight as number) || 0,
        distanceMeters: (t.distanceMeters as number) || 0,
        unit: (t.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'calories_time':
      return {
        calories: (t.calories as number) || 0,
        durationSeconds: (t.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'reps_duration':
      return {
        reps: parseReps(t.reps as string),
        durationSeconds: (t.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'distance':
      return { distanceMeters: (t.distanceMeters as number) || 0 };
    case 'band_reps':
      return {
        bandColor: (t.bandColor as string) || '',
        reps: parseReps(t.reps as string),
      } as unknown as LoggedMetrics;
    case 'rpe':
      return { rpe: (t.rpe as number) || 0 };
    case 'weight_reps_tempo':
      return {
        weight: (t.weight as number) || 0,
        reps: parseReps(t.reps as string),
        tempo: (t.tempo as string) || '',
        unit: (t.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'machine_reps':
      return {
        machineLevel: (t.machineLevel as number) || 0,
        reps: parseReps(t.reps as string),
      } as unknown as LoggedMetrics;
    case 'height_reps': {
      const m: Record<string, unknown> = { heightCm: (t.heightCm as number) || 0 };
      if (t.reps != null) m.reps = parseReps(t.reps as string);
      if (t.durationSeconds != null) m.durationSeconds = t.durationSeconds;
      return m as unknown as LoggedMetrics;
    }
  }
}
