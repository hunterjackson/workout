import type { ExerciseType } from './exercise-types';

export function getColumnHeaders(exerciseType: ExerciseType): string[] {
  switch (exerciseType) {
    case 'weight_reps':
      return ['Reps', 'Weight'];
    case 'bodyweight_reps':
      return ['Reps'];
    case 'duration':
      return ['Seconds'];
    case 'distance_time':
      return ['Meters', 'Seconds'];
    case 'weight_duration':
      return ['Seconds', 'Weight'];
    case 'weight_distance':
      return ['Meters', 'Weight'];
    case 'calories_time':
      return ['Calories', 'Seconds'];
    case 'reps_duration':
      return ['Reps', 'Seconds'];
    case 'distance':
      return ['Meters'];
    case 'band_reps':
      return ['Reps', 'Band'];
    case 'rpe':
      return ['RPE'];
    case 'weight_reps_tempo':
      return ['Reps', 'Weight'];
    case 'machine_reps':
      return ['Reps', 'Level'];
    case 'height_reps':
      return ['Reps', 'Height'];
  }
}
