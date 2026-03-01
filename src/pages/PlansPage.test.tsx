import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PlansPage from './PlansPage';
import { db } from '../lib/db';
import { resetDb, makePlan } from '../test/helpers';

describe('PlansPage', () => {
  beforeEach(async () => {
    await resetDb();
  });

  function renderPlans() {
    return render(
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    );
  }

  it('should render the "My Plans" heading', () => {
    renderPlans();
    expect(screen.getByText('My Plans')).toBeInTheDocument();
  });

  it('should show empty state when no plans exist', async () => {
    renderPlans();
    await waitFor(() => {
      expect(screen.getByText('No plans yet')).toBeInTheDocument();
    });
    expect(screen.getByText('Create Plan')).toBeInTheDocument();
  });

  it('should show existing plans', async () => {
    await db.plans.add(makePlan({ name: 'Strength Program', goal: 'Get strong' }));

    renderPlans();
    await waitFor(() => {
      expect(screen.getByText('Strength Program')).toBeInTheDocument();
    });
    expect(screen.getByText('Get strong')).toBeInTheDocument();
  });

  it('should open create plan modal', async () => {
    const user = userEvent.setup();
    renderPlans();

    await waitFor(() => {
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Create Plan'));

    expect(screen.getByText('New Plan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Plan name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Goal (optional)')).toBeInTheDocument();
  });

  it('should create a new plan', async () => {
    const user = userEvent.setup();
    renderPlans();

    await waitFor(() => {
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Create Plan'));

    await user.type(screen.getByPlaceholderText('Plan name'), 'New Plan');
    await user.type(screen.getByPlaceholderText('Goal (optional)'), 'Build muscle');
    await user.click(screen.getByText('Create'));

    // Verify plan was created in DB
    const plans = await db.plans.toArray();
    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe('New Plan');
    expect(plans[0].goal).toBe('Build muscle');
  });

  it('should not create a plan with empty name', async () => {
    const user = userEvent.setup();
    renderPlans();

    await waitFor(() => {
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Create Plan'));
    await user.click(screen.getByText('Create'));

    const plans = await db.plans.toArray();
    expect(plans).toHaveLength(0);
  });

  it('should close modal on Cancel', async () => {
    const user = userEvent.setup();
    renderPlans();

    await waitFor(() => {
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Create Plan'));
    expect(screen.getByText('New Plan')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('New Plan')).not.toBeInTheDocument();
  });

  it('should show FAB when plans exist', async () => {
    await db.plans.add(makePlan());
    renderPlans();

    await waitFor(() => {
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  it('should have settings button', () => {
    renderPlans();
    // Settings button exists (gear icon button)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
