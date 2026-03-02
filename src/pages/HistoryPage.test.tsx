import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './HistoryPage';
import { db } from '../lib/db';
import { resetDb, makePlan, makeRoutine, makeWorkout, makeWorkoutSet } from '../test/helpers';

describe('HistoryPage', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    localStorage.clear();
    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;
  });

  function renderHistory(id: string = planId) {
    return render(
      <MemoryRouter initialEntries={[`/plan/${id}/history`]}>
        <Routes>
          <Route path="/" element={<div>Plans Page</div>} />
          <Route path="/plan/:id/history" element={<HistoryPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should navigate back to plans page when back button is clicked', async () => {
    const user = userEvent.setup();
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Plans Page')).toBeInTheDocument();
    });
  });

  it('should render the History heading', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });
  });

  it('should show empty state when no workouts', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('No workouts yet')).toBeInTheDocument();
    });
  });

  it('should render completed workouts', async () => {
    const routine = makeRoutine(planId, { name: 'Push Day' });
    await db.routines.add(routine);
    const workout = makeWorkout(planId, [routine.id], {
      date: '2025-06-15',
      completedAt: Date.now(),
    });
    await db.workouts.add(workout);

    const ws = makeWorkoutSet(workout.id, 'ex-1', {
      exerciseName: 'Bench Press',
      reps: 10,
      weight: 135,
    });
    await db.workoutSets.add(ws);

    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
    });
    // workoutSets is a dependent live query; wait for it to resolve
    await waitFor(() => {
      expect(screen.getByText('1 sets')).toBeInTheDocument();
    });
  });

  it('should show workout notes when present', async () => {
    const workout = makeWorkout(planId, [], { notes: 'Felt great today!' });
    await db.workouts.add(workout);

    renderHistory();
    await waitFor(() => {
      expect(screen.getByText(/"Felt great today!"/)).toBeInTheDocument();
    });
  });

  it('should display workouts in newest-first order', async () => {
    const routine = makeRoutine(planId, { name: 'Push' });
    await db.routines.add(routine);

    // Create workouts on different dates with different completedAt times
    const older = makeWorkout(planId, [routine.id], {
      date: '2025-01-01',
      completedAt: 1000,
    });
    const newer = makeWorkout(planId, [routine.id], {
      date: '2025-06-15',
      completedAt: 2000,
    });
    // Insert older first, then newer
    await db.workouts.bulkAdd([older, newer]);

    renderHistory();

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const dateTexts = buttons.map((b) => b.textContent).filter(Boolean);
      // The newer date (Jun 15) should appear before the older date (Jan 1)
      const junIdx = dateTexts.findIndex((t) => t!.includes('Jun'));
      const janIdx = dateTexts.findIndex((t) => t!.includes('Jan'));
      expect(junIdx).toBeGreaterThan(-1);
      expect(janIdx).toBeGreaterThan(-1);
      expect(junIdx).toBeLessThan(janIdx);
    });
  });

  it('should expand workout details on click', async () => {
    const user = userEvent.setup();
    const routine = makeRoutine(planId, { name: 'Push' });
    await db.routines.add(routine);
    const workout = makeWorkout(planId, [routine.id], { date: '2025-06-15' });
    await db.workouts.add(workout);

    const ws = makeWorkoutSet(workout.id, 'ex-1', {
      exerciseName: 'Bench Press',
      setNumber: 1,
      reps: 10,
      weight: 135,
    });
    await db.workoutSets.add(ws);

    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('Push')).toBeInTheDocument();
    });

    // Click to expand
    await user.click(screen.getByText('Push').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
    expect(screen.getByText('10 reps')).toBeInTheDocument();
  });
});
