import { describe, it, expect } from 'vitest';
import { formatTemplateMetrics, formatLoggedMetrics } from './format-metrics';

describe('formatTemplateMetrics', () => {
  it('formats weight_reps', () => {
    expect(formatTemplateMetrics('weight_reps', { weight: 135, reps: '8-10', unit: 'lbs' }))
      .toBe('8-10 reps @ 135 lbs');
  });

  it('formats weight_reps without weight', () => {
    expect(formatTemplateMetrics('weight_reps', { reps: '12', unit: 'lbs' }))
      .toBe('12 reps');
  });

  it('formats bodyweight_reps', () => {
    expect(formatTemplateMetrics('bodyweight_reps', { reps: 'AMRAP' }))
      .toBe('AMRAP reps (BW)');
  });

  it('formats bodyweight_reps with added weight', () => {
    expect(formatTemplateMetrics('bodyweight_reps', { reps: '8', addedWeight: 25, unit: 'lbs' }))
      .toBe('8 reps (BW+25 lbs)');
  });

  it('formats duration', () => {
    expect(formatTemplateMetrics('duration', { durationSeconds: 60 }))
      .toBe('1:00');
  });

  it('formats duration with minutes', () => {
    expect(formatTemplateMetrics('duration', { durationSeconds: 90 }))
      .toBe('1:30');
  });

  it('formats distance_time', () => {
    expect(formatTemplateMetrics('distance_time', { distanceMeters: 5000, durationSeconds: 1200 }))
      .toBe('5000m in 20:00');
  });

  it('formats distance_time without duration', () => {
    expect(formatTemplateMetrics('distance_time', { distanceMeters: 400 }))
      .toBe('400m');
  });

  it('formats weight_duration', () => {
    expect(formatTemplateMetrics('weight_duration', { weight: 70, durationSeconds: 30, unit: 'kg' }))
      .toBe('30s @ 70 kg');
  });

  it('formats weight_distance', () => {
    expect(formatTemplateMetrics('weight_distance', { weight: 90, distanceMeters: 50, unit: 'lbs' }))
      .toBe('50m @ 90 lbs');
  });

  it('formats calories_time', () => {
    expect(formatTemplateMetrics('calories_time', { calories: 30, durationSeconds: 120 }))
      .toBe('30 cal in 2:00');
  });

  it('formats calories_time without duration', () => {
    expect(formatTemplateMetrics('calories_time', { calories: 20 }))
      .toBe('20 cal');
  });

  it('formats reps_duration', () => {
    expect(formatTemplateMetrics('reps_duration', { reps: '10', durationSeconds: 60 }))
      .toBe('10 reps in 1:00');
  });

  it('formats distance', () => {
    expect(formatTemplateMetrics('distance', { distanceMeters: 100 }))
      .toBe('100m');
  });

  it('formats band_reps', () => {
    expect(formatTemplateMetrics('band_reps', { bandColor: 'blue', reps: '12' }))
      .toBe('12 reps (blue band)');
  });

  it('formats rpe', () => {
    expect(formatTemplateMetrics('rpe', { rpe: 7 }))
      .toBe('RPE 7');
  });

  it('formats weight_reps_tempo', () => {
    expect(formatTemplateMetrics('weight_reps_tempo', { weight: 100, reps: '8', tempo: '3-1-2-0', unit: 'lbs' }))
      .toBe('8 reps @ 100 lbs (3-1-2-0)');
  });

  it('formats machine_reps', () => {
    expect(formatTemplateMetrics('machine_reps', { machineLevel: 8, reps: '12' }))
      .toBe('12 reps @ level 8');
  });

  it('formats height_reps with reps', () => {
    expect(formatTemplateMetrics('height_reps', { heightCm: 60, reps: '5' }))
      .toBe('5 reps @ 60cm');
  });

  it('formats height_reps with duration', () => {
    expect(formatTemplateMetrics('height_reps', { heightCm: 30, durationSeconds: 60 }))
      .toBe('1:00 @ 30cm');
  });
});

describe('formatLoggedMetrics', () => {
  it('formats weight_reps', () => {
    expect(formatLoggedMetrics('weight_reps', { weight: 135, reps: 10, unit: 'lbs' }))
      .toBe('10 reps @ 135 lbs');
  });

  it('formats bodyweight_reps', () => {
    expect(formatLoggedMetrics('bodyweight_reps', { reps: 15 }))
      .toBe('15 reps (BW)');
  });

  it('formats duration', () => {
    expect(formatLoggedMetrics('duration', { durationSeconds: 45 }))
      .toBe('45s');
  });

  it('formats band_reps', () => {
    expect(formatLoggedMetrics('band_reps', { bandColor: 'red', reps: 15 }))
      .toBe('15 reps (red band)');
  });

  it('formats rpe', () => {
    expect(formatLoggedMetrics('rpe', { rpe: 8 }))
      .toBe('RPE 8');
  });

  it('formats machine_reps', () => {
    expect(formatLoggedMetrics('machine_reps', { machineLevel: 5, reps: 12 }))
      .toBe('12 reps @ level 5');
  });
});
