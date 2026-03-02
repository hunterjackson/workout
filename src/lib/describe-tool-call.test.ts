import { describe, it, expect } from 'vitest';
import { describeProposedToolCall } from './describe-tool-call';

describe('describeProposedToolCall', () => {
  it('should describe create_routine', () => {
    expect(
      describeProposedToolCall('create_routine', { name: 'Push Day', schedule: [1, 3, 5] })
    ).toBe('Create routine "Push Day"');
  });

  it('should describe update_routine with name', () => {
    expect(
      describeProposedToolCall('update_routine', { routineId: 'r1', name: 'New Name' })
    ).toBe('Update routine "New Name"');
  });

  it('should describe update_routine without name', () => {
    expect(
      describeProposedToolCall('update_routine', { routineId: 'r1', schedule: [2, 4] })
    ).toBe('Update routine');
  });

  it('should describe delete_routine', () => {
    expect(
      describeProposedToolCall('delete_routine', { routineId: 'r1' })
    ).toBe('Delete routine');
  });

  it('should describe add_exercise', () => {
    expect(
      describeProposedToolCall('add_exercise', {
        routineId: 'r1',
        name: 'Bench Press',
        sets: 4,
        reps: '8-10',
      })
    ).toBe('Add exercise "Bench Press" (4 x 8-10)');
  });

  it('should describe update_exercise with name', () => {
    expect(
      describeProposedToolCall('update_exercise', { exerciseId: 'e1', name: 'Incline Bench' })
    ).toBe('Update exercise "Incline Bench"');
  });

  it('should describe update_exercise without name', () => {
    expect(
      describeProposedToolCall('update_exercise', { exerciseId: 'e1', sets: 5 })
    ).toBe('Update exercise');
  });

  it('should describe delete_exercise', () => {
    expect(
      describeProposedToolCall('delete_exercise', { exerciseId: 'e1' })
    ).toBe('Delete exercise');
  });

  it('should handle unknown tool names', () => {
    expect(
      describeProposedToolCall('unknown_tool', {})
    ).toBe('unknown_tool');
  });
});
