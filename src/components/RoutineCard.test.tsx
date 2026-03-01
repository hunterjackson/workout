import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoutineCard from './RoutineCard';
import type { Routine, Exercise } from '../lib/types';

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: 'r-1',
    planId: 'p-1',
    name: 'Push Day',
    schedule: [1, 3, 5],
    order: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    routineId: 'r-1',
    name: 'Bench Press',
    sets: 4,
    reps: '8-10',
    weight: 135,
    unit: 'lbs',
    order: 0,
    ...overrides,
  };
}

describe('RoutineCard', () => {
  it('should render routine name', () => {
    render(<RoutineCard routine={makeRoutine()} exercises={[]} />);
    expect(screen.getByText('Push Day')).toBeInTheDocument();
  });

  it('should render exercise count', () => {
    const exercises = [
      makeExercise({ id: 'e1', name: 'Bench' }),
      makeExercise({ id: 'e2', name: 'Flyes' }),
    ];
    render(<RoutineCard routine={makeRoutine()} exercises={exercises} />);
    expect(screen.getByText('2 exercises')).toBeInTheDocument();
  });

  it('should render schedule badges', () => {
    render(<RoutineCard routine={makeRoutine({ schedule: [1, 3, 5] })} exercises={[]} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('should render notes when present', () => {
    render(
      <RoutineCard routine={makeRoutine({ notes: 'Focus on chest' })} exercises={[]} />
    );
    expect(screen.getByText('Focus on chest')).toBeInTheDocument();
  });

  it('should not show exercises by default (collapsed)', () => {
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<RoutineCard routine={makeRoutine()} exercises={exercises} />);
    expect(screen.queryByText('4 × 8-10')).not.toBeInTheDocument();
  });

  it('should expand to show exercises on click', async () => {
    const user = userEvent.setup();
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<RoutineCard routine={makeRoutine()} exercises={exercises} />);

    await user.click(screen.getByText('Push Day'));
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText(/4 × 8-10/)).toBeInTheDocument();
  });

  it('should collapse on second click', async () => {
    const user = userEvent.setup();
    const exercises = [makeExercise({ name: 'Bench Press' })];
    render(<RoutineCard routine={makeRoutine()} exercises={exercises} />);

    await user.click(screen.getByText('Push Day'));
    expect(screen.getByText(/4 × 8-10/)).toBeInTheDocument();

    await user.click(screen.getByText('Push Day'));
    expect(screen.queryByText(/4 × 8-10/)).not.toBeInTheDocument();
  });

  it('should show empty state when expanded with no exercises', async () => {
    const user = userEvent.setup();
    render(<RoutineCard routine={makeRoutine()} exercises={[]} />);

    await user.click(screen.getByText('Push Day'));
    expect(screen.getByText(/no exercises yet/i)).toBeInTheDocument();
  });
});
