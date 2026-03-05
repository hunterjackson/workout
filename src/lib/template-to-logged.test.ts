import { describe, it, expect } from 'vitest';
import { templateToLoggedMetrics } from './template-to-logged';

describe('templateToLoggedMetrics', () => {
  it('converts weight_reps template to logged', () => {
    const result = templateToLoggedMetrics('weight_reps', { weight: 135, reps: '8-10', unit: 'lbs' });
    expect(result).toEqual({ weight: 135, reps: 8, unit: 'lbs' });
  });

  it('parses single number reps', () => {
    const result = templateToLoggedMetrics('weight_reps', { weight: 100, reps: '12', unit: 'kg' });
    expect(result).toEqual({ weight: 100, reps: 12, unit: 'kg' });
  });

  it('handles AMRAP as 0 reps', () => {
    const result = templateToLoggedMetrics('weight_reps', { weight: 100, reps: 'AMRAP', unit: 'lbs' });
    expect(result).toEqual({ weight: 100, reps: 0, unit: 'lbs' });
  });

  it('converts bodyweight_reps template', () => {
    const result = templateToLoggedMetrics('bodyweight_reps', { reps: '15' });
    expect(result).toEqual({ reps: 15 });
  });

  it('converts bodyweight_reps with added weight', () => {
    const result = templateToLoggedMetrics('bodyweight_reps', { reps: '8', addedWeight: 25, unit: 'lbs' });
    expect(result).toEqual({ reps: 8, addedWeight: 25, unit: 'lbs' });
  });

  it('converts duration template', () => {
    const result = templateToLoggedMetrics('duration', { durationSeconds: 60 });
    expect(result).toEqual({ durationSeconds: 60 });
  });

  it('converts distance_time template', () => {
    const result = templateToLoggedMetrics('distance_time', { distanceMeters: 5000, durationSeconds: 1200 });
    expect(result).toEqual({ distanceMeters: 5000, durationSeconds: 1200 });
  });

  it('converts distance_time without duration', () => {
    const result = templateToLoggedMetrics('distance_time', { distanceMeters: 400 });
    expect(result).toEqual({ distanceMeters: 400, durationSeconds: 0 });
  });

  it('converts band_reps template', () => {
    const result = templateToLoggedMetrics('band_reps', { bandColor: 'blue', reps: '12' });
    expect(result).toEqual({ bandColor: 'blue', reps: 12 });
  });

  it('converts rpe template', () => {
    const result = templateToLoggedMetrics('rpe', { rpe: 7 });
    expect(result).toEqual({ rpe: 7 });
  });

  it('converts weight_reps_tempo template', () => {
    const result = templateToLoggedMetrics('weight_reps_tempo', {
      weight: 100, reps: '8', tempo: '3-1-2-0', unit: 'lbs',
    });
    expect(result).toEqual({ weight: 100, reps: 8, tempo: '3-1-2-0', unit: 'lbs' });
  });

  it('converts machine_reps template', () => {
    const result = templateToLoggedMetrics('machine_reps', { machineLevel: 8, reps: '12' });
    expect(result).toEqual({ machineLevel: 8, reps: 12 });
  });

  it('converts height_reps with reps', () => {
    const result = templateToLoggedMetrics('height_reps', { heightCm: 60, reps: '5' });
    expect(result).toEqual({ heightCm: 60, reps: 5 });
  });

  it('converts height_reps with duration', () => {
    const result = templateToLoggedMetrics('height_reps', { heightCm: 30, durationSeconds: 60 });
    expect(result).toEqual({ heightCm: 30, durationSeconds: 60 });
  });

  it('converts weight_duration template', () => {
    const result = templateToLoggedMetrics('weight_duration', { weight: 70, durationSeconds: 30, unit: 'kg' });
    expect(result).toEqual({ weight: 70, durationSeconds: 30, unit: 'kg' });
  });

  it('converts weight_distance template', () => {
    const result = templateToLoggedMetrics('weight_distance', { weight: 90, distanceMeters: 50, unit: 'lbs' });
    expect(result).toEqual({ weight: 90, distanceMeters: 50, unit: 'lbs' });
  });

  it('converts calories_time template', () => {
    const result = templateToLoggedMetrics('calories_time', { calories: 30, durationSeconds: 120 });
    expect(result).toEqual({ calories: 30, durationSeconds: 120 });
  });

  it('converts reps_duration template', () => {
    const result = templateToLoggedMetrics('reps_duration', { reps: '10', durationSeconds: 60 });
    expect(result).toEqual({ reps: 10, durationSeconds: 60 });
  });

  it('converts distance template', () => {
    const result = templateToLoggedMetrics('distance', { distanceMeters: 100 });
    expect(result).toEqual({ distanceMeters: 100 });
  });
});
