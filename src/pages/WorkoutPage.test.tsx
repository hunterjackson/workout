import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import WorkoutPage from './WorkoutPage';
import { db } from '../lib/db';
import { resetDb, makePlan, makeRoutine, makeExercise } from '../test/helpers';

describe('WorkoutPage', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;
  });

  function renderWorkout(id: string = planId) {
    return render(
      <MemoryRouter initialEntries={[`/plan/${id}/workout`]}>
        <Routes>
          <Route path="/plan/:id/workout" element={<WorkoutPage />} />
          <Route path="/plan/:id/history" element={<div>History Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should render Start Workout heading', async () => {
    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Start Workout')).toBeInTheDocument();
    });
  });

  it('should show empty state when no routines', async () => {
    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText(/no routines yet/i)).toBeInTheDocument();
    });
  });

  it('should list all routines', async () => {
    const r1 = makeRoutine(planId, { name: 'Push Day', order: 0, schedule: [] });
    const r2 = makeRoutine(planId, { name: 'Pull Day', order: 1, schedule: [] });
    await db.routines.bulkAdd([r1, r2]);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
    });
    expect(screen.getByText('Pull Day')).toBeInTheDocument();
  });

  it('should start workout when routine is selected', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Push Day', schedule: [] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, {
      name: 'Bench Press',
      sets: 3,
      reps: '10',
      weight: 135,
    });
    await db.exercises.add(exercise);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Push Day'));

    // Should now be in active workout mode
    await waitFor(() => {
      expect(screen.getByText('Workout')).toBeInTheDocument();
    });
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Finish Workout')).toBeInTheDocument();
  });

  it('should show progress counter', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Test', schedule: [] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Squat', sets: 2, reps: '5' });
    await db.exercises.add(exercise);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test'));

    await waitFor(() => {
      expect(screen.getByText('0/2 sets')).toBeInTheDocument();
    });
  });

  it('should show complete modal when Finish Workout is clicked', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Day A', schedule: [] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Exercise', sets: 1, reps: '1' });
    await db.exercises.add(exercise);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Day A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Day A'));

    await waitFor(() => {
      expect(screen.getByText('Finish Workout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Finish Workout'));

    expect(screen.getByText('Complete Workout?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Workout notes (optional)')).toBeInTheDocument();
    expect(screen.getByText('Save & Finish')).toBeInTheDocument();
  });

  it('should save workout and navigate to history', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Session', schedule: [] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Lift', sets: 1, reps: '5' });
    await db.exercises.add(exercise);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Session')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Session'));

    await waitFor(() => {
      expect(screen.getByText('Finish Workout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Finish Workout'));
    await user.click(screen.getByText('Save & Finish'));

    // Should navigate to history
    await waitFor(() => {
      expect(screen.getByText('History Page')).toBeInTheDocument();
    });

    // Verify workout was saved in DB
    const workouts = await db.workouts.toArray();
    expect(workouts).toHaveLength(1);
    expect(workouts[0].planId).toBe(planId);
  });

  it('should use w-full and min-w-0 on set inputs to prevent overflow', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Overflow Test', schedule: [] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Press', sets: 1, reps: '10', weight: 135 });
    await db.exercises.add(exercise);

    renderWorkout();
    await waitFor(() => {
      expect(screen.getByText('Overflow Test')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Overflow Test'));

    await waitFor(() => {
      expect(screen.getByText('Press')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      expect(input.className).toContain('min-w-0');
      expect(input.className).toContain('w-full');
    }
  });
});
