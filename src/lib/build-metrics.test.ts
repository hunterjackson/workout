import { describe, it, expect } from 'vitest';
import { buildTemplateMetrics, buildLoggedMetrics } from './build-metrics';

describe('buildTemplateMetrics', () => {
  it('builds weight_reps metrics', () => {
    const result = buildTemplateMetrics('weight_reps', { weight: 135, reps: '8-10', unit: 'lbs' });
    expect(result).toEqual({ weight: 135, reps: '8-10', unit: 'lbs' });
  });

  it('defaults unit to lbs for weight_reps', () => {
    const result = buildTemplateMetrics('weight_reps', { reps: '12' });
    expect(result).toEqual({ reps: '12', unit: 'lbs' });
  });

  it('builds bodyweight_reps metrics', () => {
    const result = buildTemplateMetrics('bodyweight_reps', { reps: 'AMRAP' });
    expect(result).toEqual({ reps: 'AMRAP' });
  });

  it('builds bodyweight_reps with added weight', () => {
    const result = buildTemplateMetrics('bodyweight_reps', { reps: '8', addedWeight: 25, unit: 'lbs' });
    expect(result).toEqual({ reps: '8', addedWeight: 25, unit: 'lbs' });
  });

  it('builds duration metrics', () => {
    const result = buildTemplateMetrics('duration', { durationSeconds: 60 });
    expect(result).toEqual({ durationSeconds: 60 });
  });

  it('builds distance_time metrics', () => {
    const result = buildTemplateMetrics('distance_time', { distanceMeters: 5000, durationSeconds: 1200 });
    expect(result).toEqual({ distanceMeters: 5000, durationSeconds: 1200 });
  });

  it('builds distance_time without duration', () => {
    const result = buildTemplateMetrics('distance_time', { distanceMeters: 400 });
    expect(result).toEqual({ distanceMeters: 400 });
  });

  it('builds weight_duration metrics', () => {
    const result = buildTemplateMetrics('weight_duration', { weight: 70, durationSeconds: 30, unit: 'kg' });
    expect(result).toEqual({ weight: 70, durationSeconds: 30, unit: 'kg' });
  });

  it('builds weight_distance metrics', () => {
    const result = buildTemplateMetrics('weight_distance', { weight: 90, distanceMeters: 50, unit: 'lbs' });
    expect(result).toEqual({ weight: 90, distanceMeters: 50, unit: 'lbs' });
  });

  it('builds calories_time metrics', () => {
    const result = buildTemplateMetrics('calories_time', { calories: 30, durationSeconds: 120 });
    expect(result).toEqual({ calories: 30, durationSeconds: 120 });
  });

  it('builds reps_duration metrics', () => {
    const result = buildTemplateMetrics('reps_duration', { reps: '10', durationSeconds: 60 });
    expect(result).toEqual({ reps: '10', durationSeconds: 60 });
  });

  it('builds distance metrics', () => {
    const result = buildTemplateMetrics('distance', { distanceMeters: 100 });
    expect(result).toEqual({ distanceMeters: 100 });
  });

  it('builds band_reps metrics', () => {
    const result = buildTemplateMetrics('band_reps', { bandColor: 'blue', reps: '12' });
    expect(result).toEqual({ bandColor: 'blue', reps: '12' });
  });

  it('builds rpe metrics', () => {
    const result = buildTemplateMetrics('rpe', { rpe: 7 });
    expect(result).toEqual({ rpe: 7 });
  });

  it('builds weight_reps_tempo metrics', () => {
    const result = buildTemplateMetrics('weight_reps_tempo', {
      weight: 100, reps: '8', tempo: '3-1-2-0', unit: 'lbs',
    });
    expect(result).toEqual({ weight: 100, reps: '8', tempo: '3-1-2-0', unit: 'lbs' });
  });

  it('builds machine_reps metrics', () => {
    const result = buildTemplateMetrics('machine_reps', { machineLevel: 8, reps: '12' });
    expect(result).toEqual({ machineLevel: 8, reps: '12' });
  });

  it('builds height_reps metrics with reps', () => {
    const result = buildTemplateMetrics('height_reps', { heightCm: 60, reps: '5' });
    expect(result).toEqual({ heightCm: 60, reps: '5' });
  });

  it('builds height_reps metrics with duration', () => {
    const result = buildTemplateMetrics('height_reps', { heightCm: 30, durationSeconds: 60 });
    expect(result).toEqual({ heightCm: 30, durationSeconds: 60 });
  });

  it('converts reps to string', () => {
    const result = buildTemplateMetrics('weight_reps', { weight: 100, reps: 12, unit: 'kg' });
    expect(result).toEqual({ weight: 100, reps: '12', unit: 'kg' });
  });
});

describe('buildLoggedMetrics', () => {
  it('builds weight_reps logged metrics', () => {
    const result = buildLoggedMetrics('weight_reps', { weight: 135, reps: 10, unit: 'lbs' });
    expect(result).toEqual({ weight: 135, reps: 10, unit: 'lbs' });
  });

  it('builds bodyweight_reps logged metrics', () => {
    const result = buildLoggedMetrics('bodyweight_reps', { reps: 15 });
    expect(result).toEqual({ reps: 15 });
  });

  it('builds duration logged metrics', () => {
    const result = buildLoggedMetrics('duration', { durationSeconds: 45 });
    expect(result).toEqual({ durationSeconds: 45 });
  });

  it('builds distance_time logged metrics', () => {
    const result = buildLoggedMetrics('distance_time', { distanceMeters: 5000, durationSeconds: 1200 });
    expect(result).toEqual({ distanceMeters: 5000, durationSeconds: 1200 });
  });

  it('builds band_reps logged metrics', () => {
    const result = buildLoggedMetrics('band_reps', { bandColor: 'red', reps: 15 });
    expect(result).toEqual({ bandColor: 'red', reps: 15 });
  });

  it('builds rpe logged metrics', () => {
    const result = buildLoggedMetrics('rpe', { rpe: 8 });
    expect(result).toEqual({ rpe: 8 });
  });

  it('builds weight_reps_tempo logged metrics', () => {
    const result = buildLoggedMetrics('weight_reps_tempo', {
      weight: 100, reps: 8, tempo: '3-1-2-0', unit: 'lbs',
    });
    expect(result).toEqual({ weight: 100, reps: 8, tempo: '3-1-2-0', unit: 'lbs' });
  });

  it('builds machine_reps logged metrics', () => {
    const result = buildLoggedMetrics('machine_reps', { machineLevel: 8, reps: 12 });
    expect(result).toEqual({ machineLevel: 8, reps: 12 });
  });
});
