export const EXERCISE_TYPES = [
  'weight_reps',
  'bodyweight_reps',
  'duration',
  'distance_time',
  'weight_duration',
  'weight_distance',
  'calories_time',
  'reps_duration',
  'distance',
  'band_reps',
  'rpe',
  'weight_reps_tempo',
  'machine_reps',
  'height_reps',
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const THERABAND_COLORS = [
  'yellow',
  'red',
  'green',
  'blue',
  'black',
  'silver',
  'gold',
] as const;

export type TherabandColor = (typeof THERABAND_COLORS)[number];

// --- Template metrics: what the AI prescribes on an Exercise ---

export interface WeightRepsTemplate {
  weight?: number;
  reps: string;
  unit: 'lbs' | 'kg';
}

export interface BodyweightRepsTemplate {
  reps: string;
  addedWeight?: number;
  unit?: 'lbs' | 'kg';
}

export interface DurationTemplate {
  durationSeconds: number;
}

export interface DistanceTimeTemplate {
  distanceMeters: number;
  durationSeconds?: number;
}

export interface WeightDurationTemplate {
  weight?: number;
  durationSeconds: number;
  unit: 'lbs' | 'kg';
}

export interface WeightDistanceTemplate {
  weight?: number;
  distanceMeters: number;
  unit: 'lbs' | 'kg';
}

export interface CaloriesTimeTemplate {
  calories: number;
  durationSeconds?: number;
}

export interface RepsDurationTemplate {
  reps: string;
  durationSeconds: number;
}

export interface DistanceTemplate {
  distanceMeters: number;
}

export interface BandRepsTemplate {
  bandColor: string;
  reps: string;
}

export interface RpeTemplate {
  rpe: number;
}

export interface WeightRepsTempoTemplate {
  weight?: number;
  reps: string;
  tempo: string;
  unit: 'lbs' | 'kg';
}

export interface MachineRepsTemplate {
  machineLevel: number;
  reps: string;
}

export interface HeightRepsTemplate {
  heightCm: number;
  reps?: string;
  durationSeconds?: number;
}

export interface TemplateMetricsMap {
  weight_reps: WeightRepsTemplate;
  bodyweight_reps: BodyweightRepsTemplate;
  duration: DurationTemplate;
  distance_time: DistanceTimeTemplate;
  weight_duration: WeightDurationTemplate;
  weight_distance: WeightDistanceTemplate;
  calories_time: CaloriesTimeTemplate;
  reps_duration: RepsDurationTemplate;
  distance: DistanceTemplate;
  band_reps: BandRepsTemplate;
  rpe: RpeTemplate;
  weight_reps_tempo: WeightRepsTempoTemplate;
  machine_reps: MachineRepsTemplate;
  height_reps: HeightRepsTemplate;
}

export type TemplateMetrics = TemplateMetricsMap[ExerciseType];

// --- Logged metrics: actual values recorded during a workout ---

export interface WeightRepsLogged {
  weight: number;
  reps: number;
  unit: 'lbs' | 'kg';
}

export interface BodyweightRepsLogged {
  reps: number;
  addedWeight?: number;
  unit?: 'lbs' | 'kg';
}

export interface DurationLogged {
  durationSeconds: number;
}

export interface DistanceTimeLogged {
  distanceMeters: number;
  durationSeconds: number;
}

export interface WeightDurationLogged {
  weight: number;
  durationSeconds: number;
  unit: 'lbs' | 'kg';
}

export interface WeightDistanceLogged {
  weight: number;
  distanceMeters: number;
  unit: 'lbs' | 'kg';
}

export interface CaloriesTimeLogged {
  calories: number;
  durationSeconds: number;
}

export interface RepsDurationLogged {
  reps: number;
  durationSeconds: number;
}

export interface DistanceLogged {
  distanceMeters: number;
}

export interface BandRepsLogged {
  bandColor: string;
  reps: number;
}

export interface RpeLogged {
  rpe: number;
}

export interface WeightRepsTempoLogged {
  weight: number;
  reps: number;
  tempo: string;
  unit: 'lbs' | 'kg';
}

export interface MachineRepsLogged {
  machineLevel: number;
  reps: number;
}

export interface HeightRepsLogged {
  heightCm: number;
  reps?: number;
  durationSeconds?: number;
}

export interface LoggedMetricsMap {
  weight_reps: WeightRepsLogged;
  bodyweight_reps: BodyweightRepsLogged;
  duration: DurationLogged;
  distance_time: DistanceTimeLogged;
  weight_duration: WeightDurationLogged;
  weight_distance: WeightDistanceLogged;
  calories_time: CaloriesTimeLogged;
  reps_duration: RepsDurationLogged;
  distance: DistanceLogged;
  band_reps: BandRepsLogged;
  rpe: RpeLogged;
  weight_reps_tempo: WeightRepsTempoLogged;
  machine_reps: MachineRepsLogged;
  height_reps: HeightRepsLogged;
}

export type LoggedMetrics = LoggedMetricsMap[ExerciseType];
