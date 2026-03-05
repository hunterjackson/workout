import type { ExerciseType } from './exercise-types';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatTemplateMetrics(
  exerciseType: ExerciseType,
  metrics: Record<string, unknown>,
): string {
  switch (exerciseType) {
    case 'weight_reps': {
      const base = `${metrics.reps} reps`;
      return metrics.weight ? `${base} @ ${metrics.weight} ${metrics.unit}` : base;
    }
    case 'bodyweight_reps': {
      const base = `${metrics.reps} reps`;
      if (metrics.addedWeight) return `${base} (BW+${metrics.addedWeight} ${metrics.unit})`;
      return `${base} (BW)`;
    }
    case 'duration':
      return formatDuration(metrics.durationSeconds as number);
    case 'distance_time': {
      const base = `${metrics.distanceMeters}m`;
      return metrics.durationSeconds
        ? `${base} in ${formatDuration(metrics.durationSeconds as number)}`
        : base;
    }
    case 'weight_duration':
      return `${formatDuration(metrics.durationSeconds as number)} @ ${metrics.weight} ${metrics.unit}`;
    case 'weight_distance':
      return `${metrics.distanceMeters}m @ ${metrics.weight} ${metrics.unit}`;
    case 'calories_time': {
      const base = `${metrics.calories} cal`;
      return metrics.durationSeconds
        ? `${base} in ${formatDuration(metrics.durationSeconds as number)}`
        : base;
    }
    case 'reps_duration':
      return `${metrics.reps} reps in ${formatDuration(metrics.durationSeconds as number)}`;
    case 'distance':
      return `${metrics.distanceMeters}m`;
    case 'band_reps':
      return `${metrics.reps} reps (${metrics.bandColor} band)`;
    case 'rpe':
      return `RPE ${metrics.rpe}`;
    case 'weight_reps_tempo': {
      const base = `${metrics.reps} reps`;
      const w = metrics.weight ? ` @ ${metrics.weight} ${metrics.unit}` : '';
      return `${base}${w} (${metrics.tempo})`;
    }
    case 'machine_reps':
      return `${metrics.reps} reps @ level ${metrics.machineLevel}`;
    case 'height_reps': {
      if (metrics.reps) return `${metrics.reps} reps @ ${metrics.heightCm}cm`;
      if (metrics.durationSeconds) return `${formatDuration(metrics.durationSeconds as number)} @ ${metrics.heightCm}cm`;
      return `${metrics.heightCm}cm`;
    }
  }
}

export function formatLoggedMetrics(
  exerciseType: ExerciseType,
  metrics: Record<string, unknown>,
): string {
  // Logged metrics use the same formatting logic
  return formatTemplateMetrics(exerciseType, metrics);
}
