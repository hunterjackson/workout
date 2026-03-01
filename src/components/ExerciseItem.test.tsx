import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseItem from './ExerciseItem';
import type { Exercise } from '../lib/types';

function makeEx(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    routineId: 'r-1',
    name: 'Bench Press',
    sets: 4,
    reps: '8-10',
    weight: 135,
    unit: 'lbs',
    restSeconds: 90,
    order: 0,
    ...overrides,
  };
}

describe('ExerciseItem', () => {
  it('should render exercise name', () => {
    render(<ExerciseItem exercise={makeEx()} />);
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('should render sets and reps', () => {
    render(<ExerciseItem exercise={makeEx({ sets: 3, reps: '12' })} />);
    expect(screen.getByText(/3 × 12/)).toBeInTheDocument();
  });

  it('should render weight with unit', () => {
    render(<ExerciseItem exercise={makeEx({ weight: 200, unit: 'lbs' })} />);
    expect(screen.getByText('200 lbs')).toBeInTheDocument();
  });

  it('should render kg unit', () => {
    render(<ExerciseItem exercise={makeEx({ weight: 60, unit: 'kg' })} />);
    expect(screen.getByText('60 kg')).toBeInTheDocument();
  });

  it('should render BW for bodyweight exercises', () => {
    render(<ExerciseItem exercise={makeEx({ unit: 'bodyweight' })} />);
    expect(screen.getByText('BW')).toBeInTheDocument();
  });

  it('should not show weight for exercises without weight', () => {
    const { container } = render(<ExerciseItem exercise={makeEx({ weight: undefined, unit: 'lbs' })} />);
    expect(container.textContent).not.toContain('lbs');
  });

  it('should render notes when present', () => {
    render(<ExerciseItem exercise={makeEx({ notes: 'Go slow on eccentric' })} />);
    expect(screen.getByText('Go slow on eccentric')).toBeInTheDocument();
  });

  it('should not render notes when absent', () => {
    const { container } = render(<ExerciseItem exercise={makeEx({ notes: undefined })} />);
    // No extra text elements beyond name, sets/reps
    const allText = container.textContent!;
    expect(allText).toContain('Bench Press');
    expect(allText).toContain('4 × 8-10');
  });

  it('should render video link when videoUrl is present', () => {
    render(<ExerciseItem exercise={makeEx({ videoUrl: 'https://youtube.com/watch?v=abc' })} />);
    const link = screen.getByText('Video');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://youtube.com/watch?v=abc');
  });

  it('should not render video link when videoUrl is absent', () => {
    render(<ExerciseItem exercise={makeEx({ videoUrl: undefined })} />);
    expect(screen.queryByText('Video')).not.toBeInTheDocument();
  });
});
