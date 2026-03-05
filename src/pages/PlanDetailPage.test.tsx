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
          <Route path="/" element={<div>Plans Page</div>} />
          <Route path="/plan/:id" element={<PlanDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should navigate back to plans page when back button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Test Plan')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Plans Page')).toBeInTheDocument();
    });
  });

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

  describe('plan context', () => {
    it('should display plan context when present', async () => {
      await db.plans.update(planId, { context: 'User has a bad knee. Prefers mornings.' });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('User has a bad knee. Prefers mornings.')).toBeInTheDocument();
      });
    });

    it('should show "No context saved yet" when context is empty', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      });
      expect(screen.getByText('No context saved yet. Chat with AI to build context about your goals and preferences.')).toBeInTheDocument();
    });

    it('should show context section header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      });
      expect(screen.getByText('AI Context')).toBeInTheDocument();
    });

    it('should allow editing context', async () => {
      await db.plans.update(planId, { context: 'Old context' });
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Old context')).toBeInTheDocument();
      });

      // Click edit button
      await user.click(screen.getByRole('button', { name: /edit context/i }));

      // Should show a textarea with the current context
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Old context');

      // Edit the context
      await user.clear(textarea);
      await user.type(textarea, 'New context');

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Verify DB was updated
      const updatedPlan = await db.plans.get(planId);
      expect(updatedPlan?.context).toBe('New context');
    });

    it('should allow cancelling context edit', async () => {
      await db.plans.update(planId, { context: 'Original context' });
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Original context')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit context/i }));
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Changed text');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Should still show original context
      expect(screen.getByText('Original context')).toBeInTheDocument();

      // DB should not have changed
      const plan = await db.plans.get(planId);
      expect(plan?.context).toBe('Original context');
    });
  });

  describe('delete routine', () => {
    it('should show a delete button for each routine', async () => {
      await db.routines.add(makeRoutine(planId, { name: 'Push Day', schedule: [] }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should delete routine and its exercises on confirm', async () => {
      const routine = makeRoutine(planId, { name: 'Push Day', schedule: [] });
      await db.routines.add(routine);
      await db.exercises.add(makeExercise(routine.id, { name: 'Bench Press' }));

      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(async () => {
        expect(await db.routines.count()).toBe(0);
      });
      expect(await db.exercises.count()).toBe(0);
    });

    it('should cancel routine delete', async () => {
      const routine = makeRoutine(planId, { name: 'Push Day', schedule: [] });
      await db.routines.add(routine);

      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByText('Cancel'));

      expect(await db.routines.count()).toBe(1);
    });
  });

  describe('delete exercise', () => {
    it('should show delete buttons for exercises when routine is expanded', async () => {
      const routine = makeRoutine(planId, { name: 'Push Day', schedule: [] });
      await db.routines.add(routine);
      await db.exercises.add(makeExercise(routine.id, { name: 'Bench Press' }));

      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });

      // Expand the routine
      await user.click(screen.getByText('Push Day'));
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });

      // There should be delete buttons for both routine and exercise
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should delete a single exercise on confirm', async () => {
      const routine = makeRoutine(planId, { name: 'Push Day', schedule: [] });
      await db.routines.add(routine);
      const ex1 = makeExercise(routine.id, { name: 'Bench Press', order: 0 });
      const ex2 = makeExercise(routine.id, { name: 'Flyes', order: 1 });
      await db.exercises.bulkAdd([ex1, ex2]);

      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });

      // Expand routine
      await user.click(screen.getByText('Push Day'));
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });

      // Click delete on the first exercise
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      // The routine delete is first, exercise deletes follow
      const exerciseDeleteBtn = deleteButtons[1]; // first exercise delete
      await user.click(exerciseDeleteBtn);
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(async () => {
        expect(await db.exercises.count()).toBe(1);
      });
      // The routine should still exist
      expect(await db.routines.count()).toBe(1);
    });
  });
});
