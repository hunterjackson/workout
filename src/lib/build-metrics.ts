import type { ExerciseType, TemplateMetrics, LoggedMetrics } from './exercise-types';

type Input = Record<string, unknown>;

export function buildTemplateMetrics(exerciseType: ExerciseType, input: Input): TemplateMetrics {
  switch (exerciseType) {
    case 'weight_reps':
      return {
        weight: input.weight as number | undefined,
        reps: String(input.reps),
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      };
    case 'bodyweight_reps': {
      const m: Record<string, unknown> = { reps: String(input.reps) };
      if (input.addedWeight != null) m.addedWeight = input.addedWeight;
      if (input.unit != null) m.unit = input.unit;
      return m as unknown as TemplateMetrics;
    }
    case 'duration':
      return { durationSeconds: input.durationSeconds as number };
    case 'distance_time': {
      const m: Record<string, unknown> = { distanceMeters: input.distanceMeters as number };
      if (input.durationSeconds != null) m.durationSeconds = input.durationSeconds;
      return m as unknown as TemplateMetrics;
    }
    case 'weight_duration':
      return {
        weight: input.weight as number | undefined,
        durationSeconds: input.durationSeconds as number,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as TemplateMetrics;
    case 'weight_distance':
      return {
        weight: input.weight as number | undefined,
        distanceMeters: input.distanceMeters as number,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as TemplateMetrics;
    case 'calories_time': {
      const m: Record<string, unknown> = { calories: input.calories as number };
      if (input.durationSeconds != null) m.durationSeconds = input.durationSeconds;
      return m as unknown as TemplateMetrics;
    }
    case 'reps_duration':
      return {
        reps: String(input.reps),
        durationSeconds: input.durationSeconds as number,
      } as unknown as TemplateMetrics;
    case 'distance':
      return { distanceMeters: input.distanceMeters as number };
    case 'band_reps':
      return {
        bandColor: input.bandColor as string,
        reps: String(input.reps),
      } as unknown as TemplateMetrics;
    case 'rpe':
      return { rpe: input.rpe as number };
    case 'weight_reps_tempo':
      return {
        weight: input.weight as number | undefined,
        reps: String(input.reps),
        tempo: input.tempo as string,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as TemplateMetrics;
    case 'machine_reps':
      return {
        machineLevel: input.machineLevel as number,
        reps: String(input.reps),
      } as unknown as TemplateMetrics;
    case 'height_reps': {
      const m: Record<string, unknown> = { heightCm: input.heightCm as number };
      if (input.reps != null) m.reps = String(input.reps);
      if (input.durationSeconds != null) m.durationSeconds = input.durationSeconds;
      return m as unknown as TemplateMetrics;
    }
  }
}

export function buildLoggedMetrics(exerciseType: ExerciseType, input: Input): LoggedMetrics {
  switch (exerciseType) {
    case 'weight_reps':
      return {
        weight: (input.weight as number) || 0,
        reps: (input.reps as number) || 0,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      };
    case 'bodyweight_reps': {
      const m: Record<string, unknown> = { reps: (input.reps as number) || 0 };
      if (input.addedWeight != null) m.addedWeight = input.addedWeight;
      if (input.unit != null) m.unit = input.unit;
      return m as unknown as LoggedMetrics;
    }
    case 'duration':
      return { durationSeconds: (input.durationSeconds as number) || 0 };
    case 'distance_time':
      return {
        distanceMeters: (input.distanceMeters as number) || 0,
        durationSeconds: (input.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'weight_duration':
      return {
        weight: (input.weight as number) || 0,
        durationSeconds: (input.durationSeconds as number) || 0,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'weight_distance':
      return {
        weight: (input.weight as number) || 0,
        distanceMeters: (input.distanceMeters as number) || 0,
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'calories_time':
      return {
        calories: (input.calories as number) || 0,
        durationSeconds: (input.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'reps_duration':
      return {
        reps: (input.reps as number) || 0,
        durationSeconds: (input.durationSeconds as number) || 0,
      } as unknown as LoggedMetrics;
    case 'distance':
      return { distanceMeters: (input.distanceMeters as number) || 0 };
    case 'band_reps':
      return {
        bandColor: (input.bandColor as string) || '',
        reps: (input.reps as number) || 0,
      } as unknown as LoggedMetrics;
    case 'rpe':
      return { rpe: (input.rpe as number) || 0 };
    case 'weight_reps_tempo':
      return {
        weight: (input.weight as number) || 0,
        reps: (input.reps as number) || 0,
        tempo: (input.tempo as string) || '',
        unit: (input.unit as 'lbs' | 'kg') || 'lbs',
      } as unknown as LoggedMetrics;
    case 'machine_reps':
      return {
        machineLevel: (input.machineLevel as number) || 0,
        reps: (input.reps as number) || 0,
      } as unknown as LoggedMetrics;
    case 'height_reps': {
      const m: Record<string, unknown> = { heightCm: (input.heightCm as number) || 0 };
      if (input.reps != null) m.reps = input.reps;
      if (input.durationSeconds != null) m.durationSeconds = input.durationSeconds;
      return m as unknown as LoggedMetrics;
    }
  }
}
