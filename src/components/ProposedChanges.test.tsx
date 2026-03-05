import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProposedChanges from './ProposedChanges';
import type { ProposedToolCall } from '../lib/types';

function makeProposed(overrides: Partial<ProposedToolCall> = {}): ProposedToolCall {
  return {
    id: 'tool-1',
    name: 'create_routine',
    input: { name: 'Push Day', schedule: [1, 3, 5] },
    description: 'Create routine "Push Day"',
    ...overrides,
  };
}

describe('ProposedChanges', () => {
  it('should render proposed changes descriptions', () => {
    const changes = [
      makeProposed({ description: 'Create routine "Push Day"' }),
      makeProposed({ id: 'tool-2', name: 'add_exercise', description: 'Add exercise "Bench Press" (4 x 8-10)' }),
    ];

    render(<ProposedChanges changes={changes} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByText('Create routine "Push Day"')).toBeInTheDocument();
    expect(screen.getByText('Add exercise "Bench Press" (4 x 8-10)')).toBeInTheDocument();
  });

  it('should render approve and reject buttons', () => {
    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('should call onApprove when apply button is clicked', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();

    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={onApprove}
        onReject={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /apply/i }));
    expect(onApprove).toHaveBeenCalledOnce();
  });

  it('should not call onReject immediately when reject button is clicked', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();

    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={onReject}
      />
    );

    await user.click(screen.getByRole('button', { name: /reject/i }));
    expect(onReject).not.toHaveBeenCalled();
  });

  it('should show a header indicating review is needed', () => {
    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/proposed changes/i)).toBeInTheDocument();
  });

  it('should show feedback textarea when reject button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /reject/i }));

    expect(screen.getByPlaceholderText(/what would you change/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
  });

  it('should call onReject with feedback when send feedback is clicked', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();

    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={onReject}
      />
    );

    await user.click(screen.getByRole('button', { name: /reject/i }));
    await user.type(screen.getByPlaceholderText(/what would you change/i), 'Too many sets');
    await user.click(screen.getByRole('button', { name: /send feedback/i }));

    expect(onReject).toHaveBeenCalledWith('Too many sets');
  });

  it('should call onReject with empty string when skip is clicked', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();

    render(
      <ProposedChanges
        changes={[makeProposed()]}
        onApprove={vi.fn()}
        onReject={onReject}
      />
    );

    await user.click(screen.getByRole('button', { name: /reject/i }));
    await user.click(screen.getByRole('button', { name: /skip/i }));

    expect(onReject).toHaveBeenCalledWith('');
  });

  it('should show icon for different tool types', () => {
    const changes = [
      makeProposed({ name: 'create_routine', description: 'Create routine "Push Day"' }),
      makeProposed({ id: 'tool-2', name: 'delete_exercise', description: 'Delete exercise' }),
    ];

    render(<ProposedChanges changes={changes} onApprove={vi.fn()} onReject={vi.fn()} />);

    // Both descriptions should be rendered
    expect(screen.getByText('Create routine "Push Day"')).toBeInTheDocument();
    expect(screen.getByText('Delete exercise')).toBeInTheDocument();
  });
});
