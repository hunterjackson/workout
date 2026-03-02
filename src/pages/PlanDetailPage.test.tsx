import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PlanDetailPage from './PlanDetailPage';
import { db } from '../lib/db';
import { resetDb, makePlan, makeRoutine, makeExercise } from '../test/helpers';

describe('PlanDetailPage', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    const plan = makePlan({ name: 'Test Plan', goal: 'Get fit' });
    await db.plans.add(plan);
    planId = plan.id;
  });

  function renderPage(id: string = planId) {
    return render(
      <MemoryRouter initialEntries={[`/plan/${id}`]}>
        <Routes>
          <Route path="/plan/:id" element={<PlanDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should show loading state initially for non-existent plan', async () => {
    renderPage('nonexistent');
    expect(screen.getByText('Loading plan...')).toBeInTheDocument();
  });

  it('should render plan name and goal', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Test Plan')).toBeInTheDocument();
    });
    expect(screen.getByText('Get fit')).toBeInTheDocument();
  });

  it('should show "No routines yet" when plan is empty', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No routines yet')).toBeInTheDocument();
    });
  });

  it('should render routines', async () => {
    const routine = makeRoutine(planId, { name: 'Push Day', schedule: [1, 3] });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Bench Press' });
    await db.exercises.add(exercise);

    renderPage();
    await waitFor(() => {
      // "Push Day" appears in both weekly schedule and routine card
      expect(screen.getAllByText('Push Day').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should render weekly schedule', async () => {
    const routine = makeRoutine(planId, { name: 'Push Day', schedule: [1] }); // Monday
    await db.routines.add(routine);

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
    });
    // Monday should show the routine name
    expect(screen.getAllByText('Push Day').length).toBeGreaterThanOrEqual(1);
  });

  it('should show "Rest" for unscheduled days', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
    });
    // With no routines, all days should be Rest
    const restLabels = screen.getAllByText('Rest');
    expect(restLabels.length).toBe(7);
  });

  describe('model selector', () => {
    it('should render a model selector', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('AI Model')).toBeInTheDocument();
    });

    it('should default to Claude Sonnet when no model is set', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      });
      const select = screen.getByLabelText('AI Model') as HTMLSelectElement;
      expect(select.value).toBe('claude-sonnet-4-20250514');
    });

    it('should show the plan model when set', async () => {
      await db.plans.update(planId, { model: 'claude-haiku-4-5-20251001' });
      renderPage();
      await waitFor(() => {
        const select = screen.getByLabelText('AI Model') as HTMLSelectElement;
        expect(select.value).toBe('claude-haiku-4-5-20251001');
      });
    });

    it('should update plan model when selection changes', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByLabelText('AI Model')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('AI Model');
      await user.selectOptions(select, 'claude-haiku-4-5-20251001');

      // Verify DB was updated
      const updatedPlan = await db.plans.get(planId);
      expect(updatedPlan?.model).toBe('claude-haiku-4-5-20251001');
    });
  });
});
